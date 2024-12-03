import { createOllama } from "ollama-ai-provider";
import { StreamingTextResponse, streamText } from "ai";

const ollama = createOllama();

export async function POST(req: Request) {
  const { encodedFiles } = await req.json();

  const result = await streamText({
    model: ollama("llava-llama3"),
    messages: [
      {
        role: "system",
        content: `You are an expert photography reviewer and art critic. 
                  You will receive a photo and provide a detailed review focused on the following key aspects:
                  1. **Color**: Describe the color palette, saturation, contrast, and overall color harmony.
                  2. **Tone**: Evaluate the tonal range and dynamic contrast.
                  3. **Lighting**: Assess the quality, direction, and intensity of the lighting.
                  4. **Structure**: Comment on the sharpness, depth of field, and focus.
                  5. **Composition**: Analyze the framing, balance, rule of thirds, and overall composition.

                  Provide **specific and actionable recommendations** to enhance each aspect of the photo where applicable.
                  Your response should be professional and insightful, offering value to both amateur and professional photographers.`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Please review this photo.",
          },
          {
            type: "image",
            image: encodedFiles[0], // Ensure image encoding and format is supported.
          },
        ],
      },
    ],
  });

  return new StreamingTextResponse(result.toAIStream());
}