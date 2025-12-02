import { useState } from "react"
import { AgentCard } from "./agent-card"
import { PerformanceChart } from "./performance-chart"
import { AgentModal } from "./agent-modal"
import { Brain, FileText, BarChart3, Image, Zap, Settings, DollarSign, TrendingUp, Target, Users, AlertTriangle, Calendar, Clock, CheckCircle2, Lock, Lightbulb, Sparkles } from "lucide-react"
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
            Discover customer insights and viral creative concepts with AI-powered research
          </p>
          <div className="flex items-center gap-4 mt-3">
            <div className="text-sm text-muted-foreground">Last updated: Just now</div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Research Active
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

      {/* Research Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Research Intelligence (Last 30 Days)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs flex items-center gap-1">
                <Users className="h-3 w-3" />
                Customer Insights Discovered
              </CardDescription>
              <CardTitle className="text-2xl font-bold" data-testid="text-insights">247</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +32 from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Creative Concepts Curated</CardDescription>
              <CardTitle className="text-2xl font-bold" data-testid="text-concepts">189</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-green-600">+28 viral ads discovered</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Customer Avatars Generated</CardDescription>
              <CardTitle className="text-2xl font-bold" data-testid="text-avatars">12</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">Across 4 segments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Knowledge Base Entries</CardDescription>
              <CardTitle className="text-2xl font-bold" data-testid="text-knowledge">38</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">Brand insights stored</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Research Activity (Last 7 Days) */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Recent Discoveries (Last 7 Days)
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">New Insights Discovered</CardDescription>
              <CardTitle className="text-2xl font-bold" data-testid="text-new-insights">34</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">22 customer, 12 creative</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Viral Creatives Found</CardDescription>
              <CardTitle className="text-2xl font-bold" data-testid="text-viral-creatives">18</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-green-600">Avg 12.4% engagement rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Top Research Source</CardDescription>
              <CardTitle className="text-lg font-bold" data-testid="text-top-source">Reddit Threads</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">28 insights extracted</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Agent Intelligence Summary */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Agents Overview
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Platform Agents</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium" data-testid="text-research-agent">Research Agent</p>
                    <p className="text-xs text-muted-foreground">Discovering customer & creative insights</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg opacity-60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <Lightbulb className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium" data-testid="text-creative-agent">Creative Brief Agent</p>
                    <p className="text-xs text-muted-foreground">Generate briefs & scripts</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Locked
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg opacity-60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium" data-testid="text-performance-agent">Performance Agent</p>
                    <p className="text-xs text-muted-foreground">Ad analytics & optimization</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Locked
                </Badge>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Quick Actions</h3>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline" data-testid="button-run-research">
                <Brain className="h-4 w-4 mr-2" />
                Discover Customer Insights
              </Button>
              <Button className="w-full justify-start" variant="outline" data-testid="button-find-creatives">
                <Sparkles className="h-4 w-4 mr-2" />
                Find Viral Creatives
              </Button>
              <Button className="w-full justify-start" variant="outline" disabled data-testid="button-run-script">
                <Lightbulb className="h-4 w-4 mr-2" />
                Generate Creative Briefs
                <Lock className="h-3 w-3 ml-auto text-muted-foreground" />
              </Button>
              <Button className="w-full justify-start" variant="outline" disabled data-testid="button-analyze-performance">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analyze Ad Performance
                <Lock className="h-3 w-3 ml-auto text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Research Insights */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Latest Research Insights
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Top Customer Pain Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="text-sm font-medium" data-testid="text-pain-point-1">"No time for meal prep"</p>
                  <p className="text-xs text-muted-foreground">Mentioned 127 times across Reddit & YouTube</p>
                </div>
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="text-sm font-medium">"Too expensive for quality"</p>
                  <p className="text-xs text-muted-foreground">Found in 89 customer reviews</p>
                </div>
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="text-sm font-medium">"Confusing product options"</p>
                  <p className="text-xs text-muted-foreground">62 mentions in Amazon Q&A</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                Trending Creative Formats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <p className="text-sm font-medium" data-testid="text-format-1">Raw UGC Testimonials</p>
                  <p className="text-xs text-muted-foreground">14.2% avg engagement rate</p>
                </div>
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <p className="text-sm font-medium">Before/After Comparisons</p>
                  <p className="text-xs text-muted-foreground">11.8% engagement, 18 viral examples</p>
                </div>
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <p className="text-sm font-medium">POV Storytelling</p>
                  <p className="text-xs text-muted-foreground">9.4% engagement, trending on TikTok</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Research Sources */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Active Research Sources
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-600" />
                Reddit Communities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">28 insights this week</div>
                <div className="text-xs text-muted-foreground">Top thread: "Daily cooking struggles"</div>
                <div className="text-xs text-green-600">+42% vs last week</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                YouTube Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">16 insights discovered</div>
                <div className="text-xs text-muted-foreground">Analyzing competitor reviews</div>
                <div className="text-xs text-green-600">High-value feedback found</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Amazon Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">23 pain points extracted</div>
                <div className="text-xs text-muted-foreground">Competitor product analysis</div>
                <div className="text-xs text-green-600">18 viral creatives found</div>
              </div>
            </CardContent>
          </Card>
        </div>
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