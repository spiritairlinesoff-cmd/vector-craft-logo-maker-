import React, { useState, useRef } from 'react';
import { Sparkles, LayoutTemplate, Shapes, Type, Shield, Palette, Layout, Search, Plus, Check, RefreshCw, Wand2, Upload } from 'lucide-react';
import { LogoConfig, ColorPalette, TemplatePreset } from '../types/logo';
import { VECTOR_SHAPES, VectorShape } from '../data/vectorShapes';
import { COLOR_PALETTES } from '../data/colorPalettes';
import { PRESET_TEMPLATES } from '../data/presetTemplates';

interface ToolboxSidebarProps {
  logo: LogoConfig;
  onUpdateLogo: (updater: (prev: LogoConfig) => LogoConfig) => void;
  onOpenAIDesigner: () => void;
  onSelectElement: (el: 'symbol' | 'brandText' | 'tagline' | 'badge' | 'background') => void;
}

type TabType = 'ai' | 'templates' | 'symbols' | 'typography' | 'badges' | 'colors' | 'layouts';

const GOOGLE_FONTS = [
  { name: 'Montserrat', family: 'Montserrat', style: 'Modern & Clean' },
  { name: 'Inter', family: 'Inter', style: 'Neutral Tech' },
  { name: 'Cinzel', family: 'Cinzel', style: 'Luxury Roman Serif' },
  { name: 'Playfair Display', family: 'Playfair Display', style: 'Editorial Elegance' },
  { name: 'Orbitron', family: 'Orbitron', style: 'Futuristic Sci-Fi' },
  { name: 'Space Grotesk', family: 'Space Grotesk', style: 'Contemporary Tech' },
  { name: 'Syne', family: 'Syne', style: 'Bold Editorial' },
  { name: 'Outfit', family: 'Outfit', style: 'Minimal Geometric' },
  { name: 'Plus Jakarta Sans', family: 'Plus Jakarta Sans', style: 'SaaS Modern' },
  { name: 'Righteous', family: 'Righteous', style: 'Retro Pop & Gaming' },
];

