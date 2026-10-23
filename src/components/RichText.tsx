import React, { useState } from 'react';
import { Footnote, ReferenceItem, Annotation, GlossaryTerm, HighlightColor } from '../types';
import { useAnnotationsSafe } from '../context/AnnotationContext';
import { colorConfig } from './HighlightToolbar';
import { glossaryTerms } from '../data/glossary';
import { MessageSquare, Trash2, Edit2, BookA, ExternalLink } from 'lucide-react';

interface RichTextProps {
  text: string;
  className?: string;
  onSelectFootnote?: (footnote: Footnote) => void;
  chapterFootnotes?: Record<string, Footnote>;
  chapterReferences?: ReferenceItem[];
  allFootnotesMap?: Record<string, Footnote>;
  allReferences?: ReferenceItem[];
  hangingIndent?: boolean;
  chapterId?: string;
  enableGlossary?: boolean;
}


/**
 * RichText Component
 * Handles:
 * 1. Bold text: **texto en negrita**
 * 2. Italic text: *texto en cursiva*
 * 3. Citations: [X.Y] -> Interactive Footnote / Reference button
 * 4. Hanging indents (Sangría francesa)
 */
export interface HangingIndentParse {
  prefix: string;
  content: string;
}

export function parseHangingIndent(rawText: string): HangingIndentParse | null {
  if (!rawText) return null;
  const trimmed = rawText.trim();

  // 1. Bold bullet prefix: **• ...** or **•**
  const boldBulletMatch = trimmed.match(/^\*\*[•\-\*]\s*(.*?)\*\*(.*)$/s);
  if (boldBulletMatch) {
    const inner = boldBulletMatch[1].trim();
    const rest = boldBulletMatch[2];
    return {
      prefix: '•',
      content: inner ? `**${inner}**${rest}` : rest.trim(),
    };
  }

  // 2. Plain bullet: • **...** or • ...
  const bulletMatch = trimmed.match(/^(?:•|\-|\*|\*\*•\*\*|\*•\*)\s*(.*)$/s);
  if (bulletMatch) {
    return {
      prefix: '•',
      content: bulletMatch[1].trim(),
    };
  }

  // 3. Bold numbered prefix: **1. ...** or **a. ...**
  const boldNumMatch = trimmed.match(/^\*\*(\d+[\.\)]|[a-zA-Z][\.\)])\s*(.*?)\*\*(.*)$/s);
  if (boldNumMatch) {
    const numPrefix = boldNumMatch[1];
    const inner = boldNumMatch[2].trim();
    const rest = boldNumMatch[3];
    return {
      prefix: numPrefix.endsWith('.') || numPrefix.endsWith(')') ? numPrefix : `${numPrefix}.`,
      content: inner ? `**${inner}**${rest}` : rest.trim(),
    };
  }

  // 4. Plain numbered or lettered prefix: 1. or 1) or a. or b)
  const numMatch = trimmed.match(/^(\d+[\.\)]|[a-zA-Z][\.\)])\s*(.*)$/s);
  if (numMatch) {
    const numPrefix = numMatch[1];
    return {
      prefix: numPrefix.endsWith('.') || numPrefix.endsWith(')') ? numPrefix : `${numPrefix}.`,
      content: numMatch[2].trim(),
    };
  }

  // 5. Citation / reference code: [2.1] or **[2.1]**
  const citationMatch = trimmed.match(/^(?:\*\*)?\[(\d+\.\d+)\](?:\*\*)?\s*(.*)$/s);
  if (citationMatch) {
    return {
      prefix: `[${citationMatch[1]}]`,
      content: citationMatch[2].trim(),
    };
  }

  return null;
}

