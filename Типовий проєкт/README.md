# FolioForge — Portfolio Studio

Конструктор сайтів-портфоліо для розробників і фрилансерів. Двопанельний редактор із живим превʼю, шістьма темами, шрифтовими парами, ZIP-експортом і paywall-механікою для продажу Pro-версії.

## Що вміє

- **Редактор + live preview** — форма зліва, готовий сайт справа, оновлення з debounce.
- **5 розділів** — особисті дані, навички, проєкти, соцмережі, візуальний стиль.
- **Динамічні блоки** — навички, проєкти та соцмережі додаються/видаляються з undo-тостом.
- **6 тем** — Cyberpunk, Minimal, Neon Glass (Free); Editorial, Terminal, Aurora (Pro).
- **5 шрифтових пар** і власний акцентний колір.
- **Автозбереження** у `localStorage`.
- **Адаптивне превʼю** — desktop / tablet / mobile.
- **Експорт ZIP** — автономний `index.html` з вбудованими CSS/JS + `README.txt`.
- **Copy Code** — копіює повний standalone HTML.
- **Paywall** — Stripe / LemonSqueezy checkout hook, демо-ліцензійний ключ, Pro-стан зберігається локально.

## Структура

```text
index.html      розмітка конструктора, форма, превʼю, paywall
styles.css      дизайн-система конструктора та адаптивність
app.js          стан, рендеринг, генератор сайту, ZIP, монетизація
README.md       цей файл
```

Зовнішніх залежностей немає. Білд не потрібен. Єдине зовнішнє підключення — Google Fonts.

## Локальний запуск

Відкрийте `index.html` у браузері або підніміть простий HTTP-сервер:

```bash
# Python
python -m http.server 4173

# Node.js
npx serve .
```

Потім відкрийте `http://localhost:4173`.

> Для стабільної роботи `localStorage` і превʼю рекомендовано HTTP-сервер, хоча `file://` теж працює в більшості браузерів.

## Деплой

### Vercel

1. Імпортуйте репозиторій або завантажте папку.
2. Framework preset: **Other**.
3. Build command: залиште порожнім.
4. Output directory: `.` (корінь).

### Netlify

1. Відкрийте [app.netlify.com/drop](https://app.netlify.com/drop).
2. Перетягніть папку з `index.html`, `styles.css`, `app.js`.
3. Отримайте публічне посилання.

### GitHub Pages

1. Завантажте файли в репозиторій.
2. Settings → Pages → Deploy from a branch.
3. Виберіть `main` і папку `/ (root)`.

## Монетизація

Усі налаштування — на початку `app.js`:

```js
const CONFIG = {
  checkoutUrl: "", // Stripe Payment Link або LemonSqueezy checkout URL
  demoLicenseKey: "FOLIO-PRO-2026",
  productName: "FolioForge Pro",
  brandUrl: "https://folioforge.app",
};
```

### Stripe

1. Створіть Product і Price у Stripe Dashboard.
2. Створіть Payment Link.
3. Вставте посилання в `CONFIG.checkoutUrl`.

### LemonSqueezy

1. Створіть продукт і checkout.
2. Скопіюйте checkout URL.
3. Вставте його в `CONFIG.checkoutUrl`.

Кнопка checkout відкриває сторінку оплати в новій вкладці. Якщо `checkoutUrl` порожній, відкривається поле для ліцензійного ключа й показується підказка для розробника.

### Демо-ключ

```text
FOLIO-PRO-2026
```

Він активує Pro-теми та прибирає `Made with FolioForge` з експорту.

> **Важливо:** це клієнтська демонстрація. Для реального продажу видавайте унікальні ключі після оплати (Stripe webhook + serverless-функція) і перевіряйте їх на сервері. Не покладайтеся на перевірку ключа лише в браузері.

## Що генерується в ZIP

- `index.html` — повний standalone-сайт: розмітка, CSS, JS, SVG-іконки, favicon, meta/OG-теги.
- `README.txt` — коротка інструкція з деплою та кастомізації.

Експортований сайт:

- адаптивний (mobile/tablet/desktop);
- має доступну навігацію, skip-link, `prefers-reduced-motion`;
- використовує обрану тему, шрифтову пару й акцент;
- підключає Google Fonts;
- безкоштовна версія містить watermark, Pro — ні.

## Кастомізація

- Кольори сайту — CSS-змінні `--accent`, `--accent-rgb`, `--accent-ink`.
- Шрифти — `--font-display`, `--font-body`.
- Теми — обʼєкт `THEMES` у `app.js`.
- Шрифти — обʼєкт `FONTS` у `app.js`.
- Соцмережі та іконки — `SOCIALS` і `SOCIAL_ICONS`.
- Демо-контент — `DEFAULT_STATE`.

## Доступність

- Форми мають `<label>` та `aria-label`.
- Таби підтримують `ArrowLeft`, `ArrowRight`, `Home`, `End`.
- Paywall закривається `Escape`, утримує фокус і повертає його на тригер.
- Є `aria-live` для тостів і статусу збереження.
- Підтримується `prefers-reduced-motion`.

## Браузери

Сучасні Chrome, Edge, Firefox, Safari. Потрібні `localStorage`, `Blob`, `TextEncoder`, `URL.createObjectURL`, `Intl`/`toLocaleDateString`. Clipboard API має fallback на `execCommand`.

## Ліцензія

Код конструктора можна використовувати як основу для власного продукту. Перед публікацією замініть брендинг, demo-ключ і URL checkout на власні.
