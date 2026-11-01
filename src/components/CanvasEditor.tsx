import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, Grid, Sun, Moon, Move, Eye, RotateCw, Sparkles, Image as ImageIcon, Upload, ArrowUpDown, ArrowLeftRight, X, Check, Wallpaper, Palette, Trash2, Plus } from 'lucide-react';
import { LogoConfig } from '../types/logo';

interface CanvasEditorProps {
  logo: LogoConfig;
  selectedElement: 'symbol' | 'brandText' | 'tagline' | 'badge' | 'background';
  onSelectElement: (el: 'symbol' | 'brandText' | 'tagline' | 'badge' | 'background') => void;
  onUpdateLogo: (updater: (prev: LogoConfig) => LogoConfig) => void;
}

type TransformMode = 'idle' | 'move' | 'resize' | 'rotate';
type ResizeCorner = 'nw' | 'ne' | 'se' | 'sw';

interface InteractionState {
  mode: TransformMode;
  element: 'symbol' | 'brandText' | 'tagline' | 'badge' | null;
  corner?: ResizeCorner;
  startClient: { x: number; y: number };
  startSvg: { x: number; y: number };
  centerSvg: { x: number; y: number };
  initialOffset: { x: number; y: number };
  currentOffset: { x: number; y: number };
  initialScaleOrSize: number;
  initialRotation: number;
  initialDist: number;
  initialAngleDeg: number;
  isSnappedX: boolean;
  isSnappedY: boolean;
  isSnappedAngle?: boolean;
  tooltipText?: string;
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
  logo,
  selectedElement,
  onSelectElement,
  onUpdateLogo,
}) => {
  const [zoom, setZoom] = useState(0.85);
  const [showGrid, setShowGrid] = useState(true);
  const [canvasBgMode, setCanvasBgMode] = useState<'actual' | 'transparent_check' | 'light'>('actual');
  const [hoveredElement, setHoveredElement] = useState<'symbol' | 'brandText' | 'tagline' | 'badge' | null>(null);

  // File Drag & Drop State
  const [isFileDraggingOver, setIsFileDraggingOver] = useState(false);
  const [fileDropZone, setFileDropZone] = useState<'background' | 'logo'>('background');
  const [pendingDroppedFile, setPendingDroppedFile] = useState<{ url: string; name: string } | null>(null);

  // Hidden File Inputs
  const bgFileInputRef = useRef<HTMLInputElement | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);

  // Master Canvas Interaction State (Move, Corner Resize, Stem Rotation)
  const [interaction, setInteraction] = useState<InteractionState>({
    mode: 'idle',
    element: null,
    startClient: { x: 0, y: 0 },
    startSvg: { x: 0, y: 0 },
    centerSvg: { x: 0, y: 0 },
    initialOffset: { x: 0, y: 0 },
    currentOffset: { x: 0, y: 0 },
    initialScaleOrSize: 1,
    initialRotation: 0,
    initialDist: 0,
    initialAngleDeg: 0,
    isSnappedX: false,
    isSnappedY: false,
  });

  const svgRef = useRef<SVGSVGElement | null>(null);

  const width = logo.canvasSize.width;
  const height = logo.canvasSize.height;
  const centerX = width / 2;
  const centerY = height / 2;

  // Zoom helpers
  const handleZoomIn = () => setZoom((z) => Math.min(2.5, +(z + 0.15).toFixed(2)));
  const handleZoomOut = () => setZoom((z) => Math.max(0.4, +(z - 0.15).toFixed(2)));
  const handleResetZoom = () => setZoom(0.85);

  // Symbol coordinates
  const symX = centerX + logo.symbol.offsetX;
  const symY = centerY + logo.symbol.offsetY;
  const symScale = logo.symbol.scale || 1;
  const symRot = logo.symbol.rotation || 0;

  // ViewBox bounds
  const vbParts = (logo.symbol.viewBox || '0 0 100 100').split(' ').map(Number);
  const vbW = vbParts[2] || 100;
  const vbH = vbParts[3] || 100;

  // Brand Text coordinates
  const brandX = centerX + logo.brandText.offsetX;
  const brandY = centerY + logo.brandText.offsetY;

  // Tagline coordinates
  const tagX = centerX + logo.taglineText.offsetX;
  const tagY = centerY + logo.taglineText.offsetY;

  // Badge calculations
  const badgeX = centerX + (logo.badge.offsetX || 0);
  const badgeY = centerY + (logo.badge.offsetY || 0);
  const badgeScale = logo.badge.scale || 1;
  const bSize = 340 * badgeScale;
  const halfB = bSize / 2;

  // Accurate SVG Coordinate Mapper using SVG CTM matrix
  const getSvgCoords = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      if (svgRef.current) {
        const pt = svgRef.current.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const ctm = svgRef.current.getScreenCTM();
        if (ctm) {
          const transformed = pt.matrixTransform(ctm.inverse());
          return { x: transformed.x, y: transformed.y };
        }
        const rect = svgRef.current.getBoundingClientRect();
        return {
          x: (clientX - rect.left) * (width / rect.width),
          y: (clientY - rect.top) * (height / rect.height),
        };
      }
      return { x: clientX, y: clientY };
    },
    [width, height]
  );

  // Deleted Element Detectors
  const isSymbolDeleted = !logo.symbol.svgPath && !logo.symbol.imageUrl;
  const isBrandTextDeleted = !logo.brandText.text || logo.brandText.text.trim() === '';
  const isTaglineDeleted = !logo.taglineText.text || logo.taglineText.text.trim() === '';
  const isBadgeDeleted = logo.badge.shape === 'none';
  const isBgImageDeleted = !logo.background.image?.url;

  const handleDeleteElement = useCallback(
    (el: 'symbol' | 'brandText' | 'tagline' | 'badge' | 'background') => {
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
    },
    [onUpdateLogo]
  );

  const handleRestoreElement = useCallback(
    (el: 'symbol' | 'brandText' | 'tagline' | 'badge' | 'background') => {
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
    },
    [onUpdateLogo, onSelectElement]
  );

  // Keyboard shortcut listener for Delete & Backspace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isTyping =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable);
      if (isTyping) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElement && selectedElement !== 'background') {
          e.preventDefault();
          handleDeleteElement(selectedElement);
        } else if (selectedElement === 'background' && logo.background.image?.url) {
          e.preventDefault();
          handleDeleteElement('background');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, logo.background.image, handleDeleteElement]);

  // Helper to extract transform geometry & corners for any logo element
  const getElementTransformData = useCallback(
    (el: 'symbol' | 'brandText' | 'tagline' | 'badge') => {
      if (el === 'symbol') {
        if (isSymbolDeleted) return null;
        const w = vbW * symScale * 1.8 + 24;
        const h = vbH * symScale * 1.8 + 24;
        const halfW = w / 2;
        const halfH = h / 2;
        return {
          cx: symX,
          cy: symY,
          rot: symRot,
          w,
          h,
          halfW,
          halfH,
          topY: -halfH,
          corners: {
            nw: { x: -halfW, y: -halfH },
            ne: { x: halfW, y: -halfH },
            se: { x: halfW, y: halfH },
            sw: { x: -halfW, y: halfH },
          },
          currentScaleOrSize: symScale,
        };
      } else if (el === 'brandText') {
        if (isBrandTextDeleted) return null;
        const textLen = Math.max(1, (logo.brandText.text || '').length);
        const fs = logo.brandText.fontSize || 42;
        const ls = logo.brandText.letterSpacing || 0;
        const w = Math.max(120, textLen * (fs * 0.58) + Math.max(0, textLen - 1) * ls + 36);
        const h = Math.max(34, fs * 1.25 + 16);
        const halfW = w / 2;
        const halfH = h / 2;
        const localCenterY = -(fs * 0.35);
        return {
          cx: brandX,
          cy: brandY,
          rot: logo.brandText.rotation || 0,
          w,
          h,
          halfW,
          halfH,
          topY: localCenterY - halfH,
          corners: {
            nw: { x: -halfW, y: localCenterY - halfH },
            ne: { x: halfW, y: localCenterY - halfH },
            se: { x: halfW, y: localCenterY + halfH },
            sw: { x: -halfW, y: localCenterY + halfH },
          },
          currentScaleOrSize: fs,
        };
      } else if (el === 'tagline') {
        if (isTaglineDeleted) return null;
        const textLen = Math.max(1, (logo.taglineText.text || '').length);
        const fs = logo.taglineText.fontSize || 18;
        const ls = logo.taglineText.letterSpacing || 0;
        const w = Math.max(80, textLen * (fs * 0.58) + Math.max(0, textLen - 1) * ls + 28);
        const h = Math.max(26, fs * 1.25 + 14);
        const halfW = w / 2;
        const halfH = h / 2;
        const localCenterY = -(fs * 0.35);
        return {
          cx: tagX,
          cy: tagY,
          rot: logo.taglineText.rotation || 0,
          w,
          h,
          halfW,
          halfH,
          topY: localCenterY - halfH,
          corners: {
            nw: { x: -halfW, y: localCenterY - halfH },
            ne: { x: halfW, y: localCenterY - halfH },
            se: { x: halfW, y: localCenterY + halfH },
            sw: { x: -halfW, y: localCenterY + halfH },
          },
          currentScaleOrSize: fs,
        };
      } else if (el === 'badge') {
        if (isBadgeDeleted) return null;
        const halfW = halfB + 12;
        const halfH = halfB + 12;
        return {
          cx: badgeX,
          cy: badgeY,
          rot: logo.badge.rotation || 0,
          w: halfW * 2,
          h: halfH * 2,
          halfW,
          halfH,
          topY: -halfH,
          corners: {
            nw: { x: -halfW, y: -halfH },
            ne: { x: halfW, y: -halfH },
            se: { x: halfW, y: halfH },
            sw: { x: -halfW, y: halfH },
          },
          currentScaleOrSize: badgeScale,
        };
      }
      return null;
    },
    [symX, symY, symRot, symScale, vbW, vbH, brandX, brandY, logo.brandText, tagX, tagY, logo.taglineText, badgeX, badgeY, logo.badge, halfB, badgeScale, isSymbolDeleted, isBrandTextDeleted, isTaglineDeleted, isBadgeDeleted]
  );

  // Gradient computation for Symbol
  const symGrad = logo.symbol.gradient;
  let symX1 = 0, symY1 = 0, symX2 = 100, symY2 = 100;
  if (symGrad) {
    const symAngleRad = ((symGrad.angle || 0) * Math.PI) / 180;
    symX1 = Math.round(50 + Math.sin(symAngleRad - Math.PI / 2) * 50);
    symY1 = Math.round(50 + Math.cos(symAngleRad - Math.PI / 2) * 50);
    symX2 = Math.round(50 + Math.sin(symAngleRad + Math.PI / 2) * 50);
    symY2 = Math.round(50 + Math.cos(symAngleRad + Math.PI / 2) * 50);
  }

  // 1. START MOVE DRAG
  const startMove = (
    e: React.PointerEvent,
    element: 'symbol' | 'brandText' | 'tagline' | 'badge'
  ) => {
    e.stopPropagation();
    e.preventDefault();
    onSelectElement(element);

    const tData = getElementTransformData(element);
    if (!tData) return;

    try {
      (e.target as Element).setPointerCapture?.(e.pointerId);
    } catch {}

    let initialX = 0;
    let initialY = 0;
    if (element === 'symbol') {
      initialX = logo.symbol.offsetX;
      initialY = logo.symbol.offsetY;
    } else if (element === 'brandText') {
      initialX = logo.brandText.offsetX;
      initialY = logo.brandText.offsetY;
    } else if (element === 'tagline') {
      initialX = logo.taglineText.offsetX;
      initialY = logo.taglineText.offsetY;
    } else if (element === 'badge') {
      initialX = logo.badge.offsetX || 0;
      initialY = logo.badge.offsetY || 0;
    }

    const svgCoords = getSvgCoords(e.clientX, e.clientY);

    setInteraction({
      mode: 'move',
      element,
      startClient: { x: e.clientX, y: e.clientY },
      startSvg: svgCoords,
      centerSvg: { x: tData.cx, y: tData.cy },
      initialOffset: { x: initialX, y: initialY },
      currentOffset: { x: initialX, y: initialY },
      initialScaleOrSize: tData.currentScaleOrSize,
      initialRotation: tData.rot,
      initialDist: 0,
      initialAngleDeg: 0,
      isSnappedX: initialX === 0,
      isSnappedY: initialY === 0,
      tooltipText: `X: ${initialX}px, Y: ${initialY}px`,
    });
  };

  // 2. START CORNER RESIZE DRAG
  const startResize = (
    e: React.PointerEvent,
    element: 'symbol' | 'brandText' | 'tagline' | 'badge',
    corner: ResizeCorner
  ) => {
    e.stopPropagation();
    e.preventDefault();
    onSelectElement(element);

    const tData = getElementTransformData(element);
    if (!tData) return;

    try {
      (e.target as Element).setPointerCapture?.(e.pointerId);
    } catch {}

    const svgCoords = getSvgCoords(e.clientX, e.clientY);
    const dist = Math.hypot(svgCoords.x - tData.cx, svgCoords.y - tData.cy);

    setInteraction({
      mode: 'resize',
      element,
      corner,
      startClient: { x: e.clientX, y: e.clientY },
      startSvg: svgCoords,
      centerSvg: { x: tData.cx, y: tData.cy },
      initialOffset: { x: 0, y: 0 },
      currentOffset: { x: 0, y: 0 },
      initialScaleOrSize: tData.currentScaleOrSize,
      initialRotation: tData.rot,
      initialDist: Math.max(15, dist),
      initialAngleDeg: 0,
      isSnappedX: false,
      isSnappedY: false,
      tooltipText:
        element === 'brandText' || element === 'tagline'
          ? `Size: ${Math.round(tData.currentScaleOrSize)}px`
          : `Scale: ${(tData.currentScaleOrSize * 100).toFixed(0)}%`,
    });
  };

  // 3. START STEM ROTATION DRAG
  const startRotate = (
    e: React.PointerEvent,
    element: 'symbol' | 'brandText' | 'tagline' | 'badge'
  ) => {
    e.stopPropagation();
    e.preventDefault();
    onSelectElement(element);

    const tData = getElementTransformData(element);
    if (!tData) return;

    try {
      (e.target as Element).setPointerCapture?.(e.pointerId);
    } catch {}

    const svgCoords = getSvgCoords(e.clientX, e.clientY);
    const angleRad = Math.atan2(svgCoords.y - tData.cy, svgCoords.x - tData.cx);
    const angleDeg = (angleRad * 180) / Math.PI;

    setInteraction({
      mode: 'rotate',
      element,
      startClient: { x: e.clientX, y: e.clientY },
      startSvg: svgCoords,
      centerSvg: { x: tData.cx, y: tData.cy },
      initialOffset: { x: 0, y: 0 },
      currentOffset: { x: 0, y: 0 },
      initialScaleOrSize: tData.currentScaleOrSize,
      initialRotation: tData.rot,
      initialDist: 0,
      initialAngleDeg: angleDeg,
      isSnappedX: false,
      isSnappedY: false,
      tooltipText: `Angle: ${Math.round(tData.rot)}°`,
    });
  };

  // POINTER MOVE HANDLER FOR ALL TRANSFORM ACTIONS
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (interaction.mode === 'idle' || !interaction.element) return;

      const currentSvg = getSvgCoords(e.clientX, e.clientY);
      const el = interaction.element;

      if (interaction.mode === 'move') {
        const dx = (e.clientX - interaction.startClient.x) / zoom;
        const dy = (e.clientY - interaction.startClient.y) / zoom;

        let newX = Math.round(interaction.initialOffset.x + dx);
        let newY = Math.round(interaction.initialOffset.y + dy);

        // Smart center snapping (within 7px of center line)
        let snappedX = false;
        let snappedY = false;

        if (Math.abs(newX) <= 7) {
          newX = 0;
          snappedX = true;
        }
        if (Math.abs(newY) <= 7) {
          newY = 0;
          snappedY = true;
        }

        setInteraction((prev) => ({
          ...prev,
          currentOffset: { x: newX, y: newY },
          isSnappedX: snappedX,
          isSnappedY: snappedY,
          tooltipText: `X: ${newX > 0 ? `+${newX}` : newX}px, Y: ${newY > 0 ? `+${newY}` : newY}px${
            snappedX || snappedY ? ' (Centered)' : ''
          }`,
        }));

        onUpdateLogo((prev) => {
          if (el === 'symbol') {
            return { ...prev, symbol: { ...prev.symbol, offsetX: newX, offsetY: newY } };
          } else if (el === 'brandText') {
            return { ...prev, brandText: { ...prev.brandText, offsetX: newX, offsetY: newY } };
          } else if (el === 'tagline') {
            return { ...prev, taglineText: { ...prev.taglineText, offsetX: newX, offsetY: newY } };
          } else if (el === 'badge') {
            return { ...prev, badge: { ...prev.badge, offsetX: newX, offsetY: newY } };
          }
          return prev;
        });
      } else if (interaction.mode === 'resize') {
        const currentDist = Math.hypot(
          currentSvg.x - interaction.centerSvg.x,
          currentSvg.y - interaction.centerSvg.y
        );
        const scaleRatio = Math.max(0.05, currentDist / interaction.initialDist);

        if (el === 'symbol') {
          const newScale = Math.max(0.2, Math.min(3.8, +(interaction.initialScaleOrSize * scaleRatio).toFixed(2)));
          setInteraction((prev) => ({
            ...prev,
            tooltipText: `Scale: ${(newScale * 100).toFixed(0)}% (${newScale}x)`,
          }));
          onUpdateLogo((prev) => ({
            ...prev,
            symbol: { ...prev.symbol, scale: newScale },
          }));
        } else if (el === 'badge') {
          const newScale = Math.max(0.2, Math.min(3.2, +(interaction.initialScaleOrSize * scaleRatio).toFixed(2)));
          setInteraction((prev) => ({
            ...prev,
            tooltipText: `Badge Size: ${(newScale * 100).toFixed(0)}% (${newScale}x)`,
          }));
          onUpdateLogo((prev) => ({
            ...prev,
            badge: { ...prev.badge, scale: newScale },
          }));
        } else if (el === 'brandText') {
          const newSize = Math.max(14, Math.min(180, Math.round(interaction.initialScaleOrSize * scaleRatio)));
          setInteraction((prev) => ({
            ...prev,
            tooltipText: `Font Size: ${newSize}px`,
          }));
          onUpdateLogo((prev) => ({
            ...prev,
            brandText: { ...prev.brandText, fontSize: newSize },
          }));
        } else if (el === 'tagline') {
          const newSize = Math.max(10, Math.min(100, Math.round(interaction.initialScaleOrSize * scaleRatio)));
          setInteraction((prev) => ({
            ...prev,
            tooltipText: `Font Size: ${newSize}px`,
          }));
          onUpdateLogo((prev) => ({
            ...prev,
            taglineText: { ...prev.taglineText, fontSize: newSize },
          }));
        }
      } else if (interaction.mode === 'rotate') {
        const currentAngleRad = Math.atan2(
          currentSvg.y - interaction.centerSvg.y,
          currentSvg.x - interaction.centerSvg.x
        );
        const currentAngleDeg = (currentAngleRad * 180) / Math.PI;
        const delta = currentAngleDeg - interaction.initialAngleDeg;

        let rawAngle = (interaction.initialRotation + delta) % 360;
        if (rawAngle < 0) rawAngle += 360;

        let isSnapped = false;
        let finalAngle = Math.round(rawAngle);

        if (e.shiftKey) {
          finalAngle = (Math.round(finalAngle / 15) * 15) % 360;
          isSnapped = true;
        } else {
          if (Math.abs(finalAngle - 0) <= 3 || Math.abs(finalAngle - 360) <= 3) {
            finalAngle = 0;
            isSnapped = true;
          } else if (Math.abs(finalAngle - 90) <= 3) {
            finalAngle = 90;
            isSnapped = true;
          } else if (Math.abs(finalAngle - 180) <= 3) {
            finalAngle = 180;
            isSnapped = true;
          } else if (Math.abs(finalAngle - 270) <= 3) {
            finalAngle = 270;
            isSnapped = true;
          }
        }

        setInteraction((prev) => ({
          ...prev,
          isSnappedAngle: isSnapped,
          tooltipText: `Angle: ${finalAngle}°${isSnapped ? ' (Snapped)' : ''}`,
        }));

        onUpdateLogo((prev) => {
          if (el === 'symbol') {
            return { ...prev, symbol: { ...prev.symbol, rotation: finalAngle } };
          } else if (el === 'brandText') {
            return { ...prev, brandText: { ...prev.brandText, rotation: finalAngle } };
          } else if (el === 'tagline') {
            return { ...prev, taglineText: { ...prev.taglineText, rotation: finalAngle } };
          } else if (el === 'badge') {
            return { ...prev, badge: { ...prev.badge, rotation: finalAngle } };
          }
          return prev;
        });
      }
    },
    [interaction, zoom, getSvgCoords, onUpdateLogo]
  );

  // END TRANSFORM HANDLER
  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (interaction.mode !== 'idle') {
        try {
          (e.target as Element).releasePointerCapture?.(e.pointerId);
        } catch {}
        setInteraction((prev) => ({
          ...prev,
          mode: 'idle',
          corner: undefined,
          tooltipText: undefined,
        }));
      }
    },
    [interaction.mode]
  );

  // READ FILE HELPER
  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // APPLY DROPPED IMAGE AS BACKGROUND
  const applyAsBackground = (dataUrl: string) => {
    onUpdateLogo((prev) => ({
      ...prev,
      background: {
        ...prev.background,
        type: 'image',
        image: {
          url: dataUrl,
          opacity: 0.9,
          blur: 0,
          fit: 'cover',
        },
      },
    }));
    onSelectElement('background');
    setPendingDroppedFile(null);
  };

  // APPLY DROPPED IMAGE AS LOGO / SYMBOL MARK
  const applyAsLogoMark = (dataUrl: string, fileName?: string) => {
    onUpdateLogo((prev) => ({
      ...prev,
      symbol: {
        ...prev.symbol,
        type: 'image',
        imageUrl: dataUrl,
        name: fileName || 'Custom Logo Mark',
        scale: 1.1,
      },
    }));
    onSelectElement('symbol');
    setPendingDroppedFile(null);
  };

  // FILE DRAG & DROP HANDLERS (ON CANVAS)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isFileDraggingOver) setIsFileDraggingOver(true);

    // Determine target based on horizontal position in viewport
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    if (relX < rect.width / 2) {
      setFileDropZone('background');
    } else {
      setFileDropZone('logo');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only deactivate if leaving the container
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsFileDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFileDraggingOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/') || file.name.endsWith('.svg')) {
        try {
          const dataUrl = await readFileAsDataUrl(file);
          if (fileDropZone === 'background') {
            applyAsBackground(dataUrl);
          } else {
            applyAsLogoMark(dataUrl, file.name);
          }
        } catch (err) {
          console.error(err);
          alert('Could not read image file.');
        }
      } else {
        alert('Please drop an image file (PNG, JPG, SVG, WEBP, GIF, etc.).');
      }
    }
  };

  // FILE PICKER TRIGGERS
  const handleBgFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUrl = await readFileAsDataUrl(file);
      applyAsBackground(dataUrl);
      e.target.value = '';
    }
  };

  const handleLogoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUrl = await readFileAsDataUrl(file);
      applyAsLogoMark(dataUrl, file.name);
      e.target.value = '';
    }
  };

  return (
    <div
      className="relative flex-1 h-full w-full flex flex-col items-center justify-center overflow-hidden bg-slate-950 select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden File Input for Custom Background Image */}
      <input
        ref={bgFileInputRef}
        type="file"
        accept="image/*,.png,.jpg,.jpeg,.webp,.svg,.gif,.avif,.bmp,.ico"
        onChange={handleBgFileSelect}
        className="hidden"
      />

      {/* Hidden File Input for Custom Logo Mark */}
      <input
        ref={logoFileInputRef}
        type="file"
        accept="image/*,.png,.jpg,.jpeg,.webp,.svg,.gif,.avif,.bmp,.ico"
        onChange={handleLogoFileSelect}
        className="hidden"
      />

      {/* DRAG & DROP ACTIVE FULL VIEWPORT OVERLAY */}
      {isFileDraggingOver && (
        <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex p-6 gap-6 pointer-events-none animate-in fade-in duration-150">
          {/* Left Half: Drop for Custom Background */}
          <div
            className={`flex-1 rounded-3xl border-3 border-dashed flex flex-col items-center justify-center p-8 transition-all ${
              fileDropZone === 'background'
                ? 'border-indigo-500 bg-indigo-950/40 scale-[1.02] shadow-2xl shadow-indigo-500/20'
                : 'border-slate-700 bg-slate-900/50 opacity-60'
            }`}
          >
            <div className="p-4 bg-indigo-500/20 text-indigo-400 rounded-2xl mb-4 border border-indigo-500/30">
              <Wallpaper className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Drop as Background Image</h3>
            <p className="text-xs text-indigo-200 text-center max-w-xs">
              Supports PNG, JPG, JPEG, WEBP, SVG, GIF, AVIF. Applied directly to the canvas backdrop.
            </p>
          </div>

          {/* Right Half: Drop for Custom Logo Mark */}
          <div
            className={`flex-1 rounded-3xl border-3 border-dashed flex flex-col items-center justify-center p-8 transition-all ${
              fileDropZone === 'logo'
                ? 'border-purple-500 bg-purple-950/40 scale-[1.02] shadow-2xl shadow-purple-500/20'
                : 'border-slate-700 bg-slate-900/50 opacity-60'
            }`}
          >
            <div className="p-4 bg-purple-500/20 text-purple-400 rounded-2xl mb-4 border border-purple-500/30">
              <Sparkles className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Drop as Custom Logo Mark</h3>
            <p className="text-xs text-purple-200 text-center max-w-xs">
              Replace current symbol with your own logo file. You can move, scale, and rotate it with your cursor!
            </p>
          </div>
        </div>
      )}

      {/* Top Floating View Controls */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 p-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-xl">
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetZoom}
          title="Reset Zoom"
          className="px-2 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors min-w-[50px] text-center cursor-pointer"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-slate-800 mx-1" />

        <button
          onClick={() => setShowGrid(!showGrid)}
          title="Toggle Precision Grid"
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            showGrid
              ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Grid className="w-4 h-4" />
        </button>

        <button
          onClick={() =>
            setCanvasBgMode((m) =>
              m === 'actual' ? 'transparent_check' : m === 'transparent_check' ? 'light' : 'actual'
            )
          }
          title="Toggle Canvas Preview Background"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          {canvasBgMode === 'actual' && <Moon className="w-4 h-4 text-indigo-400" />}
          {canvasBgMode === 'transparent_check' && <Eye className="w-4 h-4 text-amber-400" />}
          {canvasBgMode === 'light' && <Sun className="w-4 h-4 text-yellow-400" />}
        </button>
      </div>

      {/* Top Center: Direct Upload Quick Buttons & Drag Hint */}
      <div className="absolute top-4 z-20 flex items-center gap-2">
        <button
          onClick={() => bgFileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-850 text-indigo-300 hover:text-white border border-indigo-500/40 hover:border-indigo-500 rounded-xl shadow-lg text-xs font-medium transition-all cursor-pointer backdrop-blur-md"
          title="Upload custom background image (PNG, JPG, WEBP, SVG)"
        >
          <Wallpaper className="w-3.5 h-3.5 text-indigo-400" />
          <span>+ Background Image</span>
        </button>

        <button
          onClick={() => logoFileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-850 text-purple-300 hover:text-white border border-purple-500/40 hover:border-purple-500 rounded-xl shadow-lg text-xs font-medium transition-all cursor-pointer backdrop-blur-md"
          title="Upload custom logo mark (PNG, SVG, JPG)"
        >
          <Upload className="w-3.5 h-3.5 text-purple-400" />
          <span>+ Upload Logo</span>
        </button>
      </div>

      {/* Layer Selection Pill Indicators */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-xl">
        {(['symbol', 'brandText', 'tagline', 'badge', 'background'] as const).map((layer) => {
          const isDeleted =
            layer === 'symbol'
              ? isSymbolDeleted
              : layer === 'brandText'
              ? isBrandTextDeleted
              : layer === 'tagline'
              ? isTaglineDeleted
              : layer === 'badge'
              ? isBadgeDeleted
              : false;

          return (
            <button
              key={layer}
              onClick={() => {
                if (isDeleted) {
                  handleRestoreElement(layer);
                } else {
                  onSelectElement(layer);
                }
              }}
              title={isDeleted ? `Element is deleted. Click to + Add / Restore ${layer}` : `Select ${layer}`}
              className={`px-2.5 py-1 text-[11px] font-semibold capitalize rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                selectedElement === layer && !isDeleted
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40'
                  : isDeleted
                  ? 'text-slate-500 border border-dashed border-slate-700 hover:text-slate-200 hover:border-slate-500 hover:bg-slate-800'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {isDeleted && <Plus className="w-2.5 h-2.5 text-slate-400" />}
              <span>{layer === 'brandText' ? 'Brand Name' : layer === 'tagline' ? 'Tagline' : layer}</span>
              {isDeleted && <span className="text-[9px] text-slate-500 font-normal">(deleted)</span>}
            </button>
          );
        })}
      </div>

      {/* Live Drag/Transform Coordinate & Angle Tooltip Badge */}
      {interaction.mode !== 'idle' && (
        <div className="absolute bottom-16 z-30 flex items-center gap-3 px-4 py-2 bg-slate-900 border border-indigo-500 rounded-xl shadow-2xl shadow-indigo-950/60 text-xs font-mono text-white animate-in fade-in duration-100">
          <div className="flex items-center gap-1.5 text-indigo-400 font-sans font-bold">
            {interaction.mode === 'rotate' ? (
              <RotateCw className="w-3.5 h-3.5" />
            ) : interaction.mode === 'resize' ? (
              <Sparkles className="w-3.5 h-3.5" />
            ) : (
              <Move className="w-3.5 h-3.5" />
            )}
            <span className="capitalize">
              {interaction.element === 'brandText'
                ? 'Brand Name'
                : interaction.element === 'tagline'
                ? 'Tagline'
                : interaction.element}
            </span>
          </div>
          <div className="w-[1px] h-3.5 bg-slate-700" />
          <div className="flex items-center gap-2">
            <span className={interaction.isSnappedAngle || interaction.isSnappedX || interaction.isSnappedY ? 'text-emerald-400 font-bold' : 'text-slate-200'}>
              {interaction.tooltipText}
            </span>
          </div>
        </div>
      )}

      {/* Canvas Viewport Container */}
      <div
        className={`relative transition-transform duration-75 flex items-center justify-center shadow-2xl rounded-2xl overflow-hidden border border-slate-800 ${
          interaction.mode === 'move'
            ? 'cursor-grabbing'
            : interaction.mode === 'rotate'
            ? 'cursor-grabbing'
            : 'cursor-default'
        }`}
        style={{
          transform: `scale(${zoom})`,
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        {/* Checkered pattern background */}
        <div
          className={`absolute inset-0 w-full h-full transition-colors ${
            canvasBgMode === 'transparent_check'
              ? 'bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)] [background-size:20px_20px] [background-position:0_0,0_10px,10px_-10px,-10px_0px] bg-slate-900'
              : canvasBgMode === 'light'
              ? 'bg-slate-100'
              : ''
          }`}
          style={{
            backgroundColor: canvasBgMode === 'actual' ? logo.background.color : undefined,
          }}
        />

        {/* Alignment Grid Overlay */}
        {showGrid && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            <defs>
              <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#6366f1" strokeWidth="0.5" />
              </pattern>
              <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                <rect width="100" height="100" fill="url(#smallGrid)" />
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#818cf8" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <line x1={centerX} y1="0" x2={centerX} y2={height} stroke="#6366f1" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
            <line x1="0" y1={centerY} x2={width} y2={centerY} stroke="#6366f1" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
          </svg>
        )}

        {/* Snapping Guide Lines during Movement */}
        {interaction.mode === 'move' && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
            {interaction.isSnappedX && (
              <line
                x1={centerX}
                y1="0"
                x2={centerX}
                y2={height}
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="6 3"
                className="animate-pulse drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
              />
            )}
            {interaction.isSnappedY && (
              <line
                x1="0"
                y1={centerY}
                x2={width}
                y2={centerY}
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="6 3"
                className="animate-pulse drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
              />
            )}
          </svg>
        )}

        {/* Master Interactive SVG */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="relative w-full h-full select-none"
        >
          <defs>
            {/* Custom Background Image Blur Filter */}
            {logo.background.image?.blur && logo.background.image.blur > 0 && (
              <filter id="canvasBgImgBlur">
                <feGaussianBlur stdDeviation={logo.background.image.blur} />
              </filter>
            )}

            {/* Symbol Gradient */}
            {symGrad && (
              <linearGradient
                id="interactiveSymGrad"
                x1={`${symX1}%`}
                y1={`${symY1}%`}
                x2={`${symX2}%`}
                y2={`${symY2}%`}
              >
                <stop offset="0%" stopColor={symGrad.from} />
                <stop offset="100%" stopColor={symGrad.to} />
              </linearGradient>
            )}

            {/* Symbol Glow */}
            {logo.symbol.glow && logo.symbol.glow.blur > 0 && (
              <filter id="canvasGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation={logo.symbol.glow.blur / 2}
                  floodColor={logo.symbol.glow.color}
                  floodOpacity="0.8"
                />
              </filter>
            )}

            {/* Curved Path */}
            <path
              id="brandArcPath"
              d={`M ${centerX - (logo.brandText.curveRadius || 200)} ${brandY} A ${
                logo.brandText.curveRadius || 200
              } ${logo.brandText.curveRadius || 200} 0 0 1 ${
                centerX + (logo.brandText.curveRadius || 200)
              } ${brandY}`}
              fill="none"
            />
          </defs>

          {/* 0. CUSTOM BACKGROUND IMAGE LAYER */}
          {canvasBgMode !== 'transparent_check' && logo.background.image?.url && (
            <image
              href={logo.background.image.url}
              width={width}
              height={height}
              preserveAspectRatio="xMidYMid slice"
              opacity={logo.background.image.opacity ?? 1}
              filter={logo.background.image.blur && logo.background.image.blur > 0 ? 'url(#canvasBgImgBlur)' : undefined}
              className="pointer-events-none"
            />
          )}

          {/* 1. BADGE LAYER (CLICK & DRAG TO MOVE) */}
          {logo.badge.shape !== 'none' && (
            <g
              transform={`rotate(${logo.badge.rotation || 0}, ${badgeX}, ${badgeY})`}
              onPointerDown={(e) => startMove(e, 'badge')}
              onMouseEnter={() => setHoveredElement('badge')}
              onMouseLeave={() => setHoveredElement(null)}
              className="cursor-grab active:cursor-grabbing group transition-opacity"
            >
              {logo.badge.shape === 'circle' && (
                <circle
                  cx={badgeX}
                  cy={badgeY}
                  r={halfB}
                  stroke={logo.badge.strokeColor}
                  strokeWidth={logo.badge.strokeWidth}
                  fill={logo.badge.fillColor}
                  fillOpacity={logo.badge.fillOpacity}
                  strokeDasharray={
                    logo.badge.strokeStyle === 'dashed'
                      ? '12 6'
                      : logo.badge.strokeStyle === 'dotted'
                      ? '4 4'
                      : undefined
                  }
                />
              )}
              {logo.badge.shape === 'double_circle' && (
                <>
                  <circle
                    cx={badgeX}
                    cy={badgeY}
                    r={halfB}
                    stroke={logo.badge.strokeColor}
                    strokeWidth={logo.badge.strokeWidth}
                    fill={logo.badge.fillColor}
                    fillOpacity={logo.badge.fillOpacity}
                  />
                  <circle
                    cx={badgeX}
                    cy={badgeY}
                    r={halfB - 14}
                    stroke={logo.badge.strokeColor}
                    strokeWidth={Math.max(1, logo.badge.strokeWidth / 1.5)}
                    fill="none"
                  />
                </>
              )}
              {logo.badge.shape === 'hexagon' && (
                <polygon
                  points={`${badgeX},${badgeY - halfB} ${badgeX + halfB * 0.866},${badgeY - halfB * 0.5} ${
                    badgeX + halfB * 0.866
                  },${badgeY + halfB * 0.5} ${badgeX},${badgeY + halfB} ${
                    badgeX - halfB * 0.866
                  },${badgeY + halfB * 0.5} ${badgeX - halfB * 0.866},${badgeY - halfB * 0.5}`}
                  stroke={logo.badge.strokeColor}
                  strokeWidth={logo.badge.strokeWidth}
                  fill={logo.badge.fillColor}
                  fillOpacity={logo.badge.fillOpacity}
                />
              )}
              {logo.badge.shape === 'diamond' && (
                <polygon
                  points={`${badgeX},${badgeY - halfB} ${badgeX + halfB},${badgeY} ${badgeX},${
                    badgeY + halfB
                  } ${badgeX - halfB},${badgeY}`}
                  stroke={logo.badge.strokeColor}
                  strokeWidth={logo.badge.strokeWidth}
                  fill={logo.badge.fillColor}
                  fillOpacity={logo.badge.fillOpacity}
                />
              )}
              {logo.badge.shape === 'rounded_rect' && (
                <rect
                  x={badgeX - halfB}
                  y={badgeY - halfB}
                  width={bSize}
                  height={bSize}
                  rx="40"
                  stroke={logo.badge.strokeColor}
                  strokeWidth={logo.badge.strokeWidth}
                  fill={logo.badge.fillColor}
                  fillOpacity={logo.badge.fillOpacity}
                />
              )}
              {logo.badge.shape === 'stamp' && (
                <rect
                  x={badgeX - halfB}
                  y={badgeY - halfB}
                  width={bSize}
                  height={bSize}
                  rx="12"
                  stroke={logo.badge.strokeColor}
                  strokeWidth={logo.badge.strokeWidth}
                  strokeDasharray="12 6"
                  fill={logo.badge.fillColor}
                  fillOpacity={logo.badge.fillOpacity}
                />
              )}
              {logo.badge.shape === 'shield' && (
                <g transform={`translate(${badgeX}, ${badgeY}) scale(${badgeScale * 3.4}) translate(-50, -50)`}>
                  <path
                    d="M50 5 L88 22 V54 C88 74 50 94 50 94 C50 94 12 74 12 54 V22 Z"
                    stroke={logo.badge.strokeColor}
                    strokeWidth={logo.badge.strokeWidth / 3.4}
                    fill={logo.badge.fillColor}
                    fillOpacity={logo.badge.fillOpacity}
                  />
                </g>
              )}

              {/* Passive hover outline for Badge (active handles rendered by gizmo below) */}
              {hoveredElement === 'badge' && selectedElement !== 'badge' && (
                <rect
                  x={badgeX - halfB - 10}
                  y={badgeY - halfB - 10}
                  width={bSize + 20}
                  height={bSize + 20}
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="1"
                  strokeDasharray="6 4"
                  className="opacity-50 pointer-events-none"
                />
              )}
            </g>
          )}

          {/* 2. SYMBOL / MARK LAYER (VECTOR OR CUSTOM UPLOADED IMAGE LOGO) */}
          {!isSymbolDeleted && (
            <g
              onPointerDown={(e) => startMove(e, 'symbol')}
              onMouseEnter={() => setHoveredElement('symbol')}
              onMouseLeave={() => setHoveredElement(null)}
              className="cursor-grab active:cursor-grabbing"
            >
              {/* Passive Hover Box (active handles rendered by gizmo below) */}
              {hoveredElement === 'symbol' && selectedElement !== 'symbol' && (
                <g transform={`translate(${symX}, ${symY}) rotate(${symRot})`}>
                  <rect
                    x={-((vbW * symScale * 1.8) / 2) - 12}
                    y={-((vbH * symScale * 1.8) / 2) - 12}
                    width={vbW * symScale * 1.8 + 24}
                    height={vbH * symScale * 1.8 + 24}
                    rx="8"
                    fill="rgba(99, 102, 241, 0.04)"
                    stroke="#818cf8"
                    strokeWidth="1"
                    strokeDasharray="5 3"
                    className="pointer-events-none"
                  />
                </g>
              )}

              {/* Expanded hit target for smooth easy dragging */}
              <rect
                x={symX - ((vbW * symScale * 1.8) / 2) - 20}
                y={symY - ((vbH * symScale * 1.8) / 2) - 20}
                width={vbW * symScale * 1.8 + 40}
                height={vbH * symScale * 1.8 + 40}
                fill="transparent"
              />

              {/* Either Custom Image Logo or Vector Path */}
              <g
                transform={`translate(${symX}, ${symY}) rotate(${symRot}) scale(${symScale * 1.8}) translate(-${
                  vbW / 2
                }, -${vbH / 2})`}
                opacity={logo.symbol.opacity || 1}
                filter={logo.symbol.glow && logo.symbol.glow.blur > 0 ? 'url(#canvasGlow)' : undefined}
              >
                {logo.symbol.type === 'image' && logo.symbol.imageUrl ? (
                  <image
                    href={logo.symbol.imageUrl}
                    width={vbW}
                    height={vbH}
                    preserveAspectRatio="xMidYMid meet"
                  />
                ) : (
                  <path
                    d={logo.symbol.svgPath}
                    fill={
                      logo.symbol.fillType === 'gradient' && symGrad
                        ? 'url(#interactiveSymGrad)'
                        : logo.symbol.fillColor
                    }
                    stroke={logo.symbol.strokeColor || 'none'}
                    strokeWidth={logo.symbol.strokeWidth || 0}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                )}
              </g>
            </g>
          )}

          {/* 3. BRAND NAME TEXT LAYER */}
          {!isBrandTextDeleted && (
            <g
              onPointerDown={(e) => startMove(e, 'brandText')}
              onMouseEnter={() => setHoveredElement('brandText')}
              onMouseLeave={() => setHoveredElement(null)}
              className="cursor-grab active:cursor-grabbing"
            >
              {/* Passive Hover Outline */}
              {hoveredElement === 'brandText' && selectedElement !== 'brandText' && (
                <g transform={`translate(${brandX}, ${brandY}) rotate(${logo.brandText.rotation || 0})`}>
                  <rect
                    x={-220}
                    y={-(logo.brandText.fontSize * 0.35) - ((logo.brandText.fontSize * 1.25 + 16) / 2)}
                    width={440}
                    height={logo.brandText.fontSize * 1.25 + 16}
                    rx="6"
                    fill="rgba(99, 102, 241, 0.04)"
                    stroke="#818cf8"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    className="pointer-events-none"
                  />
                </g>
              )}

              <rect
                x={brandX - 220}
                y={brandY - logo.brandText.fontSize - 12}
                width={440}
                height={logo.brandText.fontSize + 32}
                fill="transparent"
              />

              {logo.brandText.isCurved ? (
                <text
                  style={{
                    fontFamily: `'${logo.brandText.fontFamily}', -apple-system, sans-serif`,
                    fontSize: `${logo.brandText.fontSize}px`,
                    fontWeight: logo.brandText.fontWeight,
                    letterSpacing: `${logo.brandText.letterSpacing}px`,
                    fill: logo.brandText.color,
                    textAnchor: 'middle',
                    textTransform: logo.brandText.textTransform,
                    pointerEvents: 'none',
                  }}
                >
                  <textPath href="#brandArcPath" startOffset="50%" textAnchor="middle">
                    {logo.brandText.text}
                  </textPath>
                </text>
              ) : (
                <text
                  x={brandX}
                  y={brandY}
                  transform={`rotate(${logo.brandText.rotation || 0}, ${brandX}, ${brandY})`}
                  style={{
                    fontFamily: `'${logo.brandText.fontFamily}', -apple-system, sans-serif`,
                    fontSize: `${logo.brandText.fontSize}px`,
                    fontWeight: logo.brandText.fontWeight,
                    letterSpacing: `${logo.brandText.letterSpacing}px`,
                    fill: logo.brandText.color,
                    textAnchor: 'middle',
                    textTransform: logo.brandText.textTransform,
                    pointerEvents: 'none',
                  }}
                >
                  {logo.brandText.text}
                </text>
              )}
            </g>
          )}

          {/* 4. TAGLINE TEXT LAYER */}
          {logo.taglineText.text && (
            <g
              onPointerDown={(e) => startMove(e, 'tagline')}
              onMouseEnter={() => setHoveredElement('tagline')}
              onMouseLeave={() => setHoveredElement(null)}
              className="cursor-grab active:cursor-grabbing"
            >
              {/* Passive Hover Outline */}
              {hoveredElement === 'tagline' && selectedElement !== 'tagline' && (
                <g transform={`translate(${tagX}, ${tagY}) rotate(${logo.taglineText.rotation || 0})`}>
                  <rect
                    x={-180}
                    y={-(logo.taglineText.fontSize * 0.35) - ((logo.taglineText.fontSize * 1.25 + 14) / 2)}
                    width={360}
                    height={logo.taglineText.fontSize * 1.25 + 14}
                    rx="6"
                    fill="rgba(56, 189, 248, 0.04)"
                    stroke="#38bdf8"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    className="pointer-events-none"
                  />
                </g>
              )}

              <rect
                x={tagX - 180}
                y={tagY - logo.taglineText.fontSize - 10}
                width={360}
                height={logo.taglineText.fontSize + 26}
                fill="transparent"
              />

              <text
                x={tagX}
                y={tagY}
                transform={`rotate(${logo.taglineText.rotation || 0}, ${tagX}, ${tagY})`}
                style={{
                  fontFamily: `'${logo.taglineText.fontFamily}', -apple-system, sans-serif`,
                  fontSize: `${logo.taglineText.fontSize}px`,
                  fontWeight: logo.taglineText.fontWeight || '500',
                  letterSpacing: `${logo.taglineText.letterSpacing}px`,
                  fill: logo.taglineText.color,
                  textAnchor: 'middle',
                  textTransform: logo.taglineText.textTransform,
                  pointerEvents: 'none',
                }}
              >
                {logo.taglineText.text}
              </text>
            </g>
          )}

          {/* 5. MASTER INTERACTIVE TRANSFORM GIZMO (CORNER RESIZE POINTS + ROTATION STEM CIRCLE) */}
          {selectedElement !== 'background' && (() => {
            const tData = getElementTransformData(selectedElement);
            if (!tData) return null;

            return (
              <g
                className="select-none pointer-events-auto"
                transform={`translate(${tData.cx}, ${tData.cy}) rotate(${tData.rot})`}
              >
                {/* Bounding Box Rect */}
                <rect
                  x={-tData.halfW}
                  y={tData.topY}
                  width={tData.w}
                  height={tData.h}
                  rx="8"
                  fill="rgba(99, 102, 241, 0.04)"
                  stroke={interaction.mode !== 'idle' ? '#6366f1' : '#818cf8'}
                  strokeWidth={interaction.mode !== 'idle' ? '2' : '1.5'}
                  strokeDasharray="6 4"
                  className="pointer-events-none transition-all duration-100"
                />

                {/* Rotation Stem Line extending upward from top-center */}
                <line
                  x1="0"
                  y1={tData.topY}
                  x2="0"
                  y2={tData.topY - 26}
                  stroke="#6366f1"
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                  className="pointer-events-none"
                />

                {/* ROTATION HANDLE CIRCLE (User requested: "little circle to rotate the logo or text") */}
                <g className="cursor-grab active:cursor-grabbing group">
                  {/* Expanded invisible touch/click target */}
                  <circle
                    cx="0"
                    cy={tData.topY - 26}
                    r="16"
                    fill="transparent"
                    onPointerDown={(e) => startRotate(e, selectedElement)}
                  />

                  {/* Outer active pulse ping */}
                  {interaction.mode === 'rotate' && (
                    <circle
                      cx="0"
                      cy={tData.topY - 26}
                      r="12"
                      fill="rgba(99, 102, 241, 0.4)"
                      className="animate-ping"
                    />
                  )}

                  {/* Visible white circle handle with indigo border */}
                  <circle
                    cx="0"
                    cy={tData.topY - 26}
                    r="7.5"
                    fill="#ffffff"
                    stroke="#4f46e5"
                    strokeWidth="2.5"
                    className="transition-transform group-hover:scale-125 filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.4)]"
                    onPointerDown={(e) => startRotate(e, selectedElement)}
                  />

                  {/* Inner Rotation Dot Cue */}
                  <circle
                    cx="0"
                    cy={tData.topY - 26}
                    r="2.5"
                    fill="#6366f1"
                    className="pointer-events-none"
                  />
                </g>

                {/* 4 CORNER RESIZE POINTS (User requested: "point in the corner of the object to make the size") */}
                {(['nw', 'ne', 'se', 'sw'] as const).map((corner) => {
                  const pos = tData.corners[corner];
                  const cursorStyle = corner === 'nw' || corner === 'se' ? 'nwse-resize' : 'nesw-resize';
                  const isThisCornerActive = interaction.mode === 'resize' && interaction.corner === corner;

                  return (
                    <g key={corner} style={{ cursor: cursorStyle }} className="group">
                      {/* Expanded invisible touch/click hit area */}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="14"
                        fill="transparent"
                        onPointerDown={(e) => startResize(e, selectedElement, corner)}
                      />

                      {/* Active Resize Ping */}
                      {isThisCornerActive && (
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="10"
                          fill="rgba(99, 102, 241, 0.4)"
                          className="animate-ping"
                        />
                      )}

                      {/* Visible Crisp Corner Dot Handle */}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="6"
                        fill="#ffffff"
                        stroke="#4f46e5"
                        strokeWidth="2"
                        className="transition-transform group-hover:scale-125 filter drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]"
                        onPointerDown={(e) => startResize(e, selectedElement, corner)}
                      />
                    </g>
                  );
                })}

                {/* 6. ON-CANVAS FLOATING DELETE BUTTON (One-click delete directly on the active object) */}
                {interaction.mode === 'idle' && (
                  <g
                    transform={`translate(${tData.halfW + 14}, ${tData.topY - 14})`}
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteElement(selectedElement);
                    }}
                  >
                    {/* Expanded hit area */}
                    <circle cx="0" cy="0" r="18" fill="transparent" />
                    {/* Red badge */}
                    <circle
                      cx="0"
                      cy="0"
                      r="11"
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth="1.8"
                      className="transition-transform group-hover:scale-125 filter drop-shadow-[0_2px_8px_rgba(239,68,68,0.6)]"
                    />
                    {/* Trash Icon */}
                    <path
                      d="M-4.5 -3 h9 M-3.5 -3 v6 a1 1 0 0 0 1 1 h5 a1 1 0 0 0 1 -1 v-6 M-1.8 -4.5 h3.6"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="pointer-events-none"
                    />
                    <path
                      d="M-1.2 -1 v3 M1.2 -1 v3"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="1.1"
                      strokeLinecap="round"
                      className="pointer-events-none"
                    />
                    <title>Delete {selectedElement === 'brandText' ? 'Brand Name' : selectedElement === 'tagline' ? 'Tagline' : selectedElement} (Del / Backspace)</title>
                  </g>
                )}

                {/* Live Floating Tooltip Pill positioned above the Rotation Handle */}
                {interaction.mode !== 'idle' && interaction.tooltipText && (
                  <g
                    transform={`translate(0, ${tData.topY - 48})`}
                    className="pointer-events-none"
                  >
                    <rect
                      x="-60"
                      y="-13"
                      width="120"
                      height="24"
                      rx="12"
                      fill="#0f172a"
                      stroke={interaction.isSnappedAngle || interaction.isSnappedX || interaction.isSnappedY ? '#10b981' : '#6366f1'}
                      strokeWidth="1.5"
                      className="shadow-2xl"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fill={interaction.isSnappedAngle || interaction.isSnappedX || interaction.isSnappedY ? '#34d399' : '#ffffff'}
                      fontSize="10.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {interaction.tooltipText}
                    </text>
                  </g>
                )}
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Bottom Floating Quick Actions Toolbar */}
      {(() => {
        const isCurrentDeleted =
          selectedElement === 'symbol'
            ? isSymbolDeleted
            : selectedElement === 'brandText'
            ? isBrandTextDeleted
            : selectedElement === 'tagline'
            ? isTaglineDeleted
            : selectedElement === 'badge'
            ? isBadgeDeleted
            : false;

        return (
          <div className="absolute bottom-4 z-20 flex items-center gap-2 p-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-xl text-xs text-slate-300">
            <span className="px-2 font-medium text-slate-400">Selected:</span>
            <span className={`font-bold capitalize px-2 py-0.5 rounded border ${
              isCurrentDeleted
                ? 'text-rose-400 bg-rose-950/40 border-rose-800/40'
                : 'text-white bg-slate-800 border-slate-700'
            }`}>
              {selectedElement === 'brandText' ? 'Brand Name' : selectedElement === 'tagline' ? 'Tagline' : selectedElement}
              {isCurrentDeleted && ' (Deleted)'}
            </span>
            <div className="w-[1px] h-4 bg-slate-800 mx-1" />

            {!isCurrentDeleted && selectedElement !== 'background' && (
              <>
                <button
                  onClick={() => {
                    if (selectedElement === 'symbol') {
                      onUpdateLogo((prev) => ({ ...prev, symbol: { ...prev.symbol, offsetX: 0 } }));
                    } else if (selectedElement === 'brandText') {
                      onUpdateLogo((prev) => ({ ...prev, brandText: { ...prev.brandText, offsetX: 0 } }));
                    } else if (selectedElement === 'tagline') {
                      onUpdateLogo((prev) => ({ ...prev, taglineText: { ...prev.taglineText, offsetX: 0 } }));
                    } else if (selectedElement === 'badge') {
                      onUpdateLogo((prev) => ({ ...prev, badge: { ...prev.badge, offsetX: 0 } }));
                    }
                  }}
                  title="Align item to exact horizontal center (X=0)"
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeftRight className="w-3 h-3 text-indigo-400" />
                  Center X
                </button>

                <button
                  onClick={() => {
                    if (selectedElement === 'symbol') {
                      onUpdateLogo((prev) => ({ ...prev, symbol: { ...prev.symbol, offsetY: 0 } }));
                    } else if (selectedElement === 'brandText') {
                      onUpdateLogo((prev) => ({ ...prev, brandText: { ...prev.brandText, offsetY: 0 } }));
                    } else if (selectedElement === 'tagline') {
                      onUpdateLogo((prev) => ({ ...prev, taglineText: { ...prev.taglineText, offsetY: 0 } }));
                    } else if (selectedElement === 'badge') {
                      onUpdateLogo((prev) => ({ ...prev, badge: { ...prev.badge, offsetY: 0 } }));
                    }
                  }}
                  title="Align item to exact vertical center (Y=0)"
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowUpDown className="w-3 h-3 text-indigo-400" />
                  Center Y
                </button>

                <button
                  onClick={() => {
                    onUpdateLogo((prev) => {
                      if (selectedElement === 'symbol') {
                        return { ...prev, symbol: { ...prev.symbol, rotation: ((prev.symbol.rotation || 0) + 45) % 360 } };
                      } else if (selectedElement === 'brandText') {
                        return { ...prev, brandText: { ...prev.brandText, rotation: ((prev.brandText.rotation || 0) + 45) % 360 } };
                      } else if (selectedElement === 'tagline') {
                        return { ...prev, taglineText: { ...prev.taglineText, rotation: ((prev.taglineText.rotation || 0) + 45) % 360 } };
                      } else if (selectedElement === 'badge') {
                        return { ...prev, badge: { ...prev.badge, rotation: ((prev.badge.rotation || 0) + 45) % 360 } };
                      }
                      return prev;
                    });
                  }}
                  title="Rotate item by 45°"
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCw className="w-3 h-3 text-indigo-400" />
                  Rotate 45°
                </button>

                <button
                  onClick={() => {
                    onUpdateLogo((prev) => {
                      if (selectedElement === 'symbol') {
                        return { ...prev, symbol: { ...prev.symbol, rotation: 0 } };
                      } else if (selectedElement === 'brandText') {
                        return { ...prev, brandText: { ...prev.brandText, rotation: 0 } };
                      } else if (selectedElement === 'tagline') {
                        return { ...prev, taglineText: { ...prev.taglineText, rotation: 0 } };
                      } else if (selectedElement === 'badge') {
                        return { ...prev, badge: { ...prev.badge, rotation: 0 } };
                      }
                      return prev;
                    });
                  }}
                  title="Reset item rotation to 0°"
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors flex items-center gap-1 cursor-pointer text-[11px]"
                >
                  Reset 0°
                </button>
              </>
            )}

            {/* DELETE BUTTON (User requested: "add a delete button for things", "and also put to delete an object") */}
            {selectedElement !== 'background' && !isCurrentDeleted && (
              <button
                onClick={() => handleDeleteElement(selectedElement)}
                title={`Delete ${selectedElement === 'brandText' ? 'Brand Name' : selectedElement === 'tagline' ? 'Tagline' : selectedElement} (Del / Backspace key)`}
                className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 hover:border-rose-500 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-semibold ml-1 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete</span>
                <kbd className="text-[9px] bg-rose-950/80 px-1 py-0.5 rounded border border-rose-500/40">Del</kbd>
              </button>
            )}

            {/* RESTORE BUTTON IF CURRENT ELEMENT IS DELETED */}
            {selectedElement !== 'background' && isCurrentDeleted && (
              <button
                onClick={() => handleRestoreElement(selectedElement)}
                title={`Add / Restore ${selectedElement === 'brandText' ? 'Brand Name' : selectedElement === 'tagline' ? 'Tagline' : selectedElement}`}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-semibold shadow-md ml-1"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
                <span>+ Add {selectedElement === 'brandText' ? 'Brand Name' : selectedElement === 'tagline' ? 'Tagline' : selectedElement}</span>
              </button>
            )}

            {logo.background.image?.url && selectedElement === 'background' && (
              <button
                onClick={() => handleDeleteElement('background')}
                title="Delete background image"
                className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 hover:border-rose-500 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete BG Image</span>
              </button>
            )}
          </div>
        );
      })()}
    </div>
  );
};
