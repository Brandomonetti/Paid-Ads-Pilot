import { 
  type User, type InsertUser,
  type Avatar, type InsertAvatar,
  type Concept, type InsertConcept,
  type AvatarConcept, type InsertAvatarConcept
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private avatars: Map<string, Avatar>;
  private concepts: Map<string, Concept>;
  private avatarConcepts: Map<string, AvatarConcept>;

  constructor() {
    this.users = new Map();
    this.avatars = new Map();
    this.concepts = new Map();
    this.avatarConcepts = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
}

export const storage = new MemStorage();
