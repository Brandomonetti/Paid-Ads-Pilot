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
import { eq, and } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Avatar methods
  getAvatars(): Promise<Avatar[]>;
  getAvatar(id: string): Promise<Avatar | undefined>;
  createAvatar(avatar: InsertAvatar): Promise<Avatar>;
  updateAvatar(id: string, updates: Partial<Avatar>): Promise<Avatar | undefined>;
  
  // Concept methods
  getConcepts(avatarId?: string): Promise<Concept[]>;
  getConcept(id: string): Promise<Concept | undefined>;
  createConcept(concept: InsertConcept): Promise<Concept>;
  updateConcept(id: string, updates: Partial<Concept>): Promise<Concept | undefined>;
  
  // Avatar-Concept linking methods
  getAvatarConcepts(avatarId?: string, conceptId?: string): Promise<AvatarConcept[]>;
  getAvatarConcept(id: string): Promise<AvatarConcept | undefined>;
  createAvatarConcept(avatarConcept: InsertAvatarConcept): Promise<AvatarConcept>;
  updateAvatarConcept(id: string, updates: Partial<AvatarConcept>): Promise<AvatarConcept | undefined>;
  
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
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.set(userData.id, newUser);
      return newUser;
    }
  }

  // Avatar methods
  async getAvatars(): Promise<Avatar[]> {
    return Array.from(this.avatars.values());
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

  // Concept methods
  async getConcepts(avatarId?: string): Promise<Concept[]> {
    const allConcepts = Array.from(this.concepts.values());
    
    if (!avatarId) return allConcepts;
    
    // If avatarId provided, return ALL concepts but sorted by relevance for that avatar
    // Concepts with existing links should be sorted by their stored relevance score
    // Concepts without links should appear after linked ones
    const avatarConceptLinks = Array.from(this.avatarConcepts.values())
      .filter(link => link.avatarId === avatarId && link.status === "linked");
    
    const linkedConceptIds = new Set(avatarConceptLinks.map(link => link.conceptId));
    const linkedConcepts = avatarConceptLinks
      .sort((a, b) => parseFloat(b.relevanceScore) - parseFloat(a.relevanceScore))
      .map(link => this.concepts.get(link.conceptId))
      .filter((concept): concept is Concept => concept !== undefined);
    
    const unlinkedConcepts = allConcepts.filter(concept => !linkedConceptIds.has(concept.id));
    
    // Return linked concepts first (sorted by relevance), then unlinked concepts
    return [...linkedConcepts, ...unlinkedConcepts];
  }

  async getConcept(id: string): Promise<Concept | undefined> {
    return this.concepts.get(id);
  }

  async createConcept(insertConcept: InsertConcept): Promise<Concept> {
    const id = randomUUID();
    const concept: Concept = { 
      ...insertConcept,
      id,
      status: insertConcept.status || "pending",
      feedback: insertConcept.feedback || null,
      referenceUrl: insertConcept.referenceUrl || null,
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

  // Avatar-Concept linking methods
  async getAvatarConcepts(avatarId?: string, conceptId?: string): Promise<AvatarConcept[]> {
    const allLinks = Array.from(this.avatarConcepts.values());
    
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
  async getAvatars(): Promise<Avatar[]> {
    return await this.db.select().from(avatars);
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

  // Concept methods
  async getConcepts(avatarId?: string): Promise<Concept[]> {
    if (!avatarId) {
      return await this.db.select().from(concepts);
    }
    
    // Get concepts sorted by relevance for the avatar
    const conceptsWithRelevance = await this.db
      .select({
        id: concepts.id,
        title: concepts.title,
        format: concepts.format,
        platform: concepts.platform,
        industry: concepts.industry,
        performance: concepts.performance,
        insights: concepts.insights,
        keyElements: concepts.keyElements,
        status: concepts.status,
        referenceUrl: concepts.referenceUrl,
        feedback: concepts.feedback,
        createdAt: concepts.createdAt,
        relevanceScore: avatarConcepts.relevanceScore
      })
      .from(concepts)
      .leftJoin(avatarConcepts, and(
        eq(avatarConcepts.conceptId, concepts.id),
        eq(avatarConcepts.avatarId, avatarId),
        eq(avatarConcepts.status, "linked")
      ))
      .orderBy(avatarConcepts.relevanceScore);
    
    return conceptsWithRelevance.map(({ relevanceScore, ...concept }) => concept);
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

  // Avatar-Concept linking methods
  async getAvatarConcepts(avatarId?: string, conceptId?: string): Promise<AvatarConcept[]> {
    let query = this.db.select().from(avatarConcepts);
    
    if (avatarId && conceptId) {
      query = query.where(and(
        eq(avatarConcepts.avatarId, avatarId),
        eq(avatarConcepts.conceptId, conceptId)
      ));
    } else if (avatarId) {
      query = query.where(eq(avatarConcepts.avatarId, avatarId));
    } else if (conceptId) {
      query = query.where(eq(avatarConcepts.conceptId, conceptId));
    }
    
    return await query;
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
