import React, { useState } from 'react';
import { Sparkles, Wand2, Layers, Compass, Palette, RefreshCw, X, ArrowRight, Check, AlertCircle, Shuffle, Lightbulb } from 'lucide-react';
import { LogoConfig } from '../types/logo';
import confetti from 'canvas-confetti';

interface AIDesignerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyLogo: (logo: LogoConfig) => void;
  initialBrandName?: string;
  initialTagline?: string;
}

const INDUSTRIES = [
  { id: 'tech_ai', label: 'Tech & AI', icon: '⚡' },
  { id: 'gaming', label: 'Gaming & Esports', icon: '🎮' },
  { id: 'luxury', label: 'Luxury & Fashion', icon: '👑' },
  { id: 'coffee', label: 'Coffee & Cafe', icon: '☕' },
  { id: 'fitness', label: 'Fitness & Gym', icon: '🏋️' },
  { id: 'creative', label: 'Creative Studio', icon: '🎨' },
  { id: 'finance', label: 'Finance & Legal', icon: '⚖️' },
  { id: 'eco', label: 'Eco & Nature', icon: '🌿' },
  { id: 'security', label: 'Cyber & Security', icon: '🛡️' },
  { id: 'music', label: 'Music & Audio', icon: '🎵' },
];

const STYLES = [
  { id: 'modern_minimal', label: 'Modern Minimalist', desc: 'Clean, balanced geometry with crisp typography' },
  { id: 'tech_cyber', label: 'Cyber & Tech Glow', desc: 'Sharp angles, futuristic neon gradients' },
  { id: 'luxury_serif', label: 'Luxury Heritage Crest', desc: 'Refined serif typography and imperial gold' },
  { id: 'geometric_abstract', label: 'Geometric Abstract', desc: 'Intricate prisms, polygons and optical balance' },
  { id: 'vintage_badge', label: 'Vintage Emblem Badge', desc: 'Framed seal aesthetic with established styling' },
  { id: 'playful_bold', label: 'Bold & Dynamic', desc: 'High-impact silhouettes and vibrant energy' },
];

const COLOR_MOODS = [
  { id: 'vibrant_gradient', label: 'Electric Violet & Cyan', colors: ['#6366f1', '#06b6d4'] },
  { id: 'cyber_neon', label: 'Cyberpunk Pink & Neon', colors: ['#ec4899', '#8b5cf6'] },
  { id: 'regal_gold', label: 'Royal Gold & Onyx', colors: ['#f59e0b', '#1c1917'] },
  { id: 'emerald_mint', label: 'Emerald Mint & Forest', colors: ['#10b981', '#059669'] },
  { id: 'sunset_crimson', label: 'Sunset Crimson & Coral', colors: ['#f43f5e', '#fb923c'] },
  { id: 'monochrome_minimal', label: 'Monochrome Titanium', colors: ['#ffffff', '#0f172a'] },
];

const SURPRISE_BRANDS = [
  { name: 'NEXUS AI', tag: 'INTELLIGENCE SYNTHESIS', ind: 'Tech & AI', style: 'tech_cyber', mood: 'vibrant_gradient', brief: 'Sleek neural node network with dynamic forward motion' },
  { name: 'VALKYRIE', tag: 'ESPORTS DIVISION', ind: 'Gaming & Esports', style: 'tech_cyber', mood: 'cyber_neon', brief: 'Fierce winged geometric crest with sharp combat angles' },
  { name: 'AURELIA', tag: 'HAUTE PARFUMERIE', ind: 'Luxury & Fashion', style: 'luxury_serif', mood: 'regal_gold', brief: 'Regal golden starburst seal with timeless serif authority' },
  { name: 'SOLARIS', tag: 'CLEAN ENERGY VENTURES', ind: 'Eco & Nature', style: 'modern_minimal', mood: 'emerald_mint', brief: 'Interlocking sunburst and leaf arcs representing sustainable power' },
  { name: 'IRONCLAD', tag: 'CYBER DEFENSE CORP', ind: 'Cyber & Security', style: 'vintage_badge', mood: 'monochrome_minimal', brief: 'Heavy angular knight shield mark with high-tech circuitry' },
];

