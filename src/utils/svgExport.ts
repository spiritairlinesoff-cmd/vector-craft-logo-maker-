import JSZip from 'jszip';
import { LogoConfig } from '../types/logo';
import { generateWindowsExecutable } from './peGenerator';

export function renderLogoToSvgString(config: LogoConfig, transparentBg: boolean = false): string {
  const width = config.canvasSize.width;
  const height = config.canvasSize.height;
  const centerX = width / 2;
  const centerY = height / 2;

  // Background element
  let bgElement = '';
  if (!transparentBg) {
    if (config.background.type === 'solid' || config.background.image?.url) {
      bgElement = `<rect width="${width}" height="${height}" fill="${config.background.color || '#090d16'}" />`;
    } else if (config.background.type === 'gradient' && config.background.gradient) {
      bgElement = `
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${config.background.gradient.from}" />
            <stop offset="100%" stop-color="${config.background.gradient.to}" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
      `;
    }

    // Embed Custom Background Image if present
    if (config.background.image?.url) {
      const bgImg = config.background.image;
      const blurFilter = bgImg.blur && bgImg.blur > 0 ? `filter="url(#bgImgBlur)"` : '';
      bgElement += `
        <image
          href="${bgImg.url}"
          width="${width}"
          height="${height}"
          preserveAspectRatio="xMidYMid slice"
          opacity="${bgImg.opacity ?? 1}"
          ${blurFilter}
        />
      `;
    }
  }

  // Symbol Gradient Definition
  let defs = '';
  if (config.symbol.fillType === 'gradient' && config.symbol.gradient) {
    const angleRad = ((config.symbol.gradient.angle || 0) * Math.PI) / 180;
    const x1 = Math.round(50 + Math.sin(angleRad - Math.PI / 2) * 50);
    const y1 = Math.round(50 + Math.cos(angleRad - Math.PI / 2) * 50);
    const x2 = Math.round(50 + Math.sin(angleRad + Math.PI / 2) * 50);
    const y2 = Math.round(50 + Math.cos(angleRad + Math.PI / 2) * 50);

    defs += `
      <linearGradient id="${config.symbol.gradient.id || 'symbolGrad'}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
        <stop offset="0%" stop-color="${config.symbol.gradient.from}" />
        <stop offset="100%" stop-color="${config.symbol.gradient.to}" />
      </linearGradient>
    `;
  }

  // Symbol Glow Filter
  if (config.symbol.glow && config.symbol.glow.blur > 0) {
    defs += `
      <filter id="symbolGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="0" stdDeviation="${config.symbol.glow.blur / 2}" flood-color="${config.symbol.glow.color}" flood-opacity="0.8"/>
      </filter>
    `;
  }

  // Badge Element
  let badgeSvg = '';
  if (config.badge.shape !== 'none') {
    const badgeScale = config.badge.scale || 1;
    const badgeStroke = config.badge.strokeColor;
    const badgeStrokeWidth = config.badge.strokeWidth;
    const badgeFill = config.badge.fillColor;
    const badgeOpacity = config.badge.fillOpacity;

    const badgeX = centerX + (config.badge.offsetX || 0);
    const badgeY = centerY + (config.badge.offsetY || 0);
    const bSize = 340 * badgeScale;
    const halfB = bSize / 2;

    switch (config.badge.shape) {
      case 'circle':
        badgeSvg = `<circle cx="${badgeX}" cy="${badgeY}" r="${halfB}" stroke="${badgeStroke}" stroke-width="${badgeStrokeWidth}" fill="${badgeFill}" fill-opacity="${badgeOpacity}" />`;
        break;
      case 'double_circle':
        badgeSvg = `
          <circle cx="${badgeX}" cy="${badgeY}" r="${halfB}" stroke="${badgeStroke}" stroke-width="${badgeStrokeWidth}" fill="${badgeFill}" fill-opacity="${badgeOpacity}" />
          <circle cx="${badgeX}" cy="${badgeY}" r="${halfB - 14}" stroke="${badgeStroke}" stroke-width="${Math.max(1, badgeStrokeWidth / 1.5)}" fill="none" />
        `;
        break;
      case 'shield':
        badgeSvg = `
          <g transform="translate(${badgeX}, ${badgeY}) scale(${badgeScale}) translate(-50, -50)">
            <path d="M50 5 L88 22 V54 C88 74 50 94 50 94 C50 94 12 74 12 54 V22 Z" stroke="${badgeStroke}" stroke-width="${badgeStrokeWidth}" fill="${badgeFill}" fill-opacity="${badgeOpacity}" transform="scale(3.4) translate(-35, -35)"/>
          </g>
        `;
        break;
      case 'hexagon':
        badgeSvg = `
          <polygon points="${badgeX},${badgeY - halfB} ${badgeX + halfB * 0.866},${badgeY - halfB * 0.5} ${badgeX + halfB * 0.866},${badgeY + halfB * 0.5} ${badgeX},${badgeY + halfB} ${badgeX - halfB * 0.866},${badgeY + halfB * 0.5} ${badgeX - halfB * 0.866},${badgeY - halfB * 0.5}" stroke="${badgeStroke}" stroke-width="${badgeStrokeWidth}" fill="${badgeFill}" fill-opacity="${badgeOpacity}" />
        `;
        break;
      case 'diamond':
        badgeSvg = `
          <polygon points="${badgeX},${badgeY - halfB} ${badgeX + halfB},${badgeY} ${badgeX},${badgeY + halfB} ${badgeX - halfB},${badgeY}" stroke="${badgeStroke}" stroke-width="${badgeStrokeWidth}" fill="${badgeFill}" fill-opacity="${badgeOpacity}" />
        `;
        break;
      case 'rounded_rect':
        badgeSvg = `<rect x="${badgeX - halfB}" y="${badgeY - halfB}" width="${bSize}" height="${bSize}" rx="40" stroke="${badgeStroke}" stroke-width="${badgeStrokeWidth}" fill="${badgeFill}" fill-opacity="${badgeOpacity}" />`;
        break;
      case 'stamp':
        badgeSvg = `<rect x="${badgeX - halfB}" y="${badgeY - halfB}" width="${bSize}" height="${bSize}" rx="12" stroke="${badgeStroke}" stroke-width="${badgeStrokeWidth}" stroke-dasharray="12 6" fill="${badgeFill}" fill-opacity="${badgeOpacity}" />`;
        break;
      default:
        break;
    }
  }

  // Symbol Position and Transform
  const symX = centerX + config.symbol.offsetX;
  const symY = centerY + config.symbol.offsetY;
  const symScale = config.symbol.scale || 1;
  const symRot = config.symbol.rotation || 0;
  const symFill = config.symbol.fillType === 'gradient' ? `url(#${config.symbol.gradient?.id || 'symbolGrad'})` : config.symbol.fillColor;
  const symFilter = config.symbol.glow && config.symbol.glow.blur > 0 ? `filter="url(#symbolGlow)"` : '';

  // Extract ViewBox to center scale properly (default 100x100)
  const vbParts = (config.symbol.viewBox || '0 0 100 100').split(' ').map(Number);
  const vbW = vbParts[2] || 100;
  const vbH = vbParts[3] || 100;

  // Background Image Blur Filter
  if (config.background.image?.blur && config.background.image.blur > 0) {
    defs += `
      <filter id="bgImgBlur">
        <feGaussianBlur stdDeviation="${config.background.image.blur}" />
      </filter>
    `;
  }

  const symbolContent = config.symbol.type === 'image' && config.symbol.imageUrl ? `
    <image
      href="${config.symbol.imageUrl}"
      width="${vbW}"
      height="${vbH}"
      preserveAspectRatio="xMidYMid meet"
    />
  ` : `
    <path
      d="${config.symbol.svgPath}"
      fill="${symFill}"
      stroke="${config.symbol.strokeColor || 'none'}"
      stroke-width="${config.symbol.strokeWidth || 0}"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
  `;

  const symbolSvg = `
    <g transform="translate(${symX}, ${symY}) rotate(${symRot}) scale(${symScale * 1.8}) translate(-${vbW / 2}, -${vbH / 2})" opacity="${config.symbol.opacity || 1}" ${symFilter}>
      ${symbolContent}
    </g>
  `;

  // Brand Name Text
  const brandX = centerX + config.brandText.offsetX;
  const brandY = centerY + config.brandText.offsetY;
  const brandStyle = `
    font-family: '${config.brandText.fontFamily}', -apple-system, sans-serif;
    font-size: ${config.brandText.fontSize}px;
    font-weight: ${config.brandText.fontWeight};
    letter-spacing: ${config.brandText.letterSpacing}px;
    fill: ${config.brandText.color};
    text-anchor: middle;
    text-transform: ${config.brandText.textTransform};
  `;

  let brandTextSvg = '';
  if (config.brandText.isCurved) {
    const r = config.brandText.curveRadius || 200;
    defs += `
      <path id="brandCurvePath" d="M ${centerX - r} ${brandY} A ${r} ${r} 0 0 1 ${centerX + r} ${brandY}" fill="none" />
    `;
    brandTextSvg = `
      <text style="${brandStyle}">
        <textPath href="#brandCurvePath" startOffset="50%" text-anchor="middle">
          ${escapeXml(config.brandText.text)}
        </textPath>
      </text>
    `;
  } else {
    brandTextSvg = `
      <text x="${brandX}" y="${brandY}" style="${brandStyle}" transform="rotate(${config.brandText.rotation || 0}, ${brandX}, ${brandY})">
        ${escapeXml(config.brandText.text)}
      </text>
    `;
  }

  // Tagline Text
  let taglineSvg = '';
  if (config.taglineText.text) {
    const tagX = centerX + config.taglineText.offsetX;
    const tagY = centerY + config.taglineText.offsetY;
    const tagStyle = `
      font-family: '${config.taglineText.fontFamily}', -apple-system, sans-serif;
      font-size: ${config.taglineText.fontSize}px;
      font-weight: ${config.taglineText.fontWeight || '500'};
      letter-spacing: ${config.taglineText.letterSpacing}px;
      fill: ${config.taglineText.color};
      text-anchor: middle;
      text-transform: ${config.taglineText.textTransform};
    `;

    taglineSvg = `
      <text x="${tagX}" y="${tagY}" style="${tagStyle}" transform="rotate(${config.taglineText.rotation || 0}, ${tagX}, ${tagY})">
        ${escapeXml(config.taglineText.text)}
      </text>
    `;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${defs ? `<defs>${defs}</defs>` : ''}
  ${bgElement}
  ${badgeSvg}
  ${symbolSvg}
  ${brandTextSvg}
  ${taglineSvg}
</svg>`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Convert SVG to PNG Blob using browser canvas
export async function rasterizeSvgToBlob(svgString: string, targetWidth: number, targetHeight: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        return reject(new Error('Canvas context not available'));
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate PNG blob'));
        }
      }, 'image/png');
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
}

// Trigger direct browser download
export function triggerFileDownload(blob: Blob | string, filename: string) {
  const url = typeof blob === 'string' ? blob : URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (typeof blob !== 'string') {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

// Generate complete Brand Kit ZIP bundle
export async function generateBrandKitZip(config: LogoConfig, appUrl: string = window.location.origin): Promise<Blob> {
  const zip = new JSZip();

  const brandSlug = (config.brandText.text || 'brand')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');

  // 1. Vector SVG (with and without background)
  const fullSvg = renderLogoToSvgString(config, false);
  const transparentSvg = renderLogoToSvgString(config, true);
  zip.file(`${brandSlug}-logo-vector.svg`, fullSvg);
  zip.file(`${brandSlug}-logo-transparent.svg`, transparentSvg);

  // 2. High Resolution PNGs
  const standardBlob = await rasterizeSvgToBlob(fullSvg, 800, 800);
  const hdBlob = await rasterizeSvgToBlob(fullSvg, 1600, 1600);
  const ultraBlob = await rasterizeSvgToBlob(fullSvg, 3200, 3200);
  const transparentBlob = await rasterizeSvgToBlob(transparentSvg, 1600, 1600);

  zip.file(`${brandSlug}-800px.png`, standardBlob);
  zip.file(`${brandSlug}-1600px-HD.png`, hdBlob);
  zip.file(`${brandSlug}-3200px-4K.png`, ultraBlob);
  zip.file(`${brandSlug}-transparent.png`, transparentBlob);

  // 3. App Icons & Favicon
  const icon192 = await rasterizeSvgToBlob(fullSvg, 192, 192);
  const icon512 = await rasterizeSvgToBlob(fullSvg, 512, 512);
  const favicon32 = await rasterizeSvgToBlob(fullSvg, 32, 32);

  const iconsFolder = zip.folder('web-icons');
  if (iconsFolder) {
    iconsFolder.file('favicon-32x32.png', favicon32);
    iconsFolder.file('icon-192x192.png', icon192);
    iconsFolder.file('icon-512x512.png', icon512);
  }

  // 4. Windows PC Desktop Launcher Folder
  const windowsFolder = zip.folder('windows-desktop-app');
  if (windowsFolder) {
    const batScript = `@echo off
title VectorCraft Logo Maker - ${config.brandText.text}
echo Opening VectorCraft Desktop Studio on your PC...
echo.

:: Try opening with Microsoft Edge in Standalone App Window Mode
start msedge.exe --app="${appUrl}" --window-size=1440,900
if %errorlevel% == 0 goto success

:: Try opening with Google Chrome in Standalone App Window Mode
start chrome.exe --app="${appUrl}" --window-size=1440,900
if %errorlevel% == 0 goto success

:: Fallback to default browser
start "" "${appUrl}"

:success
exit
`;

    const shortcutUrl = `[InternetShortcut]
URL=${appUrl}
IconIndex=0
`;

    const psInstaller = `# PowerShell Desktop Shortcut Generator for VectorCraft
$DesktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$ShortcutPath = Join-Path -Path $DesktopPath -ChildPath "VectorCraft Logo Maker.lnk"
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "msedge.exe"
$Shortcut.Arguments = "--app=${appUrl}"
$Shortcut.Description = "VectorCraft AI Logo Maker Desktop Studio"
$Shortcut.Save()
Write-Host "Desktop shortcut created successfully on your Windows PC!" -ForegroundColor Green
pause
`;

    const exeBuffer = generateWindowsExecutable(appUrl);
    windowsFolder.file('VectorCraft-Desktop.exe', exeBuffer);
    windowsFolder.file('Launch-VectorCraft-Desktop.bat', batScript);
    windowsFolder.file('VectorCraft-Web.url', shortcutUrl);
    windowsFolder.file('Install-Windows-Desktop-Shortcut.ps1', psInstaller);
    windowsFolder.file('README-WINDOWS.txt', `VectorCraft Windows PC Instructions:
======================================
1. To run as a standalone Windows App (.EXE):
   Double-click "VectorCraft-Desktop.exe" or "Launch-VectorCraft-Desktop.bat".
   It will instantly launch VectorCraft in a dedicated borderless Windows
   application window without browser chrome!

2. To create a Desktop Shortcut:
   Right-click "Install-Windows-Desktop-Shortcut.ps1" and select "Run with PowerShell".

3. You can also install directly from Chrome/Edge by clicking the 'Install App' icon
   in the browser address bar for full offline Windows integration.`);
  }

  // 5. Brand Identity Guide Readme
  const guideText = `======================================================
BRAND IDENTITY & ASSET SPECIFICATIONS: ${config.brandText.text.toUpperCase()}
======================================================
Generated by VectorCraft AI Logo Maker & Desktop Studio

BRAND TYPOGRAPHY:
- Primary Font: ${config.brandText.fontFamily} (${config.brandText.fontWeight})
- Tagline Font: ${config.taglineText.fontFamily} (${config.taglineText.fontWeight || '500'})

BRAND COLOR HARMONY:
${config.palette.map((c, i) => `Color ${i + 1}: ${c}`).join('\n')}

PRIMARY ACCENTS:
- Symbol Fill: ${config.symbol.fillColor}
- Background: ${config.background.color}

INCLUDED ASSETS:
- Vector SVG: Infinitely scalable, perfect for billboards, vinyl, screen printing.
- Transparent PNG: 1600x1600, ideal for dark & light overlays, presentations.
- 4K Ultra-HD PNG: 3200x3200 for print, merchandise, packaging.
- Web & App Icons: 32x32, 192x192, 512x512 for website favicons and PWA.
- Windows PC Desktop Launcher: Standalone execution script for PC.
`;

  zip.file('BRAND-STYLE-GUIDE.txt', guideText);

  return zip.generateAsync({ type: 'blob' });
}
