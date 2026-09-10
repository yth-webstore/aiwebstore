import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  MessageSquareQuote,
  FileSpreadsheet,
} from 'lucide-react';
import type { SheetRow } from '../types';

interface LiveDataTableProps {
  rows: SheetRow[];
  isLoading: boolean;
  selectedMember?: string;
  onClearMemberFilter?: () => void;
}

export const LiveDataTable: React.FC<LiveDataTableProps> = ({
  rows,
  isLoading,
  selectedMember,
  onClearMemberFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [kegiatanFilter, setKegiatanFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest_sholawat'>('newest');

  // Filter & Search Logic
  const filteredRows = useMemo(() => {
    return rows
      .filter((row) => {
        if (selectedMember && row.nama.toLowerCase() !== selectedMember.toLowerCase()) {
          return false;
        }

        if (kegiatanFilter !== 'all' && row.kegiatan !== kegiatanFilter) {
          return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = row.nama.toLowerCase().includes(q);
          const matchSurat = row.surat.toLowerCase().includes(q);
          const matchAyat = row.ayat.toLowerCase().includes(q);
          const matchCatatan = row.catatanKecil.toLowerCase().includes(q);
          if (!matchName && !matchSurat && !matchAyat && !matchCatatan) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'highest_sholawat') {
          return b.sholawat - a.sholawat;
        }
        if (sortOrder === 'oldest') {
          return a.rawDate.getTime() - b.rawDate.getTime();
        }
        // newest
        return b.rawDate.getTime() - a.rawDate.getTime();
      });
  }, [rows, selectedMember, kegiatanFilter, searchQuery, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const pagedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // CSV Export handler
  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Nama', 'Kegiatan', 'Surat', 'Ayat', 'Sholawat', 'Catatan kecil'];
    const csvLines = [headers.join(',')];

    filteredRows.forEach((r) => {
      const line = [
        `"${r.timestamp}"`,
        `"${r.nama.replace(/"/g, '""')}"`,
        `"${r.kegiatan.replace(/"/g, '""')}"`,
        `"${r.surat.replace(/"/g, '""')}"`,
        `"${r.ayat.replace(/"/g, '""')}"`,
        r.sholawat,
        `"${r.catatanKecil.replace(/"/g, '""')}"`,
      ];
      csvLines.push(line.join(','));
    });

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rekap_tilawah_sholawat_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-200 bg-slate-50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
              <span>Rekap Data Real-Time Google Sheets</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan {filteredRows.length.toLocaleString('id-ID')} dari {rows.length.toLocaleString('id-ID')} baris data
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-export-csv"
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>

        {/* Selected member filter pill if active */}
        {selectedMember && (
          <div className="flex items-center gap-2 text-xs bg-emerald-100 text-emerald-900 px-3 py-1.5 rounded-xl">
            <span>Menyaring khusus anggota: <strong>{selectedMember}</strong></span>
            <button
              type="button"
              onClick={onClearMemberFilter}
              className="ml-auto font-bold hover:text-emerald-950 underline"
            >
              Hapus Saringan
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="input-search-table"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama, surat, ayat, do'a..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Kegiatan Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              id="select-filter-kegiatan"
              value={kegiatanFilter}
              onChange={(e) => {
                setKegiatanFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Kegiatan</option>
              <option value="Tilawah">Tilawah (Membaca)</option>
              <option value="Mustami'">Mustami' (Mendengar)</option>
              <option value="Terjemah">Terjemah</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex items-center gap-2">
            <select
              id="select-sort-order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="newest">Waktu: Paling Baru</option>
              <option value="oldest">Waktu: Paling Lama</option>
              <option value="highest_sholawat">Sholawat Terbanyak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-4 py-3">Waktu Input</th>
              <th className="px-4 py-3">Nama Anggota</th>
              <th className="px-4 py-3">Kegiatan</th>
              <th className="px-4 py-3">Surat</th>
              <th className="px-4 py-3">Ayat</th>
              <th className="px-4 py-3 text-right">Sholawat</th>
              <th className="px-4 py-3">Catatan / Do'a</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-slate-300 border-t-emerald-600 rounded-full animate-spin" />
                    <span>Memuat data dari Google Sheets...</span>
                  </div>
                </td>
              </tr>
            ) : pagedRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  Tidak ada data yang sesuai dengan saringan
                </td>
              </tr>
            ) : (
              pagedRows.map((row) => {
                const kegBadge =
                  row.kegiatan === 'Tilawah'
                    ? 'bg-emerald-100 text-emerald-800'
                    : row.kegiatan === "Mustami'"
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800';

                return (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {row.timestamp}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-900">
                      {row.nama}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${kegBadge}`}>
                        {row.kegiatan}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {row.surat}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.ayat || '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-amber-700 whitespace-nowrap">
                      {row.sholawat.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 max-w-xs text-slate-600 italic">
                      {row.catatanKecil ? (
                        <span className="flex items-center gap-1">
                          <MessageSquareQuote className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{row.catatanKecil}</span>
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>Tampilkan per halaman:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-slate-400">|</span>
          <span>
            Halaman {currentPage} dari {totalPages}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2.5 py-1 font-semibold text-slate-800">
            {currentPage}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
