import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useQuery, useMutation } from "@tanstack/react-query"
import { apiRequest, queryClient } from "@/lib/queryClient"
import type { PlatformSettings } from "@shared/schema"
import { 
  Settings, Lock, Crown, CheckCircle, AlertCircle, Zap, Brain, 
  Shield, Sparkles, FileText, BarChart3, Search, Users, Lightbulb,
  ArrowRight, Check
} from "lucide-react"

const PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    monthlyCredits: 50,
    description: "Perfect for small brands getting started",
    features: [
      "50 research credits/month",
      "Customer Intelligence Hub",
      "5 Target Avatars",
      "Basic insights export"
    ],
    color: "border-blue-500",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-600 dark:text-blue-400",
    icon: Zap
  },
  {
    id: "growth",
    name: "Growth",
    price: 149,
    monthlyCredits: 200,
    description: "For growing brands scaling their ads",
    popular: true,
    features: [
      "200 research credits/month",
      "Customer Intelligence Hub",
      "Unlimited Target Avatars",
      "Creative Research Center",
      "Priority support"
    ],
    color: "border-purple-500",
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-600 dark:text-purple-400",
    icon: Crown
  },
  {
    id: "scale",
    name: "Scale",
    price: 399,
    monthlyCredits: 500,
    description: "For agencies and high-volume brands",
    features: [
      "500 research credits/month",
      "All Growth features",
      "Creative Brief Agent (Coming Soon)",
      "Performance Agent (Coming Soon)",
      "Dedicated account manager",
      "Custom integrations"
    ],
    color: "border-amber-500",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-600 dark:text-amber-400",
    icon: Shield
  }
]

export function SettingsDashboard() {
  const { toast } = useToast()
  
  const { data: settings, isLoading, isError } = useQuery<PlatformSettings>({
    queryKey: ["/api/settings"],
  })

  const updateSettingsMutation = useMutation({
    mutationFn: (updates: Partial<PlatformSettings>) => 
      apiRequest("PATCH", "/api/settings", updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] })
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated.",
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-96 bg-muted animate-pulse rounded-lg"></div>
          ))}
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

  const currentPackage = PACKAGES.find(p => p.id === settings.subscriptionTier) || PACKAGES[0]
  const PackageIcon = currentPackage.icon

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your subscription and preferences</p>
          </div>
        </div>
      </div>

      {/* Current Plan Overview */}
      <Card className={`${currentPackage.color} border-2`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${currentPackage.bgColor}`}>
                <PackageIcon className={`h-6 w-6 ${currentPackage.textColor}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{currentPackage.name} Plan</h2>
                  <Badge className={currentPackage.bgColor + " " + currentPackage.textColor + " border-0"}>
                    Current Plan
                  </Badge>
                </div>
                <p className="text-muted-foreground">{currentPackage.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">${currentPackage.price}<span className="text-base font-normal text-muted-foreground">/mo</span></p>
              <p className="text-sm text-muted-foreground">{currentPackage.monthlyCredits} credits/month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Search className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{settings.weeklyBriefsVolume || 0}</p>
                <p className="text-xs text-muted-foreground">Research Credits Used</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${Math.min(((settings.weeklyBriefsVolume || 0) / currentPackage.monthlyCredits) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {currentPackage.monthlyCredits - (settings.weeklyBriefsVolume || 0)} credits remaining
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">4</p>
                <p className="text-xs text-muted-foreground">Target Avatars</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Lightbulb className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">Approved Insights</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Agents Status */}
      <div>
        <h3 className="text-lg font-semibold mb-4">AI Agents</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Research Agent - Active */}
          <Card className="border-green-500/50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <Brain className="h-5 w-5 text-green-600" />
                </div>
                <Badge className="bg-green-500/10 text-green-600 border-0">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              <h4 className="font-semibold mb-1">Research Agent</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Discover customer insights and build target avatars from real data
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-600" />
                  Customer Intelligence Hub
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-600" />
                  Creative Research Center
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-600" />
                  Target Avatar Generation
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Creative Brief Agent - Locked */}
          <Card className="opacity-75">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <Badge variant="outline" className="text-muted-foreground">
                  <Lock className="h-3 w-3 mr-1" />
                  Coming Soon
                </Badge>
              </div>
              <h4 className="font-semibold mb-1 text-muted-foreground">Creative Brief Agent</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Generate detailed creative briefs for your production team
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Lock className="h-3 w-3" />
                  UGC Script Generation
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="h-3 w-3" />
                  Visual Direction Briefs
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="h-3 w-3" />
                  Format Recommendations
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Performance Agent - Locked */}
          <Card className="opacity-75">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                </div>
                <Badge variant="outline" className="text-muted-foreground">
                  <Lock className="h-3 w-3 mr-1" />
                  Coming Soon
                </Badge>
              </div>
              <h4 className="font-semibold mb-1 text-muted-foreground">Performance Agent</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Analyze ad performance and optimize creative strategy
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Lock className="h-3 w-3" />
                  Meta Ads Integration
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="h-3 w-3" />
                  Performance Analysis
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="h-3 w-3" />
                  AI Recommendations
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Pricing Plans */}
      <div>
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-2">Choose Your Plan</h3>
          <p className="text-muted-foreground">Scale your creative research as you grow</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PACKAGES.map((pkg) => {
            const Icon = pkg.icon
            const isCurrent = pkg.id === settings.subscriptionTier
            
            return (
              <Card 
                key={pkg.id} 
                className={`relative ${isCurrent ? pkg.color + ' border-2' : ''} ${pkg.popular ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-background' : ''}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-purple-500 text-white border-0">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-lg ${pkg.bgColor} mb-2`}>
                    <Icon className={`h-6 w-6 ${pkg.textColor}`} />
                  </div>
                  <CardTitle>{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <span className="text-4xl font-bold">${pkg.price}</span>
                    <span className="text-muted-foreground">/month</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {pkg.monthlyCredits} research credits
                    </p>
                  </div>
                  
                  <ul className="space-y-2">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        {feature.includes("Coming Soon") ? (
                          <Lock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                        )}
                        <span className={feature.includes("Coming Soon") ? "text-muted-foreground" : ""}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full" 
                    variant={isCurrent ? "outline" : "default"}
                    disabled={isCurrent}
                    data-testid={`button-select-${pkg.id}`}
                  >
                    {isCurrent ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Current Plan
                      </>
                    ) : (
                      <>
                        {pkg.price > currentPackage.price ? "Upgrade" : "Downgrade"}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
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
