import React, { useRef } from 'react';
import { Sliders, RotateCw, Move, Sparkles, Layers, Palette, Eye, SunMedium, Upload, Wallpaper, Image as ImageIcon, X, Trash2, Type, Shield, Plus } from 'lucide-react';
import { LogoConfig } from '../types/logo';

interface InspectorPanelProps {
  logo: LogoConfig;
  selectedElement: 'symbol' | 'brandText' | 'tagline' | 'badge' | 'background';
  onUpdateLogo: (updater: (prev: LogoConfig) => LogoConfig) => void;
  onSelectElement: (el: 'symbol' | 'brandText' | 'tagline' | 'badge' | 'background') => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  logo,
  selectedElement,
  onUpdateLogo,
  onSelectElement,
}) => {
  const bgInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const isSymbolDeleted = !logo.symbol.svgPath && !logo.symbol.imageUrl;
  const isBrandTextDeleted = !logo.brandText.text || logo.brandText.text.trim() === '';
  const isTaglineDeleted = !logo.taglineText.text || logo.taglineText.text.trim() === '';
  const isBadgeDeleted = logo.badge.shape === 'none';

  const handleDeleteElement = (el: 'symbol' | 'brandText' | 'tagline' | 'badge' | 'background') => {
    onUpdateLogo((prev) => {
      if (el === 'symbol') {
        return {
          ...prev,
          symbol: {
            ...prev.symbol,
            svgPath: '',
            imageUrl: undefined,
            name: '',
          },
        };
      } else if (el === 'brandText') {
        return {
          ...prev,
          brandText: {
            ...prev.brandText,
            text: '',
          },
        };
      } else if (el === 'tagline') {
        return {
          ...prev,
          taglineText: {
            ...prev.taglineText,
            text: '',
          },
        };
      } else if (el === 'badge') {
        return {
          ...prev,
          badge: {
            ...prev.badge,
            shape: 'none',
          },
        };
      } else if (el === 'background') {
        return {
          ...prev,
          background: {
            ...prev.background,
            image: undefined,
            type: 'solid',
          },
        };
      }
      return prev;
    });
  };

  const handleRestoreElement = (el: 'symbol' | 'brandText' | 'tagline' | 'badge' | 'background') => {
    onUpdateLogo((prev) => {
      if (el === 'symbol') {
        return {
          ...prev,
          symbol: {
            ...prev.symbol,
            name: 'Crown Mark',
            svgPath: 'M50 15 L65 38 L90 32 L75 58 L85 85 L50 72 L15 85 L25 58 L10 32 L35 38 Z',
            viewBox: '0 0 100 100',
            type: 'svg_path',
            scale: 1.1,
            offsetX: 0,
            offsetY: -70,
            opacity: 1,
          },
        };
      } else if (el === 'brandText') {
        return {
          ...prev,
          brandText: {
            ...prev.brandText,
            text: 'VECTORCRAFT',
            fontSize: 42,
            offsetX: 0,
            offsetY: 70,
          },
        };
      } else if (el === 'tagline') {
        return {
          ...prev,
          taglineText: {
            ...prev.taglineText,
            text: 'STUDIO CRAFTED',
            fontSize: 14,
            offsetX: 0,
            offsetY: 110,
          },
        };
      } else if (el === 'badge') {
        return {
          ...prev,
          badge: {
            ...prev.badge,
            shape: 'shield',
            strokeColor: '#6366f1',
            strokeWidth: 4,
            strokeStyle: 'solid',
            fillColor: '#1e1b4b',
            fillOpacity: 0.25,
            scale: 1,
            offsetX: 0,
            offsetY: 0,
          },
        };
      }
      return prev;
    });
    onSelectElement(el);
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onUpdateLogo((prev) => ({
          ...prev,
          background: {
            ...prev.background,
            type: 'image',
            image: {
              url: reader.result as string,
              opacity: 0.9,
              blur: 0,
              fit: 'cover',
            },
          },
        }));
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

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
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };
  return (
    <aside className="w-72 sm:w-80 h-full flex flex-col bg-slate-900 border-l border-slate-800 shrink-0 select-none z-10">
      
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
            Inspector: <span className="text-indigo-400 capitalize">{selectedElement === 'brandText' ? 'Brand Name' : selectedElement}</span>
          </h3>
        </div>
      </div>

      {/* Element Selector Tabs */}
      <div className="p-2 bg-slate-950/40 border-b border-slate-800 grid grid-cols-5 gap-1 text-[10px] font-medium">
        <button
          onClick={() => onSelectElement('symbol')}
          className={`py-1.5 px-1 rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
            selectedElement === 'symbol'
              ? 'bg-indigo-600 text-white font-bold shadow-sm'
              : isSymbolDeleted
              ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-850 border border-dashed border-slate-800'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Edit Logo Symbol / Mark"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isSymbolDeleted ? 'opacity-40' : ''}`} />
          <span>Mark</span>
          {isSymbolDeleted && <span className="text-[8px] text-rose-400 font-normal leading-none">(off)</span>}
        </button>
        <button
          onClick={() => onSelectElement('brandText')}
          className={`py-1.5 px-1 rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
            selectedElement === 'brandText'
              ? 'bg-indigo-600 text-white font-bold shadow-sm'
              : isBrandTextDeleted
              ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-850 border border-dashed border-slate-800'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Edit Brand Text"
        >
          <Type className={`w-3.5 h-3.5 ${isBrandTextDeleted ? 'opacity-40' : ''}`} />
          <span>Brand</span>
          {isBrandTextDeleted && <span className="text-[8px] text-rose-400 font-normal leading-none">(off)</span>}
        </button>
        <button
          onClick={() => onSelectElement('tagline')}
          className={`py-1.5 px-1 rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
            selectedElement === 'tagline'
              ? 'bg-indigo-600 text-white font-bold shadow-sm'
              : isTaglineDeleted
              ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-850 border border-dashed border-slate-800'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Edit Tagline"
        >
          <Type className={`w-3.5 h-3.5 ${isTaglineDeleted ? 'opacity-40' : ''}`} />
          <span>Tagline</span>
          {isTaglineDeleted && <span className="text-[8px] text-rose-400 font-normal leading-none">(off)</span>}
        </button>
        <button
          onClick={() => onSelectElement('badge')}
          className={`py-1.5 px-1 rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
            selectedElement === 'badge'
              ? 'bg-indigo-600 text-white font-bold shadow-sm'
              : isBadgeDeleted
              ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-850 border border-dashed border-slate-800'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Edit Frame / Badge"
        >
          <Shield className={`w-3.5 h-3.5 ${isBadgeDeleted ? 'opacity-40' : ''}`} />
          <span>Badge</span>
          {isBadgeDeleted && <span className="text-[8px] text-rose-400 font-normal leading-none">(off)</span>}
        </button>
        <button
          onClick={() => onSelectElement('background')}
          className={`py-1.5 px-1 rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
            selectedElement === 'background'
              ? 'bg-indigo-600 text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Edit Canvas Background & Custom Images"
        >
          <Wallpaper className="w-3.5 h-3.5" />
          <span>Backgrd</span>
        </button>
      </div>

      {/* Controls Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        
        {/* === SYMBOL INSPECTOR === */}
        {selectedElement === 'symbol' && (
          isSymbolDeleted ? (
            <div className="space-y-4">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*,.png,.jpg,.jpeg,.webp,.svg,.gif,.avif,.bmp,.ico"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <div className="p-4 bg-slate-950/70 border border-dashed border-rose-500/30 rounded-2xl text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Logo Mark is Deleted</h4>
                  <p className="text-slate-400 text-xs mt-1">The logo mark/symbol is currently removed from your canvas.</p>
                </div>
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => handleRestoreElement('symbol')}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Restore Default Vector Mark</span>
                  </button>
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-purple-300 font-semibold rounded-xl border border-purple-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-purple-400" />
                    <span>Upload Custom Image Logo</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
          <div className="space-y-4">
            {/* Custom Logo Upload Card */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2.5">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*,.png,.jpg,.jpeg,.webp,.svg,.gif,.avif,.bmp,.ico"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Logo Mark Source
                </span>
                {logo.symbol.type === 'image' && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold text-purple-300 bg-purple-500/20 rounded border border-purple-500/30">
                    Custom Image
                  </span>
                )}
              </div>

              {logo.symbol.type === 'image' && logo.symbol.imageUrl ? (
                <div className="flex items-center gap-3 p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <img
                    src={logo.symbol.imageUrl}
                    alt="Custom Logo"
                    className="w-10 h-10 object-contain rounded bg-slate-950 border border-slate-800 p-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium text-white truncate">{logo.symbol.name}</div>
                    <button
                      onClick={() =>
                        onUpdateLogo((prev) => ({
                          ...prev,
                          symbol: {
                            ...prev.symbol,
                            type: 'svg_path',
                            imageUrl: undefined,
                            name: 'Vector Mark',
                          },
                        }))
                      }
                      className="text-[10px] text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      Revert to Vector Shape
                    </button>
                  </div>
                </div>
              ) : null}

              <button
                onClick={() => logoInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-purple-400" />
                <span>Upload Custom Logo (PNG, SVG, JPG...)</span>
              </button>
            </div>

            {/* Scale Slider */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Symbol Scale</span>
                <span className="font-mono text-slate-200">{(logo.symbol.scale || 1).toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={logo.symbol.scale || 1}
                onChange={(e) =>
                  onUpdateLogo((prev) => ({
                    ...prev,
                    symbol: { ...prev.symbol, scale: parseFloat(e.target.value) },
                  }))
                }
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Rotation Slider */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Rotation</span>
                <span className="font-mono text-slate-200">{logo.symbol.rotation || 0}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={logo.symbol.rotation || 0}
                onChange={(e) =>
                  onUpdateLogo((prev) => ({
                    ...prev,
                    symbol: { ...prev.symbol, rotation: parseInt(e.target.value, 10) },
                  }))
                }
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Position Offsets */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
              <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-indigo-400" /> Position Alignment
              </span>
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Horizontal (X)</span>
                  <span className="font-mono text-slate-200">{logo.symbol.offsetX}px</span>
                </div>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  value={logo.symbol.offsetX}
                  onChange={(e) =>
                    onUpdateLogo((prev) => ({
                      ...prev,
                      symbol: { ...prev.symbol, offsetX: parseInt(e.target.value, 10) },
                    }))
                  }
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Vertical (Y)</span>
                  <span className="font-mono text-slate-200">{logo.symbol.offsetY}px</span>
                </div>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  value={logo.symbol.offsetY}
                  onChange={(e) =>
                    onUpdateLogo((prev) => ({
                      ...prev,
                      symbol: { ...prev.symbol, offsetY: parseInt(e.target.value, 10) },
                    }))
                  }
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            {/* Fill Mode: Solid vs Gradient */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                  Fill Mode
                </span>
                <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                  {(['solid', 'gradient'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() =>
                        onUpdateLogo((prev) => ({
                          ...prev,
                          symbol: {
                            ...prev.symbol,
                            fillType: mode,
                            gradient:
                              mode === 'gradient'
                                ? prev.symbol.gradient || {
                                    id: 'sym_grad_custom',
                                    from: prev.symbol.fillColor,
                                    to: '#06b6d4',
                                    angle: 45,
                                  }
                                : undefined,
                          },
                        }))
                      }
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded capitalize ${
                        logo.symbol.fillType === mode ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {logo.symbol.fillType === 'solid' ? (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400">Fill Color</span>
                  <input
                    type="color"
                    value={logo.symbol.fillColor}
                    onChange={(e) =>
                      onUpdateLogo((prev) => ({
                        ...prev,
                        symbol: { ...prev.symbol, fillColor: e.target.value },
                      }))
                    }
                    className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                </div>
              ) : (
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Gradient Start</span>
                    <input
                      type="color"
                      value={logo.symbol.gradient?.from || '#6366f1'}
                      onChange={(e) =>
                        onUpdateLogo((prev) => ({
                          ...prev,
                          symbol: {
                            ...prev.symbol,
                            gradient: {
                              id: prev.symbol.gradient?.id || 'grad_1',
                              from: e.target.value,
                              to: prev.symbol.gradient?.to || '#06b6d4',
                              angle: prev.symbol.gradient?.angle || 45,
                            },
                          },
                        }))
                      }
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Gradient End</span>
                    <input
                      type="color"
                      value={logo.symbol.gradient?.to || '#06b6d4'}
                      onChange={(e) =>
                        onUpdateLogo((prev) => ({
                          ...prev,
                          symbol: {
                            ...prev.symbol,
                            gradient: {
                              id: prev.symbol.gradient?.id || 'grad_1',
                              from: prev.symbol.gradient?.from || '#6366f1',
                              to: e.target.value,
                              angle: prev.symbol.gradient?.angle || 45,
                            },
                          },
                        }))
                      }
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Gradient Angle</span>
                      <span className="font-mono text-slate-200">{logo.symbol.gradient?.angle || 45}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={logo.symbol.gradient?.angle || 45}
                      onChange={(e) =>
                        onUpdateLogo((prev) => ({
                          ...prev,
                          symbol: {
                            ...prev.symbol,
                            gradient: {
                              id: prev.symbol.gradient?.id || 'grad_1',
                              from: prev.symbol.gradient?.from || '#6366f1',
                              to: prev.symbol.gradient?.to || '#06b6d4',
                              angle: parseInt(e.target.value, 10),
                            },
                          },
                        }))
                      }
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Neon Glow & Shadow */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                  Atmospheric Glow
                </span>
                <button
                  onClick={() =>
                    onUpdateLogo((prev) => ({
                      ...prev,
                      symbol: {
                        ...prev.symbol,
                        glow: prev.symbol.glow && prev.symbol.glow.blur > 0
                          ? undefined
                          : { color: prev.symbol.fillColor, blur: 16 },
                      },
                    }))
                  }
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                    logo.symbol.glow && logo.symbol.glow.blur > 0
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {logo.symbol.glow && logo.symbol.glow.blur > 0 ? 'Active' : 'Off'}
                </button>
              </div>

              {logo.symbol.glow && logo.symbol.glow.blur > 0 && (
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Glow Radius</span>
                    <span className="font-mono text-slate-200">{logo.symbol.glow.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="40"
                    value={logo.symbol.glow.blur}
                    onChange={(e) =>
                      onUpdateLogo((prev) => ({
                        ...prev,
                        symbol: {
                          ...prev.symbol,
                          glow: {
                            color: prev.symbol.glow?.color || prev.symbol.fillColor,
                            blur: parseInt(e.target.value, 10),
                          },
                        },
                      }))
                    }
                    className="w-full accent-purple-500"
                  />
                </div>
              )}
            </div>

              {/* DANGER ZONE: DELETE LOGO MARK */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleDeleteElement('symbol')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 hover:border-rose-500/50 rounded-xl transition-all cursor-pointer font-semibold shadow-sm"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>Delete Logo Mark</span>
                  <span className="text-[10px] text-rose-400/80 font-normal bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-500/20">Del key</span>
                </button>
              </div>
            </div>
          )
        )}

        {/* === BRAND TEXT INSPECTOR === */}
        {selectedElement === 'brandText' && (
          isBrandTextDeleted ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/70 border border-dashed border-rose-500/30 rounded-2xl text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Brand Name is Deleted</h4>
                  <p className="text-slate-400 text-xs mt-1">The main brand name text is currently removed from your canvas.</p>
                </div>
                <button
                  onClick={() => handleRestoreElement('brandText')}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Brand Name</span>
                </button>
              </div>
            </div>
          ) : (
          <div className="space-y-4">
            <div>
              <label className="text-slate-400 mb-1 block">Brand Name</label>
              <input
                type="text"
                value={logo.brandText.text}
                onChange={(e) =>
                  onUpdateLogo((prev) => ({
                    ...prev,
                    brandText: { ...prev.brandText, text: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 bg-slate-950/70 border border-slate-700 rounded-lg text-white font-semibold"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
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
                    brandText: { ...prev.brandText, fontSize: parseInt(e.target.value, 10) },
                  }))
                }
                className="w-full accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
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
                    brandText: { ...prev.brandText, letterSpacing: parseInt(e.target.value, 10) },
                  }))
                }
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Rotation Slider */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Rotation</span>
                <span className="font-mono text-slate-200">{logo.brandText.rotation || 0}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={logo.brandText.rotation || 0}
                onChange={(e) =>
                  onUpdateLogo((prev) => ({
                    ...prev,
                    brandText: { ...prev.brandText, rotation: parseInt(e.target.value, 10) },
                  }))
                }
                className="w-full accent-indigo-500"
              />
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
              <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-indigo-400" /> Position Alignment (or drag with cursor)
              </span>
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Horizontal (X)</span>
                  <span className="font-mono text-slate-200">{logo.brandText.offsetX}px</span>
                </div>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  value={logo.brandText.offsetX}
                  onChange={(e) =>
                    onUpdateLogo((prev) => ({
                      ...prev,
                      brandText: { ...prev.brandText, offsetX: parseInt(e.target.value, 10) },
                    }))
                  }
                  className="w-full accent-indigo-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Vertical (Y)</span>
                  <span className="font-mono text-slate-200">{logo.brandText.offsetY}px</span>
                </div>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  value={logo.brandText.offsetY}
                  onChange={(e) =>
                    onUpdateLogo((prev) => ({
                      ...prev,
                      brandText: { ...prev.brandText, offsetY: parseInt(e.target.value, 10) },
                    }))
                  }
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Text Color</span>
              <input
                type="color"
                value={logo.brandText.color}
                onChange={(e) =>
                  onUpdateLogo((prev) => ({
                    ...prev,
                    brandText: { ...prev.brandText, color: e.target.value },
                  }))
                }
                className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
            </div>

            {/* DANGER ZONE: DELETE BRAND TEXT */}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => handleDeleteElement('brandText')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 hover:border-rose-500/50 rounded-xl transition-all cursor-pointer font-semibold shadow-sm"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Delete Brand Name</span>
                <span className="text-[10px] text-rose-400/80 font-normal bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-500/20">Del key</span>
              </button>
            </div>
          </div>
          )
        )}

        {/* === TAGLINE INSPECTOR === */}
        {selectedElement === 'tagline' && (
          isTaglineDeleted ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/70 border border-dashed border-rose-500/30 rounded-2xl text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Tagline is Deleted</h4>
                  <p className="text-slate-400 text-xs mt-1">The slogan/tagline text is currently hidden from the canvas.</p>
                </div>
                <button
                  onClick={() => handleRestoreElement('tagline')}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Tagline Slogan</span>
                </button>
              </div>
            </div>
          ) : (
          <div className="space-y-4">
            <div>
              <label className="text-slate-400 mb-1 block">Tagline Slogan</label>
              <input
                type="text"
                value={logo.taglineText.text}
                onChange={(e) =>
                  onUpdateLogo((prev) => ({
                    ...prev,
                    taglineText: { ...prev.taglineText, text: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 bg-slate-950/70 border border-slate-700 rounded-lg text-white text-xs"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Font Size</span>
                <span className="font-mono text-slate-200">{logo.taglineText.fontSize}px</span>
              </div>
              <input
                type="range"
                min="8"
                max="32"
                value={logo.taglineText.fontSize}
                onChange={(e) =>
                  onUpdateLogo((prev) => ({
                    ...prev,
                    taglineText: { ...prev.taglineText, fontSize: parseInt(e.target.value, 10) },
                  }))
                }
                className="w-full accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Letter Spacing</span>
                <span className="font-mono text-slate-200">{logo.taglineText.letterSpacing}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={logo.taglineText.letterSpacing}
                onChange={(e) =>
                  onUpdateLogo((prev) => ({
                    ...prev,
                    taglineText: { ...prev.taglineText, letterSpacing: parseInt(e.target.value, 10) },
                  }))
                }
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Rotation Slider */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Rotation</span>
                <span className="font-mono text-slate-200">{logo.taglineText.rotation || 0}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={logo.taglineText.rotation || 0}
                onChange={(e) =>
                  onUpdateLogo((prev) => ({
                    ...prev,
                    taglineText: { ...prev.taglineText, rotation: parseInt(e.target.value, 10) },
                  }))
                }
                className="w-full accent-indigo-500"
              />
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
              <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-indigo-400" /> Position Alignment (or drag with cursor)
              </span>
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Horizontal (X)</span>
                  <span className="font-mono text-slate-200">{logo.taglineText.offsetX}px</span>
                </div>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  value={logo.taglineText.offsetX}
                  onChange={(e) =>
                    onUpdateLogo((prev) => ({
                      ...prev,
                      taglineText: { ...prev.taglineText, offsetX: parseInt(e.target.value, 10) },
                    }))
                  }
                  className="w-full accent-indigo-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Vertical (Y)</span>
                  <span className="font-mono text-slate-200">{logo.taglineText.offsetY}px</span>
                </div>
                <input
                  type="range"
                  min="-200"
                  max="250"
                  value={logo.taglineText.offsetY}
                  onChange={(e) =>
                    onUpdateLogo((prev) => ({
                      ...prev,
                      taglineText: { ...prev.taglineText, offsetY: parseInt(e.target.value, 10) },
                    }))
                  }
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Tagline Color</span>
              <input
                type="color"
                value={logo.taglineText.color}
                onChange={(e) =>
                  onUpdateLogo((prev) => ({
                    ...prev,
                    taglineText: { ...prev.taglineText, color: e.target.value },
                  }))
                }
                className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
            </div>

            {/* DANGER ZONE: DELETE TAGLINE */}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => handleDeleteElement('tagline')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 hover:border-rose-500/50 rounded-xl transition-all cursor-pointer font-semibold shadow-sm"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Delete Tagline</span>
                <span className="text-[10px] text-rose-400/80 font-normal bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-500/20">Del key</span>
              </button>
            </div>
          </div>
          )
        )}

        {/* === BADGE INSPECTOR === */}
        {selectedElement === 'badge' && (
          isBadgeDeleted ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/70 border border-dashed border-rose-500/30 rounded-2xl text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Badge Frame is Deleted</h4>
                  <p className="text-slate-400 text-xs mt-1">There is no active badge frame surrounding the logo elements.</p>
                </div>
                <button
                  onClick={() => handleRestoreElement('badge')}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Shield / Badge Frame</span>
                </button>
              </div>
            </div>
          ) : (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Badge Scale</span>
                <span className="font-mono text-slate-200">{(logo.badge.scale || 1).toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.5"
                step="0.05"
                value={logo.badge.scale || 1}
                onChange={(e) =>
                  onUpdateLogo((prev) => ({
                    ...prev,
                    badge: { ...prev.badge, scale: parseFloat(e.target.value) },
                  }))
                }
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Badge Rotation Slider */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Badge Rotation</span>
                <span className="font-mono text-slate-200">{logo.badge.rotation || 0}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={logo.badge.rotation || 0}
                onChange={(e) =>
                  onUpdateLogo((prev) => ({
                    ...prev,
                    badge: { ...prev.badge, rotation: parseInt(e.target.value, 10) },
                  }))
                }
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Badge Position Offsets */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
              <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-indigo-400" /> Frame Position (or drag with cursor)
              </span>
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Horizontal (X)</span>
                  <span className="font-mono text-slate-200">{logo.badge.offsetX || 0}px</span>
                </div>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  value={logo.badge.offsetX || 0}
                  onChange={(e) =>
                    onUpdateLogo((prev) => ({
                      ...prev,
                      badge: { ...prev.badge, offsetX: parseInt(e.target.value, 10) },
                    }))
                  }
                  className="w-full accent-indigo-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Vertical (Y)</span>
                  <span className="font-mono text-slate-200">{logo.badge.offsetY || 0}px</span>
                </div>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  value={logo.badge.offsetY || 0}
                  onChange={(e) =>
                    onUpdateLogo((prev) => ({
                      ...prev,
                      badge: { ...prev.badge, offsetY: parseInt(e.target.value, 10) },
                    }))
                  }
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Border Width</span>
                <span className="font-mono text-slate-200">{logo.badge.strokeWidth}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={logo.badge.strokeWidth}
                onChange={(e) =>
                  onUpdateLogo((prev) => ({
                    ...prev,
                    badge: { ...prev.badge, strokeWidth: parseInt(e.target.value, 10) },
                  }))
                }
                className="w-full accent-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Border Color</span>
              <input
                type="color"
                value={logo.badge.strokeColor}
                onChange={(e) =>
                  onUpdateLogo((prev) => ({
                    ...prev,
                    badge: { ...prev.badge, strokeColor: e.target.value },
                  }))
                }
                className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Fill Opacity</span>
                <span className="font-mono text-slate-200">{Math.round((logo.badge.fillOpacity || 0) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={logo.badge.fillOpacity || 0}
                onChange={(e) =>
                  onUpdateLogo((prev) => ({
                    ...prev,
                    badge: { ...prev.badge, fillOpacity: parseFloat(e.target.value) },
                  }))
                }
                className="w-full accent-indigo-500"
              />
            </div>

            {/* DANGER ZONE: DELETE BADGE */}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => handleDeleteElement('badge')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 hover:border-rose-500/50 rounded-xl transition-all cursor-pointer font-semibold shadow-sm"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Delete Badge Frame</span>
                <span className="text-[10px] text-rose-400/80 font-normal bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-500/20">Del key</span>
              </button>
            </div>
          </div>
          )
        )}

        {/* === BACKGROUND INSPECTOR === */}
        {selectedElement === 'background' && (
          <div className="space-y-4">
            {/* Custom Background Image Card */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
              <input
                ref={bgInputRef}
                type="file"
                accept="image/*,.png,.jpg,.jpeg,.webp,.svg,.gif,.avif,.bmp,.ico"
                onChange={handleBgUpload}
                className="hidden"
              />
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Wallpaper className="w-3.5 h-3.5 text-indigo-400" />
                  Custom Background Image
                </span>
                {logo.background.image?.url && (
                  <button
                    onClick={() =>
                      onUpdateLogo((prev) => ({
                        ...prev,
                        background: { ...prev.background, image: undefined, type: 'solid' },
                      }))
                    }
                    className="text-rose-400 hover:text-rose-300 text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                )}
              </div>

              {logo.background.image?.url ? (
                <div className="space-y-3">
                  <div className="relative h-20 rounded-lg overflow-hidden border border-slate-800">
                    <img
                      src={logo.background.image.url}
                      alt="Backdrop"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center">
                      <button
                        onClick={() => bgInputRef.current?.click()}
                        className="px-2 py-1 bg-slate-900/90 hover:bg-slate-800 text-[10px] text-white rounded border border-slate-700 cursor-pointer"
                      >
                        Change Image
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Image Opacity</span>
                      <span className="font-mono text-slate-200">
                        {Math.round((logo.background.image.opacity ?? 1) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="1"
                      step="0.05"
                      value={logo.background.image.opacity ?? 1}
                      onChange={(e) =>
                        onUpdateLogo((prev) => ({
                          ...prev,
                          background: {
                            ...prev.background,
                            image: prev.background.image
                              ? { ...prev.background.image, opacity: parseFloat(e.target.value) }
                              : undefined,
                          },
                        }))
                      }
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Backdrop Blur (Moody Focus)</span>
                      <span className="font-mono text-slate-200">
                        {logo.background.image.blur || 0}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="24"
                      value={logo.background.image.blur || 0}
                      onChange={(e) =>
                        onUpdateLogo((prev) => ({
                          ...prev,
                          background: {
                            ...prev.background,
                            image: prev.background.image
                              ? { ...prev.background.image, blur: parseInt(e.target.value, 10) }
                              : undefined,
                          },
                        }))
                      }
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  <button
                    onClick={() => handleDeleteElement('background')}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-lg transition-colors cursor-pointer text-xs font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Delete Background Image</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => bgInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Upload Background (PNG, JPG, SVG...)</span>
                  </button>
                  <p className="text-[10px] text-slate-500 text-center">
                    Tip: You can also drag & drop any image directly onto the canvas!
                  </p>
                </div>
              )}
            </div>

            <span className="text-slate-400">Studio Backdrop Color</span>
            <div className="flex items-center justify-between">
              <span className="font-mono text-slate-300">{logo.background.color}</span>
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

            <div className="space-y-2 pt-2">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                Quick Studio Presets
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Onyx Studio', color: '#090d16' },
                  { name: 'Pitch Black', color: '#000000' },
                  { name: 'Charcoal Dark', color: '#0c0a09' },
                  { name: 'Cyber Violet', color: '#0f051d' },
                  { name: 'Emerald Deep', color: '#021a14' },
                  { name: 'Pure White', color: '#ffffff' },
                ].map((bg) => (
                  <button
                    key={bg.color}
                    onClick={() =>
                      onUpdateLogo((prev) => ({
                        ...prev,
                        background: { ...prev.background, color: bg.color },
                      }))
                    }
                    className="flex items-center gap-2 p-2 bg-slate-950/70 border border-slate-800 hover:border-indigo-500 rounded-lg transition-colors text-left cursor-pointer"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-700"
                      style={{ backgroundColor: bg.color }}
                    />
                    <span className="text-[11px] text-slate-300 truncate">{bg.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
