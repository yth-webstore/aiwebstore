import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, BarChart3 } from 'lucide-react';
import type { DashboardMetrics } from '../types';

interface AnalyticsChartsProps {
  metrics: DashboardMetrics;
}

const KEGIATAN_COLORS = ['#059669', '#3b82f6', '#f59e0b', '#8b5cf6'];
const SURAH_BAR_COLOR = '#0d9488';

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ metrics }) => {
  const [trendMetric, setTrendMetric] = useState<'count' | 'sholawat'>('count');

  // Prepare Pie Chart Data
  const pieData = Object.entries(metrics.kegiatanCounts)
    .filter(([_, count]) => (count as number) > 0)
    .map(([name, value]) => ({ name, value: value as number }));

  // Prepare Surah Chart Data (Top 8)
  const surahChartData = metrics.surahRankings.slice(0, 8).map((item) => ({
    name: item.surah.length > 18 ? item.surah.substring(0, 16) + '…' : item.surah,
    fullName: item.surah,
    jumlah: item.count,
  }));

  return (
    <div className="space-y-6">
      {/* Chart 1: Trend Aktivitas Harian */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Trend Aktivitas Harian (14 Hari Terakhir)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Grafik intensitas penyetoran tilawah dan sholawat harian
            </p>
          </div>

          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setTrendMetric('count')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                trendMetric === 'count'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Jumlah Laporan
            </button>
            <button
              type="button"
              onClick={() => setTrendMetric('sholawat')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                trendMetric === 'sholawat'
                  ? 'bg-white text-amber-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Total Sholawat
            </button>
          </div>
        </div>

        <div className="h-72 w-full">
          {metrics.dailyTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={trendMetric === 'count' ? '#059669' : '#d97706'}
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor={trendMetric === 'count' ? '#059669' : '#d97706'}
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="displayDate" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [
                    Number(val).toLocaleString('id-ID'),
                    trendMetric === 'count' ? 'Laporan' : 'Sholawat',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey={trendMetric === 'count' ? 'count' : 'sholawat'}
                  stroke={trendMetric === 'count' ? '#059669' : '#d97706'}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorTrend)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Belum ada data trend yang mencukupi
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Distribusi Kegiatan & Top Surat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Proporsi Kegiatan */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PieIcon className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-base">Proporsi Jenis Kegiatan</h3>
            </div>
            <p className="text-xs text-slate-500">
              Perbandingan Tilawah (membaca), Mustami' (mendengar), &amp; Terjemah
            </p>
          </div>

          <div className="h-64 w-full mt-4">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={KEGIATAN_COLORS[index % KEGIATAN_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${Number(val).toLocaleString('id-ID')} laporan`, 'Jumlah']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Data tidak tersedia
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart: Surat Terbanyak Dibaca */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">Top Surat Al-Qur'an</h3>
            </div>
            <p className="text-xs text-slate-500">
              Surat-surat yang paling sering dilaporkan dibaca
            </p>
          </div>

          <div className="h-64 w-full mt-4">
            {surahChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={surahChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    angle={-25}
                    textAnchor="end"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${Number(val).toLocaleString('id-ID')} kali dibaca`, 'Frekuensi']}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return payload[0].payload.fullName;
                      }
                      return label;
                    }}
                  />
                  <Bar dataKey="jumlah" fill={SURAH_BAR_COLOR} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Data belum tersedia
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
