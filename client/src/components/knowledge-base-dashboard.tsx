import { useState } from "react"
import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Upload, 
  Globe, 
  Palette, 
  Package, 
  Users, 
  Target, 
  Instagram, 
  BarChart3, 
  Camera, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  X,
  FileText,
  Link,
  Eye,
  Zap
} from "lucide-react"

interface KnowledgeBaseData {
  brandFundamentals: {
    websiteUrl: string
    brandGuidelines: File | null
    logoFiles: File[]
    brandVoice: string
    missionStatement: string
    brandValues: string[]
  }
  products: {
    productLinks: string[]
    catalogFile: File | null
    pricingInfo: string
    keyBenefits: string[]
    usps: string[]
  }
  audience: {
    currentPersonas: string
    demographics: string
    customerFeedback: File | null
    marketResearch: File | null
  }
  competitors: {
    mainCompetitors: string[]
    competitorAnalysis: File | null
    competitorAds: File[]
  }
  socialMedia: {
    instagramHandle: string
    facebookPage: string
    tiktokHandle: string
    contentStyle: string
  }
  performance: {
    previousAdData: File | null
    analyticsData: File | null
    salesTrends: string
  }
  creativeAssets: {
    productPhotos: File[]
    lifestyleImages: File[]
    videoContent: File[]
  }
}

