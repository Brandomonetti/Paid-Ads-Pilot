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
  XCircle,
  ExternalLink,
  Video,
  Check,
  X
} from "lucide-react"

interface CreativeBrief {
  id: string
  title: string
  brand: string
  // Header Information
  avatar: string
  angle: string
  desire: string
  funnelStage: string
  reference: string
  // Production Details
  rawFiles: string
  duration: string
  aiVo: boolean
  subtitles: boolean
  // Content Blocks
  blocks: ContentBlock[]
  status: "pending" | "approved" | "rejected" | "in_review"
  feedback?: string
  createdAt: string
}

interface ContentBlock {
  id: string
  name: string
  voiceOver: string
  textOverlay: string
  notes: string
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
      title: "Smooth Skin UGC Campaign",
      brand: "The Peach Please",
      avatar: "The Waxer", 
      angle: "Boyfriend obsession",
      desire: "Compliment-worthy smoothness without the pain or hassle",
      funnelStage: "TOF (Top of Funnel)",
      reference: "https://app.tryatria.com/ad/m691332663653007",
      rawFiles: "please use shots from here",
      duration: "Approx. 30s",
      aiVo: true,
      subtitles: true,
      blocks: [
        {
          id: "1",
          name: "Hook",
          voiceOver: "H1: 'My cooch is SO soft, that literally my guy kept commenting on it..' H2: The moment my guy saw my cooch.. H3: 'I thought my guy was already obsessed with my cooch, but when he saw it today",
          textOverlay: "How to get you 🤭 bald ASF without waxing",
          notes: "Visual of woman applying product"
        },
        {
          id: "2", 
          name: "Debunking Alternatives",
          voiceOver: "He was like, 'Damn, it's perfectly smooth. Did you get it done with lasers? Boy, no, I did not. And no, I did not wax it either.'",
          textOverlay: "",
          notes: ""
        },
        {
          id: "3",
          name: "Benefit",
          voiceOver: "I literally found this, the Peach Please trimmer. I used it in the shower and it was just so smooth. I honestly was just flabbergasted...",
          textOverlay: "",
          notes: ""
        },
        {
          id: "4",
          name: "Features", 
          voiceOver: "...because it was just from this one thing right here. Dry shaving, using conditioner... all that can be done with this thing right here.",
          textOverlay: "",
          notes: ""
        }
      ],
      status: "approved",
      createdAt: "2024-09-24"
    },
    {
      id: "2",
      title: "Weight Loss Transformation Campaign",
      brand: "FitLife Supplements",
      avatar: "The Transformer",
      angle: "Shocking before/after results",
      desire: "Rapid visible weight loss that gets people asking 'how?'",
      funnelStage: "MOF (Middle of Funnel)", 
      reference: "https://example.com/reference-ad",
      rawFiles: "Use before/after photos provided",
      duration: "45s",
      aiVo: false,
      subtitles: true,
      blocks: [
        {
          id: "1",
          name: "Hook",
          voiceOver: "People keep asking me how I lost 30 pounds in 3 months...",
          textOverlay: "Lost 30lbs in 90 days 🤯",
          notes: "Show dramatic before photo"
        },
        {
          id: "2",
          name: "Problem Agitation",
          voiceOver: "I tried everything - keto, intermittent fasting, even those crazy detox teas...",
          textOverlay: "Nothing worked until...",
          notes: "Show failed diet attempts"
        },
        {
          id: "3", 
          name: "Solution Reveal",
          voiceOver: "Then I discovered FitLife's metabolism booster and everything changed.",
          textOverlay: "This changed everything ⬇️",
          notes: "Product reveal with current physique"
        },
        {
          id: "4",
          name: "Social Proof",
          voiceOver: "My trainer couldn't believe the results. Even my doctor was impressed.",
          textOverlay: "Even my doctor was shocked 😱",
          notes: "Show testimonials/reactions"
        },
        {
          id: "5",
          name: "Call to Action",
          voiceOver: "Link in bio for 30% off - this deal ends tonight!",
          textOverlay: "30% OFF expires tonight! 🔗",
          notes: "Urgency with clear CTA"
        }
      ],
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
        avatar: "AI-Generated Avatar",
        angle: "Compelling brand positioning",
        desire: "Drive engagement and conversions",
        funnelStage: "MOF (Middle of Funnel)",
        reference: "https://example.com/reference",
        rawFiles: "Use provided brand assets",
        duration: "30-45s",
        aiVo: true,
        subtitles: true,
        blocks: [
          {
            id: "1",
            name: "Hook",
            voiceOver: "Attention-grabbing opening that stops the scroll",
            textOverlay: "Problem solved! 🎯",
            notes: "Strong visual hook"
          },
          {
            id: "2", 
            name: "Problem Agitation",
            voiceOver: "Paint the pain point clearly and relatable",
            textOverlay: "Struggling with...",
            notes: "Show problem visually"
          },
          {
            id: "3",
            name: "Solution",
            voiceOver: "Introduce the product as the perfect solution",
            textOverlay: "Here's how I fixed it",
            notes: "Product reveal"
          },
          {
            id: "4",
            name: "Call to Action",
            voiceOver: "Clear next step with urgency",
            textOverlay: "Link in bio! ⬆️",
            notes: "Strong CTA with urgency"
          }
        ],
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
            <p className="text-muted-foreground">Creates detailed creative briefs with shot-by-shot breakdowns for your video content. Transforms your scripts into comprehensive production guides with specific voiceover, text overlays, and visual direction.</p>
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
                      <CardDescription>{brief.brand} • {brief.funnelStage} • {brief.duration}</CardDescription>
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

              <CardContent className="space-y-6">
                {/* Header Information */}
                <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-4 border border-blue-100/50 dark:border-blue-800/30">
                  <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Creative Strategy
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Avatar Card */}
                    <div className="bg-white/80 dark:bg-gray-900/80 rounded-md p-3 border border-gray-200/50 dark:border-gray-700/50">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Avatar</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{brief.avatar}</div>
                    </div>
                    
                    {/* Angle Card */}
                    <div className="bg-white/80 dark:bg-gray-900/80 rounded-md p-3 border border-gray-200/50 dark:border-gray-700/50">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Angle</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{brief.angle}</div>
                    </div>
                    
                    {/* Funnel Stage Card */}
                    <div className="bg-white/80 dark:bg-gray-900/80 rounded-md p-3 border border-gray-200/50 dark:border-gray-700/50">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Funnel Stage</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{brief.funnelStage}</div>
                    </div>
                  </div>
                  
                  {/* Desire - Full Width */}
                  <div className="mt-4 bg-white/80 dark:bg-gray-900/80 rounded-md p-3 border border-gray-200/50 dark:border-gray-700/50">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Desired Outcome</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{brief.desire}</div>
                  </div>
                  
                  {/* Reference Link */}
                  {brief.reference && (
                    <div className="mt-4 bg-white/80 dark:bg-gray-900/80 rounded-md p-3 border border-gray-200/50 dark:border-gray-700/50">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Reference Material</div>
                      <a href={brief.reference} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline flex items-center gap-1" data-testid={`link-reference-${brief.id}`}>
                        View Reference
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Production Details */}
                <div className="bg-green-50/50 dark:bg-green-950/20 rounded-lg p-4 border border-green-100/50 dark:border-green-800/30">
                  <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Production Specs
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/80 dark:bg-gray-900/80 rounded-md p-3 border border-gray-200/50 dark:border-gray-700/50">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Duration</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{brief.duration}</div>
                    </div>
                    <div className="bg-white/80 dark:bg-gray-900/80 rounded-md p-3 border border-gray-200/50 dark:border-gray-700/50">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">AI Voiceover</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1">
                        {brief.aiVo ? <Check className="w-3 h-3 text-green-600" /> : <X className="w-3 h-3 text-red-600" />}
                        {brief.aiVo ? "Yes" : "No"}
                      </div>
                    </div>
                    <div className="bg-white/80 dark:bg-gray-900/80 rounded-md p-3 border border-gray-200/50 dark:border-gray-700/50">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Subtitles</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1">
                        {brief.subtitles ? <Check className="w-3 h-3 text-green-600" /> : <X className="w-3 h-3 text-red-600" />}
                        {brief.subtitles ? "Yes" : "No"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Blocks Table */}
                <div className="border-t pt-4">
                  <div className="border rounded-lg overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-4 bg-muted/50 border-b">
                      <div className="p-3 font-medium text-sm border-r">Block</div>
                      <div className="p-3 font-medium text-sm border-r">VO</div>
                      <div className="p-3 font-medium text-sm border-r">Text Overlay</div>
                      <div className="p-3 font-medium text-sm">Notes</div>
                    </div>
                    
                    {/* Table Rows */}
                    {brief.blocks.map((block, index) => (
                      <div key={block.id} className={`grid grid-cols-4 ${index !== brief.blocks.length - 1 ? 'border-b' : ''}`}>
                        <div className="p-3 border-r">
                          <span className="text-sm font-medium">{index + 1}. {block.name}</span>
                        </div>
                        <div className="p-3 border-r">
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{block.voiceOver}</p>
                        </div>
                        <div className="p-3 border-r">
                          <p className="text-sm">{block.textOverlay}</p>
                        </div>
                        <div className="p-3">
                          <div className="space-y-2">
                            {/* Check if notes contain a URL for visual example */}
                            {block.notes?.includes('http') && (
                              <div className="mb-2">
                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Visual Example:</div>
                                <a 
                                  href={block.notes.match(/https?:\/\/[^\s]+/)?.[0]} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-xs rounded border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                  data-testid={`link-example-${block.id}`}
                                >
                                  <Video className="w-3 h-3" />
                                  View Example
                                </a>
                                <p className="text-sm text-muted-foreground mt-2">
                                  {block.notes.replace(/https?:\/\/[^\s]+/g, '').trim() || 'Reference the example above for visual inspiration.'}
                                </p>
                              </div>
                            )}
                            {/* Regular notes without URL */}
                            {!block.notes?.includes('http') && (
                              <p className="text-sm text-muted-foreground">{block.notes || 'Follow the voiceover and text overlay for this scene.'}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
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