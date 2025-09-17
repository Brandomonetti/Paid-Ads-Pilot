import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { Dashboard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/research" component={() => <div className="p-6"><h1 className="text-2xl font-bold">Research Agent</h1><p className="text-muted-foreground">Advanced customer research and angle generation coming soon.</p></div>} />
      <Route path="/script" component={() => <div className="p-6"><h1 className="text-2xl font-bold">Script Agent</h1><p className="text-muted-foreground">UGC script generation and optimization coming soon.</p></div>} />
      <Route path="/performance" component={() => <div className="p-6"><h1 className="text-2xl font-bold">Performance Agent</h1><p className="text-muted-foreground">Meta ad performance analysis coming soon.</p></div>} />
      <Route path="/assets" component={() => <div className="p-6"><h1 className="text-2xl font-bold">Asset Agent</h1><p className="text-muted-foreground">Creative asset and template discovery coming soon.</p></div>} />
      <Route path="/settings" component={() => <div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p className="text-muted-foreground">Configure your AI agents and integrations.</p></div>} />
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
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1">
                <header className="flex items-center justify-between p-4 border-b border-border bg-background">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <Button variant="outline" size="sm" data-testid="button-header-settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </header>
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

export default App;
