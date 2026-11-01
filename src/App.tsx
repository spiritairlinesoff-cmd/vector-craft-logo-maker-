import React, { useState, useEffect, useCallback } from 'react';
import { LogoConfig } from './types/logo';
import { PRESET_TEMPLATES } from './data/presetTemplates';
import { Header } from './components/Header';
import { ToolboxSidebar } from './components/ToolboxSidebar';
import { CanvasEditor } from './components/CanvasEditor';
import { InspectorPanel } from './components/InspectorPanel';
import { AIDesignerModal } from './components/AIDesignerModal';
import { WindowsDesktopModal } from './components/WindowsDesktopModal';
import { BrandKitModal } from './components/BrandKitModal';

export default function App() {
  const [logo, setLogo] = useState<LogoConfig>(PRESET_TEMPLATES[0].config);
  const [history, setHistory] = useState<LogoConfig[]>([PRESET_TEMPLATES[0].config]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [selectedElement, setSelectedElement] = useState<'symbol' | 'brandText' | 'tagline' | 'badge' | 'background'>('symbol');

  // Modals state
  const [isAIDesignerOpen, setIsAIDesignerOpen] = useState(false);
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState(false);
  const [isBrandKitModalOpen, setIsBrandKitModalOpen] = useState(false);

  // Update logo with history push
  const handleUpdateLogo = useCallback(
    (updater: (prev: LogoConfig) => LogoConfig) => {
      setLogo((current) => {
        const next = updater(current);
        setHistory((prevHistory) => {
          const trimmed = prevHistory.slice(0, historyIndex + 1);
          return [...trimmed, next];
        });
        setHistoryIndex((prevIndex) => prevIndex + 1);
        return next;
      });
    },
    [historyIndex]
  );

  // Undo / Redo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      setLogo(history[nextIndex]);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setLogo(history[nextIndex]);
    }
  }, [historyIndex, history]);

  const handleReset = useCallback(() => {
    handleUpdateLogo(() => PRESET_TEMPLATES[0].config);
  }, [handleUpdateLogo]);

  // Keyboard Shortcuts (Undo/Redo, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        handleRedo();
      } else if (e.key === 'Escape') {
        setIsAIDesignerOpen(false);
        setIsDesktopModalOpen(false);
        setIsBrandKitModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Top Studio Header */}
      <Header
        logo={logo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onReset={handleReset}
        onOpenAIDesigner={() => setIsAIDesignerOpen(true)}
        onOpenDesktopModal={() => setIsDesktopModalOpen(true)}
        onOpenBrandKitModal={() => setIsBrandKitModalOpen(true)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Toolbox */}
        <ToolboxSidebar
          logo={logo}
          onUpdateLogo={handleUpdateLogo}
          onOpenAIDesigner={() => setIsAIDesignerOpen(true)}
          onSelectElement={setSelectedElement}
        />

        {/* Center Interactive Canvas */}
        <CanvasEditor
          logo={logo}
          selectedElement={selectedElement}
          onSelectElement={setSelectedElement}
          onUpdateLogo={handleUpdateLogo}
        />

        {/* Right Inspector Panel */}
        <InspectorPanel
          logo={logo}
          selectedElement={selectedElement}
          onUpdateLogo={handleUpdateLogo}
          onSelectElement={setSelectedElement}
        />
      </div>

      {/* Modals */}
      <AIDesignerModal
        isOpen={isAIDesignerOpen}
        onClose={() => setIsAIDesignerOpen(false)}
        onApplyLogo={(newLogo) => {
          handleUpdateLogo(() => newLogo);
        }}
        initialBrandName={logo.brandText.text}
        initialTagline={logo.taglineText.text}
      />

      <WindowsDesktopModal
        isOpen={isDesktopModalOpen}
        onClose={() => setIsDesktopModalOpen(false)}
        brandName={logo.brandText.text}
      />

      <BrandKitModal
        isOpen={isBrandKitModalOpen}
        onClose={() => setIsBrandKitModalOpen(false)}
        logo={logo}
        onOpenDesktopModal={() => {
          setIsBrandKitModalOpen(false);
          setIsDesktopModalOpen(true);
        }}
      />
    </div>
  );
}
