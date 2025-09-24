import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, ThumbsUp, ThumbsDown, Play, Copy, RefreshCw, Video, Clock, CheckCircle, Users, TrendingUp, ArrowLeft } from "lucide-react"

interface Script {
  id: string
  title: string
  duration: string
  scriptType: "ugc" | "testimonial" | "demo" | "story"
  summary: string // One-liner explaining target, problem, and angle
  content: {
    avatar: string // Who we're targeting
    marketingAngle: string // The approach/hook we're using
    awarenessStage: "unaware" | "problem aware" | "solution aware" | "product aware" | "most aware" // Audience awareness level
    problem: string
    solution: string
    fullScript: string // Complete script text
    cta: string
  }
  sourceResearch: {
    avatarName: string
    conceptTitle: string
    relevanceScore: number
  }
  status: "pending" | "approved" | "rejected"
  feedback?: string
  performance?: {
    hookRate: number
    completionRate: number
    ctr: number
  }
}

export function ScriptAgentDashboard() {
  //todo: remove mock functionality - replace with real OpenAI integration
  const [scripts, setScripts] = useState<Script[]>([
    {
      id: "1",
      title: "Busy Parent Morning Routine",
      duration: "30s",
      scriptType: "ugc",
      summary: "Targeting busy working parents struggling with chaotic mornings using meal prep transformation angle for problem aware audience",
      content: {
        avatar: "Working mothers, ages 28-40, juggling career and family responsibilities",
        marketingAngle: "POV transformation - become the organized parent who has it all figured out",
        awarenessStage: "problem aware",
        problem: "Every morning feels like chaos - kids refusing to eat, you're late for work, everyone's hangry",
        solution: "This simple meal prep trick changed everything. 5 minutes Sunday night = stress-free mornings all week",
        fullScript: "POV: You're a working mom and breakfast just became your superpower. [Shows chaotic morning scene] Every morning feels like chaos - kids refusing to eat, you're late for work, everyone's hangry. [Transition] But this simple meal prep trick changed everything. [Shows organized prep] 5 minutes Sunday night = stress-free mornings all week. [Shows smooth morning] Try it for yourself - link in bio for the full guide.",
        cta: "Try it for yourself - link in bio for the full guide"
      },
      sourceResearch: {
        avatarName: "Busy Working Parent",
        conceptTitle: "Kitchen Transformation - Quick Recipe Ideas",
        relevanceScore: 92
      },
      status: "pending",
      performance: {
        hookRate: 85,
        completionRate: 72,
        ctr: 3.2
      }
    },
    {
      id: "2",
      title: "Health Transformation Story",
      duration: "45s", 
      scriptType: "testimonial",
      summary: "Targeting health-conscious millennials who've tried everything using authentic transformation story for unaware audience",
      content: {
        avatar: "Health-conscious millennials, ages 25-35, frustrated with failed attempts at sustainable wellness",
        marketingAngle: "Personal transformation story - relatable struggle to breakthrough moment",
        awarenessStage: "unaware",
        problem: "Spent thousands on supplements, meal plans, gym memberships. Nothing stuck.",
        solution: "Then I discovered this isn't about restriction - it's about nourishment. Real food, real results.",
        fullScript: "I tried every diet for 10 years. This one thing finally worked. [Shows before photos] Spent thousands on supplements, meal plans, gym memberships. Nothing stuck. [Transition moment] Then I discovered this isn't about restriction - it's about nourishment. [Shows transformation] Real food, real results. [Shows current lifestyle] Ready for your transformation? Get started today.",
        cta: "Ready for your transformation? Get started today."
      },
      sourceResearch: {
        avatarName: "Health-Conscious Millennial",
        conceptTitle: "Raw UGC with Male Speaker - Weight Loss Transformation",
        relevanceScore: 88
      },
      status: "approved"
    },
    {
      id: "3",
      title: "Quick Product Demo",
      duration: "20s",
      scriptType: "demo", 
      summary: "Targeting time-pressed entrepreneurs seeking quick nutrition using fast meal demo for most aware audience",
      content: {
        avatar: "Busy entrepreneurs, ages 30-45, prioritizing efficiency and health in their demanding schedules",
        marketingAngle: "Speed and quality demonstration - prove it's possible to eat well without time investment",
        awarenessStage: "most aware",
        problem: "Who says healthy can't be fast and delicious?",
        solution: "Three simple ingredients, one amazing result",
        fullScript: "Watch me make a restaurant-quality meal in 10 minutes. [Timer starts] Who says healthy can't be fast and delicious? [Shows ingredients] Three simple ingredients, one amazing result. [Demo cooking process with timer] [Final reveal] Get the recipe and ingredients delivered to your door.",
        cta: "Get the recipe and ingredients delivered to your door"
      },
      sourceResearch: {
        avatarName: "Time-Pressed Entrepreneur",
        conceptTitle: "POV Hook Format - Trendjacking Success Stories",
        relevanceScore: 85
      },
      status: "pending"
    }
  ])

  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<string>("")

  const handleApproval = (id: string, status: "approved" | "rejected") => {
    setScripts(prev => prev.map(script => 
      script.id === id 
        ? { ...script, status, feedback: feedback[id] }
        : script
    ))
    console.log(`Script ${id} ${status}:`, feedback[id])
  }

  const generateNewScript = () => {
    setIsGenerating(true)
    //todo: remove mock functionality - integrate with OpenAI API
    setTimeout(() => {
      const newScript: Script = {
        id: Date.now().toString(),
        title: "Entrepreneur Success Story",
        duration: "35s",
        scriptType: "story",
        summary: "Targeting burned-out entrepreneurs seeking sustainable success using personal breakthrough story for solution aware audience",
        content: {
          avatar: "Ambitious entrepreneurs, ages 30-50, experiencing burnout from overwork and seeking sustainable growth",
          marketingAngle: "Personal breakthrough story - from struggle to systematic success",
          awarenessStage: "solution aware",
          problem: "Working 80-hour weeks, living on coffee and regret",
          solution: "This one change helped me reclaim my energy and focus",
          fullScript: "From burnout to breakthrough in 30 days. [Shows exhausted state] Working 80-hour weeks, living on coffee and regret. [Transition moment] This one change helped me reclaim my energy and focus. [Shows transformation] Ready to fuel your success? Start here.",
          cta: "Ready to fuel your success? Start here.",
        },
        sourceResearch: {
          avatarName: "Time-Pressed Entrepreneur",
          conceptTitle: "Productivity Hacks for Business Owners",
          relevanceScore: 91
        },
        status: "pending"
      }
      setScripts(prev => [newScript, ...prev])
      setIsGenerating(false)
    }, 2000)
  }

  const copyScript = (script: Script) => {
    const fullScript = `AVATAR: ${script.content.avatar}\n\nMARKETING ANGLE: ${script.content.marketingAngle}\n\nAWARENESS STAGE: ${script.content.awarenessStage.toUpperCase()}\n\nPROBLEM: ${script.content.problem}\n\nSOLUTION: ${script.content.solution}\n\nFULL SCRIPT:\n${script.content.fullScript}\n\nCTA: ${script.content.cta}`
    navigator.clipboard.writeText(fullScript)
    console.log("Script copied to clipboard")
  }

  const pendingCount = scripts.filter(s => s.status === "pending").length
  const approvedCount = scripts.filter(s => s.status === "approved").length

  const getTypeColor = (type: string) => {
    switch (type) {
      case "ugc": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "testimonial": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "demo": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "story": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
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
            <h1 className="text-2xl font-bold">Script Agent</h1>
            <p className="text-muted-foreground">Create high-converting UGC video scripts from approved research insights</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                Based on Research Agent approvals
              </Badge>
              <Button variant="ghost" size="sm" asChild className="text-xs h-6">
                <a href="/research" className="flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" />
                  View Research
                </a>
              </Button>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedAvatar} onValueChange={setSelectedAvatar}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select avatar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="busy-parent">Busy Working Parent</SelectItem>
              <SelectItem value="health-millennial">Health-Conscious Millennial</SelectItem>
              <SelectItem value="entrepreneur">Time-Pressed Entrepreneur</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={generateNewScript}
            disabled={isGenerating}
            data-testid="button-generate-script"
          >
            {isGenerating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Video className="mr-2 h-4 w-4" />}
            {isGenerating ? "Generating..." : "Generate Script"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Scripts</CardDescription>
            <CardTitle className="text-2xl font-bold">{scripts.length}</CardTitle>
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
            <CardDescription className="text-xs">Avg Hook Rate</CardDescription>
            <CardTitle className="text-2xl font-bold">78%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Script Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Video className="h-5 w-5" />
          UGC Video Scripts
        </h2>
        
        {scripts.map((script) => (
          <Card key={script.id} className="hover-elevate" data-testid={`card-script-${script.id}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{script.title}</CardTitle>
                  <Badge className={getTypeColor(script.scriptType)}>
                    {script.scriptType.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {script.duration}
                  </Badge>
                  <Badge 
                    variant={
                      script.status === "approved" ? "default" : 
                      script.status === "rejected" ? "destructive" : "secondary"
                    }
                  >
                    {script.status}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyScript(script)}
                  data-testid={`button-copy-script-${script.id}`}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Source Research Section */}
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Source Research (Approved)
                    </h4>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-blue-600" />
                        <span className="font-medium">{script.sourceResearch.avatarName}</span>
                      </div>
                      <span className="text-muted-foreground">+</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-blue-600" />
                        <span className="font-medium">{script.sourceResearch.conceptTitle}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-300">
                    {script.sourceResearch.relevanceScore}% fit
                  </Badge>
                </div>
              </div>

              {/* Summary One-Liner */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800">
                <h4 className="font-medium text-sm text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Script Summary
                </h4>
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">{script.summary}</p>
              </div>

              {/* Strategic Framework - 2 Column Layout */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-sm text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    AVATAR
                  </h4>
                  <p className="text-sm">{script.content.avatar}</p>
                </div>
                
                <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                  <h4 className="font-medium text-sm text-orange-700 dark:text-orange-300 mb-1 flex items-center gap-2">
                    <TrendingUp className="h-3 w-3" />
                    MARKETING ANGLE
                  </h4>
                  <p className="text-sm">{script.content.marketingAngle}</p>
                </div>
                
                <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                  <h4 className="font-medium text-sm text-indigo-700 dark:text-indigo-300 mb-1 flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    AWARENESS STAGE
                  </h4>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={
                        script.content.awarenessStage === "unaware" 
                          ? "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/20 dark:text-gray-300"
                          : script.content.awarenessStage === "problem aware"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300"
                          : script.content.awarenessStage === "solution aware"
                          ? "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/20 dark:text-orange-300"
                          : script.content.awarenessStage === "product aware"
                          ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300"
                          : "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-300"
                      }
                    >
                      {script.content.awarenessStage.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <h4 className="font-medium text-sm text-purple-700 dark:text-purple-300 mb-1">CALL TO ACTION</h4>
                  <p className="text-sm">{script.content.cta}</p>
                </div>
                
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 col-span-2">
                  <h4 className="font-medium text-sm text-red-700 dark:text-red-300 mb-1">PROBLEM</h4>
                  <p className="text-sm">{script.content.problem}</p>
                </div>
                
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 col-span-2">
                  <h4 className="font-medium text-sm text-green-700 dark:text-green-300 mb-1">SOLUTION</h4>
                  <p className="text-sm">{script.content.solution}</p>
                </div>
              </div>

              {/* Complete Script */}
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800">
                <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  COMPLETE SCRIPT
                </h4>
                <div className="bg-white dark:bg-slate-800 p-3 rounded border">
                  <p className="text-sm leading-relaxed whitespace-pre-line">{script.content.fullScript}</p>
                </div>
              </div>


              {/* Feedback Section */}
              {script.status === "pending" && (
                <div className="space-y-3 pt-4 border-t">
                  <Textarea
                    placeholder="Add feedback or comments..."
                    value={feedback[script.id] || ""}
                    onChange={(e) => setFeedback(prev => ({ ...prev, [script.id]: e.target.value }))}
                    rows={2}
                    data-testid={`textarea-feedback-${script.id}`}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproval(script.id, "approved")}
                      data-testid={`button-approve-${script.id}`}
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleApproval(script.id, "rejected")}
                      data-testid={`button-reject-${script.id}`}
                    >
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              )}

              {/* Show feedback if already reviewed */}
              {script.status !== "pending" && script.feedback && (
                <div className="p-3 rounded-lg bg-muted/50 border-l-4 border-l-primary">
                  <p className="text-sm"><strong>Feedback:</strong> {script.feedback}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}