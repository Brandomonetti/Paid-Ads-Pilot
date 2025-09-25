import { Brain, BarChart3, FileText, Settings, Plus, Zap, Lightbulb } from "lucide-react"
import logoPath from "@assets/b52CH3jEBgKI03ajauLebDVQ3o_1758796736572.webp"
import { Link, useLocation } from "wouter"
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
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const agents = [
  {
    title: "Research Agent",
    url: "/research",
    icon: Brain,
    description: "Generate angles & avatars"
  },
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
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const [location] = useLocation()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-6 pb-4">
        <div className="flex items-center justify-center">
          <img src={logoPath} alt="Creative Strategist AI" className="h-16 w-auto max-w-full object-contain" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-2">
        <SidebarGroup className="mb-6">
          <SidebarGroupLabel className="text-sm font-semibold text-foreground/80 mb-3">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-nav-${item.title.toLowerCase()}`}>
                      <item.icon className="h-4 w-4" />
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
              {agents.map((agent) => (
                <SidebarMenuItem key={agent.title}>
                  <SidebarMenuButton asChild isActive={location === agent.url}>
                    <Link href={agent.url} data-testid={`link-agent-${agent.title.toLowerCase().replace(' ', '-')}`}>
                      <agent.icon className="h-4 w-4" />
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
            <AvatarImage src="" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">john@acmecorp.com</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}