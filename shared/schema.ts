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
