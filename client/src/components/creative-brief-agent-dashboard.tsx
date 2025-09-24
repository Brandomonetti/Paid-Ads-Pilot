import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  FileText, 
  ThumbsUp, 
  ThumbsDown, 
  RefreshCw, 
  Palette, 
  Users, 
  Target, 
  MessageSquare, 
  Send, 
  Download, 
  Eye,
  Camera,
  Megaphone,
  Lightbulb,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react"

interface CreativeBrief {
  id: string
  title: string
  brand: string
  objective: string
  format: "UGC Video" | "Static Image" | "Carousel" | "Story Series" | "Long Form"
  platform: "TikTok" | "Instagram" | "Facebook" | "YouTube" | "Multi-Platform"
  targetAudience: string
  keyMessage: string
  visualDirection: {
    mood: string
    colorScheme: string
    lighting: string
    setting: string
  }
  creatorRequirements: {
    demographics: string
    persona: string
    experience: string
    equipment: string
  }
  scriptElements: {
    hook: string
    problemAgitation: string
    solution: string
    cta: string
  }
  brandGuidelines: {
    dosList: string[]
    dontsList: string[]
    brandVoice: string
  }
  deliverables: string[]
  timeline: string
  budget: string
  status: "pending" | "approved" | "rejected" | "in_review"
  feedback?: string
  createdAt: string
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export function CreativeBriefAgentDashboard() {
  //todo: remove mock functionality - replace with real OpenAI integration
  const [briefs, setBriefs] = useState<CreativeBrief[]>([
    {
      id: "1",
      title: "Weight Loss Transformation UGC Campaign",
      brand: "FitLife Supplements",
      objective: "Drive supplement sales through authentic transformation stories",
      format: "UGC Video",
      platform: "TikTok",
      targetAudience: "Health-conscious millennials (25-35) seeking weight loss solutions",
      keyMessage: "Real people, real results with FitLife's proven supplements",
      visualDirection: {
        mood: "Authentic, motivational, raw",
        colorScheme: "Natural lighting, warm tones",
        lighting: "Natural lighting preferred, bathroom/bedroom settings",
        setting: "Home environment - bathroom mirror, bedroom, kitchen"
      },
      creatorRequirements: {
        demographics: "Male, 25-35 years old, fitness journey documented",
        persona: "Relatable guy-next-door who struggled with weight",
        experience: "Previous weight loss content, genuine transformation story",
        equipment: "Smartphone camera, ring light optional"
      },
      scriptElements: {
        hook: "POV: You've tried every diet and nothing worked... until this",
        problemAgitation: "Show before photos, discuss failed attempts, frustration",
        solution: "Introduce FitLife supplements, show current physique",
        cta: "Link in bio for 30% off your first order - transform like I did"
      },
      brandGuidelines: {
        dosList: [
          "Emphasize real transformation journey",
          "Show product naturally in routine",
          "Maintain authentic, unpolished feel",
          "Include disclaimer about individual results"
        ],
        dontsList: [
          "Make unrealistic claims",
          "Over-produce or over-edit content", 
          "Hide sponsored content disclosure",
          "Compare to competitors directly"
        ],
        brandVoice: "Encouraging, authentic, results-focused but realistic"
      },
      deliverables: [
        "60-second TikTok video",
        "3 Instagram Reels variations",
        "Behind-the-scenes content",
        "Progress photo carousel"
      ],
      timeline: "7 days",
      budget: "$2,500 + product",
      status: "approved",
      createdAt: "2024-09-24"
    },
    {
      id: "2",
      title: "Organic Food Family Meal Campaign",
      brand: "FreshHarvest Organic",
      objective: "Increase brand awareness among busy parents",
      format: "Carousel",
      platform: "Instagram",
      targetAudience: "Working parents (28-45) concerned about family nutrition",
      keyMessage: "Healthy family meals made simple with organic ingredients",
      visualDirection: {
        mood: "Warm, family-oriented, clean",
        colorScheme: "Fresh greens, warm whites, natural wood tones",
        lighting: "Bright natural kitchen lighting",
        setting: "Clean, modern family kitchen"
      },
      creatorRequirements: {
        demographics: "Parent (any gender), 28-45, with young children",
        persona: "Busy but health-conscious parent who loves cooking",
        experience: "Family cooking content, meal prep expertise",
        equipment: "DSLR or high-quality smartphone, tripod"
      },
      scriptElements: {
        hook: "Dinner time stress? Not anymore. Here's how I feed my family organic for under $50/week",
        problemAgitation: "Show typical evening chaos, expensive grocery bills",
        solution: "Introduce FreshHarvest meal planning system",
        cta: "Save 20% on your first organic meal plan - link in stories"
      },
      brandGuidelines: {
        dosList: [
          "Show real family interactions",
          "Highlight cost savings", 
          "Feature diverse meal options",
          "Show kids enjoying the food"
        ],
        dontsList: [
          "Make it look too perfect or staged",
          "Ignore dietary restrictions/allergies",
          "Focus only on appearance over nutrition",
          "Overwhelming prep complexity"
        ],
        brandVoice: "Supportive, practical, family-first"
      },
      deliverables: [
        "10-slide recipe carousel",
        "Shopping list template",
        "Meal prep video",
        "Customer testimonial story"
      ],
      timeline: "5 days",
      budget: "$1,800 + product",
      status: "pending",
      createdAt: "2024-09-24"
    }
  ])

  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState("")
  const [selectedBudget, setSelectedBudget] = useState("")

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your Creative Brief Agent. I can help you create comprehensive creative direction documents for your campaigns. What kind of creative brief would you like to develop today?",
      timestamp: new Date().toISOString()
    }
  ])
  const [currentMessage, setCurrentMessage] = useState("")

  const handleApproval = (id: string, status: "approved" | "rejected" | "in_review") => {
    setBriefs(prev => prev.map(brief => 
      brief.id === id 
        ? { ...brief, status, feedback: feedback[id] }
        : brief
    ))
    console.log(`Brief ${id} ${status}:`, feedback[id])
  }

  const generateBrief = () => {
    setIsGenerating(true)
    //todo: remove mock functionality - integrate with OpenAI for brief generation
    setTimeout(() => {
      const newBrief: CreativeBrief = {
        id: Date.now().toString(),
        title: "AI-Generated Campaign Brief",
        brand: "Sample Brand",
        objective: "Generated based on research insights and campaign requirements",
        format: "UGC Video",
        platform: "Multi-Platform", 
        targetAudience: "Generated target audience based on research data",
        keyMessage: "Compelling message derived from customer avatars",
        visualDirection: {
          mood: "Authentic and engaging",
          colorScheme: "Brand-aligned colors",
          lighting: "Natural and appealing",
          setting: "Contextually relevant"
        },
        creatorRequirements: {
          demographics: "Optimized creator profile",
          persona: "Audience-matched personality",
          experience: "Required content expertise",
          equipment: "Professional quality setup"
        },
        scriptElements: {
          hook: "Attention-grabbing opening",
          problemAgitation: "Pain point amplification",
          solution: "Product positioning",
          cta: "Conversion-optimized call to action"
        },
        brandGuidelines: {
          dosList: ["Key brand requirements", "Content best practices"],
          dontsList: ["Brand violations to avoid", "Content restrictions"],
          brandVoice: "Consistent brand personality"
        },
        deliverables: ["Primary content piece", "Supporting materials"],
        timeline: "Optimal delivery timeline",
        budget: "Market-appropriate budget",
        status: "pending",
        createdAt: new Date().toISOString().split('T')[0]
      }
      setBriefs(prev => [newBrief, ...prev])
      setIsGenerating(false)
    }, 3000)
  }

  const sendChatMessage = () => {
    if (!currentMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: currentMessage,
      timestamp: new Date().toISOString()
    }

    setChatMessages(prev => [...prev, userMessage])
    setCurrentMessage("")

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant", 
        content: "I understand your requirements. Let me help you create a detailed creative brief that addresses those needs. Would you like me to generate a draft based on your specifications?",
        timestamp: new Date().toISOString()
      }
      setChatMessages(prev => [...prev, aiResponse])
    }, 1500)
  }

  const downloadBrief = (brief: CreativeBrief) => {
    console.log(`Downloading brief: ${brief.title}`)
    //todo: implement PDF generation functionality
  }

  const pendingCount = briefs.filter(b => b.status === "pending").length
  const approvedCount = briefs.filter(b => b.status === "approved").length
  const inReviewCount = briefs.filter(b => b.status === "in_review").length

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"  
      case "in_review": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "pending": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4" />
      case "rejected": return <XCircle className="h-4 w-4" />
      case "in_review": return <Eye className="h-4 w-4" />
      case "pending": return <Clock className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Creative Brief Agent</h1>
            <p className="text-muted-foreground">Generate comprehensive creative direction documents</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedFormat} onValueChange={setSelectedFormat}>
            <SelectTrigger className="w-40" data-testid="select-format">
              <SelectValue placeholder="Content format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ugc-video">UGC Video</SelectItem>
              <SelectItem value="static-image">Static Image</SelectItem>
              <SelectItem value="carousel">Carousel</SelectItem>
              <SelectItem value="story-series">Story Series</SelectItem>
              <SelectItem value="long-form">Long Form</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-40" data-testid="select-platform">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="multi-platform">Multi-Platform</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedBudget} onValueChange={setSelectedBudget}>
            <SelectTrigger className="w-40" data-testid="select-budget">
              <SelectValue placeholder="Budget range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under-1k">Under $1K</SelectItem>
              <SelectItem value="1k-5k">$1K - $5K</SelectItem>
              <SelectItem value="5k-10k">$5K - $10K</SelectItem>
              <SelectItem value="10k-plus">$10K+</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={generateBrief}
            disabled={isGenerating}
            data-testid="button-generate-brief"
          >
            {isGenerating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
            {isGenerating ? "Generating..." : "Generate Brief"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Briefs</CardDescription>
            <CardTitle className="text-2xl font-bold">{briefs.length}</CardTitle>
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
            <CardDescription className="text-xs">In Review</CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-600">{inReviewCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chat Interface */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Brief Development Chat
            </CardTitle>
            <CardDescription>Refine your creative requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Chat Messages */}
            <div className="space-y-3 max-h-64 overflow-y-auto" data-testid="chat-messages">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="flex gap-2">
              <Textarea
                placeholder="Describe your creative brief requirements..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    sendChatMessage()
                  }
                }}
                data-testid="textarea-chat-input"
              />
              <Button
                size="sm"
                onClick={sendChatMessage}
                disabled={!currentMessage.trim()}
                data-testid="button-send-chat"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Creative Briefs List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generated Creative Briefs
          </h2>
          
          {briefs.map((brief) => (
            <Card key={brief.id} className="hover-elevate" data-testid={`card-brief-${brief.id}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <CardTitle className="text-lg">{brief.title}</CardTitle>
                      <CardDescription>{brief.brand} • {brief.platform} • {brief.format}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(brief.status)}>
                      {getStatusIcon(brief.status)}
                      <span className="ml-1">{brief.status.replace('-', ' ').toUpperCase()}</span>
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => downloadBrief(brief)}
                      data-testid={`button-download-${brief.id}`}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="overview" className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="visual" className="flex items-center gap-1">
                      <Palette className="h-3 w-3" />
                      Visual
                    </TabsTrigger>
                    <TabsTrigger value="creator" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Creator
                    </TabsTrigger>
                    <TabsTrigger value="script" className="flex items-center gap-1">
                      <Megaphone className="h-3 w-3" />
                      Script
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-3 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-muted/50 border">
                        <p className="text-xs font-medium text-muted-foreground">OBJECTIVE</p>
                        <p className="text-sm mt-1">{brief.objective}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 border">
                        <p className="text-xs font-medium text-muted-foreground">TARGET AUDIENCE</p>
                        <p className="text-sm mt-1">{brief.targetAudience}</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 border">
                      <p className="text-xs font-medium text-muted-foreground">KEY MESSAGE</p>
                      <p className="text-sm mt-1">{brief.keyMessage}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-2 rounded border bg-card">
                        <p className="text-xs text-muted-foreground">Timeline</p>
                        <p className="font-medium">{brief.timeline}</p>
                      </div>
                      <div className="text-center p-2 rounded border bg-card">
                        <p className="text-xs text-muted-foreground">Budget</p>
                        <p className="font-medium">{brief.budget}</p>
                      </div>
                      <div className="text-center p-2 rounded border bg-card">
                        <p className="text-xs text-muted-foreground">Deliverables</p>
                        <p className="font-medium">{brief.deliverables.length}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="visual" className="space-y-3 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-muted/50 border">
                        <p className="text-xs font-medium text-muted-foreground">MOOD & TONE</p>
                        <p className="text-sm mt-1">{brief.visualDirection.mood}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 border">
                        <p className="text-xs font-medium text-muted-foreground">COLOR SCHEME</p>
                        <p className="text-sm mt-1">{brief.visualDirection.colorScheme}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 border">
                        <p className="text-xs font-medium text-muted-foreground">LIGHTING</p>
                        <p className="text-sm mt-1">{brief.visualDirection.lighting}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 border">
                        <p className="text-xs font-medium text-muted-foreground">SETTING</p>
                        <p className="text-sm mt-1">{brief.visualDirection.setting}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="creator" className="space-y-3 mt-4">
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-muted/50 border">
                        <p className="text-xs font-medium text-muted-foreground">DEMOGRAPHICS</p>
                        <p className="text-sm mt-1">{brief.creatorRequirements.demographics}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 border">
                        <p className="text-xs font-medium text-muted-foreground">PERSONA</p>
                        <p className="text-sm mt-1">{brief.creatorRequirements.persona}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-muted/50 border">
                          <p className="text-xs font-medium text-muted-foreground">EXPERIENCE</p>
                          <p className="text-sm mt-1">{brief.creatorRequirements.experience}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50 border">
                          <p className="text-xs font-medium text-muted-foreground">EQUIPMENT</p>
                          <p className="text-sm mt-1">{brief.creatorRequirements.equipment}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="script" className="space-y-3 mt-4">
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-muted/50 border">
                        <p className="text-xs font-medium text-muted-foreground">HOOK</p>
                        <p className="text-sm mt-1">{brief.scriptElements.hook}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 border">
                        <p className="text-xs font-medium text-muted-foreground">PROBLEM AGITATION</p>
                        <p className="text-sm mt-1">{brief.scriptElements.problemAgitation}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 border">
                        <p className="text-xs font-medium text-muted-foreground">SOLUTION</p>
                        <p className="text-sm mt-1">{brief.scriptElements.solution}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 border">
                        <p className="text-xs font-medium text-muted-foreground">CALL TO ACTION</p>
                        <p className="text-sm mt-1">{brief.scriptElements.cta}</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Brand Guidelines */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                    <p className="text-xs font-medium text-green-800 dark:text-green-200">DO'S</p>
                    <ul className="text-xs mt-2 space-y-1">
                      {brief.brandGuidelines.dosList.slice(0, 2).map((item, index) => (
                        <li key={index} className="text-green-700 dark:text-green-300">• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                    <p className="text-xs font-medium text-red-800 dark:text-red-200">DON'TS</p>
                    <ul className="text-xs mt-2 space-y-1">
                      {brief.brandGuidelines.dontsList.slice(0, 2).map((item, index) => (
                        <li key={index} className="text-red-700 dark:text-red-300">• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Approval Section */}
                {brief.status === "pending" && (
                  <div className="space-y-3 pt-4 border-t">
                    <Textarea
                      placeholder="Add feedback or revision notes..."
                      value={feedback[brief.id] || ""}
                      onChange={(e) => setFeedback(prev => ({ ...prev, [brief.id]: e.target.value }))}
                      rows={2}
                      data-testid={`textarea-feedback-${brief.id}`}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproval(brief.id, "approved")}
                        data-testid={`button-approve-${brief.id}`}
                      >
                        <ThumbsUp className="mr-2 h-4 w-4" />
                        Approve Brief
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApproval(brief.id, "in_review")}
                        data-testid={`button-review-${brief.id}`}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Needs Review
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleApproval(brief.id, "rejected")}
                        data-testid={`button-reject-${brief.id}`}
                      >
                        <ThumbsDown className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}

                {/* Show feedback if already reviewed */}
                {brief.status !== "pending" && brief.feedback && (
                  <div className="p-3 rounded-lg bg-muted/50 border-l-4 border-l-primary">
                    <p className="text-sm"><strong>Feedback:</strong> {brief.feedback}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}