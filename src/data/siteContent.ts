export const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'camera', label: 'Camera' },
  { id: 'photo-booth', label: 'Photo Booth' },
  { id: 'effects', label: 'Effects' },
  { id: 'filters', label: 'Filters' },
  { id: 'ai-effects', label: 'AI Effects' },
  { id: 'background', label: 'Background' },
  { id: 'face', label: 'Face' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'frames', label: 'Frames' },
  { id: 'grid', label: 'Grid' },
  { id: 'drawing', label: 'Drawing' },
  { id: 'export', label: 'Export' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'settings', label: 'Settings' },
] as const;

export type PanelId = (typeof sidebarItems)[number]['id'];

type WorkspacePanel = {
  eyebrow: string;
  title: string;
  description: string;
  metrics: Array<{ label: string; value: string }>;
  controls: string[];
  highlights: string[];
};

export const workspacePanels: Record<PanelId, WorkspacePanel> = {
  dashboard: {
    eyebrow: 'Mission Control',
    title: 'A studio dashboard designed for instant momentum.',
    description:
      'Jump from live capture to AI retouching, export queues, and layout presets without leaving the same workspace.',
    metrics: [
      { label: 'Live packs', value: '240+' },
      { label: 'Cloud upload', value: '0 ms' },
    ],
    controls: ['Gallery timeline', 'Preset scenes', 'Fast actions', 'Local cache'],
    highlights: [
      'One surface for camera, effects, booth, and export.',
      'Floating cards keep the UI lively without sacrificing readability.',
      'Ready for creators, events, classrooms, and retail activations.',
    ],
  },
  camera: {
    eyebrow: 'Live Capture',
    title: 'Camera controls that feel native, not bolted on.',
    description:
      'Switch front/back lenses, mirror the feed, and jump from HD to Full HD or 4K when the browser and device support it.',
    metrics: [
      { label: 'Capture modes', value: '8' },
      { label: 'Countdown presets', value: '3 · 5 · 10 · 15s' },
    ],
    controls: [
      'Front / Back',
      'Mirror Mode',
      'Flash Effect',
      'Burst Mode',
      'Auto Capture',
      'Smile Capture',
      'Gesture Capture',
    ],
    highlights: [
      'Motion-rich countdown and flash animation for a photobooth feel.',
      'Built to handle solo selfies, group shots, and creator workflows.',
      'Keeps the camera pipeline local for privacy-first capture.',
    ],
  },
  'photo-booth': {
    eyebrow: 'Booth Engine',
    title: 'Automatic strips, frames, and event-ready keepsakes.',
    description:
      'Compose 4, 6, or 8 automatic captures, then brand them with borders, stickers, timestamps, and QR codes.',
    metrics: [
      { label: 'Auto shot sets', value: '4 / 6 / 8' },
      { label: 'Booth styling', value: 'Frames + stamps' },
    ],
    controls: [
      'Countdown',
      'Strip Layout',
      'Sticker Layer',
      'Date Stamp',
      'Location Stamp',
      'QR Code',
    ],
    highlights: [
      'Perfect for weddings, graduations, pop-ups, and store activations.',
      'Feels playful on mobile while still polished on larger screens.',
      'Ready to export as strip, postcard, or social-ready assets.',
    ],
  },
  effects: {
    eyebrow: 'Effect Library',
    title: 'Layer cinematic, playful, and seasonal effects in real time.',
    description:
      'Choose from love, nature, magic, fire, water, space, and celebration packs with animated particles and overlays.',
    metrics: [
      { label: 'Effect families', value: '10+' },
      { label: 'Live overlays', value: 'Particles + glow' },
    ],
    controls: [
      'Love Rain',
      'Butterfly Swarm',
      'Sparkle',
      'Fire Ring',
      'Ocean Wave',
      'Galaxy',
    ],
    highlights: [
      'Built for real-time preview instead of blind filter application.',
      'Designed to work with Canvas, WebGL, and MediaPipe pipelines.',
      'Easy to mix subtle bokeh with bolder themed moments.',
    ],
  },
  filters: {
    eyebrow: 'Filter Deck',
    title: 'Dial in the mood with filmic photo filters.',
    description:
      'Warm, cool, vintage, cinematic, matte, HDR, neon, pastel, and social-style treatments keep every shot on brand.',
    metrics: [
      { label: 'Filter moods', value: '20+' },
      { label: 'Preview latency', value: 'Live' },
    ],
    controls: ['Warm', 'Kodak', 'Fuji', 'Mono', 'Cinematic', 'Glow', 'Matte'],
    highlights: [
      'Made for subtle color grading as well as dramatic stylization.',
      'Easy to blend with overlays, blur, and AI transformations.',
      'Keeps the interaction fast enough for touch-first editing.',
    ],
  },
  'ai-effects': {
    eyebrow: 'Vision Intelligence',
    title: 'AI camera features that activate inside the browser.',
    description:
      'Face detection, mesh, pose, gestures, segmentation, OCR, QR scanning, and object detection unlock smarter capture flows.',
    metrics: [
      { label: 'Detection tools', value: '15+' },
      { label: 'Inference location', value: 'On device' },
    ],
    controls: [
      'Face Detection',
      'Smile Detection',
      'Hand Gesture',
      'Pose Detection',
      'OCR',
      'QR Scanner',
      'Barcode Scanner',
    ],
    highlights: [
      'Supports automation like smile capture and document scanning.',
      'Great foundation for creators, classrooms, and productivity flows.',
      'Privacy stays intact because frames do not leave the device.',
    ],
  },
  background: {
    eyebrow: 'Scene Studio',
    title: 'Swap the world behind the subject in a few taps.',
    description:
      'Move from blur and office settings to beach, library, cyberpunk city, galaxy, aquarium, and studio backdrops.',
    metrics: [
      { label: 'Backdrop themes', value: '20+' },
      { label: 'Segmentation mode', value: 'Local' },
    ],
    controls: ['Blur', 'Beach', 'Cafe', 'Library', 'Cyberpunk City', 'Galaxy', 'Studio'],
    highlights: [
      'Built for meetings, creator shoots, and fantasy scene changes.',
      'Pairs with face and accessory layers for complete transformations.',
      'Optimized to feel light even with visually rich compositions.',
    ],
  },
  face: {
    eyebrow: 'Face Studio',
    title: 'Blur, beauty, and playful face effects in one lane.',
    description:
      'Combine portrait blur, soft skin, teeth whitening, glow, mosaic privacy blur, anime styling, or funny transformations.',
    metrics: [
      { label: 'Face packs', value: 'Beauty + Funny' },
      { label: 'Portrait tools', value: '10+' },
    ],
    controls: [
      'Background Blur',
      'Smooth Skin',
      'Face Glow',
      'Big Eyes',
      'Old Face',
      'Baby Face',
      'Cartoon',
    ],
    highlights: [
      'Beauty options stay subtle while funny effects stay expressive.',
      'Privacy blur options are useful for safer demos and shared spaces.',
      'Designed to stack with filters, frames, and background swaps.',
    ],
  },
  accessories: {
    eyebrow: 'AR Accessories',
    title: 'Dress every scene with accessories and character pieces.',
    description:
      'Attach sunglasses, crowns, halos, hats, ears, mustaches, necklaces, masks, and scarves for expressive overlays.',
    metrics: [
      { label: 'Accessory set', value: '20+' },
      { label: 'Tracking target', value: 'Face landmarks' },
    ],
    controls: [
      'Pixel Glasses',
      'Flower Crown',
      'Angel Halo',
      'Santa Hat',
      'Cat Ear',
      'Mustache',
      'Mask',
    ],
    highlights: [
      'Ideal for seasonal campaigns and playful user-generated content.',
      'Pairs naturally with AI styles, themes, and sticker packs.',
      'Face tracking keeps placement feeling intentional and premium.',
    ],
  },
  frames: {
    eyebrow: 'Frame Builder',
    title: 'Package the result with frames made for print and social.',
    description:
      'Move from photobooth strips and passport crops to polaroids, comic panels, magazine spreads, and social covers.',
    metrics: [
      { label: 'Frame types', value: '12+' },
      { label: 'Output ready', value: 'Print + social' },
    ],
    controls: [
      'Photobooth Strip',
      'Passport',
      'Polaroid',
      'Comic Layout',
      'Magazine',
      'YouTube Thumbnail',
    ],
    highlights: [
      'Helpful for both creator templates and operational workflows.',
      'Balances expressive composition with practical export needs.',
      'Makes local editing feel like a polished mini design studio.',
    ],
  },
  grid: {
    eyebrow: 'Grid Lab',
    title: 'Choose dense or minimal layouts for every output format.',
    description:
      'Build single shots, 2 to 20 grid collages, social crops, A4 print sheets, landscape posters, and editorial compositions.',
    metrics: [
      { label: 'Grid presets', value: '20+' },
      { label: 'Orientation', value: 'Portrait + landscape' },
    ],
    controls: [
      '2 Grid',
      '4 Grid',
      '9 Grid',
      '16 Grid',
      'Instagram Story',
      'TikTok',
      'A4 Print',
    ],
    highlights: [
      'Useful for contact sheets, moodboards, or social campaign assets.',
      'Can support booth strips, passport sheets, and collage formats.',
      'Makes high-volume capture sessions easier to organize.',
    ],
  },
  drawing: {
    eyebrow: 'Markup Canvas',
    title: 'Annotate, sketch, crop, and direct attention with tools that stay fun.',
    description:
      'Brushes, pencil, spray, arrows, rectangles, circles, crop, undo, redo, eraser, and color pickers turn edits into quick creative sessions.',
    metrics: [
      { label: 'Markup tools', value: '10+' },
      { label: 'Text styling', value: 'Gradients + glow' },
    ],
    controls: ['Brush', 'Pencil', 'Spray', 'Arrow', 'Rectangle', 'Circle', 'Crop'],
    highlights: [
      'Complements stickers, emoji, and curved text for playful outputs.',
      'Useful for educational flows, storyboarding, and event signage.',
      'Keeps the editing loop fast without moving to a separate app.',
    ],
  },
  export: {
    eyebrow: 'Finish & Share',
    title: 'Export the final result in whatever format the moment demands.',
    description:
      'Send out PNG, JPEG, WEBP, PDF, ZIP bundles, clipboard copies, direct downloads, and share-ready packages.',
    metrics: [
      { label: 'Formats', value: '7' },
      { label: 'Handoff', value: 'Clipboard + share' },
    ],
    controls: ['PNG', 'JPEG', 'WEBP', 'PDF', 'ZIP', 'Copy Clipboard', 'Download'],
    highlights: [
      'Ready for consumer sharing and operational workflows alike.',
      'Supports delivering one shot or an entire photo booth session.',
      'Great companion to print layouts and social-first crops.',
    ],
  },
  gallery: {
    eyebrow: 'Local Gallery',
    title: 'Keep your sessions close with a gallery that respects privacy.',
    description:
      'Review saved edits, compare before and after states, and revisit favorite effect combinations without cloud dependency.',
    metrics: [
      { label: 'Storage style', value: 'Local-first' },
      { label: 'Compare mode', value: 'Before / After' },
    ],
    controls: ['Recent captures', 'Session history', 'Favorites', 'Compare view'],
    highlights: [
      'Designed for demos, creator iteration, and event workflows.',
      'Helps users return to their best presets and compositions.',
      'A clean bridge between capture, refinement, and export.',
    ],
  },
  settings: {
    eyebrow: 'Personalization',
    title: 'Tune performance, themes, resolution, and language in seconds.',
    description:
      'Switch dark or light mode, adjust accent color, choose performance mode, refine camera resolution, and localize the interface.',
    metrics: [
      { label: 'Themes', value: 'Dark + light' },
      { label: 'Languages', value: 'EN · ID · JP' },
    ],
    controls: [
      'Accent Color',
      'Performance Mode',
      'Camera Resolution',
      'English',
      'Indonesia',
      'Japanese',
    ],
    highlights: [
      'Default dark mode keeps the experience cinematic and focused.',
      'Responsive settings matter for both mobile and desktop sessions.',
      'Performance controls let users prioritize speed or visual polish.',
    ],
  },
};

