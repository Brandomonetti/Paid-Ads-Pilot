import { useState } from "react"
import { AgentCard } from "./agent-card"
import { PerformanceChart } from "./performance-chart"
import { AgentModal } from "./agent-modal"
import { Brain, FileText, BarChart3, Image, Zap, Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface AgentStatus {
  id: string
  status: "idle" | "running" | "completed"
  results?: { count: number; type: string }
}

export function Dashboard() {
  //todo: remove mock functionality
  const [agentStatuses, setAgentStatuses] = useState<Record<string, AgentStatus>>({
    research: { id: "research", status: "idle" },
    script: { id: "script", status: "completed", results: { count: 8, type: "scripts" } },
    performance: { id: "performance", status: "idle" },
    asset: { id: "asset", status: "idle" },
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

  //todo: remove mock functionality
  const mockResults = [
    {
      id: "1",
      title: "Busy Parent Avatar - Pain Point: Time Crunch",
      content: "Target: Working parents aged 28-45 struggling with meal prep\n\nPain Point: No time to cook healthy meals for family\n\nHooks:\n1. 'What if dinner could be ready in 10 minutes every night?'\n2. 'Stop feeling guilty about another takeout order'\n3. 'Your kids deserve better than processed food'\n\nFormat: Video testimonial with real parent",
      type: "angle" as const
    },
    {
      id: "2", 
      title: "Health-Conscious Millennial - Pain Point: Ingredient Quality",
      content: "Target: Health-focused millennials aged 25-35 in urban areas\n\nPain Point: Uncertain about food quality and sourcing\n\nHooks:\n1. 'Finally, know exactly what's in your food'\n2. 'Organic doesn't have to break the bank'\n3. 'Your body will thank you for this switch'\n\nFormat: Before/after transformation story",
      type: "angle" as const
    }
  ]

  const handleRunAgent = (agentId: string) => {
    setAgentStatuses(prev => ({
      ...prev,
      [agentId]: { ...prev[agentId], status: "running" }
    }))

    // Simulate agent processing
    setTimeout(() => {
      setAgentStatuses(prev => ({
        ...prev,
        [agentId]: { 
          ...prev[agentId], 
          status: "completed",
          results: { count: Math.floor(Math.random() * 10) + 3, type: getResultType(agentId) }
        }
      }))
      
      if (agentId === "research") {
        setSelectedAgent(agentId)
        setModalOpen(true)
      }
    }, 2000)
  }

  const getResultType = (agentId: string) => {
    switch (agentId) {
      case "research": return "angles"
      case "script": return "scripts"
      case "performance": return "insights"
      case "asset": return "templates"
      default: return "results"
    }
  }

  const agents = [
    {
      id: "research",
      title: "Research Agent",
      description: "Generate customer avatars and winning ad angles",
      icon: Brain,
    },
    {
      id: "script",
      title: "Script Agent", 
      description: "Create high-converting UGC video scripts",
      icon: FileText,
    },
    {
      id: "performance",
      title: "Performance Agent",
      description: "Analyze Meta ad performance and optimize campaigns",
      icon: BarChart3,
    },
    {
      id: "asset",
      title: "Asset Agent",
      description: "Find winning templates and B-roll inspiration",
      icon: Image,
    },
  ]

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Creative Strategist AI</h1>
          <p className="text-muted-foreground mt-1">
            Transform your marketing with AI-powered creative intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Meta Connected
          </Badge>
          <Button variant="outline" size="sm" data-testid="button-settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Active Campaigns</CardDescription>
            <CardTitle className="text-2xl font-bold">12</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">3 pending optimization</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Generated Content</CardDescription>
            <CardTitle className="text-2xl font-bold">284</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Scripts, angles & assets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Avg. ROAS</CardDescription>
            <CardTitle className="text-2xl font-bold">4.2x</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-green-600">+12% vs last month</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Agents */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Zap className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">AI Agents</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              title={agent.title}
              description={agent.description}
              icon={agent.icon}
              status={agentStatuses[agent.id].status}
              results={agentStatuses[agent.id].results}
              onRun={() => handleRunAgent(agent.id)}
            />
          ))}
        </div>
      </div>

      {/* Performance Overview */}
      <div>
        <PerformanceChart />
      </div>

      {/* Agent Results Modal */}
      <AgentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        agentType={selectedAgent as any}
        title={agents.find(a => a.id === selectedAgent)?.title || ""}
        results={mockResults}
      />
    </div>
  )
}