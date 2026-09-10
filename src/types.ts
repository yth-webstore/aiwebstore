export interface SubmissionData {
  nama: string;
  kegiatan: 'Tilawah' | "Mustami'" | 'Terjemah' | string;
  surat: string;
  ayat: string;
  sholawat: string | number;
  catatanKecil: string;
  timestamp?: string;
}

export interface SheetRow {
  id: string;
  timestamp: string;
  nama: string;
  kegiatan: string;
  surat: string;
  ayat: string;
  iqro?: string;
  halaman?: string;
  sholawat: number;
  catatanKecil: string;
  rawDate: Date;
}

export interface DashboardMetrics {
  totalSubmissions: number;
  totalSholawat: number;
  totalUniqueMembers: number;
  topSurah: { name: string; count: number };
  todaySubmissions: number;
  kegiatanCounts: Record<string, number>;
  memberContributions: { name: string; tilawahCount: number; totalSholawat: number; lastActive: string }[];
  dailyTrends: { date: string; displayDate: string; count: number; sholawat: number }[];
  surahRankings: { surah: string; count: number }[];
}
