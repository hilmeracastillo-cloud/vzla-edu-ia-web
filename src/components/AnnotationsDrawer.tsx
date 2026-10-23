import React, { useState, useMemo } from 'react';
import { Annotation, HighlightColor, BookmarkItem } from '../types';
import { useAnnotations } from '../context/AnnotationContext';
import { colorConfig } from './HighlightToolbar';
import { allChapters } from '../data/articles';
import {
  Highlighter,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Download,
  Copy,
  ExternalLink,
  Bookmark,
  Calendar,
  Filter,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface AnnotationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentChapterId: string;
  onNavigateChapter: (chapterId: string, blockId?: string) => void;
}

export const AnnotationsDrawer: React.FC<AnnotationsDrawerProps> = ({
  isOpen,
  onClose,
  currentChapterId,
  onNavigateChapter,
}) => {
  const {
    annotations,
    bookmarks,
    updateAnnotationNote,
    updateAnnotationColor,
    deleteAnnotation,
    clearChapterAnnotations,
    removeBookmark,
    exportAnnotationsMarkdown,
  } = useAnnotations();

  const [activeTab, setActiveTab] = useState<'current' | 'all' | 'bookmarks'>('current');
  const [filterColor, setFilterColor] = useState<HighlightColor | 'all'>('all');
  const [onlyWithNotes, setOnlyWithNotes] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  // Filtered annotations
  const filteredAnnotations = useMemo(() => {
    let list =
      activeTab === 'current'
        ? annotations.filter((a) => a.chapterId === currentChapterId)
        : annotations;

    if (filterColor !== 'all') {
      list = list.filter((a) => a.color === filterColor);
    }

    if (onlyWithNotes) {
      list = list.filter((a) => !!a.note && a.note.trim().length > 0);
    }

    return list;
  }, [annotations, activeTab, currentChapterId, filterColor, onlyWithNotes]);

  if (!isOpen) return null;

  const currentChapterTitle =
    allChapters.find((c) => c.id === currentChapterId)?.title || currentChapterId;

  const handleStartEdit = (ann: Annotation) => {
    setEditingId(ann.id);
    setEditNoteText(ann.note || '');
  };

  const handleSaveEdit = (id: string) => {
    updateAnnotationNote(id, editNoteText);
    setEditingId(null);
  };

  const handleCopyMarkdown = async () => {
    const md = exportAnnotationsMarkdown(activeTab === 'current' ? currentChapterId : undefined);
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadMarkdown = () => {
    const md = exportAnnotationsMarkdown(activeTab === 'current' ? currentChapterId : undefined);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `anotaciones-${activeTab === 'current' ? currentChapterId : 'obra-completa'}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleJumpToText = (ann: Annotation) => {
    onClose();
    onNavigateChapter(ann.chapterId, ann.blockId);

    // Scroll to match text if possible
    setTimeout(() => {
      const marks = document.querySelectorAll(`[data-annotation-id="${ann.id}"]`);
      if (marks.length > 0) {
        marks[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        marks[0].classList.add('ring-2', 'ring-white', 'scale-105', 'transition-all');
        setTimeout(() => {
          marks[0].classList.remove('ring-2', 'ring-white', 'scale-105');
        }, 2000);
      }
    }, 200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg h-full bg-[#111111] border-l border-[#262626] shadow-2xl flex flex-col text-neutral-200 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#222222] bg-[#141414] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-950/70 border border-indigo-700/60 text-indigo-400">
              <Highlighter className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                Mis Notas y Resaltados
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-200 border border-indigo-700/60 font-sans">
                  {annotations.length}
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400 font-sans">
                Guardados localmente en tu navegador
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Tabs */}
        <div className="flex border-b border-[#202020] bg-[#131313] px-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('current')}
            className={`py-3 px-3 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'current'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>Este Capítulo</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-neutral-800 text-neutral-300">
              {annotations.filter((a) => a.chapterId === currentChapterId).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`py-3 px-3 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>Toda la Obra</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-neutral-800 text-neutral-300">
              {annotations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`py-3 px-3 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'bookmarks'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Marcadores</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-neutral-800 text-neutral-300">
              {bookmarks.length}
            </span>
          </button>
        </div>

        {/* Filter controls (only for annotation tabs) */}
        {activeTab !== 'bookmarks' && (
          <div className="p-3 bg-[#161616] border-b border-[#202020] flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Color swatches filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-neutral-400 mr-1">Color:</span>
              <button
                onClick={() => setFilterColor('all')}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                  filterColor === 'all'
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-[#222] text-neutral-400 hover:text-white'
                }`}
              >
                Todos
              </button>
              {(Object.keys(colorConfig) as HighlightColor[]).map((col) => {
                const cfg = colorConfig[col];
                const active = filterColor === col;
                return (
                  <button
                    key={col}
                    onClick={() => setFilterColor(active ? 'all' : col)}
                    title={cfg.name}
                    className={`w-4 h-4 rounded-full ${cfg.bgBadge} transition-transform ${
                      active ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                );
              })}
            </div>

            {/* Only notes toggle */}
            <button
              onClick={() => setOnlyWithNotes(!onlyWithNotes)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                onlyWithNotes
                  ? 'bg-indigo-900/60 text-indigo-200 border border-indigo-700'
                  : 'bg-[#222] text-neutral-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>Con notas</span>
            </button>
          </div>
        )}

        {/* List Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'bookmarks' ? (
            /* Bookmarks List */
            bookmarks.length === 0 ? (
              <div className="py-12 text-center text-neutral-400 space-y-2">
                <Bookmark className="w-10 h-10 mx-auto text-neutral-600" />
                <p className="text-sm font-semibold text-neutral-300">No hay secciones guardadas</p>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Toca el icono de marcador junto a cualquier capítulo o sección para fijarlo aquí.
                </p>
              </div>
            ) : (
              bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="p-3.5 rounded-xl bg-[#171717] border border-[#262626] hover:border-indigo-700/60 transition-all flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
                      <Bookmark className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
                      <span>{bm.chapterTitle}</span>
                    </div>
                    {bm.sectionTitle && (
                      <h4 className="font-semibold text-sm text-neutral-200">{bm.sectionTitle}</h4>
                    )}
                    <span className="text-[10px] text-neutral-500 block">
                      Agregado el {new Date(bm.createdAt).toLocaleDateString('es-ES')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateChapter(bm.chapterId, bm.sectionId);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-900/50 hover:bg-indigo-800 text-indigo-200 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Ir</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeBookmark(bm.id)}
                      className="p-1 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                      title="Eliminar marcador"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )
          ) : /* Annotations List */
          filteredAnnotations.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 space-y-2">
              <Highlighter className="w-10 h-10 mx-auto text-neutral-600" />
              <p className="text-sm font-semibold text-neutral-300">
                {activeTab === 'current'
                  ? 'No hay resaltados en este capítulo'
                  : 'Aún no has creado resaltados'}
              </p>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Selecciona cualquier fragmento de texto con tu ratón o dedo para elegir un color y
                adjuntar notas.
              </p>
            </div>
          ) : (
            filteredAnnotations.map((ann) => {
              const cfg = colorConfig[ann.color];
              const isEditing = editingId === ann.id;

              return (
                <div
                  key={ann.id}
                  className="p-3.5 rounded-xl bg-[#161616] border border-[#262626] hover:border-neutral-700 transition-all space-y-2.5"
                >
                  {/* Top bar of card */}
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${cfg.bgBadge} inline-block shadow-sm`}
                      />
                      <span className="font-semibold text-neutral-300">{cfg.name}</span>
                      {activeTab === 'all' && (
                        <span className="text-indigo-400 font-medium truncate max-w-[160px]">
                          • {ann.chapterTitle}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(ann.createdAt).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>

                  {/* Highlight Quote text */}
                  <blockquote
                    onClick={() => handleJumpToText(ann)}
                    className="font-serif italic text-xs sm:text-sm text-neutral-200 pl-3 border-l-2 cursor-pointer hover:text-white transition-colors"
                    style={{ borderColor: cfg.hex }}
                    title="Hacer clic para saltar al texto en el capítulo"
                  >
                    &ldquo;{ann.text}&rdquo;
                  </blockquote>

                  {/* Note section */}
                  {isEditing ? (
                    <div className="space-y-1.5 pt-1">
                      <textarea
                        value={editNoteText}
                        onChange={(e) => setEditNoteText(e.target.value)}
                        placeholder="Escribe tu anotación..."
                        className="w-full bg-[#1F1F1F] text-xs text-neutral-100 rounded-lg p-2 border border-indigo-500 focus:outline-none"
                        rows={2}
                        maxLength={300}
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2 py-0.5 rounded text-[11px] text-neutral-400 hover:text-white"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleSaveEdit(ann.id)}
                          className="px-2.5 py-0.5 rounded bg-indigo-600 text-white text-[11px] font-medium"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  ) : ann.note ? (
                    <div className="p-2.5 rounded-lg bg-[#1B1B1B] border border-[#2B2B2B] text-xs text-neutral-200 flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <p className="flex-1 font-sans leading-relaxed">{ann.note}</p>
                    </div>
                  ) : null}

                  {/* Actions footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#222222] text-xs">
                    <button
                      onClick={() => handleJumpToText(ann)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowRight className="w-3 h-3" />
                      <span>Ir al texto</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {/* Color change picker */}
                      <div className="flex items-center gap-1 mr-1">
                        {(Object.keys(colorConfig) as HighlightColor[]).map((c) => (
                          <button
                            key={c}
                            onClick={() => updateAnnotationColor(ann.id, c)}
                            title={`Cambiar a ${colorConfig[c].name}`}
                            className={`w-3.5 h-3.5 rounded-full ${colorConfig[c].bgBadge} ${
                              ann.color === c ? 'ring-1 ring-white' : 'opacity-50 hover:opacity-100'
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => handleStartEdit(ann)}
                        className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800"
                        title={ann.note ? 'Editar nota' : 'Agregar nota'}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => deleteAnnotation(ann.id)}
                        className="p-1 rounded text-neutral-500 hover:text-red-400 hover:bg-neutral-800"
                        title="Eliminar resaltado"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer toolbar: Export & Clear */}
        <div className="p-3.5 sm:p-4 border-t border-[#222222] bg-[#141414] space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopyMarkdown}
                disabled={annotations.length === 0}
                className="px-2.5 py-1.5 rounded-lg bg-[#1F1F1F] hover:bg-[#2A2A2A] text-neutral-200 text-xs font-medium border border-[#333] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                title="Copiar todas las notas en formato Markdown"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copied ? '¡Copiado!' : 'Copiar MD'}</span>
              </button>

              <button
                onClick={handleDownloadMarkdown}
                disabled={annotations.length === 0}
                className="px-2.5 py-1.5 rounded-lg bg-[#1F1F1F] hover:bg-[#2A2A2A] text-neutral-200 text-xs font-medium border border-[#333] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                title="Descargar archivo .md con tus citas y notas"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Descargar</span>
              </button>
            </div>

            {activeTab === 'current' &&
              annotations.filter((a) => a.chapterId === currentChapterId).length > 0 && (
                <div>
                  {confirmClear ? (
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-[10px] text-red-400">¿Borrar?</span>
                      <button
                        onClick={() => {
                          clearChapterAnnotations(currentChapterId);
                          setConfirmClear(false);
                        }}
                        className="px-2 py-1 rounded bg-red-700 text-white font-medium text-[10px]"
                      >
                        Sí
                      </button>
                      <button
                        onClick={() => setConfirmClear(false)}
                        className="px-2 py-1 rounded bg-neutral-800 text-neutral-300 text-[10px]"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmClear(true)}
                      className="text-[11px] text-neutral-500 hover:text-red-400 transition-colors"
                    >
                      Limpiar capítulo
                    </button>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
