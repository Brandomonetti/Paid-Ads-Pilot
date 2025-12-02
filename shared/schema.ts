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
// CUSTOMER INTELLIGENCE HUB (Avatars - Scraped Research Insights)
// ============================================================================

export const avatars = pgTable("avatars", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Core Content (scraped from social media)
  title: text("title").notNull(),
  message: text("message").notNull(),
  category: text("category").notNull(), // e.g., "Pain Points", "Desires", etc.
  summary: text("summary").notNull(),
  
  // AI-Generated Insights
  observations: text("observations").array().notNull().default(sql`ARRAY[]::text[]`),
  marketingAngles: text("marketing_angles").array().notNull().default(sql`ARRAY[]::text[]`),
  
  // Source Information
  platform: text("platform").notNull(), // Reddit, Facebook, Instagram, TikTok, etc.
  url: text("url"),
  
  // Confidence & Status
  confidence: integer("confidence").notNull().default(0), // 0-100
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  
  createdAt: timestamp("created_at").notNull()
});

export const insertAvatarSchema = createInsertSchema(avatars).omit({
  id: true
});

export const updateAvatarSchema = z.object({
  title: z.string().optional(),
  message: z.string().optional(),
  category: z.string().optional(),
  summary: z.string().optional(),
  observations: z.array(z.string()).optional(),
  marketingAngles: z.array(z.string()).optional(),
  platform: z.string().optional(),
  url: z.string().optional(),
  confidence: z.number().min(0).max(100).optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional()
});

export type InsertAvatar = z.infer<typeof insertAvatarSchema>;
export type UpdateAvatar = z.infer<typeof updateAvatarSchema>;
export type Avatar = typeof avatars.$inferSelect;

// ============================================================================
// CREATIVE RESEARCH CENTER (Concepts - Ad/Content Examples)
// ============================================================================

export const concepts = pgTable("concepts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Core Content
  title: text("title"),
  description: text("description"),
  conceptType: text("concept_type").notNull(), // Facebook, Instagram, TikTok, etc.
  owner: text("owner"), // Brand/business name
  category: text("category"), // Business category (e.g., "Local business")
  
  // Media & Links
  url: text("url"), // Link to original ad/post
  thumbnail: text("thumbnail"), // Thumbnail image URL
  
  // Statistics (JSONB: { views, likes, replies, shares })
  statistics: jsonb("statistics").notNull().default(sql`'{}'::jsonb`),
  
  // Status
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  
  createdAt: timestamp("created_at").defaultNow()
});

export const insertConceptSchema = createInsertSchema(concepts).omit({
  id: true,
  createdAt: true
});

export const updateConceptSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  conceptType: z.string().optional(),
  owner: z.string().optional(),
  category: z.string().optional(),
  url: z.string().optional(),
  thumbnail: z.string().optional(),
  statistics: z.object({
    views: z.number().nullable().optional(),
    likes: z.number().nullable().optional(),
    replies: z.number().nullable().optional(),
    shares: z.number().nullable().optional()
  }).optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional()
});

export type InsertConcept = z.infer<typeof insertConceptSchema>;
export type UpdateConcept = z.infer<typeof updateConceptSchema>;
export type Concept = typeof concepts.$inferSelect;
