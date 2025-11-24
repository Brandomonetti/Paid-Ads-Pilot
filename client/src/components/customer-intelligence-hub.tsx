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
  const [timeFilter, setTimeFilter] = useState('all');
  
  // Library specific filters
  const [libraryCategory, setLibraryCategory] = useState('all');
  const [libraryPlatform, setLibraryPlatform] = useState('all');
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryDateRange, setLibraryDateRange] = useState('all');
  const [libraryViewMode, setLibraryViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data for development visualization
  const mockInsights = [
    {
      id: '1',
      category: 'pain-point',
      title: 'Post-workout muscle soreness preventing consistent training',
      rawQuote: 'I love working out but the next-day soreness is brutal. I can barely walk after leg day and it keeps me from going back to the gym.',
      summary: 'Customers experience severe delayed onset muscle soreness (DOMS) that creates a barrier to consistent workout routines, leading to missed gym sessions and fitness goal abandonment.',
      observations: [
        'DOMS severity peaks 24-48 hours post-workout',
        'Pain is worse after lower body exercises',
        'Creates fear of returning to gym',
        'Most acute in beginners and after breaks'
      ],
      marketingAngles: [
        'Recovery so fast, you\'ll wonder if you even worked out',
        'Say goodbye to leg-day dread',
        'Train harder, recover faster - no more missed gym days'
      ],
      sourcePlatform: 'reddit',
      sourceUrl: 'https://reddit.com/r/fitness/example',
      confidence: 92
    },
    {
      id: '2',
      category: 'desire',
      title: 'Want to feel confident and energized without relying on pre-workout',
      rawQuote: 'I wish I could just wake up with natural energy and not need caffeine or pre-workout to feel motivated. My body feels dependent and I crash hard.',
      summary: 'Customers desire sustained, natural energy throughout the day without stimulant dependency, crashes, or the jittery side effects of traditional pre-workout supplements.',
      observations: [
        'Caffeine tolerance builds quickly',
        'Afternoon energy crashes are common',
        'Desire for sustainable energy solutions',
        'Concern about stimulant dependency'
      ],
      marketingAngles: [
        'All-day energy without the crash or jitters',
        'Natural energy that lasts - no caffeine needed',
        'Feel energized from sunrise to sunset, naturally'
      ],
      sourcePlatform: 'youtube',
      sourceUrl: 'https://youtube.com/watch?v=example',
      confidence: 88
    },
    {
      id: '3',
      category: 'objection',
      title: 'Skeptical of supplement quality and ingredient transparency',
      rawQuote: 'How do I know what\'s actually in these supplements? The industry is so unregulated. I don\'t trust brands that hide behind proprietary blends.',
      summary: 'Customers express deep skepticism about supplement ingredient quality, manufacturing practices, and transparency, especially regarding proprietary blends and third-party testing.',
      observations: [
        'Lack of trust in supplement industry',
        'Demand for third-party testing certificates',
        'Proprietary blends seen as hiding poor ingredients',
        'Want to see exact ingredient doses'
      ],
      marketingAngles: [
        'Every ingredient listed. Every dose shown. No secrets.',
        'Third-party tested for purity and potency - see the proof',
        'Transparent ingredients you can pronounce and trust'
      ],
      sourcePlatform: 'amazon',
      sourceUrl: 'https://amazon.com/product/reviews/example',
      confidence: 95
    },
    {
      id: '4',
      category: 'trigger',
      title: 'Friends\' visible fitness transformations create urgency to start',
      rawQuote: 'Seeing my friend\'s before/after pics made me realize I need to get serious. If she can do it with her busy schedule, I have no excuse.',
      summary: 'Social proof from peers\' successful transformations triggers immediate motivation and removes mental barriers, creating a "if they can, I can" mindset shift.',
      observations: [
        'Peer transformations more motivating than celebrity endorsements',
        'Visual proof creates belief in possibility',
        'Busy schedule relatability is key',
        'Creates sense of urgency to start now'
      ],
      marketingAngles: [
        'Join 50,000+ people transforming their bodies this month',
        'Real people. Real results. Your turn.',
        'See what happens when you commit for just 30 days'
      ],
      sourcePlatform: 'instagram',
      sourceUrl: 'https://instagram.com/p/example',
      confidence: 90
    },
    {
      id: '5',
      category: 'pain-point',
      title: 'Difficulty tracking progress and staying accountable alone',
      rawQuote: 'I start strong but lose motivation after 2 weeks. I need someone to hold me accountable but personal trainers are too expensive.',
      summary: 'Customers struggle with self-accountability and motivation sustainability, leading to program abandonment. They need external accountability structures but cost is prohibitive.',
      observations: [
        'Motivation peaks in week 1-2 then drops',
        'Lack of progress tracking leads to discouragement',
        'Community accountability more sustainable than solo efforts',
        'Cost barrier prevents hiring personal trainers'
      ],
      marketingAngles: [
        'Your personal accountability partner - at a fraction of the cost',
        'Track every win. Celebrate every milestone. Stay motivated.',
        'Join a community that won\'t let you quit on yourself'
      ],
      sourcePlatform: 'tiktok',
      sourceUrl: 'https://tiktok.com/@user/video/example',
      confidence: 87
    },
    {
      id: '6',
      category: 'desire',
      title: 'Want to look toned and fit without spending hours at the gym',
      rawQuote: 'I don\'t have 2 hours a day for the gym. I just want to look good in a bikini with like 30 min workouts max. Is that even possible?',
      summary: 'Time-constrained customers desire efficient workouts that deliver visible aesthetic results without lengthy gym sessions, prioritizing appearance over performance.',
      observations: [
        'Time scarcity is primary barrier',
        'Aesthetic goals over strength/performance',
        '30-45 minutes is ideal workout duration',
        'Convenience and efficiency highly valued'
      ],
      marketingAngles: [
        'Get toned in just 30 minutes a day',
        'Efficient workouts for busy people who want results',
        'Look great, feel confident - no 2-hour gym sessions required'
      ],
      sourcePlatform: 'facebook',
      sourceUrl: 'https://facebook.com/groups/fitness/posts/example',
      confidence: 91
    }
  ];

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

  const mockAvatars = [
    {
      id: 'a1',
      name: 'Time-Crunched Taylor',
      ageRange: '28-35',
      demographics: 'Working professional, Urban, Mid-income',
      psychographics: 'Highly motivated but time-poor. Values efficiency and results over process. Struggles with consistency due to demanding career. Wants to look good and feel confident without fitness consuming their life.',
      painPoints: [
        'Only has 30-45 minutes max for workouts',
        'Inconsistent schedule makes routine difficult',
        'Previous programs required too much time commitment',
        'Feels guilty about not prioritizing fitness more'
      ],
      desires: [
        'Visible results from short, efficient workouts',
        'Flexibility to workout at home or gym',
        'Simple nutrition plan that fits busy lifestyle',
        'Look toned and feel energized for work'
      ],
      hooks: [
        'Get fit in less time than your commute - 30 min max',
        'Designed for people who are too busy to waste time',
        'Results-driven workouts for your packed schedule',
        'Efficiency meets effectiveness - no fluff, just results'
      ],
      priority: 'high',
      confidence: 94,
      status: 'approved'
    },
    {
      id: 'a2',
      name: 'Recovery-Focused Rachel',
      ageRange: '25-40',
      demographics: 'Fitness enthusiast, Suburban/Urban, Middle-class',
      psychographics: 'Loves working out but constantly battling soreness and fatigue. Knows recovery is important but doesn\'t know how to optimize it. Willing to invest in quality recovery products. Wants to train harder without burning out.',
      painPoints: [
        'Severe muscle soreness prevents consistent training',
        'Energy crashes after intense workouts',
        'Takes too long to recover between sessions',
        'Feels guilty taking rest days but body demands it'
      ],
      desires: [
        'Faster recovery to train more frequently',
        'Natural energy without stimulant dependency',
        'Reduced inflammation and muscle soreness',
        'Sustainable training schedule year-round'
      ],
      hooks: [
        'Train harder, recover faster - never miss a workout',
        'Say goodbye to 3-day DOMS and hello to daily training',
        'Natural recovery support your body will thank you for',
        'Bounce back in 24 hours, not 72'
      ],
      priority: 'high',
      confidence: 92,
      status: 'pending'
    },
    {
      id: 'a3',
      name: 'Skeptical Steve',
      ageRange: '30-45',
      demographics: 'Educated professional, Research-oriented, Higher income',
      psychographics: 'Highly skeptical of supplement industry claims. Demands scientific evidence and transparency. Won\'t buy based on marketing hype alone. Values third-party testing and clean ingredients. Willing to pay premium for quality.',
      painPoints: [
        'Can\'t trust most supplement brands\' claims',
        'Proprietary blends hide poor quality ingredients',
        'No way to verify purity and potency',
        'Wasted money on ineffective products before'
      ],
      desires: [
        'Complete ingredient transparency',
        'Third-party tested products with certificates',
        'Science-backed formulations',
        'Brand that treats customers with intelligence'
      ],
      hooks: [
        'Every ingredient listed. Every dose shown. Proof provided.',
        'Third-party tested for purity - see the certificates',
        'Science-backed formulas for people who do their research',
        'Transparency you can trust. Results you can measure.'
      ],
      priority: 'medium',
      confidence: 89,
      status: 'pending'
    },
    {
      id: 'a4',
      name: 'Accountability-Seeking Amy',
      ageRange: '22-35',
      demographics: 'Young professional, Social, Entry to mid-level income',
      psychographics: 'Struggles with self-motivation and consistency. Thrives in community environments. Starts strong but loses momentum without external accountability. Influenced by social proof and peer success stories.',
      painPoints: [
        'Loses motivation after 2-3 weeks solo',
        'No one to hold her accountable to goals',
        'Feels isolated in fitness journey',
        'Can\'t afford expensive personal trainers'
      ],
      desires: [
        'Community of like-minded people',
        'Regular check-ins and progress tracking',
        'Affordable accountability system',
        'Celebration of small wins along the way'
      ],
      hooks: [
        'Join 10,000+ members who won\'t let you quit',
        'Your accountability partner at 1/10th the cost of a trainer',
        'Track every win. Celebrate every milestone. Together.',
        'Community-powered motivation that actually works'
      ],
      priority: 'medium',
      confidence: 85,
      status: 'pending'
    }
  ];

  // Fetch insights - use mock data if empty
  const { data: insights = [], isLoading: isLoadingInsights } = useQuery({
    queryKey: ['/api/insights', { category: selectedCategory, platform: selectedPlatform }],
  });

  // Fetch sources - use mock data if empty
  const { data: sources = [], isLoading: isLoadingSources } = useQuery({
    queryKey: ['/api/sources', { platform: selectedPlatform }],
  });
  
  const sourcesData = (sources as any[]).length > 0 ? (sources as any[]) : mockSources;

  // Fetch avatars - use mock data if empty
  const { data: avatars = [], isLoading: isLoadingAvatars } = useQuery({
    queryKey: ['/api/avatars'],
  });

  const avatarsData = (avatars as any[]).length > 0 ? (avatars as any[]) : mockAvatars;

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
      return await apiRequest('POST', '/api/customer-research/discover', { knowledgeBase });
    },
    onSuccess: () => {
      toast({
        title: "Discovery started!",
        description: "AI is now searching for customer insights based on your knowledge base.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/insights'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sources'] });
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

  // Filter insights by search - use mock data if empty
  const insightsData = (insights as any[]).length > 0 ? (insights as any[]) : mockInsights;
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
            Latest Discoveries ({filteredInsights.length})
          </TabsTrigger>
          <TabsTrigger value="library" data-testid="tab-research-library">
            Research Library
          </TabsTrigger>
          <TabsTrigger value="avatars" data-testid="tab-target-avatars">
            Target Avatars ({avatarsData.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Latest Discoveries */}
        <TabsContent value="latest" className="space-y-4">
          {/* Header */}
          <div className="border-l-4 border-primary pl-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Latest Discoveries (Last 24 Hours)
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Fresh customer insights discovered in the past 24 hours - sorted by recency
                </p>
              </div>
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
                <Button onClick={() => discoverMutation.mutate()} disabled={discoverMutation.isPending || !knowledgeBase}>
                  <Play className="h-4 w-4 mr-2" />
                  {discoverMutation.isPending ? "Discovering..." : "Start Discovery"}
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
          {/* Library Header with Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{insightsData.length}</p>
                    <p className="text-xs text-muted-foreground">Total Insights</p>
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
                    <p className="text-2xl font-bold">{categoryCounts['pain-point']}</p>
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
                    <p className="text-2xl font-bold">{categoryCounts.desire}</p>
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
                    <p className="text-2xl font-bold">{categoryCounts.trigger}</p>
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
                    <SelectItem value="pain-point">Pain Points</SelectItem>
                    <SelectItem value="desire">Desires</SelectItem>
                    <SelectItem value="objection">Objections</SelectItem>
                    <SelectItem value="trigger">Triggers</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={libraryPlatform} onValueChange={setLibraryPlatform}>
                  <SelectTrigger className="w-[180px]" data-testid="select-library-platform">
                    <SelectValue placeholder="Platform" />
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

                <Select value={libraryDateRange} onValueChange={setLibraryDateRange}>
                  <SelectTrigger className="w-[180px]" data-testid="select-library-date">
                    <SelectValue placeholder="Date Range" />
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
                Showing {insightsData.filter((insight: any) => {
                  if (libraryCategory !== 'all' && insight.category !== libraryCategory) return false;
                  if (libraryPlatform !== 'all' && insight.sourcePlatform !== libraryPlatform) return false;
                  if (librarySearch) {
                    const query = librarySearch.toLowerCase();
                    return (
                      insight.title?.toLowerCase().includes(query) ||
                      insight.summary?.toLowerCase().includes(query) ||
                      insight.rawQuote?.toLowerCase().includes(query)
                    );
                  }
                  return true;
                }).length} of {insightsData.length} insights
              </div>
            </CardContent>
          </Card>

          {/* Library Content */}
          {libraryViewMode === 'grid' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {insightsData
                .filter((insight: any) => {
                  if (libraryCategory !== 'all' && insight.category !== libraryCategory) return false;
                  if (libraryPlatform !== 'all' && insight.sourcePlatform !== libraryPlatform) return false;
                  if (librarySearch) {
                    const query = librarySearch.toLowerCase();
                    return (
                      insight.title?.toLowerCase().includes(query) ||
                      insight.summary?.toLowerCase().includes(query) ||
                      insight.rawQuote?.toLowerCase().includes(query)
                    );
                  }
                  return true;
                })
                .map((insight: any) => {
                  const categoryInfo = categoryConfig[insight.category as keyof typeof categoryConfig];
                  const CategoryIcon = categoryInfo?.icon || Brain;
                  
                  return (
                    <Card key={insight.id} className="hover-elevate" data-testid={`card-library-insight-${insight.id}`}>
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
                        <div>
                          <p className="text-sm text-muted-foreground">{insight.summary}</p>
                        </div>
                        
                        {insight.observations && insight.observations.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Key Observations</h4>
                            <ul className="space-y-1">
                              {insight.observations.slice(0, 2).map((obs: string, idx: number) => (
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
                              {insight.marketingAngles.slice(0, 2).map((angle: string, idx: number) => (
                                <div key={idx} className="text-sm bg-primary/5 p-2 rounded">
                                  💡 {angle}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="gap-2 w-full"
                          data-testid={`button-library-view-source-${insight.id}`}
                        >
                          <a href={insight.sourceUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                            View Original Source
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}

          {libraryViewMode === 'list' && (
            <div className="space-y-3">
              {insightsData
                .filter((insight: any) => {
                  if (libraryCategory !== 'all' && insight.category !== libraryCategory) return false;
                  if (libraryPlatform !== 'all' && insight.sourcePlatform !== libraryPlatform) return false;
                  if (librarySearch) {
                    const query = librarySearch.toLowerCase();
                    return (
                      insight.title?.toLowerCase().includes(query) ||
                      insight.summary?.toLowerCase().includes(query) ||
                      insight.rawQuote?.toLowerCase().includes(query)
                    );
                  }
                  return true;
                })
                .map((insight: any) => {
                  const categoryInfo = categoryConfig[insight.category as keyof typeof categoryConfig];
                  const CategoryIcon = categoryInfo?.icon || Brain;
                  
                  return (
                    <Card key={insight.id} className="hover-elevate" data-testid={`card-library-list-${insight.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className={`${categoryInfo?.color} gap-1`}>
                                <CategoryIcon className="h-3 w-3" />
                                {categoryInfo?.label}
                              </Badge>
                              <Badge className={`${platformConfig[insight.sourcePlatform]?.color || 'bg-gray-500'} text-white`}>
                                {insight.sourcePlatform}
                              </Badge>
                            </div>
                            <h4 className="font-semibold mb-1">{insight.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">{insight.summary}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="gap-2"
                            data-testid={`button-library-list-source-${insight.id}`}
                          >
                            <a href={insight.sourceUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                              View
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}

          {insightsData.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Database className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Research Yet</h3>
                <p className="text-muted-foreground">
                  Start discovering insights to build your research library
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
