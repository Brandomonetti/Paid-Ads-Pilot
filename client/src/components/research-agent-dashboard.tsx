import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, ThumbsUp, ThumbsDown, Users, Target, Zap, RefreshCw, TrendingUp, Play, Eye, ExternalLink } from "lucide-react"

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

interface CreativeConcept {
  id: string
  title: string
  format: string
  platform: string
  industry: string
  performance: {
    views: string
    engagement: string
    conversionRate: string
  }
  insights: string[]
  keyElements: string[]
  status: "pending" | "approved" | "rejected"
  feedback?: string
  referenceUrl?: string
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

  //todo: remove mock functionality - replace with social media analysis APIs
  const [creativeConcepts, setCreativeConcepts] = useState<CreativeConcept[]>([
    {
      id: "1",
      title: "Raw UGC with Male Speaker - Weight Loss Transformation",
      format: "Raw UGC Video",
      platform: "TikTok/Instagram Reels",
      industry: "Health & Wellness",
      performance: {
        views: "2.3M",
        engagement: "8.7%",
        conversionRate: "4.2%"
      },
      insights: [
        "Male speakers convert 40% better in weight loss niche",
        "Raw, unpolished aesthetic increases authenticity perception",
        "Before/after reveals drive 85% completion rates"
      ],
      keyElements: [
        "Male creator (25-35 years old)",
        "Bathroom/bedroom setting (authentic)",
        "Raw lighting (natural/phone)",
        "Direct camera address",
        "Before/after comparison"
      ],
      status: "approved",
      referenceUrl: "#"
    },
    {
      id: "2",
      title: "POV Hook Format - Trendjacking Success",
      format: "POV Storytelling",
      platform: "TikTok",
      industry: "Health & Wellness", 
      performance: {
        views: "1.8M",
        engagement: "12.3%",
        conversionRate: "3.8%"
      },
      insights: [
        "'POV: You're a...' hooks average 2.3M+ views",
        "Storytelling format increases emotional connection",
        "Trendjacking current events boosts organic reach"
      ],
      keyElements: [
        "POV hook opener",
        "Relatable character setup",
        "Problem-solution narrative",
        "Trending audio/music",
        "Text overlay guidance"
      ],
      status: "pending",
      referenceUrl: "#"
    },
    {
      id: "3",
      title: "Kitchen Transformation - Quick Recipe Demo",
      format: "Sped-up Process Video",
      platform: "Instagram Reels",
      industry: "Food & Nutrition",
      performance: {
        views: "950K",
        engagement: "6.2%", 
        conversionRate: "2.9%"
      },
      insights: [
        "Kitchen content performs well in food/health niches",
        "Sped-up transformations hold attention",
        "Ingredient reveals create curiosity gap"
      ],
      keyElements: [
        "Clean, well-lit kitchen",
        "Ingredient mystery/reveal",
        "Time-lapse cooking process",
        "Final product showcase",
        "Recipe/link in bio CTA"
      ],
      status: "pending",
      referenceUrl: "#"
    }
  ])

  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("avatars")

  const handleAvatarApproval = (id: string, status: "approved" | "rejected") => {
    setAvatars(prev => prev.map(avatar => 
      avatar.id === id 
        ? { ...avatar, status, feedback: feedback[id] }
        : avatar
    ))
    console.log(`Avatar ${id} ${status}:`, feedback[id])
  }

