import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import React from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { queryClient, apiRequest } from "@/lib/queryClient"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
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
  Zap,
  Save
} from "lucide-react"

import type { KnowledgeBase, UpdateKnowledgeBase } from "@shared/schema"
import { FileUpload, type FileUploadHandle } from "@/components/file-upload"
import type { UploadedFilesStructure } from "@/lib/supabase"

interface KnowledgeBaseData {
  websiteUrl: string
  brandVoice: string
  missionStatement: string
  brandValues: string[]
  productLinks: string[]
  pricingInfo: string
  keyBenefits: string[]
  usps: string[]
  currentPersonas: string
  demographics: string
  mainCompetitors: string[]
  instagramHandle: string
  facebookPage: string
  tiktokHandle: string
  contentStyle: string
  salesTrends: string
  completionPercentage: number
  uploadedFiles: UploadedFilesStructure
}

const initialKnowledgeBaseState: KnowledgeBaseData = {
  websiteUrl: "",
  brandVoice: "",
  missionStatement: "",
  brandValues: [],
  productLinks: [],
  pricingInfo: "",
  keyBenefits: [],
  usps: [],
  currentPersonas: "",
  demographics: "",
  mainCompetitors: [],
  instagramHandle: "",
  facebookPage: "",
  tiktokHandle: "",
  contentStyle: "",
  salesTrends: "",
  completionPercentage: 0,
  uploadedFiles: {}
}

