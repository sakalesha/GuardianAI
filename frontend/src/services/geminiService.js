import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

/**
 * Uses Gemini to compare the 'before' (complaint) and 'after' (resolution) photos.
 */
export async function verifyResolution(
  beforeImageBase64,
  afterImageBase64,
  category,
) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `You are a civic accountability auditor. Compare these two photos of a ${category} issue. 
          Photo 1 is the original complaint. 
          Photo 2 is the claimed resolution by the municipal authority.
          
          Analyze if the issue shown in Photo 1 has been genuinely fixed in Photo 2.
          Consider:
          - Is it the same location?
          - Is the specific problem (e.g., pothole, garbage) gone?
          - Is the resolution photo just a close-up of a different area?
          
          Return a JSON object with:
          - score: a number from 0 to 1 (1 being perfectly resolved)
          - label: 'VERIFIED' if resolved, 'UNCHANGED' if the problem persists, 'UNCERTAIN' if photos are too different to tell.
          - reasoning: a brief explanation of your finding.`,
          },
          {
            inlineData: {
              data: beforeImageBase64.split(",")[1],
              mimeType: "image/jpeg",
            },
          },
          {
            inlineData: {
              data: afterImageBase64.split(",")[1],
              mimeType: "image/jpeg",
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          label: {
            type: Type.STRING,
            enum: ["VERIFIED", "UNCHANGED", "UNCERTAIN"],
          },
          reasoning: { type: Type.STRING },
        },
        required: ["score", "label", "reasoning"],
      },
    },
  });

  const result = await model;
  return JSON.parse(result.text || "{}");
}
