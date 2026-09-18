import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { Navbar } from './components/Navbar';
import { SubmissionForm } from './components/SubmissionForm';
import { DashboardStats } from './components/DashboardStats';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { MemberLeaderboard } from './components/MemberLeaderboard';
import { LiveDataTable } from './components/LiveDataTable';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from './services/auth';
import {
  fetchSheetData,
  submitLaporan,
  computeDashboardMetrics,
} from './services/sheetsService';
import type { SheetRow, SubmissionData, DashboardMetrics } from './types';
import { FORM_VIEW_URL } from './data/quranData';
import {
  ExternalLink,
  BookOpen,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'stats' | 'leaderboard'>('form');
  const [user, setUser] = useState<User | null>(null);
  const [hasGoogleToken, setHasGoogleToken] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const [rows, setRows] = useState<SheetRow[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string | undefined>(undefined);

  // Initialize Firebase Auth & token listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setHasGoogleToken(!!token);
      },
      () => {
        setUser(null);
        setHasGoogleToken(false);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setHasGoogleToken(!!res.accessToken);
        // Refresh data with authorized credentials
        loadData(false);
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setHasGoogleToken(false);
  };

  // Load sheet data
  const loadData = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoadingData(true);
    else setIsRefreshing(true);

    try {
      const data = await fetchSheetData();
      setRows(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load Google Sheets data:', err);
    } finally {
      setIsLoadingData(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Real-time synchronization interval (every 25 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      // Only refresh if tab is active
      if (document.visibilityState === 'visible' && !isSubmitting) {
        loadData(false);
      }
    }, 25000);

    return () => clearInterval(interval);
  }, [loadData, isSubmitting]);

  // Form submission handler
  const handleFormSubmit = async (data: SubmissionData) => {
    setIsSubmitting(true);
    try {
      await submitLaporan(data);

      // Optimistic instant UI update
      const now = new Date();
      const optimisticRow: SheetRow = {
        id: `optimistic-${Date.now()}`,
        timestamp: `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
        nama: data.nama,
        kegiatan: data.kegiatan,
        surat: data.surat,
        ayat: data.ayat,
        sholawat: Number(data.sholawat) || 0,
        catatanKecil: data.catatanKecil,
        rawDate: now,
      };

      setRows((prev) => [optimisticRow, ...prev]);

      // Re-fetch from Google Sheets after a short pause to ensure Google Form / Sheets has committed
      setTimeout(() => {
        loadData(false);
      }, 3000);
    } catch (err) {
      console.error('Error in handleFormSubmit:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const metrics: DashboardMetrics = computeDashboardMetrics(rows);

  const handleSelectMember = (name: string) => {
    setSelectedMemberFilter(name);
    setActiveTab('stats');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        isLoggingIn={isLoggingIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onRefresh={() => loadData(false)}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
        totalRecords={rows.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Tab 1: Formulir Setoran */}
        {activeTab === 'form' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <SubmissionForm
              onSubmit={handleFormSubmit}
              isSubmitting={isSubmitting}
              isConnectedWithGoogle={hasGoogleToken}
              recentSubmissions={rows}
            />
          </div>
        )}

        {/* Tab 2: Dashboard Statistik & Rekap Data Disatukan */}
        {activeTab === 'stats' && (
          <div className="space-y-8">
            {/* Metrik Statistik */}
            <DashboardStats metrics={metrics} />

            {/* Visualisasi Grafik Analitik */}
            <AnalyticsCharts metrics={metrics} />

            {/* Tabel Rekap Data Lengkap */}
            <div className="pt-2">
              <LiveDataTable
                rows={rows}
                isLoading={isLoadingData}
                selectedMember={selectedMemberFilter}
                onClearMemberFilter={() => setSelectedMemberFilter(undefined)}
              />
            </div>
          </div>
        )}

        {/* Tab 3: Leaderboard Penuh */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <MemberLeaderboard
              metrics={metrics}
              rows={rows}
              onSelectMember={handleSelectMember}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold text-slate-700">Rekap Tilawah &amp; Sholawat</span>
            <span>•</span>
            <span>Tersinkronisasi otomatis ({rows.length} entri)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a
              href={FORM_VIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-700 flex items-center gap-1 transition-colors"
            >
              <span>Google Form Asli</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
