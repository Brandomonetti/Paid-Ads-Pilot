import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, RefreshCw, Target, DollarSign,
  Eye, Zap, Pause, Play, Settings, ChevronRight, Calendar, Users, MessageSquare, 
  ThumbsUp, ArrowUp, ArrowDown, Minus, Info, Brain, Building2
} from "lucide-react"

// Account Overview Metrics
interface AccountMetrics {
  totalSpend: number
  totalRevenue: number
  overallRoas: number
  overallCpm: number
  overallCtr: number
  overallCpc: number
  totalImpressions: number
  totalClicks: number
  totalPurchases: number
  activeAds: number
  trend: "up" | "down" | "stable"
  periodComparison: {
    spend: number
    revenue: number
    roas: number
  }
}

// Weekly Observations
interface WeeklyObservation {
  id: string
  title: string
  observation: string
  keyFindings: string[]
  priority: "high" | "medium" | "low"
  impact: string
  confidence: number
}

// Campaign with AI Insights
interface CampaignWithInsights {
  id: string
  campaignName: string
  status: "ACTIVE" | "PAUSED" | "PENDING"
  objective: string
  spend: number
  revenue: number
  roas: number
  cpm: number
  ctr: number
  cpc: number
  impressions: number
  clicks: number
  purchases: number
  trend: "up" | "down" | "stable"
  aiSignal?: {
    action: "scale" | "pause" | "wait" | "optimize" | "creative-refresh"
    reasoning: string
    confidence: number
    priority: "high" | "medium" | "low"
    detailedAnalysis: string
  }
  adSets?: {
    id: string
    adSetName: string
    status: "ACTIVE" | "PAUSED"
    spend: number
    revenue: number
    roas: number
    cpm: number
    ctr: number
    targeting: string
    dailyBudget: number
    aiSignal?: {
      action: "scale" | "pause" | "wait" | "optimize" | "creative-refresh"
      reasoning: string
      confidence: number
    }
    ads?: {
      id: string
      adName: string
      status: "ACTIVE" | "PAUSED"
      creativeType: "VIDEO" | "CAROUSEL" | "IMAGE"
      spend: number
      revenue: number
      roas: number
      cpm: number
      ctr: number
      hookRate?: number
      thumbstopRate?: number
      aiSignal?: {
        action: "scale" | "pause" | "wait" | "optimize" | "creative-refresh"
        reasoning: string
        confidence: number
        creativeInsight?: string
      }
    }[]
  }[]
}

