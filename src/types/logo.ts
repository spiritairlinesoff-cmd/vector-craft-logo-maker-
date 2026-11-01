export type LayoutType = 'stacked' | 'horizontal' | 'badge' | 'monogram' | 'minimal' | 'inverted';

export type BadgeShape = 'none' | 'circle' | 'double_circle' | 'shield' | 'hexagon' | 'diamond' | 'rounded_rect' | 'stamp' | 'crest' | 'octagon';

export interface GradientConfig {
  id: string;
  from: string;
  to: string;
  angle: number; // in degrees
}

export interface SymbolElement {
  id: string;
  name: string;
  type?: 'svg_path' | 'image';
  svgPath: string;
  viewBox: string;
  imageUrl?: string;
  aspectRatio?: number;
  fillType: 'solid' | 'gradient';
  fillColor: string;
  gradient?: GradientConfig;
  strokeColor: string;
  strokeWidth: number;
  scale: number;
  rotation: number; // in degrees
  offsetX: number;
  offsetY: number;
  opacity: number;
  glow?: {
    color: string;
    blur: number;
  };
}

export interface TextElement {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  letterSpacing: number; // tracking in px
  color: string;
  textTransform: 'uppercase' | 'capitalize' | 'lowercase' | 'none';
  offsetX: number;
  offsetY: number;
  rotation: number;
  isCurved?: boolean;
  curveRadius?: number; // arc radius
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
}

export interface BadgeConfig {
  shape: BadgeShape;
  strokeColor: string;
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted' | 'double';
  fillColor: string;
  fillOpacity: number;
  scale: number;
  rotation: number;
  offsetX?: number;
  offsetY?: number;
}

export interface BackgroundImageConfig {
  url: string;
  opacity: number;
  blur: number;
  fit: 'cover' | 'contain' | 'fill';
  scale?: number;
  offsetX?: number;
  offsetY?: number;
}

export interface BackgroundConfig {
  type: 'solid' | 'gradient' | 'transparent' | 'image';
  color: string;
  gradient?: {
    from: string;
    to: string;
    angle: number;
  };
  image?: BackgroundImageConfig;
}

export interface LogoConfig {
  id: string;
  title: string;
  brandStory?: string;
  layout: LayoutType;
  symbol: SymbolElement;
  brandText: TextElement;
  taglineText: TextElement;
  badge: BadgeConfig;
  background: BackgroundConfig;
  palette: string[];
  canvasSize: { width: number; height: number };
}

export interface ColorPalette {
  name: string;
  category: string;
  colors: string[];
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
}

export interface TemplatePreset {
  id: string;
  title: string;
  industry: string;
  style: string;
  previewColor: string;
  config: LogoConfig;
}
