import React from 'react';
import {
  BookOpen,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  LogOut,
  Sparkles,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { FORM_VIEW_URL } from '../data/quranData';

interface NavbarProps {
  activeTab: 'form' | 'stats' | 'leaderboard';
  setActiveTab: (tab: 'form' | 'stats' | 'leaderboard') => void;
  user: User | null;
  isLoggingIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  totalRecords: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  isLoggingIn,
  onLogin,
  onLogout,
  onRefresh,
  isRefreshing,
  lastUpdated,
  totalRecords,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-4 py-2 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-700/80 text-emerald-200 border border-emerald-600/60 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Real-time Google Sheets Sync
            </span>
            <span className="hidden sm:inline text-emerald-100/80">
              • {totalRecords.toLocaleString('id-ID')} entri terdata
            </span>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-emerald-200/90 hidden md:inline">
                Update: {lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
            <button
              id="btn-refresh-data"
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700/60 hover:bg-emerald-700 text-emerald-100 transition-colors disabled:opacity-50"
              title="Perbarui data secara langsung sekarang"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline">Sinkronkan</span>
            </button>

            <a
              id="link-google-form-view"
              href={FORM_VIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-200 hover:text-white transition-colors"
              title="Buka Google Form Resmi"
            >
              <span className="hidden sm:inline">Google Form</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-none">
                Rekap Tilawah &amp; Sholawat
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Live Dashboard
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
              Pencatatan laporan tilawah, mustami', terjemah &amp; sholawat otomatis
            </p>
          </div>
        </div>

        {/* Right side: User profile if logged in */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 pl-2 pr-3 py-1 rounded-full text-xs">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-6 h-6 rounded-full object-cover border border-emerald-500"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px]">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <div className="font-semibold text-slate-800 leading-tight">
                  {user.displayName || user.email?.split('@')[0]}
                </div>
                <div className="text-[10px] text-emerald-700 flex items-center gap-1">
                  <CheckCircle className="w-2.5 h-2.5" />
                  Google OAuth Aktif
                </div>
              </div>
              <button
                id="btn-sign-out"
                type="button"
                onClick={onLogout}
                className="ml-1 p-1 text-slate-400 hover:text-rose-600 rounded-full hover:bg-slate-200/60 transition-colors"
                title="Keluar / Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex space-x-1 sm:space-x-2 border-t border-slate-100 pt-1 pb-2 overflow-x-auto scrollbar-none">
          <button
            id="tab-btn-form"
            type="button"
            onClick={() => setActiveTab('form')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === 'form'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Formulir Setoran
          </button>
          <button
            id="tab-btn-leaderboard"
            type="button"
            onClick={() => setActiveTab('leaderboard')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Papan Peringkat (Leaderboard)
          </button>
          <button
            id="tab-btn-stats"
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'stats'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Statistik &amp; Rekap Data</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
                activeTab === 'stats'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {totalRecords}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
};
