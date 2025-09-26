import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateScript, generateAvatar } from "./openai-service";
import { metaAdsService } from "./meta-ads-service";
import { aiInsightsService } from "./ai-insights-service";
import { metaOAuthService } from "./meta-oauth-service";
import { setupAuth, isAuthenticated, csrfProtection, setupCSRFToken } from "./replitAuth";
import {
  insertAvatarSchema,
  insertConceptSchema,
  insertAvatarConceptSchema,
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
      
      // Basic validation - in production you'd have an allowlist
      if (!redirectUri.includes('.repl.co') && !redirectUri.includes('localhost')) {
        throw new Error('Invalid redirect URI host');
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
  // Avatar routes (protected)
  app.get("/api/avatars", isAuthenticated, async (req, res) => {
    try {
      const avatars = await storage.getAvatars();
      res.json(avatars);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch avatars" });
    }
  });

  app.post("/api/avatars", isAuthenticated, setupCSRFToken, csrfProtection, async (req, res) => {
    try {
      const validatedData = insertAvatarSchema.parse(req.body);
      const avatar = await storage.createAvatar(validatedData);
      res.status(201).json(avatar);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid avatar data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create avatar" });
      }
    }
  });

  app.patch("/api/avatars/:id", isAuthenticated, setupCSRFToken, csrfProtection, async (req, res) => {
    try {
      const { id } = req.params;
      const avatar = await storage.updateAvatar(id, req.body);
      if (!avatar) {
        res.status(404).json({ error: "Avatar not found" });
        return;
      }
      res.json(avatar);
    } catch (error) {
      res.status(500).json({ error: "Failed to update avatar" });
    }
  });

  // Concept routes (protected)
  app.get("/api/concepts/:avatarId", isAuthenticated, async (req, res) => {
    try {
      const { avatarId } = req.params;
      const concepts = await storage.getConcepts(avatarId);
      res.json(concepts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch concepts" });
    }
  });

  app.post("/api/concepts", isAuthenticated, setupCSRFToken, csrfProtection, async (req, res) => {
    try {
      const validatedData = insertConceptSchema.parse(req.body);
      const concept = await storage.createConcept(validatedData);
      res.status(201).json(concept);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid concept data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create concept" });
      }
    }
  });

  app.patch("/api/concepts/:id", isAuthenticated, setupCSRFToken, csrfProtection, async (req, res) => {
    try {
      const { id } = req.params;
      const concept = await storage.updateConcept(id, req.body);
      if (!concept) {
        res.status(404).json({ error: "Concept not found" });
        return;
      }
      res.json(concept);
    } catch (error) {
      res.status(500).json({ error: "Failed to update concept" });
    }
  });

  // Avatar-Concept linking routes (protected)
  app.get("/api/avatar-concepts", isAuthenticated, async (req, res) => {
    try {
      const { avatarId, conceptId } = req.query;
      const avatarConcepts = await storage.getAvatarConcepts(
        avatarId as string,
        conceptId as string
      );
      res.json(avatarConcepts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch avatar-concept links" });
    }
  });

  app.post("/api/avatar-concepts", isAuthenticated, setupCSRFToken, csrfProtection, async (req, res) => {
    try {
      const validatedData = insertAvatarConceptSchema.parse(req.body);
      const avatarConcept = await storage.createAvatarConcept(validatedData);
      res.status(201).json(avatarConcept);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid avatar-concept data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create avatar-concept link" });
      }
    }
  });

  app.patch("/api/avatar-concepts/:id", isAuthenticated, setupCSRFToken, csrfProtection, async (req, res) => {
    try {
      const { id } = req.params;
      const avatarConcept = await storage.updateAvatarConcept(id, req.body);
      if (!avatarConcept) {
        res.status(404).json({ error: "Avatar-concept link not found" });
        return;
      }
      res.json(avatarConcept);
    } catch (error) {
      res.status(500).json({ error: "Failed to update avatar-concept link" });
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

      // Fetch approved avatars from Research Agent
      const approvedAvatars = await storage.getAvatars();
      const userApprovedAvatars = approvedAvatars.filter(avatar => avatar.status === "approved");
      
      if (userApprovedAvatars.length === 0) {
        res.status(400).json({ 
          error: "No approved avatars found. Please generate and approve customer avatars in the Research Agent first.",
          redirect: "/research"
        });
        return;
      }

      // AI automatically selects the best avatar and approach based on data
      const bestAvatar = userApprovedAvatars
        .sort((a, b) => {
          // Prioritize Performance Agent recommendations, then high confidence, then high priority
          const aScore = (a.recommendationSource === 'performance_agent' ? 100 : 0) + 
                        (parseFloat(a.dataConfidence || '0') * 50) + 
                        (a.priority === 'high' ? 25 : a.priority === 'medium' ? 15 : 5);
          const bScore = (b.recommendationSource === 'performance_agent' ? 100 : 0) + 
                        (parseFloat(b.dataConfidence || '0') * 50) + 
                        (b.priority === 'high' ? 25 : b.priority === 'medium' ? 15 : 5);
          return bScore - aScore;
        })[0];

      // AI determines optimal script parameters based on avatar and brand data
      const aiScriptRequest = {
        scriptType: "ugc" as const, // Start with UGC as most versatile
        duration: "30s" as const, // Optimal for most platforms
        targetAvatar: bestAvatar.name,
        marketingAngle: bestAvatar.hooks?.[0] || "Problem-Solution Framework",
        awarenessStage: "problem aware" as const // Most common starting point
      };

      // Generate script using OpenAI with selected avatar data
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
          avatarName: bestAvatar.name,
          marketingAngle: aiScriptRequest.marketingAngle,
          awarenessStage: aiScriptRequest.awarenessStage
        },
        generationContext: {
          knowledgeBaseSnapshot: knowledgeBase,
          selectedAvatar: bestAvatar,
          aiDecisionFactors: {
            avatarConfidence: bestAvatar.dataConfidence,
            avatarPriority: bestAvatar.priority,
            recommendationSource: bestAvatar.recommendationSource,
            availableAvatars: userApprovedAvatars.length
          },
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

  // Avatar generation route (protected)
  app.post("/api/generate-avatar", isAuthenticated, setupCSRFToken, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      // Fetch the user's knowledge base
      const knowledgeBase = await storage.getKnowledgeBase(userId);
      if (!knowledgeBase) {
        res.status(404).json({ error: "Knowledge base not found. Please complete your brand setup first." });
        return;
      }

      // Generate avatar using OpenAI
      const generatedAvatar = await generateAvatar(knowledgeBase);
      
      res.json(generatedAvatar);
    } catch (error) {
      console.error("Avatar generation error:", error);
      res.status(500).json({ 
        error: "Failed to generate avatar", 
        message: error instanceof Error ? error.message : "Unknown error"
      });
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
      const { adAccountId } = req.params;
      const { dateRange = 'last_30_days' } = req.query;
      
      const campaigns = await metaAdsService.getCampaigns(adAccountId, dateRange as string);
      
      // Generate AI insights for each campaign
      const campaignsWithInsights = await Promise.all(
        campaigns.map(async (campaign) => {
          const metrics = metaAdsService.calculateMetrics(campaign);
          
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
      const { adAccountId } = req.params;
      const { campaignId, dateRange = 'last_30_days' } = req.query;
      
      const adSets = await metaAdsService.getAdSets(
        adAccountId, 
        campaignId as string, 
        dateRange as string
      );
      
      // Generate AI insights for each ad set
      const adSetsWithInsights = await Promise.all(
        adSets.map(async (adSet) => {
          const metrics = metaAdsService.calculateMetrics(adSet);
          
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
      const { adAccountId } = req.params;
      const { adSetId, dateRange = 'last_30_days' } = req.query;
      
      const ads = await metaAdsService.getAds(
        adAccountId, 
        adSetId as string, 
        dateRange as string
      );
      
      // Generate AI insights for each ad
      const adsWithInsights = await Promise.all(
        ads.map(async (ad) => {
          const metrics = metaAdsService.calculateMetrics(ad);
          
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
      const { adAccountId } = req.params;
      
      // Fetch comprehensive account data for analysis
      const [campaigns, insights] = await Promise.all([
        metaAdsService.getCampaigns(adAccountId, 'last_7_days'),
        metaAdsService.getAccountInsights(adAccountId, 'last_7_days')
      ]);

      const observations = await aiInsightsService.generateWeeklyObservations([
        { type: 'account', data: insights },
        { type: 'campaigns', data: campaigns }
      ]);
      
      res.json(observations);
    } catch (error) {
      console.error("Error generating weekly observations:", error);
      res.status(500).json({ 
        error: "Failed to generate weekly observations", 
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
