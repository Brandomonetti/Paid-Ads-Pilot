import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"
import { 
  Settings, Brain, FileText, BarChart3, Lock, Bell, User, Mail
} from "lucide-react"

const PACKAGES = [
  {
    id: "research",
    name: "Research Agent",
    description: "Customer research and competitor analysis",
    available: true,
    features: [
      "AI-generated customer avatars",
      "Unlimited competitor ad browsing",
      "Build customer profiles",
      "Save and organize research"
    ],
    icon: Brain
  },
  {
    id: "briefing",
    name: "Briefing Agent",
    description: "Script generation and creative briefs",
    available: false,
    features: [
      "UGC video scripts",
      "Hook variations",
      "Creative brief generation",
      "Content frameworks"
    ],
    icon: FileText
  },
  {
    id: "performance",
    name: "Performance Agent",
    description: "Ad performance analytics",
    available: false,
    features: [
      "Connect ad accounts",
      "Performance analytics",
      "AI recommendations",
      "Optimization insights"
    ],
    icon: BarChart3
  }
]

export function SettingsDashboard() {
  const { user } = useAuth()

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-settings-title">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Account</CardTitle>
          </div>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground" data-testid="text-user-email-display">
                {(user as any)?.email || 'Not available'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground" data-testid="text-user-name-display">
                {`${(user as any)?.firstName || ''} ${(user as any)?.lastName || ''}`.trim() || 'Not available'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-muted-foreground" />
            <CardTitle>AI Agents</CardTitle>
          </div>
          <CardDescription>Available AI agents and their capabilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PACKAGES.map((pkg) => {
              const Icon = pkg.icon
              return (
                <Card 
                  key={pkg.id} 
                  className={`relative ${pkg.available ? 'border-primary/50' : 'opacity-60'}`}
                  data-testid={`card-agent-${pkg.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base">{pkg.name}</CardTitle>
                      </div>
                      {pkg.available ? (
                        <Badge variant="default" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs">{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-1.5">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="text-primary mt-0.5">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>Get notified when new agents become available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            We'll let you know when the Briefing Agent and Performance Agent are ready to use.
          </p>
          <Button variant="outline" size="sm" data-testid="button-notify-me">
            <Bell className="h-4 w-4 mr-2" />
            Notify Me
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
