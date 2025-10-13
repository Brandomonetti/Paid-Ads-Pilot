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

**Schema Structure:**
- User authentication table with UUID primary keys
- Prepared for additional tables for projects, agents, and content generation
- Zod integration for runtime type validation
- Database migration support through Drizzle Kit

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
- **Deferred Upload Pattern**: Files are stored locally as "pending" until explicitly uploaded via Next button
- **Category-based Organization**: Files organized by category keys in JSONB structure: `{"category-key": [{name, url}]}`
- **File Categories**: brand-guidelines, customer-feedback, market-research, competitor-analysis, competitor-ads, ad-data, analytics, product-photos, lifestyle-images, video-content
- **Upload Flow**: 
  1. User selects files → stored locally as "pending" (shown with yellow badge)
  2. User clicks "Next" → all pending files upload to Supabase in parallel
  3. After successful upload → form data saves to database
- **Deletion Flow**: Files marked for deletion (shown with red "Will delete" badge) are removed when Next is clicked

### Planned Integrations
- **OpenAI API**: For AI content generation across all agents
- **Meta Ads API**: For real-time performance data analysis
- **Third-party Asset Libraries**: For creative asset recommendations
- **Authentication Services**: For enhanced user management

The architecture is designed to be modular and scalable, allowing for easy addition of new AI agents and integration with external marketing platforms while maintaining a consistent user experience across the application.