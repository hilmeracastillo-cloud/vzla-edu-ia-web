import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Annotation, BookmarkItem, HighlightColor, GlossaryTerm } from '../types';
import { glossaryTerms, getGlossaryTermById } from '../data/glossary';
import { allChapters } from '../data/articles';

interface AnnotationContextType {
  annotations: Annotation[];
  bookmarks: BookmarkItem[];
  addAnnotation: (item: {
    chapterId: string;
    chapterTitle?: string;
    text: string;
    color: HighlightColor;
    note?: string;
    blockId?: string;
  }) => Annotation;
  updateAnnotationNote: (id: string, note: string) => void;
  updateAnnotationColor: (id: string, color: HighlightColor) => void;
  deleteAnnotation: (id: string) => void;
  clearChapterAnnotations: (chapterId: string) => void;
  getChapterAnnotations: (chapterId: string) => Annotation[];
  isBookmarked: (chapterId: string, sectionId?: string) => boolean;
  toggleBookmark: (
    chapterId: string,
    chapterTitle: string,
    sectionId?: string,
    sectionTitle?: string
  ) => void;
  removeBookmark: (id: string) => void;
  exportAnnotationsMarkdown: (chapterId?: string) => string;

  // Drawer / Modals visibility
  isAnnotationsDrawerOpen: boolean;
  setIsAnnotationsDrawerOpen: (open: boolean) => void;
  isGlossaryOpen: boolean;
  setIsGlossaryOpen: (open: boolean) => void;
  selectedGlossaryTerm: GlossaryTerm | null;
  setSelectedGlossaryTerm: (term: GlossaryTerm | null) => void;
  openGlossaryWithTerm: (termIdOrName: string) => void;
  activeAnnotationToEdit: Annotation | null;
  setActiveAnnotationToEdit: (annotation: Annotation | null) => void;
}

const STORAGE_KEY_ANNOTATIONS = 'vzla_edu_annotations_v1';
const STORAGE_KEY_BOOKMARKS = 'vzla_edu_bookmarks_v1';

const AnnotationContext = createContext<AnnotationContextType | undefined>(undefined);

