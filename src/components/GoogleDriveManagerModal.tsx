import React, { useState, useEffect } from 'react';
import {
  X,
  Link as LinkIcon,
  HardDrive,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Info,
  HelpCircle,
  FileText,
  Video,
  Image as ImageIcon,
  BookOpen,
  Layers,
  Save,
  Trash2,
  AlertTriangle,
  ClipboardPaste,
} from 'lucide-react';
import {
  parseCloudMediaUrl,
  getCustomResourceLinks,
  saveCustomResourceLink,
  CustomResourceLink,
} from '../utils/googleDrive';
import { DAILY_MEDIA_TOPICS } from '../data/dailyMediaTopics';

interface GoogleDriveManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopicLetter?: string;
}

export const GoogleDriveManagerModal: React.FC<GoogleDriveManagerModalProps> = ({
  isOpen,
  onClose,
  initialTopicLetter,
}) => {
  const [activeTab, setActiveTab] = useState<'individual' | 'bulk' | 'chat-helper'>('bulk');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  // Stored links
  const [storedLinks, setStoredLinks] = useState<Record<string, CustomResourceLink>>({});

  // Individual fields state
  const [linksForm, setLinksForm] = useState<Record<string, string>>({
    infografia: '',
    resumen: '',
    video: '',
    presentacion: '',
    completo: '',
    topic_a: '',
    topic_b: '',
    topic_c: '',
    topic_d: '',
    topic_e: '',
    topic_f: '',
    topic_g: '',
  });

  // Bulk paste text area
  const [bulkText, setBulkText] = useState<string>('');

  // Load existing links on open
  useEffect(() => {
    if (isOpen) {
      const current = getCustomResourceLinks();
      setStoredLinks(current);

      // Pre-fill form
      const newForm: Record<string, string> = { ...linksForm };
      Object.keys(current).forEach((key) => {
        newForm[key] = current[key]?.originalUrl || '';
      });
      setLinksForm(newForm);

      if (initialTopicLetter) {
        setActiveTab('individual');
      }
    }
  }, [isOpen, initialTopicLetter]);

  if (!isOpen) return null;

  const showCopyToast = (msg: string) => {
    setCopiedNotification(msg);
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  const showSavedToast = (msg: string) => {
    setSavedNotification(msg);
    setTimeout(() => setSavedNotification(null), 3000);
  };

  const handleSaveIndividual = (key: string, title: string) => {
    const val = linksForm[key] || '';
    if (!val.trim()) {
      // Remove if empty
      const updated = { ...storedLinks };
      delete updated[key];
      localStorage.setItem('vzla_edu_custom_resources_v2', JSON.stringify(updated));
      setStoredLinks(updated);
      window.dispatchEvent(new Event('vzla-custom-links-updated'));
      showSavedToast(`Enlace de "${title}" eliminado.`);
      return;
    }

    const saved = saveCustomResourceLink(key, title, val);
    if (saved) {
      setStoredLinks((prev) => ({ ...prev, [key]: saved }));
      showSavedToast(`¡Enlace para "${title}" guardado exitosamente!`);
    }
  };

  const handleBulkProcess = () => {
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n');
    let updatedCount = 0;
    const newForm = { ...linksForm };

    const mappings: Array<{ regex: RegExp; key: string; title: string }> = [
      { regex: /(infograf[ií]a|formato\s*1|^1[\.\:\-\s])/i, key: 'infografia', title: '1-. Infografía HD' },
      { regex: /(resumen\s*ejecutivo|formato\s*2|^2[\.\:\-\s])/i, key: 'resumen', title: '2-. Resumen Ejecutivo Stand Alone' },
      { regex: /(resumen\s*de\s*video|video|youtube|formato\s*3|^3[\.\:\-\s])/i, key: 'video', title: '3-. Resumen de Video' },
      { regex: /(presentaci[oó]n|slides|diapositivas|formato\s*4|^4[\.\:\-\s])/i, key: 'presentacion', title: '4-. Presentación' },
      { regex: /(documento\s*completo|libro\s*completo|formato\s*5|^5[\.\:\-\s])/i, key: 'completo', title: '5-. Documento Completo' },
      { regex: /(tema\s*a|educaci[oó]n\s*b[aá]sica|^a[\.\:\-\s])/i, key: 'topic_a', title: 'Opción 7a: IA en Educación Básica' },
      { regex: /(tema\s*b|youtube\s*videos|^b[\.\:\-\s])/i, key: 'topic_b', title: 'Opción 7b: Videos de YouTube' },
      { regex: /(tema\s*c|tutores\s*socr[aá]ticos|^c[\.\:\-\s])/i, key: 'topic_c', title: 'Opción 7c: Tutores Socráticos' },
      { regex: /(tema\s*d|chatbots\s*l[ií]deres|^d[\.\:\-\s])/i, key: 'topic_d', title: 'Opción 7d: Chatbots Líderes' },
      { regex: /(tema\s*e|formaci[oó]n\s*docente|^e[\.\:\-\s])/i, key: 'topic_e', title: 'Opción 7e: Formación Docente' },
      { regex: /(tema\s*f|destrezas\s*para\s*la\s*vida|^f[\.\:\-\s])/i, key: 'topic_f', title: 'Opción 7f: Destrezas para la Vida' },
      { regex: /(tema\s*g|escuelas|^g[\.\:\-\s])/i, key: 'topic_g', title: 'Opción 7g: Escuelas Innovadoras' },
    ];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Check if line contains a URL
      const urlMatch = trimmed.match(/(https?:\/\/[^\s]+|drive\.google\.com\/[^\s]+|docs\.google\.com\/[^\s]+)/);
      if (!urlMatch) return;

      const foundUrl = urlMatch[1];

      // Identify which resource it belongs to
      for (const m of mappings) {
        if (m.regex.test(trimmed)) {
          saveCustomResourceLink(m.key, m.title, foundUrl);
          newForm[m.key] = foundUrl;
          updatedCount++;
          break;
        }
      }
    });

    setLinksForm(newForm);
    setStoredLinks(getCustomResourceLinks());
    showSavedToast(`¡Se procesaron y guardaron ${updatedCount} enlaces exitosamente!`);
  };

  const handleInsertTemplate = () => {
    setBulkText(
`1-. Infografía: https://drive.google.com/file/d/TU_ID_AQUI/view?usp=sharing
2-. Resumen Ejecutivo: https://drive.google.com/file/d/TU_ID_AQUI/view?usp=sharing
3-. Video: https://youtu.be/TU_VIDEO_ID
4-. Presentación: https://drive.google.com/file/d/TU_ID_AQUI/view?usp=sharing
5-. Documento Completo: https://drive.google.com/file/d/TU_ID_AQUI/view?usp=sharing
a-. IA Educación Básica: https://docs.google.com/document/d/e/2PACX-1vQQ2Q58HQ_wvyFVsX_rWomRFPmujPTtaDbngPsfQNaP6UeTBB9F0B_ifZqtpo0vbhJvL0vs66SEsol1/pub
b-. Videos de YouTube: https://drive.google.com/file/d/TU_ID_AQUI/view?usp=sharing
c-. Tutores Socráticos: https://drive.google.com/file/d/TU_ID_AQUI/view?usp=sharing
d-. Chatbots Líderes: https://drive.google.com/file/d/TU_ID_AQUI/view?usp=sharing
e-. Formación Docente: https://drive.google.com/file/d/TU_ID_AQUI/view?usp=sharing
f-. Destrezas para la Vida: https://drive.google.com/file/d/TU_ID_AQUI/view?usp=sharing
g-. Escuelas Innovadoras: https://drive.google.com/file/d/TU_ID_AQUI/view?usp=sharing`
    );
  };

  const generateCleanChatText = () => {
    const list: string[] = [];
    if (linksForm.infografia) list.push(`- 1. Infografía: ${linksForm.infografia.trim()}`);
    if (linksForm.resumen) list.push(`- 2. Resumen Ejecutivo: ${linksForm.resumen.trim()}`);
    if (linksForm.video) list.push(`- 3. Video: ${linksForm.video.trim()}`);
    if (linksForm.presentacion) list.push(`- 4. Presentación: ${linksForm.presentacion.trim()}`);
    if (linksForm.completo) list.push(`- 5. Documento Completo: ${linksForm.completo.trim()}`);
    if (linksForm.topic_a) list.push(`- 7a. IA en Educación Básica: ${linksForm.topic_a.trim()}`);
    if (linksForm.topic_b) list.push(`- 7b. Videos YouTube: ${linksForm.topic_b.trim()}`);
    if (linksForm.topic_c) list.push(`- 7c. Tutores Socráticos: ${linksForm.topic_c.trim()}`);
    if (linksForm.topic_d) list.push(`- 7d. Chatbots Líderes: ${linksForm.topic_d.trim()}`);
    if (linksForm.topic_e) list.push(`- 7e. Formación Docente: ${linksForm.topic_e.trim()}`);
    if (linksForm.topic_f) list.push(`- 7f. Destrezas para la Vida: ${linksForm.topic_f.trim()}`);
    if (linksForm.topic_g) list.push(`- 7g. Escuelas Innovadoras: ${linksForm.topic_g.trim()}`);

    if (list.length === 0) {
      return 'Aquí tienes los enlaces de mi Google Drive:\n\n1. Infografía: [pega enlace aquí]\n2. Resumen: [pega enlace aquí]\n3. Video: [pega enlace aquí]\n4. Presentación: [pega enlace aquí]';
    }

    return `Aquí están mis enlaces limpios de Google Drive para la aplicación:\n\n${list.join('\n')}`;
  };

  const handleCopyCleanChat = () => {
    const text = generateCleanChatText();
    navigator.clipboard.writeText(text);
    showCopyToast('¡Texto limpio copiado al portapapeles! Ya puedes pegarlo en el chat.');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] bg-[#0c101a] border border-indigo-700/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#1c2438] bg-[#0f1422] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-600 flex items-center justify-center text-white shadow-lg">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif font-bold text-white">
                  Gestor de Enlaces de Google Drive & Nube
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-700/60 font-semibold">
                  Sincronizador Rápido
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Pega tus archivos de Drive directamente en la app o genera un texto limpio sin errores para el chat.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-all cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drive Sharing Helper Notice */}
        <div className="bg-amber-950/40 border-b border-amber-800/50 px-4 py-2.5 text-xs text-amber-200/90 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300">Regla clave de Google Drive:</strong> Asegúrate de que tus enlaces tengan permiso configurado como{' '}
            <span className="underline font-bold text-white">"Cualquier persona con el enlace (Lector)"</span>. Si está en "Restringido (Solo tú)", nadie ni el visor podrá acceder a ellos.
          </div>
        </div>

        {/* Toast Notices */}
        {savedNotification && (
          <div className="bg-emerald-950 border-b border-emerald-700/70 px-4 py-2 text-xs text-emerald-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{savedNotification}</span>
          </div>
        )}
        {copiedNotification && (
          <div className="bg-cyan-950 border-b border-cyan-700/70 px-4 py-2 text-xs text-cyan-200 flex items-center gap-2">
            <ClipboardPaste className="w-4 h-4 text-cyan-400" />
            <span>{copiedNotification}</span>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex border-b border-[#1c2438] bg-[#090d16] px-4 pt-2 gap-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-4 py-2.5 rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-t border-x ${
              activeTab === 'bulk'
                ? 'bg-[#0c101a] text-cyan-300 border-cyan-600/70 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200 border-transparent hover:bg-white/5'
            }`}
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>Pegado Rápido Masivo</span>
          </button>

          <button
            onClick={() => setActiveTab('individual')}
            className={`px-4 py-2.5 rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-t border-x ${
              activeTab === 'individual'
                ? 'bg-[#0c101a] text-indigo-300 border-indigo-600/70 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200 border-transparent hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Por Formato (1 al 7)</span>
          </button>

          <button
            onClick={() => setActiveTab('chat-helper')}
            className={`px-4 py-2.5 rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-t border-x ${
              activeTab === 'chat-helper'
                ? 'bg-[#0c101a] text-amber-300 border-amber-600/70 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200 border-transparent hover:bg-white/5'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>¿Por qué falla el Copy-Paste en el Chat?</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: BULK PASTE */}
          {activeTab === 'bulk' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Pegar todos tus enlaces juntos</span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Pega varias líneas con el número (1, 2, 3...) o tema (a, b, c...) y la URL de Google Drive.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleInsertTemplate}
                  className="px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-600/60 text-indigo-300 text-xs font-mono transition-all cursor-pointer"
                >
                  Insertar Plantilla de Ejemplo
                </button>
              </div>

              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={9}
                placeholder="Pega aquí tus enlaces de Google Drive, por ejemplo:
1-. https://drive.google.com/file/d/1abc.../view?usp=sharing
2-. https://drive.google.com/file/d/2xyz.../view?usp=sharing
3-. https://youtu.be/...
a-. https://drive.google.com/file/d/3qwe.../view?usp=sharing"
                className="w-full p-3.5 rounded-xl bg-[#080b12] border border-[#232d46] text-xs font-mono text-cyan-200 placeholder:text-neutral-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all leading-relaxed"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-[11px] text-neutral-400">
                  El sistema detecta automáticamente enlaces de Drive, PDFs, videos de YouTube e imágenes.
                </div>

                <button
                  type="button"
                  onClick={handleBulkProcess}
                  disabled={!bulkText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Procesar y Guardar en la Aplicación</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: INDIVIDUAL FORMAT ASSIGNMENT */}
          {activeTab === 'individual' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>Recursos Principales de la Investigación (1 al 5)</span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Asigna el enlace de Drive para cada uno de los formatos descargables y visores en línea.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1-. Infografía */}
                <div className="p-3.5 rounded-xl bg-[#090d16] border border-emerald-900/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400">1-. Infografía (JPG / PDF)</span>
                    {storedLinks.infografia && (
                      <span className="text-[10px] text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        Configurado
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={linksForm.infografia}
                    onChange={(e) => setLinksForm({ ...linksForm, infografia: e.target.value })}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full px-3 py-2 rounded-lg bg-[#05070c] border border-emerald-900/60 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    {storedLinks.infografia && (
                      <a
                        href={storedLinks.infografia.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-neutral-400 hover:text-emerald-300 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Probar
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSaveIndividual('infografia', '1-. Infografía')}
                      className="px-3 py-1 bg-emerald-900 hover:bg-emerald-800 text-emerald-200 text-xs rounded font-medium cursor-pointer"
                    >
                      Guardar
                    </button>
                  </div>
                </div>

                {/* 2-. Resumen Ejecutivo */}
                <div className="p-3.5 rounded-xl bg-[#090d16] border border-cyan-900/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400">2-. Resumen Ejecutivo (PDF)</span>
                    {storedLinks.resumen && (
                      <span className="text-[10px] text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                        Configurado
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={linksForm.resumen}
                    onChange={(e) => setLinksForm({ ...linksForm, resumen: e.target.value })}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full px-3 py-2 rounded-lg bg-[#05070c] border border-cyan-900/60 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-cyan-500"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    {storedLinks.resumen && (
                      <a
                        href={storedLinks.resumen.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-neutral-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Probar
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSaveIndividual('resumen', '2-. Resumen Ejecutivo')}
                      className="px-3 py-1 bg-cyan-900 hover:bg-cyan-800 text-cyan-200 text-xs rounded font-medium cursor-pointer"
                    >
                      Guardar
                    </button>
                  </div>
                </div>

                {/* 3-. Video Resumen */}
                <div className="p-3.5 rounded-xl bg-[#090d16] border border-rose-900/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400">3-. Resumen de Video (YouTube o Drive)</span>
                    {storedLinks.video && (
                      <span className="text-[10px] text-rose-300 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                        Configurado
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={linksForm.video}
                    onChange={(e) => setLinksForm({ ...linksForm, video: e.target.value })}
                    placeholder="https://youtu.be/... o drive.google.com/..."
                    className="w-full px-3 py-2 rounded-lg bg-[#05070c] border border-rose-900/60 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-rose-500"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    {storedLinks.video && (
                      <a
                        href={storedLinks.video.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-neutral-400 hover:text-rose-300 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Probar
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSaveIndividual('video', '3-. Resumen de Video')}
                      className="px-3 py-1 bg-rose-900 hover:bg-rose-800 text-rose-200 text-xs rounded font-medium cursor-pointer"
                    >
                      Guardar
                    </button>
                  </div>
                </div>

                {/* 4-. Presentación */}
                <div className="p-3.5 rounded-xl bg-[#090d16] border border-amber-900/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">4-. Presentación 35 Slides (PDF / Slides)</span>
                    {storedLinks.presentacion && (
                      <span className="text-[10px] text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                        Configurado
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={linksForm.presentacion}
                    onChange={(e) => setLinksForm({ ...linksForm, presentacion: e.target.value })}
                    placeholder="https://drive.google.com/file/d/... o slides"
                    className="w-full px-3 py-2 rounded-lg bg-[#05070c] border border-amber-900/60 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    {storedLinks.presentacion && (
                      <a
                        href={storedLinks.presentacion.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-neutral-400 hover:text-amber-300 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Probar
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSaveIndividual('presentacion', '4-. Presentación')}
                      className="px-3 py-1 bg-amber-900 hover:bg-amber-800 text-amber-200 text-xs rounded font-medium cursor-pointer"
                    >
                      Guardar
                    </button>
                  </div>
                </div>

                {/* 5-. Documento Completo */}
                <div className="p-3.5 rounded-xl bg-[#090d16] border border-blue-900/50 space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400">5-. Documento Completo (PDF 100 Páginas)</span>
                    {storedLinks.completo && (
                      <span className="text-[10px] text-blue-300 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                        Configurado
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={linksForm.completo}
                    onChange={(e) => setLinksForm({ ...linksForm, completo: e.target.value })}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full px-3 py-2 rounded-lg bg-[#05070c] border border-blue-900/60 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    {storedLinks.completo && (
                      <a
                        href={storedLinks.completo.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-neutral-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Probar
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSaveIndividual('completo', '5-. Documento Completo')}
                      className="px-3 py-1 bg-blue-900 hover:bg-blue-800 text-blue-200 text-xs rounded font-medium cursor-pointer"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </div>

              {/* Opción 7: Temas a-g */}
              <div className="pt-4 border-t border-[#1c2438] space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>Opción 7: Noticias o Videos Diarios (Temas a al g)</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {DAILY_MEDIA_TOPICS.map((topic) => {
                    const key = `topic_${topic.letter}`;
                    return (
                      <div key={topic.id} className="p-3 rounded-xl bg-[#080b12] border border-[#1e293b] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-indigo-300">
                            {topic.letter}) {topic.title}
                          </span>
                          {storedLinks[key] && (
                            <span className="text-[10px] text-emerald-300 bg-emerald-950 px-1.5 py-0.5 rounded">
                              Guardado
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={linksForm[key] || ''}
                          onChange={(e) => setLinksForm({ ...linksForm, [key]: e.target.value })}
                          placeholder="Enlace de Drive o YouTube..."
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#05070c] border border-[#232d46] text-xs text-neutral-200"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveIndividual(key, `${topic.letter}) ${topic.title}`)}
                            className="px-2.5 py-1 bg-indigo-900 hover:bg-indigo-800 text-indigo-200 text-xs rounded font-medium cursor-pointer"
                          >
                            Guardar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WHY CHAT REJECTS AND HOW TO FIX IT */}
          {activeTab === 'chat-helper' && (
            <div className="space-y-5 text-xs text-neutral-300 leading-relaxed">
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-700/50 space-y-2">
                <h4 className="font-bold text-sm text-indigo-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  ¿Por qué falla el "Copy - Paste" de Google Drive en el chat?
                </h4>
                <p>
                  Cuando copias un enlace directamente desde Google Drive (con el botón "Copiar enlace"), Google no copia solo el texto de la URL; también copia <strong>código HTML enriquecido y metadatos ocultos</strong> en el portapapeles. Los campos de texto de los navegadores y chats a menudo rechazan o congelan ese formato enriquecido.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#090d16] border border-[#1e293b] space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 font-bold flex items-center justify-center font-mono">
                    1
                  </div>
                  <h5 className="font-bold text-white text-xs">Pegar como Texto Plano</h5>
                  <p className="text-neutral-400 text-[11.5px]">
                    En tu teclado, en vez de presionar <code className="text-neutral-200">Ctrl + V</code>, presiona:
                  </p>
                  <div className="p-2 rounded bg-[#05070c] text-center font-mono text-cyan-300 font-bold text-xs border border-cyan-900">
                    Ctrl + Shift + V (Windows)
                    <br />
                    Cmd + Shift + V (Mac)
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#090d16] border border-[#1e293b] space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-950 text-cyan-400 font-bold flex items-center justify-center font-mono">
                    2
                  </div>
                  <h5 className="font-bold text-white text-xs">Quitar el "https://"</h5>
                  <p className="text-neutral-400 text-[11.5px]">
                    A veces el filtro del navegador bloquea enlaces completos. Si pegas solo:
                  </p>
                  <div className="p-2 rounded bg-[#05070c] text-center font-mono text-cyan-300 font-bold text-xs border border-cyan-900">
                    drive.google.com/file/d/...
                  </div>
                  <p className="text-neutral-400 text-[11.5px]">
                    o solo el código ID alfanumérico, el chat lo aceptará inmediatamente.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#090d16] border border-[#1e293b] space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-950 text-amber-400 font-bold flex items-center justify-center font-mono">
                    3
                  </div>
                  <h5 className="font-bold text-white text-xs">Permisos en Google Drive</h5>
                  <p className="text-neutral-400 text-[11.5px]">
                    En Drive haz clic en <strong>Compartir</strong> y asegúrate de cambiar de "Restringido" a:
                  </p>
                  <div className="p-2 rounded bg-[#05070c] text-center font-mono text-amber-300 font-bold text-xs border border-amber-900">
                    "Cualquier persona con el enlace"
                  </div>
                </div>
              </div>

              {/* Fast Copy for Chat Tool */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-white text-xs">Herramienta: Copiar lista limpia para el chat</h5>
                    <p className="text-neutral-400 text-[11.5px]">
                      Usa este botón para copiar todos los enlaces que hayas ingresado en formato texto limpio sin errores:
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCleanChat}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Lista Limpia para el Chat</span>
                  </button>
                </div>

                <pre className="p-3 rounded-xl bg-[#05070c] border border-[#1e293b] text-[11px] font-mono text-neutral-300 whitespace-pre-wrap select-all">
                  {generateCleanChatText()}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#1c2438] bg-[#090d16] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-neutral-400">
            Los enlaces guardados aquí se aplican inmediatamente a los botones de descarga y visores de la app.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1e293b] hover:bg-[#283548] text-white font-medium cursor-pointer transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