export const AIDesignerModal: React.FC<AIDesignerModalProps> = ({
  isOpen,
  onClose,
  onApplyLogo,
  initialBrandName = '',
  initialTagline = '',
}) => {
  const [brandName, setBrandName] = useState(initialBrandName || 'AURA');
  const [tagline, setTagline] = useState(initialTagline || 'NEXT-GEN STUDIO');
  const [selectedIndustry, setSelectedIndustry] = useState('Tech & AI');
  const [selectedStyle, setSelectedStyle] = useState('modern_minimal');
  const [selectedColorMood, setSelectedColorMood] = useState('vibrant_gradient');
  const [customPrompt, setCustomPrompt] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [generatedConcepts, setGeneratedConcepts] = useState<any[]>([]);
  const [generationError, setGenerationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSurpriseMe = () => {
    const pick = SURPRISE_BRANDS[Math.floor(Math.random() * SURPRISE_BRANDS.length)];
    setBrandName(pick.name);
    setTagline(pick.tag);
    setSelectedIndustry(pick.ind);
    setSelectedStyle(pick.style);
    setSelectedColorMood(pick.mood);
    setCustomPrompt(pick.brief);
  };

  const handleGenerate = async () => {
    if (!brandName.trim()) {
      alert('Please enter a Brand Name');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setLoadingStep(1);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 900);

    try {
      const res = await fetch('/api/ai/design-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: brandName.trim(),
          tagline: tagline.trim(),
          industry: selectedIndustry,
          style: selectedStyle,
          colorScheme: selectedColorMood,
          customPrompt: customPrompt.trim(),
        }),
      });

      clearInterval(stepInterval);

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.concepts && data.concepts.length > 0) {
        setGeneratedConcepts(data.concepts);
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        throw new Error('No concepts returned');
      }
    } catch (err: any) {
      console.error(err);
      setGenerationError('Failed to generate with AI. Fallback procedural concepts loaded.');
    } finally {
      clearInterval(stepInterval);
      setIsGenerating(false);
    }
  };

  const convertToLogoConfig = (concept: any): LogoConfig => {
    return {
      id: `logo_${Date.now()}`,
      title: concept.conceptTitle || brandName,
      brandStory: concept.brandStory,
      layout: (concept.layout as any) || 'stacked',
      palette: concept.palette || ['#6366f1', '#06b6d4', '#ffffff'],
      canvasSize: { width: 800, height: 800 },
      symbol: {
        id: `sym_${Date.now()}`,
        name: concept.conceptTitle || 'Symbol Mark',
        svgPath: concept.symbol?.svgPath || 'M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z',
        viewBox: concept.symbol?.viewBox || '0 0 100 100',
        fillType: concept.gradient ? 'gradient' : 'solid',
        fillColor: concept.symbol?.fill?.startsWith('url') ? '#6366f1' : concept.symbol?.fill || '#6366f1',
        gradient: concept.gradient
          ? {
              id: concept.gradient.id || `grad_${Date.now()}`,
              from: concept.gradient.from || '#6366f1',
              to: concept.gradient.to || '#06b6d4',
              angle: concept.gradient.angle || 45,
            }
          : undefined,
        strokeColor: concept.symbol?.stroke || 'none',
        strokeWidth: concept.symbol?.strokeWidth || 0,
        scale: concept.symbol?.scale || 1.1,
        rotation: concept.symbol?.rotation || 0,
        offsetX: 0,
        offsetY: -35,
        opacity: 1,
      },
      brandText: {
        text: concept.brandText?.text || brandName,
        fontFamily: concept.brandText?.fontFamily || 'Montserrat',
        fontSize: concept.brandText?.fontSize || 42,
        fontWeight: concept.brandText?.fontWeight || '800',
        letterSpacing: concept.brandText?.letterSpacing || 6,
        color: concept.brandText?.color || '#ffffff',
        textTransform: (concept.brandText?.textTransform as any) || 'uppercase',
        offsetX: 0,
        offsetY: 80,
        rotation: 0,
      },
      taglineText: {
        text: concept.taglineText?.text || tagline,
        fontFamily: concept.taglineText?.fontFamily || 'Inter',
        fontSize: concept.taglineText?.fontSize || 12,
        fontWeight: concept.taglineText?.fontWeight || '600',
        letterSpacing: concept.taglineText?.letterSpacing || 8,
        color: concept.taglineText?.color || '#94a3b8',
        textTransform: (concept.taglineText?.textTransform as any) || 'uppercase',
        offsetX: 0,
        offsetY: 130,
        rotation: 0,
      },
      badge: {
        shape: (concept.badge?.shape as any) || 'none',
        strokeColor: concept.badge?.stroke || '#3b82f6',
        strokeWidth: concept.badge?.strokeWidth || 2,
        strokeStyle: 'solid',
        fillColor: concept.badge?.fill || 'transparent',
        fillOpacity: 0.5,
        scale: 1,
        rotation: 0,
      },
      background: {
        type: 'solid',
        color: concept.background?.color || '#090d16',
      },
    };
  };

  const handleSelectConcept = (concept: any) => {
    const config = convertToLogoConfig(concept);
    onApplyLogo(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-indigo-950/50 overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                AI Logo Design Studio
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider text-purple-300 bg-purple-500/20 rounded-full border border-purple-500/30">
                  Gemini 3.8 Intelligence
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Provide your brand details and let AI synthesize 4 tailored vector marks, typography, and palettes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSurpriseMe}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
              title="Fill with creative sample prompt"
            >
              <Shuffle className="w-3.5 h-3.5 text-indigo-400" />
              Surprise Me
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Brand Identity Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Brand / Business Name <span className="text-indigo-400">*</span>
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. AURA, VORTEX, SOLARIA"
                className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-medium tracking-wide"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Tagline or Slogan (Optional)
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. INTELLIGENCE REDEFINED"
                className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Industry Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Industry & Niche
            </label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((ind) => (
                <button
                  key={ind.id}
                  type="button"
                  onClick={() => setSelectedIndustry(ind.label)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    selectedIndustry === ind.label
                      ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm shadow-indigo-500/20'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span>{ind.icon}</span>
                  <span>{ind.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Aesthetic Style */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Aesthetic Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-3 text-left rounded-xl border transition-all ${
                    selectedStyle === style.id
                      ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-md shadow-indigo-900/30'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-xs text-slate-200 flex items-center justify-between">
                    <span>{style.label}</span>
                    {selectedStyle === style.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{style.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Color Mood */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Color Harmony Mood
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {COLOR_MOODS.map((mood) => (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => setSelectedColorMood(mood.id)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
                    selectedColorMood === mood.id
                      ? 'bg-slate-800 border-indigo-500 text-white shadow-sm shadow-indigo-500/20'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex -space-x-1 shrink-0">
                    {mood.colors.map((c, i) => (
                      <span
                        key={i}
                        className="w-4 h-4 rounded-full border border-slate-800"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-slate-200 truncate">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Creative Brief */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Specific Creative Brief or Metaphors (Optional)
            </label>
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Include an origami falcon with faceted wings, or a futuristic cyber crown..."
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>

          {/* Generate Action Button */}
          <div className="pt-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 active:scale-[0.99] text-white font-semibold text-sm rounded-xl shadow-xl shadow-purple-900/30 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-200" />
                  <span>
                    {loadingStep === 1 && 'Analyzing Brand Identity & Industry...'}
                    {loadingStep === 2 && 'Synthesizing Precision Vector Geometry...'}
                    {loadingStep >= 3 && 'Harmonizing Typography & Aesthetics...'}
                  </span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate AI Logo Concepts</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Results Showcase */}
          {generatedConcepts.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-800 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Generated Logo Concepts (Select One to Edit)
                </h3>
                <span className="text-xs text-slate-400">{generatedConcepts.length} Concepts Synthesized</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedConcepts.map((concept, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectConcept(concept)}
                    className="group relative p-5 bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-indigo-950/40 flex flex-col justify-between"
                  >
                    {/* SVG Preview Card */}
                    <div
                      className="w-full h-44 rounded-xl flex items-center justify-center relative overflow-hidden mb-3 border border-slate-800/80"
                      style={{ backgroundColor: concept.background?.color || '#090d16' }}
                    >
                      <svg
                        viewBox="0 0 100 100"
                        className="w-20 h-20 transition-transform duration-300 group-hover:scale-110 drop-shadow-lg"
                      >
                        {concept.gradient && (
                          <defs>
                            <linearGradient
                              id={`cardGrad_${idx}`}
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="100%"
                            >
                              <stop offset="0%" stopColor={concept.gradient.from || '#6366f1'} />
                              <stop offset="100%" stopColor={concept.gradient.to || '#06b6d4'} />
                            </linearGradient>
                          </defs>
                        )}
                        <path
                          d={concept.symbol?.svgPath || 'M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z'}
                          fill={concept.gradient ? `url(#cardGrad_${idx})` : concept.symbol?.fill || '#6366f1'}
                          stroke={concept.symbol?.stroke || 'none'}
                          strokeWidth={concept.symbol?.strokeWidth || 0}
                        />
                      </svg>

                      {/* Floating Text in Card */}
                      <div className="absolute bottom-3 text-center w-full px-2">
                        <div
                          className="font-bold text-xs uppercase tracking-widest text-white truncate"
                          style={{ fontFamily: concept.brandText?.fontFamily || 'sans-serif' }}
                        >
                          {concept.brandText?.text || brandName}
                        </div>
                        {concept.taglineText?.text && (
                          <div className="text-[9px] uppercase tracking-wider text-slate-400 truncate opacity-80 mt-0.5">
                            {concept.taglineText.text}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata & Brand Story */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-white group-hover:text-indigo-400 transition-colors">
                          {concept.conceptTitle || `Concept #${idx + 1}`}
                        </span>
                        <div className="flex gap-1">
                          {(concept.palette || []).slice(0, 4).map((c: string, ci: number) => (
                            <span
                              key={ci}
                              className="w-2.5 h-2.5 rounded-full border border-slate-700"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {concept.brandStory}
                      </p>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-medium">
                      <span>Click to open in Editor</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>VectorCraft AI Engine generates precision scalable SVG paths.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