export function PerformanceAgentDashboard() {
  // Account Overview Mock Data
  const [accountMetrics] = useState<AccountMetrics>({
    totalSpend: 45680,
    totalRevenue: 234580,
    overallRoas: 5.14,
    overallCpm: 12.45,
    overallCtr: 3.2,
    overallCpc: 0.38,
    totalImpressions: 1250000,
    totalClicks: 40000,
    totalPurchases: 2340,
    activeAds: 24,
    trend: "up",
    periodComparison: {
      spend: 12.5,
      revenue: 18.3,
      roas: 4.2
    }
  })

  // Top Weekly Observations
  const [weeklyObservations] = useState<WeeklyObservation[]>([
    {
      id: "1",
      title: "Creative Fatigue Across Video Campaigns",
      observation: "Video hook rates declining 15% week-over-week across 8 campaigns. Audience saturation detected in core demographics.",
      keyFindings: [
        "Hook rates dropped from 12.3% to 10.5% across video campaigns",
        "CPM increased 23% indicating auction pressure", 
        "Demographic analysis shows 65% reach saturation in 25-45 age group"
      ],
      priority: "high",
      impact: "Projected 18% ROAS decline if not addressed within 3 days",
      confidence: 94
    },
    {
      id: "2", 
      title: "Exceptional Performance in Lookalike Audiences",
      observation: "New 1% lookalike audiences based on high-LTV customers showing 40% higher ROAS than core interests.",
      keyFindings: [
        "Lookalike audiences: 7.2x ROAS vs 5.1x interest-based",
        "Lower CPCs ($0.31 vs $0.45) with higher conversion rates",
        "Ready for aggressive scaling with $2000+ daily budgets"
      ],
      priority: "high",
      impact: "Opportunity to increase monthly revenue by 35-50%",
      confidence: 89
    },
    {
      id: "3",
      title: "iOS 14.5+ Attribution Gaps Detected", 
      observation: "Modeled conversions show 25% higher actual performance than reported. Attribution blind spots affecting budget allocation.",
      keyFindings: [
        "Post-purchase surveys indicate 25% higher conversion attribution",
        "Incrementality tests show campaigns are 40% more profitable",
        "Recommend increasing budgets based on blended ROAS metrics"
      ],
      priority: "medium",
      impact: "Under-investing in profitable campaigns by ~$8,000/month",
      confidence: 82
    }
  ])

  // Campaigns with AI Insights
  const [campaigns] = useState<CampaignWithInsights[]>([
    {
      id: "1",
      campaignName: "Summer Sale - Video Creatives",
      status: "ACTIVE",
      objective: "CONVERSIONS",
      spend: 12340,
      revenue: 84580,
      roas: 6.85,
      cpm: 8.45,
      ctr: 4.2,
      cpc: 0.28,
      impressions: 1460000,
      clicks: 61320,
      purchases: 842,
      trend: "up",
      aiSignal: {
        action: "scale",
        reasoning: "Exceptional ROAS performance (6.85x) with low CPCs and strong conversion rates. Ready for 3x budget increase.",
        confidence: 96,
        priority: "high",
        detailedAnalysis: "This campaign demonstrates all indicators of a winning combination: ROAS 35% above account average, CPC 40% below benchmark, and conversion rate 2.3x higher than similar audiences. The creative resonates strongly with the 25-45 demographic (83% of conversions). Frequency is optimal at 1.8, indicating minimal audience fatigue. Auction insights show we're winning 78% of overlapping auctions at lower bids. Recommendation: Increase daily budget from $800 to $2400 immediately, expand to 2% and 5% lookalike audiences, and test similar creative angles."
      },
      adSets: [
        {
          id: "1-1",
          adSetName: "LA - Interests",
          status: "ACTIVE",
          spend: 4200,
          revenue: 31240,
          roas: 7.44,
          cpm: 6.20,
          ctr: 5.1,
          targeting: "Ages 25-45, Interests: Fitness, Nutrition",
          dailyBudget: 300,
          aiSignal: {
            action: "scale",
            reasoning: "Best performing ad set. Scale to $600/day immediately.",
            confidence: 94
          },
          ads: [
            {
              id: "1-1-1",
              adName: "Transformation Story - Vertical",
              status: "ACTIVE",
              creativeType: "VIDEO",
              spend: 2100,
              revenue: 18670,
              roas: 8.89,
              cpm: 5.80,
              ctr: 6.2,
              hookRate: 14.5,
              thumbstopRate: 28.3,
              aiSignal: {
                action: "scale",
                reasoning: "Top performer with exceptional hook rate. The transformation reveal at 3 seconds is highly effective.",
                confidence: 97,
                creativeInsight: "Hook rate 67% above benchmark. The before/after reveal drives strong emotional engagement."
              }
            }
          ]
        }
      ]
    },
    {
      id: "2",
      campaignName: "Product Demo - Carousel Ads",
      status: "ACTIVE", 
      objective: "CONVERSIONS",
      spend: 8950,
      revenue: 38420,
      roas: 4.29,
      cpm: 15.20,
      ctr: 2.1,
      cpc: 0.72,
      impressions: 588000,
      clicks: 12348,
      purchases: 384,
      trend: "down",
      aiSignal: {
        action: "pause",
        reasoning: "Creative fatigue detected. CTR declined 35% over 7 days while CPMs increased 28%. Immediate refresh needed.",
        confidence: 91,
        priority: "high",
        detailedAnalysis: "This campaign shows classic signs of creative fatigue: declining CTR (from 3.2% to 2.1%), rising CPMs (12.1 to 15.2), and increasing frequency (3.8). The carousel format initially performed well but user engagement has dropped significantly. Comments show repetition complaints. The same audience has seen these creatives 4+ times on average. Recommendation: Pause immediately and develop new creative angles using approved avatars from Research Agent. Test UGC-style videos or testimonial formats instead of product demos."
      },
      adSets: [
        {
          id: "2-1",
          adSetName: "Lookalike 1% - Purchasers",
          status: "ACTIVE",
          spend: 3200,
          revenue: 14680,
          roas: 4.59,
          cpm: 14.50,
          ctr: 2.3,
          targeting: "Lookalike 1% - Website Purchasers (180 days)",
          dailyBudget: 200,
          ads: [
            {
              id: "2-1-1",
              adName: "5-Card Product Demo",
              status: "ACTIVE",
              creativeType: "CAROUSEL",
              spend: 3200,
              revenue: 14680,
              roas: 4.59,
              cpm: 14.50,
              ctr: 2.3,
              aiSignal: {
                action: "creative-refresh",
                reasoning: "Creative showing fatigue. Engagement rates declining while frequency climbs.",
                confidence: 88,
                creativeInsight: "Users commenting about seeing this ad repeatedly. Need fresh creative angles."
              }
            }
          ]
        }
      ]
    }
  ])

  const [selectedTimeframe, setSelectedTimeframe] = useState("7d")
  const [selectedObservation, setSelectedObservation] = useState<WeeklyObservation | null>(null)
  const [selectedSignal, setSelectedSignal] = useState<any>(null)
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set())
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const runAnalysis = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
    }, 3000)
  }

  const toggleCampaignExpanded = (campaignId: string) => {
    setExpandedCampaigns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(campaignId)) {
        newSet.delete(campaignId)
      } else {
        newSet.add(campaignId)
      }
      return newSet
    })
  }

  const totalSignals = campaigns.reduce((count, campaign) => {
    let signals = campaign.aiSignal ? 1 : 0
    campaign.adSets?.forEach(adSet => {
      if (adSet.aiSignal) signals++
      adSet.ads?.forEach(ad => {
        if (ad.aiSignal) signals++
      })
    })
    return count + signals
  }, 0)

  const highPrioritySignals = campaigns.reduce((count, campaign) => {
    if (campaign.aiSignal?.priority === "high") count++
    return count
  }, 0) + weeklyObservations.filter(obs => obs.priority === "high").length

  const getActionIcon = (action: string) => {
    switch (action) {
      case "scale": return <TrendingUp className="h-4 w-4 text-green-600" />
      case "pause": return <Pause className="h-4 w-4 text-red-600" />
      case "wait": return <Minus className="h-4 w-4 text-yellow-600" />
      case "optimize": return <Settings className="h-4 w-4 text-blue-600" />
      case "creative-refresh": return <RefreshCw className="h-4 w-4 text-purple-600" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "scale": return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-300"
      case "pause": return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-300"
      case "wait": return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300"
      case "optimize": return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300"
      case "creative-refresh": return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/20 dark:text-purple-300"
      default: return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/20 dark:text-gray-300"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <ArrowUp className="h-4 w-4 text-green-600" />
      case "down": return <ArrowDown className="h-4 w-4 text-red-600" />
      case "stable": return <Minus className="h-4 w-4 text-gray-600" />
      default: return null
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
            <p className="text-muted-foreground">Monitors your Meta ads performance and provides strategic recommendations to improve ROAS. Analyzes campaign data to identify winning creatives and suggests optimizations for scaling successful ads.</p>
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
            {isAnalyzing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
            {isAnalyzing ? "Analyzing..." : "Refresh AI Insights"}
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
              <p className="text-sm text-green-600 dark:text-green-300">Last sync: 2 minutes ago • 3 ad accounts • {accountMetrics.activeAds} active ads</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabbed Interface */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center gap-2" data-testid="tab-overview">
            <Brain className="h-4 w-4" />
            Strategic Overview & AI Insights
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2" data-testid="tab-account">
            <Building2 className="h-4 w-4" />
            Meta Ad Account Manager
          </TabsTrigger>
        </TabsList>

        {/* Overview & Insights Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Account Overview Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs flex items-center gap-1">
                  Total Spend {getTrendIcon(accountMetrics.trend)}
                </CardDescription>
                <CardTitle className="text-xl font-bold">${accountMetrics.totalSpend.toLocaleString()}</CardTitle>
                <p className="text-xs text-green-600">+{accountMetrics.periodComparison.spend}% vs last period</p>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs flex items-center gap-1">
                  Total Revenue {getTrendIcon(accountMetrics.trend)}
                </CardDescription>
                <CardTitle className="text-xl font-bold">${accountMetrics.totalRevenue.toLocaleString()}</CardTitle>
                <p className="text-xs text-green-600">+{accountMetrics.periodComparison.revenue}% vs last period</p>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">Overall ROAS</CardDescription>
                <CardTitle className="text-xl font-bold">{accountMetrics.overallRoas}x</CardTitle>
                <p className="text-xs text-green-600">+{accountMetrics.periodComparison.roas}% vs last period</p>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">CPM</CardDescription>
                <CardTitle className="text-xl font-bold">${accountMetrics.overallCpm}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">CTR</CardDescription>
                <CardTitle className="text-xl font-bold">{accountMetrics.overallCtr}%</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">CPC</CardDescription>
                <CardTitle className="text-xl font-bold">${accountMetrics.overallCpc}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* AI Insights Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">Total AI Signals</CardDescription>
                <CardTitle className="text-2xl font-bold text-purple-600">{totalSignals}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">High Priority</CardDescription>
                <CardTitle className="text-2xl font-bold text-red-600">{highPrioritySignals}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">Weekly Observations</CardDescription>
                <CardTitle className="text-2xl font-bold text-blue-600">{weeklyObservations.length}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Top Observations of the Week */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Top Observations of the Week
              </CardTitle>
              <CardDescription>AI-powered strategic insights from your account data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyObservations.map((observation) => (
                  <div key={observation.id} className="border rounded-lg p-4 hover-elevate">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{observation.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{observation.observation}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(observation.priority)}>
                          {observation.priority.toUpperCase()}
                        </Badge>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedObservation(observation)}
                              data-testid={`button-view-observation-${observation.id}`}
                            >
                              <Info className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{observation.title}</DialogTitle>
                              <DialogDescription>Strategic Analysis from 8-Figure Media Buying Perspective</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Observation</h4>
                                <p className="text-sm text-muted-foreground">{observation.observation}</p>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Key Findings</h4>
                                <ul className="space-y-1">
                                  {observation.keyFindings.map((finding, index) => (
                                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <span className="text-blue-600 mt-1">•</span>
                                      {finding}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Strategic Impact</h4>
                                <p className="text-sm text-muted-foreground">{observation.impact}</p>
                              </div>
                              <div className="flex items-center gap-4 pt-2 border-t">
                                <div className="text-center">
                                  <p className="text-lg font-bold">{observation.confidence}%</p>
                                  <p className="text-xs text-muted-foreground">Confidence</p>
                                </div>
                                <div className="text-center">
                                  <Badge className={getPriorityColor(observation.priority)}>
                                    {observation.priority.toUpperCase()} PRIORITY
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-blue-600">{observation.impact}</span>
                      <span className="text-muted-foreground ml-2">• {observation.confidence}% confidence</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Research Agent Strategic Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Research Agent Recommendations
              </CardTitle>
              <CardDescription>Strategic direction for next creative tests and campaign optimizations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold mb-2 text-purple-800 dark:text-purple-200">Next Creative Tests Priority</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      Test UGC-style videos with approved avatars to combat creative fatigue in carousel campaigns
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      Scale exceptional lookalike audiences (1% high-LTV customers) with 3x budget increase
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      Develop new transformation story angles for video campaigns with 14.5% hook rates
                    </li>
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                    <h5 className="font-medium text-green-800 dark:text-green-200">Scale Opportunities</h5>
                    <p className="text-sm text-green-600 dark:text-green-300 mt-1">2 campaigns ready for immediate scaling</p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                    <h5 className="font-medium text-red-800 dark:text-red-200">Creative Refresh Needed</h5>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">1 campaign showing fatigue signals</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ad Account Manager Tab */}
        <TabsContent value="account" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5" />
                Meta Ads Manager
              </h2>
              <p className="text-sm text-muted-foreground">Full ad account view with AI-powered recommendations</p>
            </div>
            
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="overflow-hidden" data-testid={`card-campaign-${campaign.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCampaignExpanded(campaign.id)}
                        data-testid={`button-expand-campaign-${campaign.id}`}
                      >
                        <ChevronRight className={`h-4 w-4 transition-transform ${expandedCampaigns.has(campaign.id) ? 'rotate-90' : ''}`} />
                      </Button>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {campaign.campaignName}
                          {campaign.status === "ACTIVE" ? 
                            <Play className="h-4 w-4 text-green-600" /> : 
                            <Pause className="h-4 w-4 text-gray-600" />
                          }
                        </CardTitle>
                        <CardDescription>{campaign.objective} • {campaign.status}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {campaign.aiSignal && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="default"
                              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
                              onClick={() => setSelectedSignal(campaign.aiSignal)}
                              data-testid={`button-view-signal-${campaign.id}`}
                            >
                              {getActionIcon(campaign.aiSignal.action)}
                              View AI Signal
                              <Badge className="ml-2 bg-white/20 text-white border-0">
                                {campaign.aiSignal.confidence}%
                              </Badge>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle className="text-xl">AI Strategic Recommendation: {campaign.aiSignal.action.toUpperCase()}</DialogTitle>
                              <DialogDescription>8-Figure Creative Strategist Analysis • Research Agent Intelligence</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                                <div>
                                  <h4 className="font-medium mb-2">Campaign</h4>
                                  <p className="text-sm text-muted-foreground">{campaign.campaignName}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Recommended Action</h4>
                                  <Badge className={getActionColor(campaign.aiSignal.action)}>
                                    {getActionIcon(campaign.aiSignal.action)}
                                    {campaign.aiSignal.action.toUpperCase()}
                                  </Badge>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Strategic Priority</h4>
                                  <Badge className={getPriorityColor(campaign.aiSignal.priority)}>
                                    {campaign.aiSignal.priority.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>
                              <Separator />
                              <div>
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                  <Brain className="h-4 w-4" />
                                  Strategic Reasoning
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                  {campaign.aiSignal.reasoning}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                  <Target className="h-4 w-4" />
                                  8-Figure Strategist Analysis
                                </h4>
                                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                                  <p className="text-sm text-muted-foreground leading-relaxed">{campaign.aiSignal.detailedAnalysis}</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border">
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-green-600">{campaign.aiSignal.confidence}%</p>
                                  <p className="text-xs text-muted-foreground">AI Confidence</p>
                                </div>
                                <div className="text-center">
                                  <Badge className={getPriorityColor(campaign.aiSignal.priority)}>
                                    {campaign.aiSignal.priority.toUpperCase()} PRIORITY
                                  </Badge>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm font-medium">Research Agent</p>
                                  <p className="text-xs text-muted-foreground">Strategic Direction</p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      <Badge className={`${getActionColor(campaign.aiSignal?.action || "wait")} text-sm`}>
                        {getActionIcon(campaign.aiSignal?.action || "wait")}
                        {campaign.aiSignal?.action.toUpperCase() || "NO SIGNAL"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Campaign Metrics */}
                  <div className="grid grid-cols-6 gap-4 p-4 rounded-lg bg-muted/30 border">
                    <div className="text-center">
                      <p className="text-lg font-bold">${campaign.spend.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Spend</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">${campaign.revenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{campaign.roas}x</p>
                      <p className="text-xs text-muted-foreground">ROAS</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">${campaign.cpm}</p>
                      <p className="text-xs text-muted-foreground">CPM</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{campaign.ctr}%</p>
                      <p className="text-xs text-muted-foreground">CTR</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{campaign.purchases}</p>
                      <p className="text-xs text-muted-foreground">Purchases</p>
                    </div>
                  </div>

                  {/* Expanded Ad Sets and Ads */}
                  {expandedCampaigns.has(campaign.id) && (
                    <div className="space-y-3 pl-4 border-l-2 border-muted">
                      <h4 className="font-medium text-sm text-muted-foreground">AD SETS</h4>
                      {campaign.adSets?.map((adSet) => (
                        <div key={adSet.id} className="border rounded-lg p-3 bg-muted/20">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h5 className="font-medium">{adSet.adSetName}</h5>
                              <p className="text-xs text-muted-foreground">{adSet.targeting}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {adSet.aiSignal && (
                                <Badge className={getActionColor(adSet.aiSignal.action)}>
                                  {getActionIcon(adSet.aiSignal.action)}
                                  {adSet.aiSignal.action.toUpperCase()}
                                </Badge>
                              )}
                              <p className="text-sm font-medium">{adSet.roas}x ROAS</p>
                            </div>
                          </div>
                          
                          {/* Ad Set Ads */}
                          <div className="space-y-2 pl-4 border-l border-muted">
                            <h6 className="font-medium text-xs text-muted-foreground">ADS</h6>
                            {adSet.ads?.map((ad) => (
                              <div key={ad.id} className="flex items-center justify-between p-2 rounded bg-background border">
                                <div>
                                  <p className="font-medium text-sm">{ad.adName}</p>
                                  <p className="text-xs text-muted-foreground">{ad.creativeType}</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  {ad.aiSignal && (
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                          {getActionIcon(ad.aiSignal.action)}
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                          <DialogTitle>Creative Analysis: {ad.adName}</DialogTitle>
                                          <DialogDescription>AI Creative Performance Insights • Research Agent Feedback</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <div>
                                            <h4 className="font-medium mb-2">Recommendation</h4>
                                            <Badge className={getActionColor(ad.aiSignal.action)}>
                                              {getActionIcon(ad.aiSignal.action)}
                                              {ad.aiSignal.action.toUpperCase()}
                                            </Badge>
                                          </div>
                                          <div>
                                            <h4 className="font-medium mb-2">Analysis</h4>
                                            <p className="text-sm text-muted-foreground">{ad.aiSignal.reasoning}</p>
                                          </div>
                                          {ad.aiSignal.creativeInsight && (
                                            <div>
                                              <h4 className="font-medium mb-2">Creative Insight</h4>
                                              <p className="text-sm text-muted-foreground">{ad.aiSignal.creativeInsight}</p>
                                            </div>
                                          )}
                                          <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                                            <div className="text-center">
                                              <p className="text-lg font-bold">{ad.roas}x</p>
                                              <p className="text-xs text-muted-foreground">ROAS</p>
                                            </div>
                                            {ad.hookRate && (
                                              <div className="text-center">
                                                <p className="text-lg font-bold">{ad.hookRate}%</p>
                                                <p className="text-xs text-muted-foreground">Hook Rate</p>
                                              </div>
                                            )}
                                            <div className="text-center">
                                              <p className="text-lg font-bold">{ad.aiSignal.confidence}%</p>
                                              <p className="text-xs text-muted-foreground">Confidence</p>
                                            </div>
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  )}
                                  <p className="font-medium">{ad.roas}x</p>
                                  {ad.hookRate && <p className="text-xs text-muted-foreground">HR: {ad.hookRate}%</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}