import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, csrfProtection, setupCSRFToken } from "./replitAuth";
import { scrapeCreatorService } from "./scrape-creator-service";
import {
  insertKnowledgeBaseSchema,
  updateKnowledgeBaseSchema,
  insertAvatarSchema,
  updateAvatarSchema,
  insertConceptSchema,
  updateConceptSchema
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

  // ============================================================================
  // KNOWLEDGE BASE
  // ============================================================================

  app.get("/api/knowledge-base", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const knowledgeBase = await storage.getKnowledgeBase(userId);
      
      if (!knowledgeBase) {
        res.json(null);
        return;
      }
      
      res.json(knowledgeBase);
    } catch (error) {
      console.error("Error fetching knowledge base:", error);
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

  // ============================================================================
  // AVATARS (Customer Profiles)
  // ============================================================================

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

  app.get("/api/avatars/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const avatar = await storage.getAvatar(id);
      
      if (!avatar) {
        res.status(404).json({ error: "Avatar not found" });
        return;
      }
      
      res.json(avatar);
    } catch (error) {
      console.error("Error fetching avatar:", error);
      res.status(500).json({ error: "Failed to fetch avatar" });
    }
  });

  app.post("/api/avatars", isAuthenticated, setupCSRFToken, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertAvatarSchema.parse({
        ...req.body,
        userId
      });
      const avatar = await storage.createAvatar(validatedData);
      res.status(201).json(avatar);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid avatar data", details: error.errors });
      } else {
        console.error("Error creating avatar:", error);
        res.status(500).json({ error: "Failed to create avatar" });
      }
    }
  });

  app.patch("/api/avatars/:id", isAuthenticated, setupCSRFToken, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const validatedData = updateAvatarSchema.parse(req.body);
      
      const avatar = await storage.updateAvatar(id, userId, validatedData);
      if (!avatar) {
        res.status(404).json({ error: "Avatar not found or access denied" });
        return;
      }
      res.json(avatar);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid avatar data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update avatar" });
      }
    }
  });

  app.patch("/api/avatars/:id/approve", isAuthenticated, setupCSRFToken, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const avatar = await storage.updateAvatar(id, userId, { status: "approved" });
      if (!avatar) {
        res.status(404).json({ error: "Avatar not found or access denied" });
        return;
      }
      res.json({ success: true, avatar });
    } catch (error) {
      console.error("Error approving avatar:", error);
      res.status(500).json({ error: "Failed to approve avatar" });
    }
  });

  app.patch("/api/avatars/:id/reject", isAuthenticated, setupCSRFToken, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const avatar = await storage.updateAvatar(id, userId, { status: "rejected" });
      if (!avatar) {
        res.status(404).json({ error: "Avatar not found or access denied" });
        return;
      }
      res.json({ success: true, avatar });
    } catch (error) {
      console.error("Error rejecting avatar:", error);
      res.status(500).json({ error: "Failed to reject avatar" });
    }
  });

  app.delete("/api/avatars", isAuthenticated, setupCSRFToken, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.deleteAllAvatars(userId);
      res.json({ success: true, deletedCount: count });
    } catch (error) {
      console.error("Error deleting avatars:", error);
      res.status(500).json({ error: "Failed to delete avatars" });
    }
  });

  // ============================================================================
  // CONCEPTS (Creative Research Center)
  // ============================================================================

  app.get("/api/concepts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const concepts = await storage.getConcepts(userId);
      
      // Transform database format to UI format
      const transformedConcepts = concepts.map((concept: any) => {
        const statistics = concept.statistics || {};
        const filter = concept.filter || {};
        
        return {
          id: concept.id,
          title: concept.title ?? null,
          description: concept.description ?? null,
          thumbnailUrl: concept.thumbnail ?? null,
          postUrl: concept.url ?? null,
          brandName: concept.owner ?? null,
          platform: filter.platform ?? null,
          format: filter.format ?? null,
          industry: filter.industry ?? null,
          likes: statistics.likes ?? null,
          views: statistics.views ?? null,
          shares: statistics.shares ?? null,
          comments: statistics.replies ?? null,
          engagementRate: statistics.views ? 
            ((statistics.likes || 0) + (statistics.replies || 0) + (statistics.shares || 0)) / statistics.views : null,
          engagementScore: statistics.views || statistics.likes ? Math.min(100, Math.round(
            ((statistics.likes || 0) / 10000) + 
            ((statistics.views || 0) / 100000) + 
            ((statistics.shares || 0) / 1000)
          )) : null,
          status: concept.status ?? null,
          createdAt: concept.createdAt ?? null,
          hooks: []
        };
      });
      
      res.json(transformedConcepts);
    } catch (error) {
      console.error("Error fetching concepts:", error);
      res.status(500).json({ error: "Failed to fetch concepts" });
    }
  });

  app.get("/api/concepts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const concept = await storage.getConcept(id);
      
      if (!concept) {
        res.status(404).json({ error: "Concept not found" });
        return;
      }
      
      res.json(concept);
    } catch (error) {
      console.error("Error fetching concept:", error);
      res.status(500).json({ error: "Failed to fetch concept" });
    }
  });

  app.post("/api/concepts", isAuthenticated, setupCSRFToken, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertConceptSchema.parse({
        ...req.body,
        userId
      });
      const concept = await storage.createConcept(validatedData);
      res.status(201).json(concept);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid concept data", details: error.errors });
      } else {
        console.error("Error creating concept:", error);
        res.status(500).json({ error: "Failed to create concept" });
      }
    }
  });

  app.patch("/api/concepts/:id", isAuthenticated, setupCSRFToken, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const validatedData = updateConceptSchema.parse(req.body);
      
      const concept = await storage.updateConcept(id, userId, validatedData);
      if (!concept) {
        res.status(404).json({ error: "Concept not found or access denied" });
        return;
      }
      res.json(concept);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid concept data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update concept" });
      }
    }
  });

  app.patch("/api/concepts/:id/approve", isAuthenticated, setupCSRFToken, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const concept = await storage.updateConcept(id, userId, { status: "approved" });
      if (!concept) {
        res.status(404).json({ error: "Concept not found or access denied" });
        return;
      }
      res.json({ success: true, concept });
    } catch (error) {
      console.error("Error approving concept:", error);
      res.status(500).json({ error: "Failed to approve concept" });
    }
  });

  app.patch("/api/concepts/:id/reject", isAuthenticated, setupCSRFToken, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const concept = await storage.updateConcept(id, userId, { status: "rejected" });
      if (!concept) {
        res.status(404).json({ error: "Concept not found or access denied" });
        return;
      }
      res.json({ success: true, concept });
    } catch (error) {
      console.error("Error rejecting concept:", error);
      res.status(500).json({ error: "Failed to reject concept" });
    }
  });

  app.delete("/api/concepts", isAuthenticated, setupCSRFToken, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.deleteAllConcepts(userId);
      res.json({ success: true, deletedCount: count });
    } catch (error) {
      console.error("Error deleting concepts:", error);
      res.status(500).json({ error: "Failed to delete concepts" });
    }
  });

  // ============================================================================
  // CONCEPT SEARCH (via n8n webhook)
  // ============================================================================

  app.post("/api/concepts/search", isAuthenticated, setupCSRFToken, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { query, type } = req.body;
      
      if (!query) {
        res.status(400).json({ error: "Search query is required" });
        return;
      }
      
      // Send search request to n8n webhook
      const webhookData = {
        userId,
        query,
        type: type || 'general',
        timestamp: new Date().toISOString()
      };

      console.log("Sending search webhook to n8n:", JSON.stringify(webhookData, null, 2));
      
      try {
        // Build query string for GET request
        const params = new URLSearchParams({
          userId,
          query,
          type: type || 'general',
          timestamp: new Date().toISOString()
        });
        
        const webhookResponse = await fetch(`https://brandluxmedia.app.n8n.cloud/webhook-test/search?${params.toString()}`, {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${process.env.N8N_API_KEY}`
          }
        });
        
        console.log("Search webhook response status:", webhookResponse.status);
        const responseText = await webhookResponse.text();
        console.log("Search webhook response body:", responseText);
        
        // Parse and handle n8n response
        try {
          const n8nResponse = JSON.parse(responseText);
          
          // Handle n8n format: { status: "success", data: [{ json: {...}, pairedItem: {...} }] }
          if (n8nResponse.status === 'success' && Array.isArray(n8nResponse.data) && n8nResponse.data.length > 0) {
            const savedConcepts = [];
            for (const item of n8nResponse.data) {
              const data = item.json || item;
              try {
                // Extract platform from filters or use default
                const platform = data.filters?.platform || 'website';
                
                const saved = await storage.createConcept({
                  userId,
                  title: data.title || null,
                  description: data.description || null,
                  thumbnail: data.thumbnail || null,
                  url: data.url || query,
                  owner: data.owner || null,
                  statistics: {
                    ...data.statistics,
                    originalCreatedAt: data.created_at || null,
                    isActive: data.filters?.is_active ?? null
                  },
                  filter: {
                    platform: platform.toLowerCase(),
                    format: data.filters?.format || null,
                    industry: data.filters?.industry || null,
                    language: data.filters?.language || null,
                    isVideo: data.filters?.is_video ?? null,
                    isAd: data.filters?.is_ad ?? null
                  },
                  status: 'pending'
                });
                savedConcepts.push(saved);
              } catch (err) {
                console.error("Error saving concept from array:", err);
              }
            }
            
            res.json({ 
              success: true, 
              message: n8nResponse.message || "Search completed!",
              count: savedConcepts.length,
              concepts: savedConcepts,
              urlSearchResult: savedConcepts.length === 1 ? savedConcepts[0] : undefined
            });
            return;
          }
          
          // Handle direct n8n array format: [{ json: { ...data }, pairedItem: {...} }]
          if (Array.isArray(n8nResponse) && n8nResponse.length > 0) {
            const savedConcepts = [];
            for (const item of n8nResponse) {
              const data = item.json || item;
              try {
                // Extract platform from filters or use default
                const platform = data.filters?.platform || 'website';
                
                const saved = await storage.createConcept({
                  userId,
                  title: data.title || null,
                  description: data.description || null,
                  thumbnail: data.thumbnail || null,
                  url: data.url || query,
                  owner: data.owner || null,
                  statistics: {
                    ...data.statistics,
                    originalCreatedAt: data.created_at || null,
                    isActive: data.filters?.is_active ?? null
                  },
                  filter: {
                    platform: platform.toLowerCase(),
                    format: data.filters?.format || null,
                    industry: data.filters?.industry || null,
                    language: data.filters?.language || null,
                    isVideo: data.filters?.is_video ?? null,
                    isAd: data.filters?.is_ad ?? null
                  },
                  status: 'pending'
                });
                savedConcepts.push(saved);
              } catch (err) {
                console.error("Error saving concept from array:", err);
              }
            }
            
            res.json({ 
              success: true, 
              message: "Search completed!",
              count: savedConcepts.length,
              concepts: savedConcepts,
              urlSearchResult: savedConcepts.length === 1 ? savedConcepts[0] : undefined
            });
            return;
          }
          
          // Handle URL search response (single data object with status - legacy format)
          if (n8nResponse.status === 'success' && n8nResponse.data && !Array.isArray(n8nResponse.data)) {
            const concept = n8nResponse.data;
            const platform = concept.filters?.platform || concept.platform || 'website';
            try {
              const saved = await storage.createConcept({
                userId,
                title: concept.title || null,
                description: concept.description || null,
                thumbnail: concept.thumbnail || null,
                url: concept.url || query,
                owner: concept.owner || null,
                statistics: concept.statistics || null,
                filter: {
                  platform: platform.toLowerCase(),
                  format: concept.filters?.format || null,
                  industry: concept.filters?.industry || null,
                  language: concept.filters?.language || null,
                  isVideo: concept.filters?.is_video ?? null,
                  isAd: concept.filters?.is_ad ?? null
                },
                status: "pending"
              });
              
              res.json({ 
                success: true, 
                message: n8nResponse.message || "Search completed!",
                count: 1,
                concepts: [saved],
                urlSearchResult: saved
              });
              return;
            } catch (err) {
              console.error("Error saving URL search concept:", err);
            }
          }
          
          // If n8n returns concepts array, save them to database
          if (n8nResponse.concepts && Array.isArray(n8nResponse.concepts)) {
            const savedConcepts = [];
            for (const concept of n8nResponse.concepts) {
              const platform = concept.filters?.platform || concept.platform || concept.conceptType || 'unknown';
              try {
                const saved = await storage.createConcept({
                  userId,
                  title: concept.title || null,
                  description: concept.description || null,
                  thumbnail: concept.thumbnailUrl || concept.thumbnail_url || concept.thumbnail || null,
                  url: concept.postUrl || concept.post_url || concept.url || null,
                  owner: concept.owner || concept.brandName || null,
                  statistics: {
                    views: concept.views ?? null,
                    likes: concept.likes ?? null,
                    comments: concept.comments ?? null,
                    shares: concept.shares ?? null,
                    engagementScore: concept.engagementScore || concept.engagement_score || null
                  },
                  filter: {
                    platform: platform.toLowerCase(),
                    format: concept.filters?.format || concept.format || null,
                    industry: concept.filters?.industry || concept.industry || null,
                    language: concept.filters?.language || null,
                    isVideo: concept.filters?.is_video ?? null,
                    isAd: concept.filters?.is_ad ?? null
                  },
                  status: "pending"
                });
                savedConcepts.push(saved);
              } catch (err) {
                console.error("Error saving concept:", err);
              }
            }
            
            res.json({ 
              success: true, 
              count: savedConcepts.length,
              concepts: savedConcepts
            });
            return;
          }
          
          // Return n8n response directly if no concepts array
          res.json({ 
            success: n8nResponse.success !== false,
            message: n8nResponse.message || "Search request processed.",
            count: n8nResponse.count || 0,
            concepts: n8nResponse.concepts || []
          });
          return;
        } catch (parseError) {
          console.error("Error parsing n8n response:", parseError);
          res.json({ 
            success: true,
            message: "Search request sent successfully.",
            count: 0,
            concepts: []
          });
          return;
        }
      } catch (webhookError) {
        console.error("Search webhook call failed:", webhookError);
        res.status(500).json({ 
          success: false, 
          message: "Failed to connect to search service. Please try again." 
        });
        return;
      }
    } catch (error) {
      console.error("Error searching concepts:", error);
      res.status(500).json({ error: "Failed to search concepts" });
    }
  });

  // ============================================================================
  // RESEARCH DISCOVERY (AI-powered)
  // ============================================================================

  app.post("/api/research/discover", isAuthenticated, setupCSRFToken, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { knowledgeBase } = req.body;
      
      if (!knowledgeBase) {
        res.status(400).json({ error: "Knowledge base data is required. Please complete your knowledge base first." });
        return;
      }

      // Send webhook to n8n for creative research discovery
      const webhookData = {
        type: "creative",
        userId,
        knowledgeBase,
        timestamp: new Date().toISOString()
      };

      console.log("Sending webhook to n8n:", JSON.stringify(webhookData, null, 2));
      
      try {
        const webhookResponse = await fetch("https://brandluxmedia.app.n8n.cloud/webhook-test/recent-research", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.N8N_API_KEY}`
          },
          body: JSON.stringify(webhookData)
        });
        console.log("Webhook response status:", webhookResponse.status);
        const responseText = await webhookResponse.text();
        console.log("Webhook response body:", responseText);
        
        // Parse and return the n8n response
        try {
          const n8nResponse = JSON.parse(responseText);
          res.json({ 
            success: n8nResponse.status === "success",
            message: n8nResponse.message || "Discovery request processed."
          });
          return;
        } catch (parseError) {
          console.error("Failed to parse n8n response:", parseError);
          res.json({ 
            success: webhookResponse.ok,
            message: webhookResponse.ok 
              ? "Creative research discovery initiated." 
              : "Discovery request sent but response was unexpected."
          });
          return;
        }
      } catch (webhookError) {
        console.error("Webhook call failed:", webhookError);
        res.status(500).json({ 
          success: false, 
          message: "Failed to connect to discovery service. Please try again." 
        });
        return;
      }
    } catch (error) {
      console.error("Error triggering research discovery:", error);
      res.status(500).json({ error: "Failed to start research discovery" });
    }
  });

  app.post("/api/customer-research/discover", isAuthenticated, setupCSRFToken, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { knowledgeBase } = req.body;
      
      if (!knowledgeBase) {
        res.status(400).json({ error: "Knowledge base data is required. Please complete your knowledge base first." });
        return;
      }

      // Send webhook to n8n for customer research discovery
      const webhookData = {
        type: "customer",
        userId,
        knowledgeBase,
        timestamp: new Date().toISOString()
      };

      console.log("Sending webhook to n8n:", JSON.stringify(webhookData, null, 2));
      
      try {
        const webhookResponse = await fetch("https://brandluxmedia.app.n8n.cloud/webhook-test/recent-research", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.N8N_API_KEY}`
          },
          body: JSON.stringify(webhookData)
        });
        console.log("Webhook response status:", webhookResponse.status);
        const responseText = await webhookResponse.text();
        console.log("Webhook response body:", responseText);
        
        // Parse and return the n8n response
        try {
          const n8nResponse = JSON.parse(responseText);
          res.json({ 
            success: n8nResponse.status === "success",
            message: n8nResponse.message || "Discovery request processed."
          });
          return;
        } catch (parseError) {
          console.error("Failed to parse n8n response:", parseError);
          res.json({ 
            success: webhookResponse.ok,
            message: webhookResponse.ok 
              ? "Customer research discovery initiated." 
              : "Discovery request sent but response was unexpected."
          });
          return;
        }
      } catch (webhookError) {
        console.error("Webhook call failed:", webhookError);
        res.status(500).json({ 
          success: false, 
          message: "Failed to connect to discovery service. Please try again." 
        });
        return;
      }
    } catch (error) {
      console.error("Error triggering customer research discovery:", error);
      res.status(500).json({ error: "Failed to start customer research discovery" });
    }
  });

  // ============================================================================
  // LEGACY ENDPOINTS (for backward compatibility)
  // ============================================================================
  
  // Stub endpoints for features that are now "Coming Soon"
  app.get("/api/insights", isAuthenticated, async (req: any, res) => {
    res.json([]);
  });

  app.get("/api/sources", isAuthenticated, async (req: any, res) => {
    res.json([]);
  });

  app.get("/api/scripts", isAuthenticated, async (req: any, res) => {
    res.json([]);
  });

  app.get("/api/ad-accounts", isAuthenticated, async (req: any, res) => {
    res.status(503).json({ 
      error: "Performance Analytics coming soon",
      message: "This feature will be available in a future update."
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
