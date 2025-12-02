import { Switch, Route, useLocation } from "wouter";
import { CSSProperties } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { Dashboard } from "@/components/dashboard";
import CustomerIntelligenceHub from "@/components/customer-intelligence-hub";
import { CreativeResearchCenter } from "@/components/creative-research-center";
import { PerformanceAgentDashboard } from "@/components/performance-agent-dashboard";
import { CreativeBriefAgentDashboard } from "@/components/creative-brief-agent-dashboard";
import { KnowledgeBaseDashboard } from "@/components/knowledge-base-dashboard";
import { SettingsDashboard } from "@/components/settings-dashboard";
import { Button } from "@/components/ui/button";
import { Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import { LandingPage } from "@/components/landing-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/knowledge-base" component={KnowledgeBaseDashboard} />
      <Route path="/research/customer-intelligence" component={CustomerIntelligenceHub} />
      <Route path="/research/creative-concepts" component={CreativeResearchCenter} />
      <Route path="/performance" component={PerformanceAgentDashboard} />
      <Route path="/creative-brief" component={CreativeBriefAgentDashboard} />
      <Route path="/settings" component={SettingsDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Custom sidebar width for the Creative Strategist AI
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  // Show LandingPage when not authenticated, full layout when authenticated
  if (isLoading || !isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <SidebarProvider style={style as CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <Header />
          <main className="flex-1 overflow-auto bg-background">
            <Router />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function Header() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return null;
  
  return (
    <header className="flex items-center justify-between p-4 border-b border-border bg-background">
      <SidebarTrigger data-testid="button-sidebar-toggle" />
      <div className="flex items-center gap-2">
        {user ? (
          <span className="text-sm text-muted-foreground" data-testid="text-user-email">
            {(user as any).email || `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() || 'User'}
          </span>
        ) : null}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setLocation("/settings")}
          data-testid="button-header-settings"
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.location.href = "/api/logout"}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}

export default App;
