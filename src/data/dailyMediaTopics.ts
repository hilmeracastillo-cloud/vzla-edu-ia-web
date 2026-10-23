export interface DailyMediaItem {
  id: string;
  title: string;
  url: string;
  source?: string;
  date?: string;
  type: 'news' | 'video' | 'platform' | 'guide' | 'school' | 'paper';
  description?: string;
  isPlaceholder?: boolean;
}

export interface DailyMediaTopic {
  id: string;
  letter: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g';
  title: string;
  categoryTag: string;
  summary: string;
  scopeDescription: string;
  accentColor: {
    badgeBg: string;
    badgeText: string;
    border: string;
    hoverBorder: string;
    gradient: string;
    iconText: string;
  };
  links: DailyMediaItem[];
}

export const DAILY_MEDIA_TOPICS: DailyMediaTopic[] = [
  {
    id: 'ia-educacion-basica',
    letter: 'a',
    title: 'IA en Educación Básica — Resumen Diario',
    categoryTag: 'Noticias Diarias K-12 & Políticas',
    summary:
      'Monitoreo diario de noticias globales sobre adopción de IA en educación básica: incluye las 5 principales ideas de cada noticia y los links activos a cada fuente de información original, ordenados cronológicamente.',
    scopeDescription:
      'Seguimiento de novedades legislativas, acuerdos con tecnológicas (Google, Microsoft, Adobe, IBM) y marcos éticos orientados a la formación de estudiantes K-12.',
    accentColor: {
      badgeBg: 'bg-emerald-950/80',
      badgeText: 'text-emerald-300',
      border: 'border-emerald-700/60',
      hoverBorder: 'hover:border-emerald-400',
      gradient: 'from-emerald-950/40 via-[#0d1612] to-[#07090e]',
      iconText: 'text-emerald-400',
    },
    links: [
      {
        id: 'doc-oficial-tema-a',
        title: 'Documento Oficial: IA en educación — Resumen diario — Histórico acumulado',
        url: 'https://docs.google.com/document/d/e/2PACX-1vQQ2Q58HQ_wvyFVsX_rWomRFPmujPTtaDbngPsfQNaP6UeTBB9F0B_ifZqtpo0vbhJvL0vs66SEsol1/pub',
        source: 'Google Docs Oficial (Autor)',
        date: 'Publicado y Activo',
        type: 'paper',
        description:
          'Documento oficial acumulativo en Google Docs. Integra las 5 principales ideas de cada noticia y los links activos a cada fuente de información original.',
        isPlaceholder: false,
      },
    ],
  },
  {
    id: 'youtube-ia-educacion-basica',
    letter: 'b',
    title: 'Videos de YouTube sobre IA en Educación Básica',
    categoryTag: 'Curaduría Audiovisual & 10 Ideas Clave',
    summary:
      'Revisión acumulativa diaria de producciones de YouTube sobre IA educativa: incluye las 5 principales ideas de cada video y los links activos a cada fuente de información audiovisual.',
    scopeDescription:
      'Análisis de clases grabadas, demostraciones didácticas, webinars y tutoriales con fichas analíticas de 10 aprendizajes concretos para educadores.',
    accentColor: {
      badgeBg: 'bg-rose-950/80',
      badgeText: 'text-rose-300',
      border: 'border-rose-700/60',
      hoverBorder: 'hover:border-rose-400',
      gradient: 'from-rose-950/40 via-[#180e12] to-[#07090e]',
      iconText: 'text-rose-400',
    },
    links: [
      {
        id: 'doc-oficial-tema-b',
        title: 'Documento Oficial: IA en educación — YouTube — Histórico acumulado',
        url: 'https://docs.google.com/document/d/e/2PACX-1vSqF7OKjgGE_bW4lut3Zrj8JVO5m_mTKgiEeR31uou8-dsxnncKlwekuwV8EYLyCepl8HNFSJQDWb68/pub',
        source: 'Google Docs Oficial (Autor)',
        date: 'Publicado y Activo',
        type: 'paper',
        description:
          'Documento oficial acumulativo en Google Docs. Integra las 5 principales ideas de cada video y los links activos a cada fuente de información audiovisual.',
        isPlaceholder: false,
      },
    ],
  },
  {
    id: 'tutores-socraticos-integrales',
    letter: 'c',
    title: 'Tutores Socráticos Integrales',
    categoryTag: 'Diálogo Guiado & Andamiaje Cognitivo',
    summary:
      'Monitoreo especializado de avances en tutores de IA basados en diálogo mayéutico: incluye las 5 principales ideas de cada noticia y los links activos a cada fuente de información técnica y de campo.',
    scopeDescription:
      'Seguimiento a plataformas algorítmicas, modelos tecno-pedagógicos (Khanmigo, Mathia, NEMA) y agentes conversacionales de tutoría reflexiva.',
    accentColor: {
      badgeBg: 'bg-indigo-950/80',
      badgeText: 'text-indigo-300',
      border: 'border-indigo-700/60',
      hoverBorder: 'hover:border-indigo-400',
      gradient: 'from-indigo-950/40 via-[#101426] to-[#07090e]',
      iconText: 'text-indigo-400',
    },
    links: [
      {
        id: 'doc-oficial-tema-c',
        title: 'Documento Oficial: Tutores socráticos integrales — Noticias — Histórico acumulado',
        url: 'https://docs.google.com/document/d/e/2PACX-1vT7TMzSjS51KC8X5lYPYrPJZ0VOx17Q3X2RUuZyVcboi4N4nucDQEI8VWve_XkOzzfuKdNo9IcEAmkp/pub',
        source: 'Google Docs Oficial (Autor)',
        date: 'Publicado y Activo',
        type: 'paper',
        description:
          'Documento oficial acumulativo en Google Docs. Integra las 5 principales ideas de cada noticia y los links activos a cada fuente de información técnica y de campo.',
        isPlaceholder: false,
      },
    ],
  },
  {
    id: 'modos-educativos-chatbots',
    letter: 'd',
    title: 'Modos Educativos de Chatbots Líderes',
    categoryTag: 'Prompts Prácticos & Study Modes',
    summary:
      'Curaduría sobre configuraciones pedagógicas, prompts y modos de estudio en chatbots: incluye las 5 principales ideas de cada video o noticia y los links activos a cada fuente de información.',
    scopeDescription:
      'Instrucciones del sistema, restricciones pedagógicas y técnicas prácticas para convertir chatbots comerciales en tutores personales de estudio guiado.',
    accentColor: {
      badgeBg: 'bg-cyan-950/80',
      badgeText: 'text-cyan-300',
      border: 'border-cyan-700/60',
      hoverBorder: 'hover:border-cyan-400',
      gradient: 'from-cyan-950/40 via-[#0c1822] to-[#07090e]',
      iconText: 'text-cyan-400',
    },
    links: [
      {
        id: 'doc-oficial-tema-d',
        title: 'Documento Oficial: Modos educativos de chatbots — YouTube — Histórico acumulado',
        url: 'https://docs.google.com/document/d/e/2PACX-1vRaPCYrSuwd9yRappjC2JMONcioxVZAI0wud1pWAYk_sf8-jEae_5J_lWNZMhZVxKhPOFY_WXOh09d_/pub',
        source: 'Google Docs Oficial (Autor)',
        date: 'Publicado y Activo',
        type: 'paper',
        description:
          'Documento oficial acumulativo en Google Docs. Integra las 5 principales ideas de cada video o noticia y los links activos a cada fuente de información.',
        isPlaceholder: false,
      },
    ],
  },
  {
    id: 'formacion-docente-ia',
    letter: 'e',
    title: 'Formación Docente K-12 en IA',
    categoryTag: 'Capacitación Magistral & Estudios de Campo',
    summary:
      'Compilación diaria de noticias y casos internacionales sobre capacitación docente en IA: incluye las 5 principales ideas de cada noticia y los links activos a cada fuente de información institucional.',
    scopeDescription:
      'Iniciativas en América Latina, EE.UU. y Asia para desarrollar la alfabetización algorítmica docente y empoderar al educador como mediador tecnológico.',
    accentColor: {
      badgeBg: 'bg-amber-950/80',
      badgeText: 'text-amber-300',
      border: 'border-amber-700/60',
      hoverBorder: 'hover:border-amber-400',
      gradient: 'from-amber-950/40 via-[#1b1509] to-[#07090e]',
      iconText: 'text-amber-400',
    },
    links: [
      {
        id: 'doc-oficial-tema-e',
        title: 'Documento Oficial: Formación docente K-12 en IA — Noticias — Histórico acumulado',
        url: 'https://docs.google.com/document/d/e/2PACX-1vQ0e8MotqkGGhOV9w3wMkhpz3rfWq_dqUOMBNKZGQEq34wWjkui8MthTV4PVrZ-xkLZWpeAp-JRn42Z/pub',
        source: 'Google Docs Oficial (Autor)',
        date: 'Publicado y Activo',
        type: 'paper',
        description:
          'Documento oficial acumulativo en Google Docs. Integra las 5 principales ideas de cada noticia y los links activos a cada fuente de información institucional.',
        isPlaceholder: false,
      },
    ],
  },
  {
    id: 'destrezas-para-la-vida',
    letter: 'f',
    title: 'Destrezas para la Vida',
    categoryTag: 'Habilidades Humanas & Siglo XXI',
    summary:
      'Investigación diaria sobre competencias humanas esenciales frente a la automatización: incluye las 5 principales ideas de cada noticia y los links activos a cada fuente de información.',
    scopeDescription:
      'Hitos, torneos de debate y programas formativos diseñados para cultivar aquellas destrezas insustituibles por la automatización algorítmica.',
    accentColor: {
      badgeBg: 'bg-purple-950/80',
      badgeText: 'text-purple-300',
      border: 'border-purple-700/60',
      hoverBorder: 'hover:border-purple-400',
      gradient: 'from-purple-950/40 via-[#170e24] to-[#07090e]',
      iconText: 'text-purple-400',
    },
    links: [
      {
        id: 'doc-oficial-tema-f',
        title: 'Documento Oficial: Destrezas para la vida — Noticias — Histórico acumulado',
        url: 'https://docs.google.com/document/d/e/2PACX-1vR0YMxIrJW_u7JkFPgw98v1v7887mFZP1djzwDRKrCQIHUMC3iGd64az0yL2h5ysSj3NBHcXmgBd2x4/pub',
        source: 'Google Docs Oficial (Autor)',
        date: 'Publicado y Activo',
        type: 'paper',
        description:
          'Documento oficial acumulativo en Google Docs. Integra las 5 principales ideas de cada noticia y los links activos a cada fuente de información.',
        isPlaceholder: false,
      },
    ],
  },
  {
    id: 'escuelas-innovadoras',
    letter: 'g',
    title: 'Escuelas con Tutores Socráticos AI o Currículo Innovador',
    categoryTag: 'Escuelas Pioneras & Benchmarks Reales',
    summary:
      'Seguimiento continuo a colegios pioneros, microescuelas y reformas curriculares con IA: incluye las 5 principales ideas de cada noticia y los links activos a cada fuente de información escolar.',
    scopeDescription:
      'Casos de estudio, reportajes de campo y comparativas institucionales sobre escuelas que transformaron su jornada escolar y currículo mediante IA.',
    accentColor: {
      badgeBg: 'bg-blue-950/80',
      badgeText: 'text-blue-300',
      border: 'border-blue-700/60',
      hoverBorder: 'hover:border-blue-400',
      gradient: 'from-blue-950/40 via-[#0e172a] to-[#07090e]',
      iconText: 'text-blue-400',
    },
    links: [
      {
        id: 'doc-oficial-tema-g',
        title: 'Documento Oficial: Escuelas con Tutores Socráticos AI o con Currículo Innovador',
        url: 'https://docs.google.com/document/d/e/2PACX-1vT1-7AVEQH4IxsdyhVGfMq96dldUemAiTlnJ7Kz9Hx0Suf3C8dPXjt8EKfIPmjtAQuoXFTEIGsRUbZ3/pub',
        source: 'Google Docs Oficial (Autor)',
        date: 'Publicado y Activo',
        type: 'paper',
        description:
          'Documento oficial acumulativo en Google Docs. Integra las 5 principales ideas de cada noticia y los links activos a cada fuente de información escolar.',
        isPlaceholder: false,
      },
    ],
  },
];
