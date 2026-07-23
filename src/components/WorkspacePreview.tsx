import { AnimatePresence, motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  Blend,
  Bot,
  Camera,
  Download,
  Frame,
  Grid3X3,
  ImagePlus,
  Images,
  LayoutDashboard,
  PanelsTopLeft,
  PenTool,
  ScanFace,
  Settings2,
  Shirt,
  Sparkles,
} from 'lucide-react';
import { sidebarItems, workspacePanels, type PanelId } from '../data/siteContent';

const iconMap: Record<PanelId, LucideIcon> = {
  dashboard: LayoutDashboard,
  camera: Camera,
  'photo-booth': PanelsTopLeft,
  effects: Sparkles,
  filters: Blend,
  'ai-effects': Bot,
  background: ImagePlus,
  face: ScanFace,
  accessories: Shirt,
  frames: Frame,
  grid: Grid3X3,
  drawing: PenTool,
  export: Download,
  gallery: Images,
  settings: Settings2,
};

type WorkspacePreviewProps = {
  activePanel: PanelId;
  onPanelChange: (id: PanelId) => void;
};

export function WorkspacePreview({
  activePanel,
  onPanelChange,
}: WorkspacePreviewProps) {
  const panel = workspacePanels[activePanel];
  const ActiveIcon = iconMap[activePanel];

  return (
    <div className="glass-panel overflow-hidden rounded-[2rem] p-4 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="flex gap-3 overflow-x-auto xl:flex-col">
          {sidebarItems.map((item) => {
            const Icon = iconMap[item.id];
            const isActive = item.id === activePanel;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onPanelChange(item.id)}
                className={`group min-w-fit rounded-2xl border px-4 py-3 text-left transition-all duration-300 xl:min-w-0 ${
                  isActive
                    ? 'border-white/15 bg-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_60px_rgba(6,10,22,0.35)]'
                    : 'border-white/8 bg-white/4 hover:border-white/12 hover:bg-white/8'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 ${
                      isActive
                        ? 'border-transparent bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-white shadow-[0_12px_28px_rgba(60,76,255,0.35)]'
                        : 'border-white/10 bg-white/5 text-slate-300 group-hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-white">{item.label}</div>
                    <div className="text-xs text-slate-400">
                      {isActive ? 'Active now' : 'Open panel'}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </aside>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60 p-5 sm:p-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_35%)]" />
          <AnimatePresence mode="wait">
            <motion.div
              key={activePanel}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-slate-300">
                    {panel.eyebrow}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
                    Zero-upload workflow
                  </span>
                </div>

                <div className="mt-4 flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/12 bg-white/8 text-white shadow-[0_20px_40px_rgba(5,10,18,0.45)]">
                    <ActiveIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
                      {panel.title}
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                      {panel.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {panel.metrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
                    >
                      <div className="text-xs uppercase tracking-[0.28em] text-slate-400">
                        {metric.label}
                      </div>
                      <div className="mt-3 text-2xl font-semibold text-white">{metric.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {panel.controls.map((control) => (
                    <span
                      key={control}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200"
                    >
                      {control}
                    </span>
                  ))}
                </div>

                <div className="mt-6 grid gap-3">
                  {panel.highlights.map((highlight) => (
                    <div
                      key={highlight}
                      className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/4 px-4 py-3"
                    >
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--accent-3)] shadow-[0_0_18px_var(--accent-3)]" />
                      <p className="text-sm leading-6 text-slate-300">{highlight}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] p-4">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-slate-400">
                    <span>Preview canvas</span>
                    <span>Live</span>
                  </div>
                  <div className="preview-canvas mt-4">
                    <div className="preview-canvas__badge left-4 top-4">AI Camera</div>
                    <div className="preview-canvas__badge right-4 top-4">Local GPU</div>
                    <div className="preview-canvas__frame">
                      <div className="preview-canvas__core" />
                    </div>
                    <div className="preview-canvas__controls">
                      {panel.controls.slice(0, 3).map((control) => (
                        <span key={control}>{control}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white">Render queue</div>
                      <div className="text-xs text-slate-400">Skeleton + micro interaction</div>
                    </div>
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.25em] text-emerald-300">
                      Smooth
                    </span>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="skeleton-line h-3 w-3/4" />
                    <div className="skeleton-line h-3 w-5/6" />
                    <div className="skeleton-line h-3 w-2/3" />
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold text-white">Flow summary</div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-300">
                    <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/4 px-3 py-2">
                      <span>Capture</span>
                      <span>Ready</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/4 px-3 py-2">
                      <span>AI enhance</span>
                      <span>Local</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/4 px-3 py-2">
                      <span>Export</span>
                      <span>Instant</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
