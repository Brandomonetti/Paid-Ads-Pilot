import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateScript } from "./openai-service";
import { metaAdsService } from "./meta-ads-service";
import { aiInsightsService } from "./ai-insights-service";
import { metaOAuthService } from "./meta-oauth-service";
import { startMetaOAuth, handleMetaCallback, checkLinkSessionStatus } from "./oauth-broker";
import { setupAuth, isAuthenticated, csrfProtection, setupCSRFToken } from "./replitAuth";
import { scrapeCreatorService } from "./scrape-creator-service";
import { generateAvatarsFromInsights } from "./avatar-generation-service";
import {
  insertPlatformSettingsSchema,
  updatePlatformSettingsSchema,
  insertKnowledgeBaseSchema,
  updateKnowledgeBaseSchema,
  insertGeneratedScriptSchema,
  updateGeneratedScriptSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Authentication
  await setupAuth(app);

  // CSRF token endpoint for frontend (with token setup)
  app.get('/api/csrf-token', isAuthenticated, setupCSRFToken, (req: any, res) => {
    res.json({ csrfToken: req.session.csrfToken });
  });

  // OAuth Broker routes - centralized OAuth handling for static domain
  app.get('/api/oauth-broker/meta/start', isAuthenticated, startMetaOAuth);
  app.get('/api/oauth-broker/meta/callback', handleMetaCallback);
  app.get('/api/oauth-broker/meta/status/:linkSessionId', checkLinkSessionStatus);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Meta OAuth routes
  app.get('/api/auth/meta/connect', isAuthenticated, async (req: any, res) => {
    try {
      // Validate redirect URI against allowlist
      const protocol = req.get('X-Forwarded-Proto') || req.protocol || 'https';
      const host = req.get('host');
      const redirectUri = `${protocol}://${host}/api/auth/meta/callback`;
      
      // More flexible validation for Replit domains
      const isValidHost = host && (
        host.includes('repl.co') || 
        host.includes('replit.dev') ||
        host.includes('replit.com') ||
        host.includes('localhost') ||
        host.includes('127.0.0.1') ||
        /.*\.repl\.co$/.test(host) ||
        /.*\.replit\.dev$/.test(host)
      );
      
      if (!isValidHost) {
        console.log('Invalid host detected:', host);
        console.log('Full redirect URI:', redirectUri);
        throw new Error(`Invalid redirect URI host: ${host}`);
      }
      
      const { url, state } = metaOAuthService.generateAuthUrl(redirectUri);
      
      // Store state and redirectUri in session for secure verification
      req.session.metaOAuthState = state;
      req.session.metaOAuthRedirectUri = redirectUri;
      
      res.json({ 
        authUrl: url,
        redirectUri: redirectUri, // Include for debugging
        instructions: "Visit this URL to connect your Meta Ads account"
      });
    } catch (error) {
      console.error("Error generating Meta auth URL:", error);
      res.status(500).json({ error: "Failed to generate authorization URL" });
    }
  });

  app.get('/api/auth/meta/callback', isAuthenticated, async (req: any, res) => {
    try {
      const { code, state, error } = req.query;
      
      if (error) {
        return res.redirect(`/?error=meta_auth_failed&reason=${encodeURIComponent(error)}`);
      }
      
      if (!code || !state) {
        return res.redirect('/?error=meta_auth_failed&reason=missing_parameters');
      }
      
      // Critical security check: Verify state matches session-stored state
      const sessionState = req.session.metaOAuthState;
      const sessionRedirectUri = req.session.metaOAuthRedirectUri;
      
      if (!sessionState || state !== sessionState) {
        console.error('OAuth state mismatch - potential CSRF attack');
        return res.redirect('/?error=meta_auth_failed&reason=invalid_state');
      }
      
      // Get user ID from authenticated session (not from state!)
      const userId = req.user.claims.sub;
      
      // Exchange code for token and get user data
      const { accessToken, userData } = await metaOAuthService.exchangeCodeForToken(code as string, sessionRedirectUri);
      
      // Update user with Meta access token and account info
      await storage.upsertUser({
        id: userId,
        metaAccessToken: accessToken,
        metaAccountId: userData.id,
        metaConnectedAt: new Date(),
        updatedAt: new Date()
      });
      
      // Clean up session data
      delete req.session.metaOAuthState;
      delete req.session.metaOAuthRedirectUri;
      
      // Redirect to success page
      res.redirect('/?success=meta_connected');
      
    } catch (error) {
      console.error("Meta OAuth callback error:", error);
      res.redirect('/?error=meta_auth_failed&reason=callback_error');
    }
  });

  app.post('/api/auth/meta/disconnect', isAuthenticated, setupCSRFToken, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Remove Meta access token from user account
      await storage.upsertUser({
        id: userId,
        metaAccessToken: null,
        metaAccountId: null,
        metaConnectedAt: null,
        updatedAt: new Date()
      });
      
      res.json({ success: true, message: "Meta Ads account disconnected" });
    } catch (error) {
      console.error("Error disconnecting Meta account:", error);
      res.status(500).json({ error: "Failed to disconnect Meta account" });
    }
  });

  app.get('/api/auth/meta/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const isConnected = !!(user?.metaAccessToken && user?.metaAccountId);
      let isValid = false;
      let accountsCount = 0;
      
      if (isConnected && user.metaAccessToken) {
        // Validate token and get account count
        try {
          isValid = await metaOAuthService.validateToken(user.metaAccessToken);
          if (isValid) {
            const accounts = await metaOAuthService.getUserAdAccounts(user.metaAccessToken);
            accountsCount = accounts.length;
          }
        } catch (error) {
          console.error("Token validation error:", error);
          isValid = false;
        }
      }
      
      res.json({
        connected: isConnected,
        valid: isValid,
        connectedAt: user?.metaConnectedAt,
        accountsCount
      });
    } catch (error) {
      console.error("Error checking Meta auth status:", error);
      res.status(500).json({ error: "Failed to check connection status" });
    }
  });

  // Customer Intelligence Hub - Insights endpoints (stub)
  app.get("/api/insights", isAuthenticated, async (req: any, res) => {
    try {
      // Stub endpoint - returns empty array for now
      res.json([]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch insights" });
    }
  });

  // Customer Intelligence Hub - Sources endpoints (stub)
  app.get("/api/sources", isAuthenticated, async (req: any, res) => {
    try {
      // Stub endpoint - returns empty array for now
      res.json([]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sources" });
    }
  });

  // Customer Intelligence Hub - Research discovery endpoint
  app.post("/api/research/discover", isAuthenticated, setupCSRFToken, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { knowledgeBase } = req.body;
      const n8nWebhookUrl = 'https://brandluxmedia.app.n8n.cloud/webhook-test/fetch-recent-article';
      const apiKey = process.env.N8N_API_KEY;

      if (!apiKey) {
        throw new Error("N8N_API_KEY not configured");
      }

      if (!knowledgeBase) {
        res.status(400).json({ error: "Knowledge base data is required. Please complete your knowledge base first." });
        return;
      }

      // Send event to n8n webhook with knowledge base concept data
      const axios = await import('axios');
      await axios.default.post(
        n8nWebhookUrl, 
        {
          userId,
          knowledgeBase: {
            websiteUrl: knowledgeBase.websiteUrl,
            brandVoice: knowledgeBase.brandVoice,
            missionStatement: knowledgeBase.missionStatement,
            brandValues: knowledgeBase.brandValues,
            productLinks: knowledgeBase.productLinks,
            pricingInfo: knowledgeBase.pricingInfo,
            keyBenefits: knowledgeBase.keyBenefits,
            usps: knowledgeBase.usps,
            currentPersonas: knowledgeBase.currentPersonas,
            demographics: knowledgeBase.demographics,
            mainCompetitors: knowledgeBase.mainCompetitors,
            instagramHandle: knowledgeBase.instagramHandle,
            facebookPage: knowledgeBase.facebookPage,
            tiktokHandle: knowledgeBase.tiktokHandle,
            contentStyle: knowledgeBase.contentStyle,
            salesTrends: knowledgeBase.salesTrends
          },
          timestamp: new Date().toISOString()
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );

      res.json({ 
        success: true, 
        message: "Research discovery initiated. AI is now searching for customer insights based on your brand." 
      });
    } catch (error: any) {
      console.error("Error triggering research discovery:", error);
      
      // Provide more specific error messages
      if (error.response?.status === 404) {
        res.status(503).json({ 
          error: "Research service unavailable. Please ensure the n8n workflow is active." 
        });
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        res.status(500).json({ 
          error: "Authentication failed with research service. Please contact support." 
        });
      } else {
        res.status(500).json({ 
          error: "Failed to start research discovery. Please try again later." 
        });
      }
    }
  });

  // Customer Intelligence Hub - Avatar endpoints
  app.get("/api/avatars", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const avatars = await storage.getAvatars(userId);
      res.json(avatars);
    } catch (error) {
      console.error("Error fetching avatars:", error);
      res.status(500).json({ error: "Failed to fetch avatars" });
    }
  });

  app.post("/api/avatars/generate", isAuthenticated, setupCSRFToken, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get all insights for the user
      const insights = await storage.getInsights(userId);
      
      if (insights.length === 0) {
        res.status(400).json({ 
          error: "No insights found. Discover customer insights first before generating avatars." 
        });
        return;
      }

      // Delete existing avatars before generating new ones (for clean regeneration)
      await storage.deleteAllAvatars(userId);

      // Generate avatars from insights using AI
      const result = await generateAvatarsFromInsights(userId, insights);
      
      // Save generated avatars to database
      const savedAvatars = await Promise.all(
        result.avatars.map(avatar => storage.createAvatar(avatar))
      );

      res.json({ 
        success: true,
        avatarsGenerated: savedAvatars.length,
        avatars: savedAvatars,
        summary: result.summary
      });
    } catch (error) {
      console.error("Error generating avatars:", error);
      res.status(500).json({ 
        error: "Failed to generate avatars",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Platform Settings routes (protected)
  app.get("/api/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let settings = await storage.getPlatformSettings(userId);
      
      // Create default settings if they don't exist
      if (!settings) {
        settings = await storage.createPlatformSettings({
          userId,
          provenConceptsPercentage: 80,
          weeklyBriefsVolume: 5,
          subscriptionTier: "free"
        });
      }
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch platform settings" });
    }
  });

  app.post("/api/settings", isAuthenticated, setupCSRFToken, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertPlatformSettingsSchema.parse({
        ...req.body,
        userId
      });
      const settings = await storage.createPlatformSettings(validatedData);
      res.status(201).json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid settings data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create platform settings" });
      }
    }
  });

  app.patch("/api/settings", isAuthenticated, setupCSRFToken, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate the update data
      const validatedData = updatePlatformSettingsSchema.parse(req.body);
      
      // Get current settings to check subscription tier for cap enforcement
      const currentSettings = await storage.getPlatformSettings(userId);
      if (!currentSettings) {
        res.status(404).json({ error: "Platform settings not found" });
        return;
      }
      
      // Enforce subscription-based weekly caps
      if (validatedData.weeklyBriefsVolume !== undefined) {
        const subscriptionTier = validatedData.subscriptionTier || currentSettings.subscriptionTier;
        const maxVolume = subscriptionTier === "free" ? 20 : subscriptionTier === "pro" ? 50 : 200;
        
        if (validatedData.weeklyBriefsVolume > maxVolume) {
          res.status(400).json({ 
            error: `Weekly briefs volume exceeds limit for ${subscriptionTier} tier (max: ${maxVolume})` 
          });
          return;
        }
      }
      
      const settings = await storage.updatePlatformSettings(userId, validatedData);
      if (!settings) {
        res.status(404).json({ error: "Platform settings not found" });
        return;
      }
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid settings data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update platform settings" });
      }
    }
  });

  // Knowledge Base routes (protected)
  app.get("/api/knowledge-base", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const knowledgeBase = await storage.getKnowledgeBase(userId);
      
      if (!knowledgeBase) {
        res.status(404).json({ error: "Knowledge base not found" });
        return;
      }
      
      res.json(knowledgeBase);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch knowledge base" });
    }
  });

  app.post("/api/knowledge-base", isAuthenticated, setupCSRFToken, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertKnowledgeBaseSchema.parse({
        ...req.body,
        userId
      });
      const knowledgeBase = await storage.createKnowledgeBase(validatedData);
      res.status(201).json(knowledgeBase);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid knowledge base data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create knowledge base" });
      }
    }
  });

  app.patch("/api/knowledge-base", isAuthenticated, setupCSRFToken, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate the update data
      const validatedData = updateKnowledgeBaseSchema.parse(req.body);
      
      const knowledgeBase = await storage.updateKnowledgeBase(userId, validatedData);
      if (!knowledgeBase) {
        res.status(404).json({ error: "Knowledge base not found" });
        return;
      }
      res.json(knowledgeBase);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid knowledge base data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update knowledge base" });
      }
    }
  });

  // AI-powered script generation routes (protected with persistence)
  app.post("/api/generate-script", isAuthenticated, setupCSRFToken, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      // Fetch the user's knowledge base
      const knowledgeBase = await storage.getKnowledgeBase(userId);
      if (!knowledgeBase) {
        res.status(404).json({ error: "Knowledge base not found. Please complete your brand setup first." });
        return;
      }

      // AI determines optimal script parameters based on brand data
      const aiScriptRequest = {
        scriptType: "ugc" as const, // Start with UGC as most versatile
        duration: "30s" as const, // Optimal for most platforms
        targetAvatar: "General Audience",
        marketingAngle: "Problem-Solution Framework",
        awarenessStage: "problem aware" as const // Most common starting point
      };

      // Generate script using OpenAI with knowledge base data
      const generatedScript = await generateScript(aiScriptRequest, knowledgeBase);
      
      // Save generated script to database for self-learning system
      const savedScript = await storage.createGeneratedScript({
        userId,
        title: generatedScript.title,
        duration: aiScriptRequest.duration,
        scriptType: aiScriptRequest.scriptType,
        summary: generatedScript.summary,
        content: generatedScript,
        sourceResearch: {
          avatarName: "General Audience",
          marketingAngle: aiScriptRequest.marketingAngle,
          awarenessStage: aiScriptRequest.awarenessStage
        },
        generationContext: {
          knowledgeBaseSnapshot: knowledgeBase,
          timestamp: new Date().toISOString()
        }
      });
      
      res.json({ ...generatedScript, scriptId: savedScript.id });
    } catch (error) {
      console.error("Script generation error:", error);
      res.status(500).json({ 
        error: "Failed to generate script", 
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get generated scripts for self-learning analysis
  app.get("/api/scripts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const scripts = await storage.getGeneratedScripts(userId);
      res.json(scripts);
    } catch (error) {
      console.error("Error fetching scripts:", error);
      res.status(500).json({ error: "Failed to fetch scripts" });
    }
  });

  // Update script with performance data for self-learning
  app.patch("/api/scripts/:id", isAuthenticated, setupCSRFToken, csrfProtection, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const validatedData = updateGeneratedScriptSchema.parse(req.body);
      
      const updatedScript = await storage.updateGeneratedScript(id, userId, validatedData);
      if (!updatedScript) {
        res.status(404).json({ error: "Script not found or access denied" });
        return;
      }
      
      res.json(updatedScript);
    } catch (error) {
      console.error("Error updating script:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid script data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update script" });
      }
    }
  });

  // Meta Ads Performance Agent routes (protected)
  app.get("/api/ad-accounts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.metaAccessToken) {
        return res.status(401).json({ 
          error: "Meta Ads account not connected", 
          requiresConnection: true 
        });
      }
      
      const userMetaService = metaAdsService.setAccessToken(user.metaAccessToken);
      const adAccounts = await userMetaService.getAdAccounts();
      res.json(adAccounts);
    } catch (error) {
      console.error("Error fetching ad accounts:", error);
      res.status(500).json({ 
        error: "Failed to fetch ad accounts", 
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/account-insights/:adAccountId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.metaAccessToken) {
        return res.status(401).json({ 
          error: "Meta Ads account not connected", 
          requiresConnection: true 
        });
      }
      
      const { adAccountId } = req.params;
      const { dateRange = 'last_30_days' } = req.query;
      
      const userMetaService = metaAdsService.setAccessToken(user.metaAccessToken);
      const insights = await userMetaService.getAccountInsights(adAccountId, dateRange as string);
      const metrics = userMetaService.calculateMetrics(insights);
      
      res.json({ ...insights, ...metrics });
    } catch (error) {
      console.error("Error fetching account insights:", error);
      res.status(500).json({ 
        error: "Failed to fetch account insights", 
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/campaigns/:adAccountId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.metaAccessToken) {
        return res.status(401).json({ 
          error: "Meta Ads account not connected", 
          requiresConnection: true 
        });
      }
      
      const { adAccountId } = req.params;
      const { dateRange = 'last_30_days' } = req.query;
      
      const userMetaService = metaAdsService.setAccessToken(user.metaAccessToken);
      const campaigns = await userMetaService.getCampaigns(adAccountId, dateRange as string);
      
      // Generate AI insights for each campaign
      const campaignsWithInsights = await Promise.all(
        campaigns.map(async (campaign) => {
          const metrics = userMetaService.calculateMetrics(campaign);
          
          try {
            const aiInsight = await aiInsightsService.generateInsight({
              entityType: 'campaign',
              entityId: campaign.id,
              entityName: campaign.name,
              currentMetrics: {
                spend: parseFloat(campaign.spend),
                revenue: parseFloat(campaign.revenue || '0'),
                roas: metrics.roas,
                cpm: metrics.cpm,
                ctr: metrics.ctr,
                cpc: metrics.cpc,
                impressions: parseInt(campaign.impressions),
                clicks: parseInt(campaign.clicks),
                purchases: parseInt(campaign.purchases || '0')
              }
            });

            return {
              ...campaign,
              ...metrics,
              aiSignal: {
                action: aiInsight.action,
                reasoning: aiInsight.reasoning,
                confidence: aiInsight.confidence,
                priority: aiInsight.priority,
                detailedAnalysis: aiInsight.recommendation
              }
            };
          } catch (aiError) {
            console.error(`AI insight generation failed for campaign ${campaign.id}:`, aiError);
            return { ...campaign, ...metrics };
          }
        })
      );
      
      res.json(campaignsWithInsights);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ 
        error: "Failed to fetch campaigns", 
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/adsets/:adAccountId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.metaAccessToken) {
        return res.status(401).json({ 
          error: "Meta Ads account not connected", 
          requiresConnection: true 
        });
      }
      
      const { adAccountId } = req.params;
      const { campaignId, dateRange = 'last_30_days' } = req.query;
      
      const userMetaService = metaAdsService.setAccessToken(user.metaAccessToken);
      const adSets = await userMetaService.getAdSets(
        adAccountId, 
        campaignId as string, 
        dateRange as string
      );
      
      // Generate AI insights for each ad set
      const adSetsWithInsights = await Promise.all(
        adSets.map(async (adSet) => {
          const metrics = userMetaService.calculateMetrics(adSet);
          
          try {
            const aiInsight = await aiInsightsService.generateInsight({
              entityType: 'adset',
              entityId: adSet.id,
              entityName: adSet.name,
              currentMetrics: {
                spend: parseFloat(adSet.spend),
                revenue: parseFloat(adSet.revenue || '0'),
                roas: metrics.roas,
                cpm: metrics.cpm,
                ctr: metrics.ctr,
                cpc: metrics.cpc,
                impressions: parseInt(adSet.impressions),
                clicks: parseInt(adSet.clicks),
                purchases: parseInt(adSet.purchases || '0')
              }
            });

            return {
              ...adSet,
              ...metrics,
              aiSignal: {
                action: aiInsight.action,
                reasoning: aiInsight.reasoning,
                confidence: aiInsight.confidence
              }
            };
          } catch (aiError) {
            console.error(`AI insight generation failed for ad set ${adSet.id}:`, aiError);
            return { ...adSet, ...metrics };
          }
        })
      );
      
      res.json(adSetsWithInsights);
    } catch (error) {
      console.error("Error fetching ad sets:", error);
      res.status(500).json({ 
        error: "Failed to fetch ad sets", 
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/ads/:adAccountId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.metaAccessToken) {
        return res.status(401).json({ 
          error: "Meta Ads account not connected", 
          requiresConnection: true 
        });
      }
      
      const { adAccountId } = req.params;
      const { adSetId, dateRange = 'last_30_days' } = req.query;
      
      const userMetaService = metaAdsService.setAccessToken(user.metaAccessToken);
      const ads = await userMetaService.getAds(
        adAccountId, 
        adSetId as string, 
        dateRange as string
      );
      
      // Generate AI insights for each ad
      const adsWithInsights = await Promise.all(
        ads.map(async (ad) => {
          const metrics = userMetaService.calculateMetrics(ad);
          
          try {
            const aiInsight = await aiInsightsService.generateInsight({
              entityType: 'ad',
              entityId: ad.id,
              entityName: ad.name,
              currentMetrics: {
                spend: parseFloat(ad.spend),
                revenue: parseFloat(ad.revenue || '0'),
                roas: metrics.roas,
                cpm: metrics.cpm,
                ctr: metrics.ctr,
                cpc: metrics.cpc,
                impressions: parseInt(ad.impressions),
                clicks: parseInt(ad.clicks),
                purchases: parseInt(ad.purchases || '0'),
                hookRate: metrics.hookRate,
                thumbstopRate: metrics.thumbstopRate
              }
            });

            return {
              ...ad,
              ...metrics,
              creativeType: ad.creative?.object_type?.toUpperCase() || 'UNKNOWN',
              aiSignal: {
                action: aiInsight.action,
                reasoning: aiInsight.reasoning,
                confidence: aiInsight.confidence,
                creativeInsight: aiInsight.recommendation
              }
            };
          } catch (aiError) {
            console.error(`AI insight generation failed for ad ${ad.id}:`, aiError);
            return { 
              ...ad, 
              ...metrics,
              creativeType: ad.creative?.object_type?.toUpperCase() || 'UNKNOWN'
            };
          }
        })
      );
      
      res.json(adsWithInsights);
    } catch (error) {
      console.error("Error fetching ads:", error);
      res.status(500).json({ 
        error: "Failed to fetch ads", 
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Weekly AI observations endpoint
  app.get("/api/weekly-observations/:adAccountId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.metaAccessToken) {
        return res.status(401).json({ 
          error: "Meta Ads account not connected", 
          requiresConnection: true 
        });
      }
      
      const { adAccountId } = req.params;
      
      const userMetaService = metaAdsService.setAccessToken(user.metaAccessToken);
      
      // Fetch comprehensive account data for analysis
      const [campaigns, insights] = await Promise.all([
        userMetaService.getCampaigns(adAccountId, 'last_7_days'),
        userMetaService.getAccountInsights(adAccountId, 'last_7_days')
      ]);

      // Try to generate AI observations, but gracefully handle quota/rate limit issues
      let observations: any[] = [];
      try {
        observations = await aiInsightsService.generateWeeklyObservations([
          { type: 'account', data: insights },
          { type: 'campaigns', data: campaigns }
        ]);
      } catch (aiError: any) {
        console.error("AI observations failed (quota/rate limit):", aiError.message);
        // Return empty observations instead of failing the whole endpoint
        observations = [];
      }
      
      res.json(observations);
    } catch (error) {
      console.error("Error generating weekly observations:", error);
      res.status(500).json({ 
        error: "Failed to generate weekly observations", 
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Creative Research Center - Concepts endpoints
  app.get("/api/concepts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const concepts = await storage.getConcepts(userId);
      res.json(concepts);
    } catch (error) {
      console.error("Error fetching concepts:", error);
      res.status(500).json({ error: "Failed to fetch concepts" });
    }
  });

  app.post("/api/concepts/search", isAuthenticated, setupCSRFToken, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { query, type } = req.body;

      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }

      // Extract keywords from the query
      // For URL type, we'd want to extract brand/page info
      // For brand/page type, use directly as keywords
      const keywords = type === 'url' 
        ? query.split('/').filter((part: string) => part && part !== 'https:' && part !== 'http:')
        : [query];

      // Fetch concepts from all platforms using Scrape Creator service
      const conceptsResponse = await scrapeCreatorService.fetchConceptsForBrand(
        keywords,
        query // Use the query as the niche as well
      );

      // Convert SocialMediaConcept to our Concept format and save to storage
      const allConcepts = [];
      
      // Process Facebook concepts
      for (const fbConcept of conceptsResponse.facebook) {
        const concept = await storage.createConcept({
          userId,
          platform: 'facebook' as const,
          title: fbConcept.title,
          description: fbConcept.description,
          thumbnailUrl: fbConcept.rawData?.thumbnail || undefined,
          postUrl: fbConcept.rawData?.post_url || undefined,
          brandName: query,
          industry: fbConcept.rawData?.industry || undefined,
          format: fbConcept.rawData?.format || 'Unknown',
          hooks: fbConcept.hook ? [fbConcept.hook] : [],
          engagementScore: fbConcept.engagementScore || 0,
          likes: fbConcept.rawData?.likes || undefined,
          comments: fbConcept.rawData?.comments || undefined,
          shares: fbConcept.rawData?.shares || undefined,
          views: fbConcept.rawData?.views || undefined,
          engagementRate: fbConcept.rawData?.engagement_rate || undefined,
        });
        allConcepts.push(concept);
      }

      // Process Instagram concepts
      for (const igConcept of conceptsResponse.instagram) {
        const concept = await storage.createConcept({
          userId,
          platform: 'instagram' as const,
          title: igConcept.title,
          description: igConcept.description,
          thumbnailUrl: igConcept.rawData?.thumbnail || undefined,
          videoUrl: igConcept.rawData?.video_url || undefined,
          postUrl: igConcept.rawData?.post_url || undefined,
          brandName: query,
          industry: igConcept.rawData?.industry || undefined,
          format: igConcept.rawData?.format || 'Unknown',
          hooks: igConcept.hook ? [igConcept.hook] : [],
          engagementScore: igConcept.engagementScore || 0,
          likes: igConcept.rawData?.likes || undefined,
          comments: igConcept.rawData?.comments || undefined,
          shares: igConcept.rawData?.shares || undefined,
          views: igConcept.rawData?.views || undefined,
          engagementRate: igConcept.rawData?.engagement_rate || undefined,
        });
        allConcepts.push(concept);
      }

      // Process TikTok concepts
      for (const ttConcept of conceptsResponse.tiktok) {
        const concept = await storage.createConcept({
          userId,
          platform: 'tiktok' as const,
          title: ttConcept.title,
          description: ttConcept.description,
          thumbnailUrl: ttConcept.rawData?.thumbnail || undefined,
          videoUrl: ttConcept.rawData?.video_url || undefined,
          postUrl: ttConcept.rawData?.post_url || undefined,
          brandName: query,
          industry: ttConcept.rawData?.industry || undefined,
          format: ttConcept.rawData?.format || 'Unknown',
          hooks: ttConcept.hook ? [ttConcept.hook] : [],
          engagementScore: ttConcept.engagementScore || 0,
          likes: ttConcept.rawData?.likes || undefined,
          comments: ttConcept.rawData?.comments || undefined,
          shares: ttConcept.rawData?.shares || undefined,
          views: ttConcept.rawData?.views || undefined,
          engagementRate: ttConcept.rawData?.engagement_rate || undefined,
        });
        allConcepts.push(concept);
      }

      res.json({
        count: allConcepts.length,
        concepts: allConcepts
      });
    } catch (error) {
      console.error("Error searching concepts:", error);
      res.status(500).json({ 
        error: "Failed to search for creative concepts",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
