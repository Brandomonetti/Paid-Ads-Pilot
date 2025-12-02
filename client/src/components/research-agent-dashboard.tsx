import { useState, useEffect } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
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
  Database,
  X,
  Unlink,
  Eye,
  Play
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
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("avatars")
  const [selectedAvatars, setSelectedAvatars] = useState<Set<string>>(new Set())
  
  // Filter states
  const [avatarFilters, setAvatarFilters] = useState({
    priority: "all",
    confidence: "all",
    source: "all",
    status: "all",
    search: ""
  })
  const [conceptFilters, setConceptFilters] = useState({
    platform: "all",
    engagement: "all",
    format: "all",
    search: ""
  })
  
  const { toast } = useToast()


  // Fetch avatars from backend
  const { data: avatars = [], isLoading: isLoadingAvatars } = useQuery<Avatar[]>({
    queryKey: ['/api/avatars'],
  })

  // Fetch all concepts (not filtered by avatar - we'll filter locally)
  const { data: concepts = [], isLoading: isLoadingConcepts } = useQuery<Concept[]>({
    queryKey: ['/api/concepts'],
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

  const handleGenerateClick = () => {
    if (!isKnowledgeBaseCompleted) {
      toast({
        title: "Knowledge Base Required",
        description: "Please complete your knowledge base setup first before generating avatars.",
        variant: "destructive"
      })
      return
    }

    // Show confirmation modal if avatars already exist
    if (avatars.length > 0) {
      setShowRegenerateConfirm(true)
    } else {
      // No existing data, generate directly
      generateNewAvatars()
    }
  }

  const generateNewAvatars = async () => {
    setShowRegenerateConfirm(false)
    setIsGenerating(true)
    try {
      // NEW WORKFLOW: Generate 4-5 avatars at once (deletes old data first)
      const response = await apiRequest('POST', '/api/generate-avatars')
      const result = await response.json()
      
      // Invalidate avatars query to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['/api/avatars'] })
      
      // Show detailed deletion + generation message
      const deletionInfo = result.deletedCount?.avatars > 0 
        ? `Deleted ${result.deletedCount.avatars} old avatars, ${result.deletedCount.concepts} concepts, ${result.deletedCount.links} links. ` 
        : ''
      
      toast({
        title: "Avatars Generated",
        description: `${deletionInfo}Generated ${result.count} fresh customer avatars. Now fetching concepts...`,
      })

      // Automatically fetch concepts after avatar generation
      const conceptsResponse = await apiRequest('POST', '/api/generate-concepts')
      const conceptsResult = await conceptsResponse.json()
      
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['/api/concepts'] })
      queryClient.invalidateQueries({ queryKey: ['/api/avatar-concepts'] })
      
      toast({
        title: "Workflow Complete",
        description: `Generated ${result.count} avatars and fetched ${conceptsResult.count} concepts. Review and manually link concepts to avatars.`,
      })
    } catch (error) {
      console.error('Failed to generate avatars:', error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate avatars and concepts. Please try again.",
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
      // If an avatar is selected, fetch concepts ONLY for that avatar
      // Otherwise, fetch for ALL avatars
      const requestBody = selectedAvatar ? { avatarId: selectedAvatar } : {}
      const response = await apiRequest('POST', '/api/generate-concepts', requestBody)
      const result = await response.json()
      
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['/api/concepts'] })
      queryClient.invalidateQueries({ queryKey: ['/api/avatar-concepts'] })
      
      const avatarName = selectedAvatar ? avatars.find(a => a.id === selectedAvatar)?.name : 'all avatars'
      
      toast({
        title: "Concepts Fetched",
        description: selectedAvatar 
          ? `Fetched ${result.count} concepts for ${avatarName}. Review and manually link to avatars.`
          : `Fetched ${result.count} concepts for ${result.avatarsProcessed} avatar(s). Review and manually link them.`,
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
    const relevanceScore = await computeRelevanceScore(avatar, concept) // Now async!
    
    const linkData: AvatarConceptInsert = {
      avatarId,
      conceptId,
      relevanceScore: relevanceScore.toString(),
      matchedHooks,
      matchedElements,
      rationale: `This concept matches ${avatar.name} with ${Math.round(relevanceScore * 100)}% relevance based on AI analysis of pain points, demographics, and creative elements.`,
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

  // AI-powered relevance score calculation
  const computeRelevanceScore = async (avatar: Avatar, concept: Concept): Promise<number> => {
    try {
      const response = await fetch('/api/calculate-relevance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          avatarId: avatar.id,
          conceptId: concept.id
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to calculate relevance score');
      }
      
      const data = await response.json();
      return data.relevanceScore;
    } catch (error) {
      console.error('Error calculating AI relevance score:', error);
      // Fallback to neutral score if API fails
      return 0.50;
    }
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

  // Use state to cache AI-calculated relevance scores
  const [conceptScores, setConceptScores] = useState<Record<string, number>>({})
  
  // Calculate scores when avatar or concepts change
  useEffect(() => {
    if (!selectedAvatar || concepts.length === 0) return
    
    const avatar = avatars.find(a => a.id === selectedAvatar)
    if (!avatar) return
    
    // Calculate scores for all concepts in parallel
    Promise.all(
      concepts.map(async (concept) => {
        const key = `${selectedAvatar}-${concept.id}`
        // Only calculate if not already cached
        if (conceptScores[key] === undefined) {
          const score = await computeRelevanceScore(avatar, concept)
          return { key, score }
        }
        return null
      })
    ).then((results) => {
      const newScores = { ...conceptScores }
      results.forEach((result) => {
        if (result) {
          newScores[result.key] = result.score
        }
      })
      setConceptScores(newScores)
    })
  }, [selectedAvatar, concepts, avatars])
  
  const getFilteredConcepts = (): ConceptWithRelevance[] => {
    if (!selectedAvatar) return []
    
    const avatar = avatars.find(a => a.id === selectedAvatar)
    if (!avatar) return []
    
    return concepts
      .map(concept => ({
        ...concept,
        performance: concept.performance as PerformanceMetrics,
        relevanceScore: conceptScores[`${selectedAvatar}-${concept.id}`] || 0.50 // Use cached score or default
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

  // Compute dashboard stats
  const stats = {
    totalAvatars: avatars.length,
    highPriority: avatars.filter(a => a.priority === 'high').length,
    totalConcepts: concepts.length,
    avgConfidence: avatars.length > 0 
      ? Math.round((avatars.reduce((sum, a) => sum + parseFloat(a.dataConfidence || '0'), 0) / avatars.length) * 100)
      : 0,
    totalLinks: avatarConcepts.filter(ac => ac.status === 'linked').length,
    facebookConcepts: concepts.filter(c => c.platform === 'facebook').length,
    instagramConcepts: concepts.filter(c => c.platform === 'instagram').length,
    tiktokConcepts: concepts.filter(c => c.platform === 'tiktok').length,
  }

  // Apply avatar filters
  const filteredAvatars = avatars.filter(avatar => {
    if (avatarFilters.priority !== "all" && avatar.priority !== avatarFilters.priority) return false
    if (avatarFilters.source !== "all" && avatar.recommendationSource !== avatarFilters.source) return false
    if (avatarFilters.status !== "all" && avatar.status !== avatarFilters.status) return false
    if (avatarFilters.confidence !== "all") {
      const confidence = parseFloat(avatar.dataConfidence || '0')
      if (avatarFilters.confidence === "high" && confidence < 0.8) return false
      if (avatarFilters.confidence === "medium" && (confidence < 0.6 || confidence >= 0.8)) return false
      if (avatarFilters.confidence === "low" && confidence >= 0.6) return false
    }
    if (avatarFilters.search && !avatar.name.toLowerCase().includes(avatarFilters.search.toLowerCase()) &&
        !avatar.demographics.toLowerCase().includes(avatarFilters.search.toLowerCase())) return false
    return true
  })

  // Apply concept filters  
  const filteredConceptsAll = concepts.filter(concept => {
    if (conceptFilters.platform !== "all" && concept.platform !== conceptFilters.platform) return false
    if (conceptFilters.format !== "all" && concept.format !== conceptFilters.format) return false
    if (conceptFilters.search && !concept.title.toLowerCase().includes(conceptFilters.search.toLowerCase()) &&
        !concept.industry.toLowerCase().includes(conceptFilters.search.toLowerCase())) return false
    return true
  })

  // Bulk actions
  const handleBulkApprove = async () => {
    for (const avatarId of Array.from(selectedAvatars)) {
      try {
        await updateAvatarMutation.mutateAsync({ 
          id: avatarId, 
          updates: { status: "approved" } 
        })
      } catch (error) {
        console.error(`Failed to approve avatar ${avatarId}:`, error)
      }
    }
    setSelectedAvatars(new Set())
    toast({
      title: "Avatars Approved",
      description: `${selectedAvatars.size} avatars have been approved.`,
    })
  }

  const handleBulkReject = async () => {
    for (const avatarId of Array.from(selectedAvatars)) {
      try {
        await updateAvatarMutation.mutateAsync({ 
          id: avatarId, 
          updates: { status: "rejected" } 
        })
      } catch (error) {
        console.error(`Failed to reject avatar ${avatarId}:`, error)
      }
    }
    setSelectedAvatars(new Set())
    toast({
      title: "Avatars Rejected",
      description: `${selectedAvatars.size} avatars have been rejected.`,
    })
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
            <h1 className="text-2xl font-bold" data-testid="heading-research-agent">Research Agent</h1>
            <p className="text-sm text-muted-foreground">AI-powered audience intelligence and creative discovery platform</p>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-stat-avatars">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Avatars</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-avatars">{stats.totalAvatars}</div>
            <p className="text-xs text-muted-foreground">
              {stats.highPriority} high-priority segments
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-concepts">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concepts Discovered</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-concepts">{stats.totalConcepts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.facebookConcepts} FB • {stats.instagramConcepts} IG • {stats.tiktokConcepts} TT
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-confidence">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Data Confidence</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-confidence">{stats.avgConfidence}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.avgConfidence >= 80 ? 'Excellent reliability' : stats.avgConfidence >= 60 ? 'Good reliability' : 'Needs validation'}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-links">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matched Insights</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-links">{stats.totalLinks}</div>
            <p className="text-xs text-muted-foreground">
              Avatar-concept pairings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList data-testid="tabs-navigation">
          <TabsTrigger value="avatars" data-testid="tab-avatars">
            <Users className="h-4 w-4 mr-2" />
            Customer Avatars
          </TabsTrigger>
          <TabsTrigger value="concepts" data-testid="tab-concepts">
            <TrendingUp className="h-4 w-4 mr-2" />
            Creative Concepts
          </TabsTrigger>
          <TabsTrigger value="insights" data-testid="tab-insights">
            <Brain className="h-4 w-4 mr-2" />
            Matched Insights
          </TabsTrigger>
        </TabsList>

        {/* Tab: Customer Avatars */}
        <TabsContent value="avatars" className="space-y-4">
          {/* Loading skeleton for avatars */}
          {isLoadingAvatars && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {!isLoadingAvatars && (
            <>
          {/* Avatar Filters */}
          <Card data-testid="card-avatar-filters">
            <CardHeader>
              <CardTitle className="text-base">Filter Avatars</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Input
                placeholder="Search by name or demographics..."
                value={avatarFilters.search}
                onChange={(e) => setAvatarFilters({...avatarFilters, search: e.target.value})}
                className="flex-1 min-w-[200px]"
                data-testid="input-avatar-search"
              />
              <Select 
                value={avatarFilters.priority} 
                onValueChange={(value) => setAvatarFilters({...avatarFilters, priority: value})}
              >
                <SelectTrigger className="w-[150px]" data-testid="select-priority">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={avatarFilters.confidence} 
                onValueChange={(value) => setAvatarFilters({...avatarFilters, confidence: value})}
              >
                <SelectTrigger className="w-[150px]" data-testid="select-confidence">
                  <SelectValue placeholder="Confidence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Confidence</SelectItem>
                  <SelectItem value="high">&gt;80%</SelectItem>
                  <SelectItem value="medium">60-80%</SelectItem>
                  <SelectItem value="low">&lt;60%</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={avatarFilters.source} 
                onValueChange={(value) => setAvatarFilters({...avatarFilters, source: value})}
              >
                <SelectTrigger className="w-[150px]" data-testid="select-source">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="performance_agent">Performance</SelectItem>
                  <SelectItem value="user_request">User Request</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={avatarFilters.status} 
                onValueChange={(value) => setAvatarFilters({...avatarFilters, status: value})}
              >
                <SelectTrigger className="w-[150px]" data-testid="select-status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedAvatars.size > 0 && (
            <Card className="bg-primary/5 border-primary/20" data-testid="card-bulk-actions">
              <CardContent className="flex items-center justify-between gap-4 pt-4">
                <p className="text-sm font-medium">
                  {selectedAvatars.size} avatar{selectedAvatars.size !== 1 ? 's' : ''} selected
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkApprove}
                    data-testid="button-bulk-approve"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkReject}
                    data-testid="button-bulk-reject"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject All
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedAvatars(new Set())}
                    data-testid="button-clear-selection"
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 1: Customer Avatars */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Avatars ({filteredAvatars.length})
            </h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button 
                    onClick={handleGenerateClick}
                    disabled={isGenerating || !isKnowledgeBaseCompleted}
                    size="sm"
                    data-testid="button-generate-avatars"
                  >
                    {isGenerating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                    {isGenerating ? "Generating..." : avatars.length > 0 ? "Regenerate" : "Generate"}
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

          {filteredAvatars.length === 0 ? (
            <Card className="p-8 text-center" data-testid="empty-avatars">
              <div className="flex flex-col items-center gap-4">
                <Users className="h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="font-medium mb-2">No Avatars Found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {avatars.length === 0 
                      ? (!isKnowledgeBaseCompleted 
                        ? "Complete your knowledge base setup to generate customer avatars based on your brand information."
                        : "Click the Generate button above to create customer avatars based on your knowledge base.")
                      : "No avatars match the current filters. Try adjusting your filter criteria."
                    }
                  </p>
                  {!isKnowledgeBaseCompleted && avatars.length === 0 && (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAvatars.map((avatar) => (
                <Card 
                  key={avatar.id}
                  className="hover-elevate cursor-pointer"
                  data-testid={`card-avatar-${avatar.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <input
                            type="checkbox"
                            checked={selectedAvatars.has(avatar.id)}
                            onChange={(e) => {
                              e.stopPropagation()
                              const newSelected = new Set(selectedAvatars)
                              if (newSelected.has(avatar.id)) {
                                newSelected.delete(avatar.id)
                              } else {
                                newSelected.add(avatar.id)
                              }
                              setSelectedAvatars(newSelected)
                            }}
                            className="rounded border-gray-300"
                            data-testid={`checkbox-avatar-${avatar.id}`}
                          />
                          <CardTitle className="text-base">{avatar.name}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
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
                          <Badge 
                            variant={
                              avatar.status === "approved" ? "default" : 
                              avatar.status === "rejected" ? "destructive" : "secondary"
                            }
                            className="text-xs"
                          >
                            {avatar.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{avatar.demographics}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Database className="h-3 w-3" />
                        {Math.round(parseFloat(avatar.dataConfidence || '0') * 100)}% confidence
                      </span>
                      <span>•</span>
                      <span>{avatar.sources?.length || 0} sources</span>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={(e) => e.stopPropagation()}
                          data-testid={`button-view-details-${avatar.id}`}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Full Research
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Research Deep Dive: {avatar.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6" data-testid={`expanded-research-${avatar.id}`}>
                          {/* Strategic Justification */}
                          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-2 mb-3">
                              <AlertTriangle className="h-4 w-4 text-blue-600" />
                              <h4 className="font-medium text-blue-700 dark:text-blue-300">Strategic Justification</h4>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{avatar.reasoning}</p>
                          </div>
                          
                          {/* Pain Point */}
                          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="h-4 w-4 text-red-600" />
                              <h4 className="font-medium text-red-700 dark:text-red-300">Core Pain Point</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">{avatar.painPoint}</p>
                          </div>
                          
                          {/* Hooks */}
                          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center gap-2 mb-3">
                              <Zap className="h-4 w-4 text-purple-600" />
                              <h4 className="font-medium text-purple-700 dark:text-purple-300">Creative Hooks</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {avatar.hooks.map((hook, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {hook}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          {/* Sources */}
                          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-2 mb-3">
                              <Database className="h-4 w-4 text-green-600" />
                              <h4 className="font-medium text-green-700 dark:text-green-300">Evidence Sources ({avatar.sources?.length || 0})</h4>
                            </div>
                            <div className="space-y-2">
                              {avatar.sources?.map((source, idx) => (
                                <div key={idx} className="text-sm text-muted-foreground p-2 bg-white dark:bg-green-900/40 rounded">
                                  {source}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          </>
          )}
        </TabsContent>

        {/* TAB 2: Creative Concepts */}
        <TabsContent value="concepts" className="space-y-4">
          {/* Loading skeleton for concepts */}
          {isLoadingConcepts && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-32 w-full mb-3" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {!isLoadingConcepts && (
            <>
          {/* Concept Filters */}
          <Card data-testid="card-concept-filters">
            <CardHeader>
              <CardTitle className="text-base">Filter Concepts</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Input
                placeholder="Search by title or industry..."
                value={conceptFilters.search}
                onChange={(e) => setConceptFilters({...conceptFilters, search: e.target.value})}
                className="flex-1 min-w-[200px]"
                data-testid="input-concept-search"
              />
              <Select 
                value={conceptFilters.platform} 
                onValueChange={(value) => setConceptFilters({...conceptFilters, platform: value})}
              >
                <SelectTrigger className="w-[150px]" data-testid="select-platform">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={conceptFilters.format} 
                onValueChange={(value) => setConceptFilters({...conceptFilters, format: value})}
              >
                <SelectTrigger className="w-[180px]" data-testid="select-format">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Formats</SelectItem>
                  <SelectItem value="Raw UGC Video">Raw UGC Video</SelectItem>
                  <SelectItem value="POV Storytelling">POV Storytelling</SelectItem>
                  <SelectItem value="Sped-up Process Video">Sped-up Process</SelectItem>
                  <SelectItem value="DIML Storytelling">DIML Storytelling</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={conceptFilters.engagement} 
                onValueChange={(value) => setConceptFilters({...conceptFilters, engagement: value})}
              >
                <SelectTrigger className="w-[150px]" data-testid="select-engagement">
                  <SelectValue placeholder="Engagement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Engagement</SelectItem>
                  <SelectItem value="high">&gt;10%</SelectItem>
                  <SelectItem value="medium">5-10%</SelectItem>
                  <SelectItem value="low">&lt;5%</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Concepts Grid */}
          {filteredConceptsAll.length === 0 ? (
            <Card className="p-8 text-center" data-testid="empty-concepts">
              <div className="flex flex-col items-center gap-4">
                <TrendingUp className="h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="font-medium mb-2">No Concepts Found</h3>
                  <p className="text-sm text-muted-foreground">
                    {concepts.length === 0 
                      ? "Generate avatars first to fetch creative concepts."
                      : "No concepts match the current filters. Try adjusting your filter criteria."
                    }
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredConceptsAll.map((concept) => (
                <Card key={concept.id} className="hover-elevate" data-testid={`card-concept-${concept.id}`}>
                  <CardHeader className="pb-3">
                    <div className="aspect-video relative bg-muted rounded-md overflow-hidden mb-3">
                      {concept.thumbnailUrl ? (
                        <img 
                          src={concept.thumbnailUrl} 
                          alt={concept.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Play className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-sm line-clamp-2">{concept.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs capitalize">
                        {concept.platform}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${getFormatColor(concept.format)}`}>
                        {concept.format}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Views:</span>
                        <span className="font-medium">{(concept.performance as PerformanceMetrics).views}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Engagement:</span>
                        <span className="font-medium">{(concept.performance as PerformanceMetrics).engagement}</span>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      asChild
                      data-testid={`button-view-concept-${concept.id}`}
                    >
                      <a href={concept.referenceUrl || '#'} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Original
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          </>
          )}
        </TabsContent>

        {/* TAB 3: Matched Insights */}
        <TabsContent value="insights" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Matched Insights ({avatarConcepts.filter(ac => ac.status === 'linked').length})
            </h2>
          </div>

          {avatarConcepts.filter(ac => ac.status === 'linked').length === 0 ? (
            <Card className="p-8 text-center" data-testid="empty-insights">
              <div className="flex flex-col items-center gap-4">
                <Brain className="h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="font-medium mb-2">No Matched Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Link avatars to concepts to create matched insights for your campaigns.
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {avatarConcepts
                .filter(ac => ac.status === 'linked')
                .map((link) => {
                  const avatar = avatars.find(a => a.id === link.avatarId)
                  const concept = concepts.find(c => c.id === link.conceptId)
                  if (!avatar || !concept) return null
                  
                  return (
                    <Card key={link.id} className="hover-elevate" data-testid={`card-insight-${link.id}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <CardTitle className="text-base mb-2">{avatar.name}</CardTitle>
                            <CardDescription className="text-sm">
                              {concept.title}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                            {Math.round(parseFloat(link.relevanceScore) * 100)}% match
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {concept.platform}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${getFormatColor(concept.format)}`}>
                            {concept.format}
                          </Badge>
                        </div>
                        
                        {link.rationale && (
                          <p className="text-xs text-muted-foreground">{link.rationale}</p>
                        )}
                        
                        {link.matchedHooks && link.matchedHooks.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium">Matched Hooks:</p>
                            <div className="flex flex-wrap gap-1">
                              {link.matchedHooks.map((hook, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {hook}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-full"
                          onClick={() => unlinkConcept(link.avatarId, link.conceptId)}
                          data-testid={`button-unlink-${link.id}`}
                        >
                          <Unlink className="h-4 w-4 mr-2" />
                          Unlink
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Regenerate Confirmation Dialog */}
      <AlertDialog open={showRegenerateConfirm} onOpenChange={setShowRegenerateConfirm}>
        <AlertDialogContent data-testid="dialog-regenerate-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete All Data & Regenerate?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              <p>
                Regenerating avatars will <strong>permanently delete</strong> all existing data:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>{avatars.length} customer avatars</li>
                <li>All linked creative concepts</li>
                <li>All avatar-concept mappings</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                The system will generate 4-5 fresh avatars and fetch new platform-specific concepts from scratch.
              </p>
              <p className="font-medium text-destructive">
                This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-regenerate">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={generateNewAvatars}
              className="bg-destructive hover:bg-destructive/90"
              data-testid="button-confirm-regenerate"
            >
              Delete & Regenerate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ResearchAgentDashboard