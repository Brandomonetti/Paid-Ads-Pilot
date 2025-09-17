import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Brain, ThumbsUp, ThumbsDown, Users, Target, Zap, RefreshCw } from "lucide-react"

interface CustomerAvatar {
  id: string
  name: string
  age: string
  demographics: string
  painPoint: string
  hooks: string[]
  status: "pending" | "approved" | "rejected"
  feedback?: string
}

export function ResearchAgentDashboard() {
  //todo: remove mock functionality - replace with real OpenAI integration
  const [avatars, setAvatars] = useState<CustomerAvatar[]>([
    {
      id: "1",
      name: "Busy Working Parent",
      age: "28-45",
      demographics: "Working parents with young children, household income $50k-$100k",
      painPoint: "No time to cook healthy meals for family, constantly stressed about nutrition",
      hooks: [
        "What if dinner could be ready in 10 minutes every night?",
        "Stop feeling guilty about another takeout order",
        "Your kids deserve better than processed food"
      ],
      status: "pending"
    },
    {
      id: "2", 
      name: "Health-Conscious Millennial",
      age: "25-35",
      demographics: "Urban professionals, health-focused lifestyle, disposable income",
      painPoint: "Uncertain about food quality and ingredient sourcing",
      hooks: [
        "Finally, know exactly what's in your food",
        "Organic doesn't have to break the bank", 
        "Your body will thank you for this switch"
      ],
      status: "approved"
    },
    {
      id: "3",
      name: "Time-Pressed Entrepreneur", 
      age: "30-50",
      demographics: "Small business owners, high stress, value efficiency",
      painPoint: "Too busy building business to focus on personal health",
      hooks: [
        "Success shouldn't cost you your health",
        "Fuel your hustle with real nutrition",
        "The meal prep solution for busy CEOs"
      ],
      status: "pending"
    }
  ])

  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)

  const handleApproval = (id: string, status: "approved" | "rejected") => {
    setAvatars(prev => prev.map(avatar => 
      avatar.id === id 
        ? { ...avatar, status, feedback: feedback[id] }
        : avatar
    ))
    console.log(`Avatar ${id} ${status}:`, feedback[id])
  }

  const generateNewAvatars = () => {
    setIsGenerating(true)
    //todo: remove mock functionality - integrate with OpenAI API
    setTimeout(() => {
      const newAvatar: CustomerAvatar = {
        id: Date.now().toString(),
        name: "Fitness Enthusiast",
        age: "22-40", 
        demographics: "Gym members, active lifestyle, supplement users",
        painPoint: "Struggling to meet protein goals with whole foods",
        hooks: [
          "Hit your macros without the math",
          "Real food, real gains",
          "Stop choking down protein powder"
        ],
        status: "pending"
      }
      setAvatars(prev => [newAvatar, ...prev])
      setIsGenerating(false)
    }, 2000)
  }

  const pendingCount = avatars.filter(a => a.status === "pending").length
  const approvedCount = avatars.filter(a => a.status === "approved").length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Research Agent</h1>
            <p className="text-muted-foreground">Generate customer avatars and winning ad angles</p>
          </div>
        </div>
        <Button 
          onClick={generateNewAvatars}
          disabled={isGenerating}
          data-testid="button-generate-avatars"
        >
          {isGenerating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
          {isGenerating ? "Generating..." : "Generate New Avatars"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Avatars</CardDescription>
            <CardTitle className="text-2xl font-bold">{avatars.length}</CardTitle>
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
            <CardDescription className="text-xs">Approved</CardDescription>
            <CardTitle className="text-2xl font-bold text-green-600">{approvedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Success Rate</CardDescription>
            <CardTitle className="text-2xl font-bold">
              {avatars.length > 0 ? Math.round((approvedCount / avatars.length) * 100) : 0}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Avatar Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Customer Avatars & Ad Angles
        </h2>
        
        {avatars.map((avatar) => (
          <Card key={avatar.id} className="hover-elevate" data-testid={`card-avatar-${avatar.id}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{avatar.name}</CardTitle>
                  <Badge 
                    variant={
                      avatar.status === "approved" ? "default" : 
                      avatar.status === "rejected" ? "destructive" : "secondary"
                    }
                  >
                    {avatar.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">Age: {avatar.age}</div>
              </div>
              <CardDescription>{avatar.demographics}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Pain Point */}
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-600">Pain Point</span>
                </div>
                <p className="text-sm">{avatar.painPoint}</p>
              </div>

              {/* Hooks */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Ad Hooks</h4>
                {avatar.hooks.map((hook, index) => (
                  <div key={index} className="p-3 rounded-lg bg-muted/50 border">
                    <p className="text-sm">"{hook}"</p>
                  </div>
                ))}
              </div>

              {/* Feedback Section */}
              {avatar.status === "pending" && (
                <div className="space-y-3 pt-4 border-t">
                  <Textarea
                    placeholder="Add feedback or comments..."
                    value={feedback[avatar.id] || ""}
                    onChange={(e) => setFeedback(prev => ({ ...prev, [avatar.id]: e.target.value }))}
                    rows={2}
                    data-testid={`textarea-feedback-${avatar.id}`}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproval(avatar.id, "approved")}
                      data-testid={`button-approve-${avatar.id}`}
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleApproval(avatar.id, "rejected")}
                      data-testid={`button-reject-${avatar.id}`}
                    >
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              )}

              {/* Show feedback if already reviewed */}
              {avatar.status !== "pending" && avatar.feedback && (
                <div className="p-3 rounded-lg bg-muted/50 border-l-4 border-l-primary">
                  <p className="text-sm"><strong>Feedback:</strong> {avatar.feedback}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}