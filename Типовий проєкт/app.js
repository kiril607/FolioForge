/* =========================================================
   FolioForge — Portfolio Studio
   Vanilla JavaScript. No build step, no backend required.

   Structure:
   1. Configuration & catalogs
   2. Default content
   3. Utilities
   4. State & storage
   5. Editor renderers
   6. Preview & export
   7. Standalone site generator
   8. Monetization (paywall + license)
   9. App bootstrap & events
   ========================================================= */

(() => {
  "use strict";

  /* =========================================================
     1. Configuration & catalogs
     ========================================================= */

  /**
   * MONETIZATION
   * ─────────────────────────────────────────────────────────
   * To start selling, paste a Stripe Payment Link or a LemonSqueezy
   * checkout URL into `checkoutUrl` below. The paywall will then open
   * your real checkout page.
   *
   * For production-grade licensing, issue a unique key after payment
   * (e.g. with a Stripe webhook + serverless function) and validate it
   * on your server. The browser-only demo key below exists only so the
   * product can be evaluated before payment credentials are connected.
   */
  const CONFIG = {
    checkoutUrl: "", // e.g. "https://your-store.lemonsqueezy.com/buy/xxxxx"
    demoLicenseKey: "FOLIO-PRO-2026",
    productName: "FolioForge Pro",
    brandUrl: "https://folioforge.app",
  };

  const STORAGE_KEY = "folioforge.site.v1";
  const LICENSE_KEY = "folioforge.license.v1";

  const THEMES = {
    cyberpunk: {
      name: "Cyberpunk",
      description: "Неонова ніч",
      accent: "#c7ff4e",
      pro: false,
      metaColor: "#070a0d",
      swatch: {
        bg: "#070b0d",
        text: "#eff8ef",
        line: "rgba(199,255,78,.24)",
        accent: "#c7ff4e",
        glow: "rgba(199,255,78,.2)",
        radius: "4px",
        dot: "#ff4da6",
        dot2: "#52e5d2",
      },
    },
    minimal: {
      name: "Minimal",
      description: "Світло й повітря",
      accent: "#e8633f",
      pro: false,
      metaColor: "#f3efe5",
      swatch: {
        bg: "#f4f0e7",
        text: "#25211b",
        line: "rgba(37,33,27,.18)",
        accent: "#e8633f",
        glow: "rgba(232,99,63,.14)",
        radius: "14px",
        dot: "#e8633f",
        dot2: "#d6cbb8",
      },
    },
    neon: {
      name: "Neon Glass",
      description: "Скло та світло",
      accent: "#b57cff",
      pro: false,
      metaColor: "#080510",
      swatch: {
        bg: "#090611",
        text: "#f7f1ff",
        line: "rgba(255,255,255,.14)",
        accent: "#b57cff",
        glow: "rgba(181,124,255,.27)",
        radius: "16px",
        dot: "#32f5d1",
        dot2: "#ff7ac8",
      },
    },
    editorial: {
      name: "Editorial",
      description: "Журнальна естетика",
      accent: "#b74b32",
      pro: true,
      metaColor: "#f1eadd",
      swatch: {
        bg: "#f1eadd",
        text: "#29231c",
        line: "rgba(41,35,28,.2)",
        accent: "#b74b32",
        glow: "rgba(183,75,50,.12)",
        radius: "2px",
        dot: "#b74b32",
        dot2: "#d4c2a8",
      },
    },
    terminal: {
      name: "Terminal",
      description: "Для інженерів",
      accent: "#39ff88",
      pro: true,
      metaColor: "#050805",
      swatch: {
        bg: "#050906",
        text: "#c7ffd2",
        line: "rgba(57,255,136,.2)",
        accent: "#39ff88",
        glow: "rgba(57,255,136,.18)",
        radius: "0px",
        dot: "#39ff88",
        dot2: "#1b4a2b",
      },
    },
    aurora: {
      name: "Aurora",
      description: "Північне сяйво",
      accent: "#8ab4ff",
      pro: true,
      metaColor: "#070b17",
      swatch: {
        bg: "#070b17",
        text: "#f2f5ff",
        line: "rgba(255,255,255,.14)",
        accent: "#8ab4ff",
        glow: "rgba(138,180,255,.24)",
        radius: "18px",
        dot: "#7df5d2",
        dot2: "#ffa8e2",
      },
    },
  };

  const FONTS = {
    space: {
      name: "Space Grotesk",
      description: "Техно / Inter",
      display: "'Space Grotesk', sans-serif",
      body: "'Inter', sans-serif",
      google: "family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600",
    },
    inter: {
      name: "Inter",
      description: "Чисто / Нейтрально",
      display: "'Inter', sans-serif",
      body: "'Inter', sans-serif",
      google: "family=Inter:wght@400;500;600;700;800",
    },
    dm: {
      name: "DM Sans",
      description: "Дружньо / Легко",
      display: "'DM Sans', sans-serif",
      body: "'DM Sans', sans-serif",
      google: "family=DM+Sans:wght@400;500;600;700",
    },
    playfair: {
      name: "Playfair Display",
      description: "Елегантно / Inter",
      display: "'Playfair Display', Georgia, serif",
      body: "'Inter', sans-serif",
      google: "family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600",
    },
    syne: {
      name: "Syne",
      description: "Сміливо / DM Sans",
      display: "'Syne', sans-serif",
      body: "'DM Sans', sans-serif",
      google: "family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600",
    },
  };

  const SOCIALS = {
    github: { label: "GitHub", hint: "https://github.com/username" },
    linkedin: { label: "LinkedIn", hint: "https://linkedin.com/in/username" },
    x: { label: "X / Twitter", hint: "https://x.com/username" },
    telegram: { label: "Telegram", hint: "https://t.me/username" },
    dribbble: { label: "Dribbble", hint: "https://dribbble.com/username" },
    behance: { label: "Behance", hint: "https://behance.net/username" },
    youtube: { label: "YouTube", hint: "https://youtube.com/@channel" },
    instagram: { label: "Instagram", hint: "https://instagram.com/username" },
    email: { label: "Email", hint: "you@example.com" },
    website: { label: "Website", hint: "https://your-site.com" },
  };

  const UI_ICONS = {
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>',
    external: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5.2-8 11-8 11S4 15.2 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.6"/></svg>',
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>',
    download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 17.5v1A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5v-1"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 12.5 4 4 8-9"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="9" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg>',
    copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5v-2a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2"/></svg>',
    alert: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8v5m0 3.5v.1"/><circle cx="12" cy="12" r="9"/></svg>',
    info: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8.5v.1"/></svg>',
  };

  const SOCIAL_ICONS = {
    github: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.1c-3.12.68-3.78-1.33-3.78-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.63 1.22 3.27.93.1-.72.39-1.22.71-1.5-2.49-.28-5.1-1.24-5.1-5.53 0-1.22.43-2.22 1.15-3-.12-.29-.5-1.44.11-3 0 0 .94-.3 3.09 1.15a10.7 10.7 0 0 1 5.62 0c2.14-1.45 3.08-1.15 3.08-1.15.61 1.56.23 2.71.11 3 .72.78 1.15 1.78 1.15 3 0 4.3-2.62 5.25-5.12 5.52.4.35.76 1.04.76 2.09v3.1c0 .3.2.65.78.54A11.2 11.2 0 0 0 12 .8Z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.25l-4.9-6.4L6.44 22H3.3l7.25-8.29L1.5 2h6.4l4.43 5.86L18.9 2Zm-1.1 17.87h1.73L6.6 3.99H4.74l13.06 15.88Z"/></svg>',
    telegram: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><path d="M21.94 4.2 18.8 19.1c-.23 1.06-.86 1.32-1.74.82l-4.82-3.55-2.33 2.24c-.26.26-.47.47-.97.47l.35-4.9 8.92-8.06c.39-.35-.08-.54-.6-.2L6.6 13.2l-4.74-1.48c-1.03-.32-1.05-1.03.21-1.52L20.62 2.8c.86-.32 1.61.2 1.32 1.4Z"/></svg>',
    dribbble: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M5.2 7.4c3.8 4.6 8.3 6.5 14.2 5.3M3.3 13.4c4.8-.2 8.2 1.2 10.3 6.3M9.1 3.4c2.8 3.4 4.7 7.5 5.4 13.7"/></svg>',
    behance: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><path d="M8.9 11.1c1.2-.5 1.9-1.5 1.9-2.8 0-2.2-1.7-3.5-4.4-3.5H1.5v14.4h5.1c2.9 0 4.8-1.5 4.8-4 0-1.7-.9-3.2-2.5-3.9v-.2ZM4.2 7.2h2.1c1.3 0 2 .5 2 1.5 0 1-.7 1.6-2 1.6h-2V7.2Zm2.4 9.6H4.2v-3.7h2.5c1.5 0 2.3.7 2.3 1.8 0 1.2-.8 1.9-2.4 1.9ZM19.1 8.8c-3 0-5 2-5 5.4 0 3.4 2 5.4 5.2 5.4 2.4 0 4.1-1.1 4.7-3.1h-2.8c-.3.8-1 1.2-1.9 1.2-1.3 0-2.1-.8-2.2-2.2h7c.1-.5.2-1 .2-1.5 0-3.2-1.9-5.2-5.2-5.2Zm-2 4.5c.2-1.3 1-2.1 2.1-2.1 1.2 0 2 .8 2 2.1h-4.1ZM14.2 5.3h6v1.5h-6z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><path d="M23.5 7.1a3 3 0 0 0-2.1-2.1C19.5 4.5 12 4.5 12 4.5s-7.5 0-9.4.5A3 3 0 0 0 .5 7.1 31 31 0 0 0 0 12a31 31 0 0 0 .5 4.9 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-4.9ZM9.5 15.6V8.4L15.8 12l-6.3 3.6Z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></svg>',
    email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>',
    website: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3.2 12h17.6M12 3c2.2 2.4 3.4 5.4 3.4 9S14.2 18.6 12 21c-2.2-2.4-3.4-5.4-3.4-9S9.8 5.4 12 3Z"/></svg>',
  };

  /* =========================================================
     2. Default content
     ========================================================= */

  const DEFAULT_STATE = {
    profile: {
      name: "Олександр Коваленко",
      role: "Full-Stack Developer",
      bio: "Перетворюю складні ідеї на швидкі та зрозумілі цифрові продукти. Спеціалізуюся на React, Node.js та інтерфейсах, якими справді хочеться користуватися.",
      location: "Київ, Україна",
      email: "hello@oleksandr.dev",
      avatar: "",
      resumeUrl: "",
      ctaLabel: "Обговорити проєкт",
      available: true,
    },
    skills: [
      { id: "skill-react", name: "React / Next.js", level: 95 },
      { id: "skill-ts", name: "TypeScript", level: 90 },
      { id: "skill-node", name: "Node.js / APIs", level: 88 },
      { id: "skill-ui", name: "UI / UX Design", level: 82 },
      { id: "skill-db", name: "PostgreSQL", level: 80 },
      { id: "skill-cloud", name: "AWS / Vercel", level: 76 },
    ],
    projects: [
      {
        id: "project-nova",
        title: "Nova Finance",
        year: "2025",
        description:
          "SaaS-платформа для автоматизації фінансової звітності. Переписав legacy-інтерфейс на React, скоротив час побудови звітів із 20 хвилин до 2.",
        tags: "React, TypeScript, Node.js",
        link: "https://example.com",
        image: "",
      },
      {
        id: "project-atlas",
        title: "Atlas Travel",
        year: "2024",
        description:
          "Маркетплейс авторських подорожей із мультивалютними платежами, розумним пошуком і кабінетом гіда. 12 000+ активних користувачів.",
        tags: "Next.js, Stripe, PostgreSQL",
        link: "https://example.com",
        image: "",
      },
      {
        id: "project-pulse",
        title: "Pulse Analytics",
        year: "2024",
        description:
          "Дашборд реального часу для продуктових команд: воронки, retention та кастомні метрики без допомоги аналітика.",
        tags: "React, D3.js, Supabase",
        link: "https://example.com",
        image: "",
      },
    ],
    socials: [
      { id: "social-github", network: "github", url: "https://github.com/" },
      { id: "social-linkedin", network: "linkedin", url: "https://linkedin.com/in/" },
      { id: "social-telegram", network: "telegram", url: "https://t.me/" },
      { id: "social-email", network: "email", url: "hello@oleksandr.dev" },
    ],
    theme: {
      id: "cyberpunk",
      font: "space",
      accent: "#c7ff4e",
    },
  };

  /* =========================================================
     3. Utilities
     ========================================================= */

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const clone = (value) => JSON.parse(JSON.stringify(value));

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => {
      const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
      return entities[character];
    });
  }

  const escapeAttr = escapeHTML;

  function uid(prefix = "item") {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return `${prefix}-${window.crypto.randomUUID().slice(0, 8)}`;
    }
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function getPath(object, path) {
    return path.split(".").reduce((current, key) => (current == null ? undefined : current[key]), object);
  }

  function setPath(object, path, value) {
    const keys = path.split(".");
    const last = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== "object") current[key] = {};
      return current[key];
    }, object);
    target[last] = value;
  }

  function safeUrl(value, options = {}) {
    const raw = String(value ?? "").trim();
    if (!raw) return "";

    const allowMail = options.mail === true;
    if (allowMail && /^mailto:/i.test(raw)) {
      const address = raw.replace(/^mailto:/i, "").trim();
      return address ? `mailto:${address}` : "";
    }

    const candidate = /^(https?:\/\/|mailto:|tel:)/i.test(raw) ? raw : `https://${raw}`;
    try {
      const url = new URL(candidate);
      const allowed = ["http:", "https:"];
      if (allowMail) allowed.push("mailto:", "tel:");
      if (!allowed.includes(url.protocol)) return "";
      return url.href;
    } catch (_) {
      return "";
    }
  }

  function safeAssetUrl(value) {
    const raw = String(value ?? "").trim();
    if (!raw) return "";
    if (/^data:image\/(png|jpe?g|webp|gif|avif);base64,[a-z0-9+/=\s]+$/i.test(raw)) return raw;
    return safeUrl(raw);
  }

  function socialHref(network, value) {
    const raw = String(value ?? "").trim();
    if (!raw) return "";
    if (network === "email") {
      if (/^mailto:/i.test(raw)) return raw;
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) return `mailto:${raw}`;
      return safeUrl(raw, { mail: true });
    }
    return safeUrl(raw);
  }

  function getInitials(name) {
    const parts = String(name ?? "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "FF";
    return (parts[0][0] + (parts[1] ? parts[1][0] : "")).toUpperCase();
  }

  const TRANSLIT = {
    а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ie", ж: "zh", з: "z",
    и: "y", і: "i", ї: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p",
    р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh",
    щ: "shch", ь: "", ю: "iu", я: "ia", ы: "y", э: "e", ё: "e", ъ: "",
  };

  function slugify(value) {
    const transliterated = String(value ?? "")
      .toLowerCase()
      .split("")
      .map((character) => (TRANSLIT[character] !== undefined ? TRANSLIT[character] : character))
      .join("");

    return (
      transliterated
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 42) || "my-portfolio"
    );
  }

  function normalizeHex(value, fallback = "#c7ff4e") {
    const raw = String(value ?? "").trim();
    if (/^#[0-9a-f]{6}$/i.test(raw)) return raw.toLowerCase();
    if (/^#[0-9a-f]{3}$/i.test(raw)) {
      return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`.toLowerCase();
    }
    return fallback;
  }

  function hexToRgb(hex) {
    const normalized = normalizeHex(hex).slice(1);
    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16),
    };
  }

  function accentInk(hex) {
    const { r, g, b } = hexToRgb(hex);
    const linear = [r, g, b].map((channel) => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
    });
    const luminance = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
    const whiteContrast = 1.05 / (luminance + 0.05);
    const blackContrast = (luminance + 0.05) / 0.05;
    return whiteContrast >= blackContrast ? "#ffffff" : "#0b0d0e";
  }

  function formatCount(number, one, few, many) {
    const value = Math.abs(Number(number)) % 100;
    const last = value % 10;
    if (value > 10 && value < 20) return many;
    if (last === 1) return one;
    if (last >= 2 && last <= 4) return few;
    return many;
  }

  function readJSON(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (_) {
      return false;
    }
  }

  function debounce(callback, delay = 160) {
    let timer = 0;
    return (...args) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => callback(...args), delay);
    };
  }

  function stringValue(value) {
    return typeof value === "string" ? value : value == null ? "" : String(value);
  }

  function normalizeState(raw) {
    const source = raw && typeof raw === "object" ? raw : {};
    const profileSource = source.profile && typeof source.profile === "object" ? source.profile : {};
    const themeSource = source.theme && typeof source.theme === "object" ? source.theme : {};

    const profile = {
      name: stringValue(profileSource.name || DEFAULT_STATE.profile.name).slice(0, 60),
      role: stringValue(profileSource.role || DEFAULT_STATE.profile.role).slice(0, 70),
      bio: stringValue(profileSource.bio ?? DEFAULT_STATE.profile.bio).slice(0, 260),
      location: stringValue(profileSource.location ?? DEFAULT_STATE.profile.location).slice(0, 60),
      email: stringValue(profileSource.email ?? DEFAULT_STATE.profile.email).slice(0, 100),
      avatar: stringValue(profileSource.avatar || ""),
      resumeUrl: stringValue(profileSource.resumeUrl || ""),
      ctaLabel: stringValue(profileSource.ctaLabel || DEFAULT_STATE.profile.ctaLabel).slice(0, 32),
      available: profileSource.available !== false,
    };

    const skills = Array.isArray(source.skills)
      ? source.skills.slice(0, 30).map((item, index) => ({
          id: stringValue(item && item.id) || uid(`skill-${index}`),
          name: stringValue(item && item.name).slice(0, 60),
          level: clamp(Number(item && item.level) || 0, 0, 100),
        }))
      : clone(DEFAULT_STATE.skills);

    const projects = Array.isArray(source.projects)
      ? source.projects.slice(0, 12).map((item, index) => ({
          id: stringValue(item && item.id) || uid(`project-${index}`),
          title: stringValue(item && item.title).slice(0, 80),
          year: stringValue(item && item.year).slice(0, 10),
          description: stringValue(item && item.description).slice(0, 420),
          tags: stringValue(item && item.tags).slice(0, 150),
          link: stringValue(item && item.link),
          image: stringValue(item && item.image),
        }))
      : clone(DEFAULT_STATE.projects);

    const socials = Array.isArray(source.socials)
      ? source.socials.slice(0, 10).map((item, index) => ({
          id: stringValue(item && item.id) || uid(`social-${index}`),
          network: SOCIALS[item && item.network] ? item.network : "website",
          url: stringValue(item && item.url),
        }))
      : clone(DEFAULT_STATE.socials);

    const themeId = THEMES[themeSource.id] ? themeSource.id : DEFAULT_STATE.theme.id;
    const fontId = FONTS[themeSource.font] ? themeSource.font : DEFAULT_STATE.theme.font;

    return {
      profile,
      skills,
      projects,
      socials,
      theme: {
        id: themeId,
        font: fontId,
        accent: normalizeHex(themeSource.accent, THEMES[themeId].accent),
      },
    };
  }

  function loadState() {
    return normalizeState(readJSON(STORAGE_KEY, clone(DEFAULT_STATE)));
  }

  function loadLicense() {
    const saved = readJSON(LICENSE_KEY, { active: false, key: "", activatedAt: null });
    return {
      active: saved && saved.active === true,
      key: saved && typeof saved.key === "string" ? saved.key : "",
      activatedAt: saved && saved.activatedAt ? saved.activatedAt : null,
    };
  }

  /* =========================================================
     4. App state, DOM references & small UI helpers
     ========================================================= */

  const dom = {
    editorForm: $("#editorForm"),
    editorScroll: $("#editorScroll"),
    editorTabs: $(".editor-tabs"),
    editorPanes: $$(".editor-pane"),
    mobileViewSwitch: $("#mobileViewSwitch"),
    skillsList: $("#skillsList"),
    projectsList: $("#projectsList"),
    socialsList: $("#socialsList"),
    addSkillBtn: $("#addSkillBtn"),
    addProjectBtn: $("#addProjectBtn"),
    addSocialBtn: $("#addSocialBtn"),
    avatarPreview: $("#avatarPreview"),
    avatarInitials: $("#avatarInitials"),
    themeGrid: $("#themeGrid"),
    fontGrid: $("#fontGrid"),
    accentGrid: $("#accentGrid"),
    customAccent: $("#customAccent"),
    themeCountBadge: $("#themeCountBadge"),
    proBanner: $(".pro-banner"),
    saveStatus: $("#saveStatus"),
    planPill: $("#planPill"),
    planLabel: $("#planLabel"),
    previewFrame: $("#previewFrame"),
    previewUrl: $("#previewUrl"),
    previewMeta: $("#previewMeta"),
    previewUpdateHint: $("#previewUpdateHint"),
    browserFrame: $("#browserFrame"),
    resetBtn: $("#resetBtn"),
    openPreviewBtn: $("#openPreviewBtn"),
    refreshPreviewBtn: $("#refreshPreviewBtn"),
    paywallModal: $("#paywallModal"),
    paywallDialog: $(".paywall-modal"),
    checkoutButton: $("#checkoutButton"),
    licenseForm: $("#licenseForm"),
    licenseInput: $("#licenseInput"),
    licenseToggle: $("#licenseToggle"),
    paywallFineprint: $(".paywall__fineprint"),
    toastStack: $("#toastStack"),
  };

  let state = loadState();
  let license = loadLicense();
  let saveTimer = 0;
  let modalReturnFocus = null;
  let toastSequence = 0;

  const isPro = () => license.active === true;

  function showToast(title, message = "", type = "success", action = null) {
    if (!dom.toastStack) return;

    const toast = document.createElement("div");
    toast.className = `toast toast--${type}`;
    toast.dataset.toastId = String(++toastSequence);

    const icon = type === "error" ? UI_ICONS.alert : type === "info" ? UI_ICONS.info : UI_ICONS.check;
    toast.innerHTML = `
      <span class="toast__icon">${icon}</span>
      <span class="toast__copy">
        <strong>${escapeHTML(title)}</strong>
        ${message ? `<span>${escapeHTML(message)}</span>` : ""}
      </span>
    `;

    if (action && typeof action.onClick === "function") {
      const actionButton = document.createElement("button");
      actionButton.type = "button";
      actionButton.className = "toast__action";
      actionButton.textContent = action.label || "Відмінити";
      actionButton.addEventListener("click", () => {
        action.onClick();
        dismissToast(toast);
      });
      toast.appendChild(actionButton);
    }

    dom.toastStack.appendChild(toast);

    let timeout = 0;
    const startTimer = () => {
      timeout = window.setTimeout(() => dismissToast(toast), action ? 7000 : 4200);
    };

    startTimer();
    toast.addEventListener("mouseenter", () => window.clearTimeout(timeout));
    toast.addEventListener("mouseleave", startTimer);
    toast.addEventListener("focusin", () => window.clearTimeout(timeout));
    toast.addEventListener("focusout", startTimer);
  }

  function dismissToast(toast) {
    if (!toast || !toast.isConnected || toast.classList.contains("is-leaving")) return;
    toast.classList.add("is-leaving");
    window.setTimeout(() => toast.remove(), 180);
  }

  function setSaveStatus(status) {
    if (!dom.saveStatus) return;
    const text = $(".save-status__text", dom.saveStatus);
    dom.saveStatus.classList.toggle("is-saving", status === "saving");
    dom.saveStatus.classList.toggle("is-error", status === "error");
    text.textContent = status === "saving" ? "Зберігаю…" : status === "error" ? "Не збережено" : "Збережено";
  }

  function scheduleSave() {
    setSaveStatus("saving");
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      const ok = writeJSON(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
      setSaveStatus(ok ? "saved" : "error");
      if (!ok) showToast("Не вдалося зберегти", "Перевірте налаштування браузера або місце у localStorage.", "error");
    }, 260);
  }

  function markDirty() {
    scheduleSave();
    queuePreview();
  }

  /* =========================================================
     5. Editor renderers
     ========================================================= */

  function hydratePathFields() {
    $$("[data-path]", dom.editorForm).forEach((field) => {
      const value = getPath(state, field.dataset.path);
      if (field.type === "checkbox") field.checked = value === true;
      else field.value = value == null ? "" : value;
    });
    updateCounters();
    updateAvatarPreview();
  }

  function updateCounters() {
    $$("[data-counter-for]").forEach((counter) => {
      const value = stringValue(getPath(state, counter.dataset.counterFor));
      const limit = Number(counter.dataset.limit || 260);
      counter.textContent = `${value.length} / ${limit}`;
    });
  }

  function updateAvatarPreview() {
    if (!dom.avatarPreview) return;
    const initials = getInitials(state.profile.name);
    dom.avatarInitials.textContent = initials;
    dom.avatarInitials.style.opacity = state.profile.avatar ? "0" : "1";

    const existing = $("img", dom.avatarPreview);
    if (existing) existing.remove();

    const src = safeAssetUrl(state.profile.avatar);
    if (!src) return;

    const image = document.createElement("img");
    image.alt = "";
    image.loading = "lazy";
    image.src = src;
    image.addEventListener("error", () => image.remove(), { once: true });
    dom.avatarPreview.appendChild(image);
  }

  function handlePathInput(event) {
    const field = event.target.closest("[data-path]");
    if (!field) return;

    const path = field.dataset.path;
    const value = field.type === "checkbox" ? field.checked : field.value;
    setPath(state, path, value);

    if (path === "profile.name" || path === "profile.avatar") updateAvatarPreview();
    if (path === "profile.bio") updateCounters();

    markDirty();
  }

  function activateTab(tabId) {
    $$(".editor-tab", dom.editorTabs).forEach((tab) => {
      const active = tab.dataset.tab === tabId;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    dom.editorPanes.forEach((pane) => {
      const active = pane.dataset.panel === tabId;
      pane.classList.toggle("is-active", active);
      pane.hidden = !active;
    });

    if (dom.editorScroll) dom.editorScroll.scrollTop = 0;
  }

  /* ── Repeated blocks ────────────────────────────────────── */

  function emptyBlock(title, hint) {
    return `
      <div class="empty-block">
        <span class="empty-block__icon" aria-hidden="true">+</span>
        <div><strong>${escapeHTML(title)}</strong><small>${escapeHTML(hint)}</small></div>
      </div>
    `;
  }

  function renderSkills() {
    if (!dom.skillsList) return;
    if (!state.skills.length) {
      dom.skillsList.innerHTML = emptyBlock("Поки що порожньо", "Додайте першу навичку, щоб побачити її у превʼю.");
      return;
    }

    dom.skillsList.innerHTML = state.skills
      .map((skill, index) => {
        const level = clamp(Number(skill.level) || 0, 0, 100);
        return `
          <article class="repeater-card" data-id="${escapeAttr(skill.id)}">
            <div class="repeater-card__head">
              <span class="repeater-card__index">${String(index + 1).padStart(2, "0")}</span>
              <span class="repeater-card__title" data-card-title>${escapeHTML(skill.name || "Нова навичка")}</span>
              <span class="repeater-card__grip" aria-hidden="true"><i></i></span>
              <button class="repeater-card__remove" type="button" data-remove aria-label="Видалити навичку">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>
              </button>
            </div>
            <div class="repeater-card__grid">
              <div class="field field--full">
                <label for="skill-name-${index}">Назва навички</label>
                <input id="skill-name-${index}" type="text" value="${escapeAttr(skill.name)}" data-array-field="name" placeholder="React / Next.js" maxlength="60">
              </div>
              <div class="field field--full level-field">
                <div class="level-field__head">
                  <span>Рівень володіння</span>
                  <span class="level-value" data-level-value>${level}%</span>
                </div>
                <input class="level-range" type="range" min="0" max="100" step="1" value="${level}" data-array-field="level" aria-label="Рівень володіння" style="--level:${level}%">
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderProjects() {
    if (!dom.projectsList) return;
    if (!state.projects.length) {
      dom.projectsList.innerHTML = emptyBlock("Ще немає проєктів", "Додайте кейс — це найважливіша частина портфоліо.");
      return;
    }

    dom.projectsList.innerHTML = state.projects
      .map(
        (project, index) => `
        <article class="repeater-card" data-id="${escapeAttr(project.id)}">
          <div class="repeater-card__head">
            <span class="repeater-card__index">${String(index + 1).padStart(2, "0")}</span>
            <span class="repeater-card__title" data-card-title>${escapeHTML(project.title || "Новий проєкт")}</span>
            <span class="repeater-card__grip" aria-hidden="true"><i></i></span>
            <button class="repeater-card__remove" type="button" data-remove aria-label="Видалити проєкт">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>
            </button>
          </div>
          <div class="repeater-card__grid">
            <div class="field">
              <label for="project-title-${index}">Назва</label>
              <input id="project-title-${index}" type="text" value="${escapeAttr(project.title)}" data-array-field="title" placeholder="Nova Finance" maxlength="80">
            </div>
            <div class="field">
              <label for="project-year-${index}">Рік</label>
              <input id="project-year-${index}" type="text" value="${escapeAttr(project.year)}" data-array-field="year" placeholder="2025" maxlength="10">
            </div>
            <div class="field field--full">
              <label for="project-desc-${index}">Опис і результат</label>
              <textarea id="project-desc-${index}" data-array-field="description" placeholder="Яку задачу вирішували, що зробили і який результат отримав клієнт…" maxlength="420">${escapeHTML(project.description)}</textarea>
            </div>
            <div class="field field--full">
              <label for="project-tags-${index}">Технології <span class="label-optional">через кому</span></label>
              <input id="project-tags-${index}" type="text" value="${escapeAttr(project.tags)}" data-array-field="tags" placeholder="React, Node.js, PostgreSQL" maxlength="150">
            </div>
            <div class="field">
              <label for="project-link-${index}">Посилання</label>
              <input id="project-link-${index}" type="url" value="${escapeAttr(project.link)}" data-array-field="link" placeholder="https://…">
            </div>
            <div class="field">
              <label for="project-image-${index}">Обкладинка <span class="label-optional">URL</span></label>
              <input id="project-image-${index}" type="url" value="${escapeAttr(project.image)}" data-array-field="image" placeholder="https://…/cover.jpg">
            </div>
          </div>
        </article>
      `
      )
      .join("");
  }

  function renderSocials() {
    if (!dom.socialsList) return;
    if (!state.socials.length) {
      dom.socialsList.innerHTML = emptyBlock("Соцмережі не додані", "Додайте хоча б одне посилання, щоб відвідувачі могли з вами звʼязатися.");
      return;
    }

    dom.socialsList.innerHTML = state.socials
      .map((social, index) => {
        const network = SOCIALS[social.network] ? social.network : "website";
        const hint = SOCIALS[network].hint;
        const optionMarkup = Object.entries(SOCIALS)
          .map(([value, item]) => `<option value="${value}"${value === network ? " selected" : ""}>${escapeHTML(item.label)}</option>`)
          .join("");

        return `
          <div class="social-row" data-id="${escapeAttr(social.id)}">
            <label class="sr-only" for="social-network-${index}">Мережа</label>
            <select id="social-network-${index}" data-array-field="network" aria-label="Соціальна мережа">${optionMarkup}</select>
            <label class="sr-only" for="social-url-${index}">Посилання або email</label>
            <input id="social-url-${index}" type="text" value="${escapeAttr(social.url)}" data-array-field="url" data-network-input placeholder="${escapeAttr(hint)}" aria-label="Посилання">
            <button class="social-row__remove" type="button" data-remove aria-label="Видалити соцмережу">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>
            </button>
          </div>
        `;
      })
      .join("");
  }

  /* ── Theme controls ─────────────────────────────────────── */

  function renderThemeGrid() {
    if (!dom.themeGrid) return;
    const pro = isPro();

    if (dom.themeCountBadge) dom.themeCountBadge.textContent = pro ? "6 / 6" : "3 / 6";

    dom.themeGrid.innerHTML = Object.entries(THEMES)
      .map(([id, theme]) => {
        const active = state.theme.id === id;
        const locked = theme.pro && !pro;
        const swatch = theme.swatch;
        const style = [
          `--sw-bg:${swatch.bg}`,
          `--sw-text:${swatch.text}`,
          `--sw-line:${swatch.line}`,
          `--sw-accent:${swatch.accent}`,
          `--sw-glow:${swatch.glow}`,
          `--sw-radius:${swatch.radius}`,
          `--sw-dot:${swatch.dot}`,
          `--sw-dot-2:${swatch.dot2 || swatch.dot}`,
        ].join(";");

        return `
          <button class="theme-card${active ? " is-active" : ""}" type="button" role="radio" aria-checked="${active}" data-theme-id="${id}" data-locked="${locked}" aria-label="${escapeAttr(theme.name)}${locked ? " — доступно у Pro" : ""}">
            <span class="theme-card__canvas" style="${style}">
              <span class="theme-card__swatch-row" aria-hidden="true"><i></i><i></i><i></i></span>
              <span class="theme-card__mini-title"></span>
              <span class="theme-card__mini-line"></span>
              <span class="theme-card__mini-line theme-card__mini-line--short"></span>
              <span class="theme-card__mini-pill"></span>
            </span>
            <span class="theme-card__meta">
              <strong>${escapeHTML(theme.name)}</strong>
              <small>${escapeHTML(theme.description)}</small>
            </span>
            ${locked ? `<span class="theme-card__lock">${UI_ICONS.lock} PRO</span>` : ""}
            ${active ? `<span class="theme-card__check">${UI_ICONS.check}</span>` : ""}
          </button>
        `;
      })
      .join("");
  }

  function renderFontGrid() {
    if (!dom.fontGrid) return;
    dom.fontGrid.innerHTML = Object.entries(FONTS)
      .map(([id, font]) => {
        const active = state.theme.font === id;
        return `
          <button class="font-card${active ? " is-active" : ""}" type="button" role="radio" aria-checked="${active}" data-font-id="${id}" aria-label="${escapeAttr(font.name)}">
            <span class="font-card__sample" style="font-family:${font.display}" aria-hidden="true">Aa</span>
            <span class="font-card__meta">
              <strong>${escapeHTML(font.name)}</strong>
              <small>${escapeHTML(font.description)}</small>
            </span>
            <span class="font-card__dot" aria-hidden="true"></span>
          </button>
        `;
      })
      .join("");
  }

  function renderAccentGrid() {
    if (!dom.accentGrid) return;
    const accent = normalizeHex(state.theme.accent, THEMES[state.theme.id].accent);
    const colors = [...new Set([THEMES[state.theme.id].accent, "#c7ff4e", "#ff7a59", "#a78bfa", "#52e5d2", "#ff5fa2"])];

    dom.accentGrid.innerHTML = colors
      .map((color) => {
        const active = color.toLowerCase() === accent.toLowerCase();
        return `<button class="accent-swatch${active ? " is-active" : ""}" type="button" role="radio" aria-checked="${active}" data-accent="${color}" style="--swatch:${color}" aria-label="Акцент ${color}"></button>`;
      })
      .join("");

    if (dom.customAccent) {
      dom.customAccent.value = accent;
      const indicator = $("span", dom.customAccent.closest(".color-picker"));
      if (indicator) indicator.style.background = accent;
    }
  }

  function selectTheme(id) {
    const theme = THEMES[id];
    if (!theme) return;
    if (theme.pro && !isPro()) {
      openPaywall(id);
      return;
    }

    state.theme.id = id;
    state.theme.accent = theme.accent;
    renderThemeGrid();
    renderAccentGrid();
    markDirty();
  }

  function selectFont(id) {
    if (!FONTS[id]) return;
    state.theme.font = id;
    renderFontGrid();
    markDirty();
  }

  function selectAccent(color) {
    state.theme.accent = normalizeHex(color, THEMES[state.theme.id].accent);
    renderAccentGrid();
    markDirty();
  }

  function updateProUI() {
    const pro = isPro();
    if (dom.planLabel) dom.planLabel.textContent = pro ? "Pro" : "Free";
    if (dom.planPill) {
      dom.planPill.classList.toggle("is-pro", pro);
      dom.planPill.setAttribute("aria-label", pro ? "FolioForge Pro активовано" : "Відкрити FolioForge Pro");
    }
    if (dom.proBanner) dom.proBanner.hidden = pro;
    renderThemeGrid();
  }

  /* ── Add / remove array items ───────────────────────────── */

  function bindRepeater(container, collection) {
    if (!container) return;

    container.addEventListener("input", (event) => {
      const field = event.target.closest("[data-array-field]");
      const card = event.target.closest("[data-id]");
      if (!field || !card) return;

      const item = state[collection].find((entry) => entry.id === card.dataset.id);
      if (!item) return;

      const key = field.dataset.arrayField;
      if (key === "level") {
        const level = clamp(Number(field.value) || 0, 0, 100);
        item.level = level;
        field.style.setProperty("--level", `${level}%`);
        const output = $("[data-level-value]", card);
        if (output) output.textContent = `${level}%`;
      } else {
        item[key] = field.value;
      }

      if (key === "name" || key === "title") {
        const title = $("[data-card-title]", card);
        if (title) title.textContent = field.value || (key === "name" ? "Нова навичка" : "Новий проєкт");
      }

      if (collection === "socials" && key === "network") {
        const hint = SOCIALS[item.network] ? SOCIALS[item.network].hint : "";
        const input = $("[data-network-input]", card);
        if (input) input.placeholder = hint;
      }

      markDirty();
    });

    container.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove]");
      if (!removeButton) return;
      const card = removeButton.closest("[data-id]");
      if (card) removeArrayItem(collection, card.dataset.id);
    });
  }

  function removeArrayItem(collection, id) {
    const list = state[collection];
    const index = list.findIndex((item) => item.id === id);
    if (index < 0) return;

    const removed = list[index];
    list.splice(index, 1);

    if (collection === "skills") renderSkills();
    if (collection === "projects") renderProjects();
    if (collection === "socials") renderSocials();
    markDirty();

    const labels = {
      skills: { name: "Навичку видалено", item: removed.name || "Без назви" },
      projects: { name: "Проєкт видалено", item: removed.title || "Без назви" },
      socials: { name: "Соцмережу видалено", item: (SOCIALS[removed.network] || SOCIALS.website).label },
    };

    showToast(labels[collection].name, labels[collection].item, "info", {
      label: "Відмінити",
      onClick: () => {
        state[collection].splice(Math.min(index, state[collection].length), 0, removed);
        if (collection === "skills") renderSkills();
        if (collection === "projects") renderProjects();
        if (collection === "socials") renderSocials();
        markDirty();
      },
    });
  }

  function focusAdded(container, id) {
    window.requestAnimationFrame(() => {
      const card = $(`[data-id="${id}"]`, container);
      const input = card ? $("input, textarea, select", card) : null;
      if (!input) return;
      input.focus();
      if (typeof input.select === "function" && input.tagName === "INPUT") input.select();
    });
  }

  function addSkill() {
    if (state.skills.length >= 30) {
      showToast("Ліміт навичок", "Можна додати не більше 30 навичок.", "info");
      return;
    }
    const id = uid("skill");
    state.skills.push({ id, name: "Нова навичка", level: 70 });
    renderSkills();
    markDirty();
    focusAdded(dom.skillsList, id);
  }

  function addProject() {
    if (state.projects.length >= 12) {
      showToast("Ліміт проєктів", "Можна додати не більше 12 проєктів.", "info");
      return;
    }
    const id = uid("project");
    state.projects.push({
      id,
      title: "Новий проєкт",
      year: String(new Date().getFullYear()),
      description: "",
      tags: "",
      link: "",
      image: "",
    });
    renderProjects();
    markDirty();
    focusAdded(dom.projectsList, id);
  }

  function addSocial() {
    if (state.socials.length >= 10) {
      showToast("Ліміт соцмереж", "Можна додати не більше 10 посилань.", "info");
      return;
    }
    const id = uid("social");
    state.socials.push({ id, network: "website", url: "" });
    renderSocials();
    markDirty();
    focusAdded(dom.socialsList, id);
  }

  /* =========================================================
     6. Standalone site generator — CSS
     ========================================================= */

  function buildPortfolioCSS(themeId, fontId, accentValue) {
    const theme = THEMES[themeId] || THEMES.cyberpunk;
    const font = FONTS[fontId] || FONTS.space;
    const accent = normalizeHex(accentValue, theme.accent);
    const ink = accentInk(accent);
    const { r, g, b } = hexToRgb(accent);

    return `
:root {
  --accent: ${accent};
  --accent-rgb: ${r}, ${g}, ${b};
  --accent-ink: ${ink};
  --font-display: ${font.display};
  --font-body: ${font.body};
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  --bg: #070a0d;
  --surface: rgba(13, 19, 24, .72);
  --surface-solid: #0d1318;
  --text: #f1f7f0;
  --muted: #8da096;
  --line: rgba(199, 255, 78, .12);
  --line-strong: rgba(199, 255, 78, .24);
  --header-bg: rgba(7, 10, 13, .74);
  --radius: 8px;
  --radius-lg: 14px;
  --shadow: 0 24px 70px rgba(0, 0, 0, .35);
  --shadow-soft: 0 14px 36px rgba(0, 0, 0, .18);
  --blur: 16px;
  --headline-weight: 600;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; scroll-padding-top: 100px; }
body {
  margin: 0;
  min-width: 320px;
  overflow-x: hidden;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  isolation: isolate;
}
body[data-theme="minimal"] {
  --bg: #f3efe5;
  --surface: rgba(255, 253, 247, .78);
  --surface-solid: #fbf8f0;
  --text: #1d1b16;
  --muted: #706a5e;
  --line: rgba(29, 27, 22, .11);
  --line-strong: rgba(29, 27, 22, .21);
  --header-bg: rgba(243, 239, 229, .84);
  --radius: 14px;
  --radius-lg: 22px;
  --shadow: 0 22px 60px rgba(63, 48, 26, .08);
  --shadow-soft: 0 12px 32px rgba(63, 48, 26, .06);
  --blur: 10px;
  --headline-weight: 600;
}
body[data-theme="neon"] {
  --bg: #080510;
  --surface: rgba(255, 255, 255, .055);
  --surface-solid: #120c1d;
  --text: #f7f2ff;
  --muted: #a99bbb;
  --line: rgba(255, 255, 255, .11);
  --line-strong: rgba(255, 255, 255, .19);
  --header-bg: rgba(8, 5, 16, .63);
  --radius: 20px;
  --radius-lg: 28px;
  --shadow: 0 28px 80px rgba(0, 0, 0, .38);
  --shadow-soft: 0 16px 44px rgba(0, 0, 0, .24);
  --blur: 22px;
  --headline-weight: 600;
}
body[data-theme="editorial"] {
  --bg: #f1eadd;
  --surface: #fbf6ec;
  --surface-solid: #fbf6ec;
  --text: #26211b;
  --muted: #786e62;
  --line: rgba(38, 33, 27, .14);
  --line-strong: rgba(38, 33, 27, .26);
  --header-bg: rgba(241, 234, 221, .86);
  --radius: 2px;
  --radius-lg: 4px;
  --shadow: 0 22px 60px rgba(65, 48, 30, .08);
  --shadow-soft: 0 12px 32px rgba(65, 48, 30, .05);
  --blur: 8px;
  --headline-weight: 500;
}
body[data-theme="terminal"] {
  --bg: #050805;
  --surface: rgba(8, 16, 10, .82);
  --surface-solid: #08100a;
  --text: #c7ffd2;
  --muted: #77a580;
  --line: rgba(57, 255, 136, .14);
  --line-strong: rgba(57, 255, 136, .28);
  --header-bg: rgba(5, 8, 5, .84);
  --radius: 2px;
  --radius-lg: 4px;
  --shadow: 0 20px 60px rgba(0, 0, 0, .42);
  --shadow-soft: 0 12px 32px rgba(0, 0, 0, .28);
  --blur: 12px;
  --headline-weight: 600;
}
body[data-theme="aurora"] {
  --bg: #070b17;
  --surface: rgba(255, 255, 255, .055);
  --surface-solid: #0c1222;
  --text: #f2f5ff;
  --muted: #9aa8c4;
  --line: rgba(255, 255, 255, .11);
  --line-strong: rgba(255, 255, 255, .19);
  --header-bg: rgba(7, 11, 23, .68);
  --radius: 18px;
  --radius-lg: 26px;
  --shadow: 0 28px 80px rgba(0, 0, 0, .38);
  --shadow-soft: 0 16px 44px rgba(0, 0, 0, .22);
  --blur: 20px;
  --headline-weight: 600;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  background:
    radial-gradient(720px 540px at 7% -2%, rgba(var(--accent-rgb), .11), transparent 64%),
    radial-gradient(640px 500px at 98% 9%, rgba(167, 139, 250, .055), transparent 68%);
}
body[data-theme="cyberpunk"]::before {
  background-image:
    radial-gradient(720px 540px at 7% -2%, rgba(var(--accent-rgb), .13), transparent 64%),
    radial-gradient(640px 500px at 98% 9%, rgba(255, 77, 166, .06), transparent 68%),
    linear-gradient(rgba(255, 255, 255, .022) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, .022) 1px, transparent 1px);
  background-size: auto, auto, 44px 44px, 44px 44px;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, .9), rgba(0, 0, 0, .25) 66%, transparent);
}
body[data-theme="minimal"]::before {
  background-image:
    radial-gradient(700px 480px at 15% 0%, rgba(var(--accent-rgb), .12), transparent 65%),
    radial-gradient(600px 380px at 92% 22%, rgba(39, 79, 66, .045), transparent 70%),
    radial-gradient(rgba(29, 27, 22, .1) .6px, transparent .6px);
  background-size: auto, auto, 22px 22px;
}
body[data-theme="neon"]::before {
  background:
    radial-gradient(560px 420px at 10% 16%, rgba(var(--accent-rgb), .2), transparent 68%),
    radial-gradient(580px 480px at 93% 42%, rgba(50, 245, 209, .1), transparent 68%),
    radial-gradient(500px 400px at 52% 105%, rgba(255, 122, 200, .1), transparent 70%);
}
body[data-theme="editorial"]::before {
  background-image:
    radial-gradient(780px 520px at 8% 0%, rgba(var(--accent-rgb), .08), transparent 66%),
    linear-gradient(rgba(38, 33, 27, .035) 1px, transparent 1px);
  background-size: auto, 100% 44px;
}
body[data-theme="terminal"]::before {
  background:
    repeating-linear-gradient(0deg, rgba(57, 255, 136, .028) 0, rgba(57, 255, 136, .028) 1px, transparent 1px, transparent 4px),
    radial-gradient(700px 500px at 10% 0%, rgba(57, 255, 136, .1), transparent 66%);
}
body[data-theme="aurora"]::before {
  background:
    radial-gradient(640px 500px at 4% 6%, rgba(125, 245, 210, .12), transparent 64%),
    radial-gradient(680px 520px at 100% 12%, rgba(138, 180, 255, .16), transparent 66%),
    radial-gradient(520px 400px at 54% 100%, rgba(255, 168, 226, .11), transparent 70%);
}

.ambient {
  position: fixed;
  z-index: -1;
  border-radius: 50%;
  filter: blur(110px);
  opacity: .42;
  pointer-events: none;
}
.ambient--one {
  top: 18%;
  left: -170px;
  width: 390px;
  height: 390px;
  background: rgba(var(--accent-rgb), .22);
}
.ambient--two {
  right: -190px;
  bottom: 3%;
  width: 440px;
  height: 440px;
  background: rgba(167, 139, 250, .13);
}
body[data-theme="minimal"] .ambient,
body[data-theme="editorial"] .ambient { opacity: .22; }
body[data-theme="neon"] .ambient { opacity: .6; }
body[data-theme="terminal"] .ambient { opacity: .3; }

img { display: block; max-width: 100%; }
a { color: inherit; text-decoration: none; }
button { font: inherit; }
::selection { background: rgba(var(--accent-rgb), .25); color: var(--text); }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }

.skip-link {
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 999;
  padding: 10px 14px;
  border-radius: 6px;
  background: var(--accent);
  color: var(--accent-ink);
  font-size: 13px;
  font-weight: 600;
  transform: translateY(-160%);
  transition: transform .2s ease;
}
.skip-link:focus { transform: translateY(0); }

.container {
  width: min(1180px, calc(100% - 48px));
  margin-inline: auto;
}
.site-header,
main,
.site-footer { position: relative; z-index: 1; }

.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  width: 0;
  height: 2px;
  background: var(--accent);
  box-shadow: 0 0 14px rgba(var(--accent-rgb), .8);
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 60;
  border-bottom: 1px solid var(--line);
  background: var(--header-bg);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}
.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  height: 76px;
}
.logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.logo__mark {
  display: grid;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid rgba(var(--accent-rgb), .34);
  border-radius: calc(var(--radius) + 1px);
  background: rgba(var(--accent-rgb), .1);
  color: var(--accent);
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: -.02em;
}
.logo__text {
  overflow: hidden;
  color: var(--text);
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -.035em;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.logo__text span { color: var(--accent); }
.site-nav {
  display: flex;
  align-items: center;
  gap: 23px;
}
.site-nav > a:not(.nav-cta) {
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: .08em;
  text-transform: uppercase;
  transition: color .2s ease;
}
.site-nav > a:not(.nav-cta):hover { color: var(--accent); }
.nav-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  background: rgba(var(--accent-rgb), .075);
  color: var(--text);
  font-size: 11px;
  font-weight: 500;
  transition: border-color .2s ease, background .2s ease, color .2s ease;
}
.nav-cta:hover { border-color: var(--accent); background: rgba(var(--accent-rgb), .14); color: var(--accent); }
.nav-cta svg { width: 12px; height: 12px; }
.menu-toggle {
  display: none;
  width: 38px;
  height: 38px;
  padding: 10px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: transparent;
  color: var(--text);
  cursor: pointer;
}
.menu-toggle span {
  display: block;
  width: 100%;
  height: 1px;
  margin: 4px 0;
  background: currentColor;
  transition: transform .2s ease, opacity .2s ease;
}
.menu-toggle[aria-expanded="true"] span:first-child { transform: translateY(5px) rotate(45deg); }
.menu-toggle[aria-expanded="true"] span:last-child { transform: translateY(-5px) rotate(-45deg); }

/* Hero */
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(330px, .88fr);
  gap: clamp(34px, 5vw, 78px);
  align-items: center;
  min-height: calc(100svh - 76px);
  padding: clamp(64px, 9vh, 112px) 0 clamp(68px, 9vh, 100px);
}
.hero__content { min-width: 0; max-width: 760px; }
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 11px;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  background: rgba(var(--accent-rgb), .065);
  color: var(--text-soft, var(--text));
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: .1em;
  text-transform: uppercase;
}
.status-pill i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 10px rgba(var(--accent-rgb), .7);
}
.hero h1 {
  margin: 22px 0 0;
  color: var(--text);
  font-family: var(--font-display);
  font-size: clamp(50px, 7.4vw, 104px);
  font-weight: var(--headline-weight);
  letter-spacing: -.065em;
  line-height: .93;
  text-wrap: balance;
}
.hero__role {
  margin: 20px 0 0;
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: clamp(10px, 1.15vw, 13px);
  font-weight: 500;
  letter-spacing: .12em;
  line-height: 1.5;
  text-transform: uppercase;
}
.hero__bio {
  max-width: 570px;
  margin: 21px 0 0;
  color: var(--muted);
  font-size: clamp(15px, 1.35vw, 18px);
  line-height: 1.72;
  text-wrap: pretty;
}
.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 31px;
}
.button,
.button--ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 47px;
  padding: 0 20px;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  transition: transform .2s ease, background .2s ease, border-color .2s ease, box-shadow .2s ease;
}
.button {
  background: var(--accent);
  color: var(--accent-ink);
  box-shadow: 0 9px 30px rgba(var(--accent-rgb), .16);
}
.button:hover { transform: translateY(-2px); box-shadow: 0 13px 36px rgba(var(--accent-rgb), .24); }
.button--ghost {
  border-color: var(--line-strong);
  background: rgba(255, 255, 255, .025);
  color: var(--text);
}
.button--ghost:hover { transform: translateY(-2px); border-color: var(--accent); color: var(--accent); }
.button svg,
.button--ghost svg { width: 15px; height: 15px; }
.hero__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 9px 18px;
  margin-top: 27px;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: .02em;
}
.hero__meta span,
.hero__meta a { display: inline-flex; align-items: center; gap: 6px; }
.hero__meta a:hover { color: var(--accent); }
.hero__meta svg { width: 12px; height: 12px; color: var(--accent); }
.hero__visual {
  position: relative;
  display: grid;
  min-height: 420px;
  place-items: center;
}
.portrait {
  position: relative;
  display: grid;
  width: min(378px, 84%);
  aspect-ratio: 1;
  place-items: center;
  border: 1px solid var(--line-strong);
  border-radius: 50%;
  background:
    radial-gradient(circle at 34% 28%, rgba(var(--accent-rgb), .17), transparent 54%),
    var(--surface);
  box-shadow: var(--shadow);
}
.portrait::before {
  content: "";
  position: absolute;
  inset: -20px;
  border: 1px dashed rgba(var(--accent-rgb), .26);
  border-radius: 50%;
  animation: spin 42s linear infinite;
}
.portrait::after {
  content: "";
  position: absolute;
  inset: 12%;
  border: 1px solid var(--line);
  border-radius: 50%;
}
.portrait__image {
  position: relative;
  z-index: 2;
  display: grid;
  width: 76%;
  height: 76%;
  place-items: center;
  overflow: hidden;
  border: 1px solid var(--line-strong);
  border-radius: 50%;
  background:
    linear-gradient(145deg, rgba(var(--accent-rgb), .24), rgba(167, 139, 250, .08) 58%, rgba(var(--accent-rgb), .04)),
    var(--surface-solid);
  box-shadow: inset 0 0 0 7px rgba(0, 0, 0, .08);
}
.portrait__image img { width: 100%; height: 100%; object-fit: cover; }
.portrait__initials {
  color: var(--accent);
  font-family: var(--font-display);
  font-size: clamp(66px, 8.7vw, 112px);
  font-weight: var(--headline-weight);
  letter-spacing: -.07em;
  line-height: 1;
}
.portrait__float {
  position: absolute;
  right: -2%;
  bottom: 12%;
  z-index: 4;
  display: flex;
  align-items: baseline;
  gap: 5px;
  padding: 11px 14px;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  background: var(--header-bg);
  box-shadow: var(--shadow-soft);
  backdrop-filter: blur(14px);
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 8px;
  letter-spacing: .06em;
  text-transform: uppercase;
}
.portrait__float strong { color: var(--accent); font-size: 15px; font-weight: 500; }
.hero__chip {
  position: absolute;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  max-width: 180px;
  padding: 8px 11px;
  overflow: hidden;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  background: var(--header-bg);
  box-shadow: var(--shadow-soft);
  backdrop-filter: blur(12px);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 8.5px;
  letter-spacing: .02em;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hero__chip::before {
  content: "";
  flex: 0 0 4px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--accent);
}
.hero__chip--1 { top: 7%; left: -2%; transform: rotate(-4deg); }
.hero__chip--2 { right: -1%; bottom: 22%; transform: rotate(3deg); }
.hero__chip--3 { bottom: 5%; left: 4%; transform: rotate(-2deg); }

/* Sections */
.section {
  position: relative;
  padding: clamp(72px, 9.5vw, 122px) 0;
  border-top: 1px solid var(--line);
}
.section-head {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  gap: 23px;
  align-items: start;
  margin-bottom: clamp(34px, 4.5vw, 54px);
}
.section-index {
  padding-top: 6px;
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: .1em;
}
.section-kicker {
  margin: 0 0 10px;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 8.5px;
  letter-spacing: .16em;
  text-transform: uppercase;
}
.section-head h2 {
  max-width: 750px;
  margin: 0;
  color: var(--text);
  font-family: var(--font-display);
  font-size: clamp(33px, 4.4vw, 62px);
  font-weight: var(--headline-weight);
  letter-spacing: -.05em;
  line-height: 1.01;
  text-wrap: balance;
}
.section-note {
  align-self: end;
  margin: 0 0 6px;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 8.5px;
  letter-spacing: .04em;
  white-space: nowrap;
}

/* Skills */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 clamp(28px, 5vw, 76px);
}
.skill {
  padding: 17px 0 18px;
  border-bottom: 1px solid var(--line);
}
.skill__top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 11px;
}
.skill__name { color: var(--text); font-size: 13px; font-weight: 500; }
.skill__level { color: var(--muted); font-family: var(--font-mono); font-size: 8.5px; }
.skill__bar { height: 3px; overflow: hidden; border-radius: 99px; background: var(--line); }
.skill__bar i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--accent);
  box-shadow: 0 0 12px rgba(var(--accent-rgb), .48);
}

/* Projects */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 17px;
}
.project {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface);
  box-shadow: var(--shadow-soft);
  backdrop-filter: blur(var(--blur));
  -webkit-backdrop-filter: blur(var(--blur));
  transition: transform .28s ease, border-color .28s ease, box-shadow .28s ease;
}
.project:hover {
  transform: translateY(-5px);
  border-color: var(--line-strong);
  box-shadow: var(--shadow);
}
.project__cover {
  position: relative;
  display: block;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-bottom: 1px solid var(--line);
  background: var(--surface-solid);
}
.project__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .7s cubic-bezier(.2, .75, .3, 1), filter .3s ease;
}
.project:hover .project__cover img { transform: scale(1.035); }
.project__cover::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, .25), transparent 45%);
  pointer-events: none;
}
.project__fallback {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  overflow: hidden;
  background:
    radial-gradient(circle at 68% 27%, rgba(var(--accent-rgb), .24), transparent 42%),
    linear-gradient(135deg, rgba(var(--accent-rgb), .09), transparent 46%),
    var(--surface-solid);
}
.project__fallback::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(127, 127, 127, .07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(127, 127, 127, .07) 1px, transparent 1px);
  background-size: 32px 32px;
  mask-image: linear-gradient(135deg, rgba(0, 0, 0, .6), transparent 74%);
}
.project__number {
  position: relative;
  color: rgba(var(--accent-rgb), .67);
  font-family: var(--font-display);
  font-size: clamp(62px, 8vw, 96px);
  font-weight: 600;
  letter-spacing: -.09em;
  line-height: 1;
}
.project__number::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 152%;
  aspect-ratio: 1;
  border: 1px solid rgba(var(--accent-rgb), .19);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}
.project__year {
  position: absolute;
  top: 13px;
  right: 13px;
  z-index: 2;
  padding: 5px 8px;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  background: var(--header-bg);
  backdrop-filter: blur(8px);
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 7.5px;
  letter-spacing: .05em;
}
.project__body { padding: 21px 22px 23px; }
.project__title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}
.project__title {
  margin: 0;
  color: var(--text);
  font-family: var(--font-display);
  font-size: clamp(19px, 2.1vw, 25px);
  font-weight: var(--headline-weight);
  letter-spacing: -.035em;
  line-height: 1.15;
}
.project__open {
  display: grid;
  flex: 0 0 29px;
  width: 29px;
  height: 29px;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 50%;
  color: var(--muted);
  transition: border-color .2s ease, color .2s ease, background .2s ease;
}
.project:hover .project__open { border-color: var(--accent); background: rgba(var(--accent-rgb), .08); color: var(--accent); }
.project__open svg { width: 12px; height: 12px; }
.project__desc {
  display: -webkit-box;
  margin: 10px 0 0;
  overflow: hidden;
  color: var(--muted);
  font-size: 12.5px;
  line-height: 1.65;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
.project__tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 16px; }
.project__tags span {
  padding: 4px 7px;
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 7.5px;
  letter-spacing: .015em;
}

/* Contact */
.contact { padding: clamp(68px, 9vw, 118px) 0; }
.contact__inner {
  position: relative;
  padding: clamp(38px, 6vw, 76px);
  overflow: hidden;
  border: 1px solid var(--line-strong);
  border-radius: calc(var(--radius-lg) + 4px);
  background:
    radial-gradient(600px 320px at 100% 0%, rgba(var(--accent-rgb), .12), transparent 68%),
    linear-gradient(135deg, rgba(var(--accent-rgb), .065), transparent 48%),
    var(--surface);
  box-shadow: var(--shadow);
  backdrop-filter: blur(var(--blur));
  -webkit-backdrop-filter: blur(var(--blur));
}
.contact__inner::after {
  content: "";
  position: absolute;
  top: -90px;
  right: -60px;
  width: 300px;
  height: 300px;
  border: 1px solid rgba(var(--accent-rgb), .16);
  border-radius: 50%;
  pointer-events: none;
}
.contact__inner h2 {
  max-width: 900px;
  margin: 10px 0 26px;
  font-family: var(--font-display);
  font-size: clamp(39px, 6.2vw, 84px);
  font-weight: var(--headline-weight);
  letter-spacing: -.06em;
  line-height: .98;
  text-wrap: balance;
}
.contact__inner h2 span { color: var(--accent); }
.contact__email {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--line-strong);
  color: var(--text);
  font-size: clamp(16px, 2vw, 23px);
  font-weight: 500;
  transition: border-color .2s ease, color .2s ease;
}
.contact__email:hover { border-color: var(--accent); color: var(--accent); }
.contact__email svg { width: 17px; height: 17px; color: var(--accent); }
.contact__bottom {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-top: clamp(36px, 5vw, 56px);
  padding-top: 21px;
  border-top: 1px solid var(--line);
}
.contact__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 13px 20px;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 8.5px;
  letter-spacing: .05em;
  text-transform: uppercase;
}
.contact__meta span { display: inline-flex; align-items: center; gap: 6px; }
.contact__meta svg { width: 11px; height: 11px; color: var(--accent); }
.socials { display: flex; flex-wrap: wrap; gap: 7px; }
.social-link {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: rgba(255, 255, 255, .018);
  color: var(--muted);
  transition: transform .2s ease, border-color .2s ease, color .2s ease, background .2s ease;
}
.social-link:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
  background: rgba(var(--accent-rgb), .08);
  color: var(--accent);
}
.social-link svg { width: 14px; height: 14px; }

/* Footer */
.site-footer {
  border-top: 1px solid var(--line);
  padding: 24px 0 28px;
}
.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 8.5px;
  letter-spacing: .02em;
}
.footer-inner p { margin: 0; }
.made-with {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--muted);
  transition: color .2s ease;
}
.made-with:hover { color: var(--accent); }
.made-with b { color: var(--text); font-weight: 500; }

/* Reveal */
.js [data-reveal] {
  opacity: 0;
  transform: translateY(22px);
  transition: opacity .75s cubic-bezier(.22, 1, .36, 1), transform .75s cubic-bezier(.22, 1, .36, 1);
}
.js [data-reveal].is-visible { opacity: 1; transform: none; }

@keyframes spin { to { transform: rotate(360deg); } }

body[data-theme="minimal"] .project,
body[data-theme="minimal"] .contact__inner { background: var(--surface); }
body[data-theme="minimal"] .portrait { background: radial-gradient(circle at 32% 28%, rgba(var(--accent-rgb), .16), transparent 54%), #fffaf1; }
body[data-theme="minimal"] .project__fallback { background: radial-gradient(circle at 68% 27%, rgba(var(--accent-rgb), .22), transparent 44%), linear-gradient(135deg, rgba(var(--accent-rgb), .08), transparent 48%), #f8f1e5; }
body[data-theme="neon"] .project,
body[data-theme="neon"] .contact__inner,
body[data-theme="neon"] .portrait { box-shadow: 0 20px 70px rgba(var(--accent-rgb), .12), var(--shadow); }
body[data-theme="editorial"] .site-nav > a:not(.nav-cta) { letter-spacing: .1em; }
body[data-theme="editorial"] .hero h1 { letter-spacing: -.05em; }
body[data-theme="terminal"] .site-nav > a:not(.nav-cta),
body[data-theme="terminal"] .hero__role,
body[data-theme="terminal"] .section-kicker { text-transform: uppercase; }
body[data-theme="terminal"] .project__fallback::before { opacity: .55; }
body[data-theme="aurora"] .contact__inner { background: radial-gradient(620px 340px at 100% 0%, rgba(125, 245, 210, .13), transparent 66%), radial-gradient(500px 320px at 0% 100%, rgba(255, 168, 226, .09), transparent 60%), var(--surface); }

@media (max-width: 960px) {
  .hero {
    grid-template-columns: 1fr;
    min-height: auto;
    padding-top: 66px;
  }
  .hero__content { max-width: 820px; }
  .hero__visual { width: min(520px, 100%); min-height: 390px; margin: 2px auto 0; }
  .portrait { width: min(340px, 76%); }
  .section-head { grid-template-columns: 36px minmax(0, 1fr); gap: 14px; }
  .section-note { display: none; }
}

@media (max-width: 760px) {
  .container { width: calc(100% - 34px); }
  .header-inner { height: 68px; }
  .menu-toggle { display: block; }
  .site-nav {
    position: absolute;
    top: calc(100% + 1px);
    right: 17px;
    left: 17px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    padding: 12px;
    border: 1px solid var(--line);
    border-top: 0;
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
    background: var(--surface-solid);
    box-shadow: var(--shadow);
    opacity: 0;
    pointer-events: none;
    transform: translateY(-8px);
    transition: opacity .2s ease, transform .2s ease;
  }
  .site-nav.is-open { opacity: 1; pointer-events: auto; transform: none; }
  .site-nav > a:not(.nav-cta) { padding: 11px 8px; border-bottom: 1px solid var(--line); }
  .nav-cta { justify-content: center; margin-top: 9px; }
  .hero { gap: 28px; padding-top: 52px; }
  .hero h1 { font-size: clamp(46px, 15vw, 78px); }
  .hero__visual { min-height: 330px; }
  .hero__chip { max-width: 145px; font-size: 7.5px; }
  .hero__chip--1 { left: 0; }
  .hero__chip--2 { right: 0; }
  .skills-grid,
  .projects-grid { grid-template-columns: 1fr; }
  .section-head h2 { font-size: clamp(32px, 9.5vw, 48px); }
  .contact__bottom { align-items: flex-start; flex-direction: column; }
  .contact__inner h2 { font-size: clamp(36px, 11vw, 58px); }
  .footer-inner { align-items: flex-start; flex-direction: column; gap: 8px; }
}

@media (max-width: 520px) {
  .container { width: calc(100% - 28px); }
  .logo__text { font-size: 15px; }
  .hero h1 { font-size: clamp(42px, 14.5vw, 64px); }
  .hero__bio { font-size: 14.5px; }
  .hero__actions { flex-direction: column; align-items: stretch; }
  .button, .button--ghost { width: 100%; }
  .hero__meta { flex-direction: column; align-items: flex-start; gap: 8px; }
  .hero__visual { min-height: 280px; }
  .portrait { width: min(270px, 83%); }
  .hero__chip--3 { display: none; }
  .portrait__float { right: 0; bottom: 8%; padding: 8px 10px; font-size: 7px; }
  .portrait__float strong { font-size: 12px; }
  .section { padding: 64px 0; }
  .section-head h2 { font-size: clamp(30px, 10vw, 42px); }
  .project__body { padding: 18px; }
  .contact { padding: 56px 0; }
  .contact__inner { padding: 31px 22px; }
  .contact__inner h2 { font-size: clamp(34px, 11.5vw, 48px); }
  .contact__email { font-size: 15px; word-break: break-word; }
  .social-link { width: 34px; height: 34px; }
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
  }
  .js [data-reveal] { opacity: 1; transform: none; }
}
`;
  }

  /* =========================================================
     7. Standalone site generator — markup
     ========================================================= */

  function buildPortfolioHTML(snapshot, options = {}) {
    const pro = options.pro === true;
    const profile = snapshot.profile || {};
    const theme = THEMES[snapshot.theme.id] || THEMES.cyberpunk;
    const font = FONTS[snapshot.theme.font] || FONTS.space;
    const accent = normalizeHex(snapshot.theme.accent, theme.accent);

    const name = stringValue(profile.name).trim() || "Ваше імʼя";
    const role = stringValue(profile.role).trim() || "Creative Developer";
    const bio = stringValue(profile.bio).trim();
    const location = stringValue(profile.location).trim();
    const email = stringValue(profile.email).trim();
    const emailHref = email ? socialHref("email", email) : "";
    const ctaLabel = stringValue(profile.ctaLabel).trim() || "Написати мені";
    const avatar = safeAssetUrl(profile.avatar);
    const resume = safeUrl(profile.resumeUrl);
    const initials = getInitials(name);
    const firstName = name.split(/\s+/)[0] || "Portfolio";
    const year = new Date().getFullYear();

    const skills = (Array.isArray(snapshot.skills) ? snapshot.skills : [])
      .map((skill) => ({
        name: stringValue(skill.name).trim(),
        level: clamp(Number(skill.level) || 0, 0, 100),
      }))
      .filter((skill) => skill.name);

    const projects = (Array.isArray(snapshot.projects) ? snapshot.projects : [])
      .map((project) => {
        const tags = stringValue(project.tags)
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
          .slice(0, 6);
        return {
          title: stringValue(project.title).trim(),
          year: stringValue(project.year).trim(),
          description: stringValue(project.description).trim(),
          tags,
          link: safeUrl(project.link),
          image: safeAssetUrl(project.image),
        };
      })
      .filter((project) => project.title);

    const socials = (Array.isArray(snapshot.socials) ? snapshot.socials : [])
      .map((social) => {
        const network = SOCIALS[social.network] ? social.network : "website";
        return {
          network,
          label: SOCIALS[network].label,
          href: socialHref(network, social.url),
        };
      })
      .filter((social) => social.href);

    const projectCount = projects.length;
    const skillCount = skills.length;
    const hasSkills = skillCount > 0;
    const hasProjects = projectCount > 0;
    const primaryHref = emailHref || "#contact";

    const navLinks = [
      hasSkills ? '<a href="#skills">Навички</a>' : "",
      hasProjects ? '<a href="#projects">Проєкти</a>' : "",
      '<a href="#contact">Контакти</a>',
    ]
      .filter(Boolean)
      .join("");

    const skillMarkup = skills
      .map(
        (skill) => `
        <div class="skill">
          <div class="skill__top">
            <span class="skill__name">${escapeHTML(skill.name)}</span>
            <span class="skill__level">${skill.level}%</span>
          </div>
          <div class="skill__bar"><i style="width:${skill.level}%"></i></div>
        </div>
      `
      )
      .join("");

    const projectMarkup = projects
      .map((project, index) => {
        const coverContent = project.image
          ? `<img src="${escapeAttr(project.image)}" alt="Обкладинка проєкту ${escapeAttr(project.title)}" loading="lazy" decoding="async">`
          : `<div class="project__fallback" aria-hidden="true"><span class="project__number">${String(index + 1).padStart(2, "0")}</span></div>`;

        const coverInner = `${coverContent}${project.year ? `<span class="project__year">${escapeHTML(project.year)}</span>` : ""}`;
        const cover = project.link
          ? `<a class="project__cover" href="${escapeAttr(project.link)}" target="_blank" rel="noopener noreferrer" aria-label="Відкрити проєкт ${escapeAttr(project.title)}">${coverInner}</a>`
          : `<div class="project__cover">${coverInner}</div>`;

        const tags = project.tags.length
          ? `<div class="project__tags">${project.tags.map((tag) => `<span>${escapeHTML(tag)}</span>`).join("")}</div>`
          : "";

        const titleBlock = `
          <div class="project__title-row">
            <h3 class="project__title">${escapeHTML(project.title)}</h3>
            ${
              project.link
                ? `<a class="project__open" href="${escapeAttr(project.link)}" target="_blank" rel="noopener noreferrer" aria-label="Перейти до проєкту ${escapeAttr(project.title)}">${UI_ICONS.external}</a>`
                : ""
            }
          </div>
          ${project.description ? `<p class="project__desc">${escapeHTML(project.description)}</p>` : ""}
          ${tags}
        `;

        return `
          <article class="project" data-reveal>
            ${cover}
            <div class="project__body">${titleBlock}</div>
          </article>
        `;
      })
      .join("");

    const socialLinks = socials
      .map(
        (social) => `
        <a class="social-link" href="${escapeAttr(social.href)}" aria-label="${escapeAttr(social.label)}"${
          social.network === "email" ? "" : ' target="_blank" rel="noopener noreferrer"'
        }>${SOCIAL_ICONS[social.network] || SOCIAL_ICONS.website}</a>
      `
      )
      .join("");

    const status = profile.available !== false
      ? `<span class="status-pill"><i aria-hidden="true"></i> Відкритий до нових проєктів</span>`
      : "";

    const portraitImage = avatar
      ? `<img src="${escapeAttr(avatar)}" alt="${escapeAttr(name)}" loading="eager" decoding="async">`
      : `<span class="portrait__initials" aria-hidden="true">${escapeHTML(initials)}</span>`;

    const heroChips = skills
      .slice(0, 3)
      .map((skill, index) => `<span class="hero__chip hero__chip--${index + 1}">${escapeHTML(skill.name)}</span>`)
      .join("");

    const locationMeta = location
      ? `<span>${UI_ICONS.pin}${escapeHTML(location)}</span>`
      : "";
    const emailMeta = emailHref
      ? `<a href="${escapeAttr(emailHref)}">${UI_ICONS.mail}${escapeHTML(email)}</a>`
      : "";

    const contactEmail = emailHref
      ? `<a class="contact__email" href="${escapeAttr(emailHref)}">${escapeHTML(email)} ${UI_ICONS.arrow}</a>`
      : "";

    const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${theme.metaColor}"/><text x="32" y="40" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" font-weight="700" fill="${accent}">${escapeHTML(initials)}</text></svg>`;
    const favicon = `data:image/svg+xml,${encodeURIComponent(faviconSvg)}`;

    const ogImage = avatar ? `<meta property="og:image" content="${escapeAttr(avatar)}">` : "";
    const footerBadge = pro
      ? ""
      : `<a class="made-with" href="${escapeAttr(CONFIG.brandUrl)}" target="_blank" rel="noopener noreferrer">Made with <b>FolioForge</b></a>`;

    return `<!doctype html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHTML(name)} — ${escapeHTML(role)}</title>
  <meta name="description" content="${escapeAttr(bio || `${name} — ${role}. Портфоліо, проєкти та контакти.`)}">
  <meta name="author" content="${escapeAttr(name)}">
  <meta name="theme-color" content="${theme.metaColor}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeAttr(`${name} — ${role}`)}">
  <meta property="og:description" content="${escapeAttr(bio || `${name} — ${role}. Портфоліо та контакти.`)}">
  ${ogImage}
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${escapeAttr(favicon)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${escapeAttr(`https://fonts.googleapis.com/css2?${font.google}&display=swap`)}" rel="stylesheet">
  <style>${buildPortfolioCSS(theme === THEMES.cyberpunk ? "cyberpunk" : snapshot.theme.id, snapshot.theme.font, accent)}</style>
  <script>document.documentElement.classList.add("js");</script>
</head>
<body data-theme="${escapeAttr(theme === THEMES.cyberpunk ? "cyberpunk" : snapshot.theme.id)}">
  <a class="skip-link" href="#main">Перейти до контенту</a>
  <div class="scroll-progress" aria-hidden="true"></div>
  <div class="ambient ambient--one" aria-hidden="true"></div>
  <div class="ambient ambient--two" aria-hidden="true"></div>

  <header class="site-header">
    <div class="container header-inner">
      <a class="logo" href="#top" aria-label="${escapeAttr(name)} — на початок">
        <span class="logo__mark" aria-hidden="true">${escapeHTML(initials)}</span>
        <span class="logo__text">${escapeHTML(firstName)}<span>.</span></span>
      </a>
      <nav class="site-nav" id="siteNav" aria-label="Головна навігація">
        ${navLinks}
        <a class="nav-cta" href="${escapeAttr(primaryHref)}">${UI_ICONS.mail}${email ? "Написати" : "Контакти"}</a>
      </nav>
      <button class="menu-toggle" type="button" aria-controls="siteNav" aria-expanded="false" aria-label="Відкрити меню">
        <span></span><span></span>
      </button>
    </div>
  </header>

  <main id="main">
    <section class="hero container" id="top">
      <div class="hero__content" data-reveal>
        ${status}
        <h1>${escapeHTML(name)}</h1>
        <p class="hero__role">${escapeHTML(role)}</p>
        ${bio ? `<p class="hero__bio">${escapeHTML(bio)}</p>` : ""}
        <div class="hero__actions">
          <a class="button" href="${escapeAttr(primaryHref)}">${escapeHTML(ctaLabel)} ${UI_ICONS.arrow}</a>
          ${resume ? `<a class="button--ghost" href="${escapeAttr(resume)}" target="_blank" rel="noopener noreferrer">${UI_ICONS.download} Резюме</a>` : ""}
        </div>
        <div class="hero__meta">
          ${locationMeta}
          ${emailMeta}
        </div>
      </div>

      <div class="hero__visual" data-reveal>
        <div class="portrait">
          <div class="portrait__image">${portraitImage}</div>
          ${projectCount ? `<div class="portrait__float"><strong>${String(projectCount).padStart(2, "0")}</strong> ${escapeHTML(formatCount(projectCount, "проєкт", "проєкти", "проєктів"))}</div>` : ""}
        </div>
        ${heroChips}
      </div>
    </section>

    ${
      hasSkills
        ? `
    <section class="section" id="skills" aria-labelledby="skills-title">
      <div class="container">
        <div class="section-head" data-reveal>
          <span class="section-index">01</span>
          <div>
            <p class="section-kicker">Expertise</p>
            <h2 id="skills-title">Технології, які<br>перетворюють ідеї на продукт.</h2>
          </div>
          <p class="section-note">${String(skillCount).padStart(2, "0")} ${escapeHTML(formatCount(skillCount, "напрям", "напрями", "напрямів"))}</p>
        </div>
        <div class="skills-grid" data-reveal>
          ${skillMarkup}
        </div>
      </div>
    </section>`
        : ""
    }

    ${
      hasProjects
        ? `
    <section class="section" id="projects" aria-labelledby="projects-title">
      <div class="container">
        <div class="section-head" data-reveal>
          <span class="section-index">02</span>
          <div>
            <p class="section-kicker">Selected work</p>
            <h2 id="projects-title">Проєкти, якими<br>пишаюся.</h2>
          </div>
          <p class="section-note">${String(projectCount).padStart(2, "0")} ${escapeHTML(formatCount(projectCount, "кейс", "кейси", "кейсів"))}</p>
        </div>
        <div class="projects-grid">
          ${projectMarkup}
        </div>
      </div>
    </section>`
        : ""
    }

    <section class="contact container" id="contact" aria-labelledby="contact-title">
      <div class="contact__inner" data-reveal>
        <p class="section-kicker">Let's talk</p>
        <h2 id="contact-title">Маєте ідею?<br><span>Давайте зробимо її реальністю.</span></h2>
        ${contactEmail}
        <div class="contact__bottom">
          <div class="contact__meta">
            ${location ? `<span>${UI_ICONS.pin}${escapeHTML(location)}</span>` : ""}
            ${profile.available !== false ? `<span>Доступний для нових проєктів</span>` : ""}
          </div>
          ${socialLinks ? `<div class="socials" aria-label="Соціальні мережі">${socialLinks}</div>` : ""}
        </div>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <p>© ${year} ${escapeHTML(name)}. ${escapeHTML(role)}.</p>
      ${footerBadge}
    </div>
  </footer>

  <script>
    (function () {
      var nav = document.getElementById("siteNav");
      var toggle = document.querySelector(".menu-toggle");

      if (nav && toggle) {
        toggle.addEventListener("click", function () {
          var isOpen = nav.classList.toggle("is-open");
          toggle.setAttribute("aria-expanded", String(isOpen));
          toggle.setAttribute("aria-label", isOpen ? "Закрити меню" : "Відкрити меню");
        });

        nav.querySelectorAll("a").forEach(function (link) {
          link.addEventListener("click", function () {
            nav.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-label", "Відкрити меню");
          });
        });

        document.addEventListener("click", function (event) {
          if (!nav.contains(event.target) && !toggle.contains(event.target)) {
            nav.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
          }
        });
      }

      var reveals = document.querySelectorAll("[data-reveal]");
      var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if ("IntersectionObserver" in window && !reduceMotion) {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });

        reveals.forEach(function (element) { observer.observe(element); });
      } else {
        reveals.forEach(function (element) { element.classList.add("is-visible"); });
      }

      var progress = document.querySelector(".scroll-progress");
      if (progress) {
        var updateProgress = function () {
          var height = document.documentElement.scrollHeight - window.innerHeight;
          var value = height > 0 ? (window.scrollY / height) * 100 : 0;
          progress.style.width = Math.max(0, Math.min(100, value)) + "%";
        };
        window.addEventListener("scroll", updateProgress, { passive: true });
        window.addEventListener("resize", updateProgress);
        updateProgress();
      }
    })();
  </script>
