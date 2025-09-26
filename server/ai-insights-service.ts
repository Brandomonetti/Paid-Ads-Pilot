import OpenAI from "openai";
import type { MetaAdsService } from "./meta-ads-service";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface PerformanceData {
  spend: number;
  revenue: number;
  roas: number;
  cpm: number;
  ctr: number;
  cpc: number;
  impressions: number;
  clicks: number;
  purchases: number;
  hookRate?: number;
  thumbstopRate?: number;
}

interface AIInsightRequest {
  entityType: 'account' | 'campaign' | 'adset' | 'ad';
  entityId: string;
  entityName: string;
  currentMetrics: PerformanceData;
  historicalData?: PerformanceData[];
  benchmarks?: {
    industryRoas: number;
    industryCtr: number;
    industryCpm: number;
  };
}

interface AIInsightResponse {
  recommendation: string;
  reasoning: string;
  action: 'scale' | 'pause' | 'wait' | 'optimize' | 'creative-refresh';
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  dataAnalysis: {
    keyMetrics: string[];
    trends: string[];
    benchmarkComparison: string[];
  };
  projectedImpact: {
    expectedRoasChange: number;
    expectedSpendChange: number;
    timeframe: string;
    reasoning: string;
  };
}

export class AIInsightsService {
  async generateInsight(request: AIInsightRequest): Promise<AIInsightResponse> {
    try {
      const prompt = this.buildInsightPrompt(request);

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `You are an 8-figure performance marketing strategist and data scientist with deep expertise in Meta Ads optimization. You analyze ad performance data and provide strategic recommendations based on proven scaling methodologies and creative optimization frameworks.

Your expertise includes:
- Advanced performance analysis using statistical significance testing
- Creative fatigue detection and optimization strategies  
- Audience scaling and expansion methodologies
- Budget optimization and bid management
- Attribution analysis and incrementality testing
- Competitive intelligence and market dynamics

You make data-driven recommendations that balance profitability with growth, considering both short-term performance and long-term account health. Always provide specific, actionable insights with clear reasoning backed by performance data.

Respond with valid JSON in the exact format requested.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        recommendation: result.recommendation || "Monitor performance and optimize as needed",
        reasoning: result.reasoning || "Insufficient data for specific recommendation",
        action: result.action || "wait",
        priority: result.priority || "medium",
        confidence: Math.min(100, Math.max(0, result.confidence || 75)),
        dataAnalysis: {
          keyMetrics: result.dataAnalysis?.keyMetrics || [],
          trends: result.dataAnalysis?.trends || [],
          benchmarkComparison: result.dataAnalysis?.benchmarkComparison || []
        },
        projectedImpact: {
          expectedRoasChange: result.projectedImpact?.expectedRoasChange || 0,
          expectedSpendChange: result.projectedImpact?.expectedSpendChange || 0,
          timeframe: result.projectedImpact?.timeframe || "7-14 days",
          reasoning: result.projectedImpact?.reasoning || "Impact projection requires more data"
        }
      };
    } catch (error) {
      console.error("Error generating AI insight:", error);
      throw new Error(`Failed to generate AI insight: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildInsightPrompt(request: AIInsightRequest): string {
    const { entityType, entityName, currentMetrics, historicalData, benchmarks } = request;

    return `
Analyze the performance data for this ${entityType} and provide strategic recommendations:

ENTITY DETAILS:
- Type: ${entityType.toUpperCase()}
- Name: ${entityName}
- Current Performance Period: Last 7 days

CURRENT METRICS:
- Spend: $${currentMetrics.spend.toLocaleString()}
- Revenue: $${currentMetrics.revenue.toLocaleString()}
- ROAS: ${currentMetrics.roas.toFixed(2)}x
- CPM: $${currentMetrics.cpm.toFixed(2)}
- CTR: ${currentMetrics.ctr.toFixed(2)}%
- CPC: $${currentMetrics.cpc.toFixed(2)}
- Impressions: ${currentMetrics.impressions.toLocaleString()}
- Clicks: ${currentMetrics.clicks.toLocaleString()}
- Purchases: ${currentMetrics.purchases.toLocaleString()}
${currentMetrics.hookRate ? `- Hook Rate: ${currentMetrics.hookRate.toFixed(2)}%` : ''}
${currentMetrics.thumbstopRate ? `- Thumbstop Rate: ${currentMetrics.thumbstopRate.toFixed(2)}%` : ''}

${historicalData && historicalData.length > 0 ? `
HISTORICAL TRENDS (Previous periods):
${historicalData.map((data, index) => `
Period ${index + 1}:
- ROAS: ${data.roas.toFixed(2)}x
- CPM: $${data.cpm.toFixed(2)}
- CTR: ${data.ctr.toFixed(2)}%
- Spend: $${data.spend.toLocaleString()}
`).join('')}
` : ''}

${benchmarks ? `
INDUSTRY BENCHMARKS:
- Industry Average ROAS: ${benchmarks.industryRoas.toFixed(2)}x
- Industry Average CTR: ${benchmarks.industryCtr.toFixed(2)}%  
- Industry Average CPM: $${benchmarks.industryCpm.toFixed(2)}
` : ''}

ANALYSIS FRAMEWORK:
1. Performance Assessment: Evaluate current metrics against profitability thresholds and industry standards
2. Trend Analysis: Identify performance patterns and trajectory changes
3. Optimization Opportunities: Assess creative fatigue, audience saturation, and bid efficiency
4. Strategic Recommendations: Provide specific actions based on data signals

STRATEGIC CONSIDERATIONS:
- For campaigns with ROAS > 3.0x: Consider scaling opportunities
- For campaigns with declining CTR: Evaluate creative refresh needs
- For campaigns with high CPM increases: Assess audience fatigue
- For campaigns with low hook/thumbstop rates: Focus on creative optimization

OUTPUT REQUIREMENTS:
Return a JSON object with this exact structure:
{
  "recommendation": "Specific, actionable recommendation (2-3 sentences)",
  "reasoning": "Detailed explanation of the data signals and strategic logic behind the recommendation",
  "action": "scale|pause|wait|optimize|creative-refresh",
  "priority": "high|medium|low",
  "confidence": 85,
  "dataAnalysis": {
    "keyMetrics": ["List of 3-4 most important performance indicators from the data"],
    "trends": ["List of 2-3 notable trends or patterns observed"],
    "benchmarkComparison": ["List of 2-3 comparisons to benchmarks or expected performance"]
  },
  "projectedImpact": {
    "expectedRoasChange": 0.25,
    "expectedSpendChange": 1500,
    "timeframe": "7-14 days",
    "reasoning": "Explanation of expected outcomes and timeline"
  }
}

PERFORMANCE THRESHOLDS:
- High Priority: ROAS declining > 20% or CPM increasing > 30%
- Scale Signals: Stable ROAS > 3.5x with room for audience expansion
- Pause Signals: ROAS < 1.5x for 3+ days or CPC increasing > 50%
- Creative Refresh Signals: CTR declining > 25% or hook rate < 15%

Provide expert-level strategic analysis that an 8-figure performance marketer would be proud to implement.
`;
  }

  async generateWeeklyObservations(accountData: any[]): Promise<{
    title: string;
    observation: string;
    keyFindings: string[];
    priority: 'high' | 'medium' | 'low';
    impact: string;
    confidence: number;
  }[]> {
    try {
      const prompt = `
Analyze this Meta Ads account performance data and generate 3-5 key weekly observations:

ACCOUNT DATA:
${JSON.stringify(accountData, null, 2)}

Generate strategic observations that would be valuable for an 8-figure eCommerce brand. Focus on:
- Significant performance shifts or anomalies
- Scaling opportunities and risks
- Creative performance patterns
- Audience insights and market trends
- Budget allocation recommendations

Return JSON array with this structure:
[
  {
    "title": "Observation title (5-8 words)",
    "observation": "Detailed observation with specific data points",
    "keyFindings": ["Finding 1", "Finding 2", "Finding 3"],
    "priority": "high|medium|low",
    "impact": "Expected business impact description",
    "confidence": 85
  }
]
`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are an expert performance marketing analyst who generates weekly strategic insights for 8-figure eCommerce brands. Provide data-driven observations with clear business impact."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result.observations || [];
    } catch (error) {
      console.error("Error generating weekly observations:", error);
      return [];
    }
  }
}

export const aiInsightsService = new AIInsightsService();