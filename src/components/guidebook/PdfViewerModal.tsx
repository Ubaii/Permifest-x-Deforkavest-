'use client';

import React, { useEffect, useState } from 'react';
import { Guidebook } from '@/lib/types';
import {
  X,
  DownloadSimple,
  ArrowSquareOut,
  FilePdf,
  WarningCircle,
  ArrowsOut,
  ArrowsIn,
} from '@phosphor-icons/react';

interface PdfViewerModalProps {
  guidebook: Guidebook | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PdfViewerModal({ guidebook, isOpen, onClose }: PdfViewerModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Tangani tombol ESC untuk menutup modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      setIsFullscreen(false);
      setLoadError(false);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !guidebook) return null;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'PDF';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-viewer-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#0B0720]/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full flex flex-col rounded-3xl bg-[#140D33] border-2 border-[#2E2266] shadow-[6px_6px_0px_#0B0720,10px_10px_0px_#9B6BF2] overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'h-[96vh] max-w-[98vw]'
            : 'h-[88vh] max-w-5xl'
        }`}
      >
        {/* ── Modal Header: Pop-Art Theme & Quick Actions ── */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#2E2266] bg-[#0E0927] select-none gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#9B6BF2]/20 border border-[#9B6BF2]/40 flex items-center justify-center text-[#9B6BF2] shrink-0">
              <FilePdf size={22} weight="duotone" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#FFE359] text-[#0B0720] shadow-sm -rotate-1">
                  {guidebook.version}
                </span>
                <span className="text-[11px] font-mono text-[#A99FD1]">
                  {formatFileSize(guidebook.file_size_bytes)}
                </span>
              </div>
              <h2
                id="pdf-viewer-title"
                className="font-[family-name:var(--font-bricolage)] font-extrabold text-sm sm:text-base text-[#F5F2FF] truncate mt-0.5"
                title={guidebook.title}
              >
                {guidebook.title}
              </h2>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Toggle Fullscreen button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold text-[#A99FD1] hover:text-[#F5F2FF] bg-[#140D33] border border-[#2E2266] hover:border-[#9B6BF2] hover:bg-[#1E134D] transition-all min-h-[40px] min-w-[40px] flex items-center justify-center gap-1.5 cursor-pointer"
              title={isFullscreen ? 'Perkecil Tampilan' : 'Layar Penuh'}
            >
              {isFullscreen ? (
                <>
                  <ArrowsIn size={16} weight="bold" />
                  <span className="hidden sm:inline">Normal</span>
                </>
              ) : (
                <>
                  <ArrowsOut size={16} weight="bold" />
                  <span className="hidden sm:inline">Penuh</span>
                </>
              )}
            </button>

            {/* Buka di Tab Baru */}
            <a
              href={guidebook.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold text-[#6CC4FF] hover:text-white bg-[#082436] border border-[#144766] hover:border-[#6CC4FF] transition-all min-h-[40px] min-w-[40px] flex items-center justify-center gap-1.5 cursor-pointer"
              title="Buka PDF di Tab Baru"
            >
              <ArrowSquareOut size={16} weight="bold" />
              <span className="hidden sm:inline">Tab Baru</span>
            </a>

            {/* Unduh Berkas PDF */}
            <a
              href={guidebook.file_url}
              download={guidebook.file_name}
              className="p-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-black text-[#0B0720] bg-gradient-to-r from-[#C4F15A] to-[#6CC4FF] shadow-[2px_2px_0px_#0B0720] hover:brightness-110 active:translate-y-0.5 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center gap-1.5 cursor-pointer"
              title="Unduh Berkas PDF"
            >
              <DownloadSimple size={16} weight="bold" />
              <span className="hidden sm:inline">Unduh</span>
            </a>

            {/* Tutup Modal */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#A99FD1] hover:text-[#F5F2FF] hover:bg-[#2E2266] transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer ml-1"
              aria-label="Tutup jendela pembaca"
            >
              <X size={20} weight="bold" />
            </button>
          </div>
        </div>

        {/* ── Modal Body: In-Browser Native PDF Frame Viewer ── */}
        <div className="flex-1 bg-[#090518] relative flex flex-col items-center justify-center overflow-hidden">
          {loadError ? (
            <div className="p-8 text-center max-w-md space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#ff6b76]/10 border border-[#ff6b76]/30 flex items-center justify-center text-[#ff6b76] mx-auto">
                <WarningCircle size={28} weight="duotone" />
              </div>
              <h3 className="font-bold text-base text-[#F5F2FF]">
                Pratinjau PDF tidak dapat dimuat langsung
              </h3>
              <p className="text-xs text-[#A99FD1] leading-relaxed">
                Beberapa peramban ponsel membatasi tampilan berkas dokumen di dalam frame. Kamu tetap dapat membuka atau mengunduh dokumen secara langsung:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href={guidebook.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#140D33] border border-[#2E2266] hover:border-[#9B6BF2]"
                >
                  Buka di Tab Baru
                </a>
                <a
                  href={guidebook.file_url}
                  download={guidebook.file_name}
                  className="px-4 py-2.5 rounded-xl text-xs font-black text-[#0B0720] bg-[#C4F15A]"
                >
                  Unduh PDF ({guidebook.version})
                </a>
              </div>
            </div>
          ) : (
            <iframe
              src={`${guidebook.file_url}#toolbar=1&navpanes=0`}
              title={guidebook.title}
              className="w-full h-full border-none select-auto"
              onError={() => setLoadError(true)}
            />
          )}
        </div>

        {/* ── Modal Footer: Info Catatan Revisi & Navigasi ── */}
        {guidebook.release_notes && (
          <div className="px-4 sm:px-6 py-2.5 border-t border-[#2E2266] bg-[#0E0927] flex items-center justify-between text-xs text-[#A99FD1] select-none">
            <span className="truncate pr-4">
              <strong className="text-[#FFE359]">Catatan Rilis:</strong> {guidebook.release_notes}
            </span>
            <span className="shrink-0 text-[11px] font-mono text-[#8A7FB8]">
              Diperbarui: {new Date(guidebook.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