export const effectPacks = [
  {
    id: 'love',
    label: 'Love',
    headline: 'Romantic particle systems that feel soft, cinematic, and playful.',
    description:
      'Dial in heart bursts, rose petals, pink smoke, and bokeh glow for wedding booths, date-night content, or dreamy portraits.',
    items: [
      'Love Rain',
      'Heart Explosion',
      'Heart Floating',
      'Cupid Arrow',
      'Rose Rain',
      'Bubble Love',
      'Pink Glow',
      'Romantic Bokeh',
    ],
  },
  {
    id: 'nature',
    label: 'Nature',
    headline: 'Organic motion layers bring outdoor energy into the frame.',
    description:
      'From butterflies and birds to fog, golden hour, snowfall, and sun rays, these scenes turn simple portraits into atmospheric moments.',
    items: [
      'Bird Flying',
      'Butterfly Swarm',
      'Falling Leaves',
      'Cherry Blossom',
      'Snow',
      'Rain',
      'Fireflies',
      'Golden Hour',
    ],
  },
  {
    id: 'magic',
    label: 'Magic',
    headline: 'Add wonder with glow-driven fantasy overlays.',
    description:
      'Use sparkle dust, halos, galaxies, meteor trails, and aurora washes when you want the camera to feel like a portal.',
    items: [
      'Sparkle',
      'Magic Dust',
      'Magic Circle',
      'Aura',
      'Halo',
      'Galaxy',
      'Aurora',
      'Star Rain',
    ],
  },
  {
    id: 'fire',
    label: 'Fire',
    headline: 'High-energy scenes built for bold promos and dramatic portraits.',
    description:
      'Ignite the composition with fire rings, lava, sparks, smoke, and phoenix-inspired aura trails.',
    items: [
      'Fire',
      'Flame Aura',
      'Phoenix Wings',
      'Burning Particle',
      'Smoke',
      'Explosion',
      'Fire Ring',
      'Fire Trail',
    ],
  },
  {
    id: 'water',
    label: 'Water',
    headline: 'Fluid reflections and droplets cool the mood instantly.',
    description:
      'Ripple, splash, frost, ocean wave, rain glass, and underwater presets create polished aquatic visuals without leaving the browser.',
    items: [
      'Bubble',
      'Underwater',
      'Ripple',
      'Splash',
      'Ice',
      'Frost',
      'Rain Glass',
      'Ocean Wave',
    ],
  },
  {
    id: 'space',
    label: 'Space',
    headline: 'Turn the booth into a cosmic stage.',
    description:
      'Planets, moon rings, stars, asteroids, dust, and universe glow presets deliver futuristic and surreal visual identities.',
    items: [
      'Galaxy',
      'Milky Way',
      'Planet',
      'Moon',
      'Saturn Ring',
      'Stars',
      'Asteroid',
      'Universe Glow',
    ],
  },
] as const;

