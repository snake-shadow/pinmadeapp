# Pin Made

## Overview

Pin Made is an AI-powered Pinterest pin generator that creates photorealistic, Pinterest-style images from user-provided topics or URLs. The application leverages Google's Gemini AI to generate creative image prompts and extract brand colors from websites, enabling users to create engaging visual content for their Pinterest boards.

The app allows users to:
- Generate pins based on topics or URLs
- Choose from multiple creative styles (Stock Photo, Cinematic, Illustration, etc.)
- Customize typography styles
- Extract and apply brand colors from websites
- Download generated pins

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 5 for fast development and optimized production builds
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer
- **Component Structure**: Functional components with hooks, organized in a flat `/components` directory
- **State Management**: React's built-in useState and useCallback hooks (no external state library needed for this scale)

### Application Structure
```
/
├── App.tsx              # Main application component with core state
├── index.tsx            # React entry point
├── types.ts             # TypeScript type definitions
├── components/          # UI components (Header, InputForm, PinGrid, PinCard)
├── services/            # API service layer (geminiService.ts)
```

### AI Integration Pattern
- **Service Layer**: The `geminiService.ts` file encapsulates all Gemini AI interactions
- **API Client**: Uses `@google/genai` SDK with a singleton instance pattern
- **Features**:
  - Brand color extraction from URLs using structured JSON responses
  - Pin idea generation with style-specific prompts
  - Debounced API calls (500ms) for URL color extraction to prevent excessive requests

### Data Flow
1. User inputs topic/URL and selects style options
2. Form triggers `handleGenerate` callback
3. Service layer calls Gemini API to generate pin ideas
4. Generated pins are stored in component state and rendered in grid
5. Users can download individual pins

### Type System
- Custom types defined in `types.ts` for Pin objects
- Style types (`PinStyle`, `TypographyStyle`) defined in App.tsx and shared via imports
- TypeScript configured with bundler module resolution and React JSX transform

## External Dependencies

### AI Service
- **Google Gemini AI** (`@google/genai`): Primary AI provider for content generation
  - Model: `gemini-3-flash-preview`
  - Used for: Brand color extraction, pin idea generation
  - Requires `GEMINI_API_KEY` environment variable (loaded as `API_KEY` in service)

### Environment Configuration
- API key stored in `.env.local` file
- Accessed via `process.env.API_KEY`

### CDN Dependencies (via importmap in index.html)
- React and ReactDOM loaded from esm.sh
- Tailwind CSS loaded from CDN for rapid styling

### Development Dependencies
- Vite with React plugin for development server and builds
- TypeScript for type checking
- PostCSS toolchain for CSS processing