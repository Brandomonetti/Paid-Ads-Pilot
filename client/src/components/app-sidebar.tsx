import { Brain, BarChart3, FileText, Settings, Plus, Zap, Lightbulb, Database, Users, Sparkles, ChevronRight } from "lucide-react"
import logoPath from "@assets/b52CH3jEBgKI03ajauLebDVQ3o_1758796736572.webp"
import { Link, useLocation } from "wouter"
import { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/useAuth"

const researchSubsections = [
  {
    title: "Customer Research Center",
    url: "/research/customer-intelligence",
    icon: Users,
    description: "Mine customer insights"
  },
  {
    title: "Creative Research Center",
    url: "/research/creative-concepts",
    icon: Sparkles,
    description: "Find viral ad concepts"
  },
]

const otherAgents = [
  {
    title: "Script Agent", 
    url: "/script",
    icon: FileText,
    description: "Create UGC scripts"
  },
  {
    title: "Creative Brief Agent",
    url: "/creative-brief", 
    icon: Lightbulb,
    description: "Generate creative briefs"
  },
  {
    title: "Performance Agent",
    url: "/performance", 
    icon: BarChart3,
    description: "Analyze ad performance"
  },
]

const navigation = [
  {
    title: "Dashboard",
    url: "/",
    icon: Zap,
  },
  {
    title: "Knowledge Base",
    url: "/knowledge-base",
    icon: Database,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const [location] = useLocation()
  const { user } = useAuth()
  const [isResearchOpen, setIsResearchOpen] = useState(true)

  // Check if any research subsection is active
  const isResearchActive = researchSubsections.some(sub => location === sub.url)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-6 pb-4">
        <div className="flex items-center justify-center">
          <img src={logoPath} alt="Creative Strategist AI" className="h-16 w-auto max-w-full object-contain" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-2 group-data-[collapsible=icon]:px-2">
        <SidebarGroup className="mb-6">
          <SidebarGroupLabel className="text-sm font-semibold text-foreground/80 mb-3">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-nav-${item.title.toLowerCase()}`}>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 border border-primary/20 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:h-9">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <div className="flex items-center justify-between gap-2 mb-3">
            <SidebarGroupLabel className="text-sm font-semibold text-foreground/80">AI Agents</SidebarGroupLabel>
            <Button size="icon" variant="ghost" data-testid="button-add-agent">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3">
              {/* Research Agent with collapsible subsections */}
              <Collapsible open={isResearchOpen} onOpenChange={setIsResearchOpen} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton data-testid="link-agent-research-agent" className={isResearchActive ? "bg-sidebar-accent" : ""}>
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:h-9">
                        <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400 group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:w-4" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span>Research Agent</span>
                        <span className="text-xs text-muted-foreground">Customer & creative research</span>
                      </div>
                      <ChevronRight className={`ml-auto transition-transform duration-200 h-4 w-4 ${isResearchOpen ? 'rotate-90' : ''}`} />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {researchSubsections.map((subsection) => {
                        const Icon = subsection.icon
                        return (
                          <SidebarMenuSubItem key={subsection.title}>
                            <SidebarMenuSubButton asChild isActive={location === subsection.url}>
                              <Link href={subsection.url} data-testid={`link-subsection-${subsection.title.toLowerCase().replace(/\s+/g, '-')}`}>
                                <Icon className="h-4 w-4" />
                                <span>{subsection.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Other agents */}
              {otherAgents.map((agent) => (
                <SidebarMenuItem key={agent.title}>
                  <SidebarMenuButton asChild isActive={location === agent.url}>
                    <Link href={agent.url} data-testid={`link-agent-${agent.title.toLowerCase().replace(' ', '-')}`}>
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:h-9">
                        <agent.icon className="h-5 w-5 text-blue-600 dark:text-blue-400 group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span>{agent.title}</span>
                        <span className="text-xs text-muted-foreground">{agent.description}</span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-3 border-t border-border/50">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.profileImageUrl || ""} />
            <AvatarFallback>
              {user?.firstName && user?.lastName 
                ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                : user?.email?.[0]?.toUpperCase() || "U"
              }
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user?.email || "User"
              }
            </p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