</body>
</html>`;
  }

  /* =========================================================
     8. Live preview
     ========================================================= */

  let previewHintTimer = 0;

  const previewRenderDebounced = debounce(() => renderPreview(), 240);

  function queuePreview() {
    if (dom.previewUpdateHint) dom.previewUpdateHint.textContent = "оновлення…";
    previewRenderDebounced();
  }

  function currentSnapshot() {
    return normalizeState(clone(state));
  }

  function renderPreview() {
    if (!dom.previewFrame) return;

    const snapshot = currentSnapshot();
    const html = buildPortfolioHTML(snapshot, { pro: isPro() });
    dom.previewFrame.srcdoc = html;

    const slug = slugify(snapshot.profile.name);
    if (dom.previewUrl) {
      dom.previewUrl.textContent = `folioforge.site/${slug}`;
      dom.previewUrl.title = `folioforge.site/${slug}`;
    }

    if (dom.previewMeta) {
      const projectCount = snapshot.projects.filter((project) => project.title.trim()).length;
      const skillCount = snapshot.skills.filter((skill) => skill.name.trim()).length;
      dom.previewMeta.textContent = `${projectCount} ${formatCount(projectCount, "проєкт", "проєкти", "проєктів")} · ${skillCount} ${formatCount(skillCount, "навичка", "навички", "навичок")}`;
    }

    if (dom.previewUpdateHint) {
      dom.previewUpdateHint.textContent = "щойно оновлено";
      window.clearTimeout(previewHintTimer);
      previewHintTimer = window.setTimeout(() => {
        if (dom.previewUpdateHint) dom.previewUpdateHint.textContent = "оновлюється автоматично";
      }, 2200);
    }
  }

  function setDevice(device) {
    const next = ["desktop", "tablet", "mobile"].includes(device) ? device : "desktop";
    if (dom.browserFrame) dom.browserFrame.dataset.device = next;

    $$(".device-switch__btn").forEach((button) => {
      const active = button.dataset.device === next;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function setMobileView(view) {
    const next = view === "preview" ? "preview" : "editor";
    document.body.dataset.mobileView = next;

    $$(".mobile-view-switch__btn").forEach((button) => {
      const active = button.dataset.mobileView === next;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function openPreview() {
    const html = buildPortfolioHTML(currentSnapshot(), { pro: isPro() });
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const popup = window.open(url, "_blank");

    if (!popup) {
      URL.revokeObjectURL(url);
      showToast("Вкладку заблоковано", "Дозвольте спливаючі вікна для цього сайту й спробуйте ще раз.", "info");
      return;
    }

    try {
      popup.opener = null;
    } catch (_) {
      /* Ignore cross-window restrictions. */
    }

    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    showToast("Превʼю відкрито", "Готовий сайт відкрито в новій вкладці.", "success");
  }

  /* =========================================================
     9. Copy, ZIP export & standalone README
     ========================================================= */

  function buildReadme(snapshot) {
    const name = snapshot.profile.name.trim() || "Portfolio";
    const role = snapshot.profile.role.trim() || "Developer";
    const theme = THEMES[snapshot.theme.id] || THEMES.cyberpunk;

    return `FOLIOFORGE — ЕКСПОРТ ПОРТФОЛІО
