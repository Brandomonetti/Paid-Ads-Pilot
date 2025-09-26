import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Image, ThumbsUp, ThumbsDown, ExternalLink, Copy, RefreshCw, Palette, Video, Layout } from "lucide-react"

interface Asset {
  id: string
  title: string
  type: "template" | "broll" | "landing-page" | "graphic"
  category: string
  description: string
  source: string
  tags: string[]
  status: "pending" | "approved" | "rejected"
  feedback?: string
  previewUrl?: string
  downloadUrl?: string
}

export function AssetAgentDashboard() {
  //todo: remove mock functionality - replace with real API integrations
  const [assets, setAssets] = useState<Asset[]>([
    {
      id: "1",
      title: "Minimalist Product Showcase Template",
      type: "template",
      category: "Product Demo",
      description: "Clean, modern template perfect for showcasing food products. Features dynamic text overlays and smooth transitions.",
      source: "MotionElements",
      tags: ["minimal", "product", "food", "professional"],
      status: "pending",
      previewUrl: "#",
      downloadUrl: "#"
    },
    {
      id: "2",
      title: "Kitchen Cooking B-Roll Collection",
      type: "broll", 
      category: "Lifestyle",
      description: "High-quality 4K footage of cooking processes, ingredient prep, and kitchen scenes. Perfect for food brand content.",
      source: "Shutterstock",
      tags: ["cooking", "kitchen", "food-prep", "4k"],
      status: "approved",
      previewUrl: "#"
    },
    {
      id: "3",
      title: "Health & Wellness Landing Page",
      type: "landing-page",
      category: "Conversion",
      description: "High-converting landing page design optimized for health/nutrition brands. Includes social proof and testimonials.",
      source: "Unbounce Gallery",
      tags: ["health", "conversion", "testimonials", "mobile-optimized"],
      status: "pending",
      previewUrl: "#"
    },
    {
      id: "4",
      title: "Organic Food Instagram Stories",
      type: "graphic",
      category: "Social Media",
      description: "Set of 10 Instagram story templates designed for organic food brands. Includes product showcase and testimonial layouts.",
      source: "Canva Pro",
      tags: ["instagram", "stories", "organic", "social-media"],
      status: "pending",
      previewUrl: "#"
    }
  ])

  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedType, setSelectedType] = useState("")

  const handleApproval = (id: string, status: "approved" | "rejected") => {
    setAssets(prev => prev.map(asset => 
      asset.id === id 
        ? { ...asset, status, feedback: feedback[id] }
        : asset
    ))
    console.log(`Asset ${id} ${status}:`, feedback[id])
  }

  const searchAssets = () => {
    setIsSearching(true)
    //todo: remove mock functionality - integrate with asset platforms APIs
    setTimeout(() => {
      const newAsset: Asset = {
        id: Date.now().toString(),
        title: "UGC Creator Testimonial Template",
        type: "template",
        category: "Testimonial",
        description: "Authentic-looking testimonial template with creator-style framing and text overlays.",
        source: "MotionElements",
        tags: ["ugc", "testimonial", "authentic", "creator"],
        status: "pending",
        previewUrl: "#"
      }
      setAssets(prev => [newAsset, ...prev])
      setIsSearching(false)
    }, 2000)
  }

  const copyAssetInfo = (asset: Asset) => {
    const info = `${asset.title}\nType: ${asset.type}\nSource: ${asset.source}\nDescription: ${asset.description}\nTags: ${asset.tags.join(', ')}`
    navigator.clipboard.writeText(info)
    console.log("Asset info copied to clipboard")
  }

  const pendingCount = assets.filter(a => a.status === "pending").length
  const approvedCount = assets.filter(a => a.status === "approved").length

  const getTypeColor = (type: string) => {
    switch (type) {
      case "template": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "broll": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "landing-page": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "graphic": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "template": return <Layout className="h-4 w-4" />
      case "broll": return <Video className="h-4 w-4" />
      case "landing-page": return <ExternalLink className="h-4 w-4" />
      case "graphic": return <Palette className="h-4 w-4" />
      default: return <Image className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Image className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Asset Agent</h1>
            <p className="text-muted-foreground">Finds proven creative assets, templates, and B-roll footage to enhance your content production. Saves time by sourcing high-converting design elements and video assets that align with your brand.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Asset type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="template">Templates</SelectItem>
              <SelectItem value="broll">B-Roll</SelectItem>
              <SelectItem value="landing-page">Landing Pages</SelectItem>
              <SelectItem value="graphic">Graphics</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="product-demo">Product Demo</SelectItem>
              <SelectItem value="testimonial">Testimonial</SelectItem>
              <SelectItem value="lifestyle">Lifestyle</SelectItem>
              <SelectItem value="social-media">Social Media</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={searchAssets}
            disabled={isSearching}
            data-testid="button-search-assets"
          >
            {isSearching ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Image className="mr-2 h-4 w-4" />}
            {isSearching ? "Searching..." : "Find Assets"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Assets</CardDescription>
            <CardTitle className="text-2xl font-bold">{assets.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Pending Review</CardDescription>
            <CardTitle className="text-2xl font-bold text-orange-600">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Approved</CardDescription>
            <CardTitle className="text-2xl font-bold text-green-600">{approvedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Sources Connected</CardDescription>
            <CardTitle className="text-2xl font-bold">4</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Connected Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connected Asset Sources</CardTitle>
          <CardDescription>Platforms searched for creative assets and templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "MotionElements", status: "connected", assets: 12500 },
              { name: "Shutterstock", status: "connected", assets: 8900 },
              { name: "Canva Pro", status: "connected", assets: 15200 },
              { name: "Unbounce", status: "connected", assets: 350 },
            ].map((source) => (
              <div key={source.name} className="text-center p-3 rounded-lg border bg-muted/30">
                <h4 className="font-medium">{source.name}</h4>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-muted-foreground">{source.status}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{source.assets.toLocaleString()} assets</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Asset Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Discovered Assets
        </h2>
        
        {assets.map((asset) => (
          <Card key={asset.id} className="hover-elevate" data-testid={`card-asset-${asset.id}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(asset.type)}
                  <div>
                    <CardTitle className="text-lg">{asset.title}</CardTitle>
                    <CardDescription>{asset.category} • {asset.source}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={getTypeColor(asset.type)}>
                    {asset.type.replace('-', ' ').toUpperCase()}
                  </Badge>
                  <Badge 
                    variant={
                      asset.status === "approved" ? "default" : 
                      asset.status === "rejected" ? "destructive" : "secondary"
                    }
                  >
                    {asset.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyAssetInfo(asset)}
                    data-testid={`button-copy-asset-${asset.id}`}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Description */}
              <div className="p-3 rounded-lg bg-muted/50 border">
                <p className="text-sm">{asset.description}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {asset.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {asset.previewUrl && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={asset.previewUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Preview
                    </a>
                  </Button>
                )}
                {asset.downloadUrl && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={asset.downloadUrl} target="_blank" rel="noopener noreferrer">
                      <Video className="mr-2 h-4 w-4" />
                      Download
                    </a>
                  </Button>
                )}
              </div>

              {/* Feedback Section */}
              {asset.status === "pending" && (
                <div className="space-y-3 pt-4 border-t">
                  <Textarea
                    placeholder="Add feedback or usage notes..."
                    value={feedback[asset.id] || ""}
                    onChange={(e) => setFeedback(prev => ({ ...prev, [asset.id]: e.target.value }))}
                    rows={2}
                    data-testid={`textarea-feedback-${asset.id}`}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproval(asset.id, "approved")}
                      data-testid={`button-approve-${asset.id}`}
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleApproval(asset.id, "rejected")}
                      data-testid={`button-reject-${asset.id}`}
                    >
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      Not Suitable
                    </Button>
                  </div>
                </div>
              )}

              {/* Show feedback if already reviewed */}
              {asset.status !== "pending" && asset.feedback && (
                <div className="p-3 rounded-lg bg-muted/50 border-l-4 border-l-primary">
                  <p className="text-sm"><strong>Notes:</strong> {asset.feedback}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}