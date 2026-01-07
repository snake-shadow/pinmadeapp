import type { Pin } from "../types";
import type { PinStyle, TypographyStyle } from "../App";

// Direct API call helper - works in browser
const callGeminiAPI = async (prompt: string, jsonMode = true) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in your environment.");
  }

  // ✅ CHANGED: v1 → v1beta (supports JSON mode)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const requestBody: any = {
    contents: [{ 
      parts: [{ text: prompt }]
    }]
  };

  if (jsonMode) {
    requestBody.generationConfig = {
      // ✅ CHANGED: responseMimeType → response_mime_type (snake_case for v1beta)
      response_mime_type: "application/json"
    };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API error details:", errorText);
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text;
};

export const extractBrandColorsFromUrl = async (url: string): Promise<string[]> => {
    const fullUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;

    const prompt = `
        You are a web design assistant. Analyze the website at the following URL and identify its primary brand colors.
        Return a JSON array of 3 hex color codes, starting with the most prominent color.
        If the URL is invalid, inaccessible, or you cannot determine the colors, return a default palette: ["#121212", "#FFFFFF", "#E11D48"].
        URL: "${fullUrl}"
    `;
    try {
        const text = await callGeminiAPI(prompt, true);
        const colors = JSON.parse(text);
        if (Array.isArray(colors) && colors.length > 0 && typeof colors[0] === 'string') {
            return colors;
        }
    } catch(e) {
        console.error("Could not extract brand colors, using default.", e);
    }
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

  const text = await callGeminiAPI(prompt, true);
  
  try {
    const ideas = JSON.parse(text);
    if (Array.isArray(ideas) && ideas.length > 0 && typeof ideas[0] === 'string') {
        return ideas.slice(0, 4);
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

    // Note: Gemini REST API doesn't support image generation with inline data
    // Generating a placeholder with the description for now
    const description = await callGeminiAPI(`Generate an image based on this description: ${finalPrompt}. Aspect ratio 9:16.`, false);
    
    // Return an SVG placeholder with the description
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="711" viewBox="0 0 400 711">
      <rect width="400" height="711" fill="#f8f9fa"/>
      <foreignObject x="20" y="20" width="360" height="671">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial; font-size: 14px; padding: 20px; color: #333;">
          <strong>Pin Concept:</strong><br/><br/>
          ${description?.substring(0, 500) || finalPrompt.substring(0, 500)}...
        </div>
      </foreignObject>
    </svg>`;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
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
