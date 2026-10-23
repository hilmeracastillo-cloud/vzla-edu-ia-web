/**
 * Google Drive & Cloud Media URL parsing and conversion utilities.
 * Handles extracting file IDs and generating direct preview and download links.
 */

export interface ParsedCloudLink {
  originalUrl: string;
  isGoogleDrive: boolean;
  isGoogleDocs: boolean;
  isYouTube: boolean;
  id?: string;
  previewUrl: string;
  downloadUrl: string;
  type: 'drive' | 'youtube' | 'direct' | 'unknown';
}

/**
 * Extracts Google Drive ID from various URL formats:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * - https://docs.google.com/presentation/d/FILE_ID/...
 * - Raw ID string (alphanumeric with hyphens/underscores, >= 25 chars)
 */
export function extractGoogleDriveId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // If it's a published web doc (/d/e/...), it does not use standard Drive preview/download endpoints
  if (trimmed.includes('/d/e/')) {
    return null;
  }

  // Pattern 1: /file/d/ID or /d/ID
  const fileDMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return fileDMatch[1];
  }

  // Pattern 2: ?id=ID or &id=ID
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    return idParamMatch[1];
  }

  // Pattern 3: Raw Google Drive ID (usually 25-45 characters, alphanumeric with _ -)
  if (/^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Extracts YouTube video ID
 */
export function extractYouTubeId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = trimmed.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

/**
 * Parses any URL into direct and preview links
 */
export function parseCloudMediaUrl(inputUrl: string): ParsedCloudLink {
  const trimmed = (inputUrl || '').trim();

  // Google Docs / Sheets / Slides published document (/pub or /pubhtml)
  if (trimmed.includes('docs.google.com') && (trimmed.includes('/pub') || trimmed.includes('/pubhtml'))) {
    const embeddedUrl = trimmed.includes('?')
      ? (trimmed.includes('embedded=true') ? trimmed : `${trimmed}&embedded=true`)
      : `${trimmed}?embedded=true`;
    return {
      originalUrl: trimmed,
      isGoogleDrive: true,
      isGoogleDocs: true,
      isYouTube: false,
      previewUrl: embeddedUrl,
      downloadUrl: trimmed,
      type: 'drive',
    };
  }

  const driveId = extractGoogleDriveId(trimmed);
  const ytId = extractYouTubeId(trimmed);

  if (driveId) {
    const isDoc = trimmed.includes('docs.google.com');
    return {
      originalUrl: trimmed,
      isGoogleDrive: true,
      isGoogleDocs: isDoc,
      isYouTube: false,
      id: driveId,
      previewUrl: isDoc
        ? trimmed.replace(/\/edit.*$/, '/preview')
        : `https://drive.google.com/file/d/${driveId}/preview`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${driveId}`,
      type: 'drive',
    };
  }

  if (ytId) {
    return {
      originalUrl: trimmed,
      isGoogleDrive: false,
      isGoogleDocs: false,
      isYouTube: true,
      id: ytId,
      previewUrl: `https://www.youtube.com/embed/${ytId}?autoplay=1`,
      downloadUrl: trimmed,
      type: 'youtube',
    };
  }

  const cleanUrl = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
  return {
    originalUrl: trimmed,
    isGoogleDrive: false,
    isGoogleDocs: false,
    isYouTube: false,
    previewUrl: cleanUrl,
    downloadUrl: cleanUrl,
    type: trimmed ? 'direct' : 'unknown',
  };
}

export interface CustomResourceLink {
  resourceId: string;
  title: string;
  originalUrl: string;
  previewUrl: string;
  downloadUrl: string;
  note?: string;
  updatedAt: string;
}

const STORAGE_KEY = 'vzla_edu_custom_resources_v2';

/**
 * Official default links provided by the author
 */
export const DEFAULT_CLOUD_LINKS: Record<string, CustomResourceLink> = {
  topic_a: {
    resourceId: 'topic_a',
    title: 'Tema a: IA en educación — Resumen diario — Histórico acumulado',
    originalUrl:
      'https://docs.google.com/document/d/e/2PACX-1vQQ2Q58HQ_wvyFVsX_rWomRFPmujPTtaDbngPsfQNaP6UeTBB9F0B_ifZqtpo0vbhJvL0vs66SEsol1/pub',
    previewUrl:
      'https://docs.google.com/document/d/e/2PACX-1vQQ2Q58HQ_wvyFVsX_rWomRFPmujPTtaDbngPsfQNaP6UeTBB9F0B_ifZqtpo0vbhJvL0vs66SEsol1/pub?embedded=true',
    downloadUrl:
      'https://docs.google.com/document/d/e/2PACX-1vQQ2Q58HQ_wvyFVsX_rWomRFPmujPTtaDbngPsfQNaP6UeTBB9F0B_ifZqtpo0vbhJvL0vs66SEsol1/pub',
    note: 'Documento oficial publicado por el autor en Google Docs',
    updatedAt: '2026-03-30T00:00:00.000Z',
  },
  topic_b: {
    resourceId: 'topic_b',
    title: 'Tema b: IA en educación — YouTube — Histórico acumulado',
    originalUrl:
      'https://docs.google.com/document/d/e/2PACX-1vSqF7OKjgGE_bW4lut3Zrj8JVO5m_mTKgiEeR31uou8-dsxnncKlwekuwV8EYLyCepl8HNFSJQDWb68/pub',
    previewUrl:
      'https://docs.google.com/document/d/e/2PACX-1vSqF7OKjgGE_bW4lut3Zrj8JVO5m_mTKgiEeR31uou8-dsxnncKlwekuwV8EYLyCepl8HNFSJQDWb68/pub?embedded=true',
    downloadUrl:
      'https://docs.google.com/document/d/e/2PACX-1vSqF7OKjgGE_bW4lut3Zrj8JVO5m_mTKgiEeR31uou8-dsxnncKlwekuwV8EYLyCepl8HNFSJQDWb68/pub',
    note: 'Documento oficial publicado por el autor en Google Docs',
    updatedAt: '2026-03-30T00:00:00.000Z',
  },
  topic_c: {
    resourceId: 'topic_c',
    title: 'Tema c: Tutores socráticos integrales — Noticias — Histórico acumulado',
    originalUrl:
      'https://docs.google.com/document/d/e/2PACX-1vT7TMzSjS51KC8X5lYPYrPJZ0VOx17Q3X2RUuZyVcboi4N4nucDQEI8VWve_XkOzzfuKdNo9IcEAmkp/pub',
    previewUrl:
      'https://docs.google.com/document/d/e/2PACX-1vT7TMzSjS51KC8X5lYPYrPJZ0VOx17Q3X2RUuZyVcboi4N4nucDQEI8VWve_XkOzzfuKdNo9IcEAmkp/pub?embedded=true',
    downloadUrl:
      'https://docs.google.com/document/d/e/2PACX-1vT7TMzSjS51KC8X5lYPYrPJZ0VOx17Q3X2RUuZyVcboi4N4nucDQEI8VWve_XkOzzfuKdNo9IcEAmkp/pub',
    note: 'Documento oficial publicado por el autor en Google Docs',
    updatedAt: '2026-03-30T00:00:00.000Z',
  },
  topic_d: {
    resourceId: 'topic_d',
    title: 'Tema d: Modos educativos de chatbots — YouTube — Histórico acumulado',
    originalUrl:
      'https://docs.google.com/document/d/e/2PACX-1vRaPCYrSuwd9yRappjC2JMONcioxVZAI0wud1pWAYk_sf8-jEae_5J_lWNZMhZVxKhPOFY_WXOh09d_/pub',
    previewUrl:
      'https://docs.google.com/document/d/e/2PACX-1vRaPCYrSuwd9yRappjC2JMONcioxVZAI0wud1pWAYk_sf8-jEae_5J_lWNZMhZVxKhPOFY_WXOh09d_/pub?embedded=true',
    downloadUrl:
      'https://docs.google.com/document/d/e/2PACX-1vRaPCYrSuwd9yRappjC2JMONcioxVZAI0wud1pWAYk_sf8-jEae_5J_lWNZMhZVxKhPOFY_WXOh09d_/pub',
    note: 'Documento oficial publicado por el autor en Google Docs',
    updatedAt: '2026-03-30T00:00:00.000Z',
  },
  topic_e: {
    resourceId: 'topic_e',
    title: 'Tema e: Formación docente K-12 en IA — Noticias — Histórico acumulado',
    originalUrl:
      'https://docs.google.com/document/d/e/2PACX-1vQ0e8MotqkGGhOV9w3wMkhpz3rfWq_dqUOMBNKZGQEq34wWjkui8MthTV4PVrZ-xkLZWpeAp-JRn42Z/pub',
    previewUrl:
      'https://docs.google.com/document/d/e/2PACX-1vQ0e8MotqkGGhOV9w3wMkhpz3rfWq_dqUOMBNKZGQEq34wWjkui8MthTV4PVrZ-xkLZWpeAp-JRn42Z/pub?embedded=true',
    downloadUrl:
      'https://docs.google.com/document/d/e/2PACX-1vQ0e8MotqkGGhOV9w3wMkhpz3rfWq_dqUOMBNKZGQEq34wWjkui8MthTV4PVrZ-xkLZWpeAp-JRn42Z/pub',
    note: 'Documento oficial publicado por el autor en Google Docs',
    updatedAt: '2026-03-30T00:00:00.000Z',
  },
  topic_f: {
    resourceId: 'topic_f',
    title: 'Tema f: Destrezas para la vida — Noticias — Histórico acumulado',
    originalUrl:
      'https://docs.google.com/document/d/e/2PACX-1vR0YMxIrJW_u7JkFPgw98v1v7887mFZP1djzwDRKrCQIHUMC3iGd64az0yL2h5ysSj3NBHcXmgBd2x4/pub',
    previewUrl:
      'https://docs.google.com/document/d/e/2PACX-1vR0YMxIrJW_u7JkFPgw98v1v7887mFZP1djzwDRKrCQIHUMC3iGd64az0yL2h5ysSj3NBHcXmgBd2x4/pub?embedded=true',
    downloadUrl:
      'https://docs.google.com/document/d/e/2PACX-1vR0YMxIrJW_u7JkFPgw98v1v7887mFZP1djzwDRKrCQIHUMC3iGd64az0yL2h5ysSj3NBHcXmgBd2x4/pub',
    note: 'Documento oficial publicado por el autor en Google Docs',
    updatedAt: '2026-03-30T00:00:00.000Z',
  },
  topic_g: {
    resourceId: 'topic_g',
    title: 'Tema g: Escuelas con Tutores Socráticos AI o con Currículo Innovador',
    originalUrl:
      'https://docs.google.com/document/d/e/2PACX-1vT1-7AVEQH4IxsdyhVGfMq96dldUemAiTlnJ7Kz9Hx0Suf3C8dPXjt8EKfIPmjtAQuoXFTEIGsRUbZ3/pub',
    previewUrl:
      'https://docs.google.com/document/d/e/2PACX-1vT1-7AVEQH4IxsdyhVGfMq96dldUemAiTlnJ7Kz9Hx0Suf3C8dPXjt8EKfIPmjtAQuoXFTEIGsRUbZ3/pub?embedded=true',
    downloadUrl:
      'https://docs.google.com/document/d/e/2PACX-1vT1-7AVEQH4IxsdyhVGfMq96dldUemAiTlnJ7Kz9Hx0Suf3C8dPXjt8EKfIPmjtAQuoXFTEIGsRUbZ3/pub',
    note: 'Documento oficial publicado por el autor en Google Docs',
    updatedAt: '2026-03-30T00:00:00.000Z',
  },
};

export function getCustomResourceLinks(): Record<string, CustomResourceLink> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      ...DEFAULT_CLOUD_LINKS,
      ...parsed,
    };
  } catch {
    return { ...DEFAULT_CLOUD_LINKS };
  }
}