export type EffectPackId = (typeof effectPacks)[number]['id'];

export const creativeStudios = [
  {
    title: 'Face + Beauty',
    description: 'Blur, brighten, smooth, slim, glow, and protect privacy with on-device face tools.',
    items: ['Background Blur', 'Smooth Skin', 'Whitening', 'Face Slim', 'Privacy Blur', 'Face Glow'],
  },
  {
    title: 'Funny + Character',
    description: 'Lean into comedy with stylized transformations and expressive overlays.',
    items: ['Big Head', 'Alien', 'Old Face', 'Baby Face', 'Cartoon', 'Comic', 'Anime'],
  },
  {
    title: 'AI Style + Film',
    description: 'Move from handcrafted sketches to nostalgic film aesthetics with one click.',
    items: ['Ghibli', 'Pixar Style', 'Watercolor', 'Clay', 'Cyberpunk', 'VHS', 'Kodak', 'Bloom'],
  },
  {
    title: 'Seasonal + Events',
    description: 'Celebrate real moments with themed kits for holiday booths and special campaigns.',
    items: ['Confetti', 'Fireworks', 'Ghost', 'Pumpkin', 'Santa', 'Christmas Tree', 'Balloon'],
  },
];

export const layoutFamilies = [
  {
    title: 'Core Grids',
    description: 'Single, 2, 3, 4, 6, 8, 9, 12, 16, and 20-cell grids for fast collage building.',
    items: ['Single', '2 Grid', '4 Grid', '9 Grid', '12 Grid', '16 Grid', '20 Grid'],
  },
  {
    title: 'Social Formats',
    description: 'Preset shapes that ship directly to today’s most common publishing surfaces.',
    items: ['Instagram Grid', 'Instagram Story', 'TikTok', 'Facebook Cover', 'YouTube Thumbnail', 'Twitter Header'],
  },
  {
    title: 'Print + Editorial',
    description: 'Layout families for IDs, posters, print sheets, and creative storytelling.',
    items: ['Passport', 'A4 Print', 'Landscape', 'Portrait', 'Magazine', 'Comic Layout', 'Polaroid'],
  },
  {
    title: 'Collage Modes',
    description: 'Compositions for creator moodboards, lookbooks, and Pinterest-style storytelling.',
    items: ['Photobooth Strip', 'Collage', 'Pinterest Style', 'Comic Layout', 'Magazine', 'Polaroid'],
  },
];

