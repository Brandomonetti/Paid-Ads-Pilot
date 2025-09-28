import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Pause, 
  Play, 
  RefreshCw, 
  Zap,
  Target,
  CheckCircle
} from "lucide-react"

interface AISignal {
  action: "scale" | "pause" | "wait" | "optimize" | "creative-refresh"
  reasoning: string
  confidence: number
  priority: "high" | "medium" | "low"
  detailedAnalysis?: string
  creativeInsight?: string
}

interface AIInsightPanelProps {
  insights: AISignal[]
  entityType: "campaign" | "adset" | "ad" | "account"
  entityName?: string
  isLoading?: boolean
  onRefresh?: () => void
}

function getActionIcon(action: AISignal['action']) {
  switch (action) {
    case 'scale':
      return <TrendingUp className="w-4 h-4" />
    case 'pause':
      return <Pause className="w-4 h-4" />
    case 'optimize':
      return <Target className="w-4 h-4" />
    case 'creative-refresh':
      return <RefreshCw className="w-4 h-4" />
    case 'wait':
      return <CheckCircle className="w-4 h-4" />
    default:
      return <Brain className="w-4 h-4" />
  }
}

function getActionColor(action: AISignal['action']) {
  switch (action) {
    case 'scale':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'pause':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'optimize':
      return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'creative-refresh':
      return 'text-purple-600 bg-purple-50 border-purple-200'
    case 'wait':
      return 'text-gray-600 bg-gray-50 border-gray-200'
    default:
      return 'text-blue-600 bg-blue-50 border-blue-200'
  }
}

function getPriorityColor(priority: AISignal['priority']) {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'low':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getActionLabel(action: AISignal['action']) {
  switch (action) {
    case 'scale':
      return 'Scale Up'
    case 'pause':
      return 'Pause'
    case 'optimize':
      return 'Optimize'
    case 'creative-refresh':
      return 'Refresh Creative'
    case 'wait':
      return 'Monitor'
    default:
      return 'Review'
  }
}

function getEntityDescription(entityType: string) {
  switch (entityType) {
    case 'campaign':
      return 'Strategic campaign insights and scaling opportunities'
    case 'adset':
      return 'Targeting optimization and budget allocation insights'
    case 'ad':
      return 'Creative performance and optimization insights'
    case 'account':
      return 'Account-level strategic observations and trends'
    default:
      return 'AI-powered performance insights'
  }
}

export function AIInsightPanel({ insights, entityType, entityName, isLoading, onRefresh }: AIInsightPanelProps) {
  if (isLoading) {
    return (
      <Card className="w-full" data-testid="insight-panel-loading">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">AI Insights</CardTitle>
          </div>
          <CardDescription>
            Analyzing {entityType} performance...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!insights || insights.length === 0) {
    return (
      <Card className="w-full" data-testid="insight-panel-empty">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">AI Insights</CardTitle>
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="ml-auto"
                data-testid="button-refresh-insights"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>
          <CardDescription>
            {getEntityDescription(entityType)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No insights available for this {entityType}</p>
            <p className="text-sm">Performance data may be insufficient for analysis</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full" data-testid="insight-panel">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-600" />
          <CardTitle className="text-lg">AI Insights</CardTitle>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="ml-auto"
              data-testid="button-refresh-insights"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>
        <CardDescription>
          {getEntityDescription(entityType)}
          {entityName && ` for ${entityName}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="space-y-3" data-testid={`insight-item-${index}`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg border ${getActionColor(insight.action)}`}>
                {getActionIcon(insight.action)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-sm">
                    {getActionLabel(insight.action)}
                  </span>
                  <Badge 
                    variant="secondary" 
                    className={getPriorityColor(insight.priority)}
                    data-testid={`priority-${insight.priority}`}
                  >
                    {insight.priority.toUpperCase()}
                  </Badge>
                  <div className="flex items-center gap-1 ml-auto">
                    <Zap className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs text-gray-600">
                      {insight.confidence}% confidence
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-2">
                  {insight.reasoning}
                </p>
                
                {(insight.detailedAnalysis || insight.creativeInsight) && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Strategic Analysis:</strong>{' '}
                      {insight.detailedAnalysis || insight.creativeInsight}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {index < insights.length - 1 && <Separator />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Smart insights component that aggregates insights from current data
interface SmartInsightsPanelProps {
  data: Array<{ aiSignal?: AISignal, name: string }>
  entityType: "campaign" | "adset" | "ad"
  isLoading?: boolean
  onRefresh?: () => void
}

export function SmartInsightsPanel({ data, entityType, isLoading, onRefresh }: SmartInsightsPanelProps) {
  // Extract insights from current data and prioritize them
  const allInsights = data
    .filter(item => item.aiSignal)
    .map(item => ({ ...item.aiSignal!, entityName: item.name }))
    .sort((a, b) => {
      // Sort by priority (high > medium > low) then by confidence
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      if (a.priority !== b.priority) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return b.confidence - a.confidence
    })
    .slice(0, 5) // Show top 5 insights

  return (
    <AIInsightPanel
      insights={allInsights}
      entityType={entityType}
      isLoading={isLoading}
      onRefresh={onRefresh}
    />
  )
}

// Individual insight card for inline display
interface InsightCardProps {
  insight: AISignal
  entityName: string
  compact?: boolean
}

export function InsightCard({ insight, entityName, compact = false }: InsightCardProps) {
  return (
    <div 
      className={`p-3 rounded-lg border ${getActionColor(insight.action)} ${compact ? 'space-y-1' : 'space-y-2'}`}
      data-testid="insight-card"
    >
      <div className="flex items-center gap-2">
        {getActionIcon(insight.action)}
        <span className={`font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>
          {getActionLabel(insight.action)}
        </span>
        <Badge 
          variant="secondary" 
          className={`${getPriorityColor(insight.priority)} ${compact ? 'text-xs px-1' : ''}`}
        >
          {insight.priority.toUpperCase()}
        </Badge>
        <div className="flex items-center gap-1 ml-auto">
          <span className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>
            {insight.confidence}%
          </span>
        </div>
      </div>
      
      {!compact && (
        <p className="text-sm text-gray-700">
          {insight.reasoning}
        </p>
      )}
      
      {compact && entityName && (
        <p className="text-xs text-gray-600 truncate">
          {entityName}: {insight.reasoning.substring(0, 60)}...
        </p>
      )}
    </div>
  )
}
