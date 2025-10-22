import { 
  type User, type UpsertUser,
  type Avatar, type InsertAvatar,
  type Concept, type InsertConcept,
  type AvatarConcept, type InsertAvatarConcept,
  type PlatformSettings, type InsertPlatformSettings,
  type UpdatePlatformSettings,
  type KnowledgeBase, type InsertKnowledgeBase,
  type UpdateKnowledgeBase,
  type GeneratedScript, type InsertGeneratedScript,
  type UpdateGeneratedScript,
  users, avatars, concepts, avatarConcepts, platformSettings, 
  knowledgeBase, generatedScripts
} from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, inArray } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Avatar methods
  getAvatars(userId?: string): Promise<Avatar[]>;
  getAvatar(id: string): Promise<Avatar | undefined>;
  createAvatar(avatar: InsertAvatar): Promise<Avatar>;
  updateAvatar(id: string, updates: Partial<Avatar>): Promise<Avatar | undefined>;
  deleteAllAvatars(userId: string): Promise<number>;
  
  // Concept methods
  getConcepts(avatarId?: string, userId?: string): Promise<Concept[]>;
  getConcept(id: string): Promise<Concept | undefined>;
  createConcept(concept: InsertConcept): Promise<Concept>;
  updateConcept(id: string, updates: Partial<Concept>): Promise<Concept | undefined>;
  deleteAllConcepts(userId: string): Promise<number>;
  
  // Avatar-Concept linking methods
  getAvatarConcepts(avatarId?: string, conceptId?: string, userId?: string): Promise<AvatarConcept[]>;
  getAvatarConcept(id: string): Promise<AvatarConcept | undefined>;
  createAvatarConcept(avatarConcept: InsertAvatarConcept): Promise<AvatarConcept>;
  updateAvatarConcept(id: string, updates: Partial<AvatarConcept>): Promise<AvatarConcept | undefined>;
  deleteAllAvatarConceptLinks(userId: string): Promise<number>;
  linkConceptToAvatar(avatarId: string, conceptId: string, relevanceScore: number): Promise<AvatarConcept>;
  
  // Platform Settings methods
  getPlatformSettings(userId: string): Promise<PlatformSettings | undefined>;
  createPlatformSettings(settings: InsertPlatformSettings): Promise<PlatformSettings>;
  updatePlatformSettings(userId: string, updates: UpdatePlatformSettings): Promise<PlatformSettings | undefined>;
  
  // Knowledge Base methods
  getKnowledgeBase(userId: string): Promise<KnowledgeBase | undefined>;
  createKnowledgeBase(knowledgeBase: InsertKnowledgeBase): Promise<KnowledgeBase>;
  updateKnowledgeBase(userId: string, updates: UpdateKnowledgeBase): Promise<KnowledgeBase | undefined>;
  
  // Generated Scripts methods (for self-learning system)
  getGeneratedScripts(userId: string): Promise<GeneratedScript[]>;
  getGeneratedScript(id: string): Promise<GeneratedScript | undefined>;
  createGeneratedScript(script: InsertGeneratedScript): Promise<GeneratedScript>;
  updateGeneratedScript(id: string, userId: string, updates: UpdateGeneratedScript): Promise<GeneratedScript | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private avatars: Map<string, Avatar>;
  private concepts: Map<string, Concept>;
  private avatarConcepts: Map<string, AvatarConcept>;
  private platformSettings: Map<string, PlatformSettings>;
  private knowledgeBase: Map<string, KnowledgeBase>;
  private generatedScripts: Map<string, GeneratedScript>;

  constructor() {
    this.users = new Map();
    this.avatars = new Map();
    this.concepts = new Map();
    this.avatarConcepts = new Map();
    this.platformSettings = new Map();
    this.knowledgeBase = new Map();
    this.generatedScripts = new Map();
  }

  // User methods (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Ensure id is provided for upsert operations
    if (!userData.id) {
      throw new Error("User ID is required for upsert operation");
    }
    
    const existingUser = this.users.get(userData.id);
    
    if (existingUser) {
      // Update existing user
      const updatedUser: User = {
        ...existingUser,
        ...userData,
        id: userData.id, // Ensure id is always string
        updatedAt: new Date(),
      };
      this.users.set(userData.id, updatedUser);
      return updatedUser;
    } else {
      // Create new user
      const newUser: User = {
        id: userData.id,
        email: userData.email || null,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: userData.profileImageUrl || null,
        metaAccessToken: userData.metaAccessToken || null,
        metaAccountId: userData.metaAccountId || null,
        metaConnectedAt: userData.metaConnectedAt || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.set(userData.id, newUser);
      return newUser;
    }
  }

  // Avatar methods
  async getAvatars(userId?: string): Promise<Avatar[]> {
    const allAvatars = Array.from(this.avatars.values());
    if (!userId) return allAvatars;
    return allAvatars.filter(avatar => avatar.userId === userId);
  }

  async getAvatar(id: string): Promise<Avatar | undefined> {
    return this.avatars.get(id);
  }

  async createAvatar(insertAvatar: InsertAvatar): Promise<Avatar> {
    const id = randomUUID();
    const avatar: Avatar = { 
      ...insertAvatar,
      id,
      sources: insertAvatar.sources || [],
      angleIdeas: insertAvatar.angleIdeas || [],
      reasoning: insertAvatar.reasoning || "",
      priority: insertAvatar.priority || "medium",
      dataConfidence: insertAvatar.dataConfidence || "0.75",
      recommendationSource: insertAvatar.recommendationSource || "research",
      status: insertAvatar.status || "pending",
      feedback: insertAvatar.feedback || null,
      createdAt: new Date()
    };
    this.avatars.set(id, avatar);
    return avatar;
  }

  async updateAvatar(id: string, updates: Partial<Avatar>): Promise<Avatar | undefined> {
    const avatar = this.avatars.get(id);
    if (!avatar) return undefined;
    
    const updatedAvatar = { ...avatar, ...updates };
    this.avatars.set(id, updatedAvatar);
    return updatedAvatar;
  }

  async deleteAllAvatars(userId: string): Promise<number> {
    const avatarsToDelete = Array.from(this.avatars.values()).filter(avatar => avatar.userId === userId);
    avatarsToDelete.forEach(avatar => this.avatars.delete(avatar.id));
    return avatarsToDelete.length;
  }

  // Concept methods
  async getConcepts(avatarId?: string, userId?: string): Promise<Concept[]> {
    let allConcepts = Array.from(this.concepts.values());
    
    // Filter by userId if provided
    if (userId) {
      allConcepts = allConcepts.filter(concept => concept.userId === userId);
    }
    
    if (!avatarId) return allConcepts;
    
    // Security: Verify the avatar belongs to the requesting user before returning concepts
    if (userId) {
      const avatar = this.avatars.get(avatarId);
      if (!avatar || avatar.userId !== userId) {
        // Avatar doesn't exist or doesn't belong to this user - return empty
        return [];
      }
    }
    
    // Filter by avatarId column in concepts table (concepts fetched FOR this avatar)
    return allConcepts.filter(concept => concept.avatarId === avatarId);
  }

  async getConcept(id: string): Promise<Concept | undefined> {
    return this.concepts.get(id);
  }

  async createConcept(insertConcept: InsertConcept): Promise<Concept> {
    const id = randomUUID();
    const concept: Concept = { 
      ...insertConcept,
      id,
      avatarId: insertConcept.avatarId || null,
      status: insertConcept.status || "pending",
      feedback: insertConcept.feedback || null,
      referenceUrl: insertConcept.referenceUrl || null,
      thumbnailUrl: insertConcept.thumbnailUrl || null,
      createdAt: new Date()
    };
    this.concepts.set(id, concept);
    return concept;
  }

  async updateConcept(id: string, updates: Partial<Concept>): Promise<Concept | undefined> {
    const concept = this.concepts.get(id);
    if (!concept) return undefined;
    
    const updatedConcept = { ...concept, ...updates };
    this.concepts.set(id, updatedConcept);
    return updatedConcept;
  }

  async deleteAllConcepts(userId: string): Promise<number> {
    const conceptsToDelete = Array.from(this.concepts.values()).filter(concept => concept.userId === userId);
    conceptsToDelete.forEach(concept => this.concepts.delete(concept.id));
    return conceptsToDelete.length;
  }

  // Avatar-Concept linking methods
  async getAvatarConcepts(avatarId?: string, conceptId?: string, userId?: string): Promise<AvatarConcept[]> {
    let allLinks = Array.from(this.avatarConcepts.values());
    
    // Filter by userId by checking if the avatar belongs to the user
    if (userId) {
      const userAvatarIds = Array.from(this.avatars.values())
        .filter(avatar => avatar.userId === userId)
        .map(avatar => avatar.id);
      allLinks = allLinks.filter(link => userAvatarIds.includes(link.avatarId));
    }
    
    return allLinks.filter(link => 
      (!avatarId || link.avatarId === avatarId) &&
      (!conceptId || link.conceptId === conceptId)
    );
  }

  async getAvatarConcept(id: string): Promise<AvatarConcept | undefined> {
    return this.avatarConcepts.get(id);
  }

  async createAvatarConcept(insertAvatarConcept: InsertAvatarConcept): Promise<AvatarConcept> {
    const id = randomUUID();
    const avatarConcept: AvatarConcept = { 
      ...insertAvatarConcept,
      id,
      status: insertAvatarConcept.status || "linked",
      feedback: insertAvatarConcept.feedback || null,
      matchedHooks: insertAvatarConcept.matchedHooks || [],
      matchedElements: insertAvatarConcept.matchedElements || [],
      createdAt: new Date()
    };
    this.avatarConcepts.set(id, avatarConcept);
    return avatarConcept;
  }

  async updateAvatarConcept(id: string, updates: Partial<AvatarConcept>): Promise<AvatarConcept | undefined> {
    const avatarConcept = this.avatarConcepts.get(id);
    if (!avatarConcept) return undefined;
    
    const updatedAvatarConcept = { ...avatarConcept, ...updates };
    this.avatarConcepts.set(id, updatedAvatarConcept);
    return updatedAvatarConcept;
  }

  async deleteAllAvatarConceptLinks(userId: string): Promise<number> {
    // Get all avatars for this user to find their links
    const userAvatars = Array.from(this.avatars.values()).filter(avatar => avatar.userId === userId);
    const userAvatarIds = new Set(userAvatars.map(avatar => avatar.id));
    
    const linksToDelete = Array.from(this.avatarConcepts.values()).filter(link => userAvatarIds.has(link.avatarId));
    linksToDelete.forEach(link => this.avatarConcepts.delete(link.id));
    return linksToDelete.length;
  }

  async linkConceptToAvatar(avatarId: string, conceptId: string, relevanceScore: number): Promise<AvatarConcept> {
    // Check if link already exists
    const existingLink = Array.from(this.avatarConcepts.values()).find(
      link => link.avatarId === avatarId && link.conceptId === conceptId
    );
    
    if (existingLink) {
      throw new Error('Link already exists');
    }

    return await this.createAvatarConcept({
      avatarId,
      conceptId,
      relevanceScore: relevanceScore.toString(),
      matchedHooks: [],
      matchedElements: [],
      rationale: "Auto-linked based on avatar-specific concept fetch",
      status: "linked"
    });
  }

  // Platform Settings methods
  async getPlatformSettings(userId: string): Promise<PlatformSettings | undefined> {
    return this.platformSettings.get(userId);
  }

  async createPlatformSettings(insertSettings: InsertPlatformSettings): Promise<PlatformSettings> {
    const id = randomUUID();
    const settings: PlatformSettings = { 
      ...insertSettings,
      id,
      provenConceptsPercentage: insertSettings.provenConceptsPercentage ?? 80,
      weeklyBriefsVolume: insertSettings.weeklyBriefsVolume ?? 5,
      subscriptionTier: insertSettings.subscriptionTier ?? "free",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.platformSettings.set(insertSettings.userId, settings);
    return settings;
  }

  async updatePlatformSettings(userId: string, updates: UpdatePlatformSettings): Promise<PlatformSettings | undefined> {
    const settings = this.platformSettings.get(userId);
    if (!settings) return undefined;
    
    // Only allow specific fields to be updated, prevent id/userId tampering
    const updatedSettings: PlatformSettings = { 
      ...settings,
      ...(updates.provenConceptsPercentage !== undefined && { provenConceptsPercentage: updates.provenConceptsPercentage }),
      ...(updates.weeklyBriefsVolume !== undefined && { weeklyBriefsVolume: updates.weeklyBriefsVolume }),
      ...(updates.subscriptionTier !== undefined && { subscriptionTier: updates.subscriptionTier }),
      updatedAt: new Date()
    };
    this.platformSettings.set(userId, updatedSettings);
    return updatedSettings;
  }
  
  // Knowledge Base methods
  async getKnowledgeBase(userId: string): Promise<KnowledgeBase | undefined> {
    return this.knowledgeBase.get(userId);
  }

  async createKnowledgeBase(insertKnowledgeBase: InsertKnowledgeBase): Promise<KnowledgeBase> {
    const id = randomUUID();
    const knowledgeBase: KnowledgeBase = {
      ...insertKnowledgeBase,
      id,
      websiteUrl: insertKnowledgeBase.websiteUrl || null,
      brandVoice: insertKnowledgeBase.brandVoice || null,
      missionStatement: insertKnowledgeBase.missionStatement || null,
      brandValues: insertKnowledgeBase.brandValues || [],
      productLinks: insertKnowledgeBase.productLinks || [],
      pricingInfo: insertKnowledgeBase.pricingInfo || null,
      keyBenefits: insertKnowledgeBase.keyBenefits || [],
      usps: insertKnowledgeBase.usps || [],
      currentPersonas: insertKnowledgeBase.currentPersonas || null,
      demographics: insertKnowledgeBase.demographics || null,
      mainCompetitors: insertKnowledgeBase.mainCompetitors || [],
      instagramHandle: insertKnowledgeBase.instagramHandle || null,
      facebookPage: insertKnowledgeBase.facebookPage || null,
      tiktokHandle: insertKnowledgeBase.tiktokHandle || null,
      contentStyle: insertKnowledgeBase.contentStyle || null,
      salesTrends: insertKnowledgeBase.salesTrends || null,
      uploadedFiles: insertKnowledgeBase.uploadedFiles || [],
      completionPercentage: insertKnowledgeBase.completionPercentage || 0,
      lastUpdated: new Date(),
      createdAt: new Date()
    };
    this.knowledgeBase.set(insertKnowledgeBase.userId, knowledgeBase);
    return knowledgeBase;
  }

  async updateKnowledgeBase(userId: string, updates: UpdateKnowledgeBase): Promise<KnowledgeBase | undefined> {
    const existing = this.knowledgeBase.get(userId);
    if (!existing) return undefined;
    
    const updated: KnowledgeBase = {
      ...existing,
      ...updates,
      lastUpdated: new Date()
    };
    this.knowledgeBase.set(userId, updated);
    return updated;
  }

  // Generated Scripts methods (for self-learning system)
  async getGeneratedScripts(userId: string): Promise<GeneratedScript[]> {
    return Array.from(this.generatedScripts.values()).filter(
      script => script.userId === userId
    );
  }

  async getGeneratedScript(id: string): Promise<GeneratedScript | undefined> {
    return this.generatedScripts.get(id);
  }

  async createGeneratedScript(insertScript: InsertGeneratedScript): Promise<GeneratedScript> {
    const id = randomUUID();
    const script: GeneratedScript = {
      ...insertScript,
      id,
      status: insertScript.status || "pending",
      feedback: insertScript.feedback || null,
      performance: insertScript.performance || null,
      usedInCampaign: insertScript.usedInCampaign || false,
      campaignResults: insertScript.campaignResults || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.generatedScripts.set(id, script);
    return script;
  }

  async updateGeneratedScript(id: string, userId: string, updates: UpdateGeneratedScript): Promise<GeneratedScript | undefined> {
    const script = this.generatedScripts.get(id);
    if (!script) return undefined;
    
    // Security: Verify ownership before allowing updates
    if (script.userId !== userId) return undefined;
    
    const updatedScript: GeneratedScript = {
      ...script,
      ...updates,
      updatedAt: new Date()
    };
    this.generatedScripts.set(id, updatedScript);
    return updatedScript;
  }
}

// Database-backed storage using Drizzle ORM
export class PgStorage implements IStorage {
  private db;

  constructor() {
    const sql = neon(process.env.DATABASE_URL!);
    this.db = drizzle(sql);
  }

  // User methods (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (!userData.id) {
      throw new Error("User ID is required for upsert operation");
    }

    const existing = await this.getUser(userData.id);
    
    if (existing) {
      // Update existing user
      const result = await this.db
        .update(users)
        .set({
          ...userData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userData.id))
        .returning();
      return result[0];
    } else {
      // Create new user
      const result = await this.db
        .insert(users)
        .values({
          id: userData.id,
          email: userData.email || null,
          firstName: userData.firstName || null,
          lastName: userData.lastName || null,
          profileImageUrl: userData.profileImageUrl || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return result[0];
    }
  }

  // Avatar methods
  async getAvatars(userId?: string): Promise<Avatar[]> {
    if (!userId) {
      return await this.db.select().from(avatars);
    }
    return await this.db.select().from(avatars).where(eq(avatars.userId, userId));
  }

  async getAvatar(id: string): Promise<Avatar | undefined> {
    const result = await this.db.select().from(avatars).where(eq(avatars.id, id)).limit(1);
    return result[0];
  }

  async createAvatar(insertAvatar: InsertAvatar): Promise<Avatar> {
    const result = await this.db.insert(avatars).values(insertAvatar).returning();
    return result[0];
  }

  async updateAvatar(id: string, updates: Partial<Avatar>): Promise<Avatar | undefined> {
    const result = await this.db
      .update(avatars)
      .set(updates)
      .where(eq(avatars.id, id))
      .returning();
    return result[0];
  }

  async deleteAllAvatars(userId: string): Promise<number> {
    const result = await this.db.delete(avatars).where(eq(avatars.userId, userId)).returning();
    return result.length;
  }

  // Concept methods
  async getConcepts(avatarId?: string, userId?: string): Promise<Concept[]> {
    if (!avatarId && !userId) {
      return await this.db.select().from(concepts);
    }
    
    // When avatarId is provided, return concepts fetched FOR that avatar
    // Filter by avatarId column in concepts table (NOT the junction table)
    if (avatarId && userId) {
      // Security: Verify avatar belongs to user
      const avatar = await this.db.select().from(avatars).where(eq(avatars.id, avatarId)).limit(1);
      if (!avatar[0] || avatar[0].userId !== userId) {
        // Avatar doesn't exist or doesn't belong to this user - return empty
        return [];
      }
      
      // Return concepts that were fetched for this specific avatar
      return await this.db.select().from(concepts).where(
        and(
          eq(concepts.userId, userId),
          eq(concepts.avatarId, avatarId)
        )
      );
    }
    
    // Just avatarId, no userId - filter by avatarId column
    if (avatarId) {
      return await this.db.select().from(concepts).where(eq(concepts.avatarId, avatarId));
    }
    
    // Just userId, no avatarId - return all concepts for user
    if (userId) {
      return await this.db.select().from(concepts).where(eq(concepts.userId, userId));
    }
    
    return [];
  }

  async getConcept(id: string): Promise<Concept | undefined> {
    const result = await this.db.select().from(concepts).where(eq(concepts.id, id)).limit(1);
    return result[0];
  }

  async createConcept(insertConcept: InsertConcept): Promise<Concept> {
    const result = await this.db.insert(concepts).values(insertConcept).returning();
    return result[0];
  }

  async updateConcept(id: string, updates: Partial<Concept>): Promise<Concept | undefined> {
    const result = await this.db
      .update(concepts)
      .set(updates)
      .where(eq(concepts.id, id))
      .returning();
    return result[0];
  }

  async deleteAllConcepts(userId: string): Promise<number> {
    const result = await this.db.delete(concepts).where(eq(concepts.userId, userId)).returning();
    return result.length;
  }

  // Avatar-Concept linking methods
  async getAvatarConcepts(avatarId?: string, conceptId?: string, userId?: string): Promise<AvatarConcept[]> {
    // Build where conditions
    const conditions = [];
    if (avatarId) conditions.push(eq(avatarConcepts.avatarId, avatarId));
    if (conceptId) conditions.push(eq(avatarConcepts.conceptId, conceptId));
    
    // If userId provided, join with avatars to filter by user
    if (userId) {
      const result = await this.db
        .select({
          id: avatarConcepts.id,
          avatarId: avatarConcepts.avatarId,
          conceptId: avatarConcepts.conceptId,
          relevanceScore: avatarConcepts.relevanceScore,
          matchedHooks: avatarConcepts.matchedHooks,
          matchedElements: avatarConcepts.matchedElements,
          rationale: avatarConcepts.rationale,
          status: avatarConcepts.status,
          feedback: avatarConcepts.feedback,
          createdAt: avatarConcepts.createdAt
        })
        .from(avatarConcepts)
        .innerJoin(avatars, eq(avatarConcepts.avatarId, avatars.id))
        .where(conditions.length > 0 ? and(eq(avatars.userId, userId), ...conditions) : eq(avatars.userId, userId));
      return result;
    }
    
    // No userId filter - return based on other conditions
    if (conditions.length > 0) {
      return await this.db.select().from(avatarConcepts).where(and(...conditions));
    }
    
    return await this.db.select().from(avatarConcepts);
  }

  async getAvatarConcept(id: string): Promise<AvatarConcept | undefined> {
    const result = await this.db.select().from(avatarConcepts).where(eq(avatarConcepts.id, id)).limit(1);
    return result[0];
  }

  async createAvatarConcept(insertAvatarConcept: InsertAvatarConcept): Promise<AvatarConcept> {
    const result = await this.db.insert(avatarConcepts).values(insertAvatarConcept).returning();
    return result[0];
  }

  async updateAvatarConcept(id: string, updates: Partial<AvatarConcept>): Promise<AvatarConcept | undefined> {
    const result = await this.db
      .update(avatarConcepts)
      .set(updates)
      .where(eq(avatarConcepts.id, id))
      .returning();
    return result[0];
  }

  async deleteAllAvatarConceptLinks(userId: string): Promise<number> {
    // Get all avatar IDs for this user
    const userAvatars = await this.db.select({ id: avatars.id }).from(avatars).where(eq(avatars.userId, userId));
    const userAvatarIds = userAvatars.map(a => a.id);
    
    if (userAvatarIds.length === 0) return 0;
    
    // Delete all links for these avatars
    const result = await this.db
      .delete(avatarConcepts)
      .where(inArray(avatarConcepts.avatarId, userAvatarIds))
      .returning();
    return result.length;
  }

  async linkConceptToAvatar(avatarId: string, conceptId: string, relevanceScore: number): Promise<AvatarConcept> {
    // Check if link already exists
    const existing = await this.db
      .select()
      .from(avatarConcepts)
      .where(and(
        eq(avatarConcepts.avatarId, avatarId),
        eq(avatarConcepts.conceptId, conceptId)
      ))
      .limit(1);
    
    if (existing.length > 0) {
      throw new Error('Link already exists');
    }

    return await this.createAvatarConcept({
      avatarId,
      conceptId,
      relevanceScore: relevanceScore.toString(),
      matchedHooks: [],
      matchedElements: [],
      rationale: "Auto-linked based on avatar-specific concept fetch",
      status: "linked"
    });
  }

  // Platform Settings methods
  async getPlatformSettings(userId: string): Promise<PlatformSettings | undefined> {
    const result = await this.db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.userId, userId))
      .limit(1);
    return result[0];
  }

  async createPlatformSettings(insertSettings: InsertPlatformSettings): Promise<PlatformSettings> {
    const result = await this.db.insert(platformSettings).values(insertSettings).returning();
    return result[0];
  }

  async updatePlatformSettings(userId: string, updates: UpdatePlatformSettings): Promise<PlatformSettings | undefined> {
    const result = await this.db
      .update(platformSettings)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(platformSettings.userId, userId))
      .returning();
    return result[0];
  }

  // Knowledge Base methods
  async getKnowledgeBase(userId: string): Promise<KnowledgeBase | undefined> {
    const result = await this.db
      .select()
      .from(knowledgeBase)
      .where(eq(knowledgeBase.userId, userId))
      .limit(1);
    return result[0];
  }

  async createKnowledgeBase(insertKnowledgeBase: InsertKnowledgeBase): Promise<KnowledgeBase> {
    const result = await this.db
      .insert(knowledgeBase)
      .values({
        ...insertKnowledgeBase,
        lastUpdated: new Date(),
        createdAt: new Date()
      })
      .returning();
    return result[0];
  }

  async updateKnowledgeBase(userId: string, updates: UpdateKnowledgeBase): Promise<KnowledgeBase | undefined> {
    const result = await this.db
      .update(knowledgeBase)
      .set({
        ...updates,
        lastUpdated: new Date()
      })
      .where(eq(knowledgeBase.userId, userId))
      .returning();
    return result[0];
  }

  // Generated Scripts methods (for self-learning system)
  async getGeneratedScripts(userId: string): Promise<GeneratedScript[]> {
    return await this.db
      .select()
      .from(generatedScripts)
      .where(eq(generatedScripts.userId, userId))
      .orderBy(generatedScripts.createdAt);
  }

  async getGeneratedScript(id: string): Promise<GeneratedScript | undefined> {
    const result = await this.db
      .select()
      .from(generatedScripts)
      .where(eq(generatedScripts.id, id))
      .limit(1);
    return result[0];
  }

  async createGeneratedScript(insertScript: InsertGeneratedScript): Promise<GeneratedScript> {
    const result = await this.db
      .insert(generatedScripts)
      .values({
        ...insertScript,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return result[0];
  }

  async updateGeneratedScript(id: string, userId: string, updates: UpdateGeneratedScript): Promise<GeneratedScript | undefined> {
    const result = await this.db
      .update(generatedScripts)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(and(eq(generatedScripts.id, id), eq(generatedScripts.userId, userId)))
      .returning();
    return result[0];
  }
}

export const storage = new PgStorage();