export const aiFeatures = [
  'Face Detection',
  'Face Mesh',
  'Smile Detection',
  'Blink Detection',
  'Eye Tracking',
  'Head Tracking',
  'Hand Gesture',
  'Pose Detection',
  'Background Segmentation',
  'Object Detection',
  'QR Scanner',
  'Barcode Scanner',
  'OCR',
  'Document Scanner',
  'Color Detection',
];

export const photoBoothFeatures = [
  'Automatic 4 Photos',
  'Automatic 6 Photos',
  'Automatic 8 Photos',
  'Frame + Border',
  'Sticker Layer',
  'Date Stamp',
  'Location Stamp',
  'QR Code',
];

export const creativeTools = [
  'Brush',
  'Pencil',
  'Spray',
  'Arrow',
  'Rectangle',
  'Circle',
  'Crop',
  'Undo',
  'Redo',
  'Color Picker',
  'Gradient Text',
  'Emoji',
  'Curved Text',
  'Glow',
];

export const exportFormats = ['PNG', 'JPEG', 'WEBP', 'PDF', 'ZIP', 'Copy Clipboard', 'Share', 'Download'];

export const privacyPrinciples = [
  'Photos and video frames stay on device.',
  'Effects render locally with MediaPipe, Canvas API, WebGL, PixiJS, and TensorFlow.js when needed.',
  'No mandatory upload step before preview or export.',
  'Performance mode lets users balance smoothness and battery use.',
];

export const stackItems = [
  'React',
  'TypeScript',
  'Vite',
  'Tailwind CSS',
  'MediaPipe',
  'TensorFlow.js',
  'PixiJS',
  'Canvas API',
  'Framer Motion',
  'React Router',
  'React Query',
  'Zustand',
  'Konva.js',
];
