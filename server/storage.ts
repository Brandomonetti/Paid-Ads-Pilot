import { 
  type User, type UpsertUser,
  type Insight, type InsertInsight,
  type Source, type InsertSource,
  type ResearchRun, type InsertResearchRun,
  type PlatformSettings, type InsertPlatformSettings,
  type UpdatePlatformSettings,
  type KnowledgeBase, type InsertKnowledgeBase,
  type UpdateKnowledgeBase,
  type GeneratedScript, type InsertGeneratedScript,
  type UpdateGeneratedScript,
  users, insights, sources, researchRuns, platformSettings, 
  knowledgeBase, generatedScripts
} from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, inArray, desc } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Insight methods (Customer Intelligence Hub)
  getInsights(userId: string, filters?: {
    category?: string;
    platform?: string;
    status?: string;
  }): Promise<Insight[]>;
  getInsight(id: string): Promise<Insight | undefined>;
  createInsight(insight: InsertInsight): Promise<Insight>;
  updateInsight(id: string, updates: Partial<Insight>): Promise<Insight | undefined>;
  deleteAllInsights(userId: string): Promise<number>;
  
  // Source methods
  getSources(userId: string, filters?: {
    platform?: string;
    status?: string;
  }): Promise<Source[]>;
  getSource(id: string): Promise<Source | undefined>;
  createSource(source: InsertSource): Promise<Source>;
  updateSource(id: string, updates: Partial<Source>): Promise<Source | undefined>;
  
  // Research Run methods
  getResearchRuns(userId: string, limit?: number): Promise<ResearchRun[]>;
  getResearchRun(id: string): Promise<ResearchRun | undefined>;
  createResearchRun(run: InsertResearchRun): Promise<ResearchRun>;
  updateResearchRun(id: string, updates: Partial<ResearchRun>): Promise<ResearchRun | undefined>;
  
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
  private insights: Map<string, Insight>;
  private sources: Map<string, Source>;
  private researchRuns: Map<string, ResearchRun>;
  private platformSettings: Map<string, PlatformSettings>;
  private knowledgeBase: Map<string, KnowledgeBase>;
  private generatedScripts: Map<string, GeneratedScript>;

  constructor() {
    this.users = new Map();
    this.insights = new Map();
    this.sources = new Map();
    this.researchRuns = new Map();
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

  // Insight methods
  async getInsights(userId: string, filters?: {
    category?: string;
    platform?: string;
    status?: string;
  }): Promise<Insight[]> {
    let allInsights = Array.from(this.insights.values()).filter(
      insight => insight.userId === userId
    );
    
    if (filters?.category && filters.category !== 'all') {
      allInsights = allInsights.filter(i => i.category === filters.category);
    }
    if (filters?.platform && filters.platform !== 'all') {
      allInsights = allInsights.filter(i => i.sourcePlatform === filters.platform);
    }
    if (filters?.status && filters.status !== 'all') {
      allInsights = allInsights.filter(i => i.status === filters.status);
    }
    
    return allInsights.sort((a, b) => 
      (b.discoveredAt?.getTime() || 0) - (a.discoveredAt?.getTime() || 0)
    );
  }

  async getInsight(id: string): Promise<Insight | undefined> {
    return this.insights.get(id);
  }

  async createInsight(insertInsight: InsertInsight): Promise<Insight> {
    const id = randomUUID();
    const insight: Insight = { 
      ...insertInsight,
      id,
      sourceId: insertInsight.sourceId || null,
      sentimentScore: insertInsight.sentimentScore || null,
      confidenceScore: insertInsight.confidenceScore || "0.75",
      authorInfo: insertInsight.authorInfo || null,
      discussionContext: insertInsight.discussionContext || null,
      relatedKeywords: insertInsight.relatedKeywords || [],
      status: insertInsight.status || "pending",
      feedback: insertInsight.feedback || null,
      usedInCampaign: insertInsight.usedInCampaign || false,
      discoveredAt: new Date(),
      createdAt: new Date()
    };
    this.insights.set(id, insight);
    return insight;
  }

  async updateInsight(id: string, updates: Partial<Insight>): Promise<Insight | undefined> {
    const insight = this.insights.get(id);
    if (!insight) return undefined;
    
    const updatedInsight = { ...insight, ...updates };
    this.insights.set(id, updatedInsight);
    return updatedInsight;
  }

  async deleteAllInsights(userId: string): Promise<number> {
    const insightsToDelete = Array.from(this.insights.values()).filter(
      insight => insight.userId === userId
    );
    insightsToDelete.forEach(insight => this.insights.delete(insight.id));
    return insightsToDelete.length;
  }

  // Source methods
  async getSources(userId: string, filters?: {
    platform?: string;
    status?: string;
  }): Promise<Source[]> {
    let allSources = Array.from(this.sources.values()).filter(
      source => source.userId === userId
    );
    
    if (filters?.platform && filters.platform !== 'all') {
      allSources = allSources.filter(s => s.platform === filters.platform);
    }
    if (filters?.status && filters.status !== 'all') {
      allSources = allSources.filter(s => s.status === filters.status);
    }
    
    return allSources.sort((a, b) => 
      (b.discoveredAt?.getTime() || 0) - (a.discoveredAt?.getTime() || 0)
    );
  }

  async getSource(id: string): Promise<Source | undefined> {
    return this.sources.get(id);
  }

  async createSource(insertSource: InsertSource): Promise<Source> {
    const id = randomUUID();
    const source: Source = {
      ...insertSource,
      id,
      description: insertSource.description || null,
      insightsDiscovered: insertSource.insightsDiscovered || 0,
      lastChecked: new Date(),
      checkFrequency: insertSource.checkFrequency || "weekly",
      averageEngagement: insertSource.averageEngagement || null,
      relevanceScore: insertSource.relevanceScore || "0.50",
      status: insertSource.status || "active",
      discoveredAt: new Date(),
      createdAt: new Date()
    };
    this.sources.set(id, source);
    return source;
  }

  async updateSource(id: string, updates: Partial<Source>): Promise<Source | undefined> {
    const source = this.sources.get(id);
    if (!source) return undefined;
    
    const updatedSource = { ...source, ...updates };
    this.sources.set(id, updatedSource);
    return updatedSource;
  }

  // Research Run methods
  async getResearchRuns(userId: string, limit?: number): Promise<ResearchRun[]> {
    let runs = Array.from(this.researchRuns.values()).filter(
      run => run.userId === userId
    );
    
    runs.sort((a, b) => 
      (b.startedAt?.getTime() || 0) - (a.startedAt?.getTime() || 0)
    );
    
    if (limit) {
      runs = runs.slice(0, limit);
    }
    
    return runs;
  }

  async getResearchRun(id: string): Promise<ResearchRun | undefined> {
    return this.researchRuns.get(id);
  }

  async createResearchRun(insertRun: InsertResearchRun): Promise<ResearchRun> {
    const id = randomUUID();
    const run: ResearchRun = {
      ...insertRun,
      id,
      status: insertRun.status || "running",
      sourcesDiscovered: insertRun.sourcesDiscovered || 0,
      insightsDiscovered: insertRun.insightsDiscovered || 0,
      painPoints: insertRun.painPoints || 0,
      desires: insertRun.desires || 0,
      objections: insertRun.objections || 0,
      triggers: insertRun.triggers || 0,
      executionTime: insertRun.executionTime || null,
      errorLog: insertRun.errorLog || null,
      startedAt: new Date(),
      completedAt: insertRun.completedAt || null,
      createdAt: new Date()
    };
    this.researchRuns.set(id, run);
    return run;
  }

  async updateResearchRun(id: string, updates: Partial<ResearchRun>): Promise<ResearchRun | undefined> {
    const run = this.researchRuns.get(id);
    if (!run) return undefined;
    
    const updatedRun = { ...run, ...updates };
    this.researchRuns.set(id, updatedRun);
    return updatedRun;
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

  // Insight methods
  async getInsights(userId: string, filters?: {
    category?: string;
    platform?: string;
    status?: string;
  }): Promise<Insight[]> {
    const conditions = [eq(insights.userId, userId)];
    
    if (filters?.category && filters.category !== 'all') {
      conditions.push(eq(insights.category, filters.category));
    }
    if (filters?.platform && filters.platform !== 'all') {
      conditions.push(eq(insights.sourcePlatform, filters.platform));
    }
    if (filters?.status && filters.status !== 'all') {
      conditions.push(eq(insights.status, filters.status));
    }
    
    return await this.db
      .select()
      .from(insights)
      .where(and(...conditions))
      .orderBy(desc(insights.discoveredAt));
  }

  async getInsight(id: string): Promise<Insight | undefined> {
    const result = await this.db.select().from(insights).where(eq(insights.id, id)).limit(1);
    return result[0];
  }

  async createInsight(insertInsight: InsertInsight): Promise<Insight> {
    const result = await this.db.insert(insights).values(insertInsight).returning();
    return result[0];
  }

  async updateInsight(id: string, updates: Partial<Insight>): Promise<Insight | undefined> {
    const result = await this.db
      .update(insights)
      .set(updates)
      .where(eq(insights.id, id))
      .returning();
    return result[0];
  }

  async deleteAllInsights(userId: string): Promise<number> {
    const result = await this.db.delete(insights).where(eq(insights.userId, userId)).returning();
    return result.length;
  }

  // Source methods
  async getSources(userId: string, filters?: {
    platform?: string;
    status?: string;
  }): Promise<Source[]> {
    const conditions = [eq(sources.userId, userId)];
    
    if (filters?.platform && filters.platform !== 'all') {
      conditions.push(eq(sources.platform, filters.platform));
    }
    if (filters?.status && filters.status !== 'all') {
      conditions.push(eq(sources.status, filters.status));
    }
    
    return await this.db
      .select()
      .from(sources)
      .where(and(...conditions))
      .orderBy(desc(sources.discoveredAt));
  }

  async getSource(id: string): Promise<Source | undefined> {
    const result = await this.db.select().from(sources).where(eq(sources.id, id)).limit(1);
    return result[0];
  }

  async createSource(insertSource: InsertSource): Promise<Source> {
    const result = await this.db.insert(sources).values(insertSource).returning();
    return result[0];
  }

  async updateSource(id: string, updates: Partial<Source>): Promise<Source | undefined> {
    const result = await this.db
      .update(sources)
      .set(updates)
      .where(eq(sources.id, id))
      .returning();
    return result[0];
  }

  // Research Run methods
  async getResearchRuns(userId: string, limit?: number): Promise<ResearchRun[]> {
    let query = this.db
      .select()
      .from(researchRuns)
      .where(eq(researchRuns.userId, userId))
      .orderBy(desc(researchRuns.startedAt));
    
    if (limit) {
      query = query.limit(limit) as any;
    }
    
    return await query;
  }

  async getResearchRun(id: string): Promise<ResearchRun | undefined> {
    const result = await this.db.select().from(researchRuns).where(eq(researchRuns.id, id)).limit(1);
    return result[0];
  }

  async createResearchRun(insertRun: InsertResearchRun): Promise<ResearchRun> {
    const result = await this.db.insert(researchRuns).values(insertRun).returning();
    return result[0];
  }

  async updateResearchRun(id: string, updates: Partial<ResearchRun>): Promise<ResearchRun | undefined> {
    const result = await this.db
      .update(researchRuns)
      .set(updates)
      .where(eq(researchRuns.id, id))
      .returning();
    return result[0];
  }

  // Platform Settings methods
  async getPlatformSettings(userId: string): Promise<PlatformSettings | undefined> {
    const result = await this.db.select().from(platformSettings).where(eq(platformSettings.userId, userId)).limit(1);
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
    const result = await this.db.select().from(knowledgeBase).where(eq(knowledgeBase.userId, userId)).limit(1);
    return result[0];
  }

  async createKnowledgeBase(insertKnowledgeBase: InsertKnowledgeBase): Promise<KnowledgeBase> {
    const result = await this.db.insert(knowledgeBase).values(insertKnowledgeBase).returning();
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

  // Generated Scripts methods
  async getGeneratedScripts(userId: string): Promise<GeneratedScript[]> {
    return await this.db.select().from(generatedScripts).where(eq(generatedScripts.userId, userId));
  }

  async getGeneratedScript(id: string): Promise<GeneratedScript | undefined> {
    const result = await this.db.select().from(generatedScripts).where(eq(generatedScripts.id, id)).limit(1);
    return result[0];
  }

  async createGeneratedScript(insertScript: InsertGeneratedScript): Promise<GeneratedScript> {
    const result = await this.db.insert(generatedScripts).values(insertScript).returning();
    return result[0];
  }

  async updateGeneratedScript(id: string, userId: string, updates: UpdateGeneratedScript): Promise<GeneratedScript | undefined> {
    // Security: Verify ownership before allowing updates
    const existing = await this.getGeneratedScript(id);
    if (!existing || existing.userId !== userId) return undefined;
    
    const result = await this.db
      .update(generatedScripts)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(generatedScripts.id, id))
      .returning();
    return result[0];
  }
}

// Export the current storage implementation
export const storage = new PgStorage();
