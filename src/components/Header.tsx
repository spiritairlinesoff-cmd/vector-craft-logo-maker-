import React, { useState } from 'react';
import { Sparkles, Monitor, Download, Eye, Undo2, Redo2, RotateCcw, ChevronDown, FileCode, Image as ImageIcon, Archive, Layers, Check, Terminal } from 'lucide-react';
import { LogoConfig } from '../types/logo';
import { renderLogoToSvgString, rasterizeSvgToBlob, triggerFileDownload, generateBrandKitZip } from '../utils/svgExport';
import { downloadStandaloneHtml, downloadBatLauncher, generateWindowsDesktopZip } from '../utils/peGenerator';

interface HeaderProps {
  logo: LogoConfig;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onOpenAIDesigner: () => void;
  onOpenDesktopModal: () => void;
  onOpenBrandKitModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  logo,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onOpenAIDesigner,
  onOpenDesktopModal,
  onOpenBrandKitModal,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const handleDownloadStandaloneHtml = async () => {
    await downloadStandaloneHtml('VectorCraft');
    setShowExportMenu(false);
    setDownloadNotice('VectorCraft.html downloaded! Double-click to run directly in any web browser 100% offline.');
    setTimeout(() => setDownloadNotice(null), 7000);
  };

  const handleDownloadBat = () => {
    downloadBatLauncher('VectorCraft');
    setShowExportMenu(false);
    setDownloadNotice('Launch-VectorCraft-Desktop.bat downloaded! Run alongside VectorCraft.html to launch in standalone window mode.');
    setTimeout(() => setDownloadNotice(null), 7000);
  };

