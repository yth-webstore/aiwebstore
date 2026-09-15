import React, { useState, useMemo } from 'react';
import { Trophy, HeartHandshake, BookOpen, Search, Calendar, Globe, Medal } from 'lucide-react';
import type { DashboardMetrics, SheetRow } from '../types';

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
  const [sortBy, setSortBy] = useState<'tilawah' | 'sholawat'>('tilawah');
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

  // Aggregate member contributions based on chosen scope
  const activeContributions = useMemo(() => {
    if (rankScope === 'global') {
      if (!rows || rows.length === 0) {
        return metrics.memberContributions;
      }
      const map: Record<
        string,
        { name: string; tilawahCount: number; totalSholawat: number; lastActive: string; lastDate: Date }
      > = {};
      rows.forEach((r) => {
        if (!map[r.nama]) {
          map[r.nama] = {
            name: r.nama,
            tilawahCount: 0,
            totalSholawat: 0,
            lastActive: r.timestamp,
            lastDate: r.rawDate,
          };
        }
        map[r.nama].tilawahCount += 1;
        map[r.nama].totalSholawat += r.sholawat || 0;
        if (r.rawDate > map[r.nama].lastDate) {
          map[r.nama].lastDate = r.rawDate;
          map[r.nama].lastActive = r.timestamp;
        }
      });
      return Object.values(map);
    } else {
      // Monthly scope
      if (!rows || rows.length === 0) {
        return metrics.memberContributions;
      }
      const map: Record<
        string,
        { name: string; tilawahCount: number; totalSholawat: number; lastActive: string; lastDate: Date }
      > = {};

      rows.forEach((r) => {
        if (r.rawDate && !isNaN(r.rawDate.getTime())) {
          const rowYear = r.rawDate.getFullYear();
          const rowMonth = String(r.rawDate.getMonth() + 1).padStart(2, '0');
          const rowMonthKey = `${rowYear}-${rowMonth}`;

          if (rowMonthKey === selectedMonth) {
            if (!map[r.nama]) {
              map[r.nama] = {
                name: r.nama,
                tilawahCount: 0,
                totalSholawat: 0,
                lastActive: r.timestamp,
                lastDate: r.rawDate,
              };
            }
            map[r.nama].tilawahCount += 1;
            map[r.nama].totalSholawat += r.sholawat || 0;
            if (r.rawDate > map[r.nama].lastDate) {
              map[r.nama].lastDate = r.rawDate;
              map[r.nama].lastActive = r.timestamp;
            }
          }
        }
      });
      return Object.values(map);
    }
  }, [rankScope, selectedMonth, rows, metrics.memberContributions]);

  const sortedList = useMemo(() => {
    return [...activeContributions]
      .sort((a, b) =>
        sortBy === 'tilawah'
          ? b.tilawahCount - a.tilawahCount || b.totalSholawat - a.totalSholawat
          : b.totalSholawat - a.totalSholawat || b.tilawahCount - a.tilawahCount
      )
      .filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [activeContributions, sortBy, searchQuery]);

  const maxTilawah = Math.max(...activeContributions.map((m) => m.tilawahCount), 1);
  const maxSholawat = Math.max(...activeContributions.map((m) => m.totalSholawat), 1);

  // Totals for the current scope
  const scopeTotalTilawah = activeContributions.reduce((acc, m) => acc + m.tilawahCount, 0);
  const scopeTotalSholawat = activeContributions.reduce((acc, m) => acc + m.totalSholawat, 0);

  const selectedMonthLabel =
    availableMonths.find((m) => m.key === selectedMonth)?.label || selectedMonth;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                Papan Peringkat &amp; Kontribusi Anggota
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Apresiasi istiqomah tilawah Al-Qur&apos;an dan pengiriman sholawat
            </p>
          </div>

          {/* Sort Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 hidden sm:inline font-medium">Urutkan:</span>
            <div className="inline-flex p-1 bg-white/10 rounded-xl text-xs font-semibold backdrop-blur-xs">
              <button
                type="button"
                id="btn-sort-tilawah"
                onClick={() => setSortBy('tilawah')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  sortBy === 'tilawah'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Setoran Tilawah
              </button>
              <button
                type="button"
                id="btn-sort-sholawat"
                onClick={() => setSortBy('sholawat')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  sortBy === 'sholawat'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Total Sholawat
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
      <div className="px-6 py-2.5 bg-emerald-50/70 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-900">
        <div className="flex items-center gap-2">
          <Medal className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="font-semibold">
            {rankScope === 'monthly'
              ? `Peringkat Bulan: ${selectedMonthLabel}`
              : 'Peringkat Global (Akumulasi Semua Waktu)'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-600">
          <span>
            Total Tilawah: <strong className="text-emerald-800">{scopeTotalTilawah}</strong> laporan
          </span>
          <span>•</span>
          <span>
            Total Sholawat:{' '}
            <strong className="text-amber-700">{scopeTotalSholawat.toLocaleString('id-ID')}</strong> kali
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
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-black text-lg border-2 border-slate-300 shrink-0">
              🥈
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-600 block">
                {rankScope === 'monthly' ? 'Peringkat 2 Bulan Ini' : 'Peringkat 2 Global'}
              </span>
              <div className="font-bold text-slate-900 text-sm truncate">{sortedList[1].name}</div>
              <div className="text-xs text-slate-600 mt-0.5 font-medium">
                {sortBy === 'tilawah'
                  ? `${sortedList[1].tilawahCount} Laporan`
                  : `${sortedList[1].totalSholawat.toLocaleString('id-ID')} Sholawat`}
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
              <div className="text-xs font-semibold text-amber-900 mt-0.5">
                {sortBy === 'tilawah'
                  ? `${sortedList[0].tilawahCount} Laporan Tilawah`
                  : `${sortedList[0].totalSholawat.toLocaleString('id-ID')} Sholawat`}
              </div>
            </div>
          </div>

          {/* Rank 3 (Bronze) */}
          <div
            onClick={() => onSelectMember && onSelectMember(sortedList[2].name)}
            className="order-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3 cursor-pointer hover:border-slate-300 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-800 flex items-center justify-center font-black text-lg border-2 border-orange-200 shrink-0">
              🥉
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-bold text-orange-800 block">
                {rankScope === 'monthly' ? 'Peringkat 3 Bulan Ini' : 'Peringkat 3 Global'}
              </span>
              <div className="font-bold text-slate-900 text-sm truncate">{sortedList[2].name}</div>
              <div className="text-xs text-slate-600 mt-0.5 font-medium">
                {sortBy === 'tilawah'
                  ? `${sortedList[2].tilawahCount} Laporan`
                  : `${sortedList[2].totalSholawat.toLocaleString('id-ID')} Sholawat`}
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
            sortBy === 'tilawah'
              ? Math.round((member.tilawahCount / maxTilawah) * 100)
              : Math.round((member.totalSholawat / maxSholawat) * 100);

          return (
            <div
              key={member.name}
              id={`leaderboard-item-${idx}`}
              onClick={() => onSelectMember && onSelectMember(member.name)}
              className="p-4 hover:bg-slate-50/80 transition-colors flex items-center gap-4 cursor-pointer"
            >
              {/* Rank number badge */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
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
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-sm truncate">
                    {member.name}
                  </span>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-slate-600 inline-flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                      <strong>{member.tilawahCount}</strong> lap.
                    </span>
                    <span className="text-amber-800 font-semibold inline-flex items-center gap-1">
                      <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />
                      <strong>{member.totalSholawat.toLocaleString('id-ID')}</strong>
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      sortBy === 'tilawah' ? 'bg-emerald-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <span className="text-[10px] text-slate-400 mt-1 block">
                  Aktivitas terakhir: {member.lastActive}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
