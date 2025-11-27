import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Brain, 
  Search, 
  ExternalLink, 
  TrendingUp,
  Heart,
  X,
  Zap,
  Database,
  Play,
  Calendar,
  Filter,
  Users,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

// Psychological category icons and colors
const categoryConfig: Record<string, { icon: any; label: string; color: string; bg: string; border: string }> = {
  'Pain Points': { icon: X, label: 'Pain Points', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' },
  'Desires': { icon: Heart, label: 'Desires', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800' },
  'Objections': { icon: TrendingUp, label: 'Objections', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800' },
  'Triggers': { icon: Zap, label: 'Triggers', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800' },
};

// Platform configuration with distinct background colors
const platformConfig: Record<string, { bg: string }> = {
  'reddit': { bg: 'bg-orange-500' },
  'amazon': { bg: 'bg-yellow-500' },
  'youtube': { bg: 'bg-red-600' },
  'facebook': { bg: 'bg-blue-600' },
  'instagram': { bg: 'bg-fuchsia-500' },
  'tiktok': { bg: 'bg-emerald-500' },
};

export default function CustomerIntelligenceHub() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('latest');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState('all');
  
  // Library specific filters
  const [libraryCategory, setLibraryCategory] = useState('all');
  const [libraryPlatform, setLibraryPlatform] = useState('all');
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryDateRange, setLibraryDateRange] = useState('all');
  const [libraryViewMode, setLibraryViewMode] = useState<'grid' | 'list'>('grid');
  

  const mockSources = [
    {
      id: 's1',
      platform: 'reddit',
      sourceType: 'Subreddit',
      title: 'r/Fitness - Daily Discussion Threads',
      description: 'Active community discussing workout routines, nutrition, and recovery strategies',
      url: 'https://reddit.com/r/fitness',
      insightsDiscovered: 847,
      lastChecked: new Date().toISOString()
    },
    {
      id: 's2',
      platform: 'amazon',
      sourceType: 'Product Reviews',
      title: 'Top Protein Powder Reviews',
      description: 'Customer feedback on leading protein supplement products',
      url: 'https://amazon.com/protein-powder-reviews',
      insightsDiscovered: 1243,
      lastChecked: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 's3',
      platform: 'youtube',
      sourceType: 'Video Comments',
      title: 'Fitness Transformation Videos',
      description: 'Comments on popular fitness journey and transformation content',
      url: 'https://youtube.com/fitness-transformations',
      insightsDiscovered: 562,
      lastChecked: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 's4',
      platform: 'tiktok',
      sourceType: 'Hashtag Analysis',
      title: '#FitnessMotivation & #GymTok',
      description: 'Trending fitness content and community conversations',
      url: 'https://tiktok.com/tag/fitnessmotivation',
      insightsDiscovered: 923,
      lastChecked: new Date().toISOString()
    }
  ];

  // Fetch avatars from API (used for first tab - Latest Discoveries)
  const { data: avatars = [], isLoading: isLoadingAvatars } = useQuery<any[]>({
    queryKey: ['/api/avatars'],
  });

  // Fetch sources from API - build query string for proper URL
  const sourcesQueryString = selectedPlatform !== 'all' ? `platform=${selectedPlatform}` : '';
  const sourcesUrl = sourcesQueryString ? `/api/sources?${sourcesQueryString}` : '/api/sources';
  
  const { data: sources = [], isLoading: isLoadingSources } = useQuery({
    queryKey: [sourcesUrl],
  });
  
  const sourcesData = (sources as any[]).length > 0 ? (sources as any[]) : mockSources;

  // Use avatars data directly (no mock fallback)
  const avatarsData = avatars as any[];

  // Generate avatars mutation
  const generateAvatarsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/avatars/generate', 'POST', {});
    },
    onSuccess: (data: any) => {
      toast({
        title: "Avatars generated!",
        description: `Created ${data.avatarsGenerated || 0} customer personas from your research insights.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/avatars'] });
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate customer avatars",
        variant: "destructive",
      });
    },
  });

  // Fetch knowledge base data for discovery
  const { data: knowledgeBase } = useQuery({
    queryKey: ['/api/knowledge-base']
  });

  // Discover new customer insights mutation
  const discoverMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/customer-research/discover', { knowledgeBase });
      return await response.json() as { success: boolean; message: string };
    },
    onSuccess: (data) => {
      toast({
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
      // Invalidate avatars query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/avatars'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to start customer research discovery";
      toast({
        title: "Discovery failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  // Approve avatar mutation
  const approveAvatarMutation = useMutation({
    mutationFn: async (avatarId: string) => {
      return await apiRequest('PATCH', `/api/avatars/${avatarId}/approve`, {});
    },
    onSuccess: () => {
      toast({
        title: "Insight approved!",
        description: "This insight has been added to your Research Library.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/avatars'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to approve",
        description: error.message || "Could not approve this insight",
        variant: "destructive",
      });
    },
  });

  // Reject avatar mutation
  const rejectAvatarMutation = useMutation({
    mutationFn: async (avatarId: string) => {
      return await apiRequest('PATCH', `/api/avatars/${avatarId}/reject`, {});
    },
    onSuccess: () => {
      toast({
        title: "Insight rejected",
        description: "This insight has been removed from Latest Discoveries.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/avatars'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to reject",
        description: error.message || "Could not reject this insight",
        variant: "destructive",
      });
    },
  });

  // Latest Discoveries: only show pending avatars
  const pendingAvatars = avatarsData.filter((avatar: any) => avatar.status === 'pending');
  
  // Apply search, category, platform and time filter to pending avatars
  const filteredAvatars = pendingAvatars.filter((avatar: any) => {
    // Category filter
    if (selectedCategory !== 'all' && avatar.category !== selectedCategory) {
      return false;
    }
    
    // Platform filter
    if (selectedPlatform !== 'all' && avatar.platform !== selectedPlatform) {
      return false;
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        avatar.title?.toLowerCase().includes(query) ||
        avatar.message?.toLowerCase().includes(query) ||
        avatar.summary?.toLowerCase().includes(query)
      );
      if (!matchesSearch) return false;
    }
    
    // Time filter (for Latest Discoveries)
    if (timeFilter !== 'all' && avatar.createdAt) {
      const createdTime = new Date(avatar.createdAt).getTime();
      const now = Date.now();
      const hourInMs = 3600000;
      
      switch (timeFilter) {
        case '1h':
          if (now - createdTime > hourInMs) return false;
          break;
        case '6h':
          if (now - createdTime > 6 * hourInMs) return false;
          break;
        case '24h':
          if (now - createdTime > 24 * hourInMs) return false;
          break;
        case '7d':
          if (now - createdTime > 7 * 24 * hourInMs) return false;
          break;
      }
    }
    
    return true;
  });
  
  // Research Library: only show approved avatars
  const approvedAvatars = avatarsData.filter((avatar: any) => avatar.status === 'approved');

  // Helper function to filter by date range (used in Research Library)
  const filterByDateRange = (avatar: any, dateRange: string): boolean => {
    if (dateRange === 'all') return true;
    
    // Use createdAt as the "date added to library" timestamp
    const addedDate = avatar.createdAt ? new Date(avatar.createdAt) : null;
    if (!addedDate) return true;
    
    const now = new Date();
    const hourInMs = 3600000;
    const dayInMs = 24 * hourInMs;
    const timeDiff = now.getTime() - addedDate.getTime();
    
    switch (dateRange) {
      case '24h':
        return timeDiff <= dayInMs;
      case '7d':
        return timeDiff <= 7 * dayInMs;
      case '30d':
        return timeDiff <= 30 * dayInMs;
      case '90d':
        return timeDiff <= 90 * dayInMs;
      default:
        return true;
    }
  };

  // Calculate category counts for approved avatars (used in Research Library)
  const categoryCounts = {
    'Pain Points': approvedAvatars.filter((a: any) => a.category === 'Pain Points').length,
    'Desires': approvedAvatars.filter((a: any) => a.category === 'Desires').length,
    'Objections': approvedAvatars.filter((a: any) => a.category === 'Objections').length,
    'Triggers': approvedAvatars.filter((a: any) => a.category === 'Triggers').length,
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            Customer Intelligence Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered customer insights from across the web
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="latest" data-testid="tab-latest-discoveries">
            Latest Discoveries ({filteredAvatars.length})
          </TabsTrigger>
          <TabsTrigger value="library" data-testid="tab-research-library">
            Research Library ({approvedAvatars.length})
          </TabsTrigger>
          <TabsTrigger value="avatars" data-testid="tab-target-avatars">
            Target Avatars ({avatarsData.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Latest Discoveries */}
        <TabsContent value="latest" className="space-y-4">
          {/* Header */}
          <div className="border-l-4 border-primary pl-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Latest Discoveries
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Review and approve insights to add them to your Research Library
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-[140px]" data-testid="select-time-filter">
                    <SelectValue placeholder="Time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="1h">Last Hour</SelectItem>
                    <SelectItem value="6h">Last 6 Hours</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => discoverMutation.mutate()}
                  disabled={discoverMutation.isPending || !knowledgeBase}
                  size="lg"
                  className="gap-2"
                  data-testid="button-discover-customer-insights"
                >
                  <Play className="h-4 w-4" />
                  {discoverMutation.isPending ? "Discovering..." : "Discover"}
                </Button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoadingAvatars && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoadingAvatars && filteredAvatars.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Pending Discoveries</h3>
                <p className="text-muted-foreground mb-4">
                  Click "Discover" to find customer insights from across the web.
                </p>
                <Button onClick={() => discoverMutation.mutate()} disabled={discoverMutation.isPending || !knowledgeBase}>
                  <Play className="h-4 w-4 mr-2" />
                  {discoverMutation.isPending ? "Discovering..." : "Start Discovery"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Pending avatars grid */}
          {!isLoadingAvatars && filteredAvatars.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredAvatars.map((avatar: any) => {
                const categoryInfo = categoryConfig[avatar.category as keyof typeof categoryConfig];
                const CategoryIcon = categoryInfo?.icon || Brain;
                const isExpanded = expandedInsight === avatar.id;
                
                return (
                  <Card key={avatar.id} className="hover-elevate" data-testid={`card-avatar-${avatar.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge variant="outline" className={`${categoryInfo?.color} gap-1`}>
                              <CategoryIcon className="h-3 w-3" />
                              {categoryInfo?.label}
                            </Badge>
                            <Badge
                              className={`${platformConfig[avatar.platform?.toLowerCase()]?.bg || 'bg-slate-500'} text-white border-transparent`}
                            >
                              {avatar.platform}
                            </Badge>
                            {avatar.createdAt && (Date.now() - new Date(avatar.createdAt).getTime()) < 24 * 60 * 60 * 1000 && (
                              <Badge className="bg-green-500 text-white border-transparent">
                                New
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-base">{avatar.title}</CardTitle>
                        </div>
                      </div>
                      <CardDescription className="text-sm italic mt-2">
                        "{avatar.message}"
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {!isExpanded && (
                        <div className="space-y-3">
                          <div className="flex gap-4">
                            <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                              {avatar.summary}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setExpandedInsight(avatar.id)}
                              className="shrink-0"
                              data-testid={`button-expand-${avatar.id}`}
                              title="Read More"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {/* Approval Buttons */}
                          <div className="flex gap-2 pt-2 border-t">
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1 gap-2"
                              onClick={() => approveAvatarMutation.mutate(avatar.id)}
                              disabled={approveAvatarMutation.isPending}
                              data-testid={`button-approve-${avatar.id}`}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 gap-2"
                              onClick={() => rejectAvatarMutation.mutate(avatar.id)}
                              disabled={rejectAvatarMutation.isPending}
                              data-testid={`button-reject-${avatar.id}`}
                            >
                              <X className="h-3 w-3" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {isExpanded && (
                        <div className="space-y-4">
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm mb-2">Summary</h4>
                              <p className="text-sm text-muted-foreground">{avatar.summary}</p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              {avatar.url && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  asChild
                                  data-testid={`button-view-source-${avatar.id}`}
                                  title="View Original"
                                >
                                  <a href={avatar.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setExpandedInsight(null)}
                                data-testid={`button-collapse-${avatar.id}`}
                                title="Collapse"
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {avatar.observations && avatar.observations.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Key Observations</h4>
                              <ul className="space-y-1">
                                {avatar.observations.map((obs: string, idx: number) => (
                                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-primary">-</span>
                                    {obs}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {avatar.marketingAngles && avatar.marketingAngles.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Marketing Angles</h4>
                              <div className="space-y-1">
                                {avatar.marketingAngles.map((angle: string, idx: number) => (
                                  <div key={idx} className="text-sm bg-primary/5 p-2 rounded">
                                    {angle}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Approval Buttons */}
                          <div className="flex gap-2 pt-3 border-t">
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1 gap-2"
                              onClick={() => approveAvatarMutation.mutate(avatar.id)}
                              disabled={approveAvatarMutation.isPending}
                              data-testid={`button-approve-expanded-${avatar.id}`}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Approve & Add to Library
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 gap-2"
                              onClick={() => rejectAvatarMutation.mutate(avatar.id)}
                              disabled={rejectAvatarMutation.isPending}
                              data-testid={`button-reject-expanded-${avatar.id}`}
                            >
                              <X className="h-3 w-3" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Target Avatars */}
        <TabsContent value="avatars" className="space-y-4">
          {/* Header with Generate Button */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Customer Personas
                  </CardTitle>
                  <CardDescription className="mt-1">
                    AI-synthesized target avatars generated from your approved research insights
                  </CardDescription>
                </div>
                <Button
                  onClick={() => generateAvatarsMutation.mutate()}
                  disabled={generateAvatarsMutation.isPending || approvedAvatars.length === 0}
                  className="gap-2"
                  data-testid="button-generate-avatars"
                >
                  <Sparkles className="h-4 w-4" />
                  {generateAvatarsMutation.isPending ? "Generating..." : "Generate Avatars"}
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Loading State */}
          {isLoadingAvatars && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoadingAvatars && avatarsData.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No target avatars yet</h3>
                <p className="text-muted-foreground mb-4">
                  {approvedAvatars.length === 0 
                    ? "Approve customer insights from Latest Discoveries first, then generate target avatars based on your approved research."
                    : "Click 'Generate Avatars' to synthesize your approved research into actionable customer personas."}
                </p>
                {approvedAvatars.length === 0 && pendingAvatars.length === 0 && (
                  <Button onClick={() => discoverMutation.mutate()} disabled={discoverMutation.isPending || !knowledgeBase}>
                    <Play className="h-4 w-4 mr-2" />
                    {discoverMutation.isPending ? "Discovering..." : "Discover Insights First"}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Avatars Grid */}
          {!isLoadingAvatars && avatarsData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {avatarsData.map((avatar: any) => (
                <Card key={avatar.id} className="hover-elevate" data-testid={`card-avatar-${avatar.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="gap-1">
                            <Users className="h-3 w-3" />
                            {avatar.priority} priority
                          </Badge>
                          <Badge variant="secondary">
                            {avatar.confidence}% confidence
                          </Badge>
                          {avatar.status === 'approved' && (
                            <Badge className="bg-green-500 text-white gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Approved
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg">{avatar.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {avatar.ageRange} • {avatar.demographics}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Psychographics */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Profile</h4>
                      <p className="text-sm text-muted-foreground">{avatar.psychographics}</p>
                    </div>

                    {/* Pain Points */}
                    {avatar.painPoints && avatar.painPoints.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <X className="h-4 w-4 text-red-500" />
                          Pain Points
                        </h4>
                        <ul className="space-y-1">
                          {avatar.painPoints.slice(0, 3).map((point: string, idx: number) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-red-500">•</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Desires */}
                    {avatar.desires && avatar.desires.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Heart className="h-4 w-4 text-purple-500" />
                          Desires
                        </h4>
                        <ul className="space-y-1">
                          {avatar.desires.slice(0, 3).map((desire: string, idx: number) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-purple-500">•</span>
                              {desire}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Marketing Angles (Hooks) */}
                    {avatar.hooks && avatar.hooks.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-green-500" />
                          Angle Propositions
                        </h4>
                        <div className="space-y-1">
                          {avatar.hooks.slice(0, 3).map((hook: string, idx: number) => (
                            <div key={idx} className="text-sm bg-primary/5 p-2 rounded">
                              💡 {hook}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Research Library */}
        <TabsContent value="library" className="space-y-4">
          {/* Library Header with Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{approvedAvatars.length}</p>
                    <p className="text-xs text-muted-foreground">Approved Insights</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                    <X className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{categoryCounts['Pain Points']}</p>
                    <p className="text-xs text-muted-foreground">Pain Points</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                    <Heart className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{categoryCounts['Desires']}</p>
                    <p className="text-xs text-muted-foreground">Desires</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                    <Zap className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{categoryCounts['Triggers']}</p>
                    <p className="text-xs text-muted-foreground">Triggers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Library Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Research Library
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={libraryViewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLibraryViewMode('grid')}
                    data-testid="button-view-grid"
                  >
                    Grid
                  </Button>
                  <Button
                    variant={libraryViewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLibraryViewMode('list')}
                    data-testid="button-view-list"
                  >
                    List
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Bar */}
              <div className="flex flex-wrap gap-3">
                <Input
                  placeholder="Search all research..."
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  className="flex-1 min-w-[300px]"
                  data-testid="input-library-search"
                />
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap gap-3">
                <Select value={libraryCategory} onValueChange={setLibraryCategory}>
                  <SelectTrigger className="w-[180px]" data-testid="select-library-category">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Pain Points">Pain Points</SelectItem>
                    <SelectItem value="Desires">Desires</SelectItem>
                    <SelectItem value="Objections">Objections</SelectItem>
                    <SelectItem value="Triggers">Triggers</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={libraryPlatform} onValueChange={setLibraryPlatform}>
                  <SelectTrigger className="w-[180px]" data-testid="select-library-platform">
                    <SelectValue placeholder="Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="Reddit">Reddit</SelectItem>
                    <SelectItem value="Amazon">Amazon</SelectItem>
                    <SelectItem value="YouTube">YouTube</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={libraryDateRange} onValueChange={setLibraryDateRange}>
                  <SelectTrigger className="w-[180px]" data-testid="select-library-date">
                    <SelectValue placeholder="Date Added" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="24h">Added Today</SelectItem>
                    <SelectItem value="7d">Added This Week</SelectItem>
                    <SelectItem value="30d">Added This Month</SelectItem>
                    <SelectItem value="90d">Last 3 Months</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLibraryCategory('all');
                    setLibraryPlatform('all');
                    setLibrarySearch('');
                    setLibraryDateRange('all');
                  }}
                  data-testid="button-clear-library-filters"
                >
                  Clear Filters
                </Button>
              </div>

              {/* Results Count */}
              <div className="text-sm text-muted-foreground">
                Showing {approvedAvatars.filter((avatar: any) => {
                  if (libraryCategory !== 'all' && avatar.category !== libraryCategory) return false;
                  if (libraryPlatform !== 'all' && avatar.platform !== libraryPlatform) return false;
                  if (!filterByDateRange(avatar, libraryDateRange)) return false;
                  if (librarySearch) {
                    const query = librarySearch.toLowerCase();
                    return (
                      avatar.title?.toLowerCase().includes(query) ||
                      avatar.summary?.toLowerCase().includes(query) ||
                      avatar.message?.toLowerCase().includes(query)
                    );
                  }
                  return true;
                }).length} of {approvedAvatars.length} approved insights
              </div>
            </CardContent>
          </Card>

          {/* Library Content */}
          {libraryViewMode === 'grid' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {approvedAvatars
                .filter((avatar: any) => {
                  if (libraryCategory !== 'all' && avatar.category !== libraryCategory) return false;
                  if (libraryPlatform !== 'all' && avatar.platform !== libraryPlatform) return false;
                  if (!filterByDateRange(avatar, libraryDateRange)) return false;
                  if (librarySearch) {
                    const query = librarySearch.toLowerCase();
                    return (
                      avatar.title?.toLowerCase().includes(query) ||
                      avatar.summary?.toLowerCase().includes(query) ||
                      avatar.message?.toLowerCase().includes(query)
                    );
                  }
                  return true;
                })
                .map((avatar: any) => {
                  const categoryInfo = categoryConfig[avatar.category as keyof typeof categoryConfig];
                  const CategoryIcon = categoryInfo?.icon || Brain;
                  
                  return (
                    <Card key={avatar.id} className="hover-elevate" data-testid={`card-library-avatar-${avatar.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className={`${categoryInfo?.color} gap-1`}>
                                <CategoryIcon className="h-3 w-3" />
                                {categoryInfo?.label}
                              </Badge>
                              <Badge
                                className={`${platformConfig[avatar.platform?.toLowerCase()]?.bg || 'bg-slate-500'} text-white border-transparent`}
                              >
                                {avatar.platform}
                              </Badge>
                              {avatar.createdAt && (Date.now() - new Date(avatar.createdAt).getTime()) < 24 * 60 * 60 * 1000 && (
                                <Badge className="bg-green-500 text-white border-transparent">
                                  New
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-base">{avatar.title}</CardTitle>
                          </div>
                        </div>
                        <CardDescription className="text-sm italic mt-2">
                          "{avatar.message}"
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">{avatar.summary}</p>
                        </div>
                        
                        {avatar.observations && avatar.observations.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Key Observations</h4>
                            <ul className="space-y-1">
                              {avatar.observations.slice(0, 2).map((obs: string, idx: number) => (
                                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary">-</span>
                                  {obs}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {avatar.marketingAngles && avatar.marketingAngles.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Marketing Angles</h4>
                            <div className="space-y-1">
                              {avatar.marketingAngles.slice(0, 2).map((angle: string, idx: number) => (
                                <div key={idx} className="text-sm bg-primary/5 p-2 rounded">
                                  {angle}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {avatar.url && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="gap-2 w-full"
                            data-testid={`button-library-view-source-${avatar.id}`}
                          >
                            <a href={avatar.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                              View Original Source
                            </a>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}

          {libraryViewMode === 'list' && (
            <div className="space-y-3">
              {approvedAvatars
                .filter((avatar: any) => {
                  if (libraryCategory !== 'all' && avatar.category !== libraryCategory) return false;
                  if (libraryPlatform !== 'all' && avatar.platform !== libraryPlatform) return false;
                  if (!filterByDateRange(avatar, libraryDateRange)) return false;
                  if (librarySearch) {
                    const query = librarySearch.toLowerCase();
                    return (
                      avatar.title?.toLowerCase().includes(query) ||
                      avatar.summary?.toLowerCase().includes(query) ||
                      avatar.message?.toLowerCase().includes(query)
                    );
                  }
                  return true;
                })
                .map((avatar: any) => {
                  const categoryInfo = categoryConfig[avatar.category as keyof typeof categoryConfig];
                  const CategoryIcon = categoryInfo?.icon || Brain;
                  
                  return (
                    <Card key={avatar.id} className="hover-elevate" data-testid={`card-library-list-${avatar.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className={`${categoryInfo?.color} gap-1`}>
                                <CategoryIcon className="h-3 w-3" />
                                {categoryInfo?.label}
                              </Badge>
                              <Badge
                                className={`${platformConfig[avatar.platform?.toLowerCase()]?.bg || 'bg-slate-500'} text-white border-transparent`}
                              >
                                {avatar.platform}
                              </Badge>
                              {avatar.createdAt && (Date.now() - new Date(avatar.createdAt).getTime()) < 24 * 60 * 60 * 1000 && (
                                <Badge className="bg-green-500 text-white border-transparent">
                                  New
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-semibold mb-1">{avatar.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">{avatar.summary}</p>
                          </div>
                          {avatar.url && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="gap-2"
                              data-testid={`button-library-list-source-${avatar.id}`}
                            >
                              <a href={avatar.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3" />
                                View
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}

          {approvedAvatars.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Database className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Approved Research Yet</h3>
                <p className="text-muted-foreground mb-4">
                  {pendingAvatars.length > 0 
                    ? `You have ${pendingAvatars.length} pending insight${pendingAvatars.length !== 1 ? 's' : ''} in Latest Discoveries waiting for approval.`
                    : "Start discovering insights, then approve them to build your research library."}
                </p>
                {pendingAvatars.length === 0 && (
                  <Button onClick={() => {setActiveTab('latest'); discoverMutation.mutate();}} disabled={discoverMutation.isPending || !knowledgeBase}>
                    <Play className="h-4 w-4 mr-2" />
                    {discoverMutation.isPending ? "Discovering..." : "Discover Insights"}
                  </Button>
                )}
                {pendingAvatars.length > 0 && (
                  <Button onClick={() => setActiveTab('latest')}>
                    Review Pending Insights
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
