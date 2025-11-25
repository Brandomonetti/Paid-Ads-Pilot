import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useQuery, useMutation } from "@tanstack/react-query"
import { apiRequest, queryClient } from "@/lib/queryClient"
import type { PlatformSettings } from "@shared/schema"
import { 
  Settings, Lock, Crown, CheckCircle, AlertCircle, Zap, Brain, 
  Shield, Sparkles, FileText, BarChart3, Users, Lightbulb,
  ArrowRight, Check, ChevronDown
} from "lucide-react"

const CREDIT_TIERS = [
  { credits: 50, price: 99 },
  { credits: 100, price: 129 },
  { credits: 200, price: 179 },
  { credits: 500, price: 199 },
]

const PACKAGES = [
  {
    id: "research",
    name: "Research",
    description: "Customer research and competitor analysis",
    available: true,
    agents: ["Research Agent"],
    features: [
      "AI-generated customer insights",
      "Unlimited competitor ad browsing",
      "Build customer profiles",
      "Save and organize your research"
    ],
    color: "border-blue-500",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-600 dark:text-blue-400",
    icon: Brain
  },
  {
    id: "research_briefing",
    name: "Research + Briefing",
    description: "Add script generation and creative briefs",
    available: false,
    agents: ["Research Agent", "Briefing Agent"],
    features: [
      "Everything in Research",
      "UGC video scripts",
      "Hook variations",
      "Creative brief generation"
    ],
    color: "border-purple-500",
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-600 dark:text-purple-400",
    icon: FileText
  },
  {
    id: "all_agents",
    name: "Complete Suite",
    description: "Full access to all AI agents",
    available: false,
    agents: ["Research Agent", "Briefing Agent", "Performance Agent"],
    features: [
      "Everything in Research + Briefing",
      "Connect your ad accounts",
      "Performance analytics",
      "AI optimization recommendations"
    ],
    color: "border-amber-500",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-600 dark:text-amber-400",
    icon: Shield
  }
]

export function SettingsDashboard() {
  const { toast } = useToast()
  const [selectedCreditTier, setSelectedCreditTier] = useState(0)
  
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

  const currentTier = CREDIT_TIERS[selectedCreditTier]
  const currentPackage = PACKAGES[0]

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
      <Card className="border-blue-500 border-2">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">Research Plan</h2>
                  <Badge className="bg-blue-500/10 text-blue-600 border-0">
                    Current Plan
                  </Badge>
                </div>
                <p className="text-muted-foreground">Customer research and competitor analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-3xl font-bold">${currentTier.price}<span className="text-base font-normal text-muted-foreground">/mo</span></p>
                <p className="text-sm text-muted-foreground">{currentTier.credits} AI generations/month</p>
              </div>
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
                <Sparkles className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{settings.weeklyBriefsVolume || 0}</p>
                <p className="text-xs text-muted-foreground">AI Generations Used</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${Math.min(((settings.weeklyBriefsVolume || 0) / currentTier.credits) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {currentTier.credits - (settings.weeklyBriefsVolume || 0)} generations remaining
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
                <p className="text-xs text-muted-foreground">Customer Profiles</p>
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
                <p className="text-xs text-muted-foreground">Saved Research</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Adjust Your Plan */}
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">Adjust Your Plan</h3>
          <p className="text-muted-foreground">Need more AI generations? Upgrade your credit tier.</p>
        </div>

        {/* Credit Tier Selection for Research */}
        <Card className="border-blue-500/50 mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Research Plan</CardTitle>
                <CardDescription>Select your monthly AI generation limit</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CREDIT_TIERS.map((tier, index) => (
                <button
                  key={tier.credits}
                  onClick={() => setSelectedCreditTier(index)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedCreditTier === index 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-border hover:border-blue-500/50'
                  }`}
                  data-testid={`button-tier-${tier.credits}`}
                >
                  <p className="text-2xl font-bold">{tier.credits}</p>
                  <p className="text-xs text-muted-foreground mb-2">AI generations</p>
                  <p className="text-lg font-semibold">${tier.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                </button>
              ))}
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="font-medium">Selected: {currentTier.credits} AI generations</p>
                <p className="text-sm text-muted-foreground">Unlimited competitor ad browsing included</p>
              </div>
              <Button 
                disabled={selectedCreditTier === 0}
                data-testid="button-update-plan"
              >
                {selectedCreditTier === 0 ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Current Plan
                  </>
                ) : (
                  <>
                    Update Plan
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Package Comparison */}
        <div className="mb-4">
          <h4 className="text-lg font-semibold mb-2">Want More Features?</h4>
          <p className="text-sm text-muted-foreground">More AI agents are coming soon. Get notified when they launch.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PACKAGES.map((pkg) => {
            const Icon = pkg.icon
            const isCurrent = pkg.id === "research"
            
            return (
              <Card 
                key={pkg.id} 
                className={`relative ${isCurrent ? pkg.color + ' border-2' : 'opacity-75'}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${pkg.available ? pkg.bgColor : 'bg-muted'}`}>
                      <Icon className={`h-5 w-5 ${pkg.available ? pkg.textColor : 'text-muted-foreground'}`} />
                    </div>
                    {isCurrent ? (
                      <Badge className="bg-blue-500/10 text-blue-600 border-0">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        <Lock className="h-3 w-3 mr-1" />
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                  <CardTitle className={`text-lg ${!pkg.available ? 'text-muted-foreground' : ''}`}>
                    {pkg.name}
                  </CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pkg.available ? (
                    <div>
                      <p className="text-sm font-medium mb-1">Starts at</p>
                      <p className="text-2xl font-bold">$99<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                    </div>
                  ) : (
                    <div className="py-2">
                      <p className="text-sm text-muted-foreground">Pricing coming soon</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">INCLUDES:</p>
                    <ul className="space-y-1.5">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          {pkg.available ? (
                            <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                          ) : (
                            <Lock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          )}
                          <span className={!pkg.available ? "text-muted-foreground" : ""}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">AI AGENTS:</p>
                    <div className="flex flex-wrap gap-1">
                      {pkg.agents.map((agent, idx) => (
                        <Badge 
                          key={idx} 
                          variant="outline" 
                          className={pkg.available ? '' : 'text-muted-foreground'}
                        >
                          {agent}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {!pkg.available && (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      disabled
                      data-testid={`button-notify-${pkg.id}`}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Notify Me
                    </Button>
                  )}
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
