import OpenAI from "openai";
import type { KnowledgeBase } from "@shared/schema";

// Using GPT-4o as the latest stable OpenAI model
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ScriptGenerationRequest {
  scriptType: "ugc" | "testimonial" | "demo" | "story";
  duration: "15s" | "30s" | "45s" | "60s";
  targetAvatar?: string;
  marketingAngle?: string;
  awarenessStage?: "unaware" | "problem aware" | "solution aware" | "product aware" | "most aware";
}

interface GeneratedScript {
  title: string;
  duration: string;
  scriptType: "ugc" | "testimonial" | "demo" | "story";
  summary: string;
  content: {
    avatar: string;
    marketingAngle: string;
    awarenessStage: "unaware" | "problem aware" | "solution aware" | "product aware" | "most aware";
    problem: string;
    solution: string;
    fullScript: string;
    cta: string;
  };
  sourceResearch: {
    avatarName: string;
    conceptTitle: string;
    relevanceScore: number;
  };
}

export async function generateScript(
  request: ScriptGenerationRequest,
  knowledgeBase: KnowledgeBase
): Promise<GeneratedScript> {
  try {
    const prompt = buildScriptPrompt(request, knowledgeBase);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an 8-figure creative strategist and direct response copywriter with deep expertise in eCommerce video marketing. You understand advanced consumer psychology, proven conversion frameworks, and the nuances of different creative approaches.

Your expertise includes:
- Advanced copywriting frameworks (AIDA, PAS, Before/After/Bridge, Hook-Story-Close, Problem-Agitation-Solution)
- Psychological triggers and cognitive biases that drive purchasing decisions
- Platform-specific content optimization and authentic UGC styling
- Customer journey psychology and awareness stage mapping
- High-performing creative patterns and conversion elements

For each request, intelligently select and adapt the most effective creative approach based on:
- Script type and intended platform usage
- Audience awareness stage and psychological readiness
- Brand positioning and competitive landscape
- Specific conversion objectives

Create scripts that feel authentic and native while incorporating sophisticated persuasion elements. Always respond with valid JSON in the exact format requested.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate and ensure all required fields are present
    return {
      title: result.title || `${request.scriptType} Script`,
      duration: request.duration,
      scriptType: request.scriptType,
      summary: result.summary || "",
      content: {
        avatar: result.content?.avatar || "",
        marketingAngle: result.content?.marketingAngle || "",
        awarenessStage: request.awarenessStage || "problem aware",
        problem: result.content?.problem || "",
        solution: result.content?.solution || "",
        fullScript: result.content?.fullScript || "",
        cta: result.content?.cta || ""
      },
      sourceResearch: {
        avatarName: result.sourceResearch?.avatarName || "Primary Target",
        conceptTitle: result.sourceResearch?.conceptTitle || "Brand Messaging",
        relevanceScore: result.sourceResearch?.relevanceScore || 85
      }
    };
  } catch (error) {
    console.error("Error generating script:", error);
    throw new Error(`Failed to generate script: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function buildScriptPrompt(request: ScriptGenerationRequest, kb: KnowledgeBase): string {
  const durationInfo = {
    "15s": "15 seconds (about 35-40 words, very punchy hook)",
    "30s": "30 seconds (about 75-80 words, quick problem-solution format)", 
    "45s": "45 seconds (about 110-120 words, story-based with clear transformation)",
    "60s": "60 seconds (about 150-160 words, detailed narrative with multiple proof points)"
  };

  const scriptTypeGuidance = {
    "ugc": "Create authentic, user-generated style content that feels like a real customer sharing their experience. Use casual, conversational language.",
    "testimonial": "Focus on transformation story - before/after, specific results, emotional journey. Include credible details.",
    "demo": "Show the product in action. Focus on features, benefits, and how it solves specific problems. Include visual cues.",
    "story": "Narrative-driven content with character development, conflict, and resolution. More emotional and engaging."
  };

  const awarenessGuidance = {
    "unaware": "Audience doesn't know they have the problem. Start with attention-grabbing hook that reveals the issue.",
    "problem aware": "Audience knows the problem but not the solution. Focus on agitating the pain points.",
    "solution aware": "Audience knows solutions exist but not your specific product. Highlight unique benefits.", 
    "product aware": "Audience knows your product but needs convincing. Focus on proof, social proof, urgency.",
    "most aware": "Audience is ready to buy but needs final push. Focus on offer, guarantee, limited time."
  };

  return `
Generate a ${request.scriptType} video script for a ${durationInfo[request.duration]}.

BRAND INFORMATION:
- Brand: ${kb.websiteUrl || "Brand"}
- Brand Voice: ${kb.brandVoice || "Professional and engaging"}
- Mission: ${kb.missionStatement || "To provide value to our customers"}
- Key Benefits: ${(kb.keyBenefits ?? []).join(", ") || "High quality, reliable, affordable"}
- Unique Selling Points: ${(kb.usps ?? []).join(", ") || "Unique value proposition"}
- Brand Values: ${(kb.brandValues ?? []).join(", ") || "Quality, trust, innovation"}
- Pricing Strategy: ${kb.pricingInfo || "Competitive pricing"}
- Target Audience: ${kb.currentPersonas || "General audience"}
- Demographics: ${kb.demographics || "Various demographics"}
- Social Content Style: ${kb.contentStyle || "Authentic and engaging"}

SCRIPT REQUIREMENTS:
- Type: ${scriptTypeGuidance[request.scriptType]}
- Duration: ${durationInfo[request.duration]}
- Target Awareness Stage: ${awarenessGuidance[request.awarenessStage || "problem aware"]}
${request.targetAvatar ? `- Specific Avatar: ${request.targetAvatar}` : ""}
${request.marketingAngle ? `- Marketing Angle: ${request.marketingAngle}` : ""}

EXPERT CREATIVE STRATEGY:
As an 8-figure creative strategist, select and execute the optimal approach for this specific scenario. Consider:

1. FRAMEWORK SELECTION: Choose the most effective creative framework based on the audience awareness stage and script type:
   - Unaware → Attention-grabbing pattern interrupt + education
   - Problem Aware → Problem agitation + unique solution positioning  
   - Solution Aware → Unique mechanism + proof + differentiation
   - Product Aware → Social proof + risk reversal + urgency
   - Most Aware → Offer optimization + scarcity + immediate action

2. PSYCHOLOGICAL TRIGGERS: Integrate relevant cognitive biases and persuasion elements:
   - Social proof, authority, scarcity, reciprocity, commitment/consistency
   - Loss aversion, bandwagon effect, fear of missing out
   - Present bias, anchoring, and contrast principles

3. CONVERSION OPTIMIZATION: Focus on elements that drive measurable results:
   - Specific, visceral pain point articulation
   - Unique mechanism or "secret" that creates intrigue
   - Concrete proof elements and transformation promises
   - Risk-free trial language and urgency creation
   - Clear, action-oriented CTA with next step clarity

4. AUTHENTICITY: Ensure the script feels natural and user-generated while maintaining persuasive power

OUTPUT REQUIREMENTS:
Return a JSON object with this exact structure:
{
  "title": "Compelling, benefit-driven title that creates intrigue",
  "summary": "Strategic one-liner: [target audience] + [core problem] + [unique angle/mechanism]",
  "content": {
    "avatar": "Detailed psychographic profile of the target customer",
    "marketingAngle": "The strategic framework and psychological approach being used",
    "problem": "Visceral, specific pain point that creates emotional resonance",
    "solution": "Unique mechanism or approach that differentiates from competitors", 
    "fullScript": "Complete video script with [visual cues] and (psychological trigger notes)",
    "cta": "High-converting, risk-free call-to-action with clear next step"
  },
  "sourceResearch": {
    "avatarName": "Memorable target avatar name",
    "conceptTitle": "Creative framework/strategy implemented",
    "relevanceScore": 90
  }
}

SCRIPT EXCELLENCE STANDARDS:
- Hook must create pattern interrupt within 2 seconds
- Include specific brand details to establish credibility
- Use conversational, authentic language that matches the brand voice
- Incorporate proven psychological triggers without feeling salesy
- Include concrete proof elements (numbers, specifics, social proof)
- Create desire through transformation visualization
- End with clear, low-friction next step
- Maintain UGC authenticity while maximizing conversion potential

Write scripts that an expert creative strategist would be proud to deploy at scale for an 8-figure brand.
`;
}

export async function generateAvatar(knowledgeBase: KnowledgeBase): Promise<{
  name: string;
  description: string;
  painPoints: string[];
  motivations: string[];
  demographics: string;
}> {
  try {
    const prompt = `
Based on this brand information, generate a detailed customer avatar:

BRAND INFO:
- Target Audience: ${knowledgeBase.currentPersonas}
- Demographics: ${knowledgeBase.demographics}
- Key Benefits: ${knowledgeBase.keyBenefits.join(", ")}
- Brand Values: ${knowledgeBase.brandValues.join(", ")}

Create a detailed customer avatar JSON with:
{
  "name": "Avatar name (e.g., 'Busy Working Mom')",
  "description": "2-3 sentence detailed description",
  "painPoints": ["specific pain point 1", "specific pain point 2", "specific pain point 3"],
  "motivations": ["motivation 1", "motivation 2", "motivation 3"],
  "demographics": "Age, income, location, lifestyle details"
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert market researcher who creates detailed customer avatars for eCommerce brands. Create psychographically rich, specific avatars that help with targeted marketing."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error generating avatar:", error);
    throw new Error("Failed to generate avatar");
  }
}

/**
 * Generate multiple customer avatars (4-5) based on knowledge base
 */
export async function generateMultipleAvatars(knowledgeBase: KnowledgeBase): Promise<Array<{
  name: string;
  description: string;
  painPoints: string[];
  motivations: string[];
  demographics: string;
}>> {
  try {
    const prompt = `
Based on this brand information, generate 4-5 diverse customer avatars that represent different segments of the target market:

BRAND INFO:
- Target Audience: ${knowledgeBase.currentPersonas}
- Demographics: ${knowledgeBase.demographics}
- Key Benefits: ${knowledgeBase.keyBenefits?.join(", ") || "N/A"}
- Brand Values: ${knowledgeBase.brandValues?.join(", ") || "N/A"}

Create 4-5 distinct customer avatars with different:
- Demographics (age, income, life stage)
- Psychographics (values, lifestyle, priorities)
- Pain points and motivations
- Buying behaviors and decision factors

Return a JSON object with an "avatars" array:
{
  "avatars": [
    {
      "name": "Avatar name (e.g., 'Busy Working Mom')",
      "description": "2-3 sentence detailed description",
      "painPoints": ["specific pain point 1", "specific pain point 2", "specific pain point 3"],
      "motivations": ["motivation 1", "motivation 2", "motivation 3"],
      "demographics": "Age, income, location, lifestyle details"
    }
  ]
}

Make each avatar DISTINCT and specific - avoid generic descriptions.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert market researcher who creates detailed customer avatars for eCommerce brands. Create psychographically rich, specific, and DIVERSE avatars that represent different market segments. Each avatar should be distinct with unique characteristics, pain points, and motivations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.avatars || [];
  } catch (error) {
    console.error("Error generating multiple avatars:", error);
    throw new Error("Failed to generate avatars");
  }
}

/**
 * Analyze and select the best concepts for a specific avatar
 * Uses OpenAI to rank concepts based on relevance to avatar's pain points, demographics, and hooks
 */
export async function selectBestConcepts(
  concepts: any[],
  avatar: any,
  topN: number = 2
): Promise<any[]> {
  // If we have fewer concepts than requested, return all
  if (concepts.length <= topN) {
    return concepts;
  }

  try {
    // Extract avatar data with proper field names
    const painPoint = avatar.painPoint || 'Not specified';
    const demographics = avatar.demographics || 'Not specified';
    const hooks = Array.isArray(avatar.hooks) ? avatar.hooks.join(', ') : 'Not specified';
    const ageRange = avatar.ageRange || 'Not specified';

    const prompt = `You are an expert marketing strategist analyzing social media content for relevance to a specific customer avatar.

CUSTOMER AVATAR:
Name: ${avatar.name}
Age Range: ${ageRange}
Demographics: ${demographics}
Primary Pain Point: ${painPoint}
Hooks/Messaging Angles: ${hooks}

SOCIAL MEDIA CONCEPTS TO ANALYZE:
${concepts.map((concept, idx) => `
Concept ${idx + 1}:
- Platform: ${concept.platform}
- Title: ${concept.title}
- Description: ${concept.description}
- Hook: ${concept.hook}
- Visual Style: ${concept.visualStyle}
- CTA: ${concept.cta}
- Engagement Score: ${concept.engagementScore || 'N/A'}
`).join('\n')}

TASK:
Analyze each concept and score its relevance to this avatar based on:
1. **Pain Point Match (40%)**: How well does the content address the avatar's pain point?
2. **Demographic Fit (30%)**: Does the content style/messaging align with the avatar's age and demographics?
3. **Hook Alignment (20%)**: Does the hook resonate with the avatar's messaging angles?
4. **Engagement Quality (10%)**: Does it have strong engagement metrics?

Return a JSON object with concept indices ranked by relevance score (MUST return exactly ${topN} rankings):
{
  "rankings": [
    {
      "index": 0,
      "relevanceScore": 95,
      "reasoning": "Brief explanation of why this concept is highly relevant"
    },
    {
      "index": 3,
      "relevanceScore": 88,
      "reasoning": "Brief explanation"
    }
  ]
}

IMPORTANT: You MUST return exactly ${topN} rankings, choosing the ${topN} most relevant concepts from the list.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert marketing analyst who evaluates social media content relevance to target customer avatars. Provide objective, data-driven rankings based on strategic fit. Always return the exact number of rankings requested."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    const rankings = result.rankings || [];

    // Map rankings back to actual concepts
    let selectedConcepts = rankings
      .slice(0, topN)
      .map((ranking: any) => concepts[ranking.index])
      .filter(Boolean);

    // Fallback: If OpenAI returned fewer than topN, supplement with remaining concepts
    if (selectedConcepts.length < topN) {
      console.log(`[OpenAI] Warning: Got ${selectedConcepts.length} rankings, expected ${topN}. Supplementing with remaining concepts.`);
      const selectedIndices = new Set(rankings.map((r: any) => r.index));
      const remainingConcepts = concepts.filter((_, idx) => !selectedIndices.has(idx));
      const needed = topN - selectedConcepts.length;
      selectedConcepts = [...selectedConcepts, ...remainingConcepts.slice(0, needed)];
    }

    console.log(`[OpenAI] Selected ${selectedConcepts.length} best concepts for ${avatar.name} (${concepts[0]?.platform || 'unknown platform'})`);

    return selectedConcepts;
  } catch (error) {
    console.error("Error selecting best concepts:", error);
    // Fallback: return first N concepts if OpenAI fails
    console.log(`[OpenAI] Falling back to first ${topN} concepts due to error`);
    return concepts.slice(0, topN);
  }
}

/**
 * Calculate AI-powered relevance score between an avatar and concept
 */
export async function calculateRelevanceScore(avatar: any, concept: any): Promise<number> {
  try {
    const prompt = `Analyze the relevance between this customer avatar and social media concept, then provide a precise relevance score.

CUSTOMER AVATAR:
- Name: ${avatar.name}
- Demographics: ${avatar.demographics}
- Age Range: ${avatar.ageRange}
- Primary Pain Point: ${avatar.painPoint}
- Hooks: ${avatar.hooks.join(', ')}

SOCIAL MEDIA CONCEPT:
- Platform: ${concept.platform}
- Title: ${concept.title}
- Format: ${concept.format}
- Key Elements: ${concept.keyElements?.join(', ') || 'N/A'}
- Insights: ${concept.insights?.join(', ') || 'N/A'}
- Performance: Views=${concept.performance?.views}, Engagement=${concept.performance?.engagement}

SCORING CRITERIA:
1. Pain Point Match (40%): How well do the concept's messaging/elements address this avatar's primary pain point?
2. Demographic Fit (30%): Does the concept's style, tone, and platform align with this avatar's demographics and age range?
3. Hook Alignment (20%): Do the concept's creative elements resonate with the avatar's psychological hooks?
4. Engagement Quality (10%): Does the concept's performance metrics indicate proven effectiveness?

Return ONLY a JSON object with:
{
  "relevanceScore": <number between 0.00 and 1.00 with 2 decimal places>,
  "reasoning": "<brief 1-sentence explanation>"
}

Be precise and nuanced - avoid round numbers. Consider subtle differences that make scores like 0.73, 0.84, or 0.91 more accurate than 0.70, 0.80, or 0.90.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert marketing analyst who calculates precise relevance scores between customer avatars and social media concepts. Provide nuanced, data-driven scores based on strategic fit. Avoid round numbers - be specific."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    const score = parseFloat(result.relevanceScore) || 0.50;
    
    // Ensure score is between 0 and 1
    return Math.max(0, Math.min(1, score));
  } catch (error) {
    console.error("Error calculating relevance score:", error);
    // Fallback to a neutral score
    return 0.50;
  }
}