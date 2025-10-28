import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, jsonb, timestamp, index, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  metaAccessToken: text("meta_access_token"), // User's Meta Ads access token
  metaAccountId: text("meta_account_id"), // User's primary Meta account ID
  metaConnectedAt: timestamp("meta_connected_at"), // When Meta was connected
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Customer Intelligence Hub - Insights schema
export const insights = pgTable("insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Insight Core Data
  title: text("title").notNull(), // Key finding in one sentence
  category: text("category").notNull(), // pain-point, desire, objection, trigger
  rawQuote: text("raw_quote").notNull(), // Direct customer quote
  summary: text("summary").notNull(), // AI summary of the insight
  observations: text("observations").array().notNull(), // Key learnings
  marketingAngles: text("marketing_angles").array().notNull(), // How to use this in ads
  
  // Source Information
  sourceId: varchar("source_id").references(() => sources.id),
  sourcePlatform: text("source_platform").notNull(), // reddit, amazon, youtube, facebook, etc.
  sourceUrl: text("source_url").notNull(), // Direct link to original
  sourceType: text("source_type").notNull(), // review, comment, post, thread, article
  
  // Engagement & Quality Metrics
  engagementScore: integer("engagement_score").notNull().default(0), // upvotes, likes, etc.
  sentimentScore: decimal("sentiment_score", { precision: 3, scale: 2 }), // -1.00 to 1.00
  confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }).notNull().default("0.75"), // AI confidence
  
  // Metadata
  authorInfo: text("author_info"), // Username or profile info
  discussionContext: text("discussion_context"), // What thread/product/video this was on
  relatedKeywords: text("related_keywords").array().notNull().default(sql`ARRAY[]::text[]`),
  
  // Status & Tracking
  status: text("status").notNull().default("pending"), // pending, approved, rejected, archived
  feedback: text("feedback"),
  usedInCampaign: boolean("used_in_campaign").notNull().default(false),
  
  discoveredAt: timestamp("discovered_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertInsightSchema = createInsertSchema(insights).omit({
  id: true,
  createdAt: true,
  discoveredAt: true
});

export type InsertInsight = z.infer<typeof insertInsightSchema>;
export type Insight = typeof insights.$inferSelect;

// Sources schema - tracks discovered platforms and URLs
export const sources = pgTable("sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Source Details
  platform: text("platform").notNull(), // reddit, amazon, youtube, facebook, forum, article
  sourceType: text("source_type").notNull(), // subreddit, product, video, group, thread, blog
  url: text("url").notNull().unique(),
  title: text("title").notNull(), // Name of subreddit, product title, video title, etc.
  description: text("description"),
  
  // Tracking Metrics
  insightsDiscovered: integer("insights_discovered").notNull().default(0),
  lastChecked: timestamp("last_checked").defaultNow(),
  checkFrequency: text("check_frequency").notNull().default("weekly"), // daily, weekly, monthly
  
  // Quality Metrics
  averageEngagement: decimal("average_engagement", { precision: 10, scale: 2 }),
  relevanceScore: decimal("relevance_score", { precision: 3, scale: 2 }).notNull().default("0.50"),
  
  // Status
  status: text("status").notNull().default("active"), // active, paused, archived
  
  discoveredAt: timestamp("discovered_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertSourceSchema = createInsertSchema(sources).omit({
  id: true,
  createdAt: true,
  discoveredAt: true
});

export type InsertSource = z.infer<typeof insertSourceSchema>;
export type Source = typeof sources.$inferSelect;