========================================

Проєкт: ${name} — ${role}
Тема: ${theme.name}
Дата експорту: ${new Date().toLocaleDateString("uk-UA")}

ЩО ВСЕРЕДИНІ
-------------
index.html — повністю готовий сайт. CSS, JavaScript, іконки та метадані
вбудовані в один файл, тому його можна відкрити подвійним кліком або
завантажити на будь-який статичний хостинг.

Google Fonts підключаються з зовнішнього CDN. Якщо потрібен повністю
офлайн-сайт, замініть посилання на шрифти власними локальними файлами
або видаліть <link> у <head> — сайт використає системні шрифти.

ЯК ОПУБЛІКУВАТИ
---------------
Netlify:
  1. Відкрийте https://app.netlify.com/drop
  2. Перетягніть папку з index.html у вікно браузера
  3. Отримайте публічне посилання

Vercel:
  1. Створіть новий проєкт і завантажте папку або підключіть Git-репозиторій
  2. Framework preset: Other
  3. Build command: залиште порожнім
  4. Output directory: . (корінь проєкту)

GitHub Pages:
  1. Створіть репозиторій і завантажте index.html
  2. Settings → Pages → Deploy from a branch
  3. Виберіть гілку main і папку / (root)

ЩО МОЖНА ЗМІНИТИ ВРУЧНУ
------------------------
• Текст, посилання та метадані — прямо в index.html.
• Кольори — CSS-змінні --accent, --accent-rgb та --accent-ink у <style>.
• Шрифти — змінні --font-display і --font-body.
• Favicon — data:image/svg+xml у <link rel="icon">.

