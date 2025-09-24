import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
  CheckCircle
} from "lucide-react"

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
  relevanceScore?: number
}

interface ConceptWithRelevance extends CreativeConcept {
  relevanceScore: number
}

export function ResearchAgentDashboard() {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [linkedConcepts, setLinkedConcepts] = useState<Record<string, string[]>>({})

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
    if (!selectedAvatar) return
    
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

  const linkConcept = (avatarId: string, conceptId: string) => {
    setLinkedConcepts(prev => ({
      ...prev,
      [avatarId]: [...(prev[avatarId] || []), conceptId]
    }))
  }

  const unlinkConcept = (avatarId: string, conceptId: string) => {
    setLinkedConcepts(prev => ({
      ...prev,
      [avatarId]: (prev[avatarId] || []).filter(id => id !== conceptId)
    }))
  }

  const isConceptLinked = (avatarId: string, conceptId: string) => {
    return linkedConcepts[avatarId]?.includes(conceptId) || false
  }

  const computeRelevanceScore = (avatar: CustomerAvatar, concept: CreativeConcept): number => {
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

  const getMatchedElements = (avatar: CustomerAvatar, concept: CreativeConcept) => {
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

  const getFilteredConcepts = (): ConceptWithRelevance[] => {
    if (!selectedAvatar) return []
    
    const avatar = avatars.find(a => a.id === selectedAvatar)
    if (!avatar) return []
    
    return creativeConcepts
      .map(concept => ({
        ...concept,
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
            <p className="text-muted-foreground">Integrated customer research & viral creative concept analysis</p>
          </div>
        </div>
      </div>

      {/* Integrated Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Avatar Selection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Avatars
            </h2>
            <Button 
              onClick={generateNewAvatars}
              disabled={isGenerating}
              size="sm"
              data-testid="button-generate-avatars"
            >
              {isGenerating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </div>

          {/* Avatar List */}
          <div className="space-y-3">
            {avatars.map((avatar) => (
              <Card 
                key={avatar.id} 
                className={`cursor-pointer transition-all ${
                  selectedAvatar === avatar.id 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover-elevate'
                }`}
                onClick={() => setSelectedAvatar(avatar.id)}
                data-testid={`card-avatar-${avatar.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-medium">{avatar.name}</CardTitle>
                      <CardDescription className="text-xs">{avatar.demographics}</CardDescription>
                    </div>
                    <Badge 
                      variant={
                        avatar.status === "approved" ? "default" : 
                        avatar.status === "rejected" ? "destructive" : "secondary"
                      }
                    >
                      {avatar.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-3 w-3 text-red-600" />
                      <span className="font-medium text-red-600 text-xs">Pain Point</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{avatar.painPoint}</p>
                  </div>
                  
                  {/* Linked Concepts Preview */}
                  {selectedAvatar === avatar.id && linkedConcepts[avatar.id] && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-xs text-muted-foreground mb-2">
                        {linkedConcepts[avatar.id].length} Linked Concepts
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {linkedConcepts[avatar.id].slice(0, 3).map(conceptId => {
                          const concept = creativeConcepts.find(c => c.id === conceptId)
                          return concept ? (
                            <Badge key={conceptId} variant="outline" className="text-xs">
                              {concept.title.slice(0, 20)}...
                            </Badge>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Approval Section */}
                  {selectedAvatar === avatar.id && avatar.status === "pending" && (
                    <div className="mt-3 pt-3 border-t space-y-3">
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
                          <ThumbsUp className="mr-2 h-3 w-3" />
                          Approve
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
                  {selectedAvatar === avatar.id && avatar.status !== "pending" && avatar.feedback && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="p-3 rounded-lg bg-muted/50 border-l-4 border-l-primary">
                        <p className="text-xs"><strong>Feedback:</strong> {avatar.feedback}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right: Filtered Concepts */}
        <div className="lg:col-span-2 space-y-4">
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
            <Button 
              onClick={generateNewConcepts}
              disabled={isGenerating || !selectedAvatar}
              size="sm"
              data-testid="button-generate-concepts"
            >
              {isGenerating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
              {isGenerating ? "Analyzing..." : "Find Concepts"}
            </Button>
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
              {getFilteredConcepts().map((concept) => {
                const isLinked = selectedAvatar ? isConceptLinked(selectedAvatar, concept.id) : false
                return (
                  <Card key={concept.id} className="hover-elevate" data-testid={`card-concept-${concept.id}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg">{concept.title}</CardTitle>
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
                          {concept.referenceUrl && (
                            <Button size="sm" variant="ghost" asChild>
                              <a href={concept.referenceUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                      <CardDescription>{concept.platform} • {concept.industry}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
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
                            const { matchedElements } = avatar ? getMatchedElements(avatar, concept) : { matchedElements: [] }
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