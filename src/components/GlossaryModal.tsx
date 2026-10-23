import React, { useState, useMemo, useEffect, useRef } from 'react';
import { GlossaryTerm } from '../types';
import { glossaryTerms, searchGlossary } from '../data/glossary';
import { allChapters } from '../data/articles';
import {
  BookA,
  Search,
  X,
  Tag,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Sparkles,
  Info,
} from 'lucide-react';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTerm?: GlossaryTerm | null;
  onNavigateChapter?: (chapterId: string) => void;
}

const CATEGORIES = [
  'Todos',
  'Tecnología e IA',
  'Infraestructura NEMA',
  'Pedagogía y Metodología',
  'Políticas y Estrategia',
  'Evaluación',
] as const;

export const GlossaryModal: React.FC<GlossaryModalProps> = ({
  isOpen,
  onClose,
  selectedTerm,
  onNavigateChapter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [expandedTermId, setExpandedTermId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (selectedTerm) {
        setExpandedTermId(selectedTerm.id);
        setSelectedCategory('Todos');
        setSearchQuery('');
        setTimeout(() => {
          activeItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      } else {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }
    }
  }, [isOpen, selectedTerm]);

  const filteredTerms = useMemo(() => {
    let list = searchQuery ? searchGlossary(searchQuery) : glossaryTerms;

    if (selectedCategory !== 'Todos') {
      list = list.filter((t) => t.category === selectedCategory);
    }

    return [...list].sort((a, b) => a.term.localeCompare(b.term, 'es'));
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#111111] border border-[#2B2B2B] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#222222] bg-[#141414] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-950/70 border border-indigo-700/60 text-indigo-400">
              <BookA className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                Glosario Académico Interactivo
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-200 border border-indigo-700/60 font-sans font-normal">
                  {glossaryTerms.length} términos
                </span>
              </h2>
              <p className="text-xs text-neutral-400 font-sans">
                Conceptos clave, fundamentos pedagógicos y tecnología de la propuesta para Venezuela
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Cerrar glosario (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 border-b border-[#202020] bg-[#131313] space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por término, categoría o definición (ej. NEMA, ITS, Currículo, Salto de rana)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#2D2D2D] text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            <Tag className="w-3.5 h-3.5 text-neutral-400 shrink-0 mr-1" />
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer text-xs ${
                    active
                      ? 'bg-indigo-600 text-white font-medium shadow-sm'
                      : 'bg-[#1C1C1C] text-neutral-400 hover:text-white hover:bg-[#252525]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 divide-y divide-[#1F1F1F]">
          {filteredTerms.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 space-y-2">
              <BookOpen className="w-10 h-10 mx-auto text-neutral-600" />
              <p className="text-base font-semibold text-neutral-300">
                No se encontraron términos para &ldquo;{searchQuery}&rdquo;
              </p>
              <p className="text-xs text-neutral-500">
                Intenta buscar con palabras clave como NEMA, tutor, aprendizaje o selecciona otra categoría.
              </p>
            </div>
          ) : (
            filteredTerms.map((item) => {
              const isExpanded = expandedTermId === item.id || !!searchQuery;
              const isSelected = selectedTerm?.id === item.id;

              return (
                <div
                  key={item.id}
                  ref={isSelected ? activeItemRef : undefined}
                  className={`pt-4 first:pt-0 transition-all ${
                    isSelected ? 'ring-1 ring-indigo-500/70 p-4 rounded-xl bg-indigo-950/20' : ''
                  }`}
                >
                  <div
                    onClick={() => setExpandedTermId(isExpanded && !searchQuery ? null : item.id)}
                    className="flex items-start justify-between gap-3 cursor-pointer group"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-serif font-bold text-base sm:text-lg text-white group-hover:text-indigo-300 transition-colors">
                          {item.term}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#1C1C1C] text-indigo-300 border border-[#2D2D2D]">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                        {item.shortDefinition}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium shrink-0 pt-1"
                    >
                      {isExpanded ? 'Ver menos' : 'Ver detalle'}
                    </button>
                  </div>

                  {/* Expanded view */}
                  {isExpanded && (
                    <div className="mt-3.5 pl-3 border-l-2 border-indigo-500/60 space-y-3 text-xs sm:text-sm text-neutral-300 animate-in fade-in duration-150">
                      <div>
                        <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-1">
                          Definición y Marco Teórico:
                        </h4>
                        <p className="text-neutral-300 leading-relaxed font-sans">
                          {item.fullDefinition}
                        </p>
                      </div>

                      {item.exampleInVenezuela && (
                        <div className="p-3 rounded-xl bg-[#161616] border border-[#262626] flex items-start gap-2.5">
                          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-emerald-300 block text-xs">
                              Aplicación en la realidad venezolana:
                            </span>
                            <span className="text-neutral-300 text-xs leading-relaxed">
                              {item.exampleInVenezuela}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Chapters cross-reference */}
                      {item.chapters && item.chapters.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                          <span className="text-neutral-400 font-semibold">Consultar en:</span>
                          {item.chapters.map((chapId) => {
                            const chap = allChapters.find((c) => c.id === chapId);
                            if (!chap) return null;
                            return (
                              <button
                                key={chapId}
                                onClick={() => {
                                  onClose();
                                  if (onNavigateChapter) onNavigateChapter(chapId);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-700/60 text-indigo-300 hover:bg-indigo-800 hover:text-white transition-colors text-xs font-medium cursor-pointer"
                              >
                                <span>{chap.title}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Related terms */}
                      {item.relatedTerms && item.relatedTerms.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-neutral-400">
                          <span>Relacionado con:</span>
                          {item.relatedTerms.map((rel) => (
                            <button
                              key={rel}
                              onClick={() => setSearchQuery(rel)}
                              className="px-2 py-0.5 rounded bg-[#1D1D1D] text-neutral-300 hover:text-indigo-300 border border-[#2D2D2D] hover:border-indigo-600 transition-colors"
                            >
                              {rel}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-[#222222] bg-[#141414] flex items-center justify-between text-xs text-neutral-400">
          <span>Glosario pedagógico y conceptual de la obra</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
