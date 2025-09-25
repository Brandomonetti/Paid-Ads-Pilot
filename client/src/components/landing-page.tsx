import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Zap, TrendingUp, Users } from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Brain className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold text-foreground">
              Creative Strategist AI
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The ultimate AI-powered platform for eCommerce brands to generate winning ad creative, 
            analyze performance, and scale campaigns with 8-figure level strategic insights.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login"
            className="text-lg px-8 py-6"
          >
            Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="hover-elevate">
            <CardHeader className="text-center">
              <Brain className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Research Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                AI-powered audience research and creative concept discovery from winning campaigns.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader className="text-center">
              <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Script Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Generate high-converting UGC scripts with psychology-driven frameworks and proven hooks.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader className="text-center">
              <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Performance Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Advanced analytics and AI insights to optimize campaign performance and scaling decisions.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader className="text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Creative Brief Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Comprehensive creative briefs with strategic recommendations for your marketing team.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Key Benefits */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-8">Why Creative Strategist AI?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-lg font-semibold mb-2">Self-Learning System</h3>
              <p className="text-muted-foreground">
                Our AI continuously learns from performance data to improve recommendations and creative outputs.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">8-Figure Expertise</h3>
              <p className="text-muted-foreground">
                Built with insights from campaigns that have generated millions in revenue across industries.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Complete Workflow</h3>
              <p className="text-muted-foreground">
                From research to creative briefs, manage your entire creative strategy in one platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}