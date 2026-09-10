import React from 'react';
import {
  BookOpen,
  HeartHandshake,
  Users,
  Award,
  CalendarCheck,
  TrendingUp,
} from 'lucide-react';
import type { DashboardMetrics } from '../types';

interface DashboardStatsProps {
  metrics: DashboardMetrics;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ metrics }) => {
  return (
    <div className="space-y-4">
      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Laporan */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Laporan
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {metrics.totalSubmissions.toLocaleString('id-ID')}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-700 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{metrics.todaySubmissions} laporan hari ini</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Sholawat */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Sholawat
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-amber-800 tracking-tight">
              {metrics.totalSholawat.toLocaleString('id-ID')}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Koleksi sholawat seluruh anggota
            </div>
          </div>
        </div>

        {/* Card 3: Anggota Aktif */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Anggota Berpartisipasi
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {metrics.totalUniqueMembers}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Anggota rutin setor tilawah
            </div>
          </div>
        </div>

        {/* Card 4: Surat Terpopuler */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Surat Terfavorit
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900 truncate" title={metrics.topSurah.name}>
              {metrics.topSurah.name}
            </div>
            <div className="mt-1 text-xs text-teal-700 font-medium">
              {metrics.topSurah.count} kali dibaca/dilaporkan
            </div>
          </div>
        </div>
      </div>

      {/* Kegiatan Distribution Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Tilawah (Membaca)
            </span>
            <span className="text-xl font-black text-emerald-950">
              {(metrics.kegiatanCounts['Tilawah'] || 0).toLocaleString('id-ID')}
            </span>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
            {metrics.totalSubmissions > 0
              ? Math.round(((metrics.kegiatanCounts['Tilawah'] || 0) / metrics.totalSubmissions) * 100)
              : 0}%
          </span>
        </div>

        <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
              Mustami' (Mendengarkan)
            </span>
            <span className="text-xl font-black text-blue-950">
              {(metrics.kegiatanCounts["Mustami'"] || 0).toLocaleString('id-ID')}
            </span>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-200/80 text-blue-900">
            {metrics.totalSubmissions > 0
              ? Math.round(((metrics.kegiatanCounts["Mustami'"] || 0) / metrics.totalSubmissions) * 100)
              : 0}%
          </span>
        </div>

        <div className="p-3.5 bg-amber-50/70 border border-amber-100 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
              Terjemah (Membaca Terjemah)
            </span>
            <span className="text-xl font-black text-amber-950">
              {(metrics.kegiatanCounts['Terjemah'] || 0).toLocaleString('id-ID')}
            </span>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
            {metrics.totalSubmissions > 0
              ? Math.round(((metrics.kegiatanCounts['Terjemah'] || 0) / metrics.totalSubmissions) * 100)
              : 0}%
          </span>
        </div>
      </div>
    </div>
  );
};
