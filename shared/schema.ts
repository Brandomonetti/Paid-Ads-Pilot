import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, jsonb, timestamp, index, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// AUTHENTICATION TABLES (Required for Replit Auth)
// ============================================================================

// Session storage table for Replit Auth
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// ============================================================================
// PLATFORM SETTINGS (Subscription & Credits)
// ============================================================================

export const platformSettings = pgTable("platform_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Subscription & Credits
  subscriptionTier: text("subscription_tier").notNull().default("research"), // research, research_briefing, all_agents
  creditTier: integer("credit_tier").notNull().default(0), // 0=50 credits, 1=100, 2=200, 3=500
  monthlyCredits: integer("monthly_credits").notNull().default(50),
  creditsUsed: integer("credits_used").notNull().default(0),
  billingCycleStart: timestamp("billing_cycle_start").defaultNow(),
  
  // Legacy fields for compatibility
  provenConceptsPercentage: integer("proven_concepts_percentage").notNull().default(80),
  weeklyBriefsVolume: integer("weekly_briefs_volume").notNull().default(5),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertPlatformSettingsSchema = createInsertSchema(platformSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const updatePlatformSettingsSchema = z.object({
  subscriptionTier: z.enum(["research", "research_briefing", "all_agents"]).optional(),
  creditTier: z.number().min(0).max(3).optional(),
  monthlyCredits: z.number().min(50).max(500).optional(),
  creditsUsed: z.number().min(0).optional(),
  provenConceptsPercentage: z.number().min(0).max(100).optional(),
  weeklyBriefsVolume: z.number().min(1).max(200).optional()
});

export type InsertPlatformSettings = z.infer<typeof insertPlatformSettingsSchema>;
export type UpdatePlatformSettings = z.infer<typeof updatePlatformSettingsSchema>;
export type PlatformSettings = typeof platformSettings.$inferSelect;

// ============================================================================
// KNOWLEDGE BASE (Brand Information)
// ============================================================================

export const knowledgeBase = pgTable("knowledge_base", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Brand Fundamentals
  websiteUrl: text("website_url"),
  brandVoice: text("brand_voice"),
  missionStatement: text("mission_statement"),
  brandValues: text("brand_values").array().notNull().default(sql`ARRAY[]::text[]`),
  
  // Products & Services
  productLinks: text("product_links").array().notNull().default(sql`ARRAY[]::text[]`),
  pricingInfo: text("pricing_info"),
  keyBenefits: text("key_benefits").array().notNull().default(sql`ARRAY[]::text[]`),
  usps: text("usps").array().notNull().default(sql`ARRAY[]::text[]`),
  
  // Target Audience
  currentPersonas: text("current_personas"),
  demographics: text("demographics"),
  
  // Competitors
  mainCompetitors: text("main_competitors").array().notNull().default(sql`ARRAY[]::text[]`),
  
  // Social Media
  instagramHandle: text("instagram_handle"),
  facebookPage: text("facebook_page"),
  tiktokHandle: text("tiktok_handle"),
  contentStyle: text("content_style"),
  
  // Performance Data
  salesTrends: text("sales_trends"),
  
  // Uploaded Files (JSON: { "category-key": [{ name: string, url: string }] })
  uploadedFiles: jsonb("uploaded_files").notNull().default(sql`'{}'::jsonb`),
  
  // Completion tracking
  completionPercentage: integer("completion_percentage").notNull().default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertKnowledgeBaseSchema = createInsertSchema(knowledgeBase).omit({
  id: true,
  createdAt: true,
  lastUpdated: true
});

export const updateKnowledgeBaseSchema = insertKnowledgeBaseSchema.partial();

export type InsertKnowledgeBase = z.infer<typeof insertKnowledgeBaseSchema>;
export type UpdateKnowledgeBase = z.infer<typeof updateKnowledgeBaseSchema>;
export type KnowledgeBase = typeof knowledgeBase.$inferSelect;

// ============================================================================
// CUSTOMER INTELLIGENCE HUB (Avatars / Customer Profiles)
// ============================================================================

export const avatars = pgTable("avatars", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Avatar Core Details
  name: text("name").notNull(), // e.g., "Busy Professional Mom"
  role: text("role"), // e.g., "Primary decision maker for household purchases"
  ageRange: text("age_range").notNull(), // e.g., "30-45"
  
  // Demographics & Psychographics
  demographicsSummary: text("demographics_summary").notNull(), // Brief description
  motivations: text("motivations").array().notNull().default(sql`ARRAY[]::text[]`),
  
  // Pain Points & Desires
  painPoints: text("pain_points").array().notNull().default(sql`ARRAY[]::text[]`),
  desiredOutcomes: text("desired_outcomes").array().notNull().default(sql`ARRAY[]::text[]`),
  objections: text("objections").array().notNull().default(sql`ARRAY[]::text[]`),
  
  // Marketing Hooks
  preferredHooks: text("preferred_hooks").array().notNull().default(sql`ARRAY[]::text[]`),
  triggers: text("triggers").array().notNull().default(sql`ARRAY[]::text[]`),
  
  // Metadata
  priority: text("priority").notNull().default("medium"), // high, medium, low
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull().default("75.00"),
  source: text("source").notNull().default("generated"), // generated, manual
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertAvatarSchema = createInsertSchema(avatars).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const updateAvatarSchema = z.object({
  name: z.string().optional(),
  role: z.string().optional(),
  ageRange: z.string().optional(),
  demographicsSummary: z.string().optional(),
  motivations: z.array(z.string()).optional(),
  painPoints: z.array(z.string()).optional(),
  desiredOutcomes: z.array(z.string()).optional(),
  objections: z.array(z.string()).optional(),
  preferredHooks: z.array(z.string()).optional(),
  triggers: z.array(z.string()).optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional()
});

export type InsertAvatar = z.infer<typeof insertAvatarSchema>;
export type UpdateAvatar = z.infer<typeof updateAvatarSchema>;
export type Avatar = typeof avatars.$inferSelect;

// ============================================================================
// CREATIVE RESEARCH CENTER (Concepts & Links)
// ============================================================================

// Concepts - viral social media posts for creative inspiration
export const concepts = pgTable("concepts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Concept Core Details
  platform: text("platform").notNull(), // facebook, instagram, tiktok
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url"),
  postUrl: text("post_url"),
  brandName: text("brand_name"),
  industry: text("industry"),
  
  // Creative Elements
  format: text("format").notNull(), // Raw UGC Video, POV Storytelling, etc.
  hooks: text("hooks").array().notNull().default(sql`ARRAY[]::text[]`),
  
  // Engagement Metrics
  engagementScore: integer("engagement_score").notNull().default(0),
  likes: integer("likes"),
  comments: integer("comments"),
  shares: integer("shares"),
  views: integer("views"),
  engagementRate: decimal("engagement_rate", { precision: 5, scale: 2 }),
  
  // Metadata
  status: text("status").notNull().default("discovered"), // discovered, approved, rejected, tested, proven
  
  createdAt: timestamp("created_at").defaultNow(),
  discoveredAt: timestamp("discovered_at").defaultNow()
});

export const insertConceptSchema = createInsertSchema(concepts).omit({
  id: true,
  createdAt: true,
  discoveredAt: true
});

export const updateConceptSchema = z.object({
  status: z.enum(["discovered", "approved", "rejected", "tested", "proven"]).optional(),
  engagementScore: z.number().optional(),
  likes: z.number().optional(),
  comments: z.number().optional(),
  shares: z.number().optional(),
  views: z.number().optional()
});

export type InsertConcept = z.infer<typeof insertConceptSchema>;
export type UpdateConcept = z.infer<typeof updateConceptSchema>;
export type Concept = typeof concepts.$inferSelect;

// Avatar-Concept Links - intelligent matching between avatars and concepts
export const avatarConcepts = pgTable("avatar_concepts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  avatarId: varchar("avatar_id").notNull().references(() => avatars.id),
  conceptId: varchar("concept_id").notNull().references(() => concepts.id),
  
  // Matching Intelligence
  relevanceScore: decimal("relevance_score", { precision: 5, scale: 2 }).notNull(),
  matchReasoning: text("match_reasoning").notNull(),
  
  // User Feedback
  userApproved: boolean("user_approved"),
  feedback: text("feedback"),
  
  createdAt: timestamp("created_at").defaultNow()
});

export const insertAvatarConceptSchema = createInsertSchema(avatarConcepts).omit({
  id: true,
  createdAt: true
});

export type InsertAvatarConcept = z.infer<typeof insertAvatarConceptSchema>;
export type AvatarConcept = typeof avatarConcepts.$inferSelect;
