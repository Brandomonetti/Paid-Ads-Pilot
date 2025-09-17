import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, RefreshCw, Target, DollarSign } from "lucide-react"

interface CampaignInsight {
  id: string
  campaignName: string
  recommendation: string
  impact: "high" | "medium" | "low"
  type: "optimization" | "scaling" | "creative-refresh" | "audience-expansion"
  metrics: {
    currentRoas: number
    projectedRoas: number
    currentSpend: number
    confidence: number
  }
  status: "pending" | "approved" | "rejected" | "implemented"
  feedback?: string
}

interface PerformanceData {
  campaignName: string
  spend: number
  revenue: number
  roas: number
  ctr: number
  cpc: number
  hookRate: number
  trend: "up" | "down" | "stable"
}

export function PerformanceAgentDashboard() {
  //todo: remove mock functionality - replace with real Meta API integration
  const [insights, setInsights] = useState<CampaignInsight[]>([
    {
      id: "1",
      campaignName: "Summer Sale - Video Ads",
      recommendation: "Increase budget by 40% and expand to lookalike audiences. Current creative is outperforming benchmarks with 6.8x ROAS.",
      impact: "high",
      type: "scaling",
      metrics: {
        currentRoas: 6.8,
        projectedRoas: 7.2,
        currentSpend: 2340,
        confidence: 92
      },
      status: "pending"
    },
    {
      id: "2",
      campaignName: "Product Demo Carousel",
      recommendation: "Creative fatigue detected. Hook rate dropped 23% over 7 days. Recommend testing new angles with approved avatars.",
      impact: "high", 
      type: "creative-refresh",
      metrics: {
        currentRoas: 5.2,
        projectedRoas: 6.1,
        currentSpend: 1890,
        confidence: 88
      },
      status: "approved"
    },
    {
      id: "3",
      campaignName: "Customer Testimonials",
      recommendation: "Optimize bid strategy for cost efficiency. CPC increased 15% while maintaining conversion rate.",
      impact: "medium",
      type: "optimization", 
      metrics: {
        currentRoas: 4.9,
        projectedRoas: 5.4,
        currentSpend: 1567,
        confidence: 75
      },
      status: "pending"
    }
  ])

  //todo: remove mock functionality
  const [performanceData] = useState<PerformanceData[]>([
    { campaignName: "Summer Sale - Video Ads", spend: 2340, revenue: 15912, roas: 6.8, ctr: 3.2, cpc: 0.42, hookRate: 85, trend: "up" },
    { campaignName: "Product Demo Carousel", spend: 1890, revenue: 9828, roas: 5.2, ctr: 2.8, cpc: 0.38, hookRate: 67, trend: "down" },
    { campaignName: "Customer Testimonials", spend: 1567, revenue: 7678, roas: 4.9, ctr: 2.1, cpc: 0.51, hookRate: 78, trend: "stable" },
  ])

  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d")

  const handleApproval = (id: string, status: "approved" | "rejected" | "implemented") => {
    setInsights(prev => prev.map(insight => 
      insight.id === id 
        ? { ...insight, status, feedback: feedback[id] }
        : insight
    ))
    console.log(`Insight ${id} ${status}:`, feedback[id])
  }

  const runAnalysis = () => {
    setIsAnalyzing(true)
    //todo: remove mock functionality - integrate with Meta API and OpenAI
    setTimeout(() => {
      const newInsight: CampaignInsight = {
        id: Date.now().toString(),
        campaignName: "Holiday Promotion",
        recommendation: "Strong early performance indicates opportunity for aggressive scaling. Consider 3x budget increase with broad targeting.",
        impact: "high",
        type: "scaling",
        metrics: {
          currentRoas: 8.1,
          projectedRoas: 8.7,
          currentSpend: 890,
          confidence: 94
        },
        status: "pending"
      }
      setInsights(prev => [newInsight, ...prev])
      setIsAnalyzing(false)
    }, 3000)
  }

  const pendingCount = insights.filter(i => i.status === "pending").length
  const approvedCount = insights.filter(i => i.status === "approved").length
  const implementedCount = insights.filter(i => i.status === "implemented").length

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "scaling": return <TrendingUp className="h-4 w-4" />
      case "optimization": return <Target className="h-4 w-4" />
      case "creative-refresh": return <RefreshCw className="h-4 w-4" />
      case "audience-expansion": return <BarChart3 className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Performance Agent</h1>
            <p className="text-muted-foreground">AI-powered Meta ad performance analysis</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={runAnalysis}
            disabled={isAnalyzing}
            data-testid="button-run-analysis"
          >
            {isAnalyzing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <BarChart3 className="mr-2 h-4 w-4" />}
            {isAnalyzing ? "Analyzing..." : "Run Analysis"}
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">Meta Ads Manager Connected</p>
              <p className="text-sm text-green-600 dark:text-green-300">Last sync: 2 minutes ago • 3 ad accounts • 12 active campaigns</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Insights</CardDescription>
            <CardTitle className="text-2xl font-bold">{insights.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Pending Review</CardDescription>
            <CardTitle className="text-2xl font-bold text-orange-600">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Implemented</CardDescription>
            <CardTitle className="text-2xl font-bold text-green-600">{implementedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Avg Confidence</CardDescription>
            <CardTitle className="text-2xl font-bold">85%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Current Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Campaign Performance Overview
          </CardTitle>
          <CardDescription>Real-time metrics from connected Meta ad accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {performanceData.map((campaign, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                <div className="flex-1">
                  <h4 className="font-medium">{campaign.campaignName}</h4>
                  <p className="text-sm text-muted-foreground">
                    Spend: ${campaign.spend.toLocaleString()} • Revenue: ${campaign.revenue.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-bold text-lg">{campaign.roas}x</p>
                    <p className="text-muted-foreground">ROAS</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg">{campaign.ctr}%</p>
                    <p className="text-muted-foreground">CTR</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg">{campaign.hookRate}%</p>
                    <p className="text-muted-foreground">Hook Rate</p>
                  </div>
                  {campaign.trend === "up" && <TrendingUp className="h-4 w-4 text-green-600" />}
                  {campaign.trend === "down" && <TrendingDown className="h-4 w-4 text-red-600" />}
                  {campaign.trend === "stable" && <div className="h-4 w-4 rounded-full bg-gray-400"></div>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Target className="h-5 w-5" />
          AI Performance Insights
        </h2>
        
        {insights.map((insight) => (
          <Card key={insight.id} className="hover-elevate" data-testid={`card-insight-${insight.id}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(insight.type)}
                  <div>
                    <CardTitle className="text-lg">{insight.campaignName}</CardTitle>
                    <CardDescription className="capitalize">{insight.type.replace('-', ' ')}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={getImpactColor(insight.impact)}>
                    {insight.impact.toUpperCase()} IMPACT
                  </Badge>
                  <Badge 
                    variant={
                      insight.status === "approved" ? "default" : 
                      insight.status === "rejected" ? "destructive" :
                      insight.status === "implemented" ? "default" : "secondary"
                    }
                  >
                    {insight.status === "implemented" && <CheckCircle className="mr-1 h-3 w-3" />}
                    {insight.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Recommendation */}
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-sm text-blue-700 dark:text-blue-300 mb-2">AI Recommendation</h4>
                <p className="text-sm">{insight.recommendation}</p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/30 border">
                <div className="text-center">
                  <p className="text-xl font-bold">{insight.metrics.currentRoas}x</p>
                  <p className="text-xs text-muted-foreground">Current ROAS</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-green-600">{insight.metrics.projectedRoas}x</p>
                  <p className="text-xs text-muted-foreground">Projected ROAS</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">${insight.metrics.currentSpend}</p>
                  <p className="text-xs text-muted-foreground">Current Spend</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">{insight.metrics.confidence}%</p>
                  <p className="text-xs text-muted-foreground">Confidence</p>
                </div>
              </div>

              {/* Feedback Section */}
              {insight.status === "pending" && (
                <div className="space-y-3 pt-4 border-t">
                  <Textarea
                    placeholder="Add feedback or implementation notes..."
                    value={feedback[insight.id] || ""}
                    onChange={(e) => setFeedback(prev => ({ ...prev, [insight.id]: e.target.value }))}
                    rows={2}
                    data-testid={`textarea-feedback-${insight.id}`}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproval(insight.id, "approved")}
                      data-testid={`button-approve-${insight.id}`}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApproval(insight.id, "implemented")}
                      data-testid={`button-implement-${insight.id}`}
                    >
                      <Target className="mr-2 h-4 w-4" />
                      Mark Implemented
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleApproval(insight.id, "rejected")}
                      data-testid={`button-reject-${insight.id}`}
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              )}

              {/* Show feedback if already reviewed */}
              {insight.status !== "pending" && insight.feedback && (
                <div className="p-3 rounded-lg bg-muted/50 border-l-4 border-l-primary">
                  <p className="text-sm"><strong>Notes:</strong> {insight.feedback}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}