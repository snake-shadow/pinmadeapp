
import React from 'react';
import type { PinStyle, TypographyStyle } from '../App';

interface InputFormProps {
    topic: string;
    setTopic: (topic: string) => void;
    url: string;
    setUrl: (url: string) => void;
    style: PinStyle;
    setStyle: (style: PinStyle) => void;
    overlayText: string;
    setOverlayText: (text: string) => void;
    website: string;
    setWebsite: (text: string) => void;
    typography: TypographyStyle;
    setTypography: (style: TypographyStyle) => void;
    brandPalette: string[];
    selectedBrandColor: string | null;
    setSelectedBrandColor: (color: string | null) => void;
    onGenerate: () => void;
    isLoading: boolean;
}

const styles: PinStyle[] = ['Stock Photo', 'Cinematic', 'Illustration', 'Vintage Film', 'Minimalist', 'Food Photography'];
const typographyStyles: TypographyStyle[] = ['Elegant Serif', 'Bold Sans-Serif', 'Playful Script', 'Minimalist'];

const StyleSelector: React.FC<{ selectedStyle: PinStyle; setStyle: (style: PinStyle) => void; disabled: boolean }> = ({ selectedStyle, setStyle, disabled }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
            Choose a Creative Style
        </label>
        <div className="flex flex-wrap gap-2">
            {styles.map((style) => (
                <button
                    key={style}
                    type="button"
                    onClick={() => setStyle(style)}
                    disabled={disabled}
                    className={`flex-grow px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 border-2 ${
                        selectedStyle === style
                            ? 'bg-rose-600 border-rose-500 text-white'
                            : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-rose-500 hover:text-white'
                    } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                    {style}
                </button>
            ))}
        </div>
    </div>
);

const TypographySelector: React.FC<{ selectedStyle: TypographyStyle; setStyle: (style: TypographyStyle) => void; disabled: boolean }> = ({ selectedStyle, setStyle, disabled }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
            Choose a Typography Style
        </label>
        <div className="flex flex-wrap gap-2">
            {typographyStyles.map((style) => (
                <button
                    key={style}
                    type="button"
                    onClick={() => setStyle(style)}
                    disabled={disabled}
                    className={`flex-grow px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 border-2 ${
                        selectedStyle === style
                            ? 'bg-rose-600 border-rose-500 text-white'
                            : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-rose-500 hover:text-white'
                    } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                    {style}
                </button>
            ))}
        </div>
    </div>
);

const BrandColorSelector: React.FC<{ palette: string[], selectedColor: string | null, setColor: (color: string | null) => void; disabled: boolean }> = ({ palette, selectedColor, setColor, disabled }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
            Choose a Brand Color
        </label>
        <div className="flex flex-wrap gap-3">
            {palette.map((color) => (
                <button
                    key={color}
                    type="button"
                    aria-label={`Select color ${color}`}
                    onClick={() => setColor(color)}
                    disabled={disabled}
                    style={{ backgroundColor: color }}
                    className={`w-9 h-9 rounded-full transition-all duration-200 border-2 border-gray-900/50 ${
                        selectedColor === color ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-rose-500' : ''
                    } ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:scale-110'}`}
                />
            ))}
        </div>
    </div>
);


export const InputForm: React.FC<InputFormProps> = ({ topic, setTopic, url, setUrl, style, setStyle, overlayText, setOverlayText, website, setWebsite, typography, setTypography, brandPalette, selectedBrandColor, setSelectedBrandColor, onGenerate, isLoading }) => {
    const canGenerate = (topic.trim().length > 0 || url.trim().length > 0) && !isLoading;

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-700 space-y-6">
            <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-1">
                    Topic / Description
                </label>
                <textarea
                    id="topic"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition duration-150 ease-in-out text-gray-100 placeholder-gray-500 bg-gray-800"
                    placeholder="e.g., 'Aesthetic home office ideas for small spaces'"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={isLoading}
                />
            </div>
            
            <StyleSelector selectedStyle={style} setStyle={setStyle} disabled={isLoading} />

            <div>
                 <label htmlFor="overlayText" className="block text-sm font-medium text-gray-300 mb-1">
                    Overlay Text (Optional)
                </label>
                <input
                    type="text"
                    id="overlayText"
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition duration-150 ease-in-out text-gray-100 placeholder-gray-500 bg-gray-800"
                    placeholder="e.g., '5 Tips for a Cozy Bedroom'"
                    value={overlayText}
                    onChange={(e) => setOverlayText(e.target.value)}
                    disabled={isLoading}
                />
            </div>

            {overlayText && <TypographySelector selectedStyle={typography} setStyle={setTypography} disabled={isLoading} />}

            <div>
                 <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-1">
                    Website / Branding (Optional)
                </label>
                <input
                    type="text"
                    id="website"
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition duration-150 ease-in-out text-gray-100 placeholder-gray-500 bg-gray-800"
                    placeholder="e.g., 'yourwebsite.com'"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    disabled={isLoading}
                />
            </div>
            
            {website && brandPalette.length > 0 && <BrandColorSelector palette={brandPalette} selectedColor={selectedBrandColor} setColor={setSelectedBrandColor} disabled={isLoading} />}
            
            <div className="flex items-center text-gray-500 text-sm">
                <hr className="flex-grow border-gray-700" />
                <span className="px-3">OR</span>
                <hr className="flex-grow border-gray-700" />
            </div>

            <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-1">
                    URL (Optional, for context)
                </label>
                <input
                    type="url"
                    id="url"
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition duration-150 ease-in-out text-gray-100 placeholder-gray-500 bg-gray-800"
                    placeholder="e.g., 'https://yourblog.com/home-office-tips'"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isLoading}
                />
            </div>

            <button
                onClick={onGenerate}
                disabled={!canGenerate}
                className={`w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white transition duration-200 ease-in-out transform ${
                    canGenerate ? 'bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-rose-500 cursor-pointer hover:scale-105' : 'bg-gray-600 cursor-not-allowed'
                }`}
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                    </>
                ) : 'Generate Pins'}
            </button>
        </div>
    );
};
