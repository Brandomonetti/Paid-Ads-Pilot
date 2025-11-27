import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, csrfProtection, setupCSRFToken } from "./replitAuth";
import { scrapeCreatorService } from "./scrape-creator-service";
import {
  insertPlatformSettingsSchema,
  updatePlatformSettingsSchema,
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
  // PLATFORM SETTINGS
  // ============================================================================

  app.get("/api/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let settings = await storage.getPlatformSettings(userId);
      
      if (!settings) {
        settings = await storage.createPlatformSettings({
          userId,
          subscriptionTier: "research",
          creditTier: 0,
          monthlyCredits: 50,
          creditsUsed: 0
        });
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", isAuthenticated, setupCSRFToken, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = updatePlatformSettingsSchema.parse(req.body);
      
      const settings = await storage.updatePlatformSettings(userId, validatedData);
      if (!settings) {
        res.status(404).json({ error: "Settings not found" });
        return;
      }
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid settings data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update settings" });
      }
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
      res.json(concepts);
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
  // CONCEPT SEARCH (via Scrape Creator API)
  // ============================================================================

  app.post("/api/concepts/search", isAuthenticated, setupCSRFToken, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { query, niche } = req.body;
      
      if (!query) {
        res.status(400).json({ error: "Search query is required" });
        return;
      }
      
      // Search using Scrape Creator API
      const keywords = typeof query === 'string' ? query.split(',').map(k => k.trim()) : query;
      const results = await scrapeCreatorService.fetchConceptsForBrand(keywords, niche || 'general');
      
      // Flatten all platforms into one array
      const allConcepts = [
        ...results.facebook,
        ...results.instagram,
        ...results.tiktok
      ];
      
      // Save discovered concepts to database
      const savedConcepts = [];
      for (const concept of allConcepts) {
        try {
          const saved = await storage.createConcept({
            userId,
            platform: concept.platform,
            title: concept.title,
            description: concept.description,
            thumbnailUrl: concept.thumbnailUrl,
            postUrl: concept.postUrl,
            format: concept.visualStyle || 'video',
            hooks: concept.hook ? [concept.hook] : [],
            engagementScore: concept.engagementScore || 0,
            status: "discovered"
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

      // For MVP, return a success message - actual AI discovery can be integrated later
      res.json({ 
        success: true, 
        message: "Creative research discovery initiated. AI is now searching for viral content based on your brand." 
      });
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

      // For MVP, return a success message - actual AI discovery can be integrated later
      res.json({ 
        success: true, 
        message: "Customer research discovery initiated. AI is now analyzing customer insights." 
      });
    } catch (error) {
      console.error("Error triggering customer research discovery:", error);
      res.status(500).json({ error: "Failed to start customer research discovery" });
    }
  });

  // ============================================================================
  // AVATAR-CONCEPT LINKS
  // ============================================================================

  app.get("/api/avatar-concepts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { avatarId } = req.query;
      const links = await storage.getAvatarConcepts(userId, avatarId as string);
      res.json(links);
    } catch (error) {
      console.error("Error fetching avatar-concept links:", error);
      res.status(500).json({ error: "Failed to fetch links" });
    }
  });

  app.post("/api/avatar-concepts", isAuthenticated, setupCSRFToken, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const link = await storage.createAvatarConcept({
        ...req.body,
        userId
      });
      res.status(201).json(link);
    } catch (error) {
      console.error("Error creating avatar-concept link:", error);
      res.status(500).json({ error: "Failed to create link" });
    }
  });

  app.delete("/api/avatar-concepts/:id", isAuthenticated, setupCSRFToken, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const deleted = await storage.deleteAvatarConcept(id, userId);
      
      if (!deleted) {
        res.status(404).json({ error: "Link not found or access denied" });
        return;
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting avatar-concept link:", error);
      res.status(500).json({ error: "Failed to delete link" });
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
