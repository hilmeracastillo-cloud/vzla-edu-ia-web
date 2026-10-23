import React, { useState, useEffect, useRef } from 'react';
import { HighlightColor } from '../types';
import {
  Highlighter,
  MessageSquare,
  Copy,
  Check,
  X,
  BookMarked,
  Sparkles,
} from 'lucide-react';

interface HighlightToolbarProps {
  selectionRect: DOMRect | null;
  selectedText: string;
  chapterId: string;
  chapterTitle: string;
  onHighlight: (color: HighlightColor, note?: string) => void;
  onClose: () => void;
}

export const colorConfig: Record<
  HighlightColor,
  {
    name: string;
    bgBadge: string;
    border: string;
    bgHighlight: string;
    textHighlight: string;
    hex: string;
  }
> = {
  yellow: {
    name: 'Amarillo',
    bgBadge: 'bg-yellow-400',
    border: 'border-yellow-500',
    bgHighlight: 'bg-yellow-400/30 text-yellow-100 border-b-2 border-yellow-400',
    textHighlight: 'text-yellow-300',
    hex: '#facc15',
  },
  green: {
    name: 'Verde',
    bgBadge: 'bg-emerald-400',
    border: 'border-emerald-500',
    bgHighlight: 'bg-emerald-400/30 text-emerald-100 border-b-2 border-emerald-400',
    textHighlight: 'text-emerald-300',
    hex: '#34d399',
  },
  blue: {
    name: 'Azul',
    bgBadge: 'bg-sky-400',
    border: 'border-sky-500',
    bgHighlight: 'bg-sky-400/30 text-sky-100 border-b-2 border-sky-400',
    textHighlight: 'text-sky-300',
    hex: '#38bdf8',
  },
  purple: {
    name: 'Púrpura',
    bgBadge: 'bg-purple-400',
    border: 'border-purple-500',
    bgHighlight: 'bg-purple-400/30 text-purple-100 border-b-2 border-purple-400',
    textHighlight: 'text-purple-300',
    hex: '#c084fc',
  },
  rose: {
    name: 'Rosa',
    bgBadge: 'bg-rose-400',
    border: 'border-rose-500',
    bgHighlight: 'bg-rose-400/30 text-rose-100 border-b-2 border-rose-400',
    textHighlight: 'text-rose-300',
    hex: '#fb7185',
  },
};

export const HighlightToolbar: React.FC<HighlightToolbarProps> = ({
  selectionRect,
  selectedText,
  chapterId,
  chapterTitle,
  onHighlight,
  onClose,
}) => {
  const [isNoteInputOpen, setIsNoteInputOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<HighlightColor>('yellow');
  const [noteText, setNoteText] = useState('');
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isNoteInputOpen) {
      inputRef.current?.focus();
    }
  }, [isNoteInputOpen]);

  if (!selectionRect || !selectedText) return null;

  // Calculate coordinates relative to window/viewport
  const toolbarWidth = isNoteInputOpen ? 320 : 260;
  const topPos = Math.max(10, selectionRect.top - (isNoteInputOpen ? 95 : 55));
  let leftPos = selectionRect.left + selectionRect.width / 2 - toolbarWidth / 2;

  // Boundary safety
  if (typeof window !== 'undefined') {
    leftPos = Math.max(12, Math.min(leftPos, window.innerWidth - toolbarWidth - 12));
  }

  const handleApplyColor = (color: HighlightColor) => {
    setSelectedColor(color);
    if (!isNoteInputOpen) {
      onHighlight(color);
    }
  };

  const handleSaveWithNote = (e: React.FormEvent) => {
    e.preventDefault();
    onHighlight(selectedColor, noteText);
    setNoteText('');
    setIsNoteInputOpen(false);
  };

  const handleCopyCitation = async () => {
    const citation = `"${selectedText}"\n— Hilmer Castillo Bescanza, Venezuela, Educación e Inteligencia Artificial (Capítulo: ${chapterTitle})`;
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-label="Herramienta de resaltado y anotaciones"
      style={{
        position: 'fixed',
        top: `${topPos}px`,
        left: `${leftPos}px`,
        zIndex: 9999,
      }}
      className="animate-in fade-in zoom-in-95 duration-150 select-none shadow-2xl rounded-2xl bg-[#141414]/95 backdrop-blur-md border border-neutral-700/80 p-2 text-white flex flex-col gap-2 ring-1 ring-white/10"
    >
      {/* Upper row: Color swatches + Actions */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 pl-1 mr-0.5 flex items-center gap-1">
          <Highlighter className="w-3 h-3 text-indigo-400" />
        </span>

        {/* Color buttons */}
        {(Object.keys(colorConfig) as HighlightColor[]).map((col) => {
          const cfg = colorConfig[col];
          const isSelected = selectedColor === col;
          return (
            <button
              key={col}
              type="button"
              onClick={() => handleApplyColor(col)}
              title={`Resaltar en ${cfg.name}`}
              className={`w-6 h-6 rounded-full ${cfg.bgBadge} transition-transform hover:scale-115 active:scale-95 cursor-pointer relative flex items-center justify-center shadow-sm ${
                isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : ''
              }`}
            >
              {isSelected && !isNoteInputOpen && (
                <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
              )}
            </button>
          );
        })}

        <div className="w-[1px] h-5 bg-neutral-700 mx-1" />

        {/* Note button */}
        <button
          type="button"
          onClick={() => setIsNoteInputOpen(!isNoteInputOpen)}
          title="Agregar nota a este resaltado"
          className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs ${
            isNoteInputOpen
              ? 'bg-indigo-600 text-white font-semibold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="text-[11px] hidden sm:inline">Nota</span>
        </button>

        {/* Copy citation */}
        <button
          type="button"
          onClick={handleCopyCitation}
          title="Copiar texto con cita académica"
          className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Close toolbar */}
        <button
          type="button"
          onClick={onClose}
          title="Cancelar selección"
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer ml-auto"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Note Input Drawer when active */}
      {isNoteInputOpen && (
        <form onSubmit={handleSaveWithNote} className="pt-1 border-t border-neutral-700/80 flex flex-col gap-1.5">
          <input
            ref={inputRef}
            type="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Escribe una nota para este resaltado..."
            className="w-full bg-[#1F1F1F] text-xs text-neutral-100 placeholder-neutral-500 rounded-lg px-2.5 py-1.5 border border-neutral-600 focus:outline-none focus:border-indigo-500"
            maxLength={250}
          />
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[10px] text-neutral-400">
              Color: <span className="font-semibold text-neutral-200">{colorConfig[selectedColor].name}</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsNoteInputOpen(false)}
                className="px-2 py-0.5 rounded text-neutral-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow transition-colors cursor-pointer"
              >
                Guardar Resaltado
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
