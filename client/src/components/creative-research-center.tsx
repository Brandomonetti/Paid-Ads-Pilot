import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<'url' | 'brand' | 'page'>('brand');
  const [savedConcepts, setSavedConcepts] = useState<Set<string>>(new Set());
  
  const [filters, setFilters] = useState({
    platform: "all",
    engagement: "all",
    format: "all",
    sortBy: "engagement"
  });

  // Fetch all creative concepts
  const { data: concepts = [], isLoading } = useQuery<CreativeConcept[]>({
    queryKey: ['/api/concepts'],
  });

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
  const filteredConcepts = concepts
    .filter((concept) => {
      if (filters.platform !== "all" && concept.platform !== filters.platform) return false;
      
      if (filters.engagement !== "all") {
        const rate = concept.engagementRate || 0;
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

  // Calculate stats
  const stats = {
    total: concepts.length,
    facebook: concepts.filter(c => c.platform === 'facebook').length,
    instagram: concepts.filter(c => c.platform === 'instagram').length,
    tiktok: concepts.filter(c => c.platform === 'tiktok').length,
    avgEngagement: concepts.length > 0 
      ? Math.round(concepts.reduce((sum, c) => sum + (c.engagementRate || 0), 0) / concepts.length)
      : 0,
    saved: savedConcepts.size
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
            <p className="text-sm text-muted-foreground">Discover viral ads and organic posts from competitors</p>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-stat-total">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Creatives</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-creatives">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.facebook} FB • {stats.instagram} IG • {stats.tiktok} TT
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-engagement">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-engagement">{stats.avgEngagement}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.avgEngagement >= 10 ? 'Viral potential' : stats.avgEngagement >= 5 ? 'Good performance' : 'Average performance'}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-saved">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Concepts</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-saved-concepts">{stats.saved}</div>
            <p className="text-xs text-muted-foreground">
              For future reference
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-high-performers">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Performers</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-high-performers">
              {concepts.filter(c => (c.engagementRate || 0) >= 10).length}
            </div>
            <p className="text-xs text-muted-foreground">
              &gt;10% engagement rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Section */}
      <Card data-testid="card-search">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Competitor Creatives
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
          <p className="text-xs text-muted-foreground">
            Search for any competitor or brand to discover their viral ads and organic posts across platforms
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card data-testid="card-filters">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Sort
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Select 
            value={filters.platform} 
            onValueChange={(value) => setFilters({...filters, platform: value})}
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
            value={filters.engagement} 
            onValueChange={(value) => setFilters({...filters, engagement: value})}
          >
            <SelectTrigger className="w-[180px]" data-testid="select-engagement">
              <SelectValue placeholder="Engagement Rate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Engagement</SelectItem>
              <SelectItem value="high">High (&gt;10%)</SelectItem>
              <SelectItem value="medium">Medium (5-10%)</SelectItem>
              <SelectItem value="low">Low (&lt;5%)</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={filters.format} 
            onValueChange={(value) => setFilters({...filters, format: value})}
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
              <SelectItem value="Before/After">Before/After</SelectItem>
              <SelectItem value="Testimonial">Testimonial</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={filters.sortBy} 
            onValueChange={(value) => setFilters({...filters, sortBy: value})}
          >
            <SelectTrigger className="w-[150px]" data-testid="select-sort">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="engagement">Engagement</SelectItem>
              <SelectItem value="likes">Most Liked</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Creative Concepts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
        <Card className="p-12 text-center" data-testid="empty-concepts">
          <div className="flex flex-col items-center gap-4">
            <Sparkles className="h-16 w-16 text-muted-foreground" />
            <div>
              <h3 className="font-medium mb-2">No Creatives Found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {concepts.length === 0 
                  ? "Search for a competitor or brand above to discover their viral creatives."
                  : "No creatives match the current filters. Try adjusting your filter criteria."
                }
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {filteredConcepts.length} Creative{filteredConcepts.length !== 1 ? 's' : ''} Found
            </h2>
          </div>

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
                        {(concept.engagementRate || 0) >= 10 && (
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
                  {concept.engagementRate !== undefined && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Engagement Rate</span>
                        <span className="font-medium">{concept.engagementRate.toFixed(1)}%</span>
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
        </div>
      )}
    </div>
  );
}
