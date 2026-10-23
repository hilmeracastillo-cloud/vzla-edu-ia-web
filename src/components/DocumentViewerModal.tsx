import React, { useState, useEffect } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  ExternalLink,
  FileText,
  Loader2,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  originalUrl?: string;
  source?: string;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  url,
  originalUrl,
  source = 'Documento Oficial',
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setIframeKey((k) => k + 1);
    }
  }, [isOpen, url]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !url) return null;

  // Prepare embedded preview URL
  let embedUrl = url;
  if (url.includes('docs.google.com') && url.includes('/pub')) {
    embedUrl = url.includes('embedded=true')
      ? url
      : url.includes('?')
      ? `${url}&embedded=true`
      : `${url}?embedded=true`;
  }

  const directExternalUrl = originalUrl || url;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`bg-[#0A0E1A] border border-[#232F48] rounded-2xl flex flex-col shadow-2xl overflow-hidden transition-all duration-200 ${
          isFullscreen
            ? 'w-full h-full rounded-none'
            : 'w-full max-w-6xl h-[92vh] max-h-[920px]'
        }`}
      >
        {/* Top Header */}
        <header className="px-4 py-3 bg-[#0E1526] border-b border-[#1E283F] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-semibold uppercase shrink-0">
                  {source}
                </span>
                <span className="text-[10.5px] font-mono text-neutral-400 hidden sm:inline-flex items-center gap-1 shrink-0">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Publicación Verificada</span>
                </span>
              </div>
              <h2 className="text-xs sm:text-base font-serif font-bold text-white truncate">
                {title}
              </h2>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Reload iframe */}
            <button
              onClick={() => {
                setIsLoading(true);
                setIframeKey((k) => k + 1);
              }}
              title="Recargar documento"
              className="p-2 rounded-lg bg-[#141B2D] text-neutral-400 hover:text-white border border-[#212E4C] hover:border-neutral-500 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Direct Open in new tab */}
            <a
              href={directExternalUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-indigo-950/90 hover:bg-indigo-900 border border-indigo-700/70 hover:border-indigo-400 text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Abrir en pestaña nueva en Google Docs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Abrir en Google Docs</span>
              <span className="sm:hidden">Abrir</span>
            </a>

            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg bg-[#141B2D] text-neutral-400 hover:text-white border border-[#212E4C] hover:border-neutral-500 transition-colors hidden sm:inline-flex"
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#182035] text-neutral-300 hover:text-white hover:bg-rose-950/60 border border-[#283654] hover:border-rose-700/60 transition-colors cursor-pointer"
              aria-label="Cerrar visor"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Iframe Viewport */}
        <div className="flex-1 relative bg-[#07090E] overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#07090E]/90 z-10 space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-xs font-mono text-neutral-400">
                Cargando documento publicado...
              </p>
            </div>
          )}

          <iframe
            key={iframeKey}
            src={embedUrl}
            title={title}
            className="w-full h-full border-0 bg-white"
            onLoad={() => setIsLoading(false)}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>

        {/* Footer info bar */}
        <footer className="px-4 py-2 bg-[#090D18] border-t border-[#1A2338] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-neutral-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Documento oficial publicado por el autor en Google Docs</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={directExternalUrl}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1"
            >
              <span>docs.google.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};
