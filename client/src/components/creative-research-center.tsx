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
  Info,
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
  platform: "facebook" | "instagram" | "tiktok";
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
  status?:
    | "pending"
    | "approved"
    | "rejected"
    | "discovered"
    | "tested"
    | "proven";
  createdAt?: string;
  discoveredAt?: string;
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
  const [rejectedLatestIds, setRejectedLatestIds] = useState<Set<string>>(
    new Set(),
  );

  const [filters, setFilters] = useState({
    platform: "all",
    engagement: "all",
    format: "all",
    sortBy: "engagement",
    siteType: "all",
    gender: "all",
    ages: "all",
    dailyLikes: "all",
    mediaType: "all",
    createdBetween: "all",
    countries: "all",
    language: "all",
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
      // Guard: Prevent backend calls for mock concepts
      if (isMockMode) {
        throw new Error("MOCK_MODE");
      }
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
      // Gracefully handle mock mode errors
      if (error.message === "MOCK_MODE") {
        toast({
          title: "Demo Mode",
          description:
            "Run Discovery to enable approval workflow for real concepts.",
          variant: "default",
        });
        return;
      }
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
      // Guard: Prevent backend calls for mock concepts
      if (isMockMode) {
        throw new Error("MOCK_MODE");
      }
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
      // Gracefully handle mock mode errors
      if (error.message === "MOCK_MODE") {
        toast({
          title: "Demo Mode",
          description:
            "Run Discovery to enable approval workflow for real concepts.",
          variant: "default",
        });
        return;
      }
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

  // Handle reject from latest discoveries - temporarily hides (session only)
  const handleRejectLatest = (conceptId: string) => {
    setRejectedLatestIds((prev) => new Set(Array.from(prev).concat(conceptId)));
    toast({
      title: "Creative rejected",
      description: "This creative has been hidden for this session.",
    });
  };

  // Latest Discoveries demo data
  const latestExamples: CreativeConcept[] = [
    {
      id: "latest-demo-1",
      platform: "tiktok",
      title: 'Viral Hook: "Nobody told me this about..."',
      description:
        'Short-form UGC using the "nobody told me" hook format. Creator shares surprising benefit discovered after 2 weeks. Raw, authentic delivery with trending sound overlay.',
      format: "Raw UGC Video",
      hooks: [
        "Nobody told me this would happen",
        "Why didnt anyone tell me sooner",
        "The thing they dont show you",
      ],
      thumbnailUrl:
        "https://images.unsplash.com/photo-1611432579699-484f7990b127?w=400",
      postUrl: "https://tiktok.com/@creator/video/latest1",
      brandName: "HonestWellness",
      industry: "Health & Wellness",
      engagementScore: 98,
      likes: 1200000,
      comments: 18500,
      shares: 45000,
      views: 6800000,
      engagementRate: 0.19,
      status: "pending",
      createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
      discoveredAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    },
    {
      id: "latest-demo-2",
      platform: "instagram",
      title: "Trending Reel: Side-by-Side Comparison",
      description:
        'Split-screen format showing "me using cheap products" vs "me using this". Funny, relatable, and visually striking with trending audio.',
      format: "Before/After",
      hooks: [
        "The upgrade I didnt know I needed",
        "Why did I wait so long",
        "Left side broke, right side woke",
      ],
      thumbnailUrl:
        "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400",
      postUrl: "https://instagram.com/reel/comparison",
      brandName: "UpgradeYourLife",
      industry: "Lifestyle",
      engagementScore: 95,
      likes: 892000,
      comments: 12300,
      shares: 34100,
      views: 4500000,
      engagementRate: 0.21,
      status: "pending",
      createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
      discoveredAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    },
    {
      id: "latest-demo-3",
      platform: "facebook",
      title: 'Emotional Story: "I almost gave up..."',
      description:
        "Longer-form testimonial video with genuine emotion. Person shares their lowest point and transformation journey. Comments are extremely supportive.",
      format: "Testimonial",
      hooks: [
        "I was ready to give up until...",
        "This is the story I never thought Id tell",
        "Rock bottom became my foundation",
      ],
      thumbnailUrl:
        "https://images.unsplash.com/photo-1552581234-26160f608093?w=400",
      postUrl: "https://facebook.com/watch/transformation",
      brandName: "SecondChance",
      industry: "Health & Wellness",
      engagementScore: 96,
      likes: 145000,
      comments: 23400,
      shares: 67800,
      views: 1200000,
      engagementRate: 0.2,
      status: "pending",
      createdAt: new Date(Date.now() - 10 * 3600000).toISOString(),
      discoveredAt: new Date(Date.now() - 10 * 3600000).toISOString(),
    },
    {
      id: "latest-demo-4",
      platform: "tiktok",
      title: "POV: When you finally find THE product",
      description:
        "POV-style video capturing that moment of discovery. Authentic reaction format thats highly shareable and relatable.",
      format: "POV Storytelling",
      hooks: [
        "POV you finally found it",
        "When it actually works",
        "The moment everything changed",
      ],
      thumbnailUrl:
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400",
      postUrl: "https://tiktok.com/@creator/video/pov",
      brandName: "DiscoveryBrand",
      industry: "Beauty",
      engagementScore: 94,
      likes: 567000,
      comments: 8900,
      shares: 23400,
      views: 3200000,
      engagementRate: 0.19,
      status: "pending",
      createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
      discoveredAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
    {
      id: "latest-demo-5",
      platform: "instagram",
      title: "Day in My Life with [Product]",
      description:
        "DIML format showing how product fits into everyday routine. Aesthetic visuals with subtle product integration that feels natural.",
      format: "DIML Storytelling",
      hooks: [
        "A day in my life",
        "My morning routine",
        "How I stay productive",
      ],
      thumbnailUrl:
        "https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=400",
      postUrl: "https://instagram.com/reel/diml",
      brandName: "DailyEssentials",
      industry: "Lifestyle",
      engagementScore: 91,
      likes: 234000,
      comments: 5600,
      shares: 12300,
      views: 1800000,
      engagementRate: 0.14,
      status: "pending",
      createdAt: new Date(Date.now() - 18 * 3600000).toISOString(),
      discoveredAt: new Date(Date.now() - 18 * 3600000).toISOString(),
    },
  ];

  // Filter out rejected latest examples
  const visibleLatestExamples = latestExamples.filter(
    (e) => !rejectedLatestIds.has(e.id),
  );

  // Explore section example data
  const exploreExamples: (CreativeConcept & { runningSince: string })[] = [
    {
      id: "explore-1",
      platform: "facebook",
      title: "30-Day Transformation Challenge - Join Now!",
      description:
        "Join thousands who transformed their bodies in 30 days. No gym required - just 20 minutes per day.",
      format: "Video Ad",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400",
      brandName: "FitnessFirst Pro",
      industry: "Health & Fitness",
      views: 2400000,
      likes: 156000,
      comments: 8200,
      shares: 12300,
      engagementRate: 0.073,
      engagementScore: 92,
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      runningSince: "14 days ago",
      hooks: ["Transform your body", "No gym required", "20 minutes per day"],
      status: "pending",
    },
    {
      id: "explore-2",
      platform: "instagram",
      title: "Summer Collection - Up to 50% Off",
      description:
        "Swipe to see our hottest summer picks. Limited time offer - shop before its gone!",
      format: "Carousel",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=400",
      brandName: "StyleHub",
      industry: "Fashion",
      views: 892000,
      likes: 45000,
      comments: 3100,
      shares: 18700,
      engagementRate: 0.075,
      engagementScore: 88,
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      runningSince: "7 days ago",
      hooks: ["50% off summer sale", "Limited time offer"],
      status: "pending",
    },
    {
      id: "explore-3",
      platform: "tiktok",
      title: "I tried this skincare routine for 7 days...",
      description: "You wont believe the results! Check out my before & after.",
      format: "UGC Video",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1611432579699-484f7990b127?w=400",
      brandName: "GlowUp Beauty",
      industry: "Beauty",
      views: 4800000,
      likes: 567000,
      comments: 23400,
      shares: 89200,
      engagementRate: 0.142,
      engagementScore: 97,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      runningSince: "3 days ago",
      hooks: ["Before & after reveal", "7-day transformation"],
      status: "pending",
    },
    {
      id: "explore-4",
      platform: "facebook",
      title: "Workspace Essentials for Productivity",
      description:
        "Upgrade your home office with ergonomic furniture & accessories. Free shipping on orders $100+",
      format: "Image Ad",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=400",
      brandName: "DeskLife Co.",
      industry: "Home Office",
      views: 1200000,
      likes: 67000,
      comments: 4500,
      shares: 9800,
      engagementRate: 0.068,
      engagementScore: 85,
      createdAt: new Date(Date.now() - 21 * 86400000).toISOString(),
      runningSince: "21 days ago",
      hooks: ["Work from home upgrade", "Free shipping"],
      status: "pending",
    },
    {
      id: "explore-5",
      platform: "instagram",
      title: "Noise-Cancelling Earbuds - 60% Off Today",
      description:
        "Experience studio-quality sound anywhere. Limited flash sale - 24 hours only!",
      format: "Video Ad",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1526178613552-2b45c6c302f0?w=400",
      brandName: "AudioTech",
      industry: "Electronics",
      views: 3100000,
      likes: 234000,
      comments: 15600,
      shares: 45200,
      engagementRate: 0.095,
      engagementScore: 94,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      runningSince: "2 days ago",
      hooks: ["Flash sale 60% off", "Studio-quality sound"],
      status: "pending",
    },
    {
      id: "explore-6",
      platform: "tiktok",
      title: "This meal prep hack saved me HOURS",
      description:
        "Healthy eating doesnt have to be hard. Watch how I prep a whole weeks meals in 2 hours.",
      format: "UGC Video",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400",
      brandName: "MealPrepPro",
      industry: "Food & Nutrition",
      views: 2300000,
      likes: 189000,
      comments: 12100,
      shares: 56700,
      engagementRate: 0.112,
      engagementScore: 91,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      runningSince: "5 days ago",
      hooks: ["Meal prep hack", "Save hours weekly"],
      status: "pending",
    },
  ];

  // Filter out rejected search results
  const visibleSearchResults = searchResults.filter(
    (e) => !rejectedExploreIds.has(String(e.id)),
  );

  // Mock data for development visualization
  const mockConcepts: CreativeConcept[] = [
    // LATEST DISCOVERIES (Last 24 hours) - PENDING
    {
      id: "c-latest-1",
      platform: "tiktok",
      title: 'Viral Hook: "Nobody told me this about..."',
      description:
        'Short-form UGC using the "nobody told me" hook format. Creator shares surprising benefit discovered after 2 weeks. Raw, authentic delivery with trending sound overlay. Comments full of people tagging friends.',
      format: "Raw UGC Video",
      hooks: [
        "Nobody told me this would happen after 2 weeks",
        "Why didn't anyone tell me about this sooner??",
        "The thing they don't show you in before/after pics",
      ],
      thumbnailUrl:
        "https://images.unsplash.com/photo-1611432579699-484f7990b127?w=400",
      postUrl: "https://tiktok.com/@realtalktiktok/video/latest1",
      brandName: "HonestWellness",
      industry: "Health & Wellness",
      engagementScore: 98,
      likes: 1200000,
      comments: 18500,
      shares: 45000,
      views: 6800000,
      engagementRate: 0.19,
      status: "pending",
      createdAt: new Date(Date.now() - 3 * 3600000).toISOString(), // 3 hours ago
      discoveredAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    },
    {
      id: "c-latest-2",
      platform: "instagram",
      title: "Trending Reel: Side-by-Side Comparison",
      description:
        'Split-screen format showing "me using cheap products" vs "me using this". Funny, relatable, and visually striking. Audio is trending sound that amplifies the contrast. Massive saves and shares.',
      format: "Before/After",
      hooks: [
        "The upgrade I didn't know I needed",
        "Why did I wait so long to switch??",
        "Left side: broke. Right side: woke.",
      ],
      thumbnailUrl:
        "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400",
      postUrl: "https://instagram.com/reel/comparison-viral",
      brandName: "UpgradeYourLife",
      industry: "Lifestyle",
      engagementScore: 95,
      likes: 892000,
      comments: 12300,
      shares: 34100,
      views: 4500000,
      engagementRate: 0.21,
      status: "pending",
      createdAt: new Date(Date.now() - 6 * 3600000).toISOString(), // 6 hours ago
      discoveredAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    },
    {
      id: "c-latest-3",
      platform: "facebook",
      title: 'Emotional Story: "I almost gave up..."',
      description:
        "Longer-form testimonial video (2 min) with genuine emotion. Person shares their lowest point, the moment they decided to try one more thing, and the transformation. Comments are extremely supportive and engaged.",
      format: "Testimonial",
      hooks: [
        "I was ready to give up until...",
        "This is the story I never thought I'd tell",
        "Rock bottom became my foundation",
      ],
      thumbnailUrl:
        "https://images.unsplash.com/photo-1552581234-26160f608093?w=400",
      postUrl: "https://facebook.com/watch/transformation-story-real",
      brandName: "SecondChance",
      industry: "Health & Wellness",
      engagementScore: 96,
      likes: 145000,
      comments: 23400,
      shares: 67800,
      views: 1200000,
      engagementRate: 0.2,
      status: "pending",
      createdAt: new Date(Date.now() - 10 * 3600000).toISOString(), // 10 hours ago
      discoveredAt: new Date(Date.now() - 10 * 3600000).toISOString(),
    },
    // APPROVED - Shows in Creative Library
    {
      id: "c-approved-1",
      platform: "tiktok",
      title: 'Jump-Cut Energy: "Day in My Life" Montage',
      description:
        'Fast-paced day-in-life showing person crushing tasks with visible energy. Quick cuts, upbeat music, timestamps showing packed schedule. Caption: "This used to be impossible for me". Aspirational yet achievable.',
      format: "POV Storytelling",
      hooks: [
        "POV: You finally have the energy to do it all",
        "6am to 10pm and still not tired - here's how",
        "This is what consistent energy looks like in real life",
      ],
      thumbnailUrl:
        "https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?w=400",
      postUrl: "https://tiktok.com/@energizedlife/video/latest2",
      brandName: "AllDayEnergy",
      industry: "Productivity",
      engagementScore: 94,
      likes: 756000,
      comments: 9200,
      shares: 28300,
      views: 3900000,
      engagementRate: 0.2,
      status: "approved",
      createdAt: new Date(Date.now() - 15 * 3600000).toISOString(), // 15 hours ago
      discoveredAt: new Date(Date.now() - 30 * 3600000).toISOString(), // Discovered 30 hours ago
    },
    {
      id: "c-latest-5",
      platform: "instagram",
      title: 'Carousel: "Here\'s what actually worked"',
      description:
        "Multi-slide educational carousel breaking down exactly what changed in their routine. Slide 1: The problem. Slides 2-7: What they tried that didn't work. Slide 8: What finally worked. Slide 9: Results. Slide 10: Product reveal. Very high save rate.",
      format: "Educational Content",
      hooks: [
        "I tried 12 things - only 1 actually worked",
        "Here's what I wish I knew from day 1",
        "Save this - you'll want to come back to it",
      ],
      thumbnailUrl:
        "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400",
      postUrl: "https://instagram.com/p/what-worked-guide",
      brandName: "RealResults",
      industry: "Health & Wellness",
      engagementScore: 97,
      likes: 234000,
      comments: 5600,
      shares: 8900,
      views: 890000,
      engagementRate: 0.28,
      status: "pending",
      createdAt: new Date(Date.now() - 20 * 3600000).toISOString(), // 20 hours ago
      discoveredAt: new Date(Date.now() - 20 * 3600000).toISOString(),
    },
    {
      id: "c-latest-6",
      platform: "tiktok",
      title: 'Trend: "If you know, you know" Format',
      description:
        'Uses trending "iykyk" format where creator subtly shows product in background while doing relatable activity. Doesn\'t explicitly sell - just shows it as part of their lifestyle. Comments full of "what is that??" driving engagement.',
      format: "Raw UGC Video",
      hooks: [
        "If you know you know 👀",
        "Don't tell everyone about this lol",
        "The ones who know are winning rn",
      ],
      thumbnailUrl:
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400",
      postUrl: "https://tiktok.com/@subtleinfluence/video/latest3",
      brandName: "InThoseWhoKnow",
      industry: "Lifestyle",
      engagementScore: 93,
      likes: 567000,
      comments: 34500,
      shares: 19200,
      views: 2800000,
      engagementRate: 0.22,
      status: "pending",
      createdAt: new Date(Date.now() - 22 * 3600000).toISOString(), // 22 hours ago
      discoveredAt: new Date(Date.now() - 22 * 3600000).toISOString(),
    },

    // OLDER CONCEPTS (7+ days ago for Curated tab)
    {
      id: "c1",
      platform: "tiktok",
      title: "Raw UGC: Morning Routine Energy Transformation",
      description:
        'Authentic "get ready with me" style video showing before/after energy levels. Creator starts groggy, takes supplement mid-routine, shows visible energy shift by end. Very relatable, no heavy production.',
      format: "Raw UGC Video",
      hooks: [
        "POV: You finally found something that actually works",
        "This is what 30 days of consistent energy looks like",
        "Watch my energy levels go from 0 to 100",
      ],
      thumbnailUrl:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
      postUrl: "https://tiktok.com/@fitlifestyle/video/example1",
      brandName: "VitalityBoost",
      industry: "Health & Wellness",
      engagementScore: 96,
      likes: 847000,
      comments: 12400,
      shares: 23100,
      views: 4200000,
      engagementRate: 0.21,
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: "c2",
      platform: "instagram",
      title: "Before/After Body Transformation Carousel",
      description:
        'Multi-slide carousel showing 90-day transformation with weekly progress photos. Each slide has timestamp and weight/measurements. Final slide reveals the "secret" (product + consistency). High engagement from fitness community.',
      format: "Before/After",
      hooks: [
        "90 days ago I couldn't even look at myself",
        "The difference consistency makes (swipe to see)",
        "Here's exactly what I did - no BS",
      ],
      thumbnailUrl:
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400",
      postUrl: "https://instagram.com/p/transformation90",
      brandName: "FitFuel Pro",
      industry: "Fitness Supplements",
      engagementScore: 93,
      likes: 156000,
      comments: 8900,
      shares: 4200,
      views: 890000,
      engagementRate: 0.19,
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
    {
      id: "c3",
      platform: "facebook",
      title: "Emotional Testimonial: Mom Gets Her Energy Back",
      description:
        'Heartfelt video testimonial from busy mom who struggled with afternoon crashes. Shows her playing with kids at end of day now. Genuine emotion, relatable pain points. Comments full of "this is me" responses.',
      format: "Testimonial",
      hooks: [
        "I was too tired to play with my kids after work",
        "This mom of 3 found her energy again",
        "You don't have to choose between career and being present",
      ],
      thumbnailUrl:
        "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400",
      postUrl: "https://facebook.com/watch/momlife-energy",
      brandName: "MamaVitality",
      industry: "Health & Wellness",
      engagementScore: 91,
      likes: 42000,
      comments: 6700,
      shares: 18900,
      views: 620000,
      engagementRate: 0.11,
      createdAt: new Date(Date.now() - 21 * 86400000).toISOString(),
    },
    {
      id: "c4",
      platform: "tiktok",
      title: "POV Storytelling: The Day Everything Changed",
      description:
        'First-person perspective narrative showing "rock bottom" moment, then daily progress clips. Emotional arc with triumphant ending. Uses trending audio. Massive shareability factor.',
      format: "POV Storytelling",
      hooks: [
        "POV: The day you stopped making excuses",
        "This is what happens when you actually commit",
        "Week 1 vs Week 12 - the difference is insane",
      ],
      thumbnailUrl:
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400",
      postUrl: "https://tiktok.com/@transformstories/video/example2",
      brandName: "CoreStrength",
      industry: "Fitness",
      engagementScore: 94,
      likes: 923000,
      comments: 15200,
      shares: 31400,
      views: 5100000,
      engagementRate: 0.19,
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    {
      id: "c5",
      platform: "instagram",
      title: 'DIML: "I Didn\'t Believe It Until..."',
      description:
        "Didn't-I-Make-It-Look storytelling format. Creator addresses camera skeptically at start, fast-forwards through journey with voiceover, ends with proof and admission they were wrong. Converts skeptics.",
      format: "DIML Storytelling",
      hooks: [
        "I thought this was another scam until...",
        "Here's why I was wrong (and I'm glad I was)",
        "The skeptic becomes a believer - my story",
      ],
      thumbnailUrl:
        "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400",
      postUrl: "https://instagram.com/reel/skeptic-to-believer",
      brandName: "TrustFit",
      industry: "Health & Wellness",
      engagementScore: 89,
      likes: 78000,
      comments: 5400,
      shares: 3100,
      views: 450000,
      engagementRate: 0.19,
      createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
    },
    {
      id: "c6",
      platform: "tiktok",
      title: "Sped-Up Process: 30-Day Timelapse Journey",
      description:
        "Fast-motion compilation of daily workout/supplement routine with date stamps. Set to upbeat music. Shows consistency and gradual visible changes. Viewers can see themselves in the journey.",
      format: "Sped-up Process Video",
      hooks: [
        "What 30 days of consistency actually looks like",
        "Day 1 to Day 30 - watch the transformation",
        "This is what happens when you don't give up",
      ],
      thumbnailUrl:
        "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=400",
      postUrl: "https://tiktok.com/@30daychallenge/video/example3",
      brandName: "ConsistentFit",
      industry: "Fitness",
      engagementScore: 92,
      likes: 645000,
      comments: 9800,
      shares: 19200,
      views: 3200000,
      engagementRate: 0.21,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: "c7",
      platform: "facebook",
      title: "Educational: Science Behind Recovery",
      description:
        "Professional-looking educational content explaining muscle recovery science in simple terms. Includes graphics, before/after muscle scans. Positions product as scientifically-backed solution.",
      format: "Educational Content",
      hooks: [
        "Here's what actually happens during muscle recovery",
        "The science of getting stronger (explained simply)",
        "Why your muscles need this to grow",
      ],
      thumbnailUrl:
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400",
      postUrl: "https://facebook.com/watch/recovery-science",
      brandName: "ScienceFit Pro",
      industry: "Fitness Supplements",
      engagementScore: 87,
      likes: 34000,
      comments: 4100,
      shares: 8600,
      views: 380000,
      engagementRate: 0.12,
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    },
    {
      id: "c8",
      platform: "instagram",
      title: "Community Compilation: Real Customer Results",
      description:
        'Montage of customer-submitted transformation videos. Shows diversity of ages, body types, backgrounds. Creates "if they can, I can" response. Massive social proof.',
      format: "UGC Compilation",
      hooks: [
        "These are all real customers - not actors",
        "500+ transformations and counting",
        "Your results could be next",
      ],
      thumbnailUrl:
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400",
      postUrl: "https://instagram.com/reel/community-results",
      brandName: "TogetherFit",
      industry: "Fitness Community",
      engagementScore: 95,
      likes: 234000,
      comments: 11200,
      shares: 15800,
      views: 1100000,
      engagementRate: 0.24,
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    },
    {
      id: "c9",
      platform: "tiktok",
      title: 'Controversial Take: "You Don\'t Need More Motivation"',
      description:
        "Provocative hook challenges common beliefs. Creator argues systems beat motivation. Shows their simple daily system. Comments debating, huge engagement. Algorithm loves controversy.",
      format: "Opinion/Hot Take",
      hooks: [
        "Stop waiting for motivation - it's a trap",
        "Unpopular opinion: motivation is overrated",
        "Here's what actually works (and it's not what you think)",
      ],
      thumbnailUrl:
        "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400",
      postUrl: "https://tiktok.com/@honesttakes/video/example4",
      brandName: "RealTalk Fitness",
      industry: "Fitness Coaching",
      engagementScore: 88,
      likes: 512000,
      comments: 28900,
      shares: 12100,
      views: 2800000,
      engagementRate: 0.2,
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    },
    {
      id: "c10",
      platform: "instagram",
      title: "Day in the Life: Busy Professional's Routine",
      description:
        "Follow along day showing how real person fits fitness into packed schedule. Shows supplement timing, quick workouts, meal prep. Extremely relatable for target audience.",
      format: "Lifestyle/DITL",
      hooks: [
        "How I stay fit with a 60-hour work week",
        "You don't need hours - you need a system",
        "Fit life as a busy professional (realistic edition)",
      ],
      thumbnailUrl:
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400",
      postUrl: "https://instagram.com/reel/busy-life-fitness",
      brandName: "BusyFit",
      industry: "Health & Wellness",
      engagementScore: 90,
      likes: 189000,
      comments: 7600,
      shares: 9400,
      views: 820000,
      engagementRate: 0.25,
      createdAt: new Date(Date.now() - 16 * 86400000).toISOString(),
    },
  ];

  // Fetch all creative concepts - use mock data if empty
  const { data: concepts = [], isLoading } = useQuery<CreativeConcept[]>({
    queryKey: ["/api/concepts"],
  });

  // Detect if we're using mock data (no real concepts from API yet)
  const isMockMode = (concepts as CreativeConcept[]).length === 0;
  const conceptsData = isMockMode
    ? mockConcepts
    : (concepts as CreativeConcept[]);

  // Toggle for using mock data (to avoid API calls)
  const [useMockData, setUseMockData] = useState(true);

  // Search for competitor/brand content
  const searchMutation = useMutation({
    mutationFn: async (params: {
      query: string;
      type: string;
      useMock?: boolean;
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
      useMock: useMockData,
    });
  };

  // Filter and sort concepts
  const filteredConcepts = conceptsData
    .filter((concept) => {
      if (filters.platform !== "all" && concept.platform !== filters.platform)
        return false;

      if (filters.engagement !== "all") {
        const rate = Number(concept.engagementRate) || 0;
        if (filters.engagement === "high" && rate <= 10) return false;
        if (filters.engagement === "medium" && (rate <= 5 || rate > 10))
          return false;
        if (filters.engagement === "low" && rate > 5) return false;
      }

      if (filters.format !== "all" && concept.format !== filters.format)
        return false;

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
        if (filters.engagement !== "all") {
          const rate = Number(concept.engagementRate) || 0;
          if (filters.engagement === "high" && rate <= 10) return false;
          if (filters.engagement === "medium" && (rate <= 5 || rate > 10))
            return false;
          if (filters.engagement === "low" && rate > 5) return false;
        }
        if (filters.format !== "all" && concept.format !== filters.format)
          return false;
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
            Latest Discoveries (
            {pendingConcepts.length > 0
              ? pendingConcepts.length
              : visibleLatestExamples.length}
            )
          </TabsTrigger>
          <TabsTrigger value="curated" data-testid="tab-creative-library">
            <Database className="h-4 w-4 mr-2" />
            Creative Library ({approvedConcepts.length})
          </TabsTrigger>
        </TabsList>

        {/* Latest Discoveries Tab */}
        <TabsContent value="latest" className="space-y-4">
          {/* Demo Mode Banner */}
          {isMockMode && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Demo Mode Active
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    You're viewing sample concepts for demonstration. Click the{" "}
                    <strong>Discover</strong> button below to fetch real viral
                    creatives based on your knowledge base and enable the
                    approval workflow.
                  </p>
                </div>
              </div>
            </div>
          )}

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
              {/* Show demo examples when no real pending concepts */}
              {pendingConcepts.length === 0 &&
              visibleLatestExamples.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleLatestExamples.map((example) => (
                    <Card
                      key={example.id}
                      className="hover-elevate overflow-hidden"
                      data-testid={`card-latest-${example.id}`}
                    >
                      {example.thumbnailUrl && (
                        <div className="relative aspect-video bg-muted">
                          <img
                            src={example.thumbnailUrl}
                            alt={example.title}
                            className="w-full h-full object-cover"
                          />
                          <Badge
                            className="absolute top-2 left-2"
                            variant="secondary"
                          >
                            {example.platform === "facebook"
                              ? "Facebook"
                              : example.platform === "instagram"
                                ? "Instagram"
                                : "TikTok"}
                          </Badge>
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
                                {getPlatformIcon(example.platform)}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {example.format}
                              </Badge>
                              <Badge className="text-xs bg-orange-500/10 text-orange-700 border-orange-300">
                                {new Date(
                                  example.createdAt || 0,
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </Badge>
                            </div>
                            <CardTitle className="text-base line-clamp-2">
                              {example.title}
                            </CardTitle>
                            {example.brandName && (
                              <p className="text-xs text-muted-foreground mt-1">
                                by {example.brandName}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {example.description}
                        </p>

                        {/* Engagement Metrics */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3 text-muted-foreground" />
                            <span>{formatNumber(example.views || 0)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3 text-muted-foreground" />
                            <span>{formatNumber(example.likes || 0)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3 text-muted-foreground" />
                            <span>{formatNumber(example.comments || 0)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Share2 className="h-3 w-3 text-muted-foreground" />
                            <span>{formatNumber(example.shares || 0)}</span>
                          </div>
                        </div>

                        {/* Engagement Rate */}
                        <div className="pt-2 border-t">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              Engagement Rate
                            </span>
                            <span className="font-medium">
                              {((example.engagementRate || 0) * 100).toFixed(1)}
                              %
                            </span>
                          </div>
                        </div>

                        {/* Approval Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-1 text-green-600 hover:bg-green-50 hover:text-green-700 border-green-200"
                            onClick={() => {
                              const {
                                id,
                                status,
                                createdAt,
                                discoveredAt,
                                ...conceptData
                              } = example;
                              handleApproveLatest(conceptData);
                              handleRejectLatest(example.id);
                            }}
                            disabled={saveToLibraryMutation.isPending}
                            data-testid={`button-approve-${example.id}`}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-1 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                            onClick={() => handleRejectLatest(example.id)}
                            data-testid={`button-reject-${example.id}`}
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : pendingConcepts.length === 0 &&
                visibleLatestExamples.length === 0 ? (
                <div className="py-12 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">All Demos Reviewed</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You've reviewed all demo creatives. Click Discover to find
                    real viral content.
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
                                alt={concept.title}
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
                                    {getPlatformIcon(concept.platform)}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {concept.format}
                                  </Badge>
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
                                  {concept.title}
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
                  value={filters.engagement}
                  onValueChange={(value) =>
                    setFilters({ ...filters, engagement: value })
                  }
                >
                  <SelectTrigger
                    className="w-[150px]"
                    data-testid="select-curated-engagement"
                  >
                    <SelectValue placeholder="Engagement" />
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
                  onValueChange={(value) =>
                    setFilters({ ...filters, format: value })
                  }
                >
                  <SelectTrigger
                    className="w-[180px]"
                    data-testid="select-curated-format"
                  >
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Formats</SelectItem>
                    <SelectItem value="Raw UGC Video">Raw UGC</SelectItem>
                    <SelectItem value="POV Storytelling">
                      POV Storytelling
                    </SelectItem>
                    <SelectItem value="Before/After">Before/After</SelectItem>
                    <SelectItem value="Testimonial">Testimonial</SelectItem>
                    <SelectItem value="DIML Storytelling">DIML</SelectItem>
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
                      engagement: "all",
                      format: "all",
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
                              <span className="text-lg">
                                {getPlatformIcon(concept.platform)}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {concept.format}
                              </Badge>
                              {(Number(concept.engagementRate) || 0) >= 10 && (
                                <Badge className="text-xs bg-green-500/10 text-green-700 border-green-300">
                                  Viral
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-base line-clamp-2">
                              {concept.title}
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

                <div className="flex items-center gap-2">
                  <Switch
                    id="mock-mode"
                    checked={useMockData}
                    onCheckedChange={setUseMockData}
                    data-testid="switch-mock-mode"
                  />
                  <Label
                    htmlFor="mock-mode"
                    className="text-sm text-muted-foreground"
                  >
                    Demo Mode
                  </Label>
                </div>
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
                          platform: "all",
                          engagement: "all",
                          format: "all",
                          sortBy: "engagement",
                          siteType: "all",
                          gender: "all",
                          ages: "all",
                          dailyLikes: "all",
                          mediaType: "all",
                          createdBetween: "all",
                          countries: "all",
                          language: "all",
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
                  <h3 className="font-medium mb-2">No Results to Show</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You've hidden all current results. Search again to discover
                    more creatives.
                  </p>
                  <Button
                    onClick={() => setRejectedExploreIds(new Set())}
                    variant="outline"
                  >
                    Show Hidden Results
                  </Button>
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
                    const platform =
                      result.conceptType?.toLowerCase() || "website";
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
                                {result.category && (
                                  <Badge className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600">
                                    {result.category}
                                  </Badge>
                                )}
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
                                  conceptType: result.conceptType,
                                  owner: result.owner || "",
                                  category: result.category || "",
                                  url: result.url || "",
                                  thumbnail: result.thumbnail || "",
                                  statistics: result.statistics || {},
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
