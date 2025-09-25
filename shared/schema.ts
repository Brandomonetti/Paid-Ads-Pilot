import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Customer Avatar schema
export const avatars = pgTable("avatars", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  ageRange: text("age_range").notNull(),
  demographics: text("demographics").notNull(),
  painPoint: text("pain_point").notNull(),
  hooks: text("hooks").array().notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertAvatarSchema = createInsertSchema(avatars).omit({
  id: true,
  createdAt: true
});

export type InsertAvatar = z.infer<typeof insertAvatarSchema>;
export type Avatar = typeof avatars.$inferSelect;

// Creative Concept schema
export const concepts = pgTable("concepts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  format: text("format").notNull(), // "Raw UGC Video", "Testimonial", etc.
  platform: text("platform").notNull(), // "TikTok/Instagram Reels", etc.
  industry: text("industry").notNull(),
  performance: jsonb("performance").notNull(), // {views: string, engagement: string, conversion: string}
  insights: text("insights").array().notNull(),
  keyElements: text("key_elements").array().notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  referenceUrl: text("reference_url"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertConceptSchema = createInsertSchema(concepts).omit({
  id: true,
  createdAt: true
});

export type InsertConcept = z.infer<typeof insertConceptSchema>;
export type Concept = typeof concepts.$inferSelect;

// Avatar-Concept junction table for linking with relevance scoring
export const avatarConcepts = pgTable("avatar_concepts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  avatarId: varchar("avatar_id").notNull().references(() => avatars.id),
  conceptId: varchar("concept_id").notNull().references(() => concepts.id),
  relevanceScore: decimal("relevance_score", { precision: 3, scale: 2 }).notNull(), // 0.00 to 1.00
  matchedHooks: text("matched_hooks").array().notNull().default(sql`ARRAY[]::text[]`),
  matchedElements: text("matched_elements").array().notNull().default(sql`ARRAY[]::text[]`),
  rationale: text("rationale").notNull(), // why this concept fits this avatar
  status: text("status").notNull().default("linked"), // linked, approved, rejected
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertAvatarConceptSchema = createInsertSchema(avatarConcepts).omit({
  id: true,
  createdAt: true
});

export type InsertAvatarConcept = z.infer<typeof insertAvatarConceptSchema>;
export type AvatarConcept = typeof avatarConcepts.$inferSelect;

// Meta Ad Account schema
export const adAccounts = pgTable("ad_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  metaAccountId: text("meta_account_id").notNull().unique(),
  accountName: text("account_name").notNull(),
  currency: text("currency").notNull().default("USD"),
  timezone: text("timezone").notNull().default("America/New_York"),
  spend: decimal("spend", { precision: 10, scale: 2 }).notNull().default("0"),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).notNull().default("0"),
  roas: decimal("roas", { precision: 5, scale: 2 }).notNull().default("0"),
  cpm: decimal("cpm", { precision: 8, scale: 2 }).notNull().default("0"),
  ctr: decimal("ctr", { precision: 5, scale: 2 }).notNull().default("0"),
  cpc: decimal("cpc", { precision: 8, scale: 2 }).notNull().default("0"),
  impressions: integer("impressions").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  lastSyncAt: timestamp("last_sync_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertAdAccountSchema = createInsertSchema(adAccounts).omit({
  id: true,
  createdAt: true
});

export type InsertAdAccount = z.infer<typeof insertAdAccountSchema>;
export type AdAccount = typeof adAccounts.$inferSelect;

// Campaigns schema
export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  metaCampaignId: text("meta_campaign_id").notNull().unique(),
  adAccountId: varchar("ad_account_id").notNull().references(() => adAccounts.id),
  campaignName: text("campaign_name").notNull(),
  objective: text("objective").notNull(), // CONVERSIONS, REACH, etc.
  status: text("status").notNull(), // ACTIVE, PAUSED, etc.
  spend: decimal("spend", { precision: 10, scale: 2 }).notNull().default("0"),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).notNull().default("0"),
  roas: decimal("roas", { precision: 5, scale: 2 }).notNull().default("0"),
  cpm: decimal("cpm", { precision: 8, scale: 2 }).notNull().default("0"),
  ctr: decimal("ctr", { precision: 5, scale: 2 }).notNull().default("0"),
  cpc: decimal("cpc", { precision: 8, scale: 2 }).notNull().default("0"),
  impressions: integer("impressions").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  purchases: integer("purchases").notNull().default(0),
  trend: text("trend").notNull().default("stable"), // up, down, stable
  dailyBudget: decimal("daily_budget", { precision: 10, scale: 2 }),
  lifetimeBudget: decimal("lifetime_budget", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true
});

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

// Ad Sets schema
export const adSets = pgTable("ad_sets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  metaAdSetId: text("meta_ad_set_id").notNull().unique(),
  campaignId: varchar("campaign_id").notNull().references(() => campaigns.id),
  adSetName: text("ad_set_name").notNull(),
  status: text("status").notNull(), // ACTIVE, PAUSED, etc.
  targeting: jsonb("targeting").notNull(), // age, gender, interests, etc.
  spend: decimal("spend", { precision: 10, scale: 2 }).notNull().default("0"),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).notNull().default("0"),
  roas: decimal("roas", { precision: 5, scale: 2 }).notNull().default("0"),
  cpm: decimal("cpm", { precision: 8, scale: 2 }).notNull().default("0"),
  ctr: decimal("ctr", { precision: 5, scale: 2 }).notNull().default("0"),
  cpc: decimal("cpc", { precision: 8, scale: 2 }).notNull().default("0"),
  impressions: integer("impressions").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  purchases: integer("purchases").notNull().default(0),
  dailyBudget: decimal("daily_budget", { precision: 10, scale: 2 }),
  bidStrategy: text("bid_strategy").notNull().default("LOWEST_COST_WITHOUT_CAP"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertAdSetSchema = createInsertSchema(adSets).omit({
  id: true,
  createdAt: true
});

export type InsertAdSet = z.infer<typeof insertAdSetSchema>;
export type AdSet = typeof adSets.$inferSelect;

// Ads schema
export const ads = pgTable("ads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  metaAdId: text("meta_ad_id").notNull().unique(),
  adSetId: varchar("ad_set_id").notNull().references(() => adSets.id),
  adName: text("ad_name").notNull(),
  status: text("status").notNull(), // ACTIVE, PAUSED, etc.
  creativeType: text("creative_type").notNull(), // VIDEO, IMAGE, CAROUSEL, etc.
  creativeUrl: text("creative_url"),
  adCopy: text("ad_copy"),
  headline: text("headline"),
  description: text("description"),
  spend: decimal("spend", { precision: 10, scale: 2 }).notNull().default("0"),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).notNull().default("0"),
  roas: decimal("roas", { precision: 5, scale: 2 }).notNull().default("0"),
  cpm: decimal("cpm", { precision: 8, scale: 2 }).notNull().default("0"),
  ctr: decimal("ctr", { precision: 5, scale: 2 }).notNull().default("0"),
  cpc: decimal("cpc", { precision: 8, scale: 2 }).notNull().default("0"),
  impressions: integer("impressions").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  purchases: integer("purchases").notNull().default(0),
  hookRate: decimal("hook_rate", { precision: 5, scale: 2 }),
  thumbstopRate: decimal("thumbstop_rate", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertAdSchema = createInsertSchema(ads).omit({
  id: true,
  createdAt: true
});

export type InsertAd = z.infer<typeof insertAdSchema>;
export type Ad = typeof ads.$inferSelect;

// AI Insights and Recommendations schema
export const aiInsights = pgTable("ai_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: text("entity_type").notNull(), // campaign, adset, ad, account
  entityId: varchar("entity_id").notNull(), // ID of the related entity
  insightType: text("insight_type").notNull(), // scale, pause, creative-refresh, budget-increase, etc.
  priority: text("priority").notNull(), // high, medium, low
  recommendation: text("recommendation").notNull(),
  reasoning: text("reasoning").notNull(), // detailed AI reasoning
  dataAnalysis: jsonb("data_analysis").notNull(), // supporting metrics and analysis
  action: text("action").notNull(), // scale, pause, wait, optimize
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(), // 0-100
  projectedImpact: jsonb("projected_impact").notNull(), // expected outcomes
  status: text("status").notNull().default("pending"), // pending, approved, rejected, implemented
  feedback: text("feedback"),
  implementedAt: timestamp("implemented_at"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertAiInsightSchema = createInsertSchema(aiInsights).omit({
  id: true,
  createdAt: true,
  implementedAt: true
});

export type InsertAiInsight = z.infer<typeof insertAiInsightSchema>;
export type AiInsight = typeof aiInsights.$inferSelect;

// Metrics Time Series schema for historical data
export const metricsTimeSeries = pgTable("metrics_time_series", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: text("entity_type").notNull(), // account, campaign, adset, ad
  entityId: varchar("entity_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  spend: decimal("spend", { precision: 10, scale: 2 }).notNull().default("0"),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).notNull().default("0"),
  roas: decimal("roas", { precision: 5, scale: 2 }).notNull().default("0"),
  cpm: decimal("cpm", { precision: 8, scale: 2 }).notNull().default("0"),
  ctr: decimal("ctr", { precision: 5, scale: 2 }).notNull().default("0"),
  cpc: decimal("cpc", { precision: 8, scale: 2 }).notNull().default("0"),
  impressions: integer("impressions").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  purchases: integer("purchases").notNull().default(0),
  hookRate: decimal("hook_rate", { precision: 5, scale: 2 }),
  thumbstopRate: decimal("thumbstop_rate", { precision: 5, scale: 2 }),
  breakdown: jsonb("breakdown"), // platform_placement, country, etc.
  createdAt: timestamp("created_at").defaultNow()
});

export const insertMetricsTimeSeriesSchema = createInsertSchema(metricsTimeSeries).omit({
  id: true,
  createdAt: true
});

export type InsertMetricsTimeSeries = z.infer<typeof insertMetricsTimeSeriesSchema>;
export type MetricsTimeSeries = typeof metricsTimeSeries.$inferSelect;

// Weekly Observations schema
export const weeklyObservations = pgTable("weekly_observations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  weekStartDate: timestamp("week_start_date").notNull(),
  title: text("title").notNull(),
  observation: text("observation").notNull(),
  keyFindings: text("key_findings").array().notNull(),
  accountMetrics: jsonb("account_metrics").notNull(), // overall account performance
  topPerformers: jsonb("top_performers").notNull(), // best performing campaigns/ads
  concerns: jsonb("concerns").notNull(), // areas needing attention
  recommendations: text("recommendations").array().notNull(),
  confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertWeeklyObservationSchema = createInsertSchema(weeklyObservations).omit({
  id: true,
  createdAt: true
});

export type InsertWeeklyObservation = z.infer<typeof insertWeeklyObservationSchema>;
export type WeeklyObservation = typeof weeklyObservations.$inferSelect;

// Platform Settings schema
export const platformSettings = pgTable("platform_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  provenConceptsPercentage: integer("proven_concepts_percentage").notNull().default(80), // 0-100
  weeklyBriefsVolume: integer("weekly_briefs_volume").notNull().default(5), // 1-20
  subscriptionTier: text("subscription_tier").notNull().default("free"), // free, pro, enterprise
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertPlatformSettingsSchema = createInsertSchema(platformSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const updatePlatformSettingsSchema = z.object({
  provenConceptsPercentage: z.number().min(0).max(100).optional(),
  weeklyBriefsVolume: z.number().min(1).max(200).optional(),
  subscriptionTier: z.enum(["free", "pro", "enterprise"]).optional()
});

export type InsertPlatformSettings = z.infer<typeof insertPlatformSettingsSchema>;
export type UpdatePlatformSettings = z.infer<typeof updatePlatformSettingsSchema>;
export type PlatformSettings = typeof platformSettings.$inferSelect;
