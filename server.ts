import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Helper to get GoogleGenAI client safely
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// Fallback high-quality curated procedural logo designs if API key is absent
function getProceduralLogoConcepts(brandName: string, industry: string, style: string, tagline?: string) {
  const safeName = brandName.trim() || 'ACME';
  const safeTag = (tagline || '').trim() || 'PREMIUM BRAND';
  const initial = safeName.charAt(0).toUpperCase();
  const secondary = safeName.charAt(1)?.toUpperCase() || 'X';

  return [
    {
      conceptTitle: 'Modern Geometric Mark',
      brandStory: `A bold architectural geometric icon reflecting precision, confidence, and innovation for ${safeName}.`,
      layout: 'stacked',
      palette: ['#6366f1', '#8b5cf6', '#06b6d4', '#0f172a', '#ffffff'],
      symbol: {
        type: 'svg',
        svgPath: 'M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z M50 25 L72 38 L72 62 L50 75 L28 62 L28 38 Z',
        viewBox: '0 0 100 100',
        fill: 'url(#brandGrad1)',
        stroke: '#818cf8',
        strokeWidth: 2,
        scale: 1,
        rotation: 0,
      },
      gradient: {
        id: 'brandGrad1',
        from: '#6366f1',
        to: '#06b6d4',
        angle: 45,
      },
      brandText: {
        text: safeName,
        fontFamily: 'Montserrat',
        fontSize: 38,
        fontWeight: '800',
        letterSpacing: 4,
        color: '#ffffff',
        textTransform: 'uppercase',
      },
      taglineText: {
        text: safeTag,
        fontFamily: 'Inter',
        fontSize: 12,
        fontWeight: '500',
        letterSpacing: 8,
        color: '#94a3b8',
        textTransform: 'uppercase',
      },
      badge: {
        shape: 'none',
        stroke: '#3b82f6',
        strokeWidth: 2,
        fill: 'transparent',
      },
      background: {
        color: '#090d16',
      },
    },
    {
      conceptTitle: 'Minimalist Monogram Crest',
      brandStory: `A sleek, luxury monogram pairing initials '${initial}${secondary}' with timeless serif authority.`,
      layout: 'stacked',
      palette: ['#d97706', '#fbbf24', '#f59e0b', '#1c1917', '#ffffff'],
      symbol: {
        type: 'svg',
        svgPath: 'M50 8 C65 8 82 20 85 40 C88 65 65 85 50 92 C35 85 12 65 15 40 C18 20 35 8 50 8 Z M50 22 C40 22 28 30 26 44 C24 60 40 74 50 80 C60 74 76 60 74 44 C72 30 60 22 50 22 Z',
        viewBox: '0 0 100 100',
        fill: '#f59e0b',
        stroke: '#fbbf24',
        strokeWidth: 1.5,
        scale: 1,
        rotation: 0,
      },
      gradient: {
        id: 'brandGrad2',
        from: '#fbbf24',
        to: '#d97706',
        angle: 135,
      },
      brandText: {
        text: safeName,
        fontFamily: 'Cinzel',
        fontSize: 34,
        fontWeight: '700',
        letterSpacing: 6,
        color: '#fef3c7',
        textTransform: 'uppercase',
      },
      taglineText: {
        text: safeTag,
        fontFamily: 'Playfair Display',
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 5,
        color: '#fbbf24',
        textTransform: 'uppercase',
      },
      badge: {
        shape: 'none',
        stroke: '#f59e0b',
        strokeWidth: 1.5,
        fill: 'transparent',
      },
      background: {
        color: '#0c0a09',
      },
    },
    {
      conceptTitle: 'Dynamic Tech Vortex',
      brandStory: `High-velocity wings and intersecting arcs symbolizing agility, forward motion, and digital intelligence.`,
      layout: 'horizontal',
      palette: ['#10b981', '#06b6d4', '#3b82f6', '#022c22', '#ffffff'],
      symbol: {
        type: 'svg',
        svgPath: 'M20 50 C20 30 35 15 55 15 C75 15 85 30 85 50 C85 70 65 85 45 85 C30 85 20 70 20 50 Z M38 50 C38 60 45 68 55 68 C65 68 70 60 70 50 C70 40 62 32 52 32 C42 32 38 40 38 50 Z M10 40 L30 40 L25 60 L5 60 Z M70 40 L90 40 L85 60 L65 60 Z',
        viewBox: '0 0 100 100',
        fill: 'url(#brandGrad3)',
        stroke: '#34d399',
        strokeWidth: 1.5,
        scale: 0.95,
        rotation: 0,
      },
      gradient: {
        id: 'brandGrad3',
        from: '#10b981',
        to: '#06b6d4',
        angle: 90,
      },
      brandText: {
        text: safeName,
        fontFamily: 'Orbitron',
        fontSize: 30,
        fontWeight: '800',
        letterSpacing: 3,
        color: '#ecfdf5',
        textTransform: 'uppercase',
      },
      taglineText: {
        text: safeTag,
        fontFamily: 'Space Grotesk',
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 6,
        color: '#6ee7b7',
        textTransform: 'uppercase',
      },
      badge: {
        shape: 'none',
        stroke: '#10b981',
        strokeWidth: 2,
        fill: 'transparent',
      },
      background: {
        color: '#021814',
      },
    },
    {
      conceptTitle: 'Shield Heritage Emblem',
      brandStory: `An authoritative seal of trust and pedigree suited for high-stakes enterprise, security, or craft.`,
      layout: 'badge',
      palette: ['#ec4899', '#8b5cf6', '#6366f1', '#180d2b', '#ffffff'],
      symbol: {
        type: 'svg',
        svgPath: 'M50 15 L80 28 L80 60 C80 75 50 88 50 88 C50 88 20 75 20 60 L20 28 Z M50 25 L70 34 L70 58 C70 68 50 78 50 78 C50 78 30 68 30 58 L30 34 Z M50 36 L58 48 L72 49 L61 58 L64 72 L50 64 L36 72 L39 58 L28 49 L42 48 Z',
        viewBox: '0 0 100 100',
        fill: 'url(#brandGrad4)',
        stroke: '#f43f5e',
        strokeWidth: 1.5,
        scale: 1,
        rotation: 0,
      },
      gradient: {
        id: 'brandGrad4',
        from: '#ec4899',
        to: '#8b5cf6',
        angle: 60,
      },
      brandText: {
        text: safeName,
        fontFamily: 'Syne',
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: 4,
        color: '#ffffff',
        textTransform: 'uppercase',
      },
      taglineText: {
        text: safeTag,
        fontFamily: 'Inter',
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 7,
        color: '#f472b6',
        textTransform: 'uppercase',
      },
      badge: {
        shape: 'circle',
        stroke: '#ec4899',
        strokeWidth: 2,
        fill: '#180d2b',
      },
      background: {
        color: '#0f071a',
      },
    },
  ];
}