export const AnnotationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Annotations state with localStorage persistence
  const [annotations, setAnnotations] = useState<Annotation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ANNOTATIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Bookmarks state with localStorage persistence
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Drawer and modal states
  const [isAnnotationsDrawerOpen, setIsAnnotationsDrawerOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = useState<GlossaryTerm | null>(null);
  const [activeAnnotationToEdit, setActiveAnnotationToEdit] = useState<Annotation | null>(null);

  // Sync annotations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ANNOTATIONS, JSON.stringify(annotations));
    } catch (e) {
      console.warn('Error saving annotations to localStorage', e);
    }
  }, [annotations]);

  // Sync bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(bookmarks));
    } catch (e) {
      console.warn('Error saving bookmarks to localStorage', e);
    }
  }, [bookmarks]);

  const addAnnotation = (item: {
    chapterId: string;
    chapterTitle?: string;
    text: string;
    color: HighlightColor;
    note?: string;
    blockId?: string;
  }): Annotation => {
    const chapter = allChapters.find((c) => c.id === item.chapterId);
    const newAnnotation: Annotation = {
      id: `ann-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      chapterId: item.chapterId,
      chapterTitle: item.chapterTitle || chapter?.title || item.chapterId,
      text: item.text.trim(),
      color: item.color,
      note: item.note ? item.note.trim() : undefined,
      createdAt: new Date().toISOString(),
      blockId: item.blockId,
    };

    setAnnotations((prev) => [newAnnotation, ...prev]);
    return newAnnotation;
  };

  const updateAnnotationNote = (id: string, note: string) => {
    setAnnotations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, note: note.trim() || undefined } : a))
    );
  };

  const updateAnnotationColor = (id: string, color: HighlightColor) => {
    setAnnotations((prev) => prev.map((a) => (a.id === id ? { ...a, color } : a)));
  };

  const deleteAnnotation = (id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    if (activeAnnotationToEdit?.id === id) {
      setActiveAnnotationToEdit(null);
    }
  };

  const clearChapterAnnotations = (chapterId: string) => {
    setAnnotations((prev) => prev.filter((a) => a.chapterId !== chapterId));
  };

  const getChapterAnnotations = (chapterId: string) => {
    return annotations.filter((a) => a.chapterId === chapterId);
  };

  const isBookmarked = (chapterId: string, sectionId?: string) => {
    return bookmarks.some(
      (b) => b.chapterId === chapterId && (sectionId ? b.sectionId === sectionId : !b.sectionId)
    );
  };

  const toggleBookmark = (
    chapterId: string,
    chapterTitle: string,
    sectionId?: string,
    sectionTitle?: string
  ) => {
    setBookmarks((prev) => {
      const exists = prev.some(
        (b) => b.chapterId === chapterId && (sectionId ? b.sectionId === sectionId : !b.sectionId)
      );

      if (exists) {
        return prev.filter(
          (b) => !(b.chapterId === chapterId && (sectionId ? b.sectionId === sectionId : !b.sectionId))
        );
      } else {
        const newBm: BookmarkItem = {
          id: `bm-${Date.now()}`,
          chapterId,
          chapterTitle,
          sectionId,
          sectionTitle,
          createdAt: new Date().toISOString(),
        };
        return [newBm, ...prev];
      }
    });
  };

  const removeBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const exportAnnotationsMarkdown = (chapterId?: string): string => {
    const list = chapterId ? annotations.filter((a) => a.chapterId === chapterId) : annotations;
    if (list.length === 0) {
      return '# Mis Anotaciones y Resaltados\n\nNo hay notas registradas.';
    }

    const titleHeader = chapterId
      ? `# Anotaciones - ${allChapters.find((c) => c.id === chapterId)?.title || chapterId}`
      : '# Mis Anotaciones y Resaltados de Lectura\n*Venezuela, Educación e Inteligencia Artificial*';

    const grouped: Record<string, Annotation[]> = {};
    list.forEach((item) => {
      const key = item.chapterTitle || item.chapterId;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    let md = `${titleHeader}\n\n*Generado el ${new Date().toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}*\n\n---\n\n`;

    Object.entries(grouped).forEach(([chapName, items]) => {
      md += `## ${chapName}\n\n`;
      items.forEach((item, idx) => {
        const colorName = {
          yellow: 'Amarillo',
          green: 'Verde',
          blue: 'Azul',
          purple: 'Púrpura',
          rose: 'Rosa',
        }[item.color];

        md += `### ${idx + 1}. Resaltado (${colorName})\n`;
        md += `> "${item.text}"\n\n`;
        if (item.note) {
          md += `**Nota del lector:**\n${item.note}\n\n`;
        }
        md += `*Fecha: ${new Date(item.createdAt).toLocaleString('es-ES')}*\n\n---\n\n`;
      });
    });

    return md;
  };

  const openGlossaryWithTerm = (termIdOrName: string) => {
    const found =
      getGlossaryTermById(termIdOrName) ||
      glossaryTerms.find(
        (t) =>
          t.term.toLowerCase() === termIdOrName.toLowerCase() ||
          t.aliases?.some((a) => a.toLowerCase() === termIdOrName.toLowerCase())
      );
    if (found) {
      setSelectedGlossaryTerm(found);
    }
    setIsGlossaryOpen(true);
  };

  const value = useMemo(
    () => ({
      annotations,
      bookmarks,
      addAnnotation,
      updateAnnotationNote,
      updateAnnotationColor,
      deleteAnnotation,
      clearChapterAnnotations,
      getChapterAnnotations,
      isBookmarked,
      toggleBookmark,
      removeBookmark,
      exportAnnotationsMarkdown,
      isAnnotationsDrawerOpen,
      setIsAnnotationsDrawerOpen,
      isGlossaryOpen,
      setIsGlossaryOpen,
      selectedGlossaryTerm,
      setSelectedGlossaryTerm,
      openGlossaryWithTerm,
      activeAnnotationToEdit,
      setActiveAnnotationToEdit,
    }),
    [
      annotations,
      bookmarks,
      isAnnotationsDrawerOpen,
      isGlossaryOpen,
      selectedGlossaryTerm,
      activeAnnotationToEdit,
    ]
  );

  return <AnnotationContext.Provider value={value}>{children}</AnnotationContext.Provider>;
};

export const useAnnotations = () => {
  const context = useContext(AnnotationContext);
  if (!context) {
    throw new Error('useAnnotations must be used within an AnnotationProvider');
  }
  return context;
};

export const useAnnotationsSafe = () => {
  return useContext(AnnotationContext);
};

