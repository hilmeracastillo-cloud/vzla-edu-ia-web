import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  ExternalLink,
  Play,
  FileText,
  Video,
  Sparkles,
  GraduationCap,
  Bot,
  Brain,
  School,
  Compass,
  BookOpen,
  Calendar,
  Layers,
  CheckCircle2,
  Share2,
  Clock,
  Filter,
  PlusCircle,
  X,
  Link as LinkIcon,
  HardDrive,
  Eye,
} from 'lucide-react';
import {
  DAILY_MEDIA_TOPICS,
  DailyMediaTopic,
  DailyMediaItem,
} from '../data/dailyMediaTopics';
import { bookMeta } from '../data/bookMeta';
import { GoogleDriveManagerModal } from './GoogleDriveManagerModal';
import { DocumentViewerModal } from './DocumentViewerModal';
import { getCustomResourceLinks, CustomResourceLink } from '../utils/googleDrive';

interface DailyMediaViewProps {
  onBackToMenu: () => void;
  onOpenInteractiveFull: () => void;
}

export const DailyMediaView: React.FC<DailyMediaViewProps> = ({
  onBackToMenu,
  onOpenInteractiveFull,
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTabLetter, setActiveTabLetter] = useState<string>('all');
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [cloudLinks, setCloudLinks] = useState<Record<string, CustomResourceLink>>(() =>
    getCustomResourceLinks()
  );

  // In-app Document Viewer Modal State
  const [viewerModalState, setViewerModalState] = useState<{
    isOpen: boolean;
    title: string;
    url: string;
    originalUrl?: string;
    source?: string;
  }>({
    isOpen: false,
    title: '',
    url: '',
  });

  useEffect(() => {
    const handleUpdate = () => {
      setCloudLinks(getCustomResourceLinks());
    };
    window.addEventListener('vzla-custom-links-updated', handleUpdate);
    return () => window.removeEventListener('vzla-custom-links-updated', handleUpdate);
  }, []);

  const [customLinks, setCustomLinks] = useState<Record<string, DailyMediaItem[]>>(() => {
    try {
      const saved = localStorage.getItem('vzla_edu_custom_daily_media');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Modal for quick manual test link addition
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [targetTopicId, setTargetTopicId] = useState<string>('ia-educacion-basica');
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkSource, setNewLinkSource] = useState('');
  const [newLinkType, setNewLinkType] = useState<DailyMediaItem['type']>('news');

  const getTopicIcon = (letter: string) => {
    switch (letter) {
      case 'a':
        return <Brain className="w-5 h-5 text-emerald-400" />;
      case 'b':
        return <Video className="w-5 h-5 text-rose-400" />;
      case 'c':
        return <Sparkles className="w-5 h-5 text-indigo-400" />;
      case 'd':
        return <Bot className="w-5 h-5 text-cyan-400" />;
      case 'e':
        return <GraduationCap className="w-5 h-5 text-amber-400" />;
      case 'f':
        return <Compass className="w-5 h-5 text-purple-400" />;
      case 'g':
        return <School className="w-5 h-5 text-blue-400" />;
      default:
        return <Layers className="w-5 h-5 text-indigo-400" />;
    }
  };

  const handleAddCustomLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;

    const newItem: DailyMediaItem = {
      id: `custom-${Date.now()}`,
      title: newLinkTitle.trim(),
      url: newLinkUrl.trim().startsWith('http') ? newLinkUrl.trim() : `https://${newLinkUrl.trim()}`,
      source: newLinkSource.trim() || 'Aporte personalizado',
      date: new Date().toLocaleDateString('es-VE', { year: 'numeric', month: 'short', day: 'numeric' }),
      type: newLinkType,
      isPlaceholder: false,
    };

    setCustomLinks((prev) => {
      const updated = {
        ...prev,
        [targetTopicId]: [newItem, ...(prev[targetTopicId] || [])],
      };
      try {
        localStorage.setItem('vzla_edu_custom_daily_media', JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving link:', err);
      }
      return updated;
    });

    setNewLinkTitle('');
    setNewLinkUrl('');
    setNewLinkSource('');
    setIsAddLinkModalOpen(false);
  };

  const filteredTopics = useMemo(() => {
    let result = DAILY_MEDIA_TOPICS;

    if (activeTabLetter !== 'all') {
      result = result.filter((topic) => topic.letter === activeTabLetter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.categoryTag.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          t.scopeDescription.toLowerCase().includes(q)
      );
    }

    return result;
  }, [activeTabLetter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#07090E] text-[#EDEDED] flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Sticky Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-[#090D16]/95 backdrop-blur-md border-b border-[#1A2338]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* Back Button with standardized label */}
          <button
            id="btn-daily-media-back-menu"
            onClick={onBackToMenu}
            aria-label="Regresar al Menú de opciones"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-neutral-200 bg-[#121828] hover:bg-[#1a233a] border border-[#232f48] hover:border-indigo-400 hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>Menú de opciones</span>
          </button>

          {/* Center Identity */}
          <div className="flex items-center gap-2 text-center min-w-0">
            <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-[10.5px] font-mono text-indigo-300 font-medium">
              Opción 7 • Noticias & Videos Acumulados
            </span>
            <h1 className="text-xs sm:text-sm font-serif font-bold text-white truncate">
              Noticias o Videos Diarios
            </h1>
          </div>

          {/* Switch to Full Document */}
          <button
            id="btn-daily-media-open-doc"
            onClick={onOpenInteractiveFull}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/60 hover:border-indigo-400 transition-all cursor-pointer shrink-0"
            title="Ir al Documento Interactivo Completo"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Documento Interactivo</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-xs font-mono font-medium">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>Repositorio Dinámico & Curaduría Periódica</span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
            Noticias o Videos diarios acumulados sobre los siguientes temas
          </h2>

          <p className="text-sm sm:text-base text-neutral-300 max-w-3xl mx-auto leading-relaxed">
            Consulte a continuación el menú temático estructurado en <strong>7 áreas clave</strong> de investigación,
            innovación pedagógica y avances en inteligencia artificial. Los enlaces específicos y materiales multimedia
            se actualizarán continuamente según las directrices del autor.
          </p>

          {/* Status Banner */}
          <div className="p-3.5 rounded-xl bg-[#0F1626] border border-[#23314F] text-xs text-neutral-300 max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>
                Los 7 temas cuentan con documentos oficiales activos vinculados y publicados en Google Docs.
              </span>
            </div>
            <div className="text-[11px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-lg">
              7 de 7 vinculados
            </div>
          </div>
        </section>

        {/* Search & Topic Tabs */}
        <section className="space-y-4">
          {/* Search bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar entre los 7 temas (palabras clave, pedagogía, videos, tutores...)"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0D121F] border border-[#1E283F] text-neutral-100 placeholder-neutral-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
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

          {/* Horizontal Topic Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin max-w-full justify-start md:justify-center">
            <button
              onClick={() => setActiveTabLetter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTabLetter === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-[#0E1424] text-neutral-400 hover:text-white border border-[#1E283F] hover:border-neutral-600'
              }`}
            >
              Todos los temas (7)
            </button>

            {DAILY_MEDIA_TOPICS.map((topic) => {
              const isSelected = activeTabLetter === topic.letter;
              return (
                <button
                  key={topic.id}
                  onClick={() => setActiveTabLetter(topic.letter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? `${topic.accentColor.badgeBg} ${topic.accentColor.badgeText} border ${topic.accentColor.border} shadow-md`
                      : 'bg-[#0E1424] text-neutral-400 hover:text-white border border-[#1E283F] hover:border-neutral-600'
                  }`}
                >
                  <span className="font-mono font-bold uppercase">{topic.letter})</span>
                  <span>{topic.title}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 7 Topics Grid / Consultation Menu */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTopics.map((topic) => {
            const topicCustomLinks = customLinks[topic.id] || [];
            const cloudKey = `topic_${topic.letter}`;
            const cloudEntry = cloudLinks[cloudKey];
            const cloudItem: DailyMediaItem | null =
              cloudEntry && cloudEntry.originalUrl
                ? {
                    id: `cloud-${topic.letter}`,
                    title: cloudEntry.title || `${topic.letter}) ${topic.title}`,
                    url: cloudEntry.previewUrl || cloudEntry.downloadUrl,
                    source: cloudEntry.originalUrl.includes('docs.google.com')
                      ? 'Google Docs Oficial (Autor)'
                      : 'Google Drive (Autor)',
                    date: new Date(cloudEntry.updatedAt).toLocaleDateString('es-VE', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    }),
                    type: cloudEntry.originalUrl.includes('docs.google.com')
                      ? 'paper'
                      : topic.letter === 'b'
                      ? 'video'
                      : 'news',
                    isPlaceholder: false,
                  }
                : null;

            // Robust URL normalization to identify same document even with different query params or protocols
            const normalizeUrlForDedup = (u: string) => {
              if (!u) return '';
              return u
                .toLowerCase()
                .replace(/^https?:\/\//, '')
                .replace(/[?#].*$/, '')
                .replace(/\/+$/, '')
                .trim();
            };

            // Combine custom, cloud and topic links
            const rawLinks = [
              ...(cloudItem ? [cloudItem] : []),
              ...topicCustomLinks,
              ...topic.links,
            ];

            const activeLinks: DailyMediaItem[] = [];
            const placeholderLinks: DailyMediaItem[] = [];
            const seenKeys = new Set<string>();

            for (const item of rawLinks) {
              if (item.isPlaceholder || !item.url) {
                placeholderLinks.push(item);
              } else {
                const norm = normalizeUrlForDedup(item.url);
                if (norm && !seenKeys.has(norm)) {
                  seenKeys.add(norm);
                  activeLinks.push(item);
                }
              }
            }

            // If there are real active links, show only the active links (hide placeholders)
            const allLinks = activeLinks.length > 0 ? activeLinks : placeholderLinks;

            return (
              <div
                key={topic.id}
                id={`tema-${topic.letter}`}
                className={`rounded-2xl border ${topic.accentColor.border} bg-gradient-to-b ${topic.accentColor.gradient} p-6 flex flex-col justify-between transition-all hover:shadow-2xl space-y-6 group`}
              >
                {/* Topic Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-8 h-8 rounded-xl ${topic.accentColor.badgeBg} border ${topic.accentColor.border} font-mono text-sm font-bold flex items-center justify-center ${topic.accentColor.iconText}`}>
                        {topic.letter.toUpperCase()}
                      </span>
                      <span className={`text-xs font-mono font-bold uppercase tracking-wider ${topic.accentColor.iconText}`}>
                        {topic.categoryTag}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {getTopicIcon(topic.letter)}
                    </div>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-white group-hover:text-indigo-200 transition-colors">
                    {topic.letter}) {topic.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    {topic.summary}
                  </p>
                </div>

                {/* Links & Consultations Section */}
                <div className="pt-4 border-t border-[#1C263E] space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                    <span className="flex items-center gap-1.5 text-neutral-300">
                      <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Enlaces & Contenidos Diarios:</span>
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#131B2F] border border-[#212E4C]">
                      {allLinks.length} {allLinks.length === 1 ? 'registro' : 'registros'}
                    </span>
                  </div>

                  {/* List of Links / Placeholders */}
                  <div className="space-y-2.5">
                    {allLinks.map((link) => {
                      const isPlaceholder = link.isPlaceholder || !link.url;

                      if (isPlaceholder) {
                        return (
                          <div
                            key={link.id}
                            className="p-3.5 rounded-xl bg-[#080B13]/90 border border-dashed border-[#2A3756] hover:border-neutral-500 transition-all text-xs space-y-1.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-medium text-neutral-300">
                                {link.title}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 border border-amber-800/60 text-amber-300 whitespace-nowrap">
                                Pendiente de URL
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-400 leading-normal">
                              {link.description}
                            </p>
                            {link.source && (
                              <div className="text-[10px] text-neutral-400 font-mono pt-1">
                                Fuente esperada: {link.source}
                              </div>
                            )}
                          </div>
                        );
                      }

                      const isDocument =
                        link.url.includes('docs.google.com') ||
                        link.url.includes('drive.google.com') ||
                        link.type === 'paper';

                      return (
                        <div
                          key={link.id}
                          className="p-4 rounded-xl bg-[#0C1220] border border-[#24314E] hover:border-indigo-500/70 transition-all text-xs flex flex-col space-y-3.5 group/link shadow-sm"
                        >
                          {/* Metadata & Description (without redundant title) */}
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                                {link.source && (
                                  <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 font-medium text-[10.5px]">
                                    {link.source}
                                  </span>
                                )}
                              </div>
                              {link.date && (
                                <span className="text-neutral-400 text-[10.5px]">
                                  {link.date}
                                </span>
                              )}
                            </div>

                            {link.description && (
                              <p className="text-xs text-neutral-300/90 leading-relaxed pt-0.5">
                                {link.description}
                              </p>
                            )}
                          </div>

                          {/* Dedicated Action Bar: Always below title with clean separation */}
                          <div className="pt-3 border-t border-[#1C273E] flex flex-wrap items-center gap-2.5">
                            {isDocument && (
                              <button
                                type="button"
                                onClick={() =>
                                  setViewerModalState({
                                    isOpen: true,
                                    title: link.title,
                                    url: link.url,
                                    originalUrl: link.url,
                                    source: link.source || 'Documento Oficial',
                                  })
                                }
                                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-950/40 active:scale-[0.98]"
                              >
                                <Eye className="w-4 h-4 text-emerald-100" />
                                <span>Leer en Línea</span>
                              </button>
                            )}

                            <a
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-[#141B2D] hover:bg-[#1C2640] border border-[#28385A] hover:border-indigo-400 text-neutral-200 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                              <span>{isDocument ? 'Abrir en Google Docs' : 'Abrir'}</span>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Bottom Return Bar */}
        <section className="pt-8 border-t border-[#1A2338] flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            id="btn-daily-media-bottom-back-menu"
            onClick={onBackToMenu}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-neutral-200 bg-[#121828] hover:bg-[#1b233a] border border-[#232f48] hover:border-indigo-400 hover:text-white transition-all cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>Menú de opciones</span>
          </button>

          <div className="text-xs text-neutral-400 text-center sm:text-right font-mono">
            {bookMeta.program} • {bookMeta.title}
          </div>
        </section>
      </main>

      {/* Quick Add Link Modal */}
      {isAddLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D121F] border border-[#25324D] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-serif font-bold text-white">
                  Registrar Enlace o Video
                </h3>
              </div>
              <button
                onClick={() => setIsAddLinkModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Agregue un enlace para consultar en este tema. Se guardará de forma persistente en su navegador.
            </p>

            <form onSubmit={handleAddCustomLink} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-mono mb-1">
                  Tema de Destino:
                </label>
                <select
                  value={targetTopicId}
                  onChange={(e) => setTargetTopicId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#07090E] border border-[#212E4C] text-neutral-200 focus:outline-none focus:border-indigo-500"
                >
                  {DAILY_MEDIA_TOPICS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.letter}) {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 font-mono mb-1">
                  Título del Contenido:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Nuevo estudio sobre impacto de IA socrática en primaria"
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#07090E] border border-[#212E4C] text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-mono mb-1">
                  URL / Enlace web o YouTube:
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://..."
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#07090E] border border-[#212E4C] text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-mono mb-1">
                    Fuente / Medio:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: YouTube, MIT Tech Review"
                    value={newLinkSource}
                    onChange={(e) => setNewLinkSource(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#07090E] border border-[#212E4C] text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-mono mb-1">
                    Tipo de Formato:
                  </label>
                  <select
                    value={newLinkType}
                    onChange={(e) => setNewLinkType(e.target.value as DailyMediaItem['type'])}
                    className="w-full px-3 py-2 rounded-xl bg-[#07090E] border border-[#212E4C] text-neutral-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="news">Noticia / Artículo</option>
                    <option value="video">Video (YouTube / Vimeo)</option>
                    <option value="guide">Guía / Documento</option>
                    <option value="platform">Plataforma / Bot</option>
                    <option value="school">Escuela / Caso</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddLinkModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#141B2D] text-neutral-300 hover:text-white border border-[#212E4C]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md cursor-pointer"
                >
                  Guardar Enlace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Drive Links Manager Modal */}
      <GoogleDriveManagerModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
      />

      {/* In-App Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={viewerModalState.isOpen}
        onClose={() => setViewerModalState((prev) => ({ ...prev, isOpen: false }))}
        title={viewerModalState.title}
        url={viewerModalState.url}
        originalUrl={viewerModalState.originalUrl}
        source={viewerModalState.source}
      />
    </div>
  );
};
