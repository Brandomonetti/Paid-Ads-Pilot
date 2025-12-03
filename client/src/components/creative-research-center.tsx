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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  Database,
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
import type { Concept } from "@shared/schema";

interface CreativeConcept {
  id: string;
  platform: string | null;
  title: string | null;
  description: string | null;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
  postUrl?: string | null;
  brandName?: string | null;
  // New filter fields
  age?: string | null;
  gender?: string | null;
  language?: string | null;
  region?: string | null;
  is_video?: boolean | null;
  is_ad?: boolean | null;
  is_active?: boolean | null;
  // Statistics
  hooks: string[];
  engagementScore: number | null;
  likes?: number | null;
  comments?: number | null;
  shares?: number | null;
  views?: number | null;
  engagementRate?: number | null;
  status?:
    | "pending"
    | "approved"
    | "rejected"
    | "discovered"
    | "tested"
    | "proven"
    | null;
  createdAt?: string | null;
  discoveredAt?: string | null;
}

export function CreativeResearchCenter() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("explore");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"url" | "brand" | "keyword">(
    "url",
  );
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<Concept[]>([]);
  const [savedConcepts, setSavedConcepts] = useState<Set<string>>(new Set());
  const [timeFilter, setTimeFilter] = useState("all");
  const [librarySearch, setLibrarySearch] = useState("");
  const [rejectedExploreIds, setRejectedExploreIds] = useState<Set<string>>(
    new Set(),
  );

  const [filters, setFilters] = useState({
    // New filter fields for Latest Discoveries and Creative Library
    platform: "all",
    language: "all",
    region: "all",
    gender: "all",
    age: "all",
    is_video: "all",
    is_ad: "all",
    is_active: "all",
    sortBy: "engagement",
    // Legacy filter fields for Explore Creatives tab (do not change)
    siteType: "all",
    ages: "all",
    dailyLikes: "all",
    mediaType: "all",
    createdBetween: "all",
    countries: "all",
    engagement: "all",
    format: "all",
  });

  // Fetch knowledge base data for discovery
  const { data: knowledgeBase } = useQuery({
    queryKey: ["/api/knowledge-base"],
  });

  // Discover new insights mutation
  const discoverMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/research/discover", {
        knowledgeBase,
      });
      return (await response.json()) as { success: boolean; message: string };
    },
    onSuccess: (data) => {
      toast({
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/concepts"] });
      setActiveTab("latest"); // Switch to Latest Discoveries tab
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to start research discovery";
      toast({
        title: "Discovery failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  // Approve concept mutation
  const approveConceptMutation = useMutation({
    mutationFn: async (conceptId: string) => {
      return await apiRequest(
        "PATCH",
        `/api/concepts/${conceptId}/approve`,
        {},
      );
    },
    onSuccess: () => {
      toast({
        title: "Creative approved!",
        description: "This creative has been added to your Creative Library.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/concepts"] });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to approve creative";
      toast({
        title: "Approval failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  // Reject concept mutation
  const rejectConceptMutation = useMutation({
    mutationFn: async (conceptId: string) => {
      return await apiRequest("PATCH", `/api/concepts/${conceptId}/reject`, {});
    },
    onSuccess: () => {
      toast({
        title: "Creative rejected",
        description: "This creative has been removed from Latest Discoveries.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/concepts"] });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to reject creative";
      toast({
        title: "Rejection failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  // Save explored concept to library (creates with approved status)
  const saveToLibraryMutation = useMutation({
    mutationFn: async (
      concept: Partial<Concept> | Omit<CreativeConcept, "id" | "status">,
    ) => {
      return await apiRequest("POST", "/api/concepts", {
        ...concept,
        status: "approved",
      });
    },
    onSuccess: () => {
      toast({
        title: "Saved to Library!",
        description: "This creative has been added to your Creative Library.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/concepts"] });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to save creative";
      toast({
        title: "Save failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  // Handle approve from explore - saves concept to library
  const handleApproveExplore = (
    conceptData: Partial<Concept> | Omit<CreativeConcept, "id" | "status">,
  ) => {
    saveToLibraryMutation.mutate(conceptData);
  };

  // Handle reject from explore - temporarily hides (session only)
  const handleRejectExplore = (conceptId: string) => {
    setRejectedExploreIds(
      (prev) => new Set(Array.from(prev).concat(conceptId)),
    );
    toast({
      title: "Hidden for this session",
      description: "This creative will reappear if you search again.",
    });
  };

  // Handle approve from latest discoveries - saves concept to library
  const handleApproveLatest = (
    conceptData: Omit<CreativeConcept, "id" | "status">,
  ) => {
    saveToLibraryMutation.mutate(conceptData);
  };

  // Handle reject from latest discoveries - calls API to update status
  const handleRejectLatest = (conceptId: string) => {
    rejectConceptMutation.mutate(conceptId);
  };

  // Filter out rejected search results
  const visibleSearchResults = searchResults.filter(
    (e) => !rejectedExploreIds.has(String(e.id)),
  );

  // Fetch all creative concepts
  const { data: concepts = [], isLoading } = useQuery<CreativeConcept[]>({
    queryKey: ["/api/concepts"],
  });

  // Use concepts from API directly
  const conceptsData = concepts as CreativeConcept[];

  // Search for competitor/brand content
  const searchMutation = useMutation({
    mutationFn: async (params: {
      query: string;
      type: string;
    }) => {
      const response = await apiRequest("POST", "/api/concepts/search", params);
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/concepts"] });

      // Store search results from webhook
      if (data.concepts && Array.isArray(data.concepts)) {
        setSearchResults(data.concepts);
      } else if (data.urlSearchResult) {
        setSearchResults([data.urlSearchResult]);
      } else {
        setSearchResults([]);
      }

      // Handle URL search result differently
      if (data.urlSearchResult) {
        toast({
          title: "Page Found!",
          description: data.message || "Website data retrieved successfully.",
        });
      } else {
        toast({
          title: "Search Complete",
          description: `Found ${data.count || 0} creatives`,
        });
      }
    },
    onError: () => {
      setSearchResults([]);
      toast({
        title: "Search Failed",
        description: "Unable to fetch creative concepts. Please try again.",
        variant: "destructive",
      });
    },
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

    setHasSearched(true);
    searchMutation.mutate({
      query: searchQuery,
      type: searchType,
    });
  };

  // Filter and sort concepts
  const filteredConcepts = conceptsData
    .filter((concept) => {
      if (filters.platform !== "all" && concept.platform !== filters.platform)
        return false;
      if (filters.language !== "all" && concept.language !== filters.language)
        return false;
      if (filters.region !== "all" && concept.region !== filters.region)
        return false;
      if (filters.gender !== "all" && concept.gender !== filters.gender)
        return false;
      if (filters.age !== "all" && concept.age !== filters.age)
        return false;
      if (filters.is_video !== "all") {
        const isVideo = filters.is_video === "true";
        if (concept.is_video !== isVideo) return false;
      }
      if (filters.is_ad !== "all") {
        const isAd = filters.is_ad === "true";
        if (concept.is_ad !== isAd) return false;
      }
      if (filters.is_active !== "all") {
        const isActive = filters.is_active === "true";
        if (concept.is_active !== isActive) return false;
      }
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
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      }
      return 0;
    });

  // Filter concepts by status (strict filtering - only explicit status values)
  const pendingConcepts = conceptsData.filter((c) => c.status === "pending");
  const approvedConcepts = conceptsData.filter((c) => c.status === "approved");

  // Filter pending concepts by time
  const getTimeFilteredConcepts = () => {
    const now = Date.now();
    return pendingConcepts.filter((c) => {
      if (timeFilter === "all") return true;
      const discoveredTime = new Date(
        c.discoveredAt || c.createdAt || 0,
      ).getTime();
      const hoursDiff = (now - discoveredTime) / (1000 * 60 * 60);

      if (timeFilter === "24h") return hoursDiff <= 24;
      if (timeFilter === "7d") return hoursDiff <= 168;
      if (timeFilter === "30d") return hoursDiff <= 720;
      if (timeFilter === "90d") return hoursDiff <= 2160;
      return true;
    });
  };

  // Filter approved concepts by search query
  const getLibraryFilteredConcepts = () => {
    return approvedConcepts
      .filter((c) => {
        if (!librarySearch) return true;
        const query = librarySearch.toLowerCase();
        return (
          c.title?.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query) ||
          c.brandName?.toLowerCase().includes(query) ||
          c.hooks?.some((hook) => hook.toLowerCase().includes(query))
        );
      })
      .filter((concept) => {
        if (filters.platform !== "all" && concept.platform !== filters.platform)
          return false;
        if (filters.language !== "all" && concept.language !== filters.language)
          return false;
        if (filters.region !== "all" && concept.region !== filters.region)
          return false;
        if (filters.gender !== "all" && concept.gender !== filters.gender)
          return false;
        if (filters.age !== "all" && concept.age !== filters.age)
          return false;
        if (filters.is_video !== "all") {
          const isVideo = filters.is_video === "true";
          if (concept.is_video !== isVideo) return false;
        }
        if (filters.is_ad !== "all") {
          const isAd = filters.is_ad === "true";
          if (concept.is_ad !== isAd) return false;
        }
        if (filters.is_active !== "all") {
          const isActive = filters.is_active === "true";
          if (concept.is_active !== isActive) return false;
        }
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
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        }
        return 0;
      });
  };

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
      case "facebook":
        return "📘";
      case "instagram":
        return "📸";
      case "tiktok":
        return "🎵";
      default:
        return "🌐";
    }
  };

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return "-";
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
            <h1
              className="text-2xl font-bold"
              data-testid="heading-creative-research"
            >
              Creative Research Center
            </h1>
            <p className="text-sm text-muted-foreground">
              Discover and explore viral ads and organic posts
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="explore" data-testid="tab-explore-creatives">
            <Search className="h-4 w-4 mr-2" />
            Explore Creatives
          </TabsTrigger>
          <TabsTrigger value="latest" data-testid="tab-latest-discoveries">
            <Clock className="h-4 w-4 mr-2" />
            Latest Discoveries ({pendingConcepts.length})
          </TabsTrigger>
          <TabsTrigger value="curated" data-testid="tab-creative-library">
            <Database className="h-4 w-4 mr-2" />
            Creative Library ({approvedConcepts.length})
          </TabsTrigger>
        </TabsList>

        {/* Latest Discoveries Tab */}
        <TabsContent value="latest" className="space-y-4">
          {/* Header Section with Time Filter and Discover Button */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Latest Discoveries
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Review and approve creatives to add them to your Creative
                    Library
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger
                      className="w-[150px]"
                      data-testid="select-time-filter"
                    >
                      <SelectValue placeholder="Time Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="24h">Last 24 Hours</SelectItem>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                      <SelectItem value="90d">Last 90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => discoverMutation.mutate()}
                    disabled={discoverMutation.isPending || !knowledgeBase}
                    size="default"
                    className="gap-2"
                    data-testid="button-discover-creatives"
                  >
                    <Play className="h-4 w-4" />
                    {discoverMutation.isPending ? "Discovering..." : "Discover"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {pendingConcepts.length === 0 ? (
                <div className="py-12 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">No Pending Discoveries</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click Discover to find new viral content.
                  </p>
                  <Button
                    onClick={() => discoverMutation.mutate()}
                    disabled={discoverMutation.isPending || !knowledgeBase}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {discoverMutation.isPending
                      ? "Discovering..."
                      : "Discover Creatives"}
                  </Button>
                </div>
              ) : (
                (() => {
                  const filteredPendingConcepts = getTimeFilteredConcepts();
                  return filteredPendingConcepts.length === 0 ? (
                    <div className="py-12 text-center">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="font-medium mb-2">
                        No Matching Discoveries
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        No discoveries match the selected time filter. Try
                        selecting a different time range.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredPendingConcepts.map((concept) => (
                        <Card
                          key={concept.id}
                          className="hover-elevate overflow-hidden"
                          data-testid={`card-latest-${concept.id}`}
                        >
                          {concept.thumbnailUrl && (
                            <div className="relative aspect-video bg-muted">
                              <img
                                src={concept.thumbnailUrl}
                                alt={concept.title || 'Creative concept'}
                                className="w-full h-full object-cover"
                              />
                              {concept.videoUrl && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                  <Play className="h-12 w-12 text-white" />
                                </div>
                              )}
                              <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                                New
                              </Badge>
                            </div>
                          )}

                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <span className="text-lg">
                                    {getPlatformIcon(concept.platform || '')}
                                  </span>
                                  {concept.is_video !== null && (
                                    <Badge variant="outline" className="text-xs">
                                      {concept.is_video ? 'Video' : 'Image'}
                                    </Badge>
                                  )}
                                  {concept.is_ad !== null && (
                                    <Badge variant={concept.is_ad ? "default" : "secondary"} className="text-xs">
                                      {concept.is_ad ? 'Ad' : 'Organic'}
                                    </Badge>
                                  )}
                                  <Badge className="text-xs bg-orange-500/10 text-orange-700 border-orange-300">
                                    {new Date(
                                      concept.createdAt || 0,
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </Badge>
                                </div>
                                <CardTitle className="text-base line-clamp-2">
                                  {concept.title || (concept.description ? concept.description.slice(0, 60) + (concept.description.length > 60 ? '...' : '') : 'Untitled')}
                                </CardTitle>
                                {concept.brandName && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    by {concept.brandName}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {concept.description}
                            </p>

                            {/* Engagement Metrics */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {concept.views && (
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3 text-muted-foreground" />
                                  <span>{formatNumber(concept.views)}</span>
                                </div>
                              )}
                              {concept.likes && (
                                <div className="flex items-center gap-1">
                                  <Heart className="h-3 w-3 text-muted-foreground" />
                                  <span>{formatNumber(concept.likes)}</span>
                                </div>
                              )}
                              {concept.engagementRate && (
                                <div className="flex items-center gap-1">
                                  <BarChart3 className="h-3 w-3 text-muted-foreground" />
                                  <span>
                                    {(
                                      Number(concept.engagementRate) * 100
                                    ).toFixed(1)}
                                    %
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Approval Actions */}
                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 gap-1 text-green-600 hover:bg-green-50 hover:text-green-700 border-green-200"
                                onClick={() =>
                                  approveConceptMutation.mutate(concept.id)
                                }
                                disabled={
                                  approveConceptMutation.isPending ||
                                  rejectConceptMutation.isPending
                                }
                                data-testid={`button-approve-concept-${concept.id}`}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 gap-1 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                                onClick={() =>
                                  rejectConceptMutation.mutate(concept.id)
                                }
                                disabled={
                                  approveConceptMutation.isPending ||
                                  rejectConceptMutation.isPending
                                }
                                data-testid={`button-reject-concept-${concept.id}`}
                              >
                                <XCircle className="h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  );
                })()
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Creative Library Tab */}
        <TabsContent value="curated" className="space-y-4">
          {/* Search and Filters for Library */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="h-4 w-4" />
                Creative Library
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Browse and search your approved viral creative concepts
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Search Bar */}
              <Input
                placeholder="Search approved creatives by title, description, brand, or hooks..."
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                className="w-full"
                data-testid="input-library-search"
              />

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <Select
                  value={filters.platform}
                  onValueChange={(value) =>
                    setFilters({ ...filters, platform: value })
                  }
                >
                  <SelectTrigger
                    className="w-[150px]"
                    data-testid="select-curated-platform"
                  >
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
                  value={filters.language}
                  onValueChange={(value) =>
                    setFilters({ ...filters, language: value })
                  }
                >
                  <SelectTrigger
                    className="w-[150px]"
                    data-testid="select-curated-language"
                  >
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="Chinese">Chinese</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.is_video}
                  onValueChange={(value) =>
                    setFilters({ ...filters, is_video: value })
                  }
                >
                  <SelectTrigger
                    className="w-[150px]"
                    data-testid="select-curated-is-video"
                  >
                    <SelectValue placeholder="Media Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Media</SelectItem>
                    <SelectItem value="true">Video</SelectItem>
                    <SelectItem value="false">Image/Other</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.is_ad}
                  onValueChange={(value) =>
                    setFilters({ ...filters, is_ad: value })
                  }
                >
                  <SelectTrigger
                    className="w-[150px]"
                    data-testid="select-curated-is-ad"
                  >
                    <SelectValue placeholder="Content Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Content</SelectItem>
                    <SelectItem value="true">Ads Only</SelectItem>
                    <SelectItem value="false">Organic Only</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.sortBy}
                  onValueChange={(value) =>
                    setFilters({ ...filters, sortBy: value })
                  }
                >
                  <SelectTrigger
                    className="w-[150px]"
                    data-testid="select-curated-sort"
                  >
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engagement">Engagement</SelectItem>
                    <SelectItem value="likes">Most Liked</SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setFilters({
                      ...filters,
                      platform: "all",
                      language: "all",
                      is_video: "all",
                      is_ad: "all",
                      sortBy: "engagement",
                    })
                  }
                  data-testid="button-clear-curated-filters"
                >
                  Clear Filters
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                Showing {getLibraryFilteredConcepts().length} of{" "}
                {approvedConcepts.length} approved creatives
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
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
              ) : getLibraryFilteredConcepts().length === 0 ? (
                <div className="py-12 text-center" data-testid="empty-library">
                  <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">
                    No Approved Creatives Yet
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {approvedConcepts.length === 0
                      ? pendingConcepts.length > 0
                        ? `You have ${pendingConcepts.length} creative${pendingConcepts.length !== 1 ? "s" : ""} in Latest Discoveries waiting for approval.`
                        : "Discover viral creatives and approve them to build your Creative Library."
                      : "No creatives match your search or filters. Try different search terms or adjust your filter criteria."}
                  </p>
                  {approvedConcepts.length === 0 &&
                    pendingConcepts.length > 0 && (
                      <Button onClick={() => setActiveTab("latest")}>
                        Review Pending Creatives
                      </Button>
                    )}
                  {approvedConcepts.length === 0 &&
                    pendingConcepts.length === 0 && (
                      <Button
                        onClick={() => {
                          setActiveTab("latest");
                          discoverMutation.mutate();
                        }}
                        disabled={discoverMutation.isPending || !knowledgeBase}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {discoverMutation.isPending
                          ? "Discovering..."
                          : "Discover Creatives"}
                      </Button>
                    )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getLibraryFilteredConcepts().map((concept) => (
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
                            alt={concept.title || 'Creative concept'}
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
                              <span className="text-lg">
                                {getPlatformIcon(concept.platform || '')}
                              </span>
                              {concept.is_video !== null && (
                                <Badge variant="outline" className="text-xs">
                                  {concept.is_video ? 'Video' : 'Image'}
                                </Badge>
                              )}
                              {concept.is_ad !== null && (
                                <Badge variant={concept.is_ad ? "default" : "secondary"} className="text-xs">
                                  {concept.is_ad ? 'Ad' : 'Organic'}
                                </Badge>
                              )}
                              {(Number(concept.engagementRate) || 0) >= 10 && (
                                <Badge className="text-xs bg-green-500/10 text-green-700 border-green-300">
                                  Viral
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-base line-clamp-2">
                              {concept.title || (concept.description ? concept.description.slice(0, 60) + (concept.description.length > 60 ? '...' : '') : 'Untitled')}
                            </CardTitle>
                            {concept.brandName && (
                              <p className="text-xs text-muted-foreground mt-1">
                                by {concept.brandName}
                              </p>
                            )}
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => toggleSave(concept.id)}
                            className={
                              savedConcepts.has(concept.id)
                                ? "text-primary"
                                : ""
                            }
                            data-testid={`button-save-${concept.id}`}
                          >
                            <Bookmark
                              className={`h-4 w-4 ${savedConcepts.has(concept.id) ? "fill-current" : ""}`}
                            />
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {concept.description}
                        </p>

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
                        {concept.engagementRate !== undefined &&
                          concept.engagementRate !== null && (
                            <div className="pt-2 border-t">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">
                                  Engagement Rate
                                </span>
                                <span className="font-medium">
                                  {Number(concept.engagementRate).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          )}

                        {/* Creative Hooks */}
                        {concept.hooks && concept.hooks.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {concept.hooks.slice(0, 3).map((hook, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs"
                              >
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
                                <DialogTitle>{concept.title || (concept.description ? concept.description.slice(0, 60) + (concept.description.length > 60 ? '...' : '') : 'Untitled')}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                {concept.thumbnailUrl && (
                                  <img
                                    src={concept.thumbnailUrl}
                                    alt={concept.title || 'Creative concept'}
                                    className="w-full rounded-lg"
                                  />
                                )}
                                <div className="space-y-2">
                                  <p className="text-sm">
                                    {concept.description}
                                  </p>
                                  {concept.hooks &&
                                    concept.hooks.length > 0 && (
                                      <div>
                                        <h4 className="text-sm font-medium mb-2">
                                          Creative Hooks
                                        </h4>
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
                              <a
                                href={concept.postUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
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
                <Select
                  value={searchType}
                  onValueChange={(value: any) => setSearchType(value)}
                >
                  <SelectTrigger
                    className="w-[150px]"
                    data-testid="select-search-type"
                  >
                    <SelectValue placeholder="Search type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="url">Page URL</SelectItem>
                    <SelectItem value="brand">Brand Name</SelectItem>
                    <SelectItem value="keyword">By Keyword</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder={
                    searchType === "url"
                      ? "Enter Facebook/Instagram/TikTok URL..."
                      : searchType === "keyword"
                        ? "Enter keywords..."
                        : "Enter brand name..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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

              {/* Advanced Filters - hidden for URL search since it returns single result */}
              {searchType !== "url" && (
                <div className="pt-4 border-t">
                  <div className="flex items-center mb-4">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Advanced Filters
                    </h3>
                  </div>

                  {/* Row 1: Site Type, Gender, Ages, Daily Likes, Media Type */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
                    <Select
                      value={filters.siteType}
                      onValueChange={(value) =>
                        setFilters({ ...filters, siteType: value })
                      }
                    >
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

                    <Select
                      value={filters.gender}
                      onValueChange={(value) =>
                        setFilters({ ...filters, gender: value })
                      }
                    >
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

                    <Select
                      value={filters.ages}
                      onValueChange={(value) =>
                        setFilters({ ...filters, ages: value })
                      }
                    >
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

                    <Select
                      value={filters.dailyLikes}
                      onValueChange={(value) =>
                        setFilters({ ...filters, dailyLikes: value })
                      }
                    >
                      <SelectTrigger data-testid="select-daily-likes">
                        <SelectValue placeholder="Daily likes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Likes</SelectItem>
                        <SelectItem value="<100">&lt;100</SelectItem>
                        <SelectItem value="100-1k">100-1K</SelectItem>
                        <SelectItem value="1k-10k">1K-10K</SelectItem>
                        <SelectItem value=">10k">&gt;10K</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filters.mediaType}
                      onValueChange={(value) =>
                        setFilters({ ...filters, mediaType: value })
                      }
                    >
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
                  </div>

                  {/* Row 2: Created Between, Countries, Language, Results */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    <Select
                      value={filters.createdBetween}
                      onValueChange={(value) =>
                        setFilters({ ...filters, createdBetween: value })
                      }
                    >
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

                    <Select
                      value={filters.countries}
                      onValueChange={(value) =>
                        setFilters({ ...filters, countries: value })
                      }
                    >
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

                    <Select
                      value={filters.language}
                      onValueChange={(value) =>
                        setFilters({ ...filters, language: value })
                      }
                    >
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

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setFilters({
                          // New filter fields
                          platform: "all",
                          language: "all",
                          region: "all",
                          gender: "all",
                          age: "all",
                          is_video: "all",
                          is_ad: "all",
                          is_active: "all",
                          sortBy: "engagement",
                          // Legacy filter fields
                          siteType: "all",
                          ages: "all",
                          dailyLikes: "all",
                          mediaType: "all",
                          createdBetween: "all",
                          countries: "all",
                          engagement: "all",
                          format: "all",
                        })
                      }
                      data-testid="button-clear-filters"
                    >
                      Clear all
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Search Results with Approve/Reject */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Results
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {!hasSearched
                  ? "Use the search above to discover competitor creatives"
                  : visibleSearchResults.length > 0
                    ? `Showing ${visibleSearchResults.length} results - approve to save to your Creative Library`
                    : "All results hidden. Search again to see more creatives."}
              </p>
            </CardHeader>
            <CardContent>
              {!hasSearched ? (
                <div className="py-12 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">Start Your Search</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter a URL, brand name, or keyword above to discover
                    competitor creatives.
                  </p>
                </div>
              ) : searchMutation.isPending ? (
                <div className="py-12 text-center">
                  <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Searching...</h3>
                  <p className="text-sm text-muted-foreground">
                    Finding creatives for you.
                  </p>
                </div>
              ) : visibleSearchResults.length === 0 ? (
                <div className="py-12 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">No Results Found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try a different search term or URL to discover creatives.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleSearchResults.map((result) => {
                    const stats =
                      (result.statistics as {
                        views?: number;
                        likes?: number;
                        replies?: number;
                        shares?: number;
                      }) || {};
                    const filterData = (result.filters as { platform?: string }) || {};
                    const platform =
                      filterData.platform?.toLowerCase() || "website";
                    return (
                      <Card
                        key={result.id}
                        className="hover-elevate overflow-hidden"
                        data-testid={`card-${result.id}`}
                      >
                        <div
                          className="relative aspect-video bg-muted cursor-pointer group"
                          onClick={() =>
                            result.url && window.open(result.url, "_blank")
                          }
                          data-testid={`thumbnail-${result.id}`}
                        >
                          {result.thumbnail ? (
                            <img
                              src={result.thumbnail}
                              alt={result.title || "Creative"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Search className="h-12 w-12 text-muted-foreground opacity-30" />
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center transition-all duration-200 group-hover:backdrop-blur-sm group-hover:bg-black/30">
                            <div className="bg-black/60 rounded-full p-3 transition-all duration-200 group-hover:bg-white/90 group-hover:scale-110">
                              <ExternalLink className="h-8 w-8 text-white transition-colors duration-200 group-hover:text-black" />
                            </div>
                          </div>
                          <Badge
                            className={`no-default-hover-elevate absolute -bottom-3 right-1 z-20 ${
                              platform === "facebook"
                                ? "bg-blue-600 border-blue-700"
                                : platform === "instagram"
                                  ? "bg-pink-600 border-pink-700"
                                  : platform === "tiktok"
                                    ? "bg-black border-gray-700"
                                    : "bg-gray-700 border-gray-800"
                            } text-white border`}
                          >
                            {platform.charAt(0).toUpperCase() +
                              platform.slice(1)}
                          </Badge>
                        </div>
                        <CardHeader className="pb-3 pt-5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                {(stats as { isActive?: boolean | null })
                                  .isActive === true && (
                                  <Badge className="text-xs bg-green-500 text-white border border-green-600">
                                    Active
                                  </Badge>
                                )}
                              </div>
                              {result.title && (
                                <CardTitle className="text-base line-clamp-2">
                                  {result.title}
                                </CardTitle>
                              )}
                              {result.owner && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  by {result.owner}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {result.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {result.description}
                            </p>
                          )}
                          {(stats.views ||
                            stats.likes ||
                            stats.replies ||
                            stats.shares) && (
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {stats.views != null && stats.views > 0 && (
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3 text-muted-foreground" />
                                  <span>{formatNumber(stats.views)}</span>
                                </div>
                              )}
                              {stats.likes != null && stats.likes > 0 && (
                                <div className="flex items-center gap-1">
                                  <Heart className="h-3 w-3 text-muted-foreground" />
                                  <span>{formatNumber(stats.likes)}</span>
                                </div>
                              )}
                              {stats.replies != null && stats.replies > 0 && (
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="h-3 w-3 text-muted-foreground" />
                                  <span>{formatNumber(stats.replies)}</span>
                                </div>
                              )}
                              {stats.shares != null && stats.shares > 0 && (
                                <div className="flex items-center gap-1">
                                  <Share2 className="h-3 w-3 text-muted-foreground" />
                                  <span>{formatNumber(stats.shares)}</span>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="pt-2 border-t">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                Created
                              </span>
                              <span className="font-medium">
                                {(() => {
                                  const originalDate = (
                                    stats as {
                                      originalCreatedAt?: string | null;
                                    }
                                  ).originalCreatedAt;
                                  if (originalDate) {
                                    return new Date(
                                      originalDate,
                                    ).toLocaleDateString();
                                  }
                                  return "--/--/----";
                                })()}
                              </span>
                            </div>
                          </div>

                          {/* Approve/Reject Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 gap-1 text-green-600 hover:bg-green-50 hover:text-green-700 border-green-200"
                              onClick={() => {
                                handleApproveExplore({
                                  title: result.title || "",
                                  description: result.description || "",
                                  owner: result.owner || "",
                                  url: result.url || "",
                                  thumbnail: result.thumbnail || "",
                                  statistics: result.statistics || {},
                                  filters: result.filters || {},
                                });
                                handleRejectExplore(String(result.id));
                              }}
                              disabled={saveToLibraryMutation.isPending}
                              data-testid={`button-approve-${result.id}`}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 gap-1 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                              onClick={() =>
                                handleRejectExplore(String(result.id))
                              }
                              data-testid={`button-reject-${result.id}`}
                            >
                              <XCircle className="h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