export const ToolboxSidebar: React.FC<ToolboxSidebarProps> = ({
  logo,
  onUpdateLogo,
  onOpenAIDesigner,
  onSelectElement,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('symbols');
  const [symbolCategory, setSymbolCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [customSvgPath, setCustomSvgPath] = useState('');

  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onUpdateLogo((prev) => ({
          ...prev,
          symbol: {
            ...prev.symbol,
            type: 'image',
            imageUrl: reader.result as string,
            name: file.name,
            scale: 1.1,
          },
        }));
        onSelectElement('symbol');
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  // Filter shapes
  const filteredShapes = VECTOR_SHAPES.filter((shape) => {
    const matchesCategory = symbolCategory === 'All' || shape.category === symbolCategory;
    const matchesSearch = shape.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['All', 'Abstract & Geometric', 'Tech & Cyber', 'Crest & Heraldry', 'Nature & Eco', 'Animals & Mascots', 'Minimalist', 'Badges'];

  // Apply Palette
  const applyPalette = (pal: ColorPalette) => {
    onUpdateLogo((prev) => ({
      ...prev,
      palette: pal.colors,
      background: {
        ...prev.background,
        color: pal.bg,
      },
      symbol: {
        ...prev.symbol,
        fillColor: pal.primary,
        strokeColor: pal.accent,
        gradient: prev.symbol.gradient
          ? {
              ...prev.symbol.gradient,
              from: pal.primary,
              to: pal.secondary,
            }
          : undefined,
      },
      brandText: {
        ...prev.brandText,
        color: pal.colors[4] || '#ffffff',
      },
      taglineText: {
        ...prev.taglineText,
        color: pal.secondary,
      },
      badge: {
        ...prev.badge,
        strokeColor: pal.primary,
        fillColor: pal.bg,
      },
    }));
  };

  // Apply Layout
  const applyLayout = (layoutType: LogoConfig['layout']) => {
    onUpdateLogo((prev) => {
      let symOffsetY = -35;
      let symOffsetX = 0;
      let brandOffsetY = 80;
      let brandOffsetX = 0;
      let tagOffsetY = 130;
      let tagOffsetX = 0;
      let badgeShape = prev.badge.shape;

      if (layoutType === 'horizontal') {
        symOffsetX = -130;
        symOffsetY = 0;
        brandOffsetX = 70;
        brandOffsetY = -15;
        tagOffsetX = 70;
        tagOffsetY = 25;
      } else if (layoutType === 'stacked') {
        symOffsetY = -40;
        symOffsetX = 0;
        brandOffsetY = 80;
        brandOffsetX = 0;
        tagOffsetY = 130;
        tagOffsetX = 0;
      } else if (layoutType === 'badge') {
        badgeShape = badgeShape === 'none' ? 'circle' : badgeShape;
        symOffsetY = -30;
        symOffsetX = 0;
        brandOffsetY = 75;
        brandOffsetX = 0;
        tagOffsetY = 120;
        tagOffsetX = 0;
      } else if (layoutType === 'monogram') {
        symOffsetY = 0;
        symOffsetX = 0;
        brandOffsetY = 120;
        brandOffsetX = 0;
        tagOffsetY = 160;
        tagOffsetX = 0;
      } else if (layoutType === 'inverted') {
        brandOffsetY = -110;
        symOffsetY = 0;
        tagOffsetY = 120;
      }

      return {
        ...prev,
        layout: layoutType,
        symbol: { ...prev.symbol, offsetX: symOffsetX, offsetY: symOffsetY },
        brandText: { ...prev.brandText, offsetX: brandOffsetX, offsetY: brandOffsetY },
        taglineText: { ...prev.taglineText, offsetX: tagOffsetX, offsetY: tagOffsetY },
        badge: { ...prev.badge, shape: badgeShape },
      };
    });
  };

  return (
    <aside className="w-80 sm:w-96 h-full flex flex-col bg-slate-900 border-r border-slate-800 shrink-0 select-none z-10">
      
      {/* Top Tabs Switcher */}
      <div className="flex items-center gap-1 p-2 bg-slate-950/80 border-b border-slate-800 overflow-x-auto scrollbar-none">
        {[
          { id: 'ai', label: 'AI Studio', icon: Sparkles, color: 'text-purple-400' },
          { id: 'symbols', label: 'Marks', icon: Shapes, color: 'text-indigo-400' },
          { id: 'typography', label: 'Type', icon: Type, color: 'text-sky-400' },
          { id: 'templates', label: 'Presets', icon: LayoutTemplate, color: 'text-amber-400' },
          { id: 'colors', label: 'Colors', icon: Palette, color: 'text-emerald-400' },
          { id: 'badges', label: 'Frames', icon: Shield, color: 'text-rose-400' },
          { id: 'layouts', label: 'Layout', icon: Layout, color: 'text-cyan-400' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${tab.color}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        
        {/* TAB 1: AI STUDIO */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-indigo-950/70 via-purple-950/50 to-slate-900 border border-purple-500/40 rounded-2xl shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                <h3 className="font-bold text-sm text-white">AI Logo Intelligence</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Let Gemini design 4 complete vector marks, harmonic typography pairings, and palettes from your prompt.
              </p>
              <button
                onClick={onOpenAIDesigner}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-purple-600/30 transition-all cursor-pointer"
              >
                <Wand2 className="w-4 h-4" />
                Open AI Logo Designer
              </button>
            </div>

            {/* Quick AI Tagline generator */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Current Brand Slogan
              </h4>
              <input
                type="text"
                value={logo.taglineText.text}
                onChange={(e) =>
                  onUpdateLogo((prev) => ({
                    ...prev,
                    taglineText: { ...prev.taglineText, text: e.target.value },
                  }))
                }
                placeholder="Enter Tagline..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['INNOVATION FORWARD', 'HAUTE COUTURE', 'DEFINING TOMORROW', 'CYBER INTELLIGENCE', 'BEYOND LIMITS'].map((slogan, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      onUpdateLogo((prev) => ({
                        ...prev,
                        taglineText: { ...prev.taglineText, text: slogan },
                      }))
                    }
                    className="text-[10px] font-medium text-slate-400 hover:text-indigo-300 bg-slate-900 hover:bg-indigo-950/40 px-2 py-1 rounded border border-slate-800 transition-colors"
                  >
                    + {slogan}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MARKS & SYMBOLS */}
        {activeTab === 'symbols' && (
          <div className="space-y-4">
            {/* Custom Logo Upload Action */}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*,.png,.jpg,.jpeg,.webp,.svg,.gif,.avif,.bmp,.ico"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <button
              onClick={() => logoInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-purple-950/40 hover:bg-purple-900/50 text-purple-200 border border-purple-500/40 hover:border-purple-500 rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-purple-400" />
              <span>Upload Custom Logo (PNG, SVG, JPG...)</span>
            </button>

            {/* Search and Category Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 80+ vector marks..."
                className="w-full pl-8 pr-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Category Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSymbolCategory(cat)}
                  className={`px-2.5 py-1 text-[11px] font-medium whitespace-nowrap rounded-lg border transition-all ${
                    symbolCategory === cat
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid of Vector Marks */}
            <div className="grid grid-cols-4 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredShapes.map((shape) => {
                const isSelected = logo.symbol.svgPath === shape.path;
                return (
                  <button
                    key={shape.id}
                    onClick={() => {
                      onUpdateLogo((prev) => ({
                        ...prev,
                        symbol: {
                          ...prev.symbol,
                          id: shape.id,
                          name: shape.name,
                          svgPath: shape.path,
                          viewBox: shape.viewBox,
                        },
                      }));
                      onSelectElement('symbol');
                    }}
                    title={shape.name}
                    className={`h-16 flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-indigo-600/25 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-900/30'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-100 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <svg viewBox={shape.viewBox} className="w-8 h-8 fill-current drop-shadow-sm">
                      <path d={shape.path} />
                    </svg>
                  </button>
                );
              })}
            </div>

            {/* Custom SVG Path Accordion */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                Paste Custom SVG Path
              </span>
              <input
                type="text"
                value={customSvgPath}
                onChange={(e) => setCustomSvgPath(e.target.value)}
                placeholder="M10 20 L50 90 Z..."
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <button
                disabled={!customSvgPath.trim()}
                onClick={() => {
                  if (customSvgPath.trim()) {
                    onUpdateLogo((prev) => ({
                      ...prev,
                      symbol: {
                        ...prev.symbol,
                        svgPath: customSvgPath.trim(),
                      },
                    }));
                    setCustomSvgPath('');
                  }
                }}
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-medium rounded-lg transition-colors"
              >
                Apply Custom Vector Path
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: TYPOGRAPHY */}
        {activeTab === 'typography' && (
          <div className="space-y-4">
            {/* Brand Text Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Brand Name Text
              </label>
              <input
                type="text"
                value={logo.brandText.text}
                onChange={(e) =>
                  onUpdateLogo((prev) => ({
                    ...prev,
                    brandText: { ...prev.brandText, text: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 bg-slate-950/70 border border-slate-700 rounded-xl text-white font-bold tracking-wide text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Tagline Text Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Tagline Text
              </label>
              <input
                type="text"
                value={logo.taglineText.text}
                onChange={(e) =>
                  onUpdateLogo((prev) => ({
                    ...prev,
                    taglineText: { ...prev.taglineText, text: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 bg-slate-950/70 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Google Font Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Primary Brand Font
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {GOOGLE_FONTS.map((font) => {
                  const isSelected = logo.brandText.fontFamily === font.family;
                  return (
                    <button
                      key={font.family}
                      onClick={() =>
                        onUpdateLogo((prev) => ({
                          ...prev,
                          brandText: { ...prev.brandText, fontFamily: font.family },
                        }))
                      }
                      className={`p-2 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'bg-indigo-600/30 border-indigo-500 text-white'
                          : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className="text-xs font-bold truncate"
                        style={{ fontFamily: font.family }}
                      >
                        {font.name}
                      </div>
                      <div className="text-[10px] text-slate-400">{font.style}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Size & Spacing Controls */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Font Size</span>
                  <span className="font-mono text-slate-200">{logo.brandText.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={logo.brandText.fontSize}
                  onChange={(e) =>
                    onUpdateLogo((prev) => ({
                      ...prev,
                      brandText: { ...prev.brandText, fontSize: Number(e.target.value) },
                    }))
                  }
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Letter Spacing (Tracking)</span>
                  <span className="font-mono text-slate-200">{logo.brandText.letterSpacing}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={logo.brandText.letterSpacing}
                  onChange={(e) =>
                    onUpdateLogo((prev) => ({
                      ...prev,
                      brandText: { ...prev.brandText, letterSpacing: Number(e.target.value) },
                    }))
                  }
                  className="w-full accent-indigo-500"
                />
              </div>

              {/* Text Transform */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-400">Case</span>
                <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                  {(['uppercase', 'capitalize', 'none'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() =>
                        onUpdateLogo((prev) => ({
                          ...prev,
                          brandText: { ...prev.brandText, textTransform: t },
                        }))
                      }
                      className={`px-2 py-0.5 text-[11px] font-semibold rounded capitalize ${
                        logo.brandText.textTransform === t
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {t === 'none' ? 'as-is' : t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Curved / Arc Text Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-300 font-medium">Curved Arc Text</span>
                <button
                  onClick={() =>
                    onUpdateLogo((prev) => ({
                      ...prev,
                      brandText: { ...prev.brandText, isCurved: !prev.brandText.isCurved },
                    }))
                  }
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    logo.brandText.isCurved
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {logo.brandText.isCurved ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TEMPLATES */}
        {activeTab === 'templates' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Select any pre-configured designer layout to instantly replace current canvas.
            </p>
            <div className="space-y-2.5">
              {PRESET_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => onUpdateLogo(() => tmpl.config)}
                  className="p-3 bg-slate-950/70 border border-slate-800 hover:border-indigo-500 rounded-xl cursor-pointer transition-all hover:shadow-lg flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: tmpl.previewColor }}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {tmpl.title}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {tmpl.industry} • {tmpl.style}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Load →
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: COLORS & PALETTES */}
        {activeTab === 'colors' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                1-Click Harmony Palettes
              </span>
              <div className="space-y-2">
                {COLOR_PALETTES.map((pal, idx) => (
                  <div
                    key={idx}
                    onClick={() => applyPalette(pal)}
                    className="p-2.5 bg-slate-950/70 border border-slate-800 hover:border-indigo-500 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">
                        {pal.name}
                      </div>
                      <div className="text-[10px] text-slate-500">{pal.category}</div>
                    </div>
                    <div className="flex -space-x-1">
                      {pal.colors.map((c, i) => (
                        <span
                          key={i}
                          className="w-4 h-4 rounded-full border border-slate-800"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manual Color Customizer */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Manual Color Adjustments
              </span>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Mark Primary Fill</span>
                <input
                  type="color"
                  value={logo.symbol.fillColor}
                  onChange={(e) =>
                    onUpdateLogo((prev) => ({
                      ...prev,
                      symbol: { ...prev.symbol, fillColor: e.target.value },
                    }))
                  }
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Brand Text Color</span>
                <input
                  type="color"
                  value={logo.brandText.color}
                  onChange={(e) =>
                    onUpdateLogo((prev) => ({
                      ...prev,
                      brandText: { ...prev.brandText, color: e.target.value },
                    }))
                  }
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Background Canvas</span>
                <input
                  type="color"
                  value={logo.background.color}
                  onChange={(e) =>
                    onUpdateLogo((prev) => ({
                      ...prev,
                      background: { ...prev.background, color: e.target.value },
                    }))
                  }
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: BADGES & FRAMES */}
        {activeTab === 'badges' && (
          <div className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Badge & Enclosure Shape
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'none', label: 'None' },
                { id: 'circle', label: 'Circle' },
                { id: 'double_circle', label: 'Double Ring' },
                { id: 'shield', label: 'Shield' },
                { id: 'hexagon', label: 'Hexagon' },
                { id: 'diamond', label: 'Diamond' },
                { id: 'rounded_rect', label: 'Rounded' },
                { id: 'stamp', label: 'Stamp Seal' },
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    onUpdateLogo((prev) => ({
                      ...prev,
                      badge: { ...prev.badge, shape: b.id as any },
                    }));
                    onSelectElement('badge');
                  }}
                  className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                    logo.badge.shape === b.id
                      ? 'bg-indigo-600/30 border-indigo-500 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            {logo.badge.shape !== 'none' && (
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Frame Stroke Width</span>
                    <span className="font-mono text-slate-200">{logo.badge.strokeWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={logo.badge.strokeWidth}
                    onChange={(e) =>
                      onUpdateLogo((prev) => ({
                        ...prev,
                        badge: { ...prev.badge, strokeWidth: Number(e.target.value) },
                      }))
                    }
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Frame Stroke Color</span>
                  <input
                    type="color"
                    value={logo.badge.strokeColor}
                    onChange={(e) =>
                      onUpdateLogo((prev) => ({
                        ...prev,
                        badge: { ...prev.badge, strokeColor: e.target.value },
                      }))
                    }
                    className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: LAYOUTS */}
        {activeTab === 'layouts' && (
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Composition Layout
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'stacked', label: 'Stacked Center', desc: 'Symbol top, typography below' },
                { id: 'horizontal', label: 'Horizontal Lockup', desc: 'Symbol left, typography right' },
                { id: 'badge', label: 'Emblem Seal', desc: 'Contained inside circular or shield badge' },
                { id: 'monogram', label: 'Monogram Centric', desc: 'Prominent central mark' },
                { id: 'inverted', label: 'Inverted Header', desc: 'Brand name above symbol' },
              ].map((l) => (
                <button
                  key={l.id}
                  onClick={() => applyLayout(l.id as any)}
                  className={`p-3 text-left rounded-xl border transition-all ${
                    logo.layout === l.id
                      ? 'bg-indigo-600/30 border-indigo-500 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-200">{l.label}</div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-snug">{l.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
