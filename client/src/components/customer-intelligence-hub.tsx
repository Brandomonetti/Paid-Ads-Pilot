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
  Sparkles
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

// Psychological category icons and colors
const categoryConfig = {
  'pain-point': { icon: X, label: 'Pain Points', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' },
  'desire': { icon: Heart, label: 'Desires', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800' },
  'objection': { icon: TrendingUp, label: 'Objections', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800' },
  'trigger': { icon: Zap, label: 'Triggers', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800' },
};

// Platform configuration
const platformConfig: Record<string, { color: string }> = {
  'reddit': { color: 'bg-orange-500' },
  'amazon': { color: 'bg-yellow-500' },
  'youtube': { color: 'bg-red-500' },
  'facebook': { color: 'bg-blue-500' },
  'instagram': { color: 'bg-pink-500' },
  'tiktok': { color: 'bg-black dark:bg-white' },
  'forum': { color: 'bg-gray-500' },
  'article': { color: 'bg-indigo-500' },
};

export default function CustomerIntelligenceHub() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('latest');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  // Fetch insights
  const { data: insights = [], isLoading: isLoadingInsights } = useQuery({
    queryKey: ['/api/insights', { category: selectedCategory, platform: selectedPlatform }],
  });

  // Fetch sources
  const { data: sources = [], isLoading: isLoadingSources } = useQuery({
    queryKey: ['/api/sources', { platform: selectedPlatform }],
  });
  
  const sourcesData = (sources as any[]) || [];

  // Fetch avatars
  const { data: avatars = [], isLoading: isLoadingAvatars } = useQuery({
    queryKey: ['/api/avatars'],
  });

  const avatarsData = (avatars as any[]) || [];

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

  // Discover new insights mutation
  const discoverMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/research/discover', 'POST', {});
    },
    onSuccess: () => {
      toast({
        title: "Discovery started!",
        description: "AI is now searching for customer insights across multiple platforms.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/insights'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sources'] });
    },
    onError: (error: any) => {
      toast({
        title: "Discovery failed",
        description: error.message || "Failed to start research discovery",
        variant: "destructive",
      });
    },
  });

  // Filter insights by search
  const insightsData = (insights as any[]) || [];
  const filteredInsights = insightsData.filter((insight: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      insight.title?.toLowerCase().includes(query) ||
      insight.rawQuote?.toLowerCase().includes(query) ||
      insight.summary?.toLowerCase().includes(query)
    );
  });

  // Calculate category counts
  const categoryCounts = {
    'pain-point': insightsData.filter((i: any) => i.category === 'pain-point').length,
    'desire': insightsData.filter((i: any) => i.category === 'desire').length,
    'objection': insightsData.filter((i: any) => i.category === 'objection').length,
    'trigger': insightsData.filter((i: any) => i.category === 'trigger').length,
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            Customer Intelligence Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered customer insights from across the web
          </p>
        </div>
        <Button
          onClick={() => discoverMutation.mutate()}
          disabled={discoverMutation.isPending}
          size="lg"
          className="gap-2"
          data-testid="button-discover-insights"
        >
          <Play className="h-4 w-4" />
          {discoverMutation.isPending ? "Discovering..." : "Discover New Insights"}
        </Button>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="latest" data-testid="tab-latest-discoveries">
            Latest Discoveries ({filteredInsights.length})
          </TabsTrigger>
          <TabsTrigger value="avatars" data-testid="tab-target-avatars">
            Target Avatars ({avatarsData.length})
          </TabsTrigger>
          <TabsTrigger value="library" data-testid="tab-research-library">
            Research Library
          </TabsTrigger>
          <TabsTrigger value="sources" data-testid="tab-source-tracker">
            Source Tracker ({sourcesData.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Latest Discoveries */}
        <TabsContent value="latest" className="space-y-4">
          {/* Filters */}
          <Card data-testid="card-filters">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                    data-testid="filter-category-all"
                  >
                    All ({insightsData.length})
                  </Button>
                  {Object.entries(categoryConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <Button
                        key={key}
                        variant={selectedCategory === key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(key)}
                        className="gap-2"
                        data-testid={`filter-category-${key}`}
                      >
                        <Icon className="h-3 w-3" />
                        {config.label} ({categoryCounts[key as keyof typeof categoryCounts]})
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Platform & Search Filters */}
              <div className="flex flex-wrap gap-3">
                <Input
                  placeholder="Search insights..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 min-w-[200px]"
                  data-testid="input-search-insights"
                />
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger className="w-[180px]" data-testid="select-platform">
                    <SelectValue placeholder="All Platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="reddit">Reddit</SelectItem>
                    <SelectItem value="amazon">Amazon</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="forum">Forums</SelectItem>
                    <SelectItem value="article">Articles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Insights Grid */}
          {isLoadingInsights && (
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

          {!isLoadingInsights && filteredInsights.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No insights discovered yet</h3>
                <p className="text-muted-foreground mb-4">
                  Click "Discover New Insights" to start finding valuable customer intelligence
                </p>
                <Button onClick={() => discoverMutation.mutate()} disabled={discoverMutation.isPending}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Discovery
                </Button>
              </CardContent>
            </Card>
          )}

          {!isLoadingInsights && filteredInsights.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredInsights.map((insight: any) => {
                const categoryInfo = categoryConfig[insight.category as keyof typeof categoryConfig];
                const CategoryIcon = categoryInfo?.icon || Brain;
                const isExpanded = expandedInsight === insight.id;
                
                return (
                  <Card key={insight.id} className="hover-elevate" data-testid={`card-insight-${insight.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={`${categoryInfo?.color} gap-1`}>
                              <CategoryIcon className="h-3 w-3" />
                              {categoryInfo?.label}
                            </Badge>
                            <Badge
                              className={`${platformConfig[insight.sourcePlatform]?.color || 'bg-gray-500'} text-white`}
                            >
                              {insight.sourcePlatform}
                            </Badge>
                          </div>
                          <CardTitle className="text-base">{insight.title}</CardTitle>
                        </div>
                      </div>
                      <CardDescription className="text-sm italic mt-2">
                        "{insight.rawQuote}"
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {!isExpanded && (
                        <div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {insight.summary}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedInsight(insight.id)}
                            className="p-0 h-auto mt-2"
                            data-testid={`button-expand-${insight.id}`}
                          >
                            Read More →
                          </Button>
                        </div>
                      )}
                      
                      {isExpanded && (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Summary</h4>
                            <p className="text-sm text-muted-foreground">{insight.summary}</p>
                          </div>
                          
                          {insight.observations && insight.observations.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Key Observations</h4>
                              <ul className="space-y-1">
                                {insight.observations.map((obs: string, idx: number) => (
                                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    {obs}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {insight.marketingAngles && insight.marketingAngles.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Marketing Angles</h4>
                              <div className="space-y-1">
                                {insight.marketingAngles.map((angle: string, idx: number) => (
                                  <div key={idx} className="text-sm bg-primary/5 p-2 rounded">
                                    💡 {angle}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="gap-2"
                              data-testid={`button-view-source-${insight.id}`}
                            >
                              <a href={insight.sourceUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3" />
                                View Original
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedInsight(null)}
                              data-testid={`button-collapse-${insight.id}`}
                            >
                              Collapse
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
                    AI-synthesized target avatars with pain points and angle propositions
                  </CardDescription>
                </div>
                <Button
                  onClick={() => generateAvatarsMutation.mutate()}
                  disabled={generateAvatarsMutation.isPending || insightsData.length === 0}
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
                  {insightsData.length === 0 
                    ? "Discover customer insights first, then generate target avatars to identify who to target and with what pain points."
                    : "Click 'Generate Avatars' to synthesize your research into actionable customer personas."}
                </p>
                {insightsData.length === 0 && (
                  <Button onClick={() => discoverMutation.mutate()} disabled={discoverMutation.isPending}>
                    <Play className="h-4 w-4 mr-2" />
                    Discover Insights First
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

                    {/* Approval Actions (for future functionality) */}
                    <div className="pt-2 flex gap-2">
                      <Button
                        variant={avatar.status === 'approved' ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1 gap-2"
                        data-testid={`button-approve-avatar-${avatar.id}`}
                        disabled
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {avatar.status === 'approved' ? 'Approved' : 'Approve for Scripts'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Research Library */}
        <TabsContent value="library" className="space-y-4">
          <Card>
            <CardContent className="p-12 text-center">
              <Database className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Research Library</h3>
              <p className="text-muted-foreground">
                Full searchable archive of all discovered insights coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Source Tracker */}
        <TabsContent value="sources" className="space-y-4">
          {isLoadingSources && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}

          {!isLoadingSources && sourcesData.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No sources discovered yet</h3>
                <p className="text-muted-foreground">
                  Sources will appear here as the AI discovers valuable platforms
                </p>
              </CardContent>
            </Card>
          )}

          {!isLoadingSources && sourcesData.length > 0 && (
            <div className="space-y-4">
              {sourcesData.map((source: any) => (
                <Card key={source.id} className="hover-elevate" data-testid={`card-source-${source.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${platformConfig[source.platform]?.color || 'bg-gray-500'} text-white`}>
                            {source.platform}
                          </Badge>
                          <Badge variant="outline">{source.sourceType}</Badge>
                          <Badge variant="secondary">{source.insightsDiscovered} insights</Badge>
                        </div>
                        <CardTitle className="text-base">{source.title}</CardTitle>
                        {source.description && (
                          <CardDescription className="mt-2">{source.description}</CardDescription>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Last checked: {new Date(source.lastChecked).toLocaleDateString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="gap-2"
                      data-testid={`button-view-source-url-${source.id}`}
                    >
                      <a href={source.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                        Visit Source
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