// Endpoint: AI Logo Design Generation
app.post('/api/ai/design-logo', async (req, res) => {
  const { brandName, tagline, industry, style, colorScheme, customPrompt } = req.body;

  if (!brandName || typeof brandName !== 'string') {
    return res.status(400).json({ error: 'Brand name is required' });
  }

  const ai = getGenAIClient();
  if (!ai) {
    // Return curated procedural concepts seamlessly
    const fallbackConcepts = getProceduralLogoConcepts(
      brandName,
      industry || 'General',
      style || 'Modern Minimal',
      tagline
    );
    return res.json({ concepts: fallbackConcepts, mode: 'curated' });
  }

  try {
    const prompt = `You are a world-class principal brand identity designer and vector artist.
Design 4 distinct, professional, aesthetically remarkable logo concepts for the brand:
- Brand Name: "${brandName}"
- Tagline: "${tagline || ''}"
- Industry / Niche: "${industry || 'Technology & Innovation'}"
- Style Aesthetic: "${style || 'modern_minimal'}" (Options: modern_minimal, vintage_badge, tech_cyber, luxury_serif, geometric_abstract, playful_bold, heraldic_crest)
- Color Palette Preference: "${colorScheme || 'vibrant_gradient'}"
- Additional Creative Brief: "${customPrompt || 'Create impactful, iconic, timeless marks'}"

IMPORTANT GUIDELINES FOR VECTOR LOGO MARKS:
1. Provide valid SVG paths in 'svgPath'. The SVG coordinate space is viewBox "0 0 100 100" (center around 50,50). The path must be valid SVG Path syntax (M, L, C, Q, Z, etc.) drawing a recognizable, clean, beautiful brand symbol, abstract monogram, shield, geometric icon, mascot silhouette, or emblem appropriate for ${brandName}.
2. Provide a 5-color hex palette ('palette').
3. Suggest the optimal typography: Choose from Google Fonts: ['Montserrat', 'Inter', 'Cinzel', 'Playfair Display', 'Orbitron', 'Space Grotesk', 'Syne', 'Outfit', 'Plus Jakarta Sans', 'Righteous'].
4. Layout can be 'stacked' (icon on top, text below), 'horizontal' (icon on left, text on right), 'badge' (emblem enclosure), or 'monogram' (stylized typographic lettermark).
5. Colors must look high-end, harmonious, and modern with dark studio backgrounds like #090d16, #0c0a09, #021814, #0f071a, or #000000.
6. Provide distinct concepts (e.g. one geometric abstract, one monogram/crest, one tech/dynamic, one minimal modern).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            concepts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  conceptTitle: { type: Type.STRING },
                  brandStory: { type: Type.STRING },
                  layout: { type: Type.STRING },
                  palette: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  symbol: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING },
                      svgPath: { type: Type.STRING },
                      viewBox: { type: Type.STRING },
                      fill: { type: Type.STRING },
                      stroke: { type: Type.STRING },
                      strokeWidth: { type: Type.NUMBER },
                      scale: { type: Type.NUMBER },
                      rotation: { type: Type.NUMBER },
                    },
                    required: ['svgPath', 'viewBox', 'fill'],
                  },
                  gradient: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      from: { type: Type.STRING },
                      to: { type: Type.STRING },
                      angle: { type: Type.NUMBER },
                    },
                    required: ['id', 'from', 'to'],
                  },
                  brandText: {
                    type: Type.OBJECT,
                    properties: {
                      text: { type: Type.STRING },
                      fontFamily: { type: Type.STRING },
                      fontSize: { type: Type.NUMBER },
                      fontWeight: { type: Type.STRING },
                      letterSpacing: { type: Type.NUMBER },
                      color: { type: Type.STRING },
                      textTransform: { type: Type.STRING },
                    },
                    required: ['text', 'fontFamily', 'fontSize', 'color'],
                  },
                  taglineText: {
                    type: Type.OBJECT,
                    properties: {
                      text: { type: Type.STRING },
                      fontFamily: { type: Type.STRING },
                      fontSize: { type: Type.NUMBER },
                      fontWeight: { type: Type.STRING },
                      letterSpacing: { type: Type.NUMBER },
                      color: { type: Type.STRING },
                      textTransform: { type: Type.STRING },
                    },
                    required: ['text', 'fontFamily', 'fontSize', 'color'],
                  },
                  badge: {
                    type: Type.OBJECT,
                    properties: {
                      shape: { type: Type.STRING },
                      stroke: { type: Type.STRING },
                      strokeWidth: { type: Type.NUMBER },
                      fill: { type: Type.STRING },
                    },
                    required: ['shape', 'stroke', 'strokeWidth', 'fill'],
                  },
                  background: {
                    type: Type.OBJECT,
                    properties: {
                      color: { type: Type.STRING },
                    },
                    required: ['color'],
                  },
                },
                required: ['conceptTitle', 'brandStory', 'layout', 'palette', 'symbol', 'brandText', 'background'],
              },
            },
          },
          required: ['concepts'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.concepts && parsed.concepts.length > 0) {
      return res.json({ concepts: parsed.concepts, mode: 'ai' });
    } else {
      const fallbackConcepts = getProceduralLogoConcepts(brandName, industry, style, tagline);
      return res.json({ concepts: fallbackConcepts, mode: 'curated' });
    }
  } catch (err: any) {
    console.error('Gemini Logo Design Error:', err);
    const fallbackConcepts = getProceduralLogoConcepts(brandName, industry, style, tagline);
    return res.json({ concepts: fallbackConcepts, mode: 'curated', notice: err.message });
  }
});

// Endpoint: AI Creative Prompt Enhancer & Tagline Generator
app.post('/api/ai/suggest-ideas', async (req, res) => {
  const { brandName, industry } = req.body;
  const ai = getGenAIClient();

  if (!ai) {
    return res.json({
      taglines: [
        'Innovate the Future',
        'Crafted with Excellence',
        'Beyond Boundaries',
        'Precision & Vision',
        'The Next Standard',
      ],
      keywords: ['Sleek', 'Futuristic', 'Geometric', 'Authoritative', 'Minimalist'],
      symbolIdeas: [
        'Interlocking dual-arc infinity vortex',
        'Minimalist faceted prism jewel',
        'Dynamic cybernetic apex wing',
        'Architectural structural monogram',
      ],
    });
  }

  try {
    const prompt = `For a brand named "${brandName}" in the "${industry || 'General'}" industry, generate:
1. 5 punchy memorable brand taglines (2-4 words each).
2. 5 visual style keywords.
3. 4 concrete creative logo symbol mark ideas describing exact geometric shapes, icons, or visual metaphors.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            taglines: { type: Type.ARRAY, items: { type: Type.STRING } },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            symbolIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['taglines', 'keywords', 'symbolIdeas'],
        },
      },
    });

    return res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    return res.json({
      taglines: ['Innovate Without Limits', 'Pioneering Tomorrow', 'Quality Defined'],
      keywords: ['Modern', 'Bold', 'Iconic'],
      symbolIdeas: ['Hexagonal node network', 'Stylized aerodynamic apex'],
    });
  }
});

