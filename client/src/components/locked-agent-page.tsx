import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles } from "lucide-react";

interface LockedAgentPageProps {
  agentName: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function LockedAgentPage({ agentName, description, icon: Icon }: LockedAgentPageProps) {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="relative">
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-500/20">
            <Icon className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="absolute -bottom-2 -right-2 flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/20 border-2 border-yellow-500/40">
            <Lock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">{agentName}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            {description}
          </p>
        </div>

        <Card className="max-w-2xl w-full mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Coming Soon
            </CardTitle>
            <CardDescription>
              This agent is currently under development and will be available soon.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-6 space-y-3">
              <h3 className="font-semibold text-lg">What to expect:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>AI-powered content generation based on your research insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Automated workflows integrated with your knowledge base</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Real-time collaboration and iteration capabilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Export and share functionality for seamless team workflows</span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <p className="text-sm text-muted-foreground">
                In the meantime, continue building your knowledge base and discovering insights with the Research Agent.
              </p>
            </div>
          </CardContent>
        </Card>

        <Button
          size="lg"
          onClick={() => window.history.back()}
          className="mt-6"
          data-testid="button-go-back"
        >
          Go Back
        </Button>
      </div>
    </div>
  );
}