export const RichText: React.FC<RichTextProps> = ({
  text,
  className = '',
  onSelectFootnote,
  chapterFootnotes = {},
  chapterReferences = [],
  allFootnotesMap = {},
  allReferences = [],
  hangingIndent = false,
  chapterId,
  enableGlossary = true,
}) => {
  if (!text) return null;

  const annotationContext = useAnnotationsSafe();
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  const chapterAnnotations = React.useMemo(() => {
    if (!chapterId || !annotationContext) return [];
    return annotationContext.getChapterAnnotations(chapterId);
  }, [chapterId, annotationContext?.annotations]);

  // Resolve citation footnote object
  const resolveFootnote = (cleanId: string): Footnote => {
    const bracketCode = `[${cleanId}]`;
    const rawFootnote =
      chapterFootnotes[bracketCode] ||
      chapterFootnotes[cleanId] ||
      allFootnotesMap[bracketCode] ||
      allFootnotesMap[cleanId];

    const refItem =
      chapterReferences.find(
        (r) =>
          r.code === bracketCode ||
          r.id === cleanId ||
          r.id === `ref-${cleanId.replace('.', '-')}`
      ) ||
      allReferences.find(
        (r) =>
          r.code === bracketCode ||
          r.id === cleanId ||
          r.id === `ref-${cleanId.replace('.', '-')}`
      );

    if (rawFootnote) {
      return {
        ...rawFootnote,
        url: rawFootnote.url || refItem?.url,
      };
    }

    if (refItem) {
      return {
        id: cleanId,
        code: bracketCode,
        title: refItem.citation
          .replace(/^\[\d+\.\d+\]\s*/, '')
          .replace(refItem.url || '', '')
          .trim(),
        authorOrSource: refItem.citation.split('.')[0] || 'Fuente de la obra',
        justification:
          'Nota o referencia citada en el cuerpo del texto para validación académica.',
        url: refItem.url,
      };
    }

    return {
      id: cleanId,
      code: bracketCode,
      title: `Referencia citada ${cleanId}`,
      authorOrSource: 'Fuente de la obra',
      justification:
        'Nota al pie citada en el cuerpo del texto para validación académica.',
    };
  };

  // Helper to render plain text with user highlights and glossary terms
  const renderAnnotatedAndGlossaryText = (plainText: string, keyPrefix: string): React.ReactNode => {
    if (!plainText) return null;

    // Check if there are any highlights or glossary terms to match
    const hasHighlights = chapterAnnotations.length > 0;
    const hasGlossary = enableGlossary && glossaryTerms.length > 0;

    if (!hasHighlights && !hasGlossary) {
      return plainText;
    }

    // Find the earliest match for either an annotation or a glossary term
    let earliestMatch: {
      type: 'annotation' | 'glossary';
      index: number;
      length: number;
      data: Annotation | GlossaryTerm;
      matchedText: string;
    } | null = null;

    // 1. Search for user annotations first (highest priority)
    if (hasHighlights) {
      for (const ann of chapterAnnotations) {
        if (!ann.text || ann.text.length < 2) continue;
        const idx = plainText.indexOf(ann.text);
        if (idx !== -1) {
          if (!earliestMatch || idx < earliestMatch.index) {
            earliestMatch = {
              type: 'annotation',
              index: idx,
              length: ann.text.length,
              data: ann,
              matchedText: ann.text,
            };
          }
        }
      }
    }

    // 2. Search for glossary terms if no earlier annotation match
    if (hasGlossary) {
      for (const term of glossaryTerms) {
        const termsToSearch = [term.term, ...(term.aliases || [])];
        for (const candidate of termsToSearch) {
          if (candidate.length < 3) continue;
          // Case-insensitive word boundary search
          const regex = new RegExp(`\\b${candidate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          const match = plainText.match(regex);
          if (match && match.index !== undefined) {
            const idx = match.index;
            if (!earliestMatch || idx < earliestMatch.index) {
              earliestMatch = {
                type: 'glossary',
                index: idx,
                length: match[0].length,
                data: term,
                matchedText: match[0],
              };
            }
          }
        }
      }
    }

    // If no match found, return the plain text
    if (!earliestMatch) {
      return plainText;
    }

    const before = plainText.slice(0, earliestMatch.index);
    const matched = plainText.slice(earliestMatch.index, earliestMatch.index + earliestMatch.length);
    const after = plainText.slice(earliestMatch.index + earliestMatch.length);

    let matchElement: React.ReactNode = null;

    if (earliestMatch.type === 'annotation') {
      const ann = earliestMatch.data as Annotation;
      const cfg = colorConfig[ann.color] || colorConfig.yellow;
      const isPopupOpen = activeNoteId === ann.id;

      matchElement = (
        <span
          key={`${keyPrefix}-ann-${ann.id}-${earliestMatch.index}`}
          data-annotation-id={ann.id}
          className={`group/ann relative inline rounded px-1 py-0.5 transition-all cursor-pointer ${cfg.bgHighlight}`}
          onClick={(e) => {
            e.stopPropagation();
            setActiveNoteId(isPopupOpen ? null : ann.id);
          }}
        >
          <span>{matched}</span>

          {/* Indicator icon if note attached */}
          {ann.note && (
            <span
              className="inline-flex items-center ml-1 text-white/90 align-baseline cursor-pointer"
              title="Ver nota de lectura"
            >
              <MessageSquare className="w-3.5 h-3.5 inline text-indigo-200 fill-indigo-950" />
            </span>
          )}

          {/* Hover / Touch Note Card */}
          <span
            className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 rounded-xl bg-[#161616] border border-neutral-700 shadow-2xl text-xs text-white z-50 transition-all pointer-events-auto normal-case font-normal text-left ${
              isPopupOpen ? 'opacity-100 visible' : 'opacity-0 invisible group-hover/ann:opacity-100 group-hover/ann:visible'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-[#282828] text-[11px] text-neutral-400">
              <span className="flex items-center gap-1 font-semibold text-neutral-200">
                <span className={`w-2 h-2 rounded-full ${cfg.bgBadge}`} />
                {cfg.name}
              </span>
              <span className="text-[10px] text-neutral-500">
                {new Date(ann.createdAt).toLocaleDateString('es-ES')}
              </span>
            </div>

            {ann.note ? (
              <p className="py-2 text-neutral-200 text-xs leading-relaxed font-sans">
                {ann.note}
              </p>
            ) : (
              <p className="py-1.5 text-neutral-400 italic text-[11px]">
                Texto resaltado sin nota adjunta.
              </p>
            )}

            <div className="flex items-center justify-between pt-1.5 border-t border-[#282828] text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setActiveNoteId(null);
                  if (annotationContext) {
                    annotationContext.setIsAnnotationsDrawerOpen(true);
                  }
                }}
                className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>{ann.note ? 'Editar nota' : 'Añadir nota'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (annotationContext) {
                    annotationContext.deleteAnnotation(ann.id);
                  }
                  setActiveNoteId(null);
                }}
                className="text-neutral-500 hover:text-red-400 flex items-center gap-1 cursor-pointer"
                title="Eliminar este resaltado"
              >
                <Trash2 className="w-3 h-3" />
                <span>Eliminar</span>
              </button>
            </div>
          </span>
        </span>
      );
    } else {
      // Glossary term
      const term = earliestMatch.data as GlossaryTerm;
      matchElement = (
        <span
          key={`${keyPrefix}-glo-${term.id}-${earliestMatch.index}`}
          className="group/glossary relative inline border-b border-dashed border-indigo-400/80 text-neutral-100 hover:text-indigo-200 hover:border-indigo-300 transition-colors cursor-help"
          onClick={(e) => {
            e.stopPropagation();
            if (annotationContext) {
              annotationContext.openGlossaryWithTerm(term.id);
            }
          }}
        >
          <span>{matched}</span>

          {/* Interactive Academic Definition Tooltip */}
          <span
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3.5 rounded-2xl bg-[#141414]/95 backdrop-blur-md border border-indigo-500/60 shadow-2xl text-xs text-neutral-200 z-50 opacity-0 invisible group-hover/glossary:opacity-100 group-hover/glossary:visible transition-all duration-150 pointer-events-auto normal-case font-normal text-left ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="font-serif font-bold text-white text-xs truncate">
                {term.term}
              </span>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/80 shrink-0">
                {term.category}
              </span>
            </div>

            <p className="text-neutral-300 text-[11px] leading-relaxed font-sans mb-2">
              {term.shortDefinition}
            </p>

            <button
              type="button"
              onClick={() => {
                if (annotationContext) {
                  annotationContext.openGlossaryWithTerm(term.id);
                }
              }}
              className="w-full py-1 px-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white border border-indigo-500/50 transition-colors flex items-center justify-center gap-1.5 text-[11px] font-medium cursor-pointer"
            >
              <BookA className="w-3.5 h-3.5" />
              <span>Ver definición completa y casos</span>
            </button>
          </span>
        </span>
      );
    }

    return (
      <React.Fragment key={`${keyPrefix}-seg-${earliestMatch.index}`}>
        {renderAnnotatedAndGlossaryText(before, `${keyPrefix}-b`)}
        {matchElement}
        {renderAnnotatedAndGlossaryText(after, `${keyPrefix}-a`)}
      </React.Fragment>
    );
  };

  // Helper to parse citations within any segment
  const renderCitations = (subText: string, keyPrefix: string): React.ReactNode => {
    const parts = subText.split(/(\[\d+\.\d+\.?\])/g);
    return parts.map((part, idx) => {
      const match = part.match(/\[(\d+\.\d+)\.?\]/);
      if (match) {
        const cleanId = match[1];
        const bracketCode = `[${cleanId}]`;
        const footnote = resolveFootnote(cleanId);

        if (onSelectFootnote) {
          return (
            <button
              key={`${keyPrefix}-cit-${idx}`}
              type="button"
              onClick={() => onSelectFootnote(footnote)}
              title={
                footnote.title
                  ? `${footnote.title} - ${footnote.authorOrSource}`
                  : `Ver referencia ${bracketCode}`
              }
              className="inline-flex items-center mx-1 px-1.5 py-0.5 rounded text-[11px] font-mono font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-700/70 hover:bg-indigo-600 hover:text-white hover:border-indigo-400 transition-all cursor-pointer shadow-sm align-baseline"
            >
              {bracketCode}
            </button>
          );
        }

        return (
          <span
            key={`${keyPrefix}-cit-${idx}`}
            className="inline-flex items-center mx-1 px-1.5 py-0.5 rounded text-[11px] font-mono font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-700/60"
          >
            {bracketCode}
          </span>
        );
      }
      return renderAnnotatedAndGlossaryText(part, `${keyPrefix}-p-${idx}`);
    });
  };

  // Parse markdown bold (**...**) and italic (*...*) tokens
  const renderTokens = (raw: string): React.ReactNode => {
    // Regex splits by bold (**...**) or single italic (*...*) or citations
    const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|\[\d+\.\d+\.?\])/g;
    const segments = raw.split(tokenRegex);

    return segments.map((seg, i) => {
      if (seg.startsWith('**') && seg.endsWith('**') && seg.length >= 4) {
        const inner = seg.slice(2, -2);
        return (
          <strong key={`b-${i}`} className="font-bold text-white tracking-tight">
            {renderCitations(inner, `b-${i}`)}
          </strong>
        );
      }
      if (seg.startsWith('*') && seg.endsWith('*') && seg.length >= 2) {
        const inner = seg.slice(1, -1);
        return (
          <em key={`i-${i}`} className="italic text-neutral-200">
            {renderCitations(inner, `i-${i}`)}
          </em>
        );
      }
      if (/^\[\d+\.\d+\.?\]$/.test(seg)) {
        return renderCitations(seg, `c-${i}`);
      }
      return renderCitations(seg, `t-${i}`);
    });
  };

  const isHanging =
    hangingIndent ||
    /^(•|\d+[\.\)]|[a-zA-Z][\.\)]|\[\d+\.\d+\]|\*\*[•\-\*]|\*\*(\d+[\.\)]|[a-zA-Z][\.\)]))\s+/i.test(text.trim());

  if (isHanging) {
    const parsed = parseHangingIndent(text);
    if (parsed) {
      return (
        <span className={`hanging-indent-wrapper inline-flex items-start gap-2.5 sm:gap-3 w-full text-left ${className}`.trim()}>
          <span className="shrink-0 select-none font-semibold text-indigo-400 min-w-[1.25rem] text-right pt-[1px] leading-relaxed">
            {parsed.prefix === '•' ? (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 align-middle mb-0.5" />
            ) : (
              parsed.prefix
            )}
          </span>
          <span className="flex-1 min-w-0 leading-relaxed">
            {renderTokens(parsed.content)}
          </span>
        </span>
      );
    }
  }

  const finalClass = `${isHanging ? 'sangria-francesa ' : ''}${className}`.trim();

  return <span className={finalClass}>{renderTokens(text)}</span>;
};

export default RichText;