export function saveCustomResourceLink(
  resourceId: string,
  title: string,
  url: string,
  note?: string
): CustomResourceLink | null {
  if (!url || !url.trim()) return null;
  const parsed = parseCloudMediaUrl(url);
  const record: CustomResourceLink = {
    resourceId,
    title,
    originalUrl: url.trim(),
    previewUrl: parsed.previewUrl,
    downloadUrl: parsed.downloadUrl,
    note,
    updatedAt: new Date().toISOString(),
  };

  try {
    const current = getCustomResourceLinks();
    current[resourceId] = record;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    // Trigger custom event so any component listening updates immediately
    window.dispatchEvent(new Event('vzla-custom-links-updated'));
  } catch (err) {
    console.error('Error saving custom resource link:', err);
  }
  return record;
}

export function saveBulkResourceLinks(
  items: Array<{ resourceId: string; title: string; url: string }>
): number {
  let count = 0;
  const current = getCustomResourceLinks();
  for (const item of items) {
    if (item.url && item.url.trim()) {
      const parsed = parseCloudMediaUrl(item.url);
      current[item.resourceId] = {
        resourceId: item.resourceId,
        title: item.title,
        originalUrl: item.url.trim(),
        previewUrl: parsed.previewUrl,
        downloadUrl: parsed.downloadUrl,
        updatedAt: new Date().toISOString(),
      };
      count++;
    }
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new Event('vzla-custom-links-updated'));
  } catch (err) {
    console.error('Error in saveBulkResourceLinks:', err);
  }
  return count;
}
