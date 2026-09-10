import React from 'react';
import { Send, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { SubmissionData } from '../types';

interface ConfirmationModalProps {
  isOpen: boolean;
  data: SubmissionData;
  isSubmitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isConnectedWithGoogle: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  data,
  isSubmitting,
  onConfirm,
  onCancel,
  isConnectedWithGoogle,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="confirmation-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
    >
      <div
        id="confirmation-modal-content"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/10 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h3 className="font-semibold text-lg tracking-tight">Konfirmasi Setoran Laporan</h3>
                <p className="text-xs text-emerald-100/90">Data akan dicatat otomatis ke Google Sheets</p>
              </div>
            </div>
            <button
              id="btn-close-confirm-modal"
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content details */}
        <div className="p-6 space-y-4 text-sm text-slate-700">
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3.5 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 leading-relaxed">
              {isConnectedWithGoogle ? (
                <span>
                  Akun Google Anda terhubung. Data akan disinkronkan ke <strong>Google Sheets</strong> dan{' '}
                  <strong>Google Form</strong> secara real-time.
                </span>
              ) : (
                <span>
                  Data akan otomatis dikirimkan ke <strong>Google Form</strong> &amp; <strong>Google Sheets</strong>{' '}
                  rekap tilawah.
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-xs text-slate-500 block uppercase font-medium tracking-wider">Nama</span>
              <span className="font-semibold text-slate-900 text-base">{data.nama}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block uppercase font-medium tracking-wider">Kegiatan</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                {data.kegiatan}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block uppercase font-medium tracking-wider">Surat</span>
              <span className="font-medium text-slate-900">{data.surat || '-'}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block uppercase font-medium tracking-wider">Ayat Terakhir</span>
              <span className="font-medium text-slate-900">{data.ayat || '-'}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block uppercase font-medium tracking-wider">Sholawat</span>
              <span className="font-semibold text-amber-700 text-base">{Number(data.sholawat).toLocaleString('id-ID')} kali</span>
            </div>
            <div className="col-span-2 pt-2 border-t border-slate-200">
              <span className="text-xs text-slate-500 block uppercase font-medium tracking-wider">Catatan / Do'a</span>
              <p className="text-slate-800 italic text-xs mt-0.5 line-clamp-2">
                {data.catatanKecil ? `"${data.catatanKecil}"` : 'Tidak ada catatan'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            id="btn-cancel-submission"
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Batal &amp; Edit
          </button>
          <button
            id="btn-confirm-and-send"
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-md shadow-emerald-700/20 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Menyimpan ke Sheets...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Kirim Setoran Sekarang</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
