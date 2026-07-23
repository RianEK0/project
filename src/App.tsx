import {
  Camera,
  Copy,
  Download,
  Eraser,
  FlipHorizontal2,
  GalleryHorizontalEnd,
  ImagePlus,
  Images,
  Layers3,
  MoonStar,
  Paintbrush2,
  RefreshCcw,
  Settings2,
  Share2,
  Sparkles,
  TimerReset,
  Type,
  Upload,
  WandSparkles,
  Zap,
} from 'lucide-react';
import type { ChangeEvent, CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

type SidebarId =
  | 'capture'
  | 'style'
  | 'layout'
  | 'draw'
  | 'overlay'
  | 'gallery'
  | 'export'
  | 'settings';

type FilterId =
  | 'none'
  | 'warm'
  | 'cool'
  | 'mono'
  | 'sepia'
  | 'vintage'
  | 'dream'
  | 'neon'
  | 'cinematic';

type EffectId =
  | 'none'
  | 'hearts'
  | 'sparkles'
  | 'snow'
  | 'rain'
  | 'bubble'
  | 'galaxy'
  | 'confetti'
  | 'fire';

type LayoutId =
  | 'single'
  | 'grid2'
  | 'grid4'
  | 'grid9'
  | 'strip4'
  | 'story'
  | 'passport'
  | 'polaroid';

type SceneId = 'none' | 'studio' | 'sunset' | 'aurora' | 'cyber' | 'ocean';
type FrameId = 'none' | 'glass' | 'neon' | 'polaroid' | 'passport';
type ResolutionId = 'hd' | 'fhd' | 'uhd';
type ThemeId = 'dark' | 'light';
type AccentId = 'electric' | 'sunset' | 'aurora';
type PerformanceMode = 'quality' | 'balanced' | 'battery';
type ExportFormat = 'png' | 'jpeg' | 'webp';

type Point = { x: number; y: number };

type Stroke = {
  id: string;
  points: Point[];
  color: string;
  size: number;
  erase: boolean;
};

type OverlayItem = {
  id: string;
  label: string;
  text: string;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
};

type GalleryItem = {
  id: string;
  dataUrl: string;
  createdAt: string;
  label: string;
};

type ThemePalette = {
  id: AccentId;
  name: string;
  primary: string;
  secondary: string;
  tertiary: string;
};

type Rect = { x: number; y: number; width: number; height: number; radius: number };

const GALLERY_STORAGE_KEY = 'visionsnap-gallery-v2';

const sidebarItems: Array<{
  id: SidebarId;
  label: string;
  icon: typeof Camera;
  helper: string;
}> = [
  { id: 'capture', label: 'Capture', icon: Camera, helper: 'Camera, upload, timer' },
  { id: 'style', label: 'Style', icon: WandSparkles, helper: 'Filter, effect, scene' },
  { id: 'layout', label: 'Layout', icon: Layers3, helper: 'Grid, booth, frame' },
  { id: 'draw', label: 'Draw', icon: Paintbrush2, helper: 'Brush and erase' },
  { id: 'overlay', label: 'Overlay', icon: Type, helper: 'Text and sticker' },
  { id: 'gallery', label: 'Gallery', icon: GalleryHorizontalEnd, helper: 'Local captures' },
  { id: 'export', label: 'Export', icon: Download, helper: 'Download and copy' },
  { id: 'settings', label: 'Settings', icon: Settings2, helper: 'Theme and quality' },
];

const accentThemes: ThemePalette[] = [
  { id: 'electric', name: 'Electric', primary: '#4d7cff', secondary: '#9e52ff', tertiary: '#2cc9ff' },
  { id: 'sunset', name: 'Sunset', primary: '#ff7f50', secondary: '#ff4d96', tertiary: '#ffc857' },
  { id: 'aurora', name: 'Aurora', primary: '#2bd4a2', secondary: '#3296ff', tertiary: '#8f6dff' },
];

const filterOptions: Array<{ id: FilterId; label: string; css: string }> = [
  { id: 'none', label: 'Original', css: 'none' },
  { id: 'warm', label: 'Warm', css: 'contrast(1.04) saturate(1.15) sepia(0.18) hue-rotate(-6deg)' },
  { id: 'cool', label: 'Cool', css: 'contrast(1.02) saturate(0.95) hue-rotate(14deg) brightness(1.02)' },
  { id: 'mono', label: 'Mono', css: 'grayscale(1) contrast(1.08)' },
  { id: 'sepia', label: 'Sepia', css: 'sepia(0.78) saturate(0.9) brightness(1.02)' },
  { id: 'vintage', label: 'Vintage', css: 'sepia(0.34) contrast(0.96) saturate(0.82) brightness(1.02)' },
  { id: 'dream', label: 'Dream', css: 'brightness(1.08) contrast(0.92) saturate(1.2) blur(0.4px)' },
  { id: 'neon', label: 'Neon', css: 'contrast(1.15) saturate(1.5) hue-rotate(22deg)' },
  { id: 'cinematic', label: 'Cinematic', css: 'contrast(1.12) saturate(0.82) brightness(0.94)' },
];

const effectOptions: Array<{ id: EffectId; label: string }> = [
  { id: 'none', label: 'None' },
  { id: 'hearts', label: 'Heart Rain' },
  { id: 'sparkles', label: 'Sparkles' },
  { id: 'snow', label: 'Snow' },
  { id: 'rain', label: 'Rain' },
  { id: 'bubble', label: 'Bubble' },
  { id: 'galaxy', label: 'Galaxy' },
  { id: 'confetti', label: 'Confetti' },
  { id: 'fire', label: 'Fire Aura' },
];

const layoutOptions: Array<{ id: LayoutId; label: string }> = [
  { id: 'single', label: 'Single' },
  { id: 'grid2', label: '2 Grid' },
  { id: 'grid4', label: '4 Grid' },
  { id: 'grid9', label: '9 Grid' },
  { id: 'strip4', label: 'Photo Strip' },
  { id: 'story', label: 'Story' },
  { id: 'passport', label: 'Passport' },
  { id: 'polaroid', label: 'Polaroid' },
];

const sceneOptions: Array<{ id: SceneId; label: string }> = [
  { id: 'none', label: 'No Scene' },
  { id: 'studio', label: 'Studio Glow' },
  { id: 'sunset', label: 'Sunset' },
  { id: 'aurora', label: 'Aurora' },
  { id: 'cyber', label: 'Cyber City' },
  { id: 'ocean', label: 'Ocean' },
];

const frameOptions: Array<{ id: FrameId; label: string }> = [
  { id: 'none', label: 'No Frame' },
  { id: 'glass', label: 'Glass' },
  { id: 'neon', label: 'Neon' },
  { id: 'polaroid', label: 'Polaroid' },
  { id: 'passport', label: 'Passport' },
];

const timerOptions = [0, 3, 5, 10, 15] as const;
const boothOptions = [4, 6, 8] as const;
const burstOptions = [1, 3, 5] as const;
const stickerOptions = ['❤️', '✨', '🎉', '🌸', '🦋', '😎', '👑', '🎓', '🎄', '🎈'];

const resolutionMap: Record<ResolutionId, { label: string; width: number; height: number }> = {
  hd: { label: 'HD', width: 1280, height: 720 },
  fhd: { label: 'Full HD', width: 1920, height: 1080 },
  uhd: { label: '4K', width: 3840, height: 2160 },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '');
  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((part) => `${part}${part}`)
          .join('')
      : normalized;
  const value = Number.parseInt(expanded, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function formatDate(value: string) {
  const date = new Date(value);
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function drawRoundedRectPath(ctx: CanvasRenderingContext2D, rect: Rect) {
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.width, rect.height, rect.radius);
}

function getLayoutRects(layout: LayoutId, width: number, height: number): Rect[] {
  const padding = width * 0.04;
  const gap = width * 0.018;

  if (layout === 'story') {
    const storyWidth = Math.min(width * 0.56, height * 0.56);
    const storyHeight = storyWidth * 16 / 9;
    const scaledHeight = Math.min(storyHeight, height - padding * 2);
    const scaledWidth = scaledHeight * 9 / 16;
    return [
      {
        x: (width - scaledWidth) / 2,
        y: (height - scaledHeight) / 2,
        width: scaledWidth,
        height: scaledHeight,
        radius: 36,
      },
    ];
  }

  if (layout === 'passport') {
    const cols = 2;
    const rows = 2;
    const cellWidth = (width - padding * 2 - gap) / cols;
    const cellHeight = cellWidth * 1.25;
    const totalHeight = rows * cellHeight + gap;
    const startY = (height - totalHeight) / 2;
    return Array.from({ length: cols * rows }, (_, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      return {
        x: padding + col * (cellWidth + gap),
        y: startY + row * (cellHeight + gap),
        width: cellWidth,
        height: cellHeight,
        radius: 18,
      };
    });
  }

  if (layout === 'polaroid') {
    return [
      {
        x: padding,
        y: padding,
        width: width - padding * 2,
        height: height - padding * 2.4,
        radius: 28,
      },
    ];
  }

  if (layout === 'strip4') {
    const stripWidth = Math.min(width * 0.44, height * 0.42);
    const cellHeight = (height - padding * 2 - gap * 3) / 4;
    return Array.from({ length: 4 }, (_, index) => ({
      x: (width - stripWidth) / 2,
      y: padding + index * (cellHeight + gap),
      width: stripWidth,
      height: cellHeight,
      radius: 22,
    }));
  }

  const templates: Record<'single' | 'grid2' | 'grid4' | 'grid9', { cols: number; rows: number }> = {
    single: { cols: 1, rows: 1 },
    grid2: { cols: 2, rows: 1 },
    grid4: { cols: 2, rows: 2 },
    grid9: { cols: 3, rows: 3 },
  };

  const { cols, rows } = templates[layout as 'single' | 'grid2' | 'grid4' | 'grid9'];
  const cellWidth = (width - padding * 2 - gap * (cols - 1)) / cols;
  const cellHeight = (height - padding * 2 - gap * (rows - 1)) / rows;
  return Array.from({ length: cols * rows }, (_, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    return {
      x: padding + col * (cellWidth + gap),
      y: padding + row * (cellHeight + gap),
      width: cellWidth,
      height: cellHeight,
      radius: layout === 'single' ? 30 : 20,
    };
  });
}

function getOverlayBounds(item: OverlayItem) {
  const textLength = Math.max(item.text.length, 1);
  const width = item.size * Math.max(0.08 * textLength, 0.11);
  const height = item.size * 1.15;
  return {
    minX: item.x - width / 2,
    maxX: item.x + width / 2,
    minY: item.y - height / 2,
    maxY: item.y + height / 2,
  };
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const drawingPreviewRef = useRef<HTMLCanvasElement | null>(null);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const drawingPointerIdRef = useRef<number | null>(null);
  const dragOverlayRef = useRef<{ id: string; offsetX: number; offsetY: number; pointerId: number } | null>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const autoCaptureRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  const [activePanel, setActivePanel] = useState<SidebarId>('capture');
  const [themeMode, setThemeMode] = useState<ThemeId>('dark');
  const [accentTheme, setAccentTheme] = useState<ThemePalette>(accentThemes[0]);
  const [performanceMode, setPerformanceMode] = useState<PerformanceMode>('balanced');
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [mirrorMode, setMirrorMode] = useState(true);
  const [resolution, setResolution] = useState<ResolutionId>('hd');
  const [filterId, setFilterId] = useState<FilterId>('none');
  const [effectId, setEffectId] = useState<EffectId>('sparkles');
  const [layoutId, setLayoutId] = useState<LayoutId>('single');
  const [sceneId, setSceneId] = useState<SceneId>('studio');
  const [frameId, setFrameId] = useState<FrameId>('glass');
  const [timerSeconds, setTimerSeconds] = useState<number>(3);
  const [burstCount, setBurstCount] = useState<number>(1);
  const [boothCount, setBoothCount] = useState<number>(4);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sourceMode, setSourceMode] = useState<'camera' | 'upload' | 'empty'>('empty');
  const [uploadedName, setUploadedName] = useState<string>('');
  const [cameraError, setCameraError] = useState<string>('');
  const [streamReady, setStreamReady] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [isSequenceBusy, setIsSequenceBusy] = useState(false);
  const [autoCapture, setAutoCapture] = useState(false);
  const [showGridLines, setShowGridLines] = useState(true);
  const [effectIntensity, setEffectIntensity] = useState(0.72);
  const [drawMode, setDrawMode] = useState(true);
  const [brushColor, setBrushColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(0.016);
  const [eraseMode, setEraseMode] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [overlays, setOverlays] = useState<OverlayItem[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [textDraft, setTextDraft] = useState('VisionSnap AI');
  const [overlayColor, setOverlayColor] = useState('#ffffff');
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [boothFrames, setBoothFrames] = useState<string[]>([]);
  const [statusText, setStatusText] = useState('Mulai kamera atau upload foto untuk mulai mengedit.');

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (autoCaptureRef.current) {
        window.clearInterval(autoCaptureRef.current);
      }
    };
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(GALLERY_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as GalleryItem[];
      if (Array.isArray(parsed)) {
        setGallery(parsed.slice(0, 24));
      }
    } catch {
      // ignore malformed local storage payload
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(gallery.slice(0, 24)));
  }, [gallery]);

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Browser ini belum mendukung akses kamera via getUserMedia.');
      return;
    }

    try {
      setCameraError('');
      setStatusText('Meminta izin kamera...');
      setStreamReady(false);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const currentResolution = resolutionMap[resolution];
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: cameraFacing },
          width: { ideal: currentResolution.width },
          height: { ideal: currentResolution.height },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setSourceMode('camera');
      setStreamReady(true);
      setStatusText(`Kamera aktif (${currentResolution.label}) dalam mode lokal.`);
    } catch (error) {
      setCameraError(error instanceof Error ? error.message : 'Gagal membuka kamera.');
      setStatusText('Kamera gagal aktif. Coba izinkan akses kamera atau gunakan upload foto.');
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStreamReady(false);
    if (sourceMode === 'camera') {
      setSourceMode(imageRef.current ? 'upload' : 'empty');
    }
    setStatusText('Kamera dihentikan. Preview tetap bisa dipakai dengan gambar upload.');
  }

  useEffect(() => {
    if (sourceMode !== 'camera') {
      return;
    }
    void startCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraFacing, resolution]);

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        return;
      }
      const image = new Image();
      image.onload = () => {
        imageRef.current = image;
        setUploadedName(file.name);
        setSourceMode('upload');
        setStatusText(`Foto "${file.name}" siap diedit secara lokal.`);
      };
      image.src = result;
    };
    reader.readAsDataURL(file);
  }

  function getCachedImage(dataUrl: string) {
    const cache = imageCacheRef.current;
    const existing = cache.get(dataUrl);
    if (existing) {
      return existing.complete ? existing : null;
    }

    const image = new Image();
    image.src = dataUrl;
    cache.set(dataUrl, image);
    return null;
  }

  function drawMediaCover(
    ctx: CanvasRenderingContext2D,
    source: CanvasImageSource,
    rect: Rect,
    mirror: boolean,
  ) {
    const sourceWidth =
      source instanceof HTMLVideoElement
        ? source.videoWidth
        : source instanceof HTMLImageElement
          ? source.naturalWidth
          : 0;
    const sourceHeight =
      source instanceof HTMLVideoElement
        ? source.videoHeight
        : source instanceof HTMLImageElement
          ? source.naturalHeight
          : 0;

    if (!sourceWidth || !sourceHeight) {
      return;
    }

    const sourceRatio = sourceWidth / sourceHeight;
    const targetRatio = rect.width / rect.height;

    let drawWidth = sourceWidth;
    let drawHeight = sourceHeight;
    let sx = 0;
    let sy = 0;

    if (sourceRatio > targetRatio) {
      drawWidth = sourceHeight * targetRatio;
      sx = (sourceWidth - drawWidth) / 2;
    } else {
      drawHeight = sourceWidth / targetRatio;
      sy = (sourceHeight - drawHeight) / 2;
    }

    ctx.save();
    drawRoundedRectPath(ctx, rect);
    ctx.clip();

    if (mirror) {
      ctx.translate(rect.x + rect.width, rect.y);
      ctx.scale(-1, 1);
      ctx.drawImage(
        source,
        sx,
        sy,
        drawWidth,
        drawHeight,
        0,
        0,
        rect.width,
        rect.height,
      );
    } else {
      ctx.drawImage(
        source,
        sx,
        sy,
        drawWidth,
        drawHeight,
        rect.x,
        rect.y,
        rect.width,
        rect.height,
      );
    }

    ctx.restore();
  }

  function drawSceneOverlay(ctx: CanvasRenderingContext2D, scene: SceneId, width: number, height: number) {
    ctx.save();
    switch (scene) {
      case 'studio':
        ctx.fillStyle = 'rgba(255,255,255,0.07)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = hexToRgba(accentTheme.primary, 0.16);
        ctx.beginPath();
        ctx.arc(width * 0.22, height * 0.18, width * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = hexToRgba(accentTheme.secondary, 0.1);
        ctx.beginPath();
        ctx.arc(width * 0.78, height * 0.25, width * 0.14, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'sunset': {
        const sunset = ctx.createLinearGradient(0, 0, 0, height);
        sunset.addColorStop(0, 'rgba(255, 166, 111, 0.1)');
        sunset.addColorStop(0.55, 'rgba(255, 82, 132, 0.12)');
        sunset.addColorStop(1, 'rgba(62, 20, 42, 0.22)');
        ctx.fillStyle = sunset;
        ctx.fillRect(0, 0, width, height);
        break;
      }
      case 'aurora': {
        const aurora = ctx.createLinearGradient(0, 0, width, height);
        aurora.addColorStop(0, 'rgba(66, 255, 196, 0.12)');
        aurora.addColorStop(0.4, 'rgba(74, 129, 255, 0.12)');
        aurora.addColorStop(1, 'rgba(157, 107, 255, 0.12)');
        ctx.fillStyle = aurora;
        ctx.fillRect(0, 0, width, height);
        break;
      }
      case 'cyber': {
        ctx.fillStyle = 'rgba(8, 10, 20, 0.18)';
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = 'rgba(76, 224, 255, 0.14)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += width / 8) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        break;
      }
      case 'ocean': {
        const ocean = ctx.createRadialGradient(width * 0.5, height * 0.1, width * 0.05, width * 0.5, height * 0.9, width);
        ocean.addColorStop(0, 'rgba(103, 224, 255, 0.12)');
        ocean.addColorStop(1, 'rgba(20, 43, 88, 0.22)');
        ctx.fillStyle = ocean;
        ctx.fillRect(0, 0, width, height);
        break;
      }
      default:
        break;
    }
    ctx.restore();
  }

  function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size, size);
    ctx.beginPath();
    ctx.moveTo(0, 0.3);
    ctx.bezierCurveTo(0, -0.2, -0.5, -0.2, -0.5, 0.15);
    ctx.bezierCurveTo(-0.5, 0.45, 0, 0.72, 0, 0.98);
    ctx.bezierCurveTo(0, 0.72, 0.5, 0.45, 0.5, 0.15);
    ctx.bezierCurveTo(0.5, -0.2, 0, -0.2, 0, 0.3);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    for (let index = 0; index < 8; index += 1) {
      const angle = (Math.PI / 4) * index;
      const length = index % 2 === 0 ? radius : radius * 0.45;
      const px = Math.cos(angle) * length;
      const py = Math.sin(angle) * length;
      if (index === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  function drawEffects(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
    if (effectId === 'none') {
      return;
    }

    const densityMap: Record<PerformanceMode, number> = {
      quality: 1,
      balanced: 0.72,
      battery: 0.5,
    };
    const density = densityMap[performanceMode] * effectIntensity;
    const count = Math.round(28 * density) + 8;
    const seconds = time / 1000;

    ctx.save();

    switch (effectId) {
      case 'hearts':
        for (let index = 0; index < count; index += 1) {
          const x = ((index * 91 + seconds * 40 * (1 + (index % 3) * 0.18)) % (width + 140)) - 70;
          const y = ((index * 57 + seconds * 70) % (height + 120)) - 80;
          drawHeart(
            ctx,
            x,
            height - y,
            10 + (index % 5) * 2.2,
            `rgba(255, ${120 + index * 2}, ${180 + index}, ${0.22 + (index % 4) * 0.08})`,
          );
        }
        break;
      case 'sparkles':
        for (let index = 0; index < count + 10; index += 1) {
          const x = (index * 109) % width;
          const y = (index * 83) % height;
          const pulse = (Math.sin(seconds * 1.6 + index) + 1) / 2;
          drawStar(ctx, x, y, 3 + pulse * 7, `rgba(255,255,255,${0.14 + pulse * 0.5})`);
        }
        break;
      case 'snow':
        for (let index = 0; index < count + 16; index += 1) {
          const x = ((index * 77 + seconds * 12 * (1 + index % 4)) % (width + 50)) - 20;
          const y = ((index * 97 + seconds * 48) % (height + 80)) - 40;
          ctx.beginPath();
          ctx.fillStyle = `rgba(255,255,255,${0.22 + (index % 4) * 0.12})`;
          ctx.arc(x, y, 2 + (index % 4), 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case 'rain':
        ctx.strokeStyle = 'rgba(135, 208, 255, 0.28)';
        ctx.lineWidth = 1.6;
        for (let index = 0; index < count + 24; index += 1) {
          const x = ((index * 67 + seconds * 180) % (width + 60)) - 30;
          const y = ((index * 47 + seconds * 260) % (height + 120)) - 50;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - 10, y + 28);
          ctx.stroke();
        }
        break;
      case 'bubble':
        for (let index = 0; index < count; index += 1) {
          const radius = 8 + (index % 5) * 4;
          const x = ((index * 121 + Math.sin(seconds + index) * 40) % (width + 100)) - 40;
          const y = height - (((index * 70 + seconds * 60 * (1 + index % 3 * 0.2)) % (height + 120)) - 40);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(190,235,255,${0.18 + (index % 4) * 0.08})`;
          ctx.lineWidth = 1.4;
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      case 'galaxy':
        for (let index = 0; index < count + 18; index += 1) {
          const x = (index * 103) % width;
          const y = (index * 61) % height;
          const radius = 2 + (index % 4) * 1.6;
          const alpha = 0.18 + ((Math.sin(seconds * 1.2 + index) + 1) / 2) * 0.35;
          ctx.beginPath();
          ctx.fillStyle =
            index % 3 === 0
              ? `rgba(103, 224, 255, ${alpha})`
              : index % 3 === 1
                ? `rgba(163, 122, 255, ${alpha})`
                : `rgba(255, 255, 255, ${alpha})`;
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case 'confetti':
        for (let index = 0; index < count + 18; index += 1) {
          const x = ((index * 53 + seconds * 48) % (width + 50)) - 20;
          const y = ((index * 89 + seconds * 88) % (height + 120)) - 50;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(seconds + index);
          ctx.fillStyle =
            index % 4 === 0
              ? 'rgba(255,91,151,0.68)'
              : index % 4 === 1
                ? 'rgba(90,220,255,0.68)'
                : index % 4 === 2
                  ? 'rgba(255,212,77,0.68)'
                  : 'rgba(152,110,255,0.68)';
          ctx.fillRect(-4, -2, 8, 4);
          ctx.restore();
        }
        break;
      case 'fire':
        for (let index = 0; index < count + 10; index += 1) {
          const x = ((index * 93 + Math.sin(seconds * 1.6 + index) * 40) % (width + 60)) - 20;
          const y = height - (((index * 42 + seconds * 110 * (1 + index % 3 * 0.15)) % (height + 90)) - 30);
          const radius = 12 + (index % 5) * 5;
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
          gradient.addColorStop(0, 'rgba(255, 234, 145, 0.34)');
          gradient.addColorStop(0.45, 'rgba(255, 123, 76, 0.22)');
          gradient.addColorStop(1, 'rgba(255, 66, 38, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      default:
        break;
    }

    ctx.restore();
  }

  function drawFrameDecorations(ctx: CanvasRenderingContext2D, width: number, height: number, layout: LayoutId) {
    const padding = width * 0.03;
    ctx.save();

    if (frameId === 'glass') {
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.lineWidth = 2;
      ctx.strokeRect(padding, padding, width - padding * 2, height - padding * 2);
    }

    if (frameId === 'neon') {
      ctx.strokeStyle = hexToRgba(accentTheme.primary, 0.86);
      ctx.shadowColor = hexToRgba(accentTheme.secondary, 0.75);
      ctx.shadowBlur = 24;
      ctx.lineWidth = 4;
      ctx.strokeRect(padding, padding, width - padding * 2, height - padding * 2);
    }

    if (frameId === 'polaroid' || layout === 'polaroid') {
      ctx.fillStyle = 'rgba(250,250,252,0.96)';
      ctx.fillRect(padding * 0.8, padding * 0.8, width - padding * 1.6, height - padding * 1.6);
      ctx.fillStyle = 'rgba(10,10,14,0.9)';
      ctx.font = `${Math.max(16, width * 0.026)}px "Sora", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('VisionSnap AI', width / 2, height - padding * 1.2);
    }

    if (frameId === 'passport' || layout === 'passport') {
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.setLineDash([10, 8]);
      ctx.lineWidth = 2;
      ctx.strokeRect(padding * 0.8, padding * 0.8, width - padding * 1.6, height - padding * 1.6);
    }

    ctx.restore();
  }

  function drawGridGuides(ctx: CanvasRenderingContext2D, width: number, height: number) {
    if (!showGridLines) {
      return;
    }

    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (let column = 1; column < 3; column += 1) {
      const x = (width / 3) * column;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let row = 1; row < 3; row += 1) {
      const y = (height / 3) * row;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawStrokeLayer(width: number, height: number) {
    if (!drawingPreviewRef.current) {
      drawingPreviewRef.current = document.createElement('canvas');
    }

    const drawCanvas = drawingPreviewRef.current;
    if (drawCanvas.width !== width || drawCanvas.height !== height) {
      drawCanvas.width = width;
      drawCanvas.height = height;
    }

    const drawCtx = drawCanvas.getContext('2d');
    if (!drawCtx) {
      return null;
    }

    drawCtx.clearRect(0, 0, width, height);

    const allStrokes = currentStrokeRef.current ? [...strokes, currentStrokeRef.current] : strokes;

    for (const stroke of allStrokes) {
      if (!stroke.points.length) {
        continue;
      }

      drawCtx.save();
      drawCtx.globalCompositeOperation = stroke.erase ? 'destination-out' : 'source-over';
      drawCtx.strokeStyle = stroke.color;
      drawCtx.lineWidth = stroke.size * Math.min(width, height);
      drawCtx.lineCap = 'round';
      drawCtx.lineJoin = 'round';
      drawCtx.beginPath();
      stroke.points.forEach((point, index) => {
        const px = point.x * width;
        const py = point.y * height;
        if (index === 0) {
          drawCtx.moveTo(px, py);
        } else {
          drawCtx.lineTo(px, py);
        }
      });
      drawCtx.stroke();
      drawCtx.restore();
    }

    return drawCanvas;
  }

  function getActiveSource() {
    if (sourceMode === 'camera' && videoRef.current && streamReady && videoRef.current.readyState >= 2) {
      return videoRef.current;
    }
    if (sourceMode === 'upload' && imageRef.current) {
      return imageRef.current;
    }
    return null;
  }

  function renderComposite(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
    ctx.clearRect(0, 0, width, height);

    const background = ctx.createLinearGradient(0, 0, width, height);
    if (themeMode === 'dark') {
      background.addColorStop(0, '#080b15');
      background.addColorStop(0.55, '#0c1225');
      background.addColorStop(1, '#04060d');
    } else {
      background.addColorStop(0, '#eef4ff');
      background.addColorStop(0.55, '#e6ecff');
      background.addColorStop(1, '#d9e6ff');
    }
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    drawSceneOverlay(ctx, sceneId, width, height);

    const source = getActiveSource();
    const rects = getLayoutRects(layoutId, width, height);
    const gallerySources = boothFrames.length
      ? boothFrames
      : gallery.slice(0, Math.max(rects.length, 1)).map((item) => item.dataUrl);

    rects.forEach((rect, index) => {
      ctx.save();
      ctx.filter = filterOptions.find((item) => item.id === filterId)?.css ?? 'none';

      const galleryImage = gallerySources[index] ? getCachedImage(gallerySources[index]) : null;

      if (galleryImage) {
        drawMediaCover(ctx, galleryImage, rect, false);
      } else if (source) {
        drawMediaCover(ctx, source, rect, mirrorMode && sourceMode === 'camera');
      } else {
        drawRoundedRectPath(ctx, rect);
        ctx.fillStyle = themeMode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(17, 24, 39, 0.08)';
        ctx.fill();
        ctx.fillStyle = themeMode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(17,24,39,0.55)';
        ctx.font = `${Math.max(15, width * 0.026)}px "Manrope", sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('Start camera or upload a photo', rect.x + rect.width / 2, rect.y + rect.height / 2);
      }

      ctx.restore();
    });

    drawEffects(ctx, width, height, time);
    drawGridGuides(ctx, width, height);

    const drawingLayer = drawStrokeLayer(width, height);
    if (drawingLayer) {
      ctx.drawImage(drawingLayer, 0, 0);
    }

    overlays.forEach((overlay) => {
      ctx.save();
      ctx.translate(overlay.x * width, overlay.y * height);
      ctx.rotate(overlay.rotation);
      ctx.fillStyle = overlay.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
      ctx.shadowBlur = 18;
      ctx.font = `${overlay.size * height}px "Manrope", sans-serif`;
      ctx.fillText(overlay.text, 0, 0);
      if (selectedOverlayId === overlay.id) {
        const bounds = getOverlayBounds(overlay);
        ctx.strokeStyle = hexToRgba(accentTheme.tertiary, 0.85);
        ctx.lineWidth = 2;
        ctx.strokeRect(
          (bounds.minX - overlay.x) * width,
          (bounds.minY - overlay.y) * height,
          (bounds.maxX - bounds.minX) * width,
          (bounds.maxY - bounds.minY) * height,
        );
      }
      ctx.restore();
    });

    drawFrameDecorations(ctx, width, height, layoutId);

    ctx.save();
    ctx.fillStyle = themeMode === 'dark' ? 'rgba(255,255,255,0.76)' : 'rgba(17,24,39,0.78)';
    ctx.font = `${Math.max(12, width * 0.015)}px "Manrope", sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(
      `${sourceMode === 'camera' ? 'LIVE CAMERA' : sourceMode === 'upload' ? 'LOCAL PHOTO' : 'READY'} · ${resolutionMap[resolution].label} · ${filterOptions.find((item) => item.id === filterId)?.label}`,
      width * 0.04,
      height - width * 0.025,
    );
    ctx.restore();
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const renderFrame = (time: number) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, performanceMode === 'quality' ? 2 : 1.5);
      const width = Math.max(720, Math.round(rect.width * dpr));
      const height = Math.max(480, Math.round(rect.height * dpr));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      renderComposite(ctx, width, height, time);
      rafRef.current = requestAnimationFrame(renderFrame);
    };

    rafRef.current = requestAnimationFrame(renderFrame);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [
    accentTheme,
    boothFrames,
    effectId,
    effectIntensity,
    filterId,
    frameId,
    gallery,
    layoutId,
    mirrorMode,
    overlays,
    performanceMode,
    resolution,
    sceneId,
    selectedOverlayId,
    showGridLines,
    sourceMode,
    streamReady,
    strokes,
    themeMode,
  ]);

  function addToGallery(dataUrl: string, label: string) {
    const item: GalleryItem = {
      id: uid('capture'),
      dataUrl,
      createdAt: new Date().toISOString(),
      label,
    };
    setGallery((current) => [item, ...current].slice(0, 24));
  }

  function triggerFlash() {
    setFlashActive(true);
    window.setTimeout(() => {
      if (isMountedRef.current) {
        setFlashActive(false);
      }
    }, 180);
  }

  function getDataUrl(format: ExportFormat, quality = 0.94) {
    const canvas = canvasRef.current;
    if (!canvas) {
      return '';
    }

    const mimeType =
      format === 'png' ? 'image/png' : format === 'jpeg' ? 'image/jpeg' : 'image/webp';
    return canvas.toDataURL(mimeType, quality);
  }

  async function runCountdown() {
    if (!timerSeconds) {
      return;
    }
    for (let second = timerSeconds; second > 0; second -= 1) {
      setCountdown(second);
      await wait(1000);
    }
    setCountdown(null);
  }

  async function captureSeries(totalShots: number, spacingMs: number, label: string) {
    if (isSequenceBusy) {
      return;
    }

    setIsSequenceBusy(true);
    setStatusText(totalShots > 1 ? `Mengambil ${totalShots} frame...` : 'Mengambil foto...');
    await runCountdown();
    const captures: string[] = [];

    for (let shot = 0; shot < totalShots; shot += 1) {
      triggerFlash();
      await wait(80);
      const dataUrl = getDataUrl('png');
      if (dataUrl) {
        captures.push(dataUrl);
        addToGallery(dataUrl, totalShots > 1 ? `${label} ${shot + 1}` : label);
      }
      if (shot < totalShots - 1) {
        await wait(spacingMs);
      }
    }

    if (totalShots > 1) {
      setBoothFrames(captures);
      setLayoutId(totalShots >= 4 ? 'strip4' : 'grid2');
    }

    setIsSequenceBusy(false);
    setStatusText(totalShots > 1 ? `${totalShots} capture selesai disimpan lokal.` : 'Capture berhasil disimpan ke gallery lokal.');
  }

  function captureSingle() {
    void captureSeries(burstCount, 420, burstCount > 1 ? 'Burst' : 'Photo');
  }

  function captureBooth() {
    void captureSeries(boothCount, 900, 'Booth');
  }

  useEffect(() => {
    if (!autoCapture) {
      if (autoCaptureRef.current) {
        window.clearInterval(autoCaptureRef.current);
        autoCaptureRef.current = null;
      }
      return;
    }

    autoCaptureRef.current = window.setInterval(() => {
      if (!isSequenceBusy && (sourceMode === 'camera' || sourceMode === 'upload')) {
        void captureSeries(1, 0, 'Auto');
      }
    }, 8000);

    return () => {
      if (autoCaptureRef.current) {
        window.clearInterval(autoCaptureRef.current);
        autoCaptureRef.current = null;
      }
    };
  }, [autoCapture, isSequenceBusy, sourceMode]);

  async function downloadCurrent(format: ExportFormat) {
    const dataUrl = getDataUrl(format);
    if (!dataUrl) {
      return;
    }
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `visionsnap-${Date.now()}.${format === 'jpeg' ? 'jpg' : format}`;
    link.click();
    setStatusText(`Preview berhasil diunduh sebagai ${format.toUpperCase()}.`);
  }

  async function copyCurrentToClipboard() {
    const canvas = canvasRef.current;
    if (!canvas || !navigator.clipboard || !('ClipboardItem' in window)) {
      setStatusText('Clipboard image belum didukung browser ini.');
      return;
    }

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((value) => resolve(value), 'image/png'));
    if (!blob) {
      setStatusText('Gagal membuat blob untuk clipboard.');
      return;
    }

    const ClipboardItemCtor = window.ClipboardItem as unknown as {
      new (items: Record<string, Blob>): ClipboardItem;
    };
    await navigator.clipboard.write([new ClipboardItemCtor({ 'image/png': blob })]);
    setStatusText('Hasil preview berhasil disalin ke clipboard.');
  }

  async function shareCurrent() {
    const dataUrl = getDataUrl('png');
    if (!dataUrl) {
      return;
    }
    if (!navigator.share) {
      setStatusText('Share API belum tersedia. Gunakan Download atau Copy.');
      return;
    }
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], 'visionsnap.png', { type: 'image/png' });
    await navigator.share({ files: [file], title: 'VisionSnap AI', text: 'Captured locally with VisionSnap AI' });
  }

  function clearCanvasEdits() {
    setStrokes([]);
    currentStrokeRef.current = null;
    setOverlays([]);
    setSelectedOverlayId(null);
    setStatusText('Drawing dan overlay dibersihkan.');
  }

  function addTextOverlay() {
    const text = textDraft.trim();
    if (!text) {
      return;
    }
    const overlay: OverlayItem = {
      id: uid('overlay'),
      label: 'Text',
      text,
      x: 0.5,
      y: 0.18 + overlays.length * 0.08,
      size: 0.075,
      color: overlayColor,
      rotation: 0,
    };
    setOverlays((current) => [...current, overlay]);
    setSelectedOverlayId(overlay.id);
    setStatusText(`Text overlay "${text}" ditambahkan.`);
  }

  function addStickerOverlay(sticker: string) {
    const overlay: OverlayItem = {
      id: uid('overlay'),
      label: 'Sticker',
      text: sticker,
      x: 0.5,
      y: 0.5,
      size: 0.11,
      color: '#ffffff',
      rotation: 0,
    };
    setOverlays((current) => [...current, overlay]);
    setSelectedOverlayId(overlay.id);
    setStatusText(`Sticker ${sticker} ditambahkan ke canvas.`);
  }

  function removeSelectedOverlay() {
    if (!selectedOverlayId) {
      return;
    }
    setOverlays((current) => current.filter((item) => item.id !== selectedOverlayId));
    setSelectedOverlayId(null);
    setStatusText('Overlay terpilih dihapus.');
  }

  function updateSelectedOverlay(
    updates: Partial<Pick<OverlayItem, 'size' | 'rotation' | 'color'>>,
  ) {
    if (!selectedOverlayId) {
      return;
    }

    setOverlays((current) =>
      current.map((item) => (item.id === selectedOverlayId ? { ...item, ...updates } : item)),
    );
  }

  function getRelativePoint(event: ReactPointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: clamp((event.clientX - rect.left) / rect.width, 0, 1),
      y: clamp((event.clientY - rect.top) / rect.height, 0, 1),
    };
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    const point = getRelativePoint(event);

    if (drawMode) {
      const stroke: Stroke = {
        id: uid('stroke'),
        points: [point],
        color: brushColor,
        size: brushSize,
        erase: eraseMode,
      };
      currentStrokeRef.current = stroke;
      drawingPointerIdRef.current = event.pointerId;
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }

    const hit = [...overlays].reverse().find((item) => {
      const bounds = getOverlayBounds(item);
      return point.x >= bounds.minX && point.x <= bounds.maxX && point.y >= bounds.minY && point.y <= bounds.maxY;
    });

    if (hit) {
      setSelectedOverlayId(hit.id);
      dragOverlayRef.current = {
        id: hit.id,
        offsetX: point.x - hit.x,
        offsetY: point.y - hit.y,
        pointerId: event.pointerId,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    } else {
      setSelectedOverlayId(null);
    }
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    const point = getRelativePoint(event);

    if (drawMode && drawingPointerIdRef.current === event.pointerId && currentStrokeRef.current) {
      currentStrokeRef.current.points.push(point);
      return;
    }

    if (!drawMode && dragOverlayRef.current?.pointerId === event.pointerId) {
      setOverlays((current) =>
        current.map((item) =>
          item.id === dragOverlayRef.current?.id
            ? {
                ...item,
                x: clamp(point.x - dragOverlayRef.current.offsetX, 0.08, 0.92),
                y: clamp(point.y - dragOverlayRef.current.offsetY, 0.08, 0.92),
              }
            : item,
        ),
      );
    }
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (drawMode && drawingPointerIdRef.current === event.pointerId && currentStrokeRef.current) {
      setStrokes((current) => [...current, currentStrokeRef.current!]);
      currentStrokeRef.current = null;
      drawingPointerIdRef.current = null;
      return;
    }
    if (!drawMode && dragOverlayRef.current?.pointerId === event.pointerId) {
      dragOverlayRef.current = null;
    }
  }

  function selectedOverlay() {
    return overlays.find((item) => item.id === selectedOverlayId) ?? null;
  }

  const activeOverlay = selectedOverlay();

  const themeStyle = {
    '--accent': accentTheme.primary,
    '--accent-2': accentTheme.secondary,
    '--accent-3': accentTheme.tertiary,
  } as CSSProperties;

  return (
    <div
      data-theme={themeMode}
      style={themeStyle}
      className="app-shell"
    >
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
      />

      <div className="ambient-orb ambient-orb--one" />
      <div className="ambient-orb ambient-orb--two" />
      <div className="ambient-grid" />

      <header className="topbar">
        <div className="brand">
          <span className="brand__logo">
            <Camera className="h-4 w-4" />
          </span>
          <div>
            <div className="brand__title">VisionSnap AI</div>
            <div className="brand__meta">Studio lokal untuk kamera, photo booth, dan editing cepat</div>
          </div>
        </div>

        <div className="topbar__actions">
          <button
            type="button"
            className="pill-button"
            onClick={() => setThemeMode((current) => (current === 'dark' ? 'light' : 'dark'))}
          >
            <MoonStar className="h-4 w-4" />
            {themeMode === 'dark' ? 'Light' : 'Dark'}
          </button>
          {accentThemes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={cn('swatch', accentTheme.id === theme.id && 'swatch--active')}
              style={{ '--swatch': theme.primary } as CSSProperties}
              onClick={() => setAccentTheme(theme)}
              aria-label={theme.name}
            />
          ))}
        </div>
      </header>

      <main className="workspace">
        <aside className="sidebar glass-panel">
          <div className="sidebar__section">
            <div className="eyebrow">Workspace</div>
            <div className="sidebar__heading">Semua panel di kiri sekarang bisa dipakai.</div>
          </div>

          <div className="sidebar__nav">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={cn('sidebar__item', activePanel === item.id && 'sidebar__item--active')}
                  onClick={() => setActivePanel(item.id)}
                >
                  <span className="sidebar__icon">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="sidebar__label">{item.label}</span>
                    <span className="sidebar__helper">{item.helper}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="sidebar__section sidebar__section--compact">
            <div className="mini-stat">
              <span>Source</span>
              <strong>{sourceMode === 'camera' ? 'Live camera' : sourceMode === 'upload' ? 'Upload photo' : 'Idle'}</strong>
            </div>
            <div className="mini-stat">
              <span>Stored locally</span>
              <strong>{gallery.length} captures</strong>
            </div>
            <div className="mini-stat">
              <span>Editing mode</span>
              <strong>{drawMode ? 'Draw' : 'Move overlays'}</strong>
            </div>
          </div>
        </aside>

        <section className="stage">
          <div className="stage__preview glass-panel">
            <div className="stage__header">
              <div>
                <div className="eyebrow">Live Preview</div>
                <h1 className="stage__title">Studio interaktif, bukan landing page</h1>
                <p className="stage__text">
                  Kamera, upload, filter, layout, drawing, sticker, export, dan gallery berjalan
                  langsung di browser tanpa upload ke server.
                </p>
              </div>

              <div className="stage__quick-actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setActivePanel('capture');
                    void startCamera();
                  }}
                >
                  <Camera className="h-4 w-4" />
                  Start Camera
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => uploadInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Upload Photo
                </button>
              </div>
            </div>

            <div className="canvas-shell">
              <canvas
                ref={canvasRef}
                className={cn('preview-canvas-live', drawMode && 'preview-canvas-live--drawing')}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              />
              {flashActive ? <div className="flash-layer" /> : null}
              {countdown ? <div className="countdown-layer">{countdown}</div> : null}
              <div className="preview-badge preview-badge--left">
                {sourceMode === 'camera' ? 'LIVE CAMERA' : sourceMode === 'upload' ? uploadedName || 'LOCAL PHOTO' : 'READY'}
              </div>
              <div className="preview-badge preview-badge--right">{resolutionMap[resolution].label}</div>
            </div>

            <div className="status-bar">
              <div className="status-pill">
                <Zap className="h-4 w-4" />
                {statusText}
              </div>
              {cameraError ? <div className="status-pill status-pill--warn">{cameraError}</div> : null}
            </div>
          </div>

          <div className="stage__controls">
            <section className="control-panel glass-panel">
              {activePanel === 'capture' ? (
                <>
                  <PanelHeader
                    icon={Camera}
                    title="Capture"
                    description="Akses kamera, upload foto, timer, burst, dan photo booth sequence."
                  />

                  <div className="button-row">
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => void startCamera()}
                    >
                      <Camera className="h-4 w-4" />
                      Start Camera
                    </button>
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={stopCamera}
                    >
                      Stop
                    </button>
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => uploadInputRef.current?.click()}
                    >
                      <ImagePlus className="h-4 w-4" />
                      Upload
                    </button>
                  </div>

                  <SectionLabel title="Camera options" />
                  <div className="button-row">
                    <button
                      type="button"
                      className={cn('chip', cameraFacing === 'user' && 'chip--active')}
                      onClick={() => setCameraFacing('user')}
                    >
                      Front
                    </button>
                    <button
                      type="button"
                      className={cn('chip', cameraFacing === 'environment' && 'chip--active')}
                      onClick={() => setCameraFacing('environment')}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className={cn('chip', mirrorMode && 'chip--active')}
                      onClick={() => setMirrorMode((current) => !current)}
                    >
                      <FlipHorizontal2 className="h-4 w-4" />
                      Mirror
                    </button>
                  </div>

                  <SectionLabel title="Resolution" />
                  <div className="segmented-grid">
                    {Object.entries(resolutionMap).map(([id, value]) => (
                      <button
                        key={id}
                        type="button"
                        className={cn('segment', resolution === id && 'segment--active')}
                        onClick={() => setResolution(id as ResolutionId)}
                      >
                        {value.label}
                      </button>
                    ))}
                  </div>

                  <SectionLabel title="Timer" />
                  <div className="segmented-grid">
                    {timerOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={cn('segment', timerSeconds === option && 'segment--active')}
                        onClick={() => setTimerSeconds(option)}
                      >
                        {option === 0 ? 'Instant' : `${option}s`}
                      </button>
                    ))}
                  </div>

                  <SectionLabel title="Burst shots" />
                  <div className="segmented-grid">
                    {burstOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={cn('segment', burstCount === option && 'segment--active')}
                        onClick={() => setBurstCount(option)}
                      >
                        {option} shot
                      </button>
                    ))}
                  </div>

                  <SectionLabel title="Photo booth" />
                  <div className="segmented-grid">
                    {boothOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={cn('segment', boothCount === option && 'segment--active')}
                        onClick={() => setBoothCount(option)}
                      >
                        {option} photos
                      </button>
                    ))}
                  </div>

                  <div className="button-row">
                    <button
                      type="button"
                      className="primary-button"
                      onClick={captureSingle}
                      disabled={isSequenceBusy}
                    >
                      <TimerReset className="h-4 w-4" />
                      Capture
                    </button>
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={captureBooth}
                      disabled={isSequenceBusy}
                    >
                      <Sparkles className="h-4 w-4" />
                      Photo Booth
                    </button>
                    <button
                      type="button"
                      className={cn('ghost-button', autoCapture && 'ghost-button--active')}
                      onClick={() => setAutoCapture((current) => !current)}
                    >
                      Auto 8s
                    </button>
                  </div>
                </>
              ) : null}

              {activePanel === 'style' ? (
                <>
                  <PanelHeader
                    icon={WandSparkles}
                    title="Style"
                    description="Filter, particle effect, scene overlay, dan frame semuanya memengaruhi preview canvas."
                  />

                  <SectionLabel title="Filters" />
                  <div className="choice-grid">
                    {filterOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={cn('choice-card', filterId === option.id && 'choice-card--active')}
                        onClick={() => setFilterId(option.id)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  <SectionLabel title="Effects" />
                  <div className="choice-grid">
                    {effectOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={cn('choice-card', effectId === option.id && 'choice-card--active')}
                        onClick={() => setEffectId(option.id)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  <SliderField
                    label="Effect intensity"
                    value={effectIntensity}
                    min={0.25}
                    max={1}
                    step={0.01}
                    onChange={(value) => setEffectIntensity(value)}
                  />

                  <SectionLabel title="Scene overlays" />
                  <div className="choice-grid">
                    {sceneOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={cn('choice-card', sceneId === option.id && 'choice-card--active')}
                        onClick={() => setSceneId(option.id)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  <SectionLabel title="Frame" />
                  <div className="choice-grid">
                    {frameOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={cn('choice-card', frameId === option.id && 'choice-card--active')}
                        onClick={() => setFrameId(option.id)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}

              {activePanel === 'layout' ? (
                <>
                  <PanelHeader
                    icon={Layers3}
                    title="Layout"
                    description="Pilih grid, strip, story, passport, atau polaroid. Sequence booth akan otomatis mengisi strip."
                  />

                  <SectionLabel title="Canvas layout" />
                  <div className="choice-grid">
                    {layoutOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={cn('choice-card', layoutId === option.id && 'choice-card--active')}
                        onClick={() => setLayoutId(option.id)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  <div className="toggle-row">
                    <button
                      type="button"
                      className={cn('ghost-button', showGridLines && 'ghost-button--active')}
                      onClick={() => setShowGridLines((current) => !current)}
                    >
                      Grid guides
                    </button>
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => setBoothFrames([])}
                    >
                      Reset booth frames
                    </button>
                  </div>

                  <div className="info-card">
                    <strong>Tip</strong>
                    <p>
                      Ambil `Photo Booth` dulu untuk mengisi strip dengan frame berbeda. Kalau belum ada, layout tetap tampil memakai frame aktif.
                    </p>
                  </div>
                </>
              ) : null}

              {activePanel === 'draw' ? (
                <>
                  <PanelHeader
                    icon={Paintbrush2}
                    title="Draw"
                    description="Draw mode menggambar langsung di atas preview. Matikan draw mode untuk memindahkan text/sticker."
                  />

                  <div className="toggle-row">
                    <button
                      type="button"
                      className={cn('ghost-button', drawMode && 'ghost-button--active')}
                      onClick={() => setDrawMode(true)}
                    >
                      Draw mode
                    </button>
                    <button
                      type="button"
                      className={cn('ghost-button', !drawMode && 'ghost-button--active')}
                      onClick={() => setDrawMode(false)}
                    >
                      Move overlay
                    </button>
                    <button
                      type="button"
                      className={cn('ghost-button', eraseMode && 'ghost-button--active')}
                      onClick={() => setEraseMode((current) => !current)}
                    >
                      <Eraser className="h-4 w-4" />
                      Eraser
                    </button>
                  </div>

                  <ColorField
                    label="Brush color"
                    value={brushColor}
                    onChange={setBrushColor}
                  />
                  <SliderField
                    label="Brush size"
                    value={brushSize}
                    min={0.004}
                    max={0.04}
                    step={0.001}
                    onChange={setBrushSize}
                  />

                  <div className="button-row">
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => setStrokes((current) => current.slice(0, -1))}
                    >
                      Undo stroke
                    </button>
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => setStrokes([])}
                    >
                      Clear drawing
                    </button>
                  </div>
                </>
              ) : null}

              {activePanel === 'overlay' ? (
                <>
                  <PanelHeader
                    icon={Type}
                    title="Overlay"
                    description="Tambahkan text atau sticker, lalu pindahkan posisinya dengan mode `Move overlay`."
                  />

                  <label className="field">
                    <span>Text overlay</span>
                    <input
                      value={textDraft}
                      onChange={(event) => setTextDraft(event.target.value)}
                      className="text-input"
                      placeholder="Tulis sesuatu..."
                    />
                  </label>

                  <ColorField
                    label="Text color"
                    value={overlayColor}
                    onChange={setOverlayColor}
                  />

                  <div className="button-row">
                    <button
                      type="button"
                      className="primary-button"
                      onClick={addTextOverlay}
                    >
                      <Type className="h-4 w-4" />
                      Add text
                    </button>
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={removeSelectedOverlay}
                      disabled={!selectedOverlayId}
                    >
                      Remove selected
                    </button>
                  </div>

                  <SectionLabel title="Stickers" />
                  <div className="sticker-grid">
                    {stickerOptions.map((sticker) => (
                      <button
                        key={sticker}
                        type="button"
                        className="sticker-chip"
                        onClick={() => addStickerOverlay(sticker)}
                      >
                        {sticker}
                      </button>
                    ))}
                  </div>

                  {activeOverlay ? (
                    <>
                      <SectionLabel title={`Selected overlay: ${activeOverlay.label}`} />
                      <SliderField
                        label="Size"
                        value={activeOverlay.size}
                        min={0.04}
                        max={0.18}
                        step={0.002}
                        onChange={(value) => updateSelectedOverlay({ size: value })}
                      />
                      <SliderField
                        label="Rotation"
                        value={activeOverlay.rotation}
                        min={-1.5}
                        max={1.5}
                        step={0.01}
                        onChange={(value) => updateSelectedOverlay({ rotation: value })}
                      />
                      <ColorField
                        label="Overlay color"
                        value={activeOverlay.color}
                        onChange={(value) => updateSelectedOverlay({ color: value })}
                      />
                    </>
                  ) : (
                    <div className="info-card">
                      <strong>Tip</strong>
                      <p>Pilih salah satu overlay di canvas saat mode `Move overlay` untuk mengubah ukuran dan rotasinya.</p>
                    </div>
                  )}
                </>
              ) : null}

              {activePanel === 'gallery' ? (
                <>
                  <PanelHeader
                    icon={Images}
                    title="Gallery"
                    description="Semua capture disimpan lokal di browser. Klik thumbnail untuk memuatnya kembali ke preview."
                  />

                  {gallery.length ? (
                    <div className="gallery-grid">
                      {gallery.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="gallery-card"
                          onClick={() => {
                            const image = new Image();
                            image.onload = () => {
                              imageRef.current = image;
                              setSourceMode('upload');
                              setUploadedName(item.label);
                              setStatusText(`Gallery item "${item.label}" dimuat kembali ke preview.`);
                            };
                            image.src = item.dataUrl;
                          }}
                        >
                          <img
                            src={item.dataUrl}
                            alt={item.label}
                          />
                          <span>{item.label}</span>
                          <small>{formatDate(item.createdAt)}</small>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      Belum ada capture. Ambil foto dulu lalu hasilnya akan muncul di sini.
                    </div>
                  )}

                  <div className="button-row">
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => {
                        setGallery([]);
                        setBoothFrames([]);
                      }}
                    >
                      Clear gallery
                    </button>
                  </div>
                </>
              ) : null}

              {activePanel === 'export' ? (
                <>
                  <PanelHeader
                    icon={Download}
                    title="Export"
                    description="Unduh PNG, JPG, WEBP, salin ke clipboard, atau share jika browser mendukung."
                  />

                  <div className="button-grid">
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => void downloadCurrent('png')}
                    >
                      <Download className="h-4 w-4" />
                      PNG
                    </button>
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => void downloadCurrent('jpeg')}
                    >
                      JPG
                    </button>
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => void downloadCurrent('webp')}
                    >
                      WEBP
                    </button>
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => void copyCurrentToClipboard()}
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </button>
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => void shareCurrent()}
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </button>
                  </div>

                  <div className="info-card">
                    <strong>Export note</strong>
                    <p>
                      Hasil export diambil dari canvas yang sedang aktif, jadi filter, effect, layout, drawing,
                      dan overlay semuanya ikut masuk ke file akhir.
                    </p>
                  </div>
                </>
              ) : null}

              {activePanel === 'settings' ? (
                <>
                  <PanelHeader
                    icon={Settings2}
                    title="Settings"
                    description="Performa render, mode tema, dan reset state editor."
                  />

                  <SectionLabel title="Theme" />
                  <div className="button-row">
                    <button
                      type="button"
                      className={cn('chip', themeMode === 'dark' && 'chip--active')}
                      onClick={() => setThemeMode('dark')}
                    >
                      Dark
                    </button>
                    <button
                      type="button"
                      className={cn('chip', themeMode === 'light' && 'chip--active')}
                      onClick={() => setThemeMode('light')}
                    >
                      Light
                    </button>
                  </div>

                  <SectionLabel title="Render quality" />
                  <div className="segmented-grid">
                    {(['quality', 'balanced', 'battery'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        className={cn('segment', performanceMode === mode && 'segment--active')}
                        onClick={() => setPerformanceMode(mode)}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>

                  <div className="button-row">
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={clearCanvasEdits}
                    >
                      <RefreshCcw className="h-4 w-4" />
                      Clear overlays + drawing
                    </button>
                  </div>

                  <div className="info-card">
                    <strong>Yang sekarang benar-benar aktif</strong>
                    <p>
                      Camera access, upload, timer, burst, photo booth strip, filters, animated effects, layouts,
                      drawing, text, stickers, export, clipboard, dan local gallery.
                    </p>
                  </div>
                </>
              ) : null}
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}

type PanelHeaderProps = {
  icon: typeof Camera;
  title: string;
  description: string;
};

function PanelHeader({ icon: Icon, title, description }: PanelHeaderProps) {
  return (
    <div className="panel-header">
      <span className="panel-header__icon">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function SectionLabel({ title }: { title: string }) {
  return <div className="section-label">{title}</div>;
}

type SliderFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
};

function SliderField({ label, value, min, max, step, onChange }: SliderFieldProps) {
  return (
    <label className="field">
      <span>
        {label}
        <strong>{value.toFixed(step < 0.01 ? 3 : 2)}</strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

type ColorFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function ColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="color-input">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <code>{value}</code>
      </div>
    </label>
  );
}

export default App;
