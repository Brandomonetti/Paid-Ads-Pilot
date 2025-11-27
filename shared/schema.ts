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
  demographics: text("demographics").notNull(), // Brief demographic description
  psychographics: text("psychographics"), // Values, interests, lifestyle
  
  // Pain Points & Desires
  painPoints: text("pain_points").array().notNull().default(sql`ARRAY[]::text[]`),
  desires: text("desires").array().notNull().default(sql`ARRAY[]::text[]`),
  
  // Marketing Hooks
  hooks: text("hooks").array().notNull().default(sql`ARRAY[]::text[]`),
  
  // Evidence & Sources
  sources: text("sources").array().notNull().default(sql`ARRAY[]::text[]`),
  
  // Metadata
  priority: text("priority").notNull().default("medium"), // high, medium, low
  dataConfidence: text("data_confidence").notNull().default("0.75"), // 0.0 to 1.0 as string
  recommendationSource: text("recommendation_source").notNull().default("generated"), // generated, manual
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
  demographics: z.string().optional(),
  psychographics: z.string().optional(),
  painPoints: z.array(z.string()).optional(),
  desires: z.array(z.string()).optional(),
  hooks: z.array(z.string()).optional(),
  sources: z.array(z.string()).optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  dataConfidence: z.string().optional(),
  recommendationSource: z.string().optional(),
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
