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
          content: "You are an expert UGC (User Generated Content) script writer specializing in high-converting video scripts for eCommerce brands. You understand consumer psychology, marketing angles, and how to create authentic-feeling content that drives sales. Always respond with valid JSON in the exact format requested."
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
- Brand: ${kb.websiteUrl}
- Brand Voice: ${kb.brandVoice}
- Mission: ${kb.missionStatement}
- Key Benefits: ${kb.keyBenefits.join(", ")}
- Unique Selling Points: ${kb.usps.join(", ")}
- Brand Values: ${kb.brandValues.join(", ")}
- Pricing Strategy: ${kb.pricingInfo}
- Target Audience: ${kb.currentPersonas}
- Demographics: ${kb.demographics}
- Social Content Style: ${kb.contentStyle}

SCRIPT REQUIREMENTS:
- Type: ${scriptTypeGuidance[request.scriptType]}
- Duration: ${durationInfo[request.duration]}
- Target Awareness Stage: ${awarenessGuidance[request.awarenessStage || "problem aware"]}
${request.targetAvatar ? `- Specific Avatar: ${request.targetAvatar}` : ""}
${request.marketingAngle ? `- Marketing Angle: ${request.marketingAngle}` : ""}

SCRIPT STRUCTURE:
- Hook (first 3 seconds): Grab attention immediately
- Problem: Agitate the pain point your audience feels
- Solution: Present your product as the answer
- Proof: Include specific benefits or social proof
- CTA: Clear call-to-action that drives action

OUTPUT REQUIREMENTS:
Return a JSON object with this exact structure:
{
  "title": "Catchy title for this script",
  "summary": "One sentence explaining target, problem, and angle",
  "content": {
    "avatar": "Detailed description of who this targets",
    "marketingAngle": "The main hook/approach being used",
    "problem": "The specific problem being addressed",
    "solution": "How the product solves this problem", 
    "fullScript": "Complete video script with [visual cues in brackets]",
    "cta": "Specific call-to-action"
  },
  "sourceResearch": {
    "avatarName": "Name for the target avatar",
    "conceptTitle": "Marketing concept being used",
    "relevanceScore": 90
  }
}

Make the script feel authentic and conversational, matching the brand voice. Include specific details from the brand information to make it personalized and credible.
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