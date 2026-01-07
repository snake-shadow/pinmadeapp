
import { GoogleGenAI } from "@google/genai";
import type { Pin } from "../types";
import type { PinStyle, TypographyStyle } from "../App";

// A single instance can be reused, initialized with the environment's API key.
// We'll initialize it lazily to ensure the API key is available
let aiInstance: any = null;

const getAI = () => {
    if (!aiInstance) {
        const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in your environment.");
        }
        aiInstance = new GoogleGenAI(apiKey);
    }
    return aiInstance;
};

export const extractBrandColorsFromUrl = async (url: string): Promise<string[]> => {
    // Ensure the URL has a protocol
    const fullUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;

    const prompt = `
        You are a web design assistant. Analyze the website at the following URL and identify its primary brand colors.
        Return a JSON array of 3 hex color codes, starting with the most prominent color.
        If the URL is invalid, inaccessible, or you cannot determine the colors, return a default palette: ["#121212", "#FFFFFF", "#E11D48"].
        URL: "${fullUrl}"
    `;
    try {
        const ai = getAI();
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

        const text = result.response.text().trim();
        const colors = JSON.parse(text);
        if (Array.isArray(colors) && colors.length > 0 && typeof colors[0] === 'string') {
            return colors;
        }
    } catch(e) {
        console.error("Could not extract brand colors, using default.", e);
    }
    // Return default palette on any error
    return ["#121212", "#FFFFFF", "#E11D48"];
};

const generatePinIdeas = async (topic: string, url: string, style: PinStyle): Promise<string[]> => {
  let styleInstruction: string;

  switch(style) {
    case 'Food Photography':
      styleInstruction = `in a style of professional food photography. Emphasize hyper-realism and appetizing details. Describe the lighting (e.g., soft natural light, dramatic side lighting), texture (e.g., glossy glaze, crumbly texture), and small details (e.g., steam gently rising, fresh herb garnish, condensation on a glass). The final image should look delicious and irresistible.`;
      break;
    case 'Stock Photo':
      styleInstruction = `that looks like a high-quality, professional stock photo from a site like Unsplash or Pexels. Focus on natural lighting, realistic composition, and a clean, modern aesthetic. The subject should look authentic and not staged.`;
      break;
    case 'Cinematic':
      styleInstruction = `with a cinematic feel. Describe dramatic lighting, a shallow depth of field, an interesting camera angle, and a specific color grade (e.g., teal and orange, moody blues, warm vintage).`;
      break;
    default:
      styleInstruction = `in a "${style}" style.`;
  }

  const prompt = `
    Based on the following topic and URL, generate 4 distinct, visually compelling concepts for Pinterest pins ${styleInstruction}
    For each concept, provide a detailed visual description suitable for an image generation AI.
    The description should account for a potential text overlay, so leave appropriate negative space or a clear area for text.
    Focus on creating aesthetically pleasing, high-quality, and engaging visuals that would perform well on Pinterest.

    Topic: "${topic}"
    URL: "${url}"

    Return the output as a JSON array of 4 strings.
  `;

  const ai = getAI();
  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
    },
  });
  
  const text = result.response.text().trim();
  try {
    const ideas = JSON.parse(text);
    if (Array.isArray(ideas) && ideas.length > 0 && typeof ideas[0] === 'string') {
        return ideas.slice(0, 4); // Ensure we only take up to 4 ideas
    }
  } catch (e) {
      console.error("Failed to parse pin ideas JSON:", text);
  }

  throw new Error("Could not generate pin ideas. The model returned an invalid format.");
};

const generateImage = async (prompt: string, overlayText: string, website: string, typography: TypographyStyle, brandColor: string | null): Promise<string> => {
    let finalPrompt = prompt;
    if (overlayText) {
      let typographyInstruction = '';
      switch (typography) {
        case 'Elegant Serif':
          typographyInstruction = `The text should be in an elegant, high-contrast serif font, like Playfair Display or Lora. It should look sophisticated and classic.`;
          break;
        case 'Bold Sans-Serif':
          typographyInstruction = `The text should be in a bold, modern sans-serif font, like Montserrat, Oswald, or Bebas Neue. It should be impactful and easy to read.`;
          break;
        case 'Playful Script':
          typographyInstruction = `The text should be in a casual, friendly script or handwritten font, like Pacifico or Amatic SC. It should feel personal and inviting.`;
          break;
        case 'Minimalist':
          typographyInstruction = `The text should be in a clean, simple, light-weight sans-serif font, like Lato or Raleway. It should look modern and unobtrusive.`;
          break;
      }
      finalPrompt += ` The image must have the text "${overlayText}" elegantly overlaid. ${typographyInstruction}`;
    }
    if (website && brandColor) {
      finalPrompt += ` At the bottom, add a simple, elegant branding bar with a semi-transparent background color of ${brandColor}. This bar should contain the text "${website}" in a clean, legible font that contrasts with the background (e.g., white text on a dark bar, black text on a light bar).`;
    }

    const ai = getAI();
    // Using gemini-1.5-flash as a fallback for image generation logic if Imagen is not directly exposed
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: `Generate an image based on this description: ${finalPrompt}. Aspect ratio 9:16.` }] }],
    });

    for (const candidate of result.response.candidates || []) {
        for (const part of candidate.content.parts || []) {
            if (part.inlineData) {
                const base64EncodeString: string = part.inlineData.data;
                return `data:image/png;base64,${base64EncodeString}`;
            }
        }
    }
    throw new Error("Image generation failed to return an image. Note: Image generation support via this SDK may vary by region and model availability.");
};


export const generatePins = async (topic: string, url: string, style: PinStyle, overlayText: string, website: string, typography: TypographyStyle, selectedBrandColor: string | null, onProgress: (message: string) => void): Promise<Pin[]> => {
    onProgress(`Brainstorming ${style.toLowerCase()} pin ideas...`);
    const ideas = await generatePinIdeas(topic, url, style);
    
    const pinPromises = ideas.map((prompt, index) =>
        (async () => {
            onProgress(`Generating pin ${index + 1} of ${ideas.length}...`);
            const imageUrl = await generateImage(prompt, overlayText, website, typography, selectedBrandColor);
            return {
                id: `image-${Date.now()}-${index}`,
                url: imageUrl,
                prompt: prompt,
            };
        })()
    );
    
    const results = await Promise.all(pinPromises);
    onProgress("Pins are ready!");
    return results;
};
