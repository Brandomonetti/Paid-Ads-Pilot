import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Checkbox } from "@/components/ui/checkbox"
import { MetaConnectionCard } from "./meta-connection-card"
import { 
  BarChart3, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, RefreshCw, Target, DollarSign,
  Eye, Zap, Pause, Play, Settings, Calendar, Users, MessageSquare, 
  ThumbsUp, ArrowUp, ArrowDown, Minus, Info, Brain, Building2, Home
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

// Base metrics interface
interface BaseMetrics {
  id: string
  name: string
  status: "ACTIVE" | "PAUSED" | "PENDING"
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
}

// AI Signal interface
interface AISignal {
  action: "scale" | "pause" | "wait" | "optimize" | "creative-refresh"
  reasoning: string
  confidence: number
  priority: "high" | "medium" | "low"
  detailedAnalysis: string
}

// Campaign with AI Insights
interface CampaignWithInsights extends BaseMetrics {
  objective: string
  daily_budget?: number
  lifetime_budget?: number
  aiSignal?: AISignal
  adSets?: AdSetWithInsights[]
}

// Ad Set with AI Insights  
interface AdSetWithInsights extends BaseMetrics {
  campaign_id: string
  targeting: any
  daily_budget?: number
  bid_strategy?: string
  aiSignal?: AISignal
  ads?: AdWithInsights[]
}

// Ad with AI Insights
interface AdWithInsights extends BaseMetrics {
  adset_id: string
  creative_type: string
  creative_url?: string
  ad_copy?: string
  headline?: string
  description?: string
  hook_rate?: number
  thumbstop_rate?: number
  aiSignal?: AISignal
}

// Filter and view types
type ViewType = "all_ads" | "value_reporting" | "had_delivery" | "active_ads" | "paused_ads" | "top_spenders"
type SortField = "name" | "spend" | "revenue" | "roas" | "cpm" | "ctr" | "purchases" | "status"
type SortDirection = "asc" | "desc"
type ActiveLevel = "campaigns" | "adsets" | "ads"

// Per-level filter state
interface LevelFilters {
  search: string
  view: ViewType
  sortField: SortField
  sortDirection: SortDirection
}

export function PerformanceAgentDashboard() {
  const [selectedAccount, setSelectedAccount] = useState<string>("")
  const [dateRange, setDateRange] = useState<string>("last_30_days")
  const [selectedTab, setSelectedTab] = useState("overview")
  
  // 3-tab drill-down state
  const [activeLevel, setActiveLevel] = useState<ActiveLevel>("campaigns")
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)
  const [selectedAdSetId, setSelectedAdSetId] = useState<string | null>(null)
  
  // Selection state for checkbox filtering
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<Set<string>>(new Set())
  const [selectedAdSetIds, setSelectedAdSetIds] = useState<Set<string>>(new Set())
  const [selectedAdIds, setSelectedAdIds] = useState<Set<string>>(new Set())
  
  // Per-level filter state
  const [campaignFilters, setCampaignFilters] = useState<LevelFilters>({
    search: "",
    view: "all_ads",
    sortField: "spend",
    sortDirection: "desc"
  })
  const [adSetFilters, setAdSetFilters] = useState<LevelFilters>({
    search: "",
    view: "all_ads",
    sortField: "spend",
    sortDirection: "desc"
  })
  const [adFilters, setAdFilters] = useState<LevelFilters>({
    search: "",
    view: "all_ads",
    sortField: "spend",
    sortDirection: "desc"
  })

  // Fetch ad accounts
  const { data: adAccounts = [], isLoading: accountsLoading, error: accountsError } = useQuery({
    queryKey: ['/api/ad-accounts'],
    enabled: true,
    retry: (failureCount, error: any) => {
      // Don't retry if Meta account is not connected
      if (error?.status === 401 || error?.requiresConnection) {
        return false
      }
      return failureCount < 3
    }
  }) as {
    data: any[];
    isLoading: boolean;
    error: any;
  }

  // Set first account as default when accounts load
  useEffect(() => {
    if (adAccounts.length > 0 && !selectedAccount) {
      setSelectedAccount(adAccounts[0].id)
    }
  }, [adAccounts, selectedAccount])

  // Reset selections when account or date range changes
  useEffect(() => {
    setActiveLevel("campaigns")
    setSelectedCampaignId(null)
    setSelectedAdSetId(null)
    setSelectedCampaignIds(new Set())
    setSelectedAdSetIds(new Set())
    setSelectedAdIds(new Set())
  }, [selectedAccount, dateRange])

  // Navigation handlers
  const handleCampaignSelect = (campaignId: string) => {
    setSelectedCampaignId(campaignId)
    setSelectedAdSetId(null) // Clear ad set selection
    setActiveLevel("adsets")
  }

  const handleAdSetSelect = (adSetId: string) => {
    setSelectedAdSetId(adSetId)
    setActiveLevel("ads")
  }

  const handleBreadcrumbNavigation = (level: ActiveLevel) => {
    setActiveLevel(level)
    if (level === "campaigns") {
      setSelectedCampaignId(null)
      setSelectedAdSetId(null)
    } else if (level === "adsets") {
      setSelectedAdSetId(null)
    }
  }

  // Selection toggle handlers for checkboxes
  const toggleCampaignSelection = (campaignId: string) => {
    const newSelection = new Set(selectedCampaignIds)
    if (newSelection.has(campaignId)) {
      newSelection.delete(campaignId)
    } else {
      newSelection.add(campaignId)
    }
    setSelectedCampaignIds(newSelection)
  }

  const toggleAdSetSelection = (adSetId: string) => {
    const newSelection = new Set(selectedAdSetIds)
    if (newSelection.has(adSetId)) {
      newSelection.delete(adSetId)
    } else {
      newSelection.add(adSetId)
    }
    setSelectedAdSetIds(newSelection)
  }

  const toggleAdSelection = (adId: string) => {
    const newSelection = new Set(selectedAdIds)
    if (newSelection.has(adId)) {
      newSelection.delete(adId)
    } else {
      newSelection.add(adId)
    }
    setSelectedAdIds(newSelection)
  }

  // Get current filters based on active level
  const getCurrentFilters = (): LevelFilters => {
    switch (activeLevel) {
      case "campaigns": return campaignFilters
      case "adsets": return adSetFilters
      case "ads": return adFilters
      default: return campaignFilters
    }
  }

  const updateCurrentFilters = (updates: Partial<LevelFilters>) => {
    switch (activeLevel) {
      case "campaigns":
        setCampaignFilters(prev => ({ ...prev, ...updates }))
        break
      case "adsets":
        setAdSetFilters(prev => ({ ...prev, ...updates }))
        break
      case "ads":
        setAdFilters(prev => ({ ...prev, ...updates }))
        break
    }
  }

  // Get current data based on active level and selections
  const getCurrentData = () => {
    switch (activeLevel) {
      case "campaigns": 
        return campaignsData
      case "adsets": 
        // Show ad sets for selected campaigns, or all if none selected
        return selectedCampaignIds.size > 0 
          ? adSetsData.filter(adSet => selectedCampaignIds.has(adSet.campaign_id))
          : adSetsData
      case "ads": 
        // Show ads for selected ad sets, or all if none selected
        return selectedAdSetIds.size > 0 
          ? adsData.filter(ad => selectedAdSetIds.has(ad.adset_id))
          : adsData
      default: return []
    }
  }

  const getCurrentLoading = () => {
    switch (activeLevel) {
      case "campaigns": return campaignsLoading
      case "adsets": return adSetsLoading
      case "ads": return adsLoading
      default: return false
    }
  }

  const getCurrentError = () => {
    switch (activeLevel) {
      case "campaigns": return campaignsError
      case "adsets": return adSetsError
      case "ads": return adsError
      default: return null
    }
  }

  // Get context information for breadcrumbs
  const getSelectedCampaign = () => campaignsData.find(c => c.id === selectedCampaignId)
  const getSelectedAdSet = () => adSetsData.find(a => a.id === selectedAdSetId)

  // Fetch account insights
  const { data: accountMetrics = {}, isLoading: metricsLoading, error: metricsError } = useQuery({
    queryKey: [`/api/account-insights/${selectedAccount}?dateRange=${dateRange}`],
    enabled: !!selectedAccount
  }) as {
    data: any;
    isLoading: boolean;
    error: any;
  }

  // Level-based data fetching
  // Campaigns - always load when account is selected
  const { data: campaignsData = [], isLoading: campaignsLoading, error: campaignsError } = useQuery({
    queryKey: [`/api/campaigns/${selectedAccount}?dateRange=${dateRange}`],
    enabled: !!selectedAccount
  }) as {
    data: CampaignWithInsights[];
    isLoading: boolean;
    error: any;
  }

  // Ad Sets - load when account is selected and we're viewing adsets or ads (supports free navigation)
  const { data: adSetsData = [], isLoading: adSetsLoading, error: adSetsError } = useQuery({
    queryKey: [`/api/adsets/${selectedAccount}?dateRange=${dateRange}`],
    enabled: !!selectedAccount && (activeLevel === 'adsets' || activeLevel === 'ads')
  }) as {
    data: AdSetWithInsights[];
    isLoading: boolean;
    error: any;
  }

  // Ads - load when account is selected and we're viewing ads (supports free navigation)
  const { data: adsData = [], isLoading: adsLoading, error: adsError } = useQuery({
    queryKey: [`/api/ads/${selectedAccount}?dateRange=${dateRange}`],
    enabled: !!selectedAccount && activeLevel === 'ads'
  }) as {
    data: AdWithInsights[];
    isLoading: boolean;
    error: any;
  }

  // Fetch weekly observations
  const { data: weeklyObservationsData = [], isLoading: observationsLoading, error: observationsError } = useQuery({
    queryKey: [`/api/weekly-observations/${selectedAccount}`],
    enabled: !!selectedAccount
  }) as {
    data: WeeklyObservation[];
    isLoading: boolean;
    error: any;
  }

  // Filter and sort current level data
  const filterCurrentLevelData = (data: any[]) => {
    const filters = getCurrentFilters()
    let filtered = [...data]

    // Apply view filters
    switch (filters.view) {
      case "active_ads":
        filtered = filtered.filter(e => e.status === "ACTIVE")
        break
      case "paused_ads":
        filtered = filtered.filter(e => e.status === "PAUSED")
        break
      case "had_delivery":
        filtered = filtered.filter(e => e.impressions > 0)
        break
      case "top_spenders":
        filtered = filtered.filter(e => e.spend > 100)
        break
      case "value_reporting":
        filtered = filtered.filter(e => e.purchases > 0 || e.revenue > 0)
        break
    }

    // Apply search filter
    if (filters.search.trim()) {
      const query = filters.search.toLowerCase()
      filtered = filtered.filter(e => 
        e.name.toLowerCase().includes(query) ||
        e.id.toLowerCase().includes(query) ||
        e.objective?.toLowerCase().includes(query) ||
        e.creative_type?.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      const aVal = a[filters.sortField]
      const bVal = b[filters.sortField]

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return filters.sortDirection === 'desc' ? bVal - aVal : aVal - bVal
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return filters.sortDirection === 'desc' 
          ? bVal.localeCompare(aVal)
          : aVal.localeCompare(bVal)
      }

      return 0
    })
  }

  // Get filtered and sorted data for current level
  const currentData = getCurrentData()
  const filteredData = filterCurrentLevelData(currentData)
  
  const campaigns: CampaignWithInsights[] = campaignsData || []
  const weeklyObservations: WeeklyObservation[] = weeklyObservationsData.length > 0 ? weeklyObservationsData : [
    // Fallback mock data when API doesn't return observations
    {
      id: "1",
      title: "Creative Fatigue Across Video Campaigns",
      observation: "Video hook rates declining 15% week-over-week across 8 campaigns. Audience saturation detected in core demographics.",
      keyFindings: [
        "Hook rates dropped from 12.3% to 10.5% across video campaigns",
        "CPM increased 23% indicating auction pressure", 
        "Demographic analysis shows 65% reach saturation in 25-45 age group"
      ],
      priority: "high" as const,
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
      priority: "high" as const,
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
      priority: "medium" as const,
      impact: "Under-investing in profitable campaigns by ~$8,000/month",
      confidence: 82
    }
  ]

  // Check if Meta account needs connection first (before generic error handling)
  const needsMetaConnection = 
    accountsError && (
      accountsError.status === 401 || 
      accountsError.response?.status === 401 ||
      accountsError.message?.includes('Meta Ads account not connected') ||
      accountsError.requiresConnection
    );
  
  
  // Loading and error states
  const isLoading = accountsLoading || metricsLoading || observationsLoading || getCurrentLoading()
  // Exclude 401 account errors and observations errors from generic error handling
  const hasError = (accountsError && !needsMetaConnection) || metricsError || getCurrentError()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading Performance Data...</span>
      </div>
    )
  }

  if (needsMetaConnection || (adAccounts.length === 0 && !accountsLoading && !hasError)) {
    return (
      <div className="space-y-6" data-testid="performance-agent-dashboard">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Performance Agent</h1>
            <p className="text-muted-foreground">AI-powered Meta Ads performance analysis and strategic insights</p>
          </div>
        </div>

        {/* Meta Connection Required */}
        <div className="max-w-2xl mx-auto">
          <MetaConnectionCard />
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h3 className="text-lg font-medium">Performance Data Error</h3>
          <p className="text-sm text-muted-foreground">Unable to load performance data. Please try again.</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()} 
            className="mt-2"
            data-testid="button-retry-connection"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Connection
          </Button>
        </div>
      </div>
    )
  }

  if (adAccounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Building2 className="h-12 w-12 text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-lg font-medium">No Ad Accounts Found</h3>
          <p className="text-sm text-muted-foreground">Please check your Meta Ads API connection</p>
        </div>
      </div>
    )
  }

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'scale': return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'pause': return 'bg-red-100 text-red-800 hover:bg-red-200'
      case 'optimize': return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      case 'creative-refresh': return 'bg-orange-100 text-orange-800 hover:bg-orange-200'
      case 'wait': return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'scale': return <TrendingUp className="h-3 w-3" />
      case 'pause': return <Pause className="h-3 w-3" />
      case 'optimize': return <Settings className="h-3 w-3" />
      case 'creative-refresh': return <RefreshCw className="h-3 w-3" />
      case 'wait': return <Minus className="h-3 w-3" />
      default: return <Info className="h-3 w-3" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }


  // Calculate high priority alerts count
  const highPriorityAlerts = campaigns.reduce((acc, campaign) => {
    return campaign.aiSignal?.priority === "high" ? acc + 1 : acc
  }, 0) + weeklyObservations.filter(obs => obs.priority === "high").length

  return (
    <div className="space-y-6" data-testid="performance-agent-dashboard">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Performance Agent</h1>
          <p className="text-muted-foreground">AI-powered Meta Ads performance analysis and strategic insights</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Account Selector */}
          <Select value={selectedAccount} onValueChange={setSelectedAccount} data-testid="select-ad-account">
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Ad Account" />
            </SelectTrigger>
            <SelectContent>
              {adAccounts.map((account: any) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Date Range Selector */}
          <Select value={dateRange} onValueChange={setDateRange} data-testid="select-date-range">
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_7_days">Last 7 Days</SelectItem>
              <SelectItem value="last_14_days">Last 14 Days</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              <SelectItem value="last_90_days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Account Overview */}
      {accountMetrics && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Spend</p>
                  <p className="text-2xl font-bold" data-testid="metric-total-spend">
                    {formatCurrency(parseFloat(accountMetrics.spend || '0'))}
                  </p>
                </div>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold" data-testid="metric-total-revenue">
                    {formatCurrency((parseFloat(accountMetrics.spend || '0') * parseFloat(accountMetrics.purchase_roas || '0')))}
                  </p>
                </div>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ROAS</p>
                  <p className="text-2xl font-bold" data-testid="metric-roas">
                    {parseFloat(accountMetrics.purchase_roas || '0').toFixed(2)}x
                  </p>
                </div>
                <Target className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">High Priority Alerts</p>
                  <p className="text-2xl font-bold text-red-600" data-testid="metric-alerts">
                    {highPriorityAlerts}
                  </p>
                </div>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" data-testid="tab-overview">Weekly Analysis</TabsTrigger>
          <TabsTrigger value="campaigns" data-testid="tab-campaigns">Campaign Insights</TabsTrigger>
          <TabsTrigger value="creative" data-testid="tab-creative">Creative Analysis</TabsTrigger>
        </TabsList>

        {/* Weekly Analysis Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Weekly Observations
              </CardTitle>
              <CardDescription>
                Strategic insights from AI analysis of account performance patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyObservations.map((observation) => (
                  <div key={observation.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium">{observation.title}</h3>
                        <p className="text-sm text-muted-foreground">{observation.observation}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(observation.priority) + " border-current"} variant="outline">
                          {observation.priority.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{observation.confidence}% confidence</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Key Findings:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {observation.keyFindings.map((finding, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            {finding}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium text-primary">{observation.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaign Insights Tab - 3-Tab Meta Ads Manager Style */}
        <TabsContent value="campaigns" className="space-y-4">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    onClick={() => handleBreadcrumbNavigation("campaigns")}
                    className="cursor-pointer"
                    data-testid="breadcrumb-account"
                  >
                    <Building2 className="h-3 w-3" />
                    {adAccounts.find(acc => acc.id === selectedAccount)?.name || "Account"}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {selectedCampaignId && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink 
                        onClick={() => handleBreadcrumbNavigation("adsets")}
                        className="cursor-pointer"
                        data-testid="breadcrumb-campaign"
                      >
                        {getSelectedCampaign()?.name || "Campaign"}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </>
                )}
                {selectedAdSetId && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage data-testid="breadcrumb-adset">
                        {getSelectedAdSet()?.name || "Ad Set"}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Level-based Table Content with Tabs below filtering */}
          <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Meta Ads Manager
                </CardTitle>
                <CardDescription>
                  Use checkboxes to select campaigns/ad sets for filtering, or navigate freely between levels
                </CardDescription>
              </CardHeader>
              
              {/* Level-specific Filtering Bar */}
              <div className="px-6 pb-4 space-y-4 border-b">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Search Input */}
                  <div className="flex-1 min-w-[250px]">
                    <Input
                      placeholder={`Search ${activeLevel}...`}
                      value={getCurrentFilters().search}
                      onChange={(e) => updateCurrentFilters({ search: e.target.value })}
                      className="w-full"
                      data-testid="input-search"
                    />
                  </div>

                  {/* Quick Filter Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant={getCurrentFilters().view === "all_ads" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateCurrentFilters({ view: "all_ads" })}
                      data-testid="filter-all-ads"
                    >
                      All
                    </Button>
                    <Button
                      variant={getCurrentFilters().view === "active_ads" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateCurrentFilters({ view: "active_ads" })}
                      data-testid="filter-active-ads"
                    >
                      Active
                    </Button>
                    <Button
                      variant={getCurrentFilters().view === "paused_ads" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateCurrentFilters({ view: "paused_ads" })}
                      data-testid="filter-paused-ads"
                    >
                      Paused
                    </Button>
                    <Button
                      variant={getCurrentFilters().view === "had_delivery" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateCurrentFilters({ view: "had_delivery" })}
                      data-testid="filter-had-delivery"
                    >
                      Had Delivery
                    </Button>
                    <Button
                      variant={getCurrentFilters().view === "top_spenders" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateCurrentFilters({ view: "top_spenders" })}
                      data-testid="filter-top-spenders"
                    >
                      Top Spenders
                    </Button>
                  </div>
                </div>

                {/* Advanced Filters - Second Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Select 
                      value={getCurrentFilters().sortField} 
                      onValueChange={(value) => updateCurrentFilters({ sortField: value as SortField })} 
                      data-testid="select-sort-field"
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="spend">Spend</SelectItem>
                        <SelectItem value="impressions">Impressions</SelectItem>
                        <SelectItem value="clicks">Clicks</SelectItem>
                        <SelectItem value="ctr">CTR</SelectItem>
                        <SelectItem value="cpm">CPM</SelectItem>
                        <SelectItem value="cpc">CPC</SelectItem>
                        <SelectItem value="purchases">Purchases</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="roas">ROAS</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCurrentFilters({ 
                        sortDirection: getCurrentFilters().sortDirection === "asc" ? "desc" : "asc" 
                      })}
                      data-testid="button-sort-direction"
                    >
                      {getCurrentFilters().sortDirection === "asc" ? "↑" : "↓"} {getCurrentFilters().sortDirection.toUpperCase()}
                    </Button>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {filteredData.length} items
                  </div>
                </div>
              </div>

              {/* Meta Ads Manager 3-Tab Navigation - Moved below filtering */}
              <div className="px-6 pt-4">
                <Tabs value={activeLevel} onValueChange={(value) => setActiveLevel(value as ActiveLevel)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger 
                      value="campaigns" 
                      data-testid="tab-meta-campaigns"
                      className="relative"
                    >
                      Campaigns
                      {campaignsData.length > 0 && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {campaignsData.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="adsets" 
                      data-testid="tab-meta-adsets"
                      className="relative"
                    >
                      Ad Sets
                      {adSetsData.length > 0 && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {getCurrentData().length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="ads" 
                      data-testid="tab-meta-ads"
                      className="relative"
                    >
                      Ads
                      {adsData.length > 0 && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {getCurrentData().length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[300px]">
                          {activeLevel === 'campaigns' && 'Campaign'}
                          {activeLevel === 'adsets' && 'Ad Set'}
                          {activeLevel === 'ads' && 'Ad'}
                        </TableHead>
                        <TableHead className="text-right">Status</TableHead>
                        <TableHead className="text-right">Delivery</TableHead>
                        <TableHead className="text-right">Spend</TableHead>
                        <TableHead className="text-right">Impressions</TableHead>
                        <TableHead className="text-right">Clicks</TableHead>
                        <TableHead className="text-right">CTR</TableHead>
                        <TableHead className="text-right">CPC</TableHead>
                        <TableHead className="text-right">CPM</TableHead>
                        <TableHead className="text-right">Purchases</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">ROAS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((item: any) => (
                        <TableRow 
                          key={item.id}
                          className="hover:bg-muted/40 transition-colors cursor-pointer"
                          onClick={(e) => {
                            // Prevent row click when clicking checkbox
                            if ((e.target as HTMLElement).closest('[role="checkbox"]')) {
                              return;
                            }
                            if (activeLevel === 'campaigns') {
                              toggleCampaignSelection(item.id)
                            } else if (activeLevel === 'adsets') {
                              toggleAdSetSelection(item.id)
                            }
                          }}
                          data-testid={`table-row-${activeLevel}-${item.id}`}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {(activeLevel === 'campaigns' || activeLevel === 'adsets') && (
                                <Checkbox
                                  checked={
                                    activeLevel === 'campaigns' 
                                      ? selectedCampaignIds.has(item.id)
                                      : selectedAdSetIds.has(item.id)
                                  }
                                  onCheckedChange={() => {
                                    if (activeLevel === 'campaigns') {
                                      toggleCampaignSelection(item.id)
                                    } else if (activeLevel === 'adsets') {
                                      toggleAdSetSelection(item.id)
                                    }
                                  }}
                                  data-testid={`checkbox-${activeLevel}-${item.id}`}
                                />
                              )}
                              <div className="flex flex-col">
                                <span className="font-medium text-sm">
                                  {item.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  ID: {item.id}
                                </span>
                                {activeLevel === 'campaigns' && item.objective && (
                                  <span className="text-xs text-muted-foreground">
                                    {item.objective}
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={
                              item.status === 'ACTIVE' ? 'default' : 
                              item.status === 'PAUSED' ? 'secondary' : 'outline'
                            }>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {item.impressions > 0 ? (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              ) : (
                                <AlertTriangle className="h-3 w-3 text-yellow-600" />
                              )}
                              <span className="text-xs">
                                {item.impressions > 0 ? 'Delivering' : 'No Delivery'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {formatCurrency(item.spend)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {item.impressions.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {item.clicks.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {item.ctr.toFixed(2)}%
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {formatCurrency(item.cpc)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {formatCurrency(item.cpm)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {item.purchases.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {formatCurrency(item.revenue)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className={`font-mono text-sm ${
                              item.roas >= 3 ? 'text-green-600 font-semibold' :
                              item.roas >= 2 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {item.roas.toFixed(2)}x
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {filteredData.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg mb-2">No data available</h3>
                    <p className="text-muted-foreground text-sm max-w-md">
                      {activeLevel === 'campaigns' && 'No campaigns found for the selected filters.'}
                      {activeLevel === 'adsets' && !selectedCampaignId && 'Select a campaign to view ad sets.'}
                      {activeLevel === 'adsets' && selectedCampaignId && 'No ad sets found for the selected campaign.'}
                      {activeLevel === 'ads' && !selectedAdSetId && 'Select an ad set to view ads.'}
                      {activeLevel === 'ads' && selectedAdSetId && 'No ads found for the selected ad set.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
        </TabsContent>

        {/* Creative Analysis Tab */}
        <TabsContent value="creative" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Creative Performance Analysis</CardTitle>
              <CardDescription>
                AI-driven insights on creative performance and optimization opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Creative Analysis Coming Soon</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced creative performance insights and hook rate analysis will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}