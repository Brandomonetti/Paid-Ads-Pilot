import { BarChart3 } from "lucide-react";
import { LockedAgentPage } from "./locked-agent-page";

export function PerformanceAgentDashboard() {
  return (
    <LockedAgentPage
      agentName="Performance Agent"
      description="Analyze ad performance and get AI-powered optimization recommendations"
      icon={BarChart3}
    />
  );
}
