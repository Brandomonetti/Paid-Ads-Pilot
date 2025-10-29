import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Search,
  TrendingUp,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Play,
  Filter,
  ExternalLink,
  Download,
  Bookmark,
  BarChart3
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CreativeConcept {
  id: string;
  platform: 'facebook' | 'instagram' | 'tiktok';
  title: string;
  description: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  postUrl?: string;
  brandName?: string;
  industry?: string;
  format: string;
  hooks: string[];
  engagementScore: number;
  likes?: number;
  comments?: number;
  shares?: number;
  views?: number;
  engagementRate?: number;
  createdAt?: string;
}

export function CreativeResearchCenter() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('curated');
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<'url' | 'brand' | 'page'>('brand');
  const [savedConcepts, setSavedConcepts] = useState<Set<string>>(new Set());
  
  const [filters, setFilters] = useState({
    platform: "all",
    engagement: "all",
    format: "all",
    sortBy: "engagement",
    siteType: "all",
    gender: "all",
    ages: "all",
    dailyLikes: "all",
    totalLikes: "all",
    mediaType: "all",
    createdBetween: "all",
    seenBetween: "all",
    networks: "all",
    advertiser: "",
    technologies: "all",
    countries: "all",
    language: "all",
    buttons: "all"
  });

  // Mock data for development visualization
  const mockConcepts: CreativeConcept[] = [
    {
      id: 'c1',
      platform: 'tiktok',
      title: 'Raw UGC: Morning Routine Energy Transformation',
      description: 'Authentic "get ready with me" style video showing before/after energy levels. Creator starts groggy, takes supplement mid-routine, shows visible energy shift by end. Very relatable, no heavy production.',
      format: 'Raw UGC Video',
      hooks: [
        'POV: You finally found something that actually works',
        'This is what 30 days of consistent energy looks like',
        'Watch my energy levels go from 0 to 100'
      ],
      thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      postUrl: 'https://tiktok.com/@fitlifestyle/video/example1',
      brandName: 'VitalityBoost',
      industry: 'Health & Wellness',
      engagementScore: 96,
      likes: 847000,
      comments: 12400,
      shares: 23100,
      views: 4200000,
      engagementRate: 0.21,
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
    },
    {
      id: 'c2',
      platform: 'instagram',
      title: 'Before/After Body Transformation Carousel',
      description: 'Multi-slide carousel showing 90-day transformation with weekly progress photos. Each slide has timestamp and weight/measurements. Final slide reveals the "secret" (product + consistency). High engagement from fitness community.',
      format: 'Before/After',
      hooks: [
        '90 days ago I couldn\'t even look at myself',
        'The difference consistency makes (swipe to see)',
        'Here\'s exactly what I did - no BS'
      ],
      thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
      postUrl: 'https://instagram.com/p/transformation90',
      brandName: 'FitFuel Pro',
      industry: 'Fitness Supplements',
      engagementScore: 93,
      likes: 156000,
      comments: 8900,
      shares: 4200,
      views: 890000,
      engagementRate: 0.19,
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString()
    },
    {
      id: 'c3',
      platform: 'facebook',
      title: 'Emotional Testimonial: Mom Gets Her Energy Back',
      description: 'Heartfelt video testimonial from busy mom who struggled with afternoon crashes. Shows her playing with kids at end of day now. Genuine emotion, relatable pain points. Comments full of "this is me" responses.',
      format: 'Testimonial',
      hooks: [
        'I was too tired to play with my kids after work',
        'This mom of 3 found her energy again',
        'You don\'t have to choose between career and being present'
      ],
      thumbnailUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400',
      postUrl: 'https://facebook.com/watch/momlife-energy',
      brandName: 'MamaVitality',
      industry: 'Health & Wellness',
      engagementScore: 91,
      likes: 42000,
      comments: 6700,
      shares: 18900,
      views: 620000,
      engagementRate: 0.11,
      createdAt: new Date(Date.now() - 21 * 86400000).toISOString()
    },
    {
      id: 'c4',
      platform: 'tiktok',
      title: 'POV Storytelling: The Day Everything Changed',
      description: 'First-person perspective narrative showing "rock bottom" moment, then daily progress clips. Emotional arc with triumphant ending. Uses trending audio. Massive shareability factor.',
      format: 'POV Storytelling',
      hooks: [
        'POV: The day you stopped making excuses',
        'This is what happens when you actually commit',
        'Week 1 vs Week 12 - the difference is insane'
      ],
      thumbnailUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
      postUrl: 'https://tiktok.com/@transformstories/video/example2',
      brandName: 'CoreStrength',
      industry: 'Fitness',
      engagementScore: 94,
      likes: 923000,
      comments: 15200,
      shares: 31400,
      views: 5100000,
      engagementRate: 0.19,
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
    },
    {
      id: 'c5',
      platform: 'instagram',
      title: 'DIML: "I Didn\'t Believe It Until..."',
      description: 'Didn\'t-I-Make-It-Look storytelling format. Creator addresses camera skeptically at start, fast-forwards through journey with voiceover, ends with proof and admission they were wrong. Converts skeptics.',
      format: 'DIML Storytelling',
      hooks: [
        'I thought this was another scam until...',
        'Here\'s why I was wrong (and I\'m glad I was)',
        'The skeptic becomes a believer - my story'
      ],
      thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400',
      postUrl: 'https://instagram.com/reel/skeptic-to-believer',
      brandName: 'TrustFit',
      industry: 'Health & Wellness',
      engagementScore: 89,
      likes: 78000,
      comments: 5400,
      shares: 3100,
      views: 450000,
      engagementRate: 0.19,
      createdAt: new Date(Date.now() - 18 * 86400000).toISOString()
    },
    {
      id: 'c6',
      platform: 'tiktok',
      title: 'Sped-Up Process: 30-Day Timelapse Journey',
      description: 'Fast-motion compilation of daily workout/supplement routine with date stamps. Set to upbeat music. Shows consistency and gradual visible changes. Viewers can see themselves in the journey.',
      format: 'Sped-up Process Video',
      hooks: [
        'What 30 days of consistency actually looks like',
        'Day 1 to Day 30 - watch the transformation',
        'This is what happens when you don\'t give up'
      ],
      thumbnailUrl: 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=400',
      postUrl: 'https://tiktok.com/@30daychallenge/video/example3',
      brandName: 'ConsistentFit',
      industry: 'Fitness',
      engagementScore: 92,
      likes: 645000,
      comments: 9800,
      shares: 19200,
      views: 3200000,
      engagementRate: 0.21,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: 'c7',
      platform: 'facebook',
      title: 'Educational: Science Behind Recovery',
      description: 'Professional-looking educational content explaining muscle recovery science in simple terms. Includes graphics, before/after muscle scans. Positions product as scientifically-backed solution.',
      format: 'Educational Content',
      hooks: [
        'Here\'s what actually happens during muscle recovery',
        'The science of getting stronger (explained simply)',
        'Why your muscles need this to grow'
      ],
      thumbnailUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
      postUrl: 'https://facebook.com/watch/recovery-science',
      brandName: 'ScienceFit Pro',
      industry: 'Fitness Supplements',
      engagementScore: 87,
      likes: 34000,
      comments: 4100,
      shares: 8600,
      views: 380000,
      engagementRate: 0.12,
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString()
    },
    {
      id: 'c8',
      platform: 'instagram',
      title: 'Community Compilation: Real Customer Results',
      description: 'Montage of customer-submitted transformation videos. Shows diversity of ages, body types, backgrounds. Creates "if they can, I can" response. Massive social proof.',
      format: 'UGC Compilation',
      hooks: [
        'These are all real customers - not actors',
        '500+ transformations and counting',
        'Your results could be next'
      ],
      thumbnailUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
      postUrl: 'https://instagram.com/reel/community-results',
      brandName: 'TogetherFit',
      industry: 'Fitness Community',
      engagementScore: 95,
      likes: 234000,
      comments: 11200,
      shares: 15800,
      views: 1100000,
      engagementRate: 0.24,
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString()
    },
    {
      id: 'c9',
      platform: 'tiktok',
      title: 'Controversial Take: "You Don\'t Need More Motivation"',
      description: 'Provocative hook challenges common beliefs. Creator argues systems beat motivation. Shows their simple daily system. Comments debating, huge engagement. Algorithm loves controversy.',
      format: 'Opinion/Hot Take',
      hooks: [
        'Stop waiting for motivation - it\'s a trap',
        'Unpopular opinion: motivation is overrated',
        'Here\'s what actually works (and it\'s not what you think)'
      ],
      thumbnailUrl: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400',
      postUrl: 'https://tiktok.com/@honesttakes/video/example4',
      brandName: 'RealTalk Fitness',
      industry: 'Fitness Coaching',
      engagementScore: 88,
      likes: 512000,
      comments: 28900,
      shares: 12100,
      views: 2800000,
      engagementRate: 0.20,
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString()
    },
    {
      id: 'c10',
      platform: 'instagram',
      title: 'Day in the Life: Busy Professional\'s Routine',
      description: 'Follow along day showing how real person fits fitness into packed schedule. Shows supplement timing, quick workouts, meal prep. Extremely relatable for target audience.',
      format: 'Lifestyle/DITL',
      hooks: [
        'How I stay fit with a 60-hour work week',
        'You don\'t need hours - you need a system',
        'Fit life as a busy professional (realistic edition)'
      ],
      thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
      postUrl: 'https://instagram.com/reel/busy-life-fitness',
      brandName: 'BusyFit',
      industry: 'Health & Wellness',
      engagementScore: 90,
      likes: 189000,
      comments: 7600,
      shares: 9400,
      views: 820000,
      engagementRate: 0.25,
      createdAt: new Date(Date.now() - 16 * 86400000).toISOString()
    }
  ];

  // Fetch all creative concepts - use mock data if empty
  const { data: concepts = [], isLoading } = useQuery<CreativeConcept[]>({
    queryKey: ['/api/concepts'],
  });

  const conceptsData = (concepts as CreativeConcept[]).length > 0 ? concepts : mockConcepts;

  // Search for competitor/brand content
  const searchMutation = useMutation({
    mutationFn: async (params: { query: string; type: string }) => {
      const response = await apiRequest('POST', '/api/concepts/search', params);
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/concepts'] });
      toast({
        title: "Search Complete",
        description: `Found ${data.count || 0} viral creatives`,
      });
    },
    onError: () => {
      toast({
        title: "Search Failed",
        description: "Unable to fetch creative concepts. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a brand name, URL, or page name to search.",
        variant: "destructive",
      });
      return;
    }

    searchMutation.mutate({
      query: searchQuery,
      type: searchType
    });
  };

  // Filter and sort concepts
  const filteredConcepts = conceptsData
    .filter((concept) => {
      if (filters.platform !== "all" && concept.platform !== filters.platform) return false;
      
      if (filters.engagement !== "all") {
        const rate = Number(concept.engagementRate) || 0;
        if (filters.engagement === "high" && rate <= 10) return false;
        if (filters.engagement === "medium" && (rate <= 5 || rate > 10)) return false;
        if (filters.engagement === "low" && rate > 5) return false;
      }
      
      if (filters.format !== "all" && concept.format !== filters.format) return false;
      
      return true;
    })
    .sort((a, b) => {
      if (filters.sortBy === "engagement") {
        return (b.engagementScore || 0) - (a.engagementScore || 0);
      }
      if (filters.sortBy === "likes") {
        return (b.likes || 0) - (a.likes || 0);
      }
      if (filters.sortBy === "recent") {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      return 0;
    });

  const toggleSave = (conceptId: string) => {
    const newSaved = new Set(savedConcepts);
    if (newSaved.has(conceptId)) {
      newSaved.delete(conceptId);
    } else {
      newSaved.add(conceptId);
    }
    setSavedConcepts(newSaved);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return '📘';
      case 'instagram': return '📸';
      case 'tiktok': return '🎵';
      default: return '🌐';
    }
  };

  const formatNumber = (num: number = 0) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };


  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" data-testid="heading-creative-research">Creative Research Center</h1>
            <p className="text-sm text-muted-foreground">Discover and explore viral ads and organic posts</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="curated" data-testid="tab-curated-creatives">
            <Sparkles className="h-4 w-4 mr-2" />
            Curated Creatives ({filteredConcepts.length})
          </TabsTrigger>
          <TabsTrigger value="explore" data-testid="tab-explore-creatives">
            <Search className="h-4 w-4 mr-2" />
            Explore Creatives
          </TabsTrigger>
        </TabsList>

        {/* Curated Creatives Tab */}
        <TabsContent value="curated" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Discovered Viral Content</CardTitle>
              <p className="text-sm text-muted-foreground">
                High-performing ads curated by AI
              </p>
            </CardHeader>
            <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-48 w-full mb-3" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredConcepts.length === 0 ? (
            <div className="py-12 text-center" data-testid="empty-concepts">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Curated Creatives Yet</h3>
              <p className="text-sm text-muted-foreground">
                {concepts.length === 0 
                  ? "Use the exploration section below to search for competitor creatives."
                  : "No creatives match the current filters. Try adjusting your filter criteria."
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredConcepts.map((concept) => (
                <Card 
                  key={concept.id}
                  className="hover-elevate overflow-hidden"
                  data-testid={`card-concept-${concept.id}`}
                >
                  {/* Thumbnail */}
                  {concept.thumbnailUrl && (
                    <div className="relative aspect-video bg-muted">
                      <img 
                        src={concept.thumbnailUrl} 
                        alt={concept.title}
                        className="w-full h-full object-cover"
                      />
                      {concept.videoUrl && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Play className="h-12 w-12 text-white" />
                        </div>
                      )}
                    </div>
                  )}

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-lg">{getPlatformIcon(concept.platform)}</span>
                          <Badge variant="outline" className="text-xs">
                            {concept.format}
                          </Badge>
                          {(Number(concept.engagementRate) || 0) >= 10 && (
                            <Badge className="text-xs bg-green-500/10 text-green-700 border-green-300">
                              Viral
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-base line-clamp-2">{concept.title}</CardTitle>
                        {concept.brandName && (
                          <p className="text-xs text-muted-foreground mt-1">by {concept.brandName}</p>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleSave(concept.id)}
                        className={savedConcepts.has(concept.id) ? 'text-primary' : ''}
                        data-testid={`button-save-${concept.id}`}
                      >
                        <Bookmark className={`h-4 w-4 ${savedConcepts.has(concept.id) ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{concept.description}</p>

                    {/* Engagement Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {concept.likes !== undefined && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Heart className="h-3 w-3" />
                          <span>{formatNumber(concept.likes)}</span>
                        </div>
                      )}
                      {concept.comments !== undefined && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MessageCircle className="h-3 w-3" />
                          <span>{formatNumber(concept.comments)}</span>
                        </div>
                      )}
                      {concept.shares !== undefined && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Share2 className="h-3 w-3" />
                          <span>{formatNumber(concept.shares)}</span>
                        </div>
                      )}
                      {concept.views !== undefined && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          <span>{formatNumber(concept.views)}</span>
                        </div>
                      )}
                    </div>

                    {/* Engagement Rate */}
                    {concept.engagementRate !== undefined && concept.engagementRate !== null && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Engagement Rate</span>
                          <span className="font-medium">{Number(concept.engagementRate).toFixed(1)}%</span>
                        </div>
                      </div>
                    )}

                    {/* Creative Hooks */}
                    {concept.hooks && concept.hooks.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {concept.hooks.slice(0, 3).map((hook, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {hook}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            data-testid={`button-view-details-${concept.id}`}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{concept.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {concept.thumbnailUrl && (
                              <img 
                                src={concept.thumbnailUrl} 
                                alt={concept.title}
                                className="w-full rounded-lg"
                              />
                            )}
                            <div className="space-y-2">
                              <p className="text-sm">{concept.description}</p>
                              {concept.hooks && concept.hooks.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium mb-2">Creative Hooks</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {concept.hooks.map((hook, idx) => (
                                      <Badge key={idx} variant="outline">
                                        {hook}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {concept.postUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          data-testid={`button-view-original-${concept.id}`}
                        >
                          <a href={concept.postUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Explore Creatives Tab */}
        <TabsContent value="explore" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search & Explore</CardTitle>
              <p className="text-sm text-muted-foreground">
                Search and filter competitor ads with advanced criteria
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex flex-wrap gap-3">
            <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
              <SelectTrigger className="w-[150px]" data-testid="select-search-type">
                <SelectValue placeholder="Search type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brand">Brand Name</SelectItem>
                <SelectItem value="url">Page URL</SelectItem>
                <SelectItem value="page">Page Name</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder={
                searchType === 'url' ? "Enter Facebook/Instagram/TikTok URL..." :
                searchType === 'page' ? "Enter page name..." :
                "Enter brand name..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 min-w-[300px]"
              data-testid="input-search-query"
            />

            <Button
              onClick={handleSearch}
              disabled={searchMutation.isPending}
              data-testid="button-search"
            >
              {searchMutation.isPending ? (
                <>
                  <Search className="mr-2 h-4 w-4 animate-pulse" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Find Creatives
                </>
              )}
            </Button>
          </div>

              {/* Advanced Filters */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Advanced Filters
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters({ 
                      platform: 'all', engagement: 'all', format: 'all', sortBy: 'engagement',
                      siteType: 'all', gender: 'all', ages: 'all', dailyLikes: 'all', 
                      totalLikes: 'all', mediaType: 'all', createdBetween: 'all', 
                      seenBetween: 'all', networks: 'all', advertiser: '', technologies: 'all', 
                      countries: 'all', language: 'all', buttons: 'all'
                    })}
                    data-testid="button-clear-filters"
                  >
                    Clear all
                  </Button>
                </div>
                
                {/* First row of filters */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
                  <Select value={filters.siteType} onValueChange={(value) => setFilters({...filters, siteType: value})}>
                    <SelectTrigger data-testid="select-site-type">
                      <SelectValue placeholder="Site type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sites</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.gender} onValueChange={(value) => setFilters({...filters, gender: value})}>
                    <SelectTrigger data-testid="select-gender">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genders</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="unisex">Unisex</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.ages} onValueChange={(value) => setFilters({...filters, ages: value})}>
                    <SelectTrigger data-testid="select-ages">
                      <SelectValue placeholder="Ages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ages</SelectItem>
                      <SelectItem value="18-24">18-24</SelectItem>
                      <SelectItem value="25-34">25-34</SelectItem>
                      <SelectItem value="35-44">35-44</SelectItem>
                      <SelectItem value="45-54">45-54</SelectItem>
                      <SelectItem value="55+">55+</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.dailyLikes} onValueChange={(value) => setFilters({...filters, dailyLikes: value})}>
                    <SelectTrigger data-testid="select-daily-likes">
                      <SelectValue placeholder="Daily likes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="<100">&lt;100</SelectItem>
                      <SelectItem value="100-1k">100-1K</SelectItem>
                      <SelectItem value="1k-10k">1K-10K</SelectItem>
                      <SelectItem value=">10k">&gt;10K</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.totalLikes} onValueChange={(value) => setFilters({...filters, totalLikes: value})}>
                    <SelectTrigger data-testid="select-total-likes">
                      <SelectValue placeholder="Total likes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="<1k">&lt;1K</SelectItem>
                      <SelectItem value="1k-10k">1K-10K</SelectItem>
                      <SelectItem value="10k-100k">10K-100K</SelectItem>
                      <SelectItem value=">100k">&gt;100K</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Second row of filters */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
                  <Select value={filters.mediaType} onValueChange={(value) => setFilters({...filters, mediaType: value})}>
                    <SelectTrigger data-testid="select-media-type">
                      <SelectValue placeholder="Media type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Media</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="carousel">Carousel</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.createdBetween} onValueChange={(value) => setFilters({...filters, createdBetween: value})}>
                    <SelectTrigger data-testid="select-created-between">
                      <SelectValue placeholder="Created Between" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Time</SelectItem>
                      <SelectItem value="7days">Last 7 Days</SelectItem>
                      <SelectItem value="30days">Last 30 Days</SelectItem>
                      <SelectItem value="90days">Last 90 Days</SelectItem>
                      <SelectItem value="1year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.seenBetween} onValueChange={(value) => setFilters({...filters, seenBetween: value})}>
                    <SelectTrigger data-testid="select-seen-between">
                      <SelectValue placeholder="Seen Between" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Time</SelectItem>
                      <SelectItem value="7days">Last 7 Days</SelectItem>
                      <SelectItem value="30days">Last 30 Days</SelectItem>
                      <SelectItem value="90days">Last 90 Days</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.networks} onValueChange={(value) => setFilters({...filters, networks: value})}>
                    <SelectTrigger data-testid="select-networks">
                      <SelectValue placeholder="Networks" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Networks</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="messenger">Messenger</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Advertiser"
                    value={filters.advertiser}
                    onChange={(e) => setFilters({...filters, advertiser: e.target.value})}
                    data-testid="input-advertiser"
                  />
                </div>

                {/* Third row of filters */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  <Select value={filters.technologies} onValueChange={(value) => setFilters({...filters, technologies: value})}>
                    <SelectTrigger data-testid="select-technologies">
                      <SelectValue placeholder="Technologies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="shopify">Shopify</SelectItem>
                      <SelectItem value="wordpress">WordPress</SelectItem>
                      <SelectItem value="wix">Wix</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.countries} onValueChange={(value) => setFilters({...filters, countries: value})}>
                    <SelectTrigger data-testid="select-countries">
                      <SelectValue placeholder="Countries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.language} onValueChange={(value) => setFilters({...filters, language: value})}>
                    <SelectTrigger data-testid="select-language">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.buttons} onValueChange={(value) => setFilters({...filters, buttons: value})}>
                    <SelectTrigger data-testid="select-buttons">
                      <SelectValue placeholder="Buttons" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="shop-now">Shop Now</SelectItem>
                      <SelectItem value="learn-more">Learn More</SelectItem>
                      <SelectItem value="sign-up">Sign Up</SelectItem>
                      <SelectItem value="download">Download</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{filteredConcepts.length} result{filteredConcepts.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
