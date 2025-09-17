import { AgentCard } from '../agent-card'
import { Brain } from 'lucide-react'

export default function AgentCardExample() {
  return (
    <div className="p-8 bg-background space-y-4">
      <AgentCard
        title="Research Agent"
        description="Generate customer avatars and winning ad angles"
        icon={Brain}
        status="idle"
        onRun={() => console.log('Research agent triggered')}
      />
      <AgentCard
        title="Script Agent"
        description="Create high-converting UGC video scripts"
        icon={Brain}
        status="running"
        onRun={() => console.log('Script agent triggered')}
      />
      <AgentCard
        title="Performance Agent"
        description="Analyze Meta ad performance data"
        icon={Brain}
        status="completed"
        results={{ count: 8, type: "insights" }}
        onRun={() => console.log('Performance agent triggered')}
      />
    </div>
  )
}