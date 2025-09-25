import { useState } from "react"
import { AgentCard } from "./agent-card"
import { PerformanceChart } from "./performance-chart"
import { AgentModal } from "./agent-modal"
import { Brain, FileText, BarChart3, Image, Zap, Settings, DollarSign, TrendingUp, Target, Users, AlertTriangle, Calendar, Clock, CheckCircle2 } from "lucide-react"
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
            Driving revenue with AI-powered creative intelligence
          </p>
          <div className="flex items-center gap-4 mt-3">
            <div className="text-sm text-muted-foreground">Last updated: 2 minutes ago</div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Meta Connected
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" data-testid="button-settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* North Star Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Performance Overview (Last 30 Days)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Revenue (AI-Generated Ads)
              </CardDescription>
              <CardTitle className="text-2xl font-bold" data-testid="text-revenue">$47,892</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +18.3% vs previous month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">ROAS (AI vs Manual)</CardDescription>
              <CardTitle className="text-2xl font-bold" data-testid="text-roas">4.8x</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-green-600">+1.2x better than manual ads</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Cost Per Acquisition</CardDescription>
              <CardTitle className="text-2xl font-bold" data-testid="text-cpa">$23.40</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-green-600">-31% vs manual campaigns</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Conversion Rate</CardDescription>
              <CardTitle className="text-2xl font-bold" data-testid="text-conversion-rate">3.4%</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-green-600">+0.8% vs baseline</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Campaign Performance (Last 7 Days) */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Recent Launches (Last 7 Days)
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">New Concepts Launched</CardDescription>
              <CardTitle className="text-2xl font-bold" data-testid="text-new-concepts">8</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">5 winning, 2 testing, 1 failed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">7-Day Revenue</CardDescription>
              <CardTitle className="text-2xl font-bold" data-testid="text-7day-revenue">$12,340</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-green-600">Best week this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Best Performing Angle</CardDescription>
              <CardTitle className="text-lg font-bold" data-testid="text-best-angle">"Time-Saving Parent"</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-green-600">6.2x ROAS, $3,840 revenue</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Agent Intelligence Summary */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Agent Intelligence Summary
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Agent Performance (30 Days)</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium" data-testid="text-research-agent">Research Agent</p>
                    <p className="text-xs text-muted-foreground">92% success rate</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium" data-testid="text-script-agent">Script Agent</p>
                    <p className="text-xs text-muted-foreground">87% success rate</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium" data-testid="text-performance-agent">Performance Agent</p>
                    <p className="text-xs text-muted-foreground">94% accuracy</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                    <Image className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium" data-testid="text-creative-agent">Creative Brief Agent</p>
                    <p className="text-xs text-muted-foreground">89% success rate</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Active
                </Badge>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Quick Actions</h3>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline" data-testid="button-run-research">
                <Brain className="h-4 w-4 mr-2" />
                Generate New Customer Avatars
              </Button>
              <Button className="w-full justify-start" variant="outline" data-testid="button-run-script">
                <FileText className="h-4 w-4 mr-2" />
                Create UGC Scripts
              </Button>
              <Button className="w-full justify-start" variant="outline" data-testid="button-analyze-performance">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analyze Current Performance
              </Button>
              <Button className="w-full justify-start" variant="outline" data-testid="button-generate-brief">
                <Image className="h-4 w-4 mr-2" />
                Generate Creative Brief
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Insights */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          Actionable Insights
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-yellow-200 dark:border-yellow-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                Campaigns Needing Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <div>
                    <p className="text-sm font-medium" data-testid="text-campaign-alert">"Busy Mom Kitchen" Campaign</p>
                    <p className="text-xs text-muted-foreground">CTR dropped 0.8% yesterday</p>
                  </div>
                  <Button size="sm" variant="outline" data-testid="button-fix-campaign">
                    Fix
                  </Button>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <div>
                    <p className="text-sm font-medium">"Health Conscious" Angle</p>
                    <p className="text-xs text-muted-foreground">Ad fatigue detected - refresh needed</p>
                  </div>
                  <Button size="sm" variant="outline" data-testid="button-refresh-creative">
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                Optimization Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <div>
                    <p className="text-sm font-medium" data-testid="text-budget-opportunity">Budget Reallocation</p>
                    <p className="text-xs text-muted-foreground">Move $500/day to winning angles</p>
                  </div>
                  <Button size="sm" variant="outline" data-testid="button-reallocate-budget">
                    Apply
                  </Button>
                </div>
                <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <div>
                    <p className="text-sm font-medium">Audience Expansion</p>
                    <p className="text-xs text-muted-foreground">Scale successful lookalike by 20%</p>
                  </div>
                  <Button size="sm" variant="outline" data-testid="button-expand-audience">
                    Scale
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Creative Pipeline */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Creative Pipeline
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                In Production
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">3 UGC videos being filmed</div>
                <div className="text-xs text-muted-foreground">2 static ads in design</div>
                <div className="text-xs text-muted-foreground">1 carousel being assembled</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                Launching This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">"Time-Pressed Professional" angle</div>
                <div className="text-xs text-muted-foreground">"Weekend Warrior" UGC campaign</div>
                <div className="text-xs text-muted-foreground">Holiday season prep creatives</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Ready to Launch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">"Budget-Conscious Families" (A/B test ready)</div>
                <div className="text-xs text-muted-foreground">"Eco-Friendly Choice" messaging test</div>
                <Button size="sm" className="w-full mt-2" data-testid="button-launch-ready">
                  Launch All
                </Button>
              </div>
            </CardContent>
          </Card>
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