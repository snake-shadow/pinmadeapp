
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { PinGrid } from './components/PinGrid';
import type { Pin } from './types';
import { generatePins, extractBrandColorsFromUrl } from './services/geminiService';

export type PinStyle = 'Stock Photo' | 'Cinematic' | 'Illustration' | 'Vintage Film' | 'Minimalist' | 'Food Photography';
export type TypographyStyle = 'Elegant Serif' | 'Bold Sans-Serif' | 'Playful Script' | 'Minimalist';


export default function App() {
  const [topic, setTopic] = useState('');
  const [url, setUrl] = useState('');
  const [style, setStyle] = useState<PinStyle>('Stock Photo');
  const [overlayText, setOverlayText] = useState('');
  const [website, setWebsite] = useState('');
  const [typography, setTypography] = useState<TypographyStyle>('Bold Sans-Serif');
  
  const [brandPalette, setBrandPalette] = useState<string[]>([]);
  const [selectedBrandColor, setSelectedBrandColor] = useState<string | null>(null);

  const [pins, setPins] = useState<Pin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (website && /([a-z0-9]+\.)?[a-z0-9]+\.[a-z]+/.test(website)) {
        extractBrandColorsFromUrl(website).then(colors => {
          setBrandPalette(colors);
          setSelectedBrandColor(colors[0] || null);
        });
      } else {
        setBrandPalette([]);
        setSelectedBrandColor(null);
      }
    }, 500); // Debounce API call

    return () => {
      clearTimeout(handler);
    };
  }, [website]);

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setPins([]);
    setError(null);

    const onProgress = (message: string) => {
        setLoadingMessage(message);
    };

    try {
      const generatedPins = await generatePins(topic, url, style, overlayText, website, typography, selectedBrandColor, onProgress);
      setPins(generatedPins);
    } catch (e: any) {
        console.error(e);
        let errorMessage = "An unexpected error occurred. Please try again.";
        if (e.message) {
            const message = e.message.toLowerCase();
            if (message.includes('api key not valid') || message.includes('permission_denied')) {
                errorMessage = "The API key is invalid or lacks permissions. Please check your setup.";
            } else {
                errorMessage = e.message;
            }
        }
        setError(errorMessage);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [topic, url, style, overlayText, website, typography, selectedBrandColor]);
  
  return (
    <div className="min-h-screen font-sans text-gray-200">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <Header />
        <div className="max-w-2xl mx-auto mt-8">
          <InputForm
            topic={topic}
            setTopic={setTopic}
            url={url}
            setUrl={setUrl}
            style={style}
            setStyle={setStyle}
            overlayText={overlayText}
            setOverlayText={setOverlayText}
            website={website}
            setWebsite={setWebsite}
            typography={typography}
            setTypography={setTypography}
            brandPalette={brandPalette}
            selectedBrandColor={selectedBrandColor}
            setSelectedBrandColor={setSelectedBrandColor}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />
          {error && (
            <div className="mt-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
              <p><span className="font-bold">Error:</span> {error}</p>
            </div>
          )}
          <PinGrid pins={pins} isLoading={isLoading} loadingMessage={loadingMessage} />
        </div>
      </main>
    </div>
  );
}
