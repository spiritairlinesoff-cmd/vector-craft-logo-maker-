import React, { useState } from 'react';
import { Download, Check, Sparkles, Layers, FileCode, Image as ImageIcon, Archive, X, Eye, Laptop } from 'lucide-react';
import { LogoConfig } from '../types/logo';
import { renderLogoToSvgString, rasterizeSvgToBlob, triggerFileDownload, generateBrandKitZip } from '../utils/svgExport';
import confetti from 'canvas-confetti';

interface BrandKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  logo: LogoConfig;
  onOpenDesktopModal: () => void;
}

export const BrandKitModal: React.FC<BrandKitModalProps> = ({
  isOpen,
  onClose,
  logo,
  onOpenDesktopModal,
}) => {
  const [activeTab, setActiveTab] = useState<'downloads' | 'mockups'>('downloads');
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const svgFull = renderLogoToSvgString(logo, false);
  const svgTransparent = renderLogoToSvgString(logo, true);

  const brandSlug = (logo.brandText.text || 'brand')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');

  const handleDownloadSvg = (transparent: boolean = false) => {
    const content = transparent ? svgTransparent : svgFull;
    const blob = new Blob([content], { type: 'image/svg+xml;charset=utf-8' });
    triggerFileDownload(blob, `${brandSlug}-logo${transparent ? '-transparent' : ''}.svg`);
    showSuccess('Vector SVG Downloaded');
  };

  const handleDownloadPng = async (scale: number, transparent: boolean = false) => {
    try {
      const targetSize = 800 * scale;
      const content = transparent ? svgTransparent : svgFull;
      const blob = await rasterizeSvgToBlob(content, targetSize, targetSize);
      triggerFileDownload(blob, `${brandSlug}-${targetSize}px${transparent ? '-transparent' : ''}.png`);
      showSuccess(`PNG (${targetSize}px) Downloaded`);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PNG');
    }
  };

  const handleDownloadZip = async () => {
    setIsExportingZip(true);
    try {
      const zipBlob = await generateBrandKitZip(logo);
      triggerFileDownload(zipBlob, `${brandSlug}-complete-brand-kit.zip`);
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      showSuccess('Full Brand Kit (.ZIP) Ready');
    } catch (err) {
      console.error(err);
      alert('Failed to generate Brand Kit ZIP');
    } finally {
      setIsExportingZip(false);
    }
  };

  const showSuccess = (msg: string) => {
    setDownloadSuccess(msg);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-indigo-950/50 overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg shadow-teal-500/20">
              <Archive className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Brand Kit & Export Studio
                <span className="text-xs px-2 py-0.5 font-semibold text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  Production Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Export vector SVGs, 4K ultra-HD prints, mockups, and PC desktop standalone bundles.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('downloads')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'downloads'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                Export Files
              </button>
              <button
                onClick={() => setActiveTab('mockups')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'mockups'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Live Mockups
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {downloadSuccess && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          {activeTab === 'downloads' ? (
            <div className="space-y-6">
              {/* Highlight: Complete Brand Kit ZIP */}
              <div className="p-6 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/40 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl shadow-indigo-950/30">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30 text-[11px] font-bold uppercase tracking-wider">
                      Recommended
                    </span>
                    <h3 className="text-base font-bold text-white">Download Complete Brand Kit (.ZIP)</h3>
                  </div>
                  <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                    Includes Vector SVG (dark & transparent), 4K PNG (3200px), web favicons (32px, 192px, 512px), brand typography guideline sheet, and the <strong>Windows PC Desktop Launcher</strong>.
                  </p>
                </div>

                <button
                  onClick={handleDownloadZip}
                  disabled={isExportingZip}
                  className="shrink-0 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  <Archive className="w-4 h-4" />
                  <span>{isExportingZip ? 'Packaging Assets...' : 'Download Full ZIP Bundle'}</span>
                </button>
              </div>

              {/* Individual Export Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vector SVG */}
                <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
                        <FileCode className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-white">Vector SVG (Scalable)</h4>
                        <p className="text-[11px] text-slate-400">Crisp infinitely scalable paths</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleDownloadSvg(false)}
                      className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg text-slate-200 border border-slate-700 transition-colors"
                    >
                      With Background
                    </button>
                    <button
                      onClick={() => handleDownloadSvg(true)}
                      className="flex-1 py-2 px-3 bg-indigo-600/30 hover:bg-indigo-600/50 text-xs font-medium rounded-lg text-indigo-200 border border-indigo-500/40 transition-colors"
                    >
                      Transparent SVG
                    </button>
                  </div>
                </div>

                {/* High Res PNG */}
                <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-white">Raster PNG Images</h4>
                        <p className="text-[11px] text-slate-400">High-DPI for digital & presentations</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <button
                      onClick={() => handleDownloadPng(1, false)}
                      className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-[11px] font-medium rounded-lg text-slate-200 border border-slate-700 transition-colors"
                    >
                      Standard (800p)
                    </button>
                    <button
                      onClick={() => handleDownloadPng(2, true)}
                      className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-[11px] font-medium rounded-lg text-slate-200 border border-slate-700 transition-colors"
                    >
                      HD Transp (1600p)
                    </button>
                    <button
                      onClick={() => handleDownloadPng(4, false)}
                      className="py-2 px-2 bg-sky-600/30 hover:bg-sky-600/50 text-[11px] font-medium rounded-lg text-sky-200 border border-sky-500/40 transition-colors"
                    >
                      Ultra 4K (3200p)
                    </button>
                  </div>
                </div>
              </div>

              {/* Windows PC Desktop Banner */}
              <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Want to install this logo maker as a PC Desktop App (.exe)?</h4>
                    <p className="text-[11px] text-slate-400">Run directly on Windows 10/11 with one-click launcher and desktop shortcut.</p>
                  </div>
                </div>
                <button
                  onClick={onOpenDesktopModal}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition-colors shrink-0"
                >
                  Setup PC App (.exe)
                </button>
              </div>
            </div>
          ) : (
            /* Live Mockups View */
            <div className="space-y-6">
              <div className="text-xs text-slate-400">
                Preview your logo realistically applied across stationery, merchandise, apparel, and digital touchpoints.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Luxury Business Card */}
                <div className="relative h-60 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 border border-slate-700/80 p-6 flex flex-col justify-between shadow-2xl overflow-hidden group">
                  <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex justify-between items-start">
                    <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                      Corporate Identity
                    </div>
                    <span className="w-8 h-5 rounded bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-[9px] font-mono text-amber-300">
                      EMBOSS
                    </span>
                  </div>

                  {/* Render Logo on Card */}
                  <div className="flex items-center gap-4 my-auto">
                    <svg viewBox="0 0 100 100" className="w-12 h-12 shrink-0 drop-shadow-md">
                      {logo.symbol.type === 'image' && logo.symbol.imageUrl ? (
                        <image href={logo.symbol.imageUrl} width="100" height="100" preserveAspectRatio="xMidYMid meet" />
                      ) : (
                        <path
                          d={logo.symbol.svgPath}
                          fill={logo.symbol.fillColor}
                          stroke={logo.symbol.strokeColor || 'none'}
                          strokeWidth={logo.symbol.strokeWidth}
                        />
                      )}
                    </svg>
                    <div>
                      <div
                        className="font-bold text-sm tracking-widest text-white uppercase"
                        style={{ fontFamily: logo.brandText.fontFamily }}
                      >
                        {logo.brandText.text}
                      </div>
                      <div className="text-[9px] text-slate-400 tracking-wider uppercase mt-0.5">
                        {logo.taglineText.text || 'Global Identity'}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-end border-t border-slate-800/80 pt-3 text-[10px] text-slate-400 font-mono">
                    <span>www.{brandSlug}.io</span>
                    <span>NEW YORK • LONDON</span>
                  </div>
                </div>

                {/* 2. Modern Apparel / T-Shirt Mockup */}
                <div className="relative h-60 rounded-2xl bg-stone-900 border border-stone-800 p-6 flex flex-col items-center justify-center shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
                  <div className="absolute top-4 left-4 text-[10px] uppercase font-bold tracking-widest text-stone-500">
                    Apparel & Merchandise
                  </div>

                  <div className="p-6 rounded-2xl bg-stone-950/80 border border-stone-800/80 flex flex-col items-center text-center shadow-lg transform -rotate-1 group-hover:rotate-0 transition-transform">
                    <svg viewBox="0 0 100 100" className="w-14 h-14 mb-2">
                      {logo.symbol.type === 'image' && logo.symbol.imageUrl ? (
                        <image href={logo.symbol.imageUrl} width="100" height="100" preserveAspectRatio="xMidYMid meet" />
                      ) : (
                        <path
                          d={logo.symbol.svgPath}
                          fill={logo.symbol.fillColor}
                          stroke={logo.symbol.strokeColor}
                          strokeWidth={logo.symbol.strokeWidth}
                        />
                      )}
                    </svg>
                    <div
                      className="font-bold text-xs uppercase tracking-widest text-stone-100"
                      style={{ fontFamily: logo.brandText.fontFamily }}
                    >
                      {logo.brandText.text}
                    </div>
                  </div>
                </div>

                {/* 3. Mobile App Icon */}
                <div className="relative h-60 rounded-2xl bg-slate-950 border border-slate-800 p-6 flex flex-col items-center justify-center shadow-2xl">
                  <div className="absolute top-4 left-4 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                    Mobile App & Desktop Tile
                  </div>
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/80 shadow-2xl shadow-indigo-500/20 flex flex-col items-center justify-center p-3 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/15 pointer-events-none" />
                    <svg viewBox="0 0 100 100" className="w-12 h-12">
                      {logo.symbol.type === 'image' && logo.symbol.imageUrl ? (
                        <image href={logo.symbol.imageUrl} width="100" height="100" preserveAspectRatio="xMidYMid meet" />
                      ) : (
                        <path
                          d={logo.symbol.svgPath}
                          fill={logo.symbol.fillColor}
                          stroke={logo.symbol.strokeColor}
                          strokeWidth={logo.symbol.strokeWidth}
                        />
                      )}
                    </svg>
                  </div>
                  <div className="text-[11px] text-slate-300 font-semibold mt-3 tracking-wide">
                    {logo.brandText.text}
                  </div>
                </div>

                {/* 4. Frosted Glass Office Wall Sign */}
                <div className="relative h-60 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/40 border border-slate-800 p-6 flex flex-col items-center justify-center shadow-2xl overflow-hidden">
                  <div className="absolute top-4 left-4 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                    Architectural Signage
                  </div>
                  <div className="px-8 py-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl flex items-center gap-4">
                    <span className="w-2 h-2 rounded-full bg-slate-400 absolute top-2 left-2 shadow" />
                    <span className="w-2 h-2 rounded-full bg-slate-400 absolute top-2 right-2 shadow" />
                    <span className="w-2 h-2 rounded-full bg-slate-400 absolute bottom-2 left-2 shadow" />
                    <span className="w-2 h-2 rounded-full bg-slate-400 absolute bottom-2 right-2 shadow" />

                    <svg viewBox="0 0 100 100" className="w-12 h-12">
                      {logo.symbol.type === 'image' && logo.symbol.imageUrl ? (
                        <image href={logo.symbol.imageUrl} width="100" height="100" preserveAspectRatio="xMidYMid meet" />
                      ) : (
                        <path
                          d={logo.symbol.svgPath}
                          fill={logo.symbol.fillColor}
                          stroke={logo.symbol.strokeColor}
                          strokeWidth={logo.symbol.strokeWidth}
                        />
                      )}
                    </svg>
                    <div>
                      <div
                        className="font-extrabold text-sm uppercase tracking-widest text-white"
                        style={{ fontFamily: logo.brandText.fontFamily }}
                      >
                        {logo.brandText.text}
                      </div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-300">
                        {logo.taglineText.text || 'Global Headquarters'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900 flex justify-between items-center text-xs text-slate-400 shrink-0">
          <span>All files exported in standard standard formats.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
