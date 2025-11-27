# Creative Strategist AI SaaS

## Overview

Creative Strategist AI is a full-stack SaaS web application designed for eCommerce brands to generate AI-powered marketing content. The platform serves as a centralized hub for creating ad angles, UGC scripts, performance analysis, and creative briefs through specialized AI agents. Built with a luxury dark-mode design inspired by Notion and Apple's aesthetic, the application provides an intuitive interface for marketing teams to streamline their creative workflow and optimize ad performance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application uses a **React-based single-page application** with TypeScript for type safety. The frontend is built using Vite as the build tool and bundler, providing fast development and optimized production builds. The routing is handled by **Wouter**, a lightweight client-side routing library.

**Component Structure:**
- Modular component architecture with reusable UI components
- Specialized dashboard components for each AI agent (Research, Script, Performance, Creative Brief)
- Shadcn/ui component library for consistent design system
- Custom component examples for development and testing

**State Management:**
- React Query (TanStack Query) for server state management and caching
- Local React state for UI interactions and form handling
- Context providers for theme management and sidebar state

**Styling System:**
- Tailwind CSS for utility-first styling
- Custom CSS variables for theme management
- Dark mode as the default theme with light mode support
- Design tokens following luxury SaaS aesthetics with Notion-inspired color palette

### Backend Architecture
The backend follows a **Node.js + Express** architecture with TypeScript. The server is structured as a REST API with modular routing and middleware support.

**API Structure:**
- Express.js server with JSON middleware and URL encoding support
- Modular route registration system
- Error handling middleware with proper HTTP status codes
- Development-specific logging and monitoring

**Data Layer:**
- Storage interface pattern with both in-memory and database implementations
- Database abstraction allowing for easy switching between storage backends
- Prepared for PostgreSQL integration with Drizzle ORM

**Development Environment:**
- Vite integration for hot module replacement in development
- Automatic error overlay for runtime error debugging
- Custom logging system with timestamps and source tracking

### Database Design
The application uses **Drizzle ORM** with PostgreSQL as the primary database. The schema is defined with type-safe table definitions and validation.

**MVP Schema (6 tables):**
- `sessions` - Required for Replit Auth session management
- `users` - User accounts with Replit Auth integration
- `knowledge_base` - Brand information, products, competitors, social media handles
- `avatars` - Customer profiles with demographics, pain points, hooks
- `concepts` - Viral social media content for creative inspiration
- `avatar_concepts` - Links between avatars and relevant concepts with relevance scores

**Schema Principles:**
- UUID primary keys for all tables
- Zod integration for runtime type validation
- No subscription/payment tables (deferred for future)

### Authentication & Security
**User Management:**
- Email/password authentication system
- Secure password storage and validation
- User session management
- Prepared for magic link authentication

### UI/UX Architecture
**Design System:**
- Comprehensive component library with consistent styling
- Responsive design with mobile-first approach
- Accessibility features built into UI components
- Interactive states and hover effects for premium feel

**Navigation:**
- Sidebar-based navigation with collapsible design
- Agent-based routing structure
- Breadcrumb navigation for complex workflows
- Mobile-responsive navigation patterns

**Agent Interface:**
- Card-based layout for AI agent interactions
- Modal system for displaying agent results
- Feedback collection system for continuous improvement
- Real-time status updates for agent processing

## External Dependencies

### Database & Storage
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database ORM with PostgreSQL dialect
- **Connect PG Simple**: PostgreSQL session store for Express sessions

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: React component library built on Radix UI primitives
- **Radix UI**: Accessible component primitives for React
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Utility for managing conditional CSS classes

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment tools and runtime error handling

### State Management & API
- **TanStack React Query**: Server state management and caching
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation and schema definition

### File Upload System
- **Supabase Storage**: Cloud storage for knowledge base files (brand guidelines, research, media assets)
- **Deferred Upload Pattern**: Files are stored locally as "pending" until explicitly uploaded via Save button
- **Category-based Organization**: Files organized by category keys in JSONB structure: `{"category-key": [{name, url}]}`
- **File Categories**: brand-guidelines, customer-feedback, market-research, competitor-analysis, competitor-ads, ad-data, analytics, product-photos, lifestyle-images, video-content
- **Upload Flow**: 
  1. User selects files → stored locally as "pending" (shown with yellow badge)
  2. User clicks "Save Changes" → all pending files upload to Supabase in parallel
  3. After successful upload → form data saves to database
