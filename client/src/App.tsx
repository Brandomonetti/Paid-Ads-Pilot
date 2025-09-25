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
import { ResearchAgentDashboard } from "@/components/research-agent-dashboard";
import { ScriptAgentDashboard } from "@/components/script-agent-dashboard";
import { PerformanceAgentDashboard } from "@/components/performance-agent-dashboard";
import { CreativeBriefAgentDashboard } from "@/components/creative-brief-agent-dashboard";
import { KnowledgeBaseDashboard } from "@/components/knowledge-base-dashboard";
import { SettingsDashboard } from "@/components/settings-dashboard";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/knowledge-base" component={KnowledgeBaseDashboard} />
      <Route path="/research" component={ResearchAgentDashboard} />
      <Route path="/script" component={ScriptAgentDashboard} />
      <Route path="/performance" component={PerformanceAgentDashboard} />
      <Route path="/creative-brief" component={CreativeBriefAgentDashboard} />
      <Route path="/settings" component={SettingsDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Custom sidebar width for the Creative Strategist AI
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
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
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function Header() {
  const [location, setLocation] = useLocation();
  
  return (
    <header className="flex items-center justify-between p-4 border-b border-border bg-background">
      <SidebarTrigger data-testid="button-sidebar-toggle" />
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setLocation("/settings")}
        data-testid="button-header-settings"
      >
        <Settings className="h-4 w-4 mr-2" />
        Settings
      </Button>
    </header>
  );
}

export default App;