// Windows PC Batch Launcher Download Endpoint
app.get('/api/desktop/windows-launcher', (req, res) => {
  const batScript = `@echo off
title VectorCraft Desktop Studio
cd /d "%~dp0"
echo Starting VectorCraft Desktop Studio (100% Offline Local)...
set "HTML_FILE=%~dp0VectorCraft.html"

:: Check for Microsoft Edge App Mode
start msedge.exe --app="file:///%HTML_FILE:\\=/%" --window-size=1440,900
if %errorlevel% == 0 goto done

:: Fallback to Google Chrome App Mode
start chrome.exe --app="file:///%HTML_FILE:\\=/%" --window-size=1440,900
if %errorlevel% == 0 goto done

:: Fallback to default browser
start "" "%HTML_FILE%"

:done
exit
`;

  res.setHeader('Content-Disposition', 'attachment; filename="Launch-VectorCraft-Desktop.bat"');
  res.setHeader('Content-Type', 'application/x-bat');
  res.send(batScript);
});

// Standalone Offline HTML Download Endpoint
app.get('/api/desktop/download-html', (req, res) => {
  const htmlPath = path.resolve(__dirname, 'public', 'VectorCraft.html');
  res.setHeader('Content-Disposition', 'attachment; filename="VectorCraft.html"');
  res.setHeader('Content-Type', 'text/html;charset=utf-8');
  res.sendFile(htmlPath);
});

// Serve frontend in development via Vite middlewares or production via dist
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VectorCraft Studio running at http://localhost:${PORT}`);
  });
}

startServer();