  const handleDownloadZipPack = async () => {
    setIsExporting(true);
    try {
      const blob = await generateWindowsDesktopZip(window.location.origin, 'VectorCraft');
      triggerFileDownload(blob, 'VectorCraft-Windows-Desktop-Pack.zip');
      setShowExportMenu(false);
      setDownloadNotice('Desktop Pack (.ZIP) downloaded! Extract the ZIP and double-click VectorCraft.html or Launch-VectorCraft-Desktop.bat.');
      setTimeout(() => setDownloadNotice(null), 7000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const brandSlug = (logo.brandText.text || 'logo')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');

  const handleQuickSvg = (transparent: boolean) => {
    const svgStr = renderLogoToSvgString(logo, transparent);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    triggerFileDownload(blob, `${brandSlug}-vector${transparent ? '-transparent' : ''}.svg`);
    setShowExportMenu(false);
  };

  const handleQuickPng = async (scale: number, transparent: boolean) => {
    setIsExporting(true);
    try {
      const target = 800 * scale;
      const svgStr = renderLogoToSvgString(logo, transparent);
      const blob = await rasterizeSvgToBlob(svgStr, target, target);
      triggerFileDownload(blob, `${brandSlug}-${target}px${transparent ? '-transparent' : ''}.png`);
    } catch (err) {
      console.error(err);
      alert('Error generating PNG');
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  return (
    <header className="h-14 px-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0 select-none z-30">
      
      {/* Brand Identity / Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <svg viewBox="0 0 100 100" className="w-5 h-5 text-white fill-current">
              <path d="M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z M50 25 L72 38 L72 62 L50 75 L28 62 L28 38 Z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-white">
                VectorCraft
              </span>
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                STUDIO
              </span>
            </div>
          </div>
        </div>

        {/* Undo / Redo */}
        <div className="hidden sm:flex items-center gap-1 ml-4 pl-4 border-l border-slate-800">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-slate-900 transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-slate-900 transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onReset}
            title="Reset Canvas"
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center / Action Buttons */}
      <div className="flex items-center gap-2">
        {/* AI Designer Button */}
        <button
          onClick={onOpenAIDesigner}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:via-indigo-500 hover:to-pink-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-purple-900/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Logo Designer</span>
        </button>

        {/* Offline Desktop App Buttons (.HTML & .BAT) */}
        <div className="flex items-center gap-1 bg-slate-900 border border-emerald-500/30 rounded-xl p-0.5">
          <button
            onClick={handleDownloadStandaloneHtml}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-lg transition-all shadow-md shadow-emerald-950 cursor-pointer"
            title="Download Standalone Offline App (VectorCraft.html - 100% offline)"
          >
            <FileCode className="w-3.5 h-3.5 text-white" />
            <span>App (.HTML)</span>
          </button>
          <button
            onClick={handleDownloadBat}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 font-semibold text-xs rounded-lg transition-all border border-slate-700 hover:border-sky-500/50 cursor-pointer"
            title="Download Windows Launcher Script (Launch-VectorCraft-Desktop.bat)"
          >
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            <span>Launcher (.BAT)</span>
          </button>
          <button
            onClick={onOpenDesktopModal}
            className="px-2 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-medium transition-colors"
            title="View Desktop setup options & instructions"
          >
            Options
          </button>
        </div>

        {/* Mockups */}
        <button
          onClick={onOpenBrandKitModal}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-medium text-xs rounded-xl transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-slate-400" />
          <span>Mockups</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
            <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 text-xs animate-in fade-in duration-150">
              <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                Offline Desktop App
              </div>
              <button
                onClick={handleDownloadStandaloneHtml}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-left text-emerald-300 font-semibold hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                <div className="flex-1">
                  <div>Offline Standalone App (.HTML)</div>
                  <div className="text-[10px] text-emerald-400/80 font-normal">Single-file, double click to run anywhere</div>
                </div>
              </button>
              <button
                onClick={handleDownloadBat}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-left text-sky-300 font-medium hover:bg-sky-950/40 rounded-lg transition-colors cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                <div className="flex-1">
                  <div>Windows Launcher (.BAT)</div>
                  <div className="text-[10px] text-sky-400/70 font-normal">Runs in dedicated borderless window</div>
                </div>
              </button>
              <button
                onClick={handleDownloadZipPack}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-left text-teal-300 font-medium hover:bg-teal-950/40 rounded-lg transition-colors cursor-pointer"
              >
                <Archive className="w-3.5 h-3.5 text-teal-400" />
                <div className="flex-1">
                  <div>Complete Desktop Pack (.ZIP)</div>
                  <div className="text-[10px] text-teal-400/80 font-normal">Bundles .html, .bat launcher & scripts</div>
                </div>
              </button>

              <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 mt-1">
                Vector Formats
              </div>
              <button
                onClick={() => handleQuickSvg(false)}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-left text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5 text-purple-400" />
                <span>Vector SVG (with BG)</span>
              </button>
              <button
                onClick={() => handleQuickSvg(true)}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-left text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                <span>Transparent Vector SVG</span>
              </button>

              <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 mt-1">
                High-Resolution PNG
              </div>
              <button
                onClick={() => handleQuickPng(2, true)}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-left text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                <span>HD Transparent PNG (1600px)</span>
              </button>
              <button
                onClick={() => handleQuickPng(4, false)}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-left text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>4K Ultra-HD PNG (3200px)</span>
              </button>

              <div className="border-t border-slate-800 my-1" />
              <button
                onClick={() => {
                  setShowExportMenu(false);
                  onOpenBrandKitModal();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-left text-indigo-300 font-semibold hover:bg-indigo-950/40 rounded-lg transition-colors cursor-pointer"
              >
                <Archive className="w-3.5 h-3.5 text-indigo-400" />
                <span>Complete Brand Kit (.ZIP)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Direct Download Notification Toast */}
      {downloadNotice && (
        <div className="fixed top-16 right-6 z-50 flex items-start gap-3 p-4 bg-slate-900 border border-emerald-500/60 rounded-xl shadow-2xl text-xs text-white max-w-md animate-in slide-in-from-top-2 duration-200">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <Check className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="font-bold text-emerald-300 flex items-center gap-1.5 text-sm">
              <span>Downloaded Successfully</span>
            </div>
            <div className="text-slate-300 text-[11px] leading-relaxed">
              {downloadNotice}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