export function KnowledgeBaseDashboard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseData>({
    brandFundamentals: {
      websiteUrl: "",
      brandGuidelines: null,
      logoFiles: [],
      brandVoice: "",
      missionStatement: "",
      brandValues: []
    },
    products: {
      productLinks: [],
      catalogFile: null,
      pricingInfo: "",
      keyBenefits: [],
      usps: []
    },
    audience: {
      currentPersonas: "",
      demographics: "",
      customerFeedback: null,
      marketResearch: null
    },
    competitors: {
      mainCompetitors: [],
      competitorAnalysis: null,
      competitorAds: []
    },
    socialMedia: {
      instagramHandle: "",
      facebookPage: "",
      tiktokHandle: "",
      contentStyle: ""
    },
    performance: {
      previousAdData: null,
      analyticsData: null,
      salesTrends: ""
    },
    creativeAssets: {
      productPhotos: [],
      lifestyleImages: [],
      videoContent: []
    }
  })

  const steps = [
    { id: "brand", title: "Brand Fundamentals", icon: Palette, description: "Core brand identity and guidelines" },
    { id: "products", title: "Products & Services", icon: Package, description: "Product catalog and key benefits" },
    { id: "audience", title: "Target Audience", icon: Users, description: "Customer personas and research" },
    { id: "competitors", title: "Competitor Intelligence", icon: Target, description: "Competitive landscape analysis" },
    { id: "social", title: "Social Media", icon: Instagram, description: "Social presence and content style" },
    { id: "performance", title: "Performance Data", icon: BarChart3, description: "Historical data and analytics" },
    { id: "assets", title: "Creative Assets", icon: Camera, description: "Photos, videos, and brand materials" }
  ]

  const getStepProgress = (stepId: string): number => {
    switch (stepId) {
      case "brand":
        const brandFields = [
          knowledgeBase.brandFundamentals.websiteUrl,
          knowledgeBase.brandFundamentals.brandVoice,
          knowledgeBase.brandFundamentals.missionStatement
        ].filter(Boolean).length
        return (brandFields / 3) * 100
      case "products":
        const productFields = [
          knowledgeBase.products.productLinks.length > 0,
          knowledgeBase.products.pricingInfo,
          knowledgeBase.products.keyBenefits.length > 0
        ].filter(Boolean).length
        return (productFields / 3) * 100
      case "audience":
        const audienceFields = [
          knowledgeBase.audience.currentPersonas,
          knowledgeBase.audience.demographics
        ].filter(Boolean).length
        return (audienceFields / 2) * 100
      case "competitors":
        return knowledgeBase.competitors.mainCompetitors.length > 0 ? 100 : 0
      case "social":
        const socialFields = [
          knowledgeBase.socialMedia.instagramHandle,
          knowledgeBase.socialMedia.contentStyle
        ].filter(Boolean).length
        return (socialFields / 2) * 100
      case "performance":
        return knowledgeBase.performance.salesTrends ? 100 : 0
      case "assets":
        return knowledgeBase.creativeAssets.productPhotos.length > 0 ? 100 : 0
      default:
        return 0
    }
  }

  const overallProgress = steps.reduce((total, step) => total + getStepProgress(step.id), 0) / steps.length

  const addArrayItem = (section: keyof KnowledgeBaseData, field: string, value: string) => {
    setKnowledgeBase(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...((prev[section] as any)[field] as string[]), value]
      }
    }))
  }

  const removeArrayItem = (section: keyof KnowledgeBaseData, field: string, index: number) => {
    setKnowledgeBase(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: ((prev[section] as any)[field] as string[]).filter((_, i) => i !== index)
      }
    }))
  }

  const updateField = (section: keyof KnowledgeBaseData, field: string, value: any) => {
    setKnowledgeBase(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      } as any
    }))
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Knowledge Base</h1>
          <p className="text-muted-foreground mt-1">
            Share your brand intelligence to supercharge AI research
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-3 py-1">
            {Math.round(overallProgress)}% Complete
          </Badge>
          <Button data-testid="button-save-knowledge-base">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Save Progress
          </Button>
        </div>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Setup Progress</CardTitle>
          <CardDescription>Complete all sections to unlock maximum AI performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="mb-4" data-testid="progress-overall" />
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
            {steps.map((step, index) => {
              const progress = getStepProgress(step.id)
              const StepIcon = step.icon
              return (
                <Button
                  key={step.id}
                  variant={currentStep === index ? "default" : "outline"}
                  className="flex flex-col h-auto p-3 gap-2"
                  onClick={() => setCurrentStep(index)}
                  data-testid={`button-step-${step.id}`}
                >
                  <div className="flex items-center gap-2">
                    <StepIcon className="h-4 w-4" />
                    {progress === 100 && <CheckCircle2 className="h-3 w-3 text-green-600" />}
                  </div>
                  <div className="text-xs text-center">{step.title}</div>
                  <Progress value={progress} className="h-1" />
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(steps[currentStep].icon, { className: "h-5 w-5" })}
            {steps[currentStep].title}
          </CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Brand Fundamentals */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="website-url">Website URL *</Label>
                  <Input
                    id="website-url"
                    placeholder="https://yourbrand.com"
                    value={knowledgeBase.brandFundamentals.websiteUrl}
                    onChange={(e) => updateField("brandFundamentals", "websiteUrl", e.target.value)}
                    data-testid="input-website-url"
                  />
                  <p className="text-xs text-muted-foreground">AI will analyze your website for brand understanding</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand-guidelines">Brand Guidelines</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <Button variant="outline" size="sm" data-testid="button-upload-guidelines">
                      Upload PDF/Doc
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">Style guide, colors, fonts, tone</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand-voice">Brand Voice & Tone *</Label>
                <Textarea
                  id="brand-voice"
                  placeholder="Describe your brand's personality... (e.g., 'Friendly and approachable, professional but not stuffy, speaks directly to busy parents')"
                  value={knowledgeBase.brandFundamentals.brandVoice}
                  onChange={(e) => updateField("brandFundamentals", "brandVoice", e.target.value)}
                  data-testid="textarea-brand-voice"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mission-statement">Mission Statement *</Label>
                <Textarea
                  id="mission-statement"
                  placeholder="What is your brand's mission and core purpose?"
                  value={knowledgeBase.brandFundamentals.missionStatement}
                  onChange={(e) => updateField("brandFundamentals", "missionStatement", e.target.value)}
                  data-testid="textarea-mission-statement"
                />
              </div>

              <div className="space-y-2">
                <Label>Brand Values</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {knowledgeBase.brandFundamentals.brandValues.map((value, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {value}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeArrayItem("brandFundamentals", "brandValues", index)}
                        data-testid={`button-remove-value-${index}`}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add brand value (e.g., Sustainability, Innovation)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        addArrayItem("brandFundamentals", "brandValues", e.currentTarget.value.trim())
                        e.currentTarget.value = ''
                      }
                    }}
                    data-testid="input-brand-value"
                  />
                  <Button size="sm" variant="outline" data-testid="button-add-value">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Products & Services */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Product Links *</Label>
                <div className="space-y-2">
                  {knowledgeBase.products.productLinks.map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <Input value={link} readOnly />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => removeArrayItem("products", "productLinks", index)}
                        data-testid={`button-remove-product-${index}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://yourbrand.com/product-name"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          addArrayItem("products", "productLinks", e.currentTarget.value.trim())
                          e.currentTarget.value = ''
                        }
                      }}
                      data-testid="input-product-link"
                    />
                    <Button size="sm" variant="outline" data-testid="button-add-product">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">AI will analyze product pages for features, benefits, and positioning</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricing-info">Pricing Strategy *</Label>
                <Textarea
                  id="pricing-info"
                  placeholder="Describe your pricing model, price points, and positioning (e.g., 'Premium pricing at $99-199, positioned as high-quality alternative to cheaper competitors')"
                  value={knowledgeBase.products.pricingInfo}
                  onChange={(e) => updateField("products", "pricingInfo", e.target.value)}
                  data-testid="textarea-pricing-info"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Key Benefits *</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {knowledgeBase.products.keyBenefits.map((benefit, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {benefit}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeArrayItem("products", "keyBenefits", index)}
                          data-testid={`button-remove-benefit-${index}`}
                        />
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Benefit (e.g., Saves time, Improves health)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        addArrayItem("products", "keyBenefits", e.currentTarget.value.trim())
                        e.currentTarget.value = ''
                      }
                    }}
                    data-testid="input-key-benefit"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unique Selling Points</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {knowledgeBase.products.usps.map((usp, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {usp}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeArrayItem("products", "usps", index)}
                          data-testid={`button-remove-usp-${index}`}
                        />
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="USP (e.g., Only organic ingredients, 30-day guarantee)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        addArrayItem("products", "usps", e.currentTarget.value.trim())
                        e.currentTarget.value = ''
                      }
                    }}
                    data-testid="input-usp"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Target Audience */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="current-personas">Current Customer Personas *</Label>
                <Textarea
                  id="current-personas"
                  placeholder="Describe your main customer segments... (e.g., 'Primary: Working moms 28-45, household income $75k+, values convenience and quality. Secondary: Health-conscious millennials 25-35, urban, willing to pay premium for organic')"
                  value={knowledgeBase.audience.currentPersonas}
                  onChange={(e) => updateField("audience", "currentPersonas", e.target.value)}
                  rows={4}
                  data-testid="textarea-personas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="demographics">Demographics & Psychographics *</Label>
                <Textarea
                  id="demographics"
                  placeholder="Age, gender, income, location, interests, pain points, shopping behavior..."
                  value={knowledgeBase.audience.demographics}
                  onChange={(e) => updateField("audience", "demographics", e.target.value)}
                  rows={3}
                  data-testid="textarea-demographics"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Customer Feedback</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                    <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <Button variant="outline" size="sm" data-testid="button-upload-feedback">
                      Upload Reviews/Surveys
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">Reviews, testimonials, survey results</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Market Research</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                    <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <Button variant="outline" size="sm" data-testid="button-upload-research">
                      Upload Research
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">Market studies, audience insights</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Competitor Intelligence */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Main Competitors *</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {knowledgeBase.competitors.mainCompetitors.map((competitor, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {competitor}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeArrayItem("competitors", "mainCompetitors", index)}
                        data-testid={`button-remove-competitor-${index}`}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Competitor brand name"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        addArrayItem("competitors", "mainCompetitors", e.currentTarget.value.trim())
                        e.currentTarget.value = ''
                      }
                    }}
                    data-testid="input-competitor"
                  />
                  <Button size="sm" variant="outline" data-testid="button-add-competitor">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">AI will research these competitors for positioning insights</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Competitor Analysis</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                    <Target className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <Button variant="outline" size="sm" data-testid="button-upload-competitor-analysis">
                      Upload Analysis
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">Competitive analysis documents</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Competitor Ads</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                    <Eye className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <Button variant="outline" size="sm" data-testid="button-upload-competitor-ads">
                      Upload Ad Examples
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">Screenshots, videos of competitor ads</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Media */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram-handle">Instagram Handle *</Label>
                  <Input
                    id="instagram-handle"
                    placeholder="@yourbrand"
                    value={knowledgeBase.socialMedia.instagramHandle}
                    onChange={(e) => updateField("socialMedia", "instagramHandle", e.target.value)}
                    data-testid="input-instagram"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook-page">Facebook Page</Label>
                  <Input
                    id="facebook-page"
                    placeholder="facebook.com/yourbrand"
                    value={knowledgeBase.socialMedia.facebookPage}
                    onChange={(e) => updateField("socialMedia", "facebookPage", e.target.value)}
                    data-testid="input-facebook"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiktok-handle">TikTok Handle</Label>
                  <Input
                    id="tiktok-handle"
                    placeholder="@yourbrand"
                    value={knowledgeBase.socialMedia.tiktokHandle}
                    onChange={(e) => updateField("socialMedia", "tiktokHandle", e.target.value)}
                    data-testid="input-tiktok"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content-style">Content Style & Guidelines *</Label>
                <Textarea
                  id="content-style"
                  placeholder="Describe your social media style... (e.g., 'Bright, lifestyle-focused imagery. User-generated content featuring real customers. Captions are conversational and include questions to drive engagement. Always include product in use shots')"
                  value={knowledgeBase.socialMedia.contentStyle}
                  onChange={(e) => updateField("socialMedia", "contentStyle", e.target.value)}
                  rows={4}
                  data-testid="textarea-content-style"
                />
                <p className="text-xs text-muted-foreground">AI will analyze your social presence and match this style</p>
              </div>
            </div>
          )}

          {/* Performance Data */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sales-trends">Sales Trends & Seasonality *</Label>
                <Textarea
                  id="sales-trends"
                  placeholder="Describe your sales patterns... (e.g., 'Peak sales November-January (holiday season), summer lull June-August. Friday-Sunday best performing days. Product A outsells B 3:1. Average order value $85')"
                  value={knowledgeBase.performance.salesTrends}
                  onChange={(e) => updateField("performance", "salesTrends", e.target.value)}
                  rows={3}
                  data-testid="textarea-sales-trends"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Previous Ad Performance</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                    <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <Button variant="outline" size="sm" data-testid="button-upload-ad-data">
                      Upload Ad Data
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">Meta Ads export, performance reports</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Website Analytics</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                    <Globe className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <Button variant="outline" size="sm" data-testid="button-upload-analytics">
                      Upload Analytics
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">Google Analytics reports, conversion data</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Creative Assets */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Product Photos *</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                    <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <Button variant="outline" size="sm" data-testid="button-upload-product-photos">
                      Upload Photos
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">High-res product shots, different angles</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Lifestyle Images</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                    <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <Button variant="outline" size="sm" data-testid="button-upload-lifestyle">
                      Upload Images
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">Product in use, customer photos</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Video Content</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                    <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <Button variant="outline" size="sm" data-testid="button-upload-videos">
                      Upload Videos
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">Product demos, testimonials, B-roll</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Asset Guidelines</h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Upload high-resolution images (min 1080x1080 for square, 1080x1920 for vertical)</li>
                  <li>• Include variety: product shots, lifestyle, behind-the-scenes, customer UGC</li>
                  <li>• Videos should be 15-60 seconds, good lighting, clear audio</li>
                  <li>• AI will analyze these assets to understand your visual brand language</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              data-testid="button-previous"
            >
              Previous
            </Button>
            <Button 
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={currentStep === steps.length - 1}
              data-testid="button-next"
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Completion Summary */}
      {overallProgress > 80 && (
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle2 className="h-5 w-5" />
              Knowledge Base Nearly Complete!
            </CardTitle>
            <CardDescription>
              You've provided {Math.round(overallProgress)}% of the recommended information. Your AI agents are ready to deliver highly targeted results.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" data-testid="button-activate-agents">
              <Zap className="h-4 w-4 mr-2" />
              Activate AI Agents
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}