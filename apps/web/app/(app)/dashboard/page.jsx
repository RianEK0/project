"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Archive, CheckCircle2, Clock, FileDown, FilePlus2, FileText, Layers3, RefreshCw, ShieldAlert, ShieldCheck, Trash } from "lucide-react";
import { apiFetch, buildQuery } from "../../../lib/api";
import { StatusBadge } from "../../../components/StatusBadge";
import { FileTypeIcon } from "../../../components/FileTypeIcon";
import { formatDateTime } from "../../../lib/format";

function StatCard({ label, value, icon: Icon, tone = "brand", description = "" }) {
  const tones = {
    brand: "bg-brand-50 text-brand-700 border-brand-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    red: "bg-red-50 text-red-700 border-red-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100"
  };

  return (
    <div className={`rounded-md border bg-white p-4 shadow-sm transition-all hover:shadow-md ${tones[tone] ? "border-slate-200" : "border-slate-200"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-extrabold text-ink">{value ?? 0}</p>
          {description && <p className="mt-1 text-[11px] text-slate-400 font-medium">{description}</p>}
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${tones[tone] || tones.brand}`}>
          <Icon size={20} />
        </span>
      </div>
    </div>
  );
}

// SVG Line/Area Chart for monthly counts
function LineChart({ data, title }) {
  const maxVal = Math.max(...data.map(d => d.val), 5);
  const width = 450;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = data.map((d, i) => {
    const x = paddingLeft + (i / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.val / maxVal) * chartHeight;
    return { x, y, label: d.label, val: d.val };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : "";

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-bold text-slate-700 mb-3">{title}</h3>
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
          {/* Grids and Axes */}
          <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={paddingTop + chartHeight} stroke="#e2e8f0" />
          <line x1={paddingLeft} y1={paddingTop + chartHeight} x2={width - paddingRight} y2={paddingTop + chartHeight} stroke="#e2e8f0" />
          
          {/* Y ticks and lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = paddingTop + chartHeight - pct * chartHeight;
            const val = Math.round(pct * maxVal);
            return (
              <g key={i}>
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#f8fafc" strokeDasharray="3 3" />
                <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-medium">{val}</text>
              </g>
            );
          })}

          {/* Area under the line */}
          {areaD && <path d={areaD} fill="url(#grad)" opacity="0.15" />}
          
          {/* Path line */}
          {pathD && <path d={pathD} fill="none" stroke="#0d9488" strokeWidth="2.5" />}

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i} className="group cursor-pointer">
              <circle cx={p.x} cy={p.y} r="3.5" fill="#ffffff" stroke="#0d9488" strokeWidth="2" />
              <circle cx={p.x} cy={p.y} r="7" fill="#0d9488" opacity="0" className="hover:opacity-20 transition-opacity" />
              <title>{`${p.label}: ${p.val} Arsip`}</title>
            </g>
          ))}

          {/* X Labels */}
          {points.map((p, i) => (
            (i % 2 === 0 || data.length < 8) && (
              <text key={i} x={p.x} y={height - 8} textAnchor="middle" className="text-[9px] fill-slate-400 font-semibold">
                {p.label}
              </text>
            )
          ))}

          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