- **Deletion Flow**: Files marked for deletion (shown with red "Will delete" badge) are removed when Save is clicked

### Save Workflow (Updated October 2025)
The knowledge base dashboard implements a separated navigation and save workflow:

**Button Behavior:**
- **Previous/Next buttons**: Navigation only, disabled when there are unsaved changes
- **Save button**: Handles file uploads and data persistence, disabled when there are no changes

**Change Detection:**
- Tracks unsaved changes by comparing current state with saved state using deep comparison
- Saved state is initialized to empty baseline for new users
- When existing data loads, both current and saved states are synchronized

**Save Flow:**
1. User makes changes to form fields or selects files
2. Save button becomes enabled, Previous/Next buttons become disabled
3. User clicks Save button
4. All pending files are uploaded to Supabase in parallel
5. Form data is saved to database via POST/PATCH request
6. Saved state is updated to match current state
7. Success toast notification is displayed
8. Save button becomes disabled, Previous/Next buttons become enabled

This workflow ensures users never lose data by preventing navigation when there are unsaved changes, while maintaining a clear separation between navigation and persistence actions.

### AI & Content Generation
- **OpenAI GPT-4**: For AI content generation across all agents
  - Generates 4-5 diverse customer avatars at once based on knowledge base data
  - Analyzes brand positioning, demographics, and pain points
  - Creates targeted messaging and hooks for each avatar segment
- **Scrape Creator API**: For fetching real-world creative concepts from social media platforms
  - Fetches trending ad concepts from Facebook, Instagram, and TikTok
  - Provides engagement metrics, creative elements, and performance data
  - Integration key stored securely in Replit Secrets

### Research Agent Workflow (Updated October 2025)
The Research Agent implements an intelligent three-phase workflow for generating customer avatars and matching them with high-performing social media concepts:

**Phase 1: Avatar Generation**
- User clicks "Generate Avatars" button
- System generates 4-5 diverse customer avatars using OpenAI GPT-4
- Avatars are created based on knowledge base data (brand guidelines, customer feedback, market research)
- Each avatar includes: name, age range, demographics, pain points, and hooks
- All avatars saved to database and displayed in UI

**Phase 2: Concept Discovery**
- User clicks "Find Concepts" button (enabled only after avatars exist)
- System fetches trending ad concepts from three platforms via Scrape Creator API:
  - Facebook ads (includes engagement metrics, creative elements)
  - Instagram ads (includes platform-specific performance data)
  - TikTok ads (includes viral metrics and creative hooks)
- Concepts saved to database with full metadata

**Phase 3: Intelligent Auto-Linking**
- System automatically scores concept-to-avatar relevance using weighted algorithm:
  - Hook Matching (40%): Compares concept hooks with avatar pain points
  - Demographics Alignment (30%): Matches target audience characteristics
  - Performance Metrics (30%): Factors in engagement scores and reach
- Top 2 concepts per platform automatically linked to each avatar (6 total links per avatar)
- Deduplication logic prevents duplicate links on repeated workflow runs
- Relevance scores stored for ranking and filtering in UI

**User Interface Features:**
- Avatar cards with expandable details and approval workflow
- Concept cards filtered by selected avatar, ranked by relevance score
- Visual indicators for platform type (Facebook, Instagram, TikTok)
- Manual linking/unlinking capability with feedback collection
- Toast notifications showing counts of generated avatars, fetched concepts, and created links

**Data Flow:**
1. Knowledge Base → Avatar Generation (OpenAI)
2. Avatar Hooks → Concept Fetching (Scrape Creator API)
3. Concepts + Avatars → Intelligent Scoring Algorithm
4. Scored Matches → Auto-Linking (with deduplication)
5. Linked Results → UI Display (filtered and ranked)

This automated workflow eliminates manual research time and provides data-driven insights for targeted marketing campaigns.

### Planned Integrations
- **Meta Ads API**: For real-time performance data analysis
- **Third-party Asset Libraries**: For creative asset recommendations
- **Authentication Services**: For enhanced user management

The architecture is designed to be modular and scalable, allowing for easy addition of new AI agents and integration with external marketing platforms while maintaining a consistent user experience across the application.