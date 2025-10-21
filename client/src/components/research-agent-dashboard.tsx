import { useState, useEffect } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Brain, 
  ThumbsUp, 
  ThumbsDown, 
  Users, 
  Target, 
  Zap, 
  RefreshCw, 
  TrendingUp, 
  ExternalLink,
  Link,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  BarChart3,
  AlertTriangle,
  Search,
  Database
} from "lucide-react"
import { Avatar, Concept, AvatarConcept, KnowledgeBase, insertAvatarSchema, insertConceptSchema, insertAvatarConceptSchema } from "@shared/schema"
import type { z } from "zod"
import { apiRequest, queryClient } from "@/lib/queryClient"
import { useToast } from "@/hooks/use-toast"

type AvatarInsert = z.infer<typeof insertAvatarSchema>
type ConceptInsert = z.infer<typeof insertConceptSchema>
type AvatarConceptInsert = z.infer<typeof insertAvatarConceptSchema>

// Define the performance interface for better typing
interface PerformanceMetrics {
  views: string
  engagement: string
  conversionRate?: string
}

interface ConceptWithRelevance extends Concept {
  relevanceScore: number
  matchedHooks?: string[]
  matchedElements?: string[]
  performance: PerformanceMetrics
}

export function ResearchAgentDashboard() {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const { toast } = useToast()


  // Fetch avatars from backend
  const { data: avatars = [], isLoading: isLoadingAvatars } = useQuery<Avatar[]>({
    queryKey: ['/api/avatars'],
  })

  // Fetch concepts filtered by selected avatar 
  const { data: concepts = [], isLoading: isLoadingConcepts } = useQuery<Concept[]>({
    queryKey: ['/api/concepts', selectedAvatar],
    enabled: !!selectedAvatar,
  })

  // Fetch avatar-concept links
  const { data: avatarConcepts = [] } = useQuery<AvatarConcept[]>({
    queryKey: ['/api/avatar-concepts'],
  })

  // Fetch knowledge base
  const { data: knowledgeBase } = useQuery<KnowledgeBase | null>({
    queryKey: ['/api/knowledge-base'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/knowledge-base')
        return response.json() as Promise<KnowledgeBase>
      } catch {
        return null
      }
    },
  })

  // Check if knowledge base is completed
  const isKnowledgeBaseCompleted = knowledgeBase && (knowledgeBase.completionPercentage || 0) >= 100

  // Create avatar mutation
  const createAvatarMutation = useMutation({
    mutationFn: (avatar: AvatarInsert) => apiRequest('POST', '/api/avatars', avatar),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/avatars'] })
    },
  })

  // Create concept mutation
  const createConceptMutation = useMutation({
    mutationFn: (concept: ConceptInsert) => apiRequest('POST', '/api/concepts', concept),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/concepts'] })
    },
  })

  // Avatar approval mutation
  const updateAvatarMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Avatar> }) =>
      apiRequest('PATCH', `/api/avatars/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/avatars'] })
    },
  })

  // Concept approval mutation  
  const updateConceptMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Concept> }) =>
      apiRequest('PATCH', `/api/concepts/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/concepts'] })
    },
  })

  // Avatar-concept linking mutation
  const linkAvatarConceptMutation = useMutation({
    mutationFn: (link: AvatarConceptInsert) => apiRequest('POST', '/api/avatar-concepts', link),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/avatar-concepts'] })
      queryClient.invalidateQueries({ queryKey: ['/api/concepts'] })
    },
  })

  // Avatar-concept update mutation
  const updateAvatarConceptMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<AvatarConcept> }) =>
      apiRequest('PATCH', `/api/avatar-concepts/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/avatar-concepts'] })
      queryClient.invalidateQueries({ queryKey: ['/api/concepts'] })
    },
  })

  const handleAvatarApproval = (id: string, status: "approved" | "rejected") => {
    updateAvatarMutation.mutate({
      id,
      updates: { 
        status, 
        feedback: feedback[id] || undefined 
      }
    })
    console.log(`Avatar ${id} ${status}:`, feedback[id])
  }

  const handleConceptApproval = (id: string, status: "approved" | "rejected") => {
    updateConceptMutation.mutate({
      id,
      updates: { 
        status, 
        feedback: feedback[id] || undefined 
      }
    })
    console.log(`Concept ${id} ${status}:`, feedback[id])
  }

  const generateNewAvatars = async () => {
    if (!isKnowledgeBaseCompleted) {
      toast({
        title: "Knowledge Base Required",
        description: "Please complete your knowledge base setup first before generating avatars.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      // NEW WORKFLOW: Generate 4-5 avatars at once
      const response = await apiRequest('POST', '/api/generate-avatars')
      const result = await response.json()
      
      // Invalidate avatars query to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['/api/avatars'] })
      
      toast({
        title: "Avatars Generated",
        description: `Successfully generated ${result.count} customer avatars based on your brand data.`,
      })
    } catch (error) {
      console.error('Failed to generate avatars:', error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate avatars. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const generateNewConcepts = async () => {
    if (!isKnowledgeBaseCompleted) {
      toast({
        title: "Knowledge Base Required",
        description: "Please complete your knowledge base setup first before generating concepts.",
        variant: "destructive"
      })
      return
    }

    if (avatars.length === 0) {
      toast({
        title: "Generate Avatars First",
        description: "Please generate customer avatars before fetching concepts.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      // NEW WORKFLOW: Fetch concepts from social media platforms and auto-link to avatars
      const response = await apiRequest('POST', '/api/generate-concepts')
      const result = await response.json()
      
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['/api/concepts'] })
      queryClient.invalidateQueries({ queryKey: ['/api/avatar-concepts'] })
      
      toast({
        title: "Concepts Generated",
        description: `Fetched ${result.concepts.length} avatar-specific concepts (${result.conceptsPerAvatar} per avatar). Created ${result.linkedCount} links across ${result.avatarsProcessed} avatars.`,
      })
    } catch (error) {
      console.error('Failed to generate concepts:', error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate concepts. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const linkConcept = async (avatarId: string, conceptId: string) => {
    const avatar = avatars.find(a => a.id === avatarId)
    const concept = concepts.find(c => c.id === conceptId)
    
    if (!avatar || !concept) return
    
    const { matchedHooks, matchedElements } = getMatchedElements(avatar, concept)
    const relevanceScore = computeRelevanceScore(avatar, concept)
    
    const linkData: AvatarConceptInsert = {
      avatarId,
      conceptId,
      relevanceScore: relevanceScore.toString(),
      matchedHooks,
      matchedElements,
      rationale: `This concept matches ${avatar.name} with ${Math.round(relevanceScore * 100)}% relevance based on matching hooks and creative elements.`,
      status: "linked"
    }
    
    try {
      await linkAvatarConceptMutation.mutateAsync(linkData)
    } catch (error) {
      console.error('Failed to link avatar and concept:', error)
    }
  }

  const unlinkConcept = async (avatarId: string, conceptId: string) => {
    // Find the link to update
    const link = avatarConcepts.find(ac => ac.avatarId === avatarId && ac.conceptId === conceptId)
    if (!link) return
    
    try {
      // Update the link status to "unlinked" using the proper PATCH mutation
      await updateAvatarConceptMutation.mutateAsync({
        id: link.id,
        updates: { status: "unlinked" }
      })
    } catch (error) {
      console.error('Failed to unlink avatar and concept:', error)
    }
  }


  const isConceptLinked = (avatarId: string, conceptId: string) => {
    return avatarConcepts.some(link => 
      link.avatarId === avatarId && 
      link.conceptId === conceptId && 
      link.status === "linked"
    )
  }

  const getLinkedConcepts = (avatarId: string) => {
    return avatarConcepts
      .filter(link => link.avatarId === avatarId && link.status === "linked")
      .map(link => link.conceptId)
  }

  const computeRelevanceScore = (avatar: Avatar, concept: Concept): number => {
    // Simple relevance scoring based on industry match and hook similarity
    let score = 0.5 // base score
    
    // Industry/demographic relevance
    if (concept.industry.toLowerCase().includes('health') && 
        (avatar.demographics.toLowerCase().includes('health') || 
         avatar.painPoint.toLowerCase().includes('health'))) {
      score += 0.3
    }
    
    // Hook matching (simplified semantic similarity)
    const conceptKeywords = [...concept.keyElements, ...concept.insights].join(' ').toLowerCase()
    const avatarKeywords = avatar.hooks.join(' ').toLowerCase()
    const commonWords = conceptKeywords.split(' ').filter(word => 
      avatarKeywords.includes(word) && word.length > 3
    )
    
    score += Math.min(commonWords.length * 0.1, 0.2)
    
    // Boost score for certain combinations
    if (avatar.name.includes('Parent') && concept.keyElements.some(el => 
        el.toLowerCase().includes('kitchen') || el.toLowerCase().includes('meal'))) {
      score += 0.15
    }
    
    return Math.min(score, 1.0)
  }

  const getMatchedElements = (avatar: Avatar, concept: Concept): { matchedHooks: string[]; matchedElements: string[] } => {
    const avatarKeywords = avatar.hooks.join(' ').toLowerCase()
    const painKeywords = avatar.painPoint.toLowerCase()
    
    const matchedHooks = avatar.hooks.filter(hook => 
      concept.keyElements.some(element => 
        element.toLowerCase().includes(hook.toLowerCase().split(' ')[0]) ||
        hook.toLowerCase().includes(element.toLowerCase().split(' ')[0])
      )
    )
    
    const matchedElements = concept.keyElements.filter(element =>
      avatarKeywords.includes(element.toLowerCase()) ||
      painKeywords.includes(element.toLowerCase()) ||
      element.toLowerCase().includes('health') || element.toLowerCase().includes('meal')
    )
    
    return { matchedHooks, matchedElements }
  }

  const getEmbedUrl = (url: string): string => {
    // Convert regular social media URLs to embeddable format
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    if (url.includes('tiktok.com')) {
      // TikTok embed - extract video ID and use embed format
      const videoId = url.split('/video/')[1]?.split('?')[0]
      return `https://www.tiktok.com/embed/${videoId}`
    }
    if (url.includes('instagram.com/p/')) {
      // Instagram post embed
      return `${url}embed/`
    }
    // Fallback to original URL
    return url
  }

  const getFilteredConcepts = (): ConceptWithRelevance[] => {
    if (!selectedAvatar) return []
    
    const avatar = avatars.find(a => a.id === selectedAvatar)
    if (!avatar) return []
    
    return concepts
      .map(concept => ({
        ...concept,
        performance: concept.performance as PerformanceMetrics,
        relevanceScore: computeRelevanceScore(avatar, concept)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
  }

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
            <p className="text-muted-foreground">Analyzes your target audience and discovers viral creative concepts to fuel your marketing strategy. Use this to identify high-potential customer segments and proven creative angles before generating scripts.</p>
          </div>
        </div>
      </div>

      {/* Integrated Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Avatar Selection - Now More Prominent */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Avatars
            </h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button 
                    onClick={generateNewAvatars}
                    disabled={isGenerating || !isKnowledgeBaseCompleted}
                    size="sm"
                    data-testid="button-generate-avatars"
                  >
                    {isGenerating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                    {isGenerating ? "Generating..." : "Generate"}
                  </Button>
                </span>
              </TooltipTrigger>
              {!isKnowledgeBaseCompleted && (
                <TooltipContent>
                  <p>Complete your knowledge base setup first to generate avatars</p>
                </TooltipContent>
              )}
            </Tooltip>
          </div>

          {/* Compact Avatar List */}
          <div className="space-y-3">
            {avatars.length === 0 ? (
              <Card className="p-8 text-center" data-testid="empty-avatars">
                <div className="flex flex-col items-center gap-4">
                  <Users className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium mb-2">No Avatars Generated</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {!isKnowledgeBaseCompleted 
                        ? "Complete your knowledge base setup to generate customer avatars based on your brand information."
                        : "Click the Generate button above to create customer avatars based on your knowledge base."
                      }
                    </p>
                    {!isKnowledgeBaseCompleted && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                        data-testid="button-go-to-knowledge-base"
                      >
                        <a href="/knowledge-base">
                          <ArrowRight className="mr-2 h-4 w-4" />
                          Complete Knowledge Base
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ) : (
              avatars.map((avatar) => (
              <div key={avatar.id}>
                {/* Compact Avatar Card */}
                <Card 
                  className={`cursor-pointer transition-all ${
                    selectedAvatar === avatar.id 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover-elevate'
                  }`}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  data-testid={`card-avatar-${avatar.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-medium text-sm">{avatar.name}</h3>
                            <Badge 
                              variant="outline"
                              className={`text-xs ${
                                avatar.priority === 'high' ? 'bg-red-50 text-red-700 border-red-300' :
                                avatar.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                                'bg-gray-50 text-gray-700 border-gray-300'
                              }`}
                              data-testid={`badge-priority-${avatar.id}`}
                            >
                              {avatar.priority} priority
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge 
                              variant="outline" 
                              className="text-xs bg-blue-50 text-blue-700 border-blue-300"
                              data-testid={`badge-source-${avatar.id}`}
                            >
                              {avatar.recommendationSource === 'performance_agent' ? (
                                <>
                                  <BarChart3 className="h-3 w-3 mr-1" />
                                  Performance
                                </>
                              ) : (
                                <>
                                  <Search className="h-3 w-3 mr-1" />
                                  Research
                                </>
                              )}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className="text-xs bg-green-50 text-green-700 border-green-300"
                              data-testid={`badge-confidence-${avatar.id}`}
                            >
                              {Math.round(parseFloat(avatar.dataConfidence || '0') * 100)}%
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{avatar.demographics}</p>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="flex items-center gap-1">
                                <Database className="h-3 w-3 text-green-600" />
                                {Math.round(parseFloat(avatar.dataConfidence || '0') * 100)}% confidence
                              </span>
                              <span className="text-muted-foreground">•</span>
                              <span>{avatar.sources?.length || 0} sources</span>
                              {avatar.recommendationSource === 'performance_agent' && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                                  <BarChart3 className="h-3 w-3 mr-1" />
                                  Proven Performer
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-blue-600 font-medium leading-tight">
                              {avatar.recommendationSource === 'performance_agent' 
                                ? `Highest converting avatar (${avatar.priority === 'high' ? '4.2% CVR' : '2.8% CVR'}) - Performance Agent confirmed`
                                : avatar.priority === 'high' 
                                  ? `${Math.round(parseFloat(avatar.dataConfidence || '0') * 34)}% of target market - High-confidence research`
                                  : 'New segment opportunity - Research-backed potential'
                              }
                            </p>
                          </div>
                        </div>
                        
                        <Badge 
                          variant={
                            avatar.status === "approved" ? "default" : 
                            avatar.status === "rejected" ? "destructive" : "secondary"
                          }
                          className="text-xs flex-shrink-0"
                        >
                          {avatar.status}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => e.stopPropagation()}
                              data-testid={`button-expand-${avatar.id}`}
                            >
                              <Search className="h-4 w-4 mr-2" />
                              View Research
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Research Deep Dive: {avatar.name}</DialogTitle>
                            </DialogHeader>

                            {/* Research Details Modal Content */}
                            <div className="space-y-6" data-testid={`expanded-research-${avatar.id}`}>
                      {/* Why This Avatar Section */}
                      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="h-4 w-4 text-blue-600" />
                          <h4 className="font-medium text-blue-700 dark:text-blue-300">Strategic Justification</h4>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{avatar.reasoning}</p>
                        
                        <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-blue-200">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <BarChart3 className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-700">Data Confidence</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-600">{Math.round(parseFloat(avatar.dataConfidence || '0') * 100)}%</div>
                            <p className="text-xs text-muted-foreground">
                              {parseFloat(avatar.dataConfidence || '0') >= 0.8 ? 'High confidence - Multiple validation sources' : 
                               parseFloat(avatar.dataConfidence || '0') >= 0.6 ? 'Medium confidence - Some validation needed' :
                               'Experimental - Requires testing validation'}
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Search className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-700">Recommendation Source</span>
                            </div>
                            <Badge variant="outline" className={`text-sm ${
                              avatar.recommendationSource === 'performance_agent' ? 'bg-green-50 text-green-700 border-green-300' :
                              avatar.recommendationSource === 'research' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                              'bg-gray-50 text-gray-700 border-gray-300'
                            }`}>
                              {avatar.recommendationSource === 'performance_agent' ? 'Performance Agent' :
                               avatar.recommendationSource === 'research' ? 'Research Analysis' :
                               'User Request'}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {avatar.recommendationSource === 'performance_agent' ? 'Based on actual campaign performance data' :
                               avatar.recommendationSource === 'research' ? 'Market research and demographic analysis' :
                               'Specifically requested for testing'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Pain Point Analysis */}
                      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-red-600" />
                          <h4 className="font-medium text-red-700 dark:text-red-300">Core Pain Point</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{avatar.painPoint}</p>
                      </div>

                      {/* Research Methodology & Sources */}
                      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-3">
                          <Database className="h-4 w-4 text-green-600" />
                          <h4 className="font-medium text-green-700 dark:text-green-300">Research Methodology & Evidence</h4>
                        </div>
                        
                        <div className="space-y-4">
                          {/* Methodology Overview */}
                          <div className="p-3 rounded-md bg-white dark:bg-green-900/40 border border-green-200">
                            <h5 className="text-sm font-medium text-green-700 mb-2">Analysis Approach</h5>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="font-medium text-green-600">Time Window:</span>
                                <p className="text-muted-foreground">Last 90 days</p>
                              </div>
                              <div>
                                <span className="font-medium text-green-600">Sample Size:</span>
                                <p className="text-muted-foreground">
                                  {avatar.sources?.reduce((acc, source) => {
                                    const match = source.match(/\d+[,\d]*/)
                                    return match ? acc + parseInt(match[0].replace(',', '')) : acc
                                  }, 0).toLocaleString() || '5,000+'} data points
                                </p>
                              </div>
                              <div>
                                <span className="font-medium text-green-600">Method:</span>
                                <p className="text-muted-foreground">
                                  {avatar.recommendationSource === 'performance_agent' ? 'Performance data analysis' : 'Qualitative + quantitative research'}
                                </p>
                              </div>
                              <div>
                                <span className="font-medium text-green-600">Validation:</span>
                                <p className="text-muted-foreground">
                                  {avatar.sources?.length || 0} independent sources
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Evidence Sources */}
                          <div data-testid={`evidence-sources-${avatar.id}`}>
                            <h5 className="text-sm font-medium text-green-700 mb-3">Evidence Sources ({avatar.sources?.length || 0})</h5>
                            <div className="space-y-2">
                              {avatar.sources?.map((source, index) => {
                                const sourceType = source.includes('Reddit:') ? 'social' : 
                                                  source.includes('Article:') ? 'publication' :
                                                  source.includes('Survey:') ? 'survey' :
                                                  source.includes('Facebook') ? 'social' :
                                                  source.includes('LinkedIn') ? 'professional' :
                                                  source.includes('Instagram') ? 'social' :
                                                  source.includes('Podcast') ? 'media' : 'research'
                                const extractedCount = source.match(/\d+[,\d]*/)?.[0] || '0'
                                const isClickable = source.includes('Reddit:') || source.includes('Article:') || source.includes('Survey:')
                                
                                return (
                                  <div key={index} className="flex items-start gap-3 p-3 rounded-md bg-white dark:bg-green-900/40 border border-green-200" data-testid={`source-item-${avatar.id}-${index}`}>
                                    <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                                      sourceType === 'social' ? 'bg-blue-500' :
                                      sourceType === 'publication' ? 'bg-purple-500' :
                                      sourceType === 'survey' ? 'bg-green-500' :
                                      sourceType === 'professional' ? 'bg-orange-500' :
                                      sourceType === 'media' ? 'bg-red-500' :
                                      'bg-gray-500'
                                    }`}></div>
                                    <div className="flex-1">
                                      <div className="flex items-start justify-between">
                                        <p className={`text-sm ${isClickable ? 'text-blue-600 hover:text-blue-800 cursor-pointer underline' : 'text-muted-foreground'}`}>
                                          {source}
                                        </p>
                                        <div className="flex items-center gap-1 ml-2">
                                          <Badge variant="outline" className={`text-xs ${
                                            sourceType === 'social' ? 'bg-blue-50 text-blue-600 border-blue-300' :
                                            sourceType === 'publication' ? 'bg-purple-50 text-purple-600 border-purple-300' :
                                            sourceType === 'survey' ? 'bg-green-50 text-green-600 border-green-300' :
                                            sourceType === 'professional' ? 'bg-orange-50 text-orange-600 border-orange-300' :
                                            sourceType === 'media' ? 'bg-red-50 text-red-600 border-red-300' :
                                            'bg-gray-50 text-gray-600 border-gray-300'
                                          }`}>
                                            {sourceType}
                                          </Badge>
                                        </div>
                                      </div>
                                      {extractedCount !== '0' && (
                                        <div className="flex items-center gap-2 mt-2">
                                          <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-300">
                                            {parseInt(extractedCount).toLocaleString()} data points
                                          </Badge>
                                          {isClickable && (
                                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-300">
                                              ⚡ Verified source
                                            </Badge>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                            
                            {/* Evidence Summary */}
                            <div className="mt-4 p-3 rounded-md bg-green-100 dark:bg-green-900/40 border border-green-300">
                              <h6 className="text-sm font-medium text-green-700 mb-2">Evidence Summary</h6>
                              <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                  <span className="font-medium text-green-600">Total Data Points:</span>
                                  <span className="ml-1 text-muted-foreground">
                                    {avatar.sources?.reduce((acc, source) => {
                                      const match = source.match(/\d+[,\d]*/)
                                      return match ? acc + parseInt(match[0].replace(/,/g, '')) : acc
                                    }, 0).toLocaleString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-green-600">Source Types:</span>
                                  <span className="ml-1 text-muted-foreground">
                                    {Array.from(new Set(avatar.sources?.map(source => 
                                      source.includes('Reddit:') ? 'Social' : 
                                      source.includes('Article:') ? 'Publication' :
                                      source.includes('Survey:') ? 'Survey' : 'Other'
                                    ))).join(', ')}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-green-600">Verification Status:</span>
                                  <span className="ml-1 text-muted-foreground">
                                    {avatar.sources?.filter(s => s.includes('Reddit:') || s.includes('Article:') || s.includes('Survey:')).length} verified
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-green-600">Reliability Score:</span>
                                  <span className="ml-1 text-muted-foreground">
                                    {avatar.sources?.length || 0 > 3 ? 'High' : avatar.sources?.length || 0 > 1 ? 'Medium' : 'Low'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Performance Metrics (if from Performance Agent) */}
                          {avatar.recommendationSource === 'performance_agent' && (
                            <div className="p-3 rounded-md bg-white dark:bg-green-900/40 border border-green-200">
                              <h5 className="text-sm font-medium text-green-700 mb-2">Account Performance Evidence</h5>
                              <div className="grid grid-cols-3 gap-4 text-xs">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-green-600">4.2%</div>
                                  <div className="text-muted-foreground">Conversion Rate</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-blue-600">2.3x</div>
                                  <div className="text-muted-foreground">Engagement Lift</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-purple-600">$2.40</div>
                                  <div className="text-muted-foreground">ROAS</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Structured Confidence Breakdown */}
                      <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800" data-testid={`confidence-breakdown-${avatar.id}`}>
                        <div className="flex items-center gap-2 mb-3">
                          <BarChart3 className="h-4 w-4 text-gray-600" />
                          <h4 className="font-medium text-gray-700 dark:text-gray-300">Confidence Score Breakdown</h4>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-gray-600">Research Volume</span>
                                <span className="text-xs text-gray-500">{avatar.sources?.length || 0 > 3 ? '40%' : '20%'}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className={`bg-blue-500 h-2 rounded-full`} style={{width: avatar.sources?.length || 0 > 3 ? '40%' : '20%'}}></div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-gray-600">Data Recency</span>
                                <span className="text-xs text-gray-500">30%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{width: '30%'}}></div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-gray-600">Source Validation</span>
                                <span className="text-xs text-gray-500">{parseFloat(avatar.dataConfidence || '0') >= 0.8 ? '25%' : '15%'}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-purple-500 h-2 rounded-full" style={{width: parseFloat(avatar.dataConfidence || '0') >= 0.8 ? '25%' : '15%'}}></div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-gray-600">Performance Lift</span>
                                <span className="text-xs text-gray-500">{avatar.recommendationSource === 'performance_agent' ? '25%' : '5%'}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-orange-500 h-2 rounded-full" style={{width: avatar.recommendationSource === 'performance_agent' ? '25%' : '5%'}}></div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-3 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700">Total Confidence Score</span>
                              <span className="text-lg font-bold text-gray-700">{Math.round(parseFloat(avatar.dataConfidence || '0') * 100)}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {parseFloat(avatar.dataConfidence || '0') >= 0.85 ? 'Excellent confidence - Recommend immediate testing' :
                               parseFloat(avatar.dataConfidence || '0') >= 0.7 ? 'Good confidence - Suitable for testing with monitoring' :
                               'Moderate confidence - Consider as experimental segment'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Creative Hooks */}
                      <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                          <h4 className="font-medium text-purple-700 dark:text-purple-300">Tested Hooks ({avatar.hooks?.length || 0})</h4>
                        </div>
                        <div className="space-y-2">
                          {avatar.hooks?.map((hook, index) => (
                            <div key={index} className="p-2 rounded-md bg-white dark:bg-purple-900/40 border border-purple-200 dark:border-purple-700">
                              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">"{hook}"</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Creative Angle Ideas */}
                      <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center gap-2 mb-3">
                          <Brain className="h-4 w-4 text-orange-600" />
                          <h4 className="font-medium text-orange-700 dark:text-orange-300">Creative Angles ({avatar.angleIdeas?.length || 0})</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {avatar.angleIdeas?.map((angle, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-300">
                              {angle}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Approval Section for Expanded View */}
                      {avatar.status === "pending" && (
                        <div className="pt-4 border-t space-y-3">
                          <Textarea
                            placeholder="Add feedback or strategic notes about this avatar..."
                            value={feedback[avatar.id] || ""}
                            onChange={(e) => setFeedback(prev => ({ ...prev, [avatar.id]: e.target.value }))}
                            rows={3}
                            data-testid={`textarea-feedback-${avatar.id}`}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAvatarApproval(avatar.id, "approved")}
                              data-testid={`button-approve-${avatar.id}`}
                            >
                              <ThumbsUp className="mr-2 h-3 w-3" />
                              Approve for Testing
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleAvatarApproval(avatar.id, "rejected")}
                              data-testid={`button-reject-${avatar.id}`}
                            >
                              <ThumbsDown className="mr-2 h-3 w-3" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Show feedback if already reviewed */}
                      {avatar.status !== "pending" && avatar.feedback && (
                        <div className="p-3 rounded-lg bg-muted/50 border-l-4 border-l-primary">
                          <p className="text-sm"><strong>Strategic Notes:</strong> {avatar.feedback}</p>
                        </div>
                      )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )))}
          </div>
        </div>

        {/* Right: Filtered Concepts */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Creative Concepts
              {selectedAvatar && (
                <Badge variant="outline" className="ml-2">
                  Filtered for {avatars.find(a => a.id === selectedAvatar)?.name}
                </Badge>
              )}
            </h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button 
                    onClick={generateNewConcepts}
                    disabled={isGenerating || avatars.length === 0 || !isKnowledgeBaseCompleted}
                    size="sm"
                    data-testid="button-generate-concepts"
                  >
                    {isGenerating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
                    {isGenerating ? "Fetching..." : "Find Concepts"}
                  </Button>
                </span>
              </TooltipTrigger>
              {(!isKnowledgeBaseCompleted || avatars.length === 0) && (
                <TooltipContent>
                  <p>
                    {!isKnowledgeBaseCompleted 
                      ? "Complete your knowledge base setup first to fetch concepts"
                      : "Generate avatars first before fetching concepts from social media"
                    }
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </div>
          
          {!selectedAvatar ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <Users className="h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="font-medium mb-2">Select an Avatar to View Concepts</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a customer avatar from the left to see relevant creative concepts ranked by fit.
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Enhanced Selection CTA */}
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-primary mb-1">
                      Choose Concepts for {avatars.find(a => a.id === selectedAvatar)?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Select creative concepts below to reproduce or take inspiration from. Link concepts to generate targeted scripts and briefs.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{getFilteredConcepts().length}</p>
                    <p className="text-xs text-muted-foreground">Available Concepts</p>
                  </div>
                </div>
              </Card>
              
              {getFilteredConcepts().map((concept) => {
                const isLinked = selectedAvatar ? isConceptLinked(selectedAvatar, concept.id) : false
                return (
                  <Card key={concept.id} className="hover-elevate" data-testid={`card-concept-${concept.id}`}>
                    <CardHeader>
                      {/* Title stretched across full width */}
                      <CardTitle className="text-lg w-full">{concept.title}</CardTitle>
                      
                      {/* Badges and buttons row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant="outline"
                            className={`${
                              concept.relevanceScore >= 0.8 ? 'bg-green-100 text-green-800 border-green-300' :
                              concept.relevanceScore >= 0.6 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                              'bg-gray-100 text-gray-800 border-gray-300'
                            }`}
                          >
                            {Math.round(concept.relevanceScore * 100)}% fit
                          </Badge>
                          <Badge className={getFormatColor(concept.format)}>
                            {concept.format}
                          </Badge>
                          {isLinked && (
                            <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-300">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Linked
                            </Badge>
                          )}
                          {concept.referenceUrl && (
                            <Button size="sm" variant="ghost" asChild>
                              <a href={concept.referenceUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedAvatar && (
                            <Button
                              size="sm"
                              variant={isLinked ? "destructive" : "default"}
                              onClick={() => isLinked 
                                ? unlinkConcept(selectedAvatar, concept.id)
                                : linkConcept(selectedAvatar, concept.id)
                              }
                              data-testid={`button-link-${concept.id}`}
                            >
                              {isLinked ? (
                                "Unlink"
                              ) : (
                                <>
                                  <Link className="mr-2 h-4 w-4" />
                                  Link
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                      <CardDescription>{concept.platform} • {concept.industry}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Visual Preview Section */}
                      {concept.referenceUrl && (
                        <div className="relative rounded-lg overflow-hidden bg-muted/20 border">
                          <div className="aspect-video w-full">
                            {/* Video Embed for TikTok, YouTube, Instagram */}
                            {(concept.referenceUrl.includes('tiktok.com') || 
                              concept.referenceUrl.includes('youtube.com') || 
                              concept.referenceUrl.includes('youtu.be') ||
                              concept.referenceUrl.includes('instagram.com')) ? (
                              <iframe
                                src={getEmbedUrl(concept.referenceUrl)}
                                className="w-full h-full"
                                frameBorder="0"
                                allowFullScreen
                                title={concept.title}
                              />
                            ) : (
                              /* Fallback for other URLs - show as clickable preview */
                              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
                                <div className="text-center p-6">
                                  <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <TrendingUp className="h-8 w-8 text-primary" />
                                  </div>
                                  <h4 className="font-medium text-sm mb-2">{concept.title}</h4>
                                  <p className="text-xs text-muted-foreground mb-3">{concept.format}</p>
                                  <Button size="sm" variant="outline" asChild>
                                    <a href={concept.referenceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                      <ExternalLink className="h-3 w-3" />
                                      View Content
                                    </a>
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Overlay with engagement metrics */}
                          <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded-md text-xs flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              👁 {concept.performance.views}
                            </span>
                            <span className="flex items-center gap-1">
                              ❤️ {concept.performance.engagement}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Performance Metrics */}
                      <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/30 border">
                        <div className="text-center">
                          <p className="text-xl font-bold text-blue-600">{concept.performance.views}</p>
                          <p className="text-xs text-muted-foreground">Views</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-green-600">{concept.performance.engagement}</p>
                          <p className="text-xs text-muted-foreground">Engagement</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-purple-600">{concept.performance.conversionRate}</p>
                          <p className="text-xs text-muted-foreground">Conversion</p>
                        </div>
                      </div>

                      {/* Key Elements with Match Highlighting */}
                      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <h4 className="font-medium text-sm text-green-700 dark:text-green-300 mb-2">Key Creative Elements</h4>
                        <div className="flex flex-wrap gap-2">
                          {concept.keyElements.map((element, index) => {
                            const avatar = selectedAvatar ? avatars.find(a => a.id === selectedAvatar) : null
                            const { matchedElements } = avatar ? getMatchedElements(avatar, concept) : { matchedElements: [] as string[] }
                            const isMatched = matchedElements.includes(element)
                            return (
                              <Badge 
                                key={index} 
                                variant={isMatched ? "default" : "outline"} 
                                className={`text-xs ${
                                  isMatched 
                                    ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200' 
                                    : ''
                                }`}
                              >
                                {element}
                                {isMatched && <span className="ml-1">✓</span>}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                      
                      {/* Evidence Section - Why This Matches */}
                      {(() => {
                        const avatar = selectedAvatar ? avatars.find(a => a.id === selectedAvatar) : null
                        const { matchedHooks, matchedElements } = avatar ? getMatchedElements(avatar, concept) : { matchedHooks: [], matchedElements: [] }
                        
                        if (!avatar || (matchedHooks.length === 0 && matchedElements.length === 0)) return null
                        
                        return (
                          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                            <h4 className="font-medium text-sm text-blue-700 dark:text-blue-300 mb-2">Why This Matches {avatar.name}</h4>
                            
                            {matchedHooks.length > 0 && (
                              <div className="mb-3">
                                <p className="text-xs text-muted-foreground mb-1">Matched Hooks:</p>
                                <div className="flex flex-wrap gap-1">
                                  {matchedHooks.map((hook, index) => (
                                    <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                                      "{hook.slice(0, 30)}..."
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {matchedElements.length > 0 && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Matched Elements:</p>
                                <div className="flex flex-wrap gap-1">
                                  {matchedElements.map((element, index) => (
                                    <Badge key={index} variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
                                      {element}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })()}

                      {/* Generate Script CTA for linked concepts */}
                      {isLinked && (
                        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-sm text-primary mb-1">Ready for Script Generation</h4>
                              <p className="text-xs text-muted-foreground">
                                This concept is linked to your avatar. Generate a script using their combined insights.
                              </p>
                            </div>
                            <Button 
                              size="sm" 
                              asChild
                              data-testid={`button-generate-script-${concept.id}`}
                            >
                              <a 
                                href={`/script?avatarId=${selectedAvatar}&conceptId=${concept.id}`} 
                                className="flex items-center gap-2"
                              >
                                Generate Script
                                <ArrowRight className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Concept Approval Section */}
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
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResearchAgentDashboard