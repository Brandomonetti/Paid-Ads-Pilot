import OpenAI from "openai";
import type { Insight, InsertAvatar } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface AvatarGenerationResult {
  avatars: InsertAvatar[];
  summary: {
    totalGenerated: number;
    primarySegments: string[];
    confidenceAverage: number;
  };
}

export async function generateAvatarsFromInsights(
  userId: string,
  insights: Insight[]
): Promise<AvatarGenerationResult> {
  try {
    // Group insights by category for better context
    const painPoints = insights.filter(i => i.category === 'pain-point');
    const desires = insights.filter(i => i.category === 'desire');
    const objections = insights.filter(i => i.category === 'objection');
    const triggers = insights.filter(i => i.category === 'trigger');

    const prompt = buildAvatarGenerationPrompt(painPoints, desires, objections, triggers);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a world-class marketing strategist and consumer psychologist specializing in customer segmentation and persona development for eCommerce brands. 

Your expertise includes:
- Advanced demographic and psychographic profiling
- Customer journey mapping and behavioral psychology
- Pain point identification and desire clustering
- Marketing angle development based on psychological triggers
- Data-driven persona synthesis from customer research

You excel at taking raw customer insights (reviews, comments, feedback, discussions) and synthesizing them into distinct, actionable customer avatars that marketing teams can use to create targeted campaigns.

For each request, you will:
1. Analyze patterns across customer insights
2. Identify 3-5 distinct customer segments with unique characteristics
3. Create detailed personas with demographics, psychographics, pain points, desires, and marketing angles
4. Assign priority and confidence scores based on data strength

Always respond with valid JSON in the exact format requested.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Transform AI response into InsertAvatar format
    const avatars: InsertAvatar[] = (result.avatars || []).map((avatar: any) => ({
      userId,
      name: avatar.name,
      ageRange: avatar.ageRange,
      demographics: avatar.demographics,
      psychographics: avatar.psychographics,
      painPoints: avatar.painPoints || [],
      desires: avatar.desires || [],
      objections: avatar.objections || [],
      triggers: avatar.triggers || [],
      hooks: avatar.hooks || [],
      priority: avatar.priority || "medium",
      confidence: avatar.confidence?.toString() || "75.00",
      source: "generated",
      status: "pending"
    }));

    return {
      avatars,
      summary: {
        totalGenerated: avatars.length,
        primarySegments: avatars.map(a => a.name),
        confidenceAverage: avatars.length > 0 
          ? avatars.reduce((sum, a) => sum + parseFloat(a.confidence || "75"), 0) / avatars.length
          : 0
      }
    };
  } catch (error) {
    console.error("Error generating avatars:", error);
    throw new Error(`Failed to generate avatars: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function buildAvatarGenerationPrompt(
  painPoints: Insight[],
  desires: Insight[],
  objections: Insight[],
  triggers: Insight[]
): string {
  return `
# Customer Intelligence Data

I have discovered valuable customer insights from multiple platforms (Reddit, Amazon reviews, YouTube comments, forums, articles). Your task is to analyze this data and create 3-5 distinct customer personas (avatars) that represent different segments of the target market.

## Discovered Insights

### Pain Points (${painPoints.length} insights)
${painPoints.slice(0, 15).map(insight => `
- **${insight.title}**
  Quote: "${insight.rawQuote}"
  Summary: ${insight.summary}
  Platform: ${insight.sourcePlatform}
`).join('\n')}

### Desires (${desires.length} insights)
${desires.slice(0, 15).map(insight => `
- **${insight.title}**
  Quote: "${insight.rawQuote}"
  Summary: ${insight.summary}
  Platform: ${insight.sourcePlatform}
`).join('\n')}

### Objections (${objections.length} insights)
${objections.slice(0, 10).map(insight => `
- **${insight.title}**
  Quote: "${insight.rawQuote}"
  Summary: ${insight.summary}
  Platform: ${insight.sourcePlatform}
`).join('\n')}

### Triggers (${triggers.length} insights)
${triggers.slice(0, 10).map(insight => `
- **${insight.title}**
  Quote: "${insight.rawQuote}"
  Summary: ${insight.summary}
  Platform: ${insight.sourcePlatform}
`).join('\n')}

## Instructions

Analyze these insights and create 3-5 distinct customer avatars. For each avatar:

1. **Identify a unique customer segment** - Look for patterns in demographics, behaviors, and motivations
2. **Create a persona** with:
   - Name (e.g., "Budget-Conscious Sarah", "Fitness-Focused Mike")
   - Age range (e.g., "25-34", "35-44")
   - Demographics (e.g., "Working professional, urban, $60-80k income, college-educated")
   - Psychographics (2-3 sentences describing values, lifestyle, priorities, behaviors)
   
3. **Extract top pain points** (3-5 items) from the data that resonate with this segment
4. **Extract top desires** (3-5 items) that this segment is seeking
5. **Extract top objections** (2-4 items) this segment might have
6. **Extract top triggers** (2-4 items) that would motivate this segment to buy
7. **Create marketing hooks** (3-5 angle propositions) - specific messaging angles/headlines that would resonate with this persona

8. **Assign priority** (high/medium/low) based on:
   - Market size indicators in the data
   - Strength of pain points
   - Buying intent signals

9. **Assign confidence** (0-100) based on:
   - Amount of supporting data
   - Consistency of patterns
   - Quality of insights

## Output Format

Return ONLY valid JSON in this exact format:

{
  "avatars": [
    {
      "name": "Budget-Conscious Sarah",
      "ageRange": "25-34",
      "demographics": "Young professional, urban, $50-70k income, college-educated, renting",
      "psychographics": "Values quality but very price-sensitive. Researches extensively before buying. Seeks best deals and discounts. Influenced by peer reviews and social proof. Prioritizes practical benefits over luxury.",
      "painPoints": [
        "Can't afford premium products but wants quality results",
        "Frustrated by products that don't last",
        "Tired of hidden costs and subscription traps"
      ],
      "desires": [
        "Affordable luxury that fits the budget",
        "Long-lasting products with good ROI",
        "Transparent pricing with no surprises"
      ],
      "objections": [
        "Skeptical of 'too good to be true' claims",
        "Worried about product quality at this price point"
      ],
      "triggers": [
        "Limited-time discounts and flash sales",
        "Money-back guarantees and risk reversal",
        "Social proof from people like them"
      ],
      "hooks": [
        "Luxury Results Without the Luxury Price Tag",
        "The Smart Shopper's Secret to [Benefit]",
        "Stop Overpaying: Get [Result] for 50% Less"
      ],
      "priority": "high",
      "confidence": 85
    }
  ]
}

Important:
- Create 3-5 diverse avatars representing different customer segments
- Use actual patterns and quotes from the data provided
- Make personas specific and actionable for marketing campaigns
- Ensure hooks are compelling and tailored to each persona
- Higher confidence scores for avatars with more supporting data
`;
}
