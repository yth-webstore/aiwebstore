import React, { useState } from 'react';
import {
  BookOpen,
  Headphones,
  Languages,
  HeartHandshake,
  CheckCircle2,
  Sparkles,
  Search,
  Plus,
  ArrowRight,
  History,
  Send,
  Shuffle,
} from 'lucide-react';
import {
  DEFAULT_MEMBERS,
  SURAH_LIST,
  SHOLAWAT_PRESETS,
  KEGIATAN_OPTIONS,
} from '../data/quranData';
import type { SubmissionData, SheetRow } from '../types';
import { ConfirmationModal } from './ConfirmationModal';

interface SubmissionFormProps {
  onSubmit: (data: SubmissionData) => Promise<void>;
  isSubmitting: boolean;
  isConnectedWithGoogle: boolean;
  recentSubmissions: SheetRow[];
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({
  onSubmit,
  isSubmitting,
  isConnectedWithGoogle,
  recentSubmissions,
}) => {
  const [nama, setNama] = useState<string>('');
  const [customNama, setCustomNama] = useState<string>('');
  const [isCustomNama, setIsCustomNama] = useState<boolean>(false);
  const [searchMemberQuery, setSearchMemberQuery] = useState<string>('');

  const [kegiatan, setKegiatan] = useState<'Tilawah' | "Mustami'" | 'Terjemah'>('Tilawah');
  const [surat, setSurat] = useState<string>('1 Al-Fatihah');
  const [searchSurahQuery, setSearchSurahQuery] = useState<string>('');
  const [ayat, setAyat] = useState<string>('0');

  const [sholawat, setSholawat] = useState<number>(100);
  const [customSholawat, setCustomSholawat] = useState<string>('');
  const [isCustomSholawat, setIsCustomSholawat] = useState<boolean>(false);

  const [catatanKecil, setCatatanKecil] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successToast, setSuccessToast] = useState<boolean>(false);

  // Filtered members
  const filteredMembers = DEFAULT_MEMBERS.filter((m) =>
    m.toLowerCase().includes(searchMemberQuery.toLowerCase())
  );

  // Filtered surahs
  const filteredSurahs = SURAH_LIST.filter((s) =>
    s.toLowerCase().includes(searchSurahQuery.toLowerCase())
  );

  const effectiveNama = isCustomNama ? customNama.trim() : nama;
  const effectiveSholawat = isCustomSholawat
    ? Math.max(0, parseInt(customSholawat, 10) || 0)
    : sholawat;

  const quickAyatPresets = ['0', '1 - 10', '1 - 20', '1 - 50', 'Halaman 1', 'Khatam'];

  const quickDoaPresets = [
    'Semoga istiqomah, berkah, & diridhoi Allah 🤲',
    'Alhamdulillah tuntas target bacaan hari ini 📖✨',
    'Ya Allah jadikan Al-Qur\'an penyejuk hati & penerang jalan kehidupan 🤲',
    'Mohon doa restu untuk kelancaran hajat, rezeki barokah & kesehatan sekeluarga',
    'Semoga Allah limpahkan ketenangan batin, kemudahan urusan, dan ampunan dosa',
    'Alhamdulillah nikmat tilawah dan bersholawat bersama komunitas tercinta 💚',
    'Semoga syafaat Baginda Nabi Muhammad ﷺ senantiasa menyertai kita semua',
    'Doa tulus untuk saudara-saudari kita yang sedang diuji sakit maupun kesulitan 🤲',
    'Bismillah senantiasa didekatkan dengan Al-Qur\'an dan sholawat setiap waktu 🌿',
    'Alhamdulillah bertambah sejuk dan damai setelah menyapa ayat-ayat suci-Nya',
    'Semoga Allah kumpulkan kita bersama para ahlul Qur\'an di surga-Nya kelak 🤲',
    'Ya Rabb, bimbing kami agar selalu bersyukur dan giat beramal saleh ✨',
  ];

