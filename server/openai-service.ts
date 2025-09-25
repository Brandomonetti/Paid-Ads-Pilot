import OpenAI from "openai";
import type { KnowledgeBase } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
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
      model: "gpt-5",
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
      model: "gpt-5",
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