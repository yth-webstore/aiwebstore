import React, { useState } from 'react';
import { Award, Trophy, HeartHandshake, BookOpen, Search } from 'lucide-react';
import type { DashboardMetrics } from '../types';

interface MemberLeaderboardProps {
  metrics: DashboardMetrics;
  onSelectMember?: (name: string) => void;
}

export const MemberLeaderboard: React.FC<MemberLeaderboardProps> = ({
  metrics,
  onSelectMember,
}) => {
  const [sortBy, setSortBy] = useState<'tilawah' | 'sholawat'>('tilawah');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const sortedList = [...metrics.memberContributions]
    .sort((a, b) =>
      sortBy === 'tilawah'
        ? b.tilawahCount - a.tilawahCount || b.totalSholawat - a.totalSholawat
        : b.totalSholawat - a.totalSholawat || b.tilawahCount - a.tilawahCount
    )
    .filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const maxTilawah = Math.max(...metrics.memberContributions.map((m) => m.tilawahCount), 1);
  const maxSholawat = Math.max(...metrics.memberContributions.map((m) => m.totalSholawat), 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              Papan Peringkat &amp; Kontribusi Anggota
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Apresiasi istiqomah tilawah Al-Qur'an dan pengiriman sholawat
          </p>
        </div>

        {/* Sort Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 hidden sm:inline">Urutkan:</span>
          <div className="inline-flex p-1 bg-white/10 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSortBy('tilawah')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                sortBy === 'tilawah'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Setoran Tilawah
            </button>
            <button
              type="button"
              onClick={() => setSortBy('sholawat')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
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

      {/* Search Input */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama anggota..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {sortedList.length} anggota ditemukan
        </span>
      </div>

      {/* Top 3 Podium Highlights */}
      {sortedList.length >= 3 && !searchQuery && (
        <div className="p-6 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rank 2 (Silver) */}
          <div className="order-2 md:order-1 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-black text-lg border-2 border-slate-300">
              🥈
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-600 block">
                Peringkat 2
              </span>
              <div className="font-bold text-slate-900 text-sm truncate">{sortedList[1].name}</div>
              <div className="text-xs text-slate-600 mt-0.5">
                {sortBy === 'tilawah'
                  ? `${sortedList[1].tilawahCount} Laporan`
                  : `${sortedList[1].totalSholawat.toLocaleString('id-ID')} Sholawat`}
              </div>
            </div>
          </div>

          {/* Rank 1 (Gold) */}
          <div className="order-1 md:order-2 bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 rounded-xl border-2 border-amber-300 shadow-sm flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-amber-500/30">
              🥇
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-800 block">
                Juara 1
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
          <div className="order-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-800 flex items-center justify-center font-black text-lg border-2 border-orange-200">
              🥉
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-bold text-orange-800 block">
                Peringkat 3
              </span>
              <div className="font-bold text-slate-900 text-sm truncate">{sortedList[2].name}</div>
              <div className="text-xs text-slate-600 mt-0.5">
                {sortBy === 'tilawah'
                  ? `${sortedList[2].tilawahCount} Laporan`
                  : `${sortedList[2].totalSholawat.toLocaleString('id-ID')} Sholawat`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard List */}
      <div className="divide-y divide-slate-100">
        {sortedList.map((member, idx) => {
          const rank = idx + 1;
          const pct = sortBy === 'tilawah'
            ? Math.round((member.tilawahCount / maxTilawah) * 100)
            : Math.round((member.totalSholawat / maxSholawat) * 100);

          return (
            <div
              key={member.name}
              onClick={() => onSelectMember && onSelectMember(member.name)}
              className="p-4 hover:bg-slate-50/80 transition-colors flex items-center gap-4 cursor-pointer"
            >
              {/* Rank number badge */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                  rank === 1
                    ? 'bg-amber-100 text-amber-800'
                    : rank === 2
                    ? 'bg-slate-200 text-slate-800'
                    : rank === 3
                    ? 'bg-orange-100 text-orange-800'
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