  const handleRandomCatatan = () => {
    const randomIndex = Math.floor(Math.random() * quickDoaPresets.length);
    setCatatanKecil(quickDoaPresets[randomIndex]);
  };

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!effectiveNama) {
      setErrorMsg('Silakan pilih atau masukkan Nama terlebih dahulu.');
      return;
    }
    if (!surat && kegiatan === 'Tilawah') {
      setErrorMsg('Silakan pilih Surat Al-Qur\'an.');
      return;
    }
    if (isCustomSholawat) {
      const parsed = parseInt(customSholawat.trim(), 10);
      if (isNaN(parsed) || parsed < 0) {
        setErrorMsg('Silakan masukkan angka jumlah sholawat yang valid (0 atau lebih).');
        return;
      }
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      await onSubmit({
        nama: effectiveNama,
        kegiatan,
        surat,
        ayat,
        sholawat: effectiveSholawat,
        catatanKecil,
      });

      setShowConfirmModal(false);
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 5000);

      // Reset partial fields but keep member if desired
      setAyat('0');
      setCatatanKecil('');
      setCustomSholawat('');
      setIsCustomSholawat(false);
      setSholawat(100);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengirim data. Silakan coba lagi.');
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Notification */}
      {successToast && (
        <div
          id="submission-success-banner"
          className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-emerald-950 text-sm">
                Alhamdulillah! Laporan Berhasil Dikirim
              </p>
              <p className="text-xs text-emerald-800">
                Data telah tersinkronisasi otomatis ke Google Sheets &amp; Google Form. Terima kasih atas istiqomahnya!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(false)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-950 px-2 py-1"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 px-6 py-6 text-white">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-emerald-200 text-xs font-semibold mb-2 border border-emerald-600/50">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Formulir Setoran Resmi
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Laporan Tilawah &amp; Sholawat
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl">
                Isi formulir berikut untuk mencatat progres bacaan Al-Qur'an dan sholawat harian Anda.
              </p>
            </div>
            <div className="hidden sm:block text-right text-xs text-emerald-200/90">
              <span className="block font-medium">Auto-Sync Google Sheets</span>
              <span className="text-[11px] text-emerald-300/80">Respons langsung tercatat</span>
            </div>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mx-6 mt-6 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleOpenConfirm} className="p-6 space-y-7">
          {/* Section 1: Nama */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span>1. Nama Anggota</span>
                <span className="text-rose-500">*</span>
              </label>
              <button
                id="btn-toggle-custom-name"
                type="button"
                onClick={() => {
                  setIsCustomNama(!isCustomNama);
                  setNama('');
                  setCustomNama('');
                }}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
              >
                {isCustomNama ? (
                  <>Pilih dari Daftar Anggota</>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Input Nama Lain / Tamu
                  </>
                )}
              </button>
            </div>

            {isCustomNama ? (
              <div>
                <input
                  id="input-custom-nama"
                  type="text"
                  value={customNama}
                  onChange={(e) => setCustomNama(e.target.value)}
                  placeholder="Ketik nama lengkap Anda..."
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden transition-all"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Nama ini akan dicatat ke kolom Nama di Google Sheets.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Search / Select box */}
                <div className="relative">
                  <select
                    id="select-member-nama"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm font-medium bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden appearance-none cursor-pointer"
                    required
                  >
                    <option value="" disabled>
                      -- Pilih Nama Anda ({DEFAULT_MEMBERS.length} Anggota Terdaftar) --
                    </option>
                    {filteredMembers.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-3 pointer-events-none text-slate-400">
                    ▼
                  </div>
                </div>

                {/* Quick select chips for recent submitters */}
                <div>
                  <span className="text-[11px] font-medium text-slate-500 block mb-1.5">
                    Pilihan Cepat Anggota:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {DEFAULT_MEMBERS.slice(0, 10).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setNama(m)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          nama === m
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Kegiatan */}
          <div className="space-y-2">
            <label htmlFor="select-kegiatan" className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <span>2. Jenis Kegiatan</span>
              <span className="text-rose-500">*</span>
            </label>
            <p className="text-xs text-slate-500">
              Pilih kegiatan tilawah (jika berhalangan bisa memilih Mendengarkan atau Membaca Terjemah)
            </p>
            <div className="relative">
              <select
                id="select-kegiatan"
                value={kegiatan}
                onChange={(e) => setKegiatan(e.target.value as any)}
                className="w-full px-4 py-2.5 text-sm font-medium bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden appearance-none cursor-pointer"
                required
              >
                <option value="Tilawah">1. Tilawah - Membaca Al-Qur'an</option>
                <option value="Mustami'">2. Mustami' - Mendengarkan Lantunan (bisa untuk yang berhalangan)</option>
                <option value="Terjemah">3. Terjemah - Membaca Terjemah (bisa untuk yang berhalangan)</option>
              </select>
              <div className="absolute right-3.5 top-3 pointer-events-none text-slate-400">
                ▼
              </div>
            </div>
          </div>

          {/* Section 3: Surat & Ayat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Surat */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span>3. Surat Al-Qur'an</span>
                <span className="text-rose-500">*</span>
              </label>
              <p className="text-[11px] text-slate-500">
                Pilih salah satu surat yang sedang dibaca / didengarkan
              </p>

              {/* Quick filter surahs */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchSurahQuery}
                  onChange={(e) => setSearchSurahQuery(e.target.value)}
                  placeholder="Cari surat... (cth: Baqarah, Yasin, Kahfi)"
                  className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mb-1.5 focus:bg-white focus:outline-hidden"
                />
              </div>

              <select
                id="select-surat"
                value={surat}
                onChange={(e) => setSurat(e.target.value)}
                className="w-full px-3 py-2 text-sm font-medium bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
                required
              >
                {filteredSurahs.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {/* Popular surahs pills */}
              <div className="flex flex-wrap gap-1 pt-1">
                {['2 Al-Baqarah', '18 Al-Kahfi', '36 Yasin', '67 Al-Mulk', '56 Al-Waqi\'ah'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSurat(s)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 transition-colors"
                  >
                    {s.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* Ayat */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span>4. Nomor Ayat</span>
              </label>
              <p className="text-[11px] text-slate-500">
                Nomor ayat terakhir yang dibaca (cth: 0, 1-10, 25, 141)
              </p>
              <input
                id="input-ayat"
                type="text"
                value={ayat}
                onChange={(e) => setAyat(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden transition-all"
              />

              {/* Quick Ayat Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {quickAyatPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAyat(preset)}
                    className="text-[10px] px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Sholawat */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-amber-600" />
                <span>5. Kirim Sholawat</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                {effectiveSholawat.toLocaleString('id-ID')} kali
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Sudah berapa kali kirim sholawat pada hari ini? Pilih jumlah standar atau klik &quot;Input Jumlah Lain&quot;.
            </p>

            {/* Grid of standard presets + custom toggle */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {SHOLAWAT_PRESETS.map((preset) => {
                const isSelected = !isCustomSholawat && sholawat === preset;
                return (
                  <button
                    key={preset}
                    id={`btn-sholawat-${preset}`}
                    type="button"
                    onClick={() => {
                      setIsCustomSholawat(false);
                      setSholawat(preset);
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-center font-bold text-base transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-xs ring-2 ring-amber-400'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{preset.toLocaleString('id-ID')}</span>
                    <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                      kali
                    </span>
                  </button>
                );
              })}

              {/* 5th button: Input Jumlah Lain */}
              <button
                id="btn-toggle-custom-sholawat"
                type="button"
                onClick={() => {
                  setIsCustomSholawat(true);
                  if (!customSholawat) {
                    setCustomSholawat(sholawat > 0 ? sholawat.toString() : '100');
                  }
                }}
                className={`py-2.5 px-3 rounded-xl border text-center font-bold text-sm transition-all cursor-pointer flex flex-col items-center justify-center ${
                  isCustomSholawat
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs ring-2 ring-emerald-500'
                    : 'border-dashed border-slate-300 bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span>Input Jumlah Lain</span>
                <span className="text-[10px] font-normal text-slate-500 mt-0.5">
                  {isCustomSholawat && customSholawat ? `${customSholawat} kali` : 'Ketik angka'}
                </span>
              </button>
            </div>

            {/* Custom sholawat input card when custom is selected */}
            {isCustomSholawat && (
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2.5 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="input-custom-sholawat" className="text-xs font-bold text-emerald-950">
                    Masukkan Jumlah Sholawat (Bebas / Lainnya):
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomSholawat(false)}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 underline font-medium cursor-pointer"
                  >
                    Kembali ke Pilihan Standar
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="input-custom-sholawat"
                    type="number"
                    min="0"
                    step="1"
                    value={customSholawat}
                    onChange={(e) => setCustomSholawat(e.target.value)}
                    placeholder="Contoh: 25, 33, 70, 300, 1500..."
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-semibold text-slate-900"
                    autoFocus
                  />
                  <span className="text-xs font-bold text-slate-700 shrink-0">kali</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Catatan Kecil / Do'a */}
          <div className="space-y-2.5">
            <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <span>6. Catatan Kecil / Do'a Singkat</span>
              <span className="text-xs font-normal text-slate-500">(Opsional)</span>
            </label>

            {/* Pilihan random posisi tepat di bawah judul */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
              <p className="text-xs text-slate-500">
                Boleh sisipkan kritik, saran, nasihat, atau do&apos;a singkat ❤️
              </p>
              <button
                id="btn-random-catatan"
                type="button"
                onClick={handleRandomCatatan}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition-all cursor-pointer active:scale-95 shadow-xs shrink-0 self-start sm:self-auto"
                title="Pilih do'a / catatan secara acak"
              >
                <Shuffle className="w-3.5 h-3.5 text-emerald-700" />
                <span>Pilihan Random</span>
              </button>
            </div>

            <textarea
              id="textarea-catatan"
              rows={3}
              value={catatanKecil}
              onChange={(e) => setCatatanKecil(e.target.value)}
              placeholder="Tuliskan do'a, pesan penyemangat, atau catatan kecil..."
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden transition-all resize-none"
            />

            {/* Quick Doa chips */}
            <div className="flex flex-wrap gap-1.5 pt-1 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
              {quickDoaPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setCatatanKecil(preset)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border text-left transition-colors cursor-pointer ${
                    catatanKecil === preset
                      ? 'bg-emerald-600 text-white border-emerald-600 font-medium shadow-xs'
                      : 'bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100 border-emerald-100'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Tersambung ke Google Sheets resmi secara real-time
            </div>

            <button
              id="btn-submit-form"
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:scale-[0.98] rounded-xl shadow-md shadow-emerald-700/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Laporan Tilawah</span>
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        data={{
          nama: effectiveNama,
          kegiatan,
          surat,
          ayat,
          sholawat: effectiveSholawat,
          catatanKecil,
        }}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowConfirmModal(false)}
        isConnectedWithGoogle={isConnectedWithGoogle}
      />

      {/* Recent Submissions Feed Preview (5 input terakhir) */}
      {recentSubmissions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-slate-900 text-sm">
                Setoran Terakhir yang Baru Masuk (5 Entri Terbaru)
              </h3>
            </div>
            <span className="text-xs text-slate-500">Live dari Google Sheets</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
            {recentSubmissions.slice(0, 5).map((sub, idx) => {
              const kegBadge =
                sub.kegiatan === 'Tilawah'
                  ? 'bg-emerald-100 text-emerald-800'
                  : sub.kegiatan === "Mustami'"
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-amber-100 text-amber-800';

              return (
                <div
                  key={`${sub.id || idx}-${sub.timestamp}`}
                  className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs hover:bg-slate-50/70 px-2 rounded-lg transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-900">{sub.nama}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${kegBadge}`}>
                        {sub.kegiatan}
                      </span>
                      <span className="text-slate-700 font-medium">
                        {sub.surat} {sub.ayat ? `(${sub.ayat})` : ''}
                      </span>
                    </div>
                    {sub.catatanKecil && (
                      <p className="text-[11px] text-slate-500 italic truncate mt-0.5 ml-6.5 max-w-md">
                        "{sub.catatanKecil}"
                      </p>
                    )}
                  </div>
                  <div className="text-left sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-0 ml-6.5 sm:ml-0">
                    <span className="font-semibold text-amber-700 text-xs">
                      {sub.sholawat.toLocaleString('id-ID')} sholawat
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{sub.timestamp}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