ЛІЦЕНЗІЯ
--------
Цей експорт створено в FolioForge. Безкоштовна версія містить підпис
"Made with FolioForge" у футері. FolioForge Pro прибирає підпис і дозволяє
використовувати шаблон у комерційних і клієнтських проєктах.

Питання: ${CONFIG.brandUrl}
`;
  }

  const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let index = 0; index < 256; index += 1) {
      let value = index;
      for (let bit = 0; bit < 8; bit += 1) {
        value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
      }
      table[index] = value >>> 0;
    }
    return table;
  })();

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (let index = 0; index < bytes.length; index += 1) {
      crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[index]) & 0xff];
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  /**
   * Minimal ZIP writer using the "store" method (no compression).
   * Keeps the export dependency-free while producing a valid archive.
   */
  function createZip(files) {
    const encoder = new TextEncoder();
    const localChunks = [];
    const centralChunks = [];
    const now = new Date();
    const dosTime = ((now.getHours() & 31) << 11) | ((now.getMinutes() & 63) << 5) | ((Math.floor(now.getSeconds() / 2)) & 31);
    const dosDate = (((now.getFullYear() - 1980) & 127) << 9) | (((now.getMonth() + 1) & 15) << 5) | (now.getDate() & 31);
    let offset = 0;

    files.forEach((file) => {
      const nameBytes = encoder.encode(file.name);
      const dataBytes = typeof file.data === "string" ? encoder.encode(file.data) : file.data;
      const checksum = crc32(dataBytes);
      const localOffset = offset;

      const localHeader = new Uint8Array(30 + nameBytes.length);
      const localView = new DataView(localHeader.buffer);
      localView.setUint32(0, 0x04034b50, true);
      localView.setUint16(4, 20, true);
      localView.setUint16(6, 0x0800, true);
      localView.setUint16(8, 0, true);
      localView.setUint16(10, dosTime, true);
      localView.setUint16(12, dosDate, true);
      localView.setUint32(14, checksum, true);
      localView.setUint32(18, dataBytes.length, true);
      localView.setUint32(22, dataBytes.length, true);
      localView.setUint16(26, nameBytes.length, true);
      localView.setUint16(28, 0, true);
      localHeader.set(nameBytes, 30);

      localChunks.push(localHeader, dataBytes);
      offset += localHeader.length + dataBytes.length;

      const centralHeader = new Uint8Array(46 + nameBytes.length);
      const centralView = new DataView(centralHeader.buffer);
      centralView.setUint32(0, 0x02014b50, true);
      centralView.setUint16(4, 20, true);
      centralView.setUint16(6, 20, true);
      centralView.setUint16(8, 0x0800, true);
      centralView.setUint16(10, 0, true);
      centralView.setUint16(12, dosTime, true);
      centralView.setUint16(14, dosDate, true);
      centralView.setUint32(16, checksum, true);
      centralView.setUint32(20, dataBytes.length, true);
      centralView.setUint32(24, dataBytes.length, true);
      centralView.setUint16(28, nameBytes.length, true);
      centralView.setUint16(30, 0, true);
      centralView.setUint16(32, 0, true);
      centralView.setUint16(34, 0, true);
      centralView.setUint16(36, 0, true);
      centralView.setUint32(38, 0, true);
      centralView.setUint32(42, localOffset, true);
      centralHeader.set(nameBytes, 46);

      centralChunks.push(centralHeader);
    });

    const centralSize = centralChunks.reduce((total, chunk) => total + chunk.length, 0);
    const endRecord = new Uint8Array(22);
    const endView = new DataView(endRecord.buffer);
    endView.setUint32(0, 0x06054b50, true);
    endView.setUint16(4, 0, true);
    endView.setUint16(6, 0, true);
    endView.setUint16(8, files.length, true);
    endView.setUint16(10, files.length, true);
    endView.setUint32(12, centralSize, true);
    endView.setUint32(16, offset, true);
    endView.setUint16(20, 0, true);

    return new Blob([...localChunks, ...centralChunks, endRecord], { type: "application/zip" });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function downloadSiteZip() {
    const snapshot = currentSnapshot();
    const html = buildPortfolioHTML(snapshot, { pro: isPro() });
    const zip = createZip([
      { name: "index.html", data: html },
      { name: "README.txt", data: buildReadme(snapshot) },
    ]);

    downloadBlob(zip, `${slugify(snapshot.profile.name)}-portfolio.zip`);
    showToast("ZIP завантажено", "Всередині index.html і README.txt — можна одразу деплоїти.", "success");
  }

  async function copyText(value) {
    if (navigator.clipboard && window.isSecureContext && typeof navigator.clipboard.writeText === "function") {
      try {
        await navigator.clipboard.writeText(value);
        return true;
      } catch (_) {
        /* Clipboard permission can be denied — fall back to execCommand. */
      }
    }

    const area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-9999px";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();

    let copied = false;
    try {
      copied = document.execCommand("copy");
    } finally {
      area.remove();
    }
    return copied;
  }

  async function copyCode() {
    const html = buildPortfolioHTML(currentSnapshot(), { pro: isPro() });
    try {
      const copied = await copyText(html);
      if (!copied) throw new Error("copy failed");
      showToast("Код скопійовано", "Повний автономний HTML із вбудованими стилями в буфері обміну.", "success");
    } catch (_) {
      showToast("Не вдалося скопіювати", "Виділіть код вручну або скористайтеся ZIP-експортом.", "error");
    }
  }

  /* =========================================================
     10. Monetization — paywall, checkout & license
     ========================================================= */

  let bodyOverflowBeforeModal = "";
  let pendingThemeId = "";

  function lockBodyScroll() {
    if (document.body.classList.contains("has-modal")) return;
    bodyOverflowBeforeModal = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("has-modal");
  }

  function unlockBodyScroll() {
    document.body.style.overflow = bodyOverflowBeforeModal;
    document.body.classList.remove("has-modal");
  }

  function updateCheckoutButton() {
    if (!dom.checkoutButton) return;
    const connected = Boolean(String(CONFIG.checkoutUrl || "").trim());
    const label = $("span", dom.checkoutButton);

    if (label) label.textContent = connected ? "Купити FolioForge Pro" : "Оформити FolioForge Pro";
    dom.checkoutButton.setAttribute(
      "aria-label",
      connected ? "Перейти до безпечної оплати FolioForge Pro" : "Оформити FolioForge Pro"
    );
    dom.checkoutButton.title = connected
      ? "Відкрити сторінку оплати Stripe або LemonSqueezy"
      : "Checkout ще не підключено — доступний демо-ключ";

    if (dom.paywallFineprint) {
      dom.paywallFineprint.textContent = connected
        ? "Безпечна оплата через Stripe / LemonSqueezy. Доступ активується одразу після покупки."
        : "Демо-режим: checkout ще не підключено. Додайте Stripe або LemonSqueezy URL у CONFIG.checkoutUrl, або активуйте демо-ключ нижче.";
    }
  }

  function openPaywall(themeId = "") {
    if (isPro()) {
      showToast("FolioForge Pro активовано", "Усі теми, шрифти та чистий експорт уже доступні.", "success");
      return;
    }

    if (!dom.paywallModal || !dom.paywallModal.hidden) return;

    pendingThemeId = themeId && THEMES[themeId] ? themeId : "";
    modalReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    updateCheckoutButton();
    dom.paywallModal.hidden = false;
    lockBodyScroll();

    window.setTimeout(() => {
      if (dom.paywallModal.hidden) return;
      const closeButton = $(".modal-close", dom.paywallModal);
      if (closeButton) closeButton.focus({ preventScroll: true });
      else if (dom.paywallDialog) dom.paywallDialog.focus({ preventScroll: true });
    }, 0);
  }

  function closePaywall() {
    if (!dom.paywallModal || dom.paywallModal.hidden) return;

    dom.paywallModal.hidden = true;
    unlockBodyScroll();

    if (dom.licenseForm) dom.licenseForm.hidden = true;
    if (dom.licenseToggle) {
      dom.licenseToggle.textContent = "Ввести ключ";
      dom.licenseToggle.setAttribute("aria-expanded", "false");
    }
    resetLicenseInput();

    if (modalReturnFocus && document.contains(modalReturnFocus)) {
      modalReturnFocus.focus({ preventScroll: true });
    }
    modalReturnFocus = null;
  }

  function resetLicenseInput() {
    if (!dom.licenseInput) return;
    dom.licenseInput.classList.remove("is-invalid");
    dom.licenseInput.removeAttribute("aria-invalid");
  }

  function markLicenseInvalid(message) {
    if (dom.licenseInput) {
      dom.licenseInput.classList.add("is-invalid");
      dom.licenseInput.setAttribute("aria-invalid", "true");
      dom.licenseInput.focus();
      dom.licenseInput.select();
    }
    showToast("Ключ не активовано", message || "Перевірте ліцензійний ключ і спробуйте ще раз.", "error");
  }

  function handleCheckout() {
    const checkoutUrl = String(CONFIG.checkoutUrl || "").trim();

    if (checkoutUrl) {
      const target = safeUrl(checkoutUrl);
      if (!target) {
        showToast("Некоректний checkout URL", "Перевірте CONFIG.checkoutUrl в app.js.", "error");
        return;
      }
      window.open(target, "_blank", "noopener,noreferrer");
      return;
    }

    if (dom.licenseForm) dom.licenseForm.hidden = false;
    if (dom.licenseToggle) {
      dom.licenseToggle.textContent = "Приховати";
      dom.licenseToggle.setAttribute("aria-expanded", "true");
    }
    if (dom.licenseInput) dom.licenseInput.focus();

    showToast(
      "Оплата ще не підключена",
      "Додайте Stripe або LemonSqueezy URL у CONFIG.checkoutUrl. Для тесту використайте FOLIO-PRO-2026.",
      "info"
    );
  }

  function activateLicense(rawKey) {
    const key = String(rawKey || "")
      .trim()
      .replace(/\s+/g, "-")
      .toUpperCase();

    if (!key) {
      markLicenseInvalid("Введіть ліцензійний ключ.");
      return false;
    }

    if (key !== String(CONFIG.demoLicenseKey).toUpperCase()) {
      markLicenseInvalid("Цей ключ не підходить. Перевірте написання або придбайте Pro.");
      return false;
    }

    license = { active: true, key, activatedAt: new Date().toISOString() };
    writeJSON(LICENSE_KEY, license);

    const unlockedTheme = pendingThemeId && THEMES[pendingThemeId] ? THEMES[pendingThemeId] : null;
    if (unlockedTheme) {
      state.theme.id = pendingThemeId;
      state.theme.accent = unlockedTheme.accent;
      pendingThemeId = "";
    }

    updateProUI();
    renderAccentGrid();
    markDirty();
    renderPreview();
    closePaywall();

    showToast(
      "FolioForge Pro активовано",
      unlockedTheme
        ? `Тему ${unlockedTheme.name} відкрито. Watermark зникне з експорту.`
        : "Преміальні теми та чистий експорт без watermark розблоковано.",
      "success"
    );
    return true;
  }

  function toggleLicenseForm() {
    if (!dom.licenseForm) return;

    const willOpen = dom.licenseForm.hidden;
    dom.licenseForm.hidden = !willOpen;
    if (dom.licenseToggle) {
      dom.licenseToggle.textContent = willOpen ? "Приховати" : "Ввести ключ";
      dom.licenseToggle.setAttribute("aria-expanded", String(willOpen));
    }

    if (willOpen && dom.licenseInput) {
      window.setTimeout(() => dom.licenseInput.focus(), 0);
    }
  }

  function trapFocus(event) {
    const root = dom.paywallDialog || dom.paywallModal;
    if (!root) return;

    const focusable = $$(
      'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      root
    ).filter((element) => element.offsetParent !== null);

    if (!focusable.length) {
      event.preventDefault();
      root.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === root || !root.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || active === root || !root.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  }

  /* =========================================================
     11. Reset, persistence & app bootstrap
     ========================================================= */

  function persistNow() {
    window.clearTimeout(saveTimer);
    const ok = writeJSON(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
    setSaveStatus(ok ? "saved" : "error");
    return ok;
  }

  function refreshEditorFromState() {
    hydratePathFields();
    renderSkills();
    renderProjects();
    renderSocials();
    renderThemeGrid();
    renderFontGrid();
    renderAccentGrid();
  }

  function resetWorkspace() {
    const confirmed = window.confirm(
      "Скинути всі дані? Демонстраційний контент замінить ваші зміни. Одразу після скидання можна буде натиснути «Відмінити»."
    );
    if (!confirmed) return;

    const previous = clone(state);
    state = normalizeState(clone(DEFAULT_STATE));
    refreshEditorFromState();
    updateProUI();
    activateTab("personal");
    markDirty();
    renderPreview();

    showToast("Дані скинуто", "Повернуто демонстраційне портфоліо Олександра.", "info", {
      label: "Відмінити",
      onClick: () => {
        state = normalizeState(previous);
        refreshEditorFromState();
        updateProUI();
        markDirty();
        renderPreview();
        showToast("Скидання скасовано", "Ваші попередні дані відновлено.", "success");
      },
    });
  }

  function bindEvents() {
    if (dom.editorForm) {
      dom.editorForm.addEventListener("input", handlePathInput);
    }

    $$(".editor-tab", dom.editorTabs).forEach((tab) => {
      tab.addEventListener("click", () => activateTab(tab.dataset.tab));

      tab.addEventListener("keydown", (event) => {
        const tabs = $$(".editor-tab", dom.editorTabs);
        const index = tabs.indexOf(tab);
        let nextIndex = -1;

        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = tabs.length - 1;
        if (nextIndex < 0) return;

        event.preventDefault();
        activateTab(tabs[nextIndex].dataset.tab);
        tabs[nextIndex].focus();
      });
    });

    $$(".mobile-view-switch__btn").forEach((button) => {
      button.addEventListener("click", () => setMobileView(button.dataset.mobileView));
    });

    dom.addSkillBtn?.addEventListener("click", addSkill);
    dom.addProjectBtn?.addEventListener("click", addProject);
    dom.addSocialBtn?.addEventListener("click", addSocial);

    bindRepeater(dom.skillsList, "skills");
    bindRepeater(dom.projectsList, "projects");
    bindRepeater(dom.socialsList, "socials");

    dom.themeGrid?.addEventListener("click", (event) => {
      const card = event.target.closest("[data-theme-id]");
      if (card) selectTheme(card.dataset.themeId);
    });

    dom.fontGrid?.addEventListener("click", (event) => {
      const card = event.target.closest("[data-font-id]");
      if (card) selectFont(card.dataset.fontId);
    });

    dom.accentGrid?.addEventListener("click", (event) => {
      const swatch = event.target.closest("[data-accent]");
      if (swatch) selectAccent(swatch.dataset.accent);
    });

    dom.customAccent?.addEventListener("input", () => selectAccent(dom.customAccent.value));

    $$(".device-switch__btn").forEach((button) => {
      button.addEventListener("click", () => setDevice(button.dataset.device));
    });

    dom.refreshPreviewBtn?.addEventListener("click", () => {
      renderPreview();
      showToast("Превʼю оновлено", "Відображено актуальну версію сайту.", "success");
    });

    dom.openPreviewBtn?.addEventListener("click", openPreview);
    dom.resetBtn?.addEventListener("click", resetWorkspace);

    dom.paywallModal?.addEventListener("click", (event) => {
      if (event.target === dom.paywallModal) closePaywall();
    });

    dom.checkoutButton?.addEventListener("click", handleCheckout);
    dom.licenseToggle?.addEventListener("click", toggleLicenseForm);

    dom.licenseForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      activateLicense(dom.licenseInput ? dom.licenseInput.value : "");
    });

    dom.licenseInput?.addEventListener("input", resetLicenseInput);

    document.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-action]");
      if (!actionButton) return;

      const action = actionButton.dataset.action;
      if (action === "copy") copyCode();
      else if (action === "download") downloadSiteZip();
      else if (action === "upgrade") openPaywall();
      else if (action === "close-paywall") closePaywall();
    });

    document.addEventListener("keydown", (event) => {
      const modalOpen = dom.paywallModal && !dom.paywallModal.hidden;

      if (modalOpen) {
        if (event.key === "Escape") {
          event.preventDefault();
          closePaywall();
          return;
        }
        if (event.key === "Tab") {
          trapFocus(event);
          return;
        }
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        const saved = persistNow();
        showToast(saved ? "Збережено локально" : "Не вдалося зберегти", saved ? "Дані успішно записані в localStorage." : "Перевірте налаштування браузера.", saved ? "success" : "error");
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") persistNow();
    });

    window.addEventListener("pagehide", persistNow);
  }

  function initApp() {
    document.body.dataset.mobileView = "editor";
    setDevice("desktop");
    setMobileView("editor");
    refreshEditorFromState();
    updateProUI();
    updateCheckoutButton();
    activateTab("personal");
    bindEvents();
    setSaveStatus("saved");
    renderPreview();
  }

  initApp();

})();