// Research Runs schema - tracks when research was performed
export const researchRuns = pgTable("research_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Run Details
  runType: text("run_type").notNull(), // manual, automated
  status: text("status").notNull().default("running"), // running, completed, failed
  
  // Discovery Results
  platformsSearched: text("platforms_searched").array().notNull(), // [reddit, amazon, youtube, ...]
  sourcesDiscovered: integer("sources_discovered").notNull().default(0),
  insightsDiscovered: integer("insights_discovered").notNull().default(0),
  
  // Categorization Breakdown
  painPoints: integer("pain_points").notNull().default(0),
  desires: integer("desires").notNull().default(0),
  objections: integer("objections").notNull().default(0),
  triggers: integer("triggers").notNull().default(0),
  
  // Performance Metrics
  executionTime: integer("execution_time"), // milliseconds
  errorLog: text("error_log"),
  
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertResearchRunSchema = createInsertSchema(researchRuns).omit({
  id: true,
  createdAt: true,
  startedAt: true
});

export type InsertResearchRun = z.infer<typeof insertResearchRunSchema>;
export type ResearchRun = typeof researchRuns.$inferSelect;

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

// Knowledge Base schema
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

// Generated Scripts schema for AI self-learning system
export const generatedScripts = pgTable("generated_scripts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Script Details
  title: text("title").notNull(),
  duration: text("duration").notNull(), // "15s", "30s", "45s", "60s"
  scriptType: text("script_type").notNull(), // "ugc", "testimonial", "demo", "story"
  summary: text("summary").notNull(),
  
  // Script Content
  content: jsonb("content").notNull(), // avatar, marketingAngle, awarenessStage, problem, solution, fullScript, cta
  sourceResearch: jsonb("source_research").notNull(), // avatarName, conceptTitle, relevanceScore
  
  // Performance Tracking for Self-Learning
  status: text("status").notNull().default("pending"), // pending, approved, rejected, tested
  feedback: text("feedback"),
  performance: jsonb("performance"), // hookRate, completionRate, ctr when tested
  
  // Self-Learning Analytics
  usedInCampaign: boolean("used_in_campaign").notNull().default(false),
  campaignResults: jsonb("campaign_results"), // actual performance data from ads
  
  // Generation Context for Learning
  generationContext: jsonb("generation_context").notNull(), // Knowledge Base state, parameters used
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertGeneratedScriptSchema = createInsertSchema(generatedScripts).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const updateGeneratedScriptSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "tested"]).optional(),
  feedback: z.string().optional(),
  performance: z.object({
    hookRate: z.number().optional(),
    completionRate: z.number().optional(),
    ctr: z.number().optional()
  }).optional(),
  usedInCampaign: z.boolean().optional(),
  campaignResults: z.any().optional() // Performance data from Meta/other platforms
});

export type InsertGeneratedScript = z.infer<typeof insertGeneratedScriptSchema>;
export type UpdateGeneratedScript = z.infer<typeof updateGeneratedScriptSchema>;
export type GeneratedScript = typeof generatedScripts.$inferSelect;

// ============================================================================
// CREATIVE RESEARCH CENTER SCHEMA (Avatar & Concept System)
// ============================================================================

// Avatars schema - customer personas for creative research
export const avatars = pgTable("avatars", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Avatar Core Details
  name: text("name").notNull(),
  ageRange: text("age_range").notNull(),
  demographics: text("demographics").notNull(),
  psychographics: text("psychographics").notNull(),
  painPoints: text("pain_points").array().notNull(),
  desires: text("desires").array().notNull(),
  objections: text("objections").array().notNull(),
  triggers: text("triggers").array().notNull(),
  hooks: text("hooks").array().notNull(),
  
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

export type InsertAvatar = z.infer<typeof insertAvatarSchema>;
export type Avatar = typeof avatars.$inferSelect;

// Concepts schema - viral social media posts for creative inspiration
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
  hooks: text("hooks").array().notNull().default(sql`'{}'::text[]`),
  
  // Engagement Metrics
  engagementScore: integer("engagement_score").notNull().default(0),
  likes: integer("likes"),
  comments: integer("comments"),
  shares: integer("shares"),
  views: integer("views"),
  engagementRate: decimal("engagement_rate", { precision: 5, scale: 2 }),
  
  // Metadata
  status: text("status").notNull().default("discovered"), // discovered, tested, proven
  
  createdAt: timestamp("created_at").defaultNow(),
  discoveredAt: timestamp("discovered_at").defaultNow()
});

export const insertConceptSchema = createInsertSchema(concepts).omit({
  id: true,
  createdAt: true,
  discoveredAt: true
});

export type InsertConcept = z.infer<typeof insertConceptSchema>;
export type Concept = typeof concepts.$inferSelect;

// Avatar-Concept Links schema - intelligent matching between avatars and concepts
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
