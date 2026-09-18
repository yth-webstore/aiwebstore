import React, { useState, useMemo } from 'react';
import {
  Trophy,
  HeartHandshake,
  BookOpen,
  Search,
  Calendar,
  Globe,
  Medal,
  BookmarkCheck,
  FileText,
} from 'lucide-react';
import type { DashboardMetrics, SheetRow, MemberContribution } from '../types';
import { calculateMemberVerseProgress } from '../utils/quranVerseCalculator';

interface MemberLeaderboardProps {
  metrics: DashboardMetrics;
  rows?: SheetRow[];
  onSelectMember?: (name: string) => void;
}

export const MemberLeaderboard: React.FC<MemberLeaderboardProps> = ({
  metrics,
  rows = [],
  onSelectMember,
}) => {
  const [rankScope, setRankScope] = useState<'monthly' | 'global'>('monthly');
  const [sortBy, setSortBy] = useState<'verses' | 'sholawat' | 'reports'>('verses');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract all unique months available in data
  const availableMonths = useMemo(() => {
    if (!rows || rows.length === 0) {
      const now = new Date();
      const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return [{ key, label: now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) }];
    }
    const monthMap = new Map<string, string>();
    rows.forEach((r) => {
      if (r.rawDate && !isNaN(r.rawDate.getTime())) {
        const year = r.rawDate.getFullYear();
        const month = String(r.rawDate.getMonth() + 1).padStart(2, '0');
        const key = `${year}-${month}`;
        if (!monthMap.has(key)) {
          const label = r.rawDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
          monthMap.set(key, label);
        }
      }
    });

    const sortedKeys = Array.from(monthMap.keys()).sort().reverse();
    if (sortedKeys.length === 0) {
      const now = new Date();
      const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return [{ key, label: now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) }];
    }
    return sortedKeys.map((key) => ({ key, label: monthMap.get(key) || key }));
  }, [rows]);

  const [selectedMonth, setSelectedMonth] = useState<string>(
    availableMonths[0]?.key || ''
  );

  // Keep selectedMonth updated if list changes
  React.useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.some((m) => m.key === selectedMonth)) {
      setSelectedMonth(availableMonths[0].key);
    }
  }, [availableMonths, selectedMonth]);

  // Aggregate member contributions with verse delta calculation based on chosen scope
  const activeContributions: MemberContribution[] = useMemo(() => {
    if (!rows || rows.length === 0) {
      return metrics.memberContributions || [];
    }

    const scopedRows =
      rankScope === 'global'
        ? rows
        : rows.filter((r) => {
            if (!r.rawDate || isNaN(r.rawDate.getTime())) return false;
            const rowYear = r.rawDate.getFullYear();
            const rowMonth = String(r.rawDate.getMonth() + 1).padStart(2, '0');
            return `${rowYear}-${rowMonth}` === selectedMonth;
          });

    const memberRowsMap: Record<string, SheetRow[]> = {};
    scopedRows.forEach((r) => {
      const name = r.nama || 'Anonim';
      if (!memberRowsMap[name]) memberRowsMap[name] = [];
      memberRowsMap[name].push(r);
    });

    return Object.entries(memberRowsMap).map(([name, mRows]) => {
      const prog = calculateMemberVerseProgress(mRows);
      return {
        name,
        totalVerses: prog.totalVerses,
        estimatedJuz: prog.estimatedJuz,
        estimatedPages: prog.estimatedPages,
        lastPosition: prog.lastPosition,
        tilawahCount: prog.totalSubmissions,
        totalSholawat: prog.totalSholawat,
        lastActive: prog.lastActive,
      };
    });
  }, [rankScope, selectedMonth, rows, metrics.memberContributions]);

  const sortedList = useMemo(() => {
    return [...activeContributions]
      .sort((a, b) => {
        if (sortBy === 'verses') {
          return (
            b.totalVerses - a.totalVerses ||
            b.totalSholawat - a.totalSholawat ||
            b.tilawahCount - a.tilawahCount
          );
        } else if (sortBy === 'sholawat') {
          return (
            b.totalSholawat - a.totalSholawat ||
            b.totalVerses - a.totalVerses ||
            b.tilawahCount - a.tilawahCount
          );
        } else {
          return (
            b.tilawahCount - a.tilawahCount ||
            b.totalVerses - a.totalVerses ||
            b.totalSholawat - a.totalSholawat
          );
        }
      })
      .filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [activeContributions, sortBy, searchQuery]);

  const maxVerses = Math.max(...activeContributions.map((m) => m.totalVerses), 1);
  const maxSholawat = Math.max(...activeContributions.map((m) => m.totalSholawat), 1);
  const maxReports = Math.max(...activeContributions.map((m) => m.tilawahCount), 1);

  // Totals for the current scope
  const scopeTotalVerses = activeContributions.reduce((acc, m) => acc + m.totalVerses, 0);
  const scopeTotalJuz = Number((scopeTotalVerses / (6236 / 30)).toFixed(1));
  const scopeTotalReports = activeContributions.reduce((acc, m) => acc + m.tilawahCount, 0);
  const scopeTotalSholawat = activeContributions.reduce((acc, m) => acc + m.totalSholawat, 0);

  const selectedMonthLabel =
    availableMonths.find((m) => m.key === selectedMonth)?.label || selectedMonth;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                Papan Peringkat Tilawah &amp; Sholawat
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Peringkat berdasar pada <strong>jumlah ayat yang dibaca</strong> (selisih progres bacaan 114 surat Al-Qur&apos;an).
            </p>
          </div>

          {/* Sort Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 hidden sm:inline font-medium">Acuan Urutan:</span>
            <div className="inline-flex p-1 bg-white/10 rounded-xl text-xs font-semibold backdrop-blur-xs">
              <button
                type="button"
                id="btn-sort-verses"
                onClick={() => setSortBy('verses')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  sortBy === 'verses'
                    ? 'bg-emerald-500 text-white shadow-xs font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Peringkat berdasarkan total ayat yang dibaca"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Jumlah Ayat</span>
              </button>
              <button
                type="button"
                id="btn-sort-sholawat"
                onClick={() => setSortBy('sholawat')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  sortBy === 'sholawat'
                    ? 'bg-amber-500 text-white shadow-xs font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Peringkat berdasarkan total sholawat"
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Sholawat</span>
              </button>
              <button
                type="button"
                id="btn-sort-reports"
                onClick={() => setSortBy('reports')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  sortBy === 'reports'
                    ? 'bg-slate-600 text-white shadow-xs font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Peringkat berdasarkan banyaknya laporan"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Banyak Laporan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Primary Scope Tabs: Rank Bulanan vs Rank Global */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/10">
          <div className="inline-flex p-1 bg-white/15 rounded-xl text-xs font-bold w-fit">
            <button
              type="button"
              id="tab-rank-bulanan"
              onClick={() => setRankScope('monthly')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                rankScope === 'monthly'
                  ? 'bg-white text-emerald-950 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Rank Bulanan</span>
            </button>

            <button
              type="button"
              id="tab-rank-global"
              onClick={() => setRankScope('global')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                rankScope === 'global'
                  ? 'bg-white text-emerald-950 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Rank Global (Semua Waktu)</span>
            </button>
          </div>

          {/* Monthly dropdown filter if monthly scope is selected */}
          {rankScope === 'monthly' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-medium">Bulan:</span>
              <select
                id="select-rank-month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-400 cursor-pointer"
              >
                {availableMonths.map((m) => (
                  <option key={m.key} value={m.key} className="bg-slate-900 text-white">
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Scope summary banner */}
      <div className="px-6 py-3 bg-emerald-50/70 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-900">
        <div className="flex items-center gap-2">
          <Medal className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="font-semibold">
            {rankScope === 'monthly'
              ? `Peringkat Periode: ${selectedMonthLabel}`
              : 'Peringkat Global (Akumulasi Progres Seluruh Waktu)'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-700 font-medium">
          <span className="inline-flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
            Total Ayat: <strong className="text-emerald-800 font-bold">{scopeTotalVerses.toLocaleString('id-ID')}</strong> ayat (~{scopeTotalJuz} Juz)
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />
            Total Sholawat: <strong className="text-amber-800 font-bold">{scopeTotalSholawat.toLocaleString('id-ID')}</strong> kali
          </span>
          <span>•</span>
          <span>
            Total Laporan: <strong className="text-slate-900 font-bold">{scopeTotalReports}</strong>
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="input-search-leaderboard"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama anggota..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {sortedList.length} anggota aktif
        </span>
      </div>

      {/* Top 3 Podium Highlights */}
      {sortedList.length >= 3 && !searchQuery && (
        <div className="p-6 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rank 2 (Silver) */}
          <div
            onClick={() => onSelectMember && onSelectMember(sortedList[1].name)}
            className="order-2 md:order-1 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3 cursor-pointer hover:border-slate-300 transition-all"
          >
            <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-black text-xl border-2 border-slate-300 shrink-0">
              🥈
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-600 block">
                {rankScope === 'monthly' ? 'Peringkat 2 Bulan Ini' : 'Peringkat 2 Global'}
              </span>
              <div className="font-bold text-slate-900 text-sm truncate">{sortedList[1].name}</div>
              <div className="text-xs text-emerald-800 font-bold mt-0.5">
                {sortedList[1].totalVerses.toLocaleString('id-ID')} Ayat (~{sortedList[1].estimatedJuz} Juz)
              </div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                {sortedList[1].lastPosition !== '-' ? sortedList[1].lastPosition : `${sortedList[1].tilawahCount} Lap.`} • {sortedList[1].totalSholawat.toLocaleString('id-ID')} Sholawat
              </div>
            </div>
          </div>

          {/* Rank 1 (Gold) */}
          <div
            onClick={() => onSelectMember && onSelectMember(sortedList[0].name)}
            className="order-1 md:order-2 bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 rounded-xl border-2 border-amber-300 shadow-sm flex items-center gap-3 cursor-pointer hover:border-amber-400 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-amber-500/30 shrink-0">
              🥇
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-800 block">
                {rankScope === 'monthly' ? 'Juara 1 Bulan Ini' : 'Juara 1 Global'}
              </span>
              <div className="font-extrabold text-slate-900 text-base truncate">
                {sortedList[0].name}
              </div>
              <div className="text-xs font-bold text-emerald-900 mt-0.5">
                {sortedList[0].totalVerses.toLocaleString('id-ID')} Ayat Dibaca (~{sortedList[0].estimatedJuz} Juz)
              </div>
              <div className="text-[11px] text-amber-900 font-medium truncate mt-0.5">
                {sortedList[0].lastPosition !== '-' ? sortedList[0].lastPosition : `${sortedList[0].tilawahCount} Laporan`} • {sortedList[0].totalSholawat.toLocaleString('id-ID')} Sholawat
              </div>
            </div>
          </div>

          {/* Rank 3 (Bronze) */}
          <div
            onClick={() => onSelectMember && onSelectMember(sortedList[2].name)}
            className="order-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3 cursor-pointer hover:border-slate-300 transition-all"
          >
            <div className="w-11 h-11 rounded-full bg-orange-50 text-orange-800 flex items-center justify-center font-black text-xl border-2 border-orange-200 shrink-0">
              🥉
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-bold text-orange-800 block">
                {rankScope === 'monthly' ? 'Peringkat 3 Bulan Ini' : 'Peringkat 3 Global'}
              </span>
              <div className="font-bold text-slate-900 text-sm truncate">{sortedList[2].name}</div>
              <div className="text-xs text-emerald-800 font-bold mt-0.5">
                {sortedList[2].totalVerses.toLocaleString('id-ID')} Ayat (~{sortedList[2].estimatedJuz} Juz)
              </div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                {sortedList[2].lastPosition !== '-' ? sortedList[2].lastPosition : `${sortedList[2].tilawahCount} Lap.`} • {sortedList[2].totalSholawat.toLocaleString('id-ID')} Sholawat
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {sortedList.length === 0 && (
        <div className="p-8 text-center text-slate-500 text-sm">
          Tidak ada data laporan tilawah atau sholawat pada periode ini.
        </div>
      )}

      {/* Full Leaderboard List */}
      <div className="divide-y divide-slate-100">
        {sortedList.map((member, idx) => {
          const rank = idx + 1;
          const pct =
            sortBy === 'verses'
              ? Math.round((member.totalVerses / maxVerses) * 100)
              : sortBy === 'sholawat'
              ? Math.round((member.totalSholawat / maxSholawat) * 100)
              : Math.round((member.tilawahCount / maxReports) * 100);

          return (
            <div
              key={member.name}
              id={`leaderboard-item-${idx}`}
              onClick={() => onSelectMember && onSelectMember(member.name)}
              className="p-4 hover:bg-slate-50/80 transition-colors flex items-center gap-4 cursor-pointer"
            >
              {/* Rank number badge */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                  rank === 1
                    ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-300'
                    : rank === 2
                    ? 'bg-slate-200 text-slate-800 ring-2 ring-slate-300'
                    : rank === 3
                    ? 'bg-orange-100 text-orange-800 ring-2 ring-orange-300'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {rank}
              </div>

              {/* Member details & progress */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm truncate">
                      {member.name}
                    </span>
                    {member.lastPosition && member.lastPosition !== '-' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-semibold">
                        <BookmarkCheck className="w-3 h-3" />
                        {member.lastPosition}
                      </span>
                    )}
                  </div>

                  {/* Metrics Badges */}
                  <div className="flex items-center gap-3 text-xs shrink-0">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                      <strong>{member.totalVerses.toLocaleString('id-ID')}</strong> Ayat
                      <span className="text-[10px] font-normal text-emerald-600">
                        (~{member.estimatedJuz} Juz)
                      </span>
                    </span>

                    <span className="text-amber-800 font-semibold inline-flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                      <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />
                      <strong>{member.totalSholawat.toLocaleString('id-ID')}</strong>
                    </span>

                    <span className="text-slate-500 hidden md:inline-flex items-center gap-1 text-[11px]">
                      {member.tilawahCount} laporan
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      sortBy === 'verses'
                        ? 'bg-emerald-600'
                        : sortBy === 'sholawat'
                        ? 'bg-amber-500'
                        : 'bg-slate-600'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>
                    Aktivitas terakhir: {member.lastActive}
                  </span>
                  <span className="hidden sm:inline">
                    Estimasi: ~{member.estimatedPages} halaman mushaf
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
