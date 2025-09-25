import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useQuery, useMutation } from "@tanstack/react-query"
import { apiRequest, queryClient } from "@/lib/queryClient"
import type { PlatformSettings } from "@shared/schema"
import { 
  Settings, Target, BarChart3, TrendingUp, Lock, Crown, 
  CheckCircle, AlertCircle, Zap, Brain, Rocket, Shield
} from "lucide-react"

export function SettingsDashboard() {
  const { toast } = useToast()
  const userId = "user-1" // In a real app, this would come from auth context
  
  // Fetch platform settings
  const { data: settings, isLoading, isError } = useQuery<PlatformSettings>({
    queryKey: ["/api/settings", userId],
    queryFn: () => fetch(`/api/settings/${userId}`).then(res => res.json()),
  })

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (updates: Partial<PlatformSettings>) => 
      apiRequest("PATCH", `/api/settings/${userId}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings", userId] })
      toast({
        title: "Settings Saved",
        description: "Your platform preferences have been updated successfully.",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      })
    }
  })

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 animate-pulse"></div>
          <div>
            <div className="h-6 w-48 bg-muted animate-pulse rounded"></div>
            <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-96 bg-muted animate-pulse rounded-lg"></div>
            <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-muted animate-pulse rounded-lg"></div>
            <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (isError || !settings) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to Load Settings</h2>
          <p className="text-muted-foreground">Please refresh the page and try again.</p>
        </div>
      </div>
    )
  }

  const handlePercentageChange = (value: number[]) => {
    updateSettingsMutation.mutate({
      provenConceptsPercentage: value[0]
    })
  }

  const handleVolumeChange = (volume: string) => {
    const numVolume = parseInt(volume)
    if (numVolume > 20 && settings.subscriptionTier === "free") {
      toast({
        title: "Upgrade Required",
        description: "Free tier is limited to 20 briefs per week. Upgrade to Pro for unlimited access.",
        variant: "destructive"
      })
      return
    }
    
    updateSettingsMutation.mutate({
      weeklyBriefsVolume: numVolume
    })
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "pro": return <Crown className="h-4 w-4 text-yellow-600" />
      case "enterprise": return <Shield className="h-4 w-4 text-purple-600" />
      default: return <Zap className="h-4 w-4 text-blue-600" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "pro": return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300"
      case "enterprise": return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/20 dark:text-purple-300"
      default: return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300"
    }
  }

  const getMaxBriefs = () => {
    switch (settings.subscriptionTier) {
      case "pro": return 50
      case "enterprise": return 200
      default: return 20
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Platform Settings</h1>
            <p className="text-muted-foreground">Configure your Creative Strategist AI preferences</p>
          </div>
        </div>
        <Badge className={getTierColor(settings.subscriptionTier)}>
          {getTierIcon(settings.subscriptionTier)}
          {settings.subscriptionTier.toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Brief Generation Strategy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Brief Generation Strategy
              </CardTitle>
              <CardDescription>
                Control how your AI agents balance proven concepts versus experimental creative exploration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Proven Concepts vs Experimental Tests</Label>
                  <Badge variant="outline" className="text-sm">
                    {settings.provenConceptsPercentage}% / {100 - settings.provenConceptsPercentage}%
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <Slider
                    value={[settings.provenConceptsPercentage]}
                    onValueChange={handlePercentageChange}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                    data-testid="slider-proven-concepts"
                  />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-200">Proven Concepts ({settings.provenConceptsPercentage}%)</span>
                      </div>
                      <ul className="text-xs text-green-600 dark:text-green-300 space-y-1">
                        <li>• Winning ad concepts from your account</li>
                        <li>• Data-backed creative strategies</li>
                        <li>• Viral concepts with proven performance</li>
                        <li>• Lower risk, predictable results</li>
                      </ul>
                    </div>
                    
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Rocket className="h-4 w-4 text-purple-600" />
                        <span className="font-medium text-purple-800 dark:text-purple-200">Experimental Tests ({100 - settings.provenConceptsPercentage}%)</span>
                      </div>
                      <ul className="text-xs text-purple-600 dark:text-purple-300 space-y-1">
                        <li>• New creative angles and hooks</li>
                        <li>• Fresh avatar explorations</li>
                        <li>• Innovative format testing</li>
                        <li>• Higher risk, breakthrough potential</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Strategic Recommendations */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Strategic Recommendation
                </h4>
                {settings.provenConceptsPercentage >= 85 ? (
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    <strong>Conservative Strategy:</strong> Great for stable scaling and predictable growth. Consider increasing experimental percentage to 15-20% for breakthrough opportunities.
                  </p>
                ) : settings.provenConceptsPercentage >= 70 ? (
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    <strong>Balanced Strategy:</strong> Optimal mix for most 8-figure brands. Strong foundation with room for innovation and creative breakthroughs.
                  </p>
                ) : (
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    <strong>Innovation Strategy:</strong> High-risk, high-reward approach. Recommended for brands looking to disrupt their market or overcome performance plateaus.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Brief Volume */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Weekly Brief Volume
              </CardTitle>
              <CardDescription>
                Set how many creative briefs and research outputs you want per week
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Briefs per Week</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">{settings.weeklyBriefsVolume}</span>
                    <span className="text-sm text-muted-foreground">/ {getMaxBriefs()} max</span>
                  </div>
                </div>
                
                <Select value={settings.weeklyBriefsVolume.toString()} onValueChange={handleVolumeChange}>
                  <SelectTrigger data-testid="select-weekly-volume">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: getMaxBriefs() }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} brief{num !== 1 ? 's' : ''} per week
                        {num > 20 && settings.subscriptionTier === "free" && (
                          <Lock className="h-3 w-3 ml-2 text-muted-foreground" />
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {settings.weeklyBriefsVolume > 20 && settings.subscriptionTier === "free" && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Upgrade Required</span>
                    </div>
                    <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
                      Free tier limited to 20 briefs/week. Upgrade to Pro for up to 50 briefs/week.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">Research Outputs</p>
                  <p className="text-lg font-bold text-green-600">{Math.ceil(settings.weeklyBriefsVolume * 0.4)}</p>
                  <p className="text-xs text-muted-foreground">Avatar & Concept Analysis</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">Script Briefs</p>
                  <p className="text-lg font-bold text-blue-600">{Math.ceil(settings.weeklyBriefsVolume * 0.4)}</p>
                  <p className="text-xs text-muted-foreground">Video Script Templates</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">Creative Briefs</p>
                  <p className="text-lg font-bold text-purple-600">{Math.floor(settings.weeklyBriefsVolume * 0.2)}</p>
                  <p className="text-xs text-muted-foreground">Design & Format Guides</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription & Plan Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getTierIcon(settings.subscriptionTier)}
                Current Plan
              </CardTitle>
              <CardDescription>
                {settings.subscriptionTier === "free" ? "Free tier with basic features" : 
                 settings.subscriptionTier === "pro" ? "Pro tier with advanced AI capabilities" :
                 "Enterprise tier with unlimited access"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Weekly Briefs</span>
                  <span className="font-medium">{settings.weeklyBriefsVolume} / {getMaxBriefs()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">AI Agents</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Performance Analytics</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Meta Integration</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Premium Support</span>
                  {settings.subscriptionTier === "free" ? 
                    <Lock className="h-4 w-4 text-muted-foreground" /> :
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  }
                </div>
              </div>
              
              {settings.subscriptionTier === "free" && (
                <Button className="w-full" data-testid="button-upgrade-plan">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">This Week</span>
                <span className="font-medium">{settings.weeklyBriefsVolume} briefs generated</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Strategy Mix</span>
                <span className="font-medium">{settings.provenConceptsPercentage}%/{100 - settings.provenConceptsPercentage}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Campaigns</span>
                <span className="font-medium">12 campaigns</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Auto-save indicator */}
      {updateSettingsMutation.isPending && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            Saving changes...
          </div>
        </div>
      )}
    </div>
  )
}