export function KnowledgeBaseDashboard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseData>(initialKnowledgeBaseState)
  
  // Track the saved state to detect changes - initialize to empty state for new users
  const [savedKnowledgeBase, setSavedKnowledgeBase] = useState<KnowledgeBaseData>(initialKnowledgeBaseState)
  
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuth()
  
  // File upload refs for all upload sections
  const brandGuidelinesRef = useRef<FileUploadHandle>(null)
  const customerFeedbackRef = useRef<FileUploadHandle>(null)
  const marketResearchRef = useRef<FileUploadHandle>(null)
  const competitorAnalysisRef = useRef<FileUploadHandle>(null)
  const competitorAdsRef = useRef<FileUploadHandle>(null)
  const adDataRef = useRef<FileUploadHandle>(null)
  const analyticsRef = useRef<FileUploadHandle>(null)
  const productPhotosRef = useRef<FileUploadHandle>(null)
  const lifestyleImagesRef = useRef<FileUploadHandle>(null)
  const videoContentRef = useRef<FileUploadHandle>(null)
  
  // Load existing knowledge base
  const { data: existingKB } = useQuery({
    queryKey: ["/api/knowledge-base"],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/knowledge-base')
        return response.json() as Promise<KnowledgeBase>
      } catch {
        return null
      }
    },
    enabled: isAuthenticated
  })
  
  // Save knowledge base mutation
  const saveKB = useMutation({
    mutationFn: async (data: UpdateKnowledgeBase) => {
      if (existingKB) {
        const response = await apiRequest("PATCH", "/api/knowledge-base", data)
        return response.json()
      } else {
        const response = await apiRequest("POST", "/api/knowledge-base", data)
        return response.json()
      }
    },
    onSuccess: () => {
      // Always invalidate cache, but no toast - toast handled per call
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-base"] })
    }
    // No global onError - errors handled per call to avoid toast spam
  })
  
  // Load existing data when available
  useEffect(() => {
    if (existingKB) {
      const loadedData = {
        websiteUrl: existingKB.websiteUrl || "",
        brandVoice: existingKB.brandVoice || "",
        missionStatement: existingKB.missionStatement || "",
        brandValues: existingKB.brandValues || [],
        productLinks: existingKB.productLinks || [],
        pricingInfo: existingKB.pricingInfo || "",
        keyBenefits: existingKB.keyBenefits || [],
        usps: existingKB.usps || [],
        currentPersonas: existingKB.currentPersonas || "",
        demographics: existingKB.demographics || "",
        mainCompetitors: existingKB.mainCompetitors || [],
        instagramHandle: existingKB.instagramHandle || "",
        facebookPage: existingKB.facebookPage || "",
        tiktokHandle: existingKB.tiktokHandle || "",
        contentStyle: existingKB.contentStyle || "",
        salesTrends: existingKB.salesTrends || "",
        completionPercentage: existingKB.completionPercentage || 0,
        uploadedFiles: (existingKB.uploadedFiles as UploadedFilesStructure) || {}
      }
      setKnowledgeBase(loadedData)
      setSavedKnowledgeBase(loadedData)
    }
  }, [existingKB])
  
  // Check if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(knowledgeBase) !== JSON.stringify(savedKnowledgeBase)
  }, [knowledgeBase, savedKnowledgeBase])

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
          knowledgeBase.websiteUrl,
          knowledgeBase.brandVoice,
          knowledgeBase.missionStatement
        ].filter(Boolean).length
        return (brandFields / 3) * 100
      case "products":
        const productFields = [
          knowledgeBase.productLinks.length > 0,
          knowledgeBase.pricingInfo,
          knowledgeBase.keyBenefits.length > 0
        ].filter(Boolean).length
        return (productFields / 3) * 100
      case "audience":
        const audienceFields = [
          knowledgeBase.currentPersonas,
          knowledgeBase.demographics
        ].filter(Boolean).length
        return (audienceFields / 2) * 100
      case "competitors":
        return knowledgeBase.mainCompetitors.length > 0 ? 100 : 0
      case "social":
        const socialFields = [
          knowledgeBase.instagramHandle,
          knowledgeBase.contentStyle
        ].filter(Boolean).length
        return (socialFields / 2) * 100
      case "performance":
        return knowledgeBase.salesTrends ? 100 : 0
      case "assets":
        return 50 // Placeholder since we don't have file storage yet
      default:
        return 0
    }
  }

  // Check if required fields are missing for visual indicators
  const getRequiredFieldsMissing = () => {
    const missing = {
      websiteUrl: !knowledgeBase.websiteUrl.trim(),
      brandVoice: !knowledgeBase.brandVoice.trim(),
      missionStatement: !knowledgeBase.missionStatement.trim(),
      productLinks: knowledgeBase.productLinks.length === 0,
      pricingInfo: !knowledgeBase.pricingInfo.trim(),
      keyBenefits: knowledgeBase.keyBenefits.length === 0,
      currentPersonas: !knowledgeBase.currentPersonas.trim(),
      demographics: !knowledgeBase.demographics.trim(),
      mainCompetitors: knowledgeBase.mainCompetitors.length === 0,
      instagramHandle: !knowledgeBase.instagramHandle.trim(),
      contentStyle: !knowledgeBase.contentStyle.trim(),
      salesTrends: !knowledgeBase.salesTrends.trim()
    }
    return missing
  }
  
  const requiredFieldsMissing = getRequiredFieldsMissing()
  
  // Calculate progress based on required steps only (excluding assets step)
  const requiredSteps = steps.slice(0, 6) // Exclude Creative Assets step
  const overallProgress = requiredSteps.reduce((total, step) => total + getStepProgress(step.id), 0) / requiredSteps.length
  
  // Check completion based on required fields, not percentage
  const isCompleted = !Object.values(requiredFieldsMissing).some(Boolean)

  const addArrayItem = (field: keyof KnowledgeBaseData, value: string) => {
    setKnowledgeBase(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), value]
    }))
  }

  const removeArrayItem = (field: keyof KnowledgeBaseData, index: number) => {
    setKnowledgeBase(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }))
  }

  const updateField = (field: keyof KnowledgeBaseData, value: any) => {
    setKnowledgeBase(prev => ({
      ...prev,
      [field]: value
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
        <Badge 
          variant={isCompleted ? "default" : "secondary"} 
          className={`px-3 py-1 ${isCompleted ? 'bg-green-600 text-white' : ''}`}
        >
          {Math.round(overallProgress)}% Complete
        </Badge>
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
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                {React.createElement(steps[currentStep].icon, { className: "h-5 w-5" })}
                {steps[currentStep].title}
              </CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </div>
            <Button 
              onClick={async () => {
                try {
                  // Upload all pending files before saving
                  const uploadPromises = [
                    brandGuidelinesRef.current?.uploadPendingFiles(),
                    customerFeedbackRef.current?.uploadPendingFiles(),
                    marketResearchRef.current?.uploadPendingFiles(),
                    competitorAnalysisRef.current?.uploadPendingFiles(),
                    competitorAdsRef.current?.uploadPendingFiles(),
                    adDataRef.current?.uploadPendingFiles(),
                    analyticsRef.current?.uploadPendingFiles(),
                    productPhotosRef.current?.uploadPendingFiles(),
                    lifestyleImagesRef.current?.uploadPendingFiles(),
                    videoContentRef.current?.uploadPendingFiles(),
                  ].filter(Boolean)

                  await Promise.all(uploadPromises)

                  // Save data after uploads complete
                  const updatedData = {
                    ...knowledgeBase,
                    completionPercentage: Math.round(overallProgress)
                  }
                  saveKB.mutate(updatedData, {
                    onSuccess: () => {
                      setSavedKnowledgeBase(updatedData)
                      toast({
                        description: "Progress saved successfully",
                        duration: 2000,
                      })
                    },
                    onError: () => {
                      toast({
                        title: "Save Failed",
                        description: "Unable to save your progress. Please try again.",
                        variant: "destructive"
                      })
                    }
                  })
                } catch (error) {
                  toast({
                    title: "Upload Failed",
                    description: "Failed to upload files. Please try again.",
                    variant: "destructive"
                  })
                }
              }}
              disabled={!hasUnsavedChanges || saveKB.isPending}
              data-testid="button-save"
            >
              <Save className="h-4 w-4 mr-2" />
              {saveKB.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Brand Fundamentals */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="website-url" className={requiredFieldsMissing.websiteUrl ? 'text-red-600 dark:text-red-400' : ''}>
                    Website URL *
                  </Label>
                  <Input
                    id="website-url"
                    placeholder="https://yourbrand.com"
                    value={knowledgeBase.websiteUrl}
                    onChange={(e) => updateField("websiteUrl", e.target.value)}
                    className={requiredFieldsMissing.websiteUrl ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                    aria-invalid={requiredFieldsMissing.websiteUrl}
                    data-testid="input-website-url"
                  />
                  {requiredFieldsMissing.websiteUrl && (
                    <p className="text-xs text-red-600 dark:text-red-400">Website URL is required</p>
                  )}
                  <p className="text-xs text-muted-foreground">AI will analyze your website for brand understanding</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand-guidelines">Brand Guidelines</Label>
                  <FileUpload
                    ref={brandGuidelinesRef}
                    files={knowledgeBase.uploadedFiles}
                    onFilesChange={(files) => updateField("uploadedFiles", files)}
                    bucket="knowledge-base"
                    folder="brand-guidelines"
                    categoryKey="brand-guidelines"
                    accept=".pdf,.doc,.docx"
                    testId="button-upload-guidelines"
                    label="Upload PDF/Doc"
                    description="Style guide, colors, fonts, tone"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand-voice" className={requiredFieldsMissing.brandVoice ? 'text-red-600 dark:text-red-400' : ''}>
                  Brand Voice & Tone *
                </Label>
                <Textarea
                  id="brand-voice"
                  placeholder="Describe your brand's personality... (e.g., 'Friendly and approachable, professional but not stuffy, speaks directly to busy parents')"
                  value={knowledgeBase.brandVoice}
                  onChange={(e) => updateField("brandVoice", e.target.value)}
                  className={requiredFieldsMissing.brandVoice ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  data-testid="textarea-brand-voice"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mission-statement" className={requiredFieldsMissing.missionStatement ? 'text-red-600 dark:text-red-400' : ''}>
                  Mission Statement *
                </Label>
                <Textarea
                  id="mission-statement"
                  placeholder="What is your brand's mission and core purpose?"
                  value={knowledgeBase.missionStatement}
                  onChange={(e) => updateField("missionStatement", e.target.value)}
                  className={requiredFieldsMissing.missionStatement ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  data-testid="textarea-mission-statement"
                />
              </div>

              <div className="space-y-2">
                <Label>Brand Values</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {knowledgeBase.brandValues.map((value, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1 max-w-xs" title={value}>
                      <span className="truncate">{value.length > 30 ? value.substring(0, 30) + '...' : value}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer flex-shrink-0" 
                        onClick={() => removeArrayItem("brandValues", index)}
                        data-testid={`button-remove-value-${index}`}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a brand value and press Enter or click + to add"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          addArrayItem("brandValues", e.currentTarget.value.trim())
                          e.currentTarget.value = ''
                        }
                      }}
                      data-testid="input-brand-value"
                    />
                    <Button size="sm" variant="default" data-testid="button-add-value" onClick={() => {
                      const input = document.querySelector('[data-testid="input-brand-value"]') as HTMLInputElement
                      if (input && input.value.trim()) {
                        addArrayItem("brandValues", input.value.trim())
                        input.value = ''
                      }
                    }}>
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Examples: Sustainability, Innovation, Quality, Trust</p>
                </div>
              </div>
            </div>
          )}

          {/* Products & Services */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className={requiredFieldsMissing.productLinks ? 'text-red-600 dark:text-red-400' : ''}>
                  Product Links *
                </Label>
                <div className="space-y-2">
                  {knowledgeBase.productLinks.map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <Input value={link} readOnly />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => removeArrayItem("productLinks", index)}
                        data-testid={`button-remove-product-${index}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter product URL and press Enter or click + to add"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            addArrayItem("productLinks", e.currentTarget.value.trim())
                            e.currentTarget.value = ''
                          }
                        }}
                        data-testid="input-product-link"
                      />
                      <Button size="sm" variant="default" data-testid="button-add-product" onClick={() => {
                        const input = document.querySelector('[data-testid="input-product-link"]') as HTMLInputElement
                        if (input && input.value.trim()) {
                          addArrayItem("productLinks", input.value.trim())
                          input.value = ''
                        }
                      }}>
                        <Plus className="h-4 w-4" />
                        Add
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Add each product page URL separately (required for AI analysis)</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">AI will analyze product pages for features, benefits, and positioning</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricing-info" className={requiredFieldsMissing.pricingInfo ? 'text-red-600 dark:text-red-400' : ''}>
                  Pricing Strategy *
                </Label>
                <Textarea
                  id="pricing-info"
                  placeholder="Describe your pricing model, price points, and positioning (e.g., 'Premium pricing at $99-199, positioned as high-quality alternative to cheaper competitors')"
                  value={knowledgeBase.pricingInfo}
                  onChange={(e) => updateField("pricingInfo", e.target.value)}
                  className={requiredFieldsMissing.pricingInfo ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  data-testid="textarea-pricing-info"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className={requiredFieldsMissing.keyBenefits ? 'text-red-600 dark:text-red-400' : ''}>
                    Key Benefits *
                  </Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {knowledgeBase.keyBenefits.map((benefit, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1 max-w-xs" title={benefit}>
                        <span className="truncate">{benefit.length > 30 ? benefit.substring(0, 30) + '...' : benefit}</span>
                        <X 
                          className="h-3 w-3 cursor-pointer flex-shrink-0" 
                          onClick={() => removeArrayItem("keyBenefits", index)}
                          data-testid={`button-remove-benefit-${index}`}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a benefit and press Enter or click + to add"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            addArrayItem("keyBenefits", e.currentTarget.value.trim())
                            e.currentTarget.value = ''
                          }
                        }}
                        data-testid="input-key-benefit"
                      />
                      <Button size="sm" variant="default" data-testid="button-add-benefit" onClick={() => {
                        const input = document.querySelector('[data-testid="input-key-benefit"]') as HTMLInputElement
                        if (input && input.value.trim()) {
                          addArrayItem("keyBenefits", input.value.trim())
                          input.value = ''
                        }
                      }}>
                        <Plus className="h-4 w-4" />
                        Add
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Examples: Saves time, Improves health, Easy to use</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Unique Selling Points</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {knowledgeBase.usps.map((usp, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1 max-w-xs" title={usp}>
                        <span className="truncate">{usp.length > 30 ? usp.substring(0, 30) + '...' : usp}</span>
                        <X 
                          className="h-3 w-3 cursor-pointer flex-shrink-0" 
                          onClick={() => removeArrayItem("usps", index)}
                          data-testid={`button-remove-usp-${index}`}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a unique selling point and press Enter or click + to add"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            addArrayItem("usps", e.currentTarget.value.trim())
                            e.currentTarget.value = ''
                          }
                        }}
                        data-testid="input-usp"
                      />
                      <Button size="sm" variant="default" data-testid="button-add-usp" onClick={() => {
                        const input = document.querySelector('[data-testid="input-usp"]') as HTMLInputElement
                        if (input && input.value.trim()) {
                          addArrayItem("usps", input.value.trim())
                          input.value = ''
                        }
                      }}>
                        <Plus className="h-4 w-4" />
                        Add
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Examples: Only organic ingredients, 30-day guarantee, Free shipping</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">💡 Keep entries short (1-5 words) for better display. Long text will be truncated.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Target Audience */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="current-personas" className={requiredFieldsMissing.currentPersonas ? 'text-red-600 dark:text-red-400' : ''}>
                  Current Customer Personas *
                </Label>
                <Textarea
                  id="current-personas"
                  placeholder="Describe your main customer segments... (e.g., 'Primary: Working moms 28-45, household income $75k+, values convenience and quality. Secondary: Health-conscious millennials 25-35, urban, willing to pay premium for organic')"
                  value={knowledgeBase.currentPersonas}
                  onChange={(e) => updateField("currentPersonas", e.target.value)}
                  className={requiredFieldsMissing.currentPersonas ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  rows={4}
                  data-testid="textarea-personas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="demographics" className={requiredFieldsMissing.demographics ? 'text-red-600 dark:text-red-400' : ''}>
                  Demographics & Psychographics *
                </Label>
                <Textarea
                  id="demographics"
                  placeholder="Age, gender, income, location, interests, pain points, shopping behavior..."
                  value={knowledgeBase.demographics}
                  onChange={(e) => updateField("demographics", e.target.value)}
                  className={requiredFieldsMissing.demographics ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  rows={3}
                  data-testid="textarea-demographics"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Customer Feedback</Label>
                  <FileUpload
                    ref={customerFeedbackRef}
                    files={knowledgeBase.uploadedFiles}
                    onFilesChange={(files) => updateField("uploadedFiles", files)}
                    bucket="knowledge-base"
                    folder="customer-feedback"
                    categoryKey="customer-feedback"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                    testId="button-upload-feedback"
                    label="Upload Reviews/Surveys"
                    description="Reviews, testimonials, survey results"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Market Research</Label>
                  <FileUpload
                    ref={marketResearchRef}
                    files={knowledgeBase.uploadedFiles}
                    onFilesChange={(files) => updateField("uploadedFiles", files)}
                    bucket="knowledge-base"
                    folder="market-research"
                    categoryKey="market-research"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                    testId="button-upload-research"
                    label="Upload Research"
                    description="Market studies, audience insights"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Competitor Intelligence */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className={requiredFieldsMissing.mainCompetitors ? 'text-red-600 dark:text-red-400' : ''}>
                  Main Competitors *
                </Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {knowledgeBase.mainCompetitors.map((competitor, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1 max-w-xs" title={competitor}>
                      <span className="truncate">{competitor.length > 30 ? competitor.substring(0, 30) + '...' : competitor}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer flex-shrink-0" 
                        onClick={() => removeArrayItem("mainCompetitors", index)}
                        data-testid={`button-remove-competitor-${index}`}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type competitor name and press Enter or click + to add"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          addArrayItem("mainCompetitors", e.currentTarget.value.trim())
                          e.currentTarget.value = ''
                        }
                      }}
                      data-testid="input-competitor"
                    />
                    <Button size="sm" variant="default" data-testid="button-add-competitor" onClick={() => {
                      const input = document.querySelector('[data-testid="input-competitor"]') as HTMLInputElement
                      if (input && input.value.trim()) {
                        addArrayItem("mainCompetitors", input.value.trim())
                        input.value = ''
                      }
                    }}>
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Add your main direct competitors (brand names only)</p>
                </div>
                <p className="text-xs text-muted-foreground">AI will research these competitors for positioning insights</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Competitor Analysis</Label>
                  <FileUpload
                    ref={competitorAnalysisRef}
                    files={knowledgeBase.uploadedFiles}
                    onFilesChange={(files) => updateField("uploadedFiles", files)}
                    bucket="knowledge-base"
                    folder="competitor-analysis"
                    categoryKey="competitor-analysis"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    testId="button-upload-competitor-analysis"
                    label="Upload Analysis"
                    description="Competitive analysis documents"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Competitor Ads</Label>
                  <FileUpload
                    ref={competitorAdsRef}
                    files={knowledgeBase.uploadedFiles}
                    onFilesChange={(files) => updateField("uploadedFiles", files)}
                    bucket="knowledge-base"
                    folder="competitor-ads"
                    categoryKey="competitor-ads"
                    accept="image/*,video/*"
                    testId="button-upload-competitor-ads"
                    label="Upload Ad Examples"
                    description="Screenshots, videos of competitor ads"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Social Media */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram-handle" className={requiredFieldsMissing.instagramHandle ? 'text-red-600 dark:text-red-400' : ''}>
                    Instagram Handle *
                  </Label>
                  <Input
                    id="instagram-handle"
                    placeholder="@yourbrand"
                    value={knowledgeBase.instagramHandle}
                    onChange={(e) => updateField("instagramHandle", e.target.value)}
                    className={requiredFieldsMissing.instagramHandle ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                    data-testid="input-instagram"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook-page">Facebook Page</Label>
                  <Input
                    id="facebook-page"
                    placeholder="facebook.com/yourbrand"
                    value={knowledgeBase.facebookPage}
                    onChange={(e) => updateField("facebookPage", e.target.value)}
                    data-testid="input-facebook"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiktok-handle">TikTok Handle</Label>
                  <Input
                    id="tiktok-handle"
                    placeholder="@yourbrand"
                    value={knowledgeBase.tiktokHandle}
                    onChange={(e) => updateField("tiktokHandle", e.target.value)}
                    data-testid="input-tiktok"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content-style" className={requiredFieldsMissing.contentStyle ? 'text-red-600 dark:text-red-400' : ''}>
                  Content Style & Guidelines *
                </Label>
                <Textarea
                  id="content-style"
                  placeholder="Describe your social media style... (e.g., 'Bright, lifestyle-focused imagery. User-generated content featuring real customers. Captions are conversational and include questions to drive engagement. Always include product in use shots')"
                  value={knowledgeBase.contentStyle}
                  onChange={(e) => updateField("contentStyle", e.target.value)}
                  className={requiredFieldsMissing.contentStyle ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
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
                <Label htmlFor="sales-trends" className={requiredFieldsMissing.salesTrends ? 'text-red-600 dark:text-red-400' : ''}>
                  Sales Trends & Seasonality *
                </Label>
                <Textarea
                  id="sales-trends"
                  placeholder="Describe your sales patterns... (e.g., 'Peak sales November-January (holiday season), summer lull June-August. Friday-Sunday best performing days. Product A outsells B 3:1. Average order value $85')"
                  value={knowledgeBase.salesTrends}
                  onChange={(e) => updateField("salesTrends", e.target.value)}
                  className={requiredFieldsMissing.salesTrends ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  rows={3}
                  data-testid="textarea-sales-trends"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Previous Ad Performance</Label>
                  <FileUpload
                    ref={adDataRef}
                    files={knowledgeBase.uploadedFiles}
                    onFilesChange={(files) => updateField("uploadedFiles", files)}
                    bucket="knowledge-base"
                    folder="ad-data"
                    categoryKey="ad-data"
                    accept=".pdf,.csv,.xls,.xlsx"
                    testId="button-upload-ad-data"
                    label="Upload Ad Data"
                    description="Meta Ads export, performance reports"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Website Analytics</Label>
                  <FileUpload
                    ref={analyticsRef}
                    files={knowledgeBase.uploadedFiles}
                    onFilesChange={(files) => updateField("uploadedFiles", files)}
                    bucket="knowledge-base"
                    folder="analytics"
                    categoryKey="analytics"
                    accept=".pdf,.csv,.xls,.xlsx"
                    testId="button-upload-analytics"
                    label="Upload Analytics"
                    description="Google Analytics reports, conversion data"
                  />
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
                  <FileUpload
                    ref={productPhotosRef}
                    files={knowledgeBase.uploadedFiles}
                    onFilesChange={(files) => updateField("uploadedFiles", files)}
                    bucket="knowledge-base"
                    folder="product-photos"
                    categoryKey="product-photos"
                    accept="image/*"
                    testId="button-upload-product-photos"
                    label="Upload Photos"
                    description="High-res product shots, different angles"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lifestyle Images</Label>
                  <FileUpload
                    ref={lifestyleImagesRef}
                    files={knowledgeBase.uploadedFiles}
                    onFilesChange={(files) => updateField("uploadedFiles", files)}
                    bucket="knowledge-base"
                    folder="lifestyle-images"
                    categoryKey="lifestyle-images"
                    accept="image/*"
                    testId="button-upload-lifestyle"
                    label="Upload Images"
                    description="Product in use, customer photos"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Video Content</Label>
                  <FileUpload
                    ref={videoContentRef}
                    files={knowledgeBase.uploadedFiles}
                    onFilesChange={(files) => updateField("uploadedFiles", files)}
                    bucket="knowledge-base"
                    folder="video-content"
                    categoryKey="video-content"
                    accept="video/*"
                    testId="button-upload-videos"
                    label="Upload Videos"
                    description="Product demos, testimonials, B-roll"
                  />
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
          <div className="flex items-center justify-between pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                setCurrentStep(Math.max(0, currentStep - 1))
              }}
              disabled={currentStep === 0 || hasUnsavedChanges}
              data-testid="button-previous"
            >
              Previous
            </Button>
            
            <Button 
              onClick={() => {
                setCurrentStep(Math.min(steps.length - 1, currentStep + 1))
              }}
              disabled={currentStep === steps.length - 1 || hasUnsavedChanges}
              data-testid="button-next"
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Completion Summary */}
      {overallProgress > 80 && (
        <Card className={isCompleted ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20" : "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20"}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isCompleted ? 'text-green-800 dark:text-green-200' : 'text-yellow-800 dark:text-yellow-200'}`}>
              <CheckCircle2 className="h-5 w-5" />
              {isCompleted ? 'Knowledge Base Complete!' : 'Knowledge Base Nearly Complete!'}
            </CardTitle>
            <CardDescription>
              {isCompleted 
                ? 'Perfect! You\'ve provided all the essential brand intelligence. Your AI agents are fully activated and ready to deliver highly targeted results.' 
                : `You've provided ${Math.round(overallProgress)}% of the recommended information. Complete all required fields to unlock maximum AI performance.`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isCompleted ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Auto-saved and ready to use</span>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700" data-testid="button-activate-agents">
                  <Zap className="h-4 w-4 mr-2" />
                  AI Agents Activated
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                  Missing required fields in red above
                </div>
                <Button className="w-full" variant="outline" disabled data-testid="button-activate-agents">
                  <Zap className="h-4 w-4 mr-2" />
                  Complete Required Fields to Activate
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
    </div>
  )
}