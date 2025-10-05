import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { queryClient, apiRequest } from "@/lib/queryClient"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, ThumbsUp, ThumbsDown, Play, Copy, RefreshCw, Video, Clock, CheckCircle, Users, TrendingUp, ArrowLeft, AlertCircle } from "lucide-react"

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
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  
  // UI state only - no manual configuration needed
  
  // UI state
  const [feedback, setFeedback] = useState<Record<string, string>>({})

  // Check if Knowledge Base exists and fetch user's scripts
  const { data: knowledgeBase, isLoading: kbLoading, error: kbError } = useQuery({
    queryKey: ['/api/knowledge-base'],
    enabled: isAuthenticated,
  })

  // Fetch approved avatars from Research Agent
  const { data: approvedAvatars = [] } = useQuery<any[]>({
    queryKey: ['/api/avatars'],
    enabled: isAuthenticated,
    select: (data) => data.filter((avatar: any) => avatar.status === 'approved'),
  })

  // Fetch user's generated scripts
  const { data: scripts = [], isLoading: scriptsLoading } = useQuery<Script[]>({
    queryKey: ['/api/scripts'],
    enabled: isAuthenticated,
  })

  // Script generation mutation - AI automatically determines best approach
  const generateScriptMutation = useMutation({
    mutationFn: async (): Promise<Script> => {
      // Send minimal data - AI determines script type, duration, and approach based on research
      const response = await apiRequest('POST', '/api/generate-script', {})
      return response.json()
    },
    onSuccess: () => {
      // Invalidate scripts query to refetch from database
      queryClient.invalidateQueries({ queryKey: ['/api/scripts'] })
      toast({
        title: "Script Generated!",
        description: "AI created a new script using your approved research data and brand information."
      })
    },
    onError: (error: any) => {
      // Parse server error response
      let errorMessage = "Failed to generate script. Please try again."
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (error?.message) {
        errorMessage = error.message
      } else if (error?.error) {
        errorMessage = error.error
      }
      
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive"
      })
    }
  })

  // Script approval mutation to persist feedback
  const updateScriptMutation = useMutation({
    mutationFn: async ({ id, status, feedbackText }: { id: string, status: "approved" | "rejected", feedbackText?: string }) => {
      const response = await apiRequest('PATCH', `/api/scripts/${id}`, { 
        status, 
        feedback: feedbackText 
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scripts'] })
      toast({
        title: "Script Updated",
        description: "Script status and feedback have been saved."
      })
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update script status.",
        variant: "destructive"
      })
    }
  })

  const handleApproval = (id: string, status: "approved" | "rejected") => {
    updateScriptMutation.mutate({ 
      id, 
      status, 
      feedbackText: feedback[id] 
    })
  }

  const generateNewScript = () => {
    if (!knowledgeBase) {
      toast({
        title: "Knowledge Base Required",
        description: "Please complete your Knowledge Base setup before generating scripts.",
        variant: "destructive"
      })
      return
    }
    generateScriptMutation.mutate()
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
            <p className="text-muted-foreground">Generates ready-to-film UGC video scripts tailored to your target avatars and proven creative angles. Each script includes hooks, problem-solution structure, and clear calls-to-action optimized for conversion.</p>
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
        <div className="flex items-center gap-4">
          {/* Research Status Indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{approvedAvatars.length} approved avatar{approvedAvatars.length !== 1 ? 's' : ''}</span>
          </div>
          
          <Button 
            onClick={generateNewScript}
            disabled={generateScriptMutation.isPending || kbLoading || !knowledgeBase || approvedAvatars.length === 0}
            data-testid="button-generate-script"
            size="lg"
          >
            {generateScriptMutation.isPending ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Video className="mr-2 h-4 w-4" />}
            {generateScriptMutation.isPending ? "AI Analyzing Research..." : "Generate AI Script"}
          </Button>
        </div>
      </div>

      {/* Knowledge Base Status */}
      {kbError && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm font-medium">
                Knowledge Base required for script generation. Please set up your brand information first.
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="/knowledge-base">Setup Now</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!knowledgeBase && !kbError && !kbLoading && (
        <Card className="border-yellow-300 dark:border-yellow-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm font-medium">
                Complete your Knowledge Base to enable AI-powered script generation using your brand data.
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="/knowledge-base">Complete Setup</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Research Agent Status */}
      {knowledgeBase && approvedAvatars.length === 0 && (
        <Card className="border-blue-300 dark:border-blue-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Users className="h-4 w-4" />
              <p className="text-sm font-medium">
                Research Agent hasn't approved any customer avatars yet. Generate and approve research first.
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="/research">Start Research</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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

        {/* Loading State */}
        {generateScriptMutation.isPending && (
          <Card className="animate-pulse">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-6 bg-muted rounded w-48"></div>
                  <div className="h-5 bg-muted rounded w-16"></div>
                  <div className="h-5 bg-muted rounded w-12"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="h-3 bg-muted rounded w-16 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="h-3 bg-muted rounded w-20 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="h-4 bg-muted rounded w-32 mb-3"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!generateScriptMutation.isPending && scripts.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-muted p-4">
                  <Video className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">No Scripts Generated Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    AI will analyze your approved research data and brand information to create targeted, high-converting scripts.
                  </p>
                  {knowledgeBase && approvedAvatars.length > 0 ? (
                    <Button onClick={generateNewScript} disabled={generateScriptMutation.isPending}>
                      <Video className="mr-2 h-4 w-4" />
                      Generate Your First AI Script
                    </Button>
                  ) : !knowledgeBase ? (
                    <Button variant="outline" asChild>
                      <a href="/knowledge-base">
                        <FileText className="mr-2 h-4 w-4" />
                        Complete Knowledge Base First
                      </a>
                    </Button>
                  ) : (
                    <Button variant="outline" asChild>
                      <a href="/research">
                        <Users className="mr-2 h-4 w-4" />
                        Generate Research First
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {generateScriptMutation.error && (
          <Card className="border-destructive">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Failed to generate script</p>
                  <p className="text-xs opacity-90">
                    {generateScriptMutation.error instanceof Error ? generateScriptMutation.error.message : "An unexpected error occurred"}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => generateScriptMutation.reset()}
                  className="ml-auto"
                >
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
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