  const handleConceptApproval = (id: string, status: "approved" | "rejected") => {
    setCreativeConcepts(prev => prev.map(concept => 
      concept.id === id 
        ? { ...concept, status, feedback: feedback[id] }
        : concept
    ))
    console.log(`Concept ${id} ${status}:`, feedback[id])
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

  const generateNewConcepts = () => {
    setIsGenerating(true)
    //todo: remove mock functionality - integrate with social media APIs
    setTimeout(() => {
      const newConcept: CreativeConcept = {
        id: Date.now().toString(),
        title: "Day in My Life - Healthy Eating Edition",
        format: "DIML Storytelling",
        platform: "TikTok/Instagram Stories",
        industry: "Health & Wellness",
        performance: {
          views: "1.2M",
          engagement: "9.4%",
          conversionRate: "3.1%"
        },
        insights: [
          "DIML content creates parasocial connection",
          "Healthy lifestyle documentation trending",
          "Multiple touchpoints increase conversion"
        ],
        keyElements: [
          "Morning routine showcase",
          "Meal prep moments", 
          "Product integration naturally",
          "Authentic lifestyle documentation",
          "Multiple story segments"
        ],
        status: "pending",
        referenceUrl: "#"
      }
      setCreativeConcepts(prev => [newConcept, ...prev])
      setIsGenerating(false)
    }, 2000)
  }

  const pendingAvatars = avatars.filter(a => a.status === "pending").length
  const approvedAvatars = avatars.filter(a => a.status === "approved").length
  const pendingConcepts = creativeConcepts.filter(c => c.status === "pending").length
  const approvedConcepts = creativeConcepts.filter(c => c.status === "approved").length

  const getFormatColor = (format: string) => {
    switch (format.toLowerCase()) {
      case "raw ugc video": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "pov storytelling": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "sped-up process video": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "diml storytelling": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

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
            <p className="text-muted-foreground">Customer research & viral creative concept analysis</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="avatars" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customer Avatars
          </TabsTrigger>
          <TabsTrigger value="concepts" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Creative Concepts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="avatars" className="space-y-6">
          {/* Avatar Stats */}
          <div className="flex items-center justify-between">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">Total Avatars</CardDescription>
                  <CardTitle className="text-2xl font-bold">{avatars.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">Pending Review</CardDescription>
                  <CardTitle className="text-2xl font-bold text-orange-600">{pendingAvatars}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">Approved</CardDescription>
                  <CardTitle className="text-2xl font-bold text-green-600">{approvedAvatars}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">Success Rate</CardDescription>
                  <CardTitle className="text-2xl font-bold">
                    {avatars.length > 0 ? Math.round((approvedAvatars / avatars.length) * 100) : 0}%
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
            <Button 
              onClick={generateNewAvatars}
              disabled={isGenerating}
              data-testid="button-generate-avatars"
              className="ml-4"
            >
              {isGenerating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
              {isGenerating ? "Generating..." : "Generate Avatars"}
            </Button>
          </div>

          {/* Avatar Cards */}
          <div className="space-y-4">
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
                          onClick={() => handleAvatarApproval(avatar.id, "approved")}
                          data-testid={`button-approve-${avatar.id}`}
                        >
                          <ThumbsUp className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleAvatarApproval(avatar.id, "rejected")}
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
        </TabsContent>

        <TabsContent value="concepts" className="space-y-6">
          {/* Concept Stats */}
          <div className="flex items-center justify-between">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">Total Concepts</CardDescription>
                  <CardTitle className="text-2xl font-bold">{creativeConcepts.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">Pending Review</CardDescription>
                  <CardTitle className="text-2xl font-bold text-orange-600">{pendingConcepts}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">Approved</CardDescription>
                  <CardTitle className="text-2xl font-bold text-green-600">{approvedConcepts}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">Avg Views</CardDescription>
                  <CardTitle className="text-2xl font-bold">1.7M</CardTitle>
                </CardHeader>
              </Card>
            </div>
            <Button 
              onClick={generateNewConcepts}
              disabled={isGenerating}
              data-testid="button-generate-concepts"
              className="ml-4"
            >
              {isGenerating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
              {isGenerating ? "Analyzing..." : "Find Concepts"}
            </Button>
          </div>

          {/* Creative Concept Cards */}
          <div className="space-y-4">
            {creativeConcepts.map((concept) => (
              <Card key={concept.id} className="hover-elevate" data-testid={`card-concept-${concept.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{concept.title}</CardTitle>
                      <Badge className={getFormatColor(concept.format)}>
                        {concept.format}
                      </Badge>
                      <Badge 
                        variant={
                          concept.status === "approved" ? "default" : 
                          concept.status === "rejected" ? "destructive" : "secondary"
                        }
                      >
                        {concept.status}
                      </Badge>
                    </div>
                    {concept.referenceUrl && (
                      <Button size="sm" variant="ghost" asChild>
                        <a href={concept.referenceUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                  <CardDescription>{concept.platform} • {concept.industry}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/30 border">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{concept.performance.views}</p>
                      <p className="text-xs text-muted-foreground">Views</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{concept.performance.engagement}</p>
                      <p className="text-xs text-muted-foreground">Engagement</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{concept.performance.conversionRate}</p>
                      <p className="text-xs text-muted-foreground">Conversion</p>
                    </div>
                  </div>

                  {/* Insights */}
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-sm text-blue-700 dark:text-blue-300 mb-2">Key Insights</h4>
                    <ul className="space-y-1">
                      {concept.insights.map((insight, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Key Elements */}
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <h4 className="font-medium text-sm text-green-700 dark:text-green-300 mb-2">Key Creative Elements</h4>
                    <div className="flex flex-wrap gap-2">
                      {concept.keyElements.map((element, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {element}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Section */}
                  {concept.status === "pending" && (
                    <div className="space-y-3 pt-4 border-t">
                      <Textarea
                        placeholder="Add feedback or usage notes..."
                        value={feedback[concept.id] || ""}
                        onChange={(e) => setFeedback(prev => ({ ...prev, [concept.id]: e.target.value }))}
                        rows={2}
                        data-testid={`textarea-feedback-${concept.id}`}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleConceptApproval(concept.id, "approved")}
                          data-testid={`button-approve-${concept.id}`}
                        >
                          <ThumbsUp className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleConceptApproval(concept.id, "rejected")}
                          data-testid={`button-reject-${concept.id}`}
                        >
                          <ThumbsDown className="mr-2 h-4 w-4" />
                          Not Suitable
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Show feedback if already reviewed */}
                  {concept.status !== "pending" && concept.feedback && (
                    <div className="p-3 rounded-lg bg-muted/50 border-l-4 border-l-primary">
                      <p className="text-sm"><strong>Notes:</strong> {concept.feedback}</p>
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