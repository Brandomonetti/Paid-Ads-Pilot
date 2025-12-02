import { Lightbulb } from "lucide-react";
import { LockedAgentPage } from "./locked-agent-page";

export function CreativeBriefAgentDashboard() {
  return (
    <LockedAgentPage
      agentName="Creative Brief Agent"
      description="Generate creative briefs and scripts powered by your research insights"
      icon={Lightbulb}
    />
  );
}
