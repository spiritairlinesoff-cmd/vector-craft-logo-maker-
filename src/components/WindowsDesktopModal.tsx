import React, { useState, useEffect } from 'react';
import { Monitor, Download, ShieldCheck, Terminal, Sparkles, Check, Copy, ExternalLink, X, Laptop, FileCode, Archive, Zap } from 'lucide-react';
import { triggerFileDownload } from '../utils/svgExport';
import { downloadStandaloneHtml, downloadBatLauncher, generateWindowsDesktopZip } from '../utils/peGenerator';

interface WindowsDesktopModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName?: string;
}

export const WindowsDesktopModal: React.FC<WindowsDesktopModalProps> = ({
  isOpen,
  onClose,
  brandName = 'VectorCraft',
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPwaInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!isOpen) return null;

  const currentAppUrl = window.location.origin;

  const handleDownloadStandaloneHtml = async () => {
    try {
      await downloadStandaloneHtml(brandName);
      setDownloadSuccess('Standalone VectorCraft.html downloaded! Double-click it to run directly in any web browser 100% offline.');
      setTimeout(() => setDownloadSuccess(null), 8000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadBat = () => {
    downloadBatLauncher(brandName);
    setDownloadSuccess('Launch script (.BAT) downloaded! Run it to open VectorCraft in dedicated borderless window mode.');
    setTimeout(() => setDownloadSuccess(null), 8000);
  };

  const handleDownloadZipPack = async () => {
    setIsGeneratingZip(true);
    try {
      const blob = await generateWindowsDesktopZip(currentAppUrl, brandName);
      triggerFileDownload(blob, `${brandName}-Windows-Desktop-Pack.zip`);
      setDownloadSuccess('Desktop Pack (.ZIP) downloaded! Extract the ZIP and double-click VectorCraft.html or Launch-VectorCraft-Desktop.bat.');
      setTimeout(() => setDownloadSuccess(null), 8000);
    } catch (err) {
      console.error(err);
      alert('Error generating Desktop Pack.');
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsPwaInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('To install as a Windows PC Desktop App:\n\n1. Look at the right side of your browser address bar.\n2. Click the "Install" or "App Available" icon (computer screen with a down arrow).\n3. Click "Install". It will create a native Windows app shortcut on your Desktop and Start Menu!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-indigo-950/50 p-6 md:p-8 text-slate-100">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 via-sky-500 to-teal-500 rounded-xl shadow-lg shadow-indigo-500/25">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">VectorCraft Desktop (.HTML & .BAT)</h2>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  100% Offline Local
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Runs directly on your computer with zero server connection and zero Google login.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert if just downloaded */}
        {downloadSuccess && (
          <div className="mt-4 p-3 bg-emerald-950/70 border border-emerald-500/60 rounded-xl flex items-center gap-2.5 text-xs text-emerald-200 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Notice on Local Offline Fix */}
        <div className="mt-4 p-3.5 bg-sky-950/40 border border-sky-500/30 rounded-xl flex items-start gap-3 text-xs text-sky-200">
          <Zap className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">100% Safe Local App: </strong>
            No .exe files or complicated installers needed. Double-click <strong>VectorCraft.html</strong> or <strong>Launch-VectorCraft-Desktop.bat</strong> to run VectorCraft locally with zero Google errors!
          </div>
        </div>

        {/* Options */}
        <div className="grid gap-4 mt-5">
          
          {/* Primary Option 1: Standalone Offline Single-File App (.HTML) */}
          <div className="p-5 bg-gradient-to-r from-emerald-950/50 via-teal-950/40 to-slate-900 border-2 border-emerald-500/60 rounded-xl hover:border-emerald-400 shadow-xl shadow-emerald-950/30 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/30">
                    ★
                  </span>
                  <h3 className="font-bold text-white text-base">Offline Standalone App (VectorCraft.html)</h3>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Recommended • 1-Click Run
                  </span>
                </div>
                <p className="text-xs text-slate-300 pl-8 leading-relaxed">
                  Downloads <strong>VectorCraft.html</strong> (single-file offline studio). Double-click it anytime on your PC to launch your studio in any web browser with full vector canvas performance and zero installation.
                </p>
              </div>

              <div className="flex items-center gap-2 pl-8 sm:pl-0 shrink-0">
                <button
                  onClick={handleDownloadStandaloneHtml}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <FileCode className="w-4 h-4" />
                  Download .HTML
                </button>
              </div>
            </div>
          </div>

          {/* Option 2: Windows Dedicated Launcher (.BAT) */}
          <div className="p-5 bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/30 border border-sky-500/40 rounded-xl hover:border-sky-400 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-white font-bold text-xs">
                    2
                  </span>
                  <h3 className="font-bold text-white text-base">Windows Launcher Script (.BAT)</h3>
                  <span className="text-[10px] font-semibold text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded border border-sky-500/30">
                    Dedicated Window Mode
                  </span>
                </div>
                <p className="text-xs text-slate-300 pl-8 leading-relaxed">
                  Downloads <strong>Launch-VectorCraft-Desktop.bat</strong>. Runs your local studio in a dedicated, borderless app window using Microsoft Edge or Google Chrome (no browser tabs or address bar).
                </p>
              </div>

              <div className="flex items-center gap-2 pl-8 sm:pl-0 shrink-0">
                <button
                  onClick={handleDownloadBat}
                  className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
                >
                  <Terminal className="w-4 h-4" />
                  Download .BAT
                </button>
              </div>
            </div>
          </div>

          {/* Option 3: Complete Offline Suite (.ZIP) */}
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-500 text-white font-bold text-xs">
                    3
                  </span>
                  <h3 className="font-semibold text-white text-base">Complete Desktop Package (.ZIP)</h3>
                </div>
                <p className="text-xs text-slate-400 pl-8 leading-relaxed">
                  Bundles <strong>VectorCraft.html</strong>, <strong>Launch-VectorCraft-Desktop.bat</strong>, and silent launcher script in a single ~220 KB zip archive.
                </p>
              </div>

              <div className="flex items-center gap-2 pl-8 sm:pl-0 shrink-0">
                <button
                  onClick={handleDownloadZipPack}
                  disabled={isGeneratingZip}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold text-xs rounded-xl border border-slate-700 hover:border-teal-500/50 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Archive className="w-4 h-4" />
                  {isGeneratingZip ? 'Packaging...' : 'Download .ZIP'}
                </button>
              </div>
            </div>
          </div>

          {/* Option 4: PWA Native Desktop App */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 text-white font-bold text-xs">
                    4
                  </span>
                  <h3 className="font-semibold text-white text-sm">Install as Windows PC Desktop App (PWA)</h3>
                  {isPwaInstalled && (
                    <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Installed
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 pl-8 leading-relaxed">
                  Pin VectorCraft directly to your Windows Start Menu and Taskbar using Edge or Chrome native app support.
                </p>
              </div>

              <div className="pl-8 sm:pl-0 shrink-0">
                <button
                  onClick={handleInstallPwa}
                  className="flex items-center gap-2 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-medium text-xs rounded-lg shadow-md transition-all cursor-pointer"
                >
                  <Laptop className="w-3.5 h-3.5" />
                  Install App
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Windows Instructions Guide */}
        <div className="mt-5 p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>How to run on your PC:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-400 text-[11px] leading-relaxed">
            <li>Download <strong>VectorCraft.html</strong> or <strong>Launch-VectorCraft-Desktop.bat</strong> above.</li>
            <li>Double-click the downloaded file.</li>
            <li>The studio opens instantly with zero browser distractions, full 60 FPS canvas speed, and zero Google errors!</li>
          </ol>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>All vector tools, custom image upload, and HD exports run 100% locally</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
