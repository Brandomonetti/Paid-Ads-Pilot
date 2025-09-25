import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertAvatarSchema,
  insertConceptSchema,
  insertAvatarConceptSchema,
  insertPlatformSettingsSchema,
  updatePlatformSettingsSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Avatar routes
  app.get("/api/avatars", async (req, res) => {
    try {
      const avatars = await storage.getAvatars();
      res.json(avatars);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch avatars" });
    }
  });

  app.post("/api/avatars", async (req, res) => {
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

  app.patch("/api/avatars/:id", async (req, res) => {
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

  // Concept routes
  app.get("/api/concepts/:avatarId", async (req, res) => {
    try {
      const { avatarId } = req.params;
      const concepts = await storage.getConcepts(avatarId);
      res.json(concepts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch concepts" });
    }
  });

  app.post("/api/concepts", async (req, res) => {
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

  app.patch("/api/concepts/:id", async (req, res) => {
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

  // Avatar-Concept linking routes
  app.get("/api/avatar-concepts", async (req, res) => {
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

  app.post("/api/avatar-concepts", async (req, res) => {
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

  app.patch("/api/avatar-concepts/:id", async (req, res) => {
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

  // Platform Settings routes
  app.get("/api/settings/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
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

  app.post("/api/settings", async (req, res) => {
    try {
      const validatedData = insertPlatformSettingsSchema.parse(req.body);
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

  app.patch("/api/settings/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
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

  const httpServer = createServer(app);

  return httpServer;
}
