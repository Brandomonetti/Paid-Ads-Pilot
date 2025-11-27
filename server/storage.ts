import { 
  type User, type UpsertUser,
  type KnowledgeBase, type InsertKnowledgeBase,
  type UpdateKnowledgeBase,
  type Avatar, type InsertAvatar, type UpdateAvatar,
  type Concept, type InsertConcept, type UpdateConcept,
  type AvatarConcept, type InsertAvatarConcept,
  users, knowledgeBase, avatars, concepts, avatarConcepts
} from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User methods (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Knowledge Base methods
  getKnowledgeBase(userId: string): Promise<KnowledgeBase | undefined>;
  createKnowledgeBase(knowledgeBase: InsertKnowledgeBase): Promise<KnowledgeBase>;
  updateKnowledgeBase(userId: string, updates: UpdateKnowledgeBase): Promise<KnowledgeBase | undefined>;
  
  // Avatar methods (Customer Intelligence Hub)
  getAvatars(userId: string): Promise<Avatar[]>;
  getAvatar(id: string): Promise<Avatar | undefined>;
  createAvatar(avatar: InsertAvatar): Promise<Avatar>;
  updateAvatar(id: string, userId: string, updates: UpdateAvatar): Promise<Avatar | undefined>;
  deleteAllAvatars(userId: string): Promise<number>;
  
  // Concept methods (Creative Research Center)
  getConcepts(userId: string): Promise<Concept[]>;
  getConcept(id: string): Promise<Concept | undefined>;
  createConcept(concept: InsertConcept): Promise<Concept>;
  updateConcept(id: string, userId: string, updates: UpdateConcept): Promise<Concept | undefined>;
  deleteAllConcepts(userId: string): Promise<number>;
  
  // Avatar-Concept Link methods
  getAvatarConcepts(userId: string, avatarId?: string): Promise<AvatarConcept[]>;
  createAvatarConcept(link: InsertAvatarConcept): Promise<AvatarConcept>;
  deleteAvatarConcept(id: string, userId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private knowledgeBaseMap: Map<string, KnowledgeBase>;
  private avatarsMap: Map<string, Avatar>;
  private conceptsMap: Map<string, Concept>;
  private avatarConceptsMap: Map<string, AvatarConcept>;

  constructor() {
    this.users = new Map();
    this.knowledgeBaseMap = new Map();
    this.avatarsMap = new Map();
    this.conceptsMap = new Map();
    this.avatarConceptsMap = new Map();
  }

  // User methods (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (!userData.id) {
      throw new Error("User ID is required for upsert operation");
    }
    
    const existingUser = this.users.get(userData.id);
    
    if (existingUser) {
      const updatedUser: User = {
        ...existingUser,
        ...userData,
        id: userData.id,
        updatedAt: new Date(),
      };
      this.users.set(userData.id, updatedUser);
      return updatedUser;
    } else {
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
  
  // Knowledge Base methods
  async getKnowledgeBase(userId: string): Promise<KnowledgeBase | undefined> {
    return this.knowledgeBaseMap.get(userId);
  }

  async createKnowledgeBase(insertKB: InsertKnowledgeBase): Promise<KnowledgeBase> {
    const id = randomUUID();
    const kb: KnowledgeBase = {
      ...insertKB,
      id,
      websiteUrl: insertKB.websiteUrl || null,
      brandVoice: insertKB.brandVoice || null,
      missionStatement: insertKB.missionStatement || null,
      brandValues: insertKB.brandValues || [],
      productLinks: insertKB.productLinks || [],
      pricingInfo: insertKB.pricingInfo || null,
      keyBenefits: insertKB.keyBenefits || [],
      usps: insertKB.usps || [],
      currentPersonas: insertKB.currentPersonas || null,
      demographics: insertKB.demographics || null,
      mainCompetitors: insertKB.mainCompetitors || [],
      instagramHandle: insertKB.instagramHandle || null,
      facebookPage: insertKB.facebookPage || null,
      tiktokHandle: insertKB.tiktokHandle || null,
      contentStyle: insertKB.contentStyle || null,
      salesTrends: insertKB.salesTrends || null,
      uploadedFiles: insertKB.uploadedFiles || {},
      completionPercentage: insertKB.completionPercentage || 0,
      lastUpdated: new Date(),
      createdAt: new Date()
    };
    this.knowledgeBaseMap.set(insertKB.userId, kb);
    return kb;
  }

  async updateKnowledgeBase(userId: string, updates: UpdateKnowledgeBase): Promise<KnowledgeBase | undefined> {
    const existing = this.knowledgeBaseMap.get(userId);
    if (!existing) return undefined;
    
    const updated: KnowledgeBase = {
      ...existing,
      ...updates,
      lastUpdated: new Date()
    };
    this.knowledgeBaseMap.set(userId, updated);
    return updated;
  }

  // Avatar methods
  async getAvatars(userId: string): Promise<Avatar[]> {
    return Array.from(this.avatarsMap.values()).filter(a => a.userId === userId);
  }

  async getAvatar(id: string): Promise<Avatar | undefined> {
    return this.avatarsMap.get(id);
  }

  async createAvatar(insertAvatar: InsertAvatar): Promise<Avatar> {
    const id = randomUUID();
    const avatar: Avatar = {
      ...insertAvatar,
      id,
      role: insertAvatar.role || null,
      motivations: insertAvatar.motivations || [],
      painPoints: insertAvatar.painPoints || [],
      desiredOutcomes: insertAvatar.desiredOutcomes || [],
      objections: insertAvatar.objections || [],
      preferredHooks: insertAvatar.preferredHooks || [],
      triggers: insertAvatar.triggers || [],
      priority: insertAvatar.priority || "medium",
      confidence: insertAvatar.confidence || "75.00",
      source: insertAvatar.source || "generated",
      status: insertAvatar.status || "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.avatarsMap.set(id, avatar);
    return avatar;
  }

  async updateAvatar(id: string, userId: string, updates: UpdateAvatar): Promise<Avatar | undefined> {
    const avatar = this.avatarsMap.get(id);
    if (!avatar || avatar.userId !== userId) return undefined;
    
    const updatedAvatar: Avatar = {
      ...avatar,
      ...updates,
      updatedAt: new Date()
    };
    this.avatarsMap.set(id, updatedAvatar);
    return updatedAvatar;
  }

  async deleteAllAvatars(userId: string): Promise<number> {
    const toDelete = Array.from(this.avatarsMap.values()).filter(a => a.userId === userId);
    toDelete.forEach(a => this.avatarsMap.delete(a.id));
    return toDelete.length;
  }

  // Concept methods
  async getConcepts(userId: string): Promise<Concept[]> {
    return Array.from(this.conceptsMap.values()).filter(c => c.userId === userId);
  }

  async getConcept(id: string): Promise<Concept | undefined> {
    return this.conceptsMap.get(id);
  }

  async createConcept(insertConcept: InsertConcept): Promise<Concept> {
    const id = randomUUID();
    const concept: Concept = {
      id,
      ...insertConcept,
      thumbnailUrl: insertConcept.thumbnailUrl ?? null,
      videoUrl: insertConcept.videoUrl ?? null,
      postUrl: insertConcept.postUrl ?? null,
      brandName: insertConcept.brandName ?? null,
      industry: insertConcept.industry ?? null,
      hooks: insertConcept.hooks ?? [],
      engagementScore: insertConcept.engagementScore ?? 0,
      likes: insertConcept.likes ?? null,
      comments: insertConcept.comments ?? null,
      shares: insertConcept.shares ?? null,
      views: insertConcept.views ?? null,
      engagementRate: insertConcept.engagementRate ?? null,
      status: insertConcept.status ?? "discovered",
      createdAt: new Date(),
      discoveredAt: new Date()
    };
    this.conceptsMap.set(id, concept);
    return concept;
  }

  async updateConcept(id: string, userId: string, updates: UpdateConcept): Promise<Concept | undefined> {
    const concept = this.conceptsMap.get(id);
    if (!concept || concept.userId !== userId) return undefined;
    
    const updatedConcept: Concept = {
      ...concept,
      ...updates
    };
    this.conceptsMap.set(id, updatedConcept);
    return updatedConcept;
  }

  async deleteAllConcepts(userId: string): Promise<number> {
    const toDelete = Array.from(this.conceptsMap.values()).filter(c => c.userId === userId);
    toDelete.forEach(c => this.conceptsMap.delete(c.id));
    return toDelete.length;
  }

  // Avatar-Concept Link methods
  async getAvatarConcepts(userId: string, avatarId?: string): Promise<AvatarConcept[]> {
    let links = Array.from(this.avatarConceptsMap.values()).filter(l => l.userId === userId);
    if (avatarId) {
      links = links.filter(l => l.avatarId === avatarId);
    }
    return links;
  }

  async createAvatarConcept(insertLink: InsertAvatarConcept): Promise<AvatarConcept> {
    const id = randomUUID();
    const link: AvatarConcept = {
      id,
      ...insertLink,
      userApproved: insertLink.userApproved ?? null,
      feedback: insertLink.feedback ?? null,
      createdAt: new Date()
    };
    this.avatarConceptsMap.set(id, link);
    return link;
  }

  async deleteAvatarConcept(id: string, userId: string): Promise<boolean> {
    const link = this.avatarConceptsMap.get(id);
    if (!link || link.userId !== userId) return false;
    this.avatarConceptsMap.delete(id);
    return true;
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    const sql = neon(process.env.DATABASE_URL!);
    this.db = drizzle(sql);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (!userData.id) {
      throw new Error("User ID is required for upsert operation");
    }

    const existingUser = await this.getUser(userData.id);
    
    if (existingUser) {
      const result = await this.db
        .update(users)
        .set({
          ...userData,
          updatedAt: new Date()
        })
        .where(eq(users.id, userData.id))
        .returning();
      return result[0];
    } else {
      const result = await this.db
        .insert(users)
        .values({
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return result[0];
    }
  }

  // Knowledge Base methods
  async getKnowledgeBase(userId: string): Promise<KnowledgeBase | undefined> {
    const result = await this.db
      .select()
      .from(knowledgeBase)
      .where(eq(knowledgeBase.userId, userId));
    return result[0];
  }

  async createKnowledgeBase(insertKB: InsertKnowledgeBase): Promise<KnowledgeBase> {
    const result = await this.db
      .insert(knowledgeBase)
      .values({
        ...insertKB,
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

  // Avatar methods
  async getAvatars(userId: string): Promise<Avatar[]> {
    return await this.db
      .select()
      .from(avatars)
      .where(eq(avatars.userId, userId))
      .orderBy(desc(avatars.createdAt));
  }

  async getAvatar(id: string): Promise<Avatar | undefined> {
    const result = await this.db.select().from(avatars).where(eq(avatars.id, id));
    return result[0];
  }

  async createAvatar(insertAvatar: InsertAvatar): Promise<Avatar> {
    const result = await this.db
      .insert(avatars)
      .values({
        ...insertAvatar,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return result[0];
  }

  async updateAvatar(id: string, userId: string, updates: UpdateAvatar): Promise<Avatar | undefined> {
    const result = await this.db
      .update(avatars)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(and(eq(avatars.id, id), eq(avatars.userId, userId)))
      .returning();
    return result[0];
  }

  async deleteAllAvatars(userId: string): Promise<number> {
    const result = await this.db
      .delete(avatars)
      .where(eq(avatars.userId, userId))
      .returning();
    return result.length;
  }

  // Concept methods
  async getConcepts(userId: string): Promise<Concept[]> {
    return await this.db
      .select()
      .from(concepts)
      .where(eq(concepts.userId, userId))
      .orderBy(desc(concepts.createdAt));
  }

  async getConcept(id: string): Promise<Concept | undefined> {
    const result = await this.db.select().from(concepts).where(eq(concepts.id, id));
    return result[0];
  }

  async createConcept(insertConcept: InsertConcept): Promise<Concept> {
    const result = await this.db
      .insert(concepts)
      .values({
        ...insertConcept,
        createdAt: new Date(),
        discoveredAt: new Date()
      })
      .returning();
    return result[0];
  }

  async updateConcept(id: string, userId: string, updates: UpdateConcept): Promise<Concept | undefined> {
    const result = await this.db
      .update(concepts)
      .set(updates)
      .where(and(eq(concepts.id, id), eq(concepts.userId, userId)))
      .returning();
    return result[0];
  }

  async deleteAllConcepts(userId: string): Promise<number> {
    const result = await this.db
      .delete(concepts)
      .where(eq(concepts.userId, userId))
      .returning();
    return result.length;
  }

  // Avatar-Concept Link methods
  async getAvatarConcepts(userId: string, avatarId?: string): Promise<AvatarConcept[]> {
    if (avatarId) {
      return await this.db
        .select()
        .from(avatarConcepts)
        .where(and(eq(avatarConcepts.userId, userId), eq(avatarConcepts.avatarId, avatarId)));
    }
    return await this.db
      .select()
      .from(avatarConcepts)
      .where(eq(avatarConcepts.userId, userId));
  }

  async createAvatarConcept(insertLink: InsertAvatarConcept): Promise<AvatarConcept> {
    const result = await this.db
      .insert(avatarConcepts)
      .values({
        ...insertLink,
        createdAt: new Date()
      })
      .returning();
    return result[0];
  }

  async deleteAvatarConcept(id: string, userId: string): Promise<boolean> {
    const result = await this.db
      .delete(avatarConcepts)
      .where(and(eq(avatarConcepts.id, id), eq(avatarConcepts.userId, userId)))
      .returning();
    return result.length > 0;
  }
}

// Export appropriate storage based on environment
export const storage: IStorage = process.env.DATABASE_URL 
  ? new DatabaseStorage() 
  : new MemStorage();