// SVG Bar Chart
function BarChart({ data, title, color = "indigo" }) {
  const maxVal = Math.max(...data.map(d => d.val), 5);
  const width = 450;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const barWidth = data.length > 0 ? (chartWidth / data.length) * 0.5 : 20;
  const colWidth = data.length > 0 ? chartWidth / data.length : 40;

  const colors = {
    indigo: "fill-indigo-600 hover:fill-indigo-700",
    amber: "fill-amber-600 hover:fill-amber-700",
    emerald: "fill-emerald-600 hover:fill-emerald-700",
    red: "fill-red-600 hover:fill-red-700"
  };

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-bold text-slate-700 mb-3">{title}</h3>
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
          {/* Axis lines */}
          <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={paddingTop + chartHeight} stroke="#e2e8f0" />
          <line x1={paddingLeft} y1={paddingTop + chartHeight} x2={width - paddingRight} y2={paddingTop + chartHeight} stroke="#e2e8f0" />
          
          {/* Y Axis ticks */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = paddingTop + chartHeight - pct * chartHeight;
            const val = Math.round(pct * maxVal);
            return (
              <g key={i}>
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#f8fafc" strokeDasharray="3 3" />
                <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-medium">{val}</text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((d, i) => {
            const x = paddingLeft + i * colWidth + (colWidth - barWidth) / 2;
            const barHeight = (d.val / maxVal) * chartHeight;
            const y = paddingTop + chartHeight - barHeight;
            return (
              <g key={i} className="group cursor-pointer">
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="2"
                  className={`${colors[color] || colors.indigo} transition-all duration-300`}
                />
                <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" className="text-[9px] font-bold fill-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  {d.val}
                </text>
                <text x={paddingLeft + i * colWidth + colWidth / 2} y={height - 8} textAnchor="middle" className="text-[10px] fill-slate-400 font-semibold">
                  {d.label}
                </text>
                <title>{`${d.label}: ${d.val} Arsip`}</title>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// Relative Progress list for classification codes
function ClassificationList({ data, title }) {
  const maxVal = Math.max(...data.map(d => d.val), 1);
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-bold text-slate-700 mb-3">{title}</h3>
      <div className="space-y-3.5">
        {data.slice(0, 5).map((item, i) => {
          const percentage = (item.val / maxVal) * 100;
          return (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <span className="truncate max-w-[200px]" title={item.label}>{item.label}</span>
                <span className="text-slate-800 font-bold">{item.val} Arsip</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand-600 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
        {data.length === 0 && (
          <div className="text-center py-8 text-xs text-slate-400">Tidak ada data klasifikasi.</div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [unitId, setUnitId] = useState("");
  const [units, setUnits] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const [dashboardResult, organizationResult] = await Promise.all([
        apiFetch(`/dashboard${buildQuery({ unitId })}`),
        apiFetch("/organization")
      ]);
      setDashboard(dashboardResult);
      setUnits(organizationResult.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = dashboard?.stats || {};
  const activeUnit = useMemo(() => units.find((unit) => unit.id === Number(unitId)), [units, unitId]);

  // Chart data formatting
  const monthlyCreationData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    const base = months.map((m, i) => ({ label: m, val: 0 }));
    if (dashboard?.charts?.creationByMonth) {
      dashboard.charts.creationByMonth.forEach((item) => {
        const idx = Number(item.month) - 1;
        if (idx >= 0 && idx < 12) {
          base[idx].val = Number(item.count);
        }
      });
    }
    return base;
  }, [dashboard]);

  const yearlyDisposalData = useMemo(() => {
    const list = dashboard?.charts?.disposalByYear || [];
    return list.map((item) => ({ label: String(item.year), val: Number(item.count) }));
  }, [dashboard]);

  const yearlyDestructionData = useMemo(() => {
    const list = dashboard?.charts?.destructionByYear || [];
    return list.map((item) => ({ label: String(item.year), val: Number(item.count) }));
  }, [dashboard]);

  const classificationData = useMemo(() => {
    const list = dashboard?.charts?.byClassification || [];
    return list.map((item) => ({ label: item.classification, val: Number(item.count) }));
  }, [dashboard]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-brand-700">Dashboard</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">Ringkasan Arsip Inspektorat</h1>
          <p className="mt-1 text-sm text-slate-500">{activeUnit ? activeUnit.name : "Semua unit organisasi"}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={unitId}
            onChange={(event) => setUnitId(event.target.value)}
            className="focus-ring h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="">Semua divisi</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
          <Link
            href="/archives?new=1"
            className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <FilePlus2 size={18} />
            Tambah Arsip
          </Link>
        </div>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {/* Main Stats Block */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total arsip" value={stats.totalArchives} icon={Archive} />
        <StatCard label="Arsip Baru" value={stats.newArchives} icon={FilePlus2} tone="blue" description="Dibuat 30 hari terakhir" />
        <StatCard label="Arsip Aktif" value={stats.activeArchives} icon={CheckCircle2} tone="emerald" />
        <StatCard label="Arsip Inaktif" value={stats.inactiveArchives} icon={RefreshCw} tone="amber" />
        <StatCard label="Arsip Statis" value={stats.staticArchives} icon={ShieldCheck} tone="indigo" />
      </div>

      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mt-6 mb-2">Tindak Lanjut Siklus Hidup (ANRI)</h2>

      {/* Lifecycle Stats Block */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Siap Disusutkan" value={stats.eligibleDisposal} icon={Layers3} tone="amber" description="Masa retensi aktif habis" />
        <StatCard label="Antrean Penyusutan" value={stats.inDisposal} icon={Clock} tone="indigo" description="Dalam proses usulan review" />
        <StatCard label="Siap Dimusnahkan" value={stats.eligibleDestruction} icon={Trash} tone="red" description="Masa retensi inaktif habis" />
        <StatCard label="Antrean Pemusnahan" value={stats.inDestruction} icon={Clock} tone="amber" description="Dalam usulan/verif/kepala" />
        <StatCard label="Arsip Fisik Musnah" value={stats.destroyedArchives} icon={Trash} tone="red" description="BA & foto diunggah" />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-5 md:grid-cols-2">
        <LineChart data={monthlyCreationData} title="Penciptaan Arsip per Bulan (Tahun Ini)" />
        <BarChart data={yearlyDisposalData} title="Penyusutan per Tahun" color="indigo" />
        <BarChart data={yearlyDestructionData} title="Pemusnahan per Tahun" color="red" />
        <ClassificationList data={classificationData} title="Arsip berdasarkan Klasifikasi (Top 5)" />
      </div>

      {/* Details Grid */}
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 className="text-base font-semibold text-ink">Arsip terbaru</h2>
            <Link href="/archives" className="text-sm font-semibold text-brand-700 hover:text-brand-600">
              Lihat semua
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Dokumen</th>
                  <th className="px-4 py-3">Divisi</th>
                  <th className="px-4 py-3">File</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(dashboard?.recentArchives || []).map((archive) => (
                  <tr key={archive.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{archive.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{archive.document_number}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{archive.unit_name}</td>
                    <td className="px-4 py-3">
                      <FileTypeIcon type={archive.file_type} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={archive.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDateTime(archive.created_at)}</td>
                  </tr>
                ))}
                {!loading && dashboard?.recentArchives?.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={5}>
                      Belum ada arsip.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-base font-semibold text-ink">Aktivitas terbaru</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {(dashboard?.activities || []).map((activity) => (
              <div key={activity.id} className="flex gap-3 px-4 py-3">
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                  <CheckCircle2 size={17} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {activity.action} {activity.entity}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {activity.user_name || "Sistem"} | {formatDateTime(activity.created_at)}
                  </p>
                </div>
              </div>
            ))}
            {!loading && dashboard?.activities?.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">Belum ada aktivitas.</div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
