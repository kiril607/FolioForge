"use strict";

/**
 * FolioForge licensing server
 * ─────────────────────────────────────────────────────────────
 * Zero-dependency Node.js server that:
 *   1. Serves the builder, styles, app and the admin dashboard.
 *   2. Accepts manual purchase requests (name + email + payment reference).
 *   3. Lets the owner approve a payment in /admin.
 *   4. Emails a single-use license key to the buyer after approval.
 *   5. Activates a key once and returns a signed lifetime token.
 *
 * Run:  node server.js
 * Docs: README.md → «Ліцензії та оплата»
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/* ─────────────────────────────  Config  ───────────────────────────── */

function loadEnvFile() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equals = trimmed.indexOf("=");
    if (equals < 1) continue;

    const key = trimmed.slice(0, equals).trim();
    let value = trimmed.slice(equals + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const OUTBOX_DIR = path.join(DATA_DIR, "outbox");
const DB_FILE = path.join(DATA_DIR, "db.json");
const rawPort = Number(process.env.PORT || 4173);
const PORT = Number.isInteger(rawPort) && rawPort > 0 && rawPort < 65536 ? rawPort : 4173;
const APP_URL = String(process.env.APP_URL || `http://localhost:${PORT}`).replace(/\/+$/, "");
const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || "").trim();
const RESEND_API_KEY = String(process.env.RESEND_API_KEY || "").trim();
const EMAIL_FROM = String(process.env.EMAIL_FROM || "FolioForge <onboarding@resend.dev>").trim();
const rawPrice = Number(process.env.PRO_PRICE || 5);
const PRICE = Number.isFinite(rawPrice) && rawPrice > 0 ? Math.round(rawPrice * 100) / 100 : 5;
const PRODUCT_NAME = "FolioForge Pro";

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(OUTBOX_DIR, { recursive: true });

function readSecretFile(fileName) {
  const file = path.join(DATA_DIR, fileName);
  if (fs.existsSync(file)) {
    const existing = fs.readFileSync(file, "utf8").trim();
    if (existing) return existing;
  }
  const value = crypto.randomBytes(32).toString("hex");
  fs.writeFileSync(file, value, { encoding: "utf8", mode: 0o600 });
  return value;
}

const ADMIN_TOKEN =
  String(process.env.ADMIN_TOKEN || "").trim() || readSecretFile("admin-token.txt");
const LICENSE_SECRET =
  String(process.env.LICENSE_SECRET || "").trim() || readSecretFile("license-secret.txt");

if (LICENSE_SECRET.length < 32) {
  console.warn("[security] LICENSE_SECRET коротший за 32 символи — використовуйте довший випадковий секрет.");
}

/* ─────────────────────────────  Storage  ──────────────────────────── */

function emptyDb() {
  return { orders: [], licenses: [], createdAt: new Date().toISOString() };
}

function loadDb() {
  try {
    if (!fs.existsSync(DB_FILE)) return emptyDb();
    const parsed = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    return {
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      licenses: Array.isArray(parsed.licenses) ? parsed.licenses : [],
      createdAt: parsed.createdAt || new Date().toISOString(),
    };
  } catch (error) {
    console.error("[db] Не вдалося прочитати data/db.json:", error.message);
    const backup = `${DB_FILE}.broken-${Date.now()}`;
    try {
      fs.copyFileSync(DB_FILE, backup);
      console.error(`[db] Пошкоджений файл збережено як ${backup}`);
    } catch {
      /* ignore */
    }
    return emptyDb();
  }
}

const db = loadDb();

function persistDb() {
  const tmp = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), "utf8");
  fs.renameSync(tmp, DB_FILE);
}

/* ─────────────────────────────  Helpers  ──────────────────────────── */

function nowIso() {
  return new Date().toISOString();
}

function randomId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}`;
}

function normalizeKey(raw) {
  return String(raw || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "-")
    .replace(/[^A-Z0-9-]/g, "");
}

function generateLicenseKey() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const groups = [];

  for (let group = 0; group < 3; group += 1) {
    let value = "";
    for (let index = 0; index < 4; index += 1) {
      value += alphabet[crypto.randomInt(0, alphabet.length)];
    }
    groups.push(value);
  }

  return `FOLIO-${groups.join("-")}`;
}

function hashKey(key) {
  return crypto.createHash("sha256").update(normalizeKey(key)).digest("hex");
}

function encryptionKey() {
  return crypto.createHash("sha256").update(LICENSE_SECRET).digest();
}

function encryptSecret(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    data: encrypted.toString("base64"),
  };
}

function decryptSecret(payload) {
  if (!payload || !payload.iv || !payload.tag || !payload.data) return "";
  try {
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      encryptionKey(),
      Buffer.from(payload.iv, "base64")
    );
    decipher.setAuthTag(Buffer.from(payload.tag, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(payload.data, "base64")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return "";
  }
}

function signToken(payload) {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = crypto
    .createHmac("sha256", LICENSE_SECRET)
    .update(body)
    .digest("base64url");
  return `${body}.${signature}`;
}

function verifyToken(token) {
  const value = String(token || "");
  const parts = value.split(".");
  if (parts.length !== 2) return null;

  const [body, signature] = parts;
  const expected = crypto
    .createHmac("sha256", LICENSE_SECRET)
    .update(body)
    .digest("base64url");

  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) return null;

  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function emailLooksValid(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || "").trim());
}

function maskEmail(value) {
  const email = String(value || "");
  const at = email.indexOf("@");
  if (at < 1) return "***";
  const name = email.slice(0, at);
  const domain = email.slice(at + 1);
  return `${name.slice(0, 2)}${"*".repeat(Math.max(1, name.length - 2))}@${domain}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function clientIp(request) {
  const forwarded = String(request.headers["x-forwarded-for"] || "")
    .split(",")[0]
    .trim();
  return forwarded || request.socket.remoteAddress || "unknown";
}

const rateBuckets = new Map();

function rateLimit(ip, bucket, limit, windowMs) {
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const hits = (rateBuckets.get(key) || []).filter((time) => now - time < windowMs);
  if (hits.length >= limit) {
    rateBuckets.set(key, hits);
    return false;
  }
  hits.push(now);
  rateBuckets.set(key, hits);
  return true;
}

/* ─────────────────────────────  Email  ────────────────────────────── */

function writeOutbox(to, subject, text, html) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const safeTo = String(to || "admin").replace(/[^a-z0-9@._-]+/gi, "_");
  const file = path.join(OUTBOX_DIR, `${stamp}-${safeTo}.txt`);

  const content = [
    "FolioForge local outbox",
    "======================",
    `To: ${to}`,
    `From: ${EMAIL_FROM}`,
    `Subject: ${subject}`,
    `Date: ${nowIso()}`,
    "",
    text,
    "",
    "-------------------- HTML --------------------",
    html,
  ].join("\n");

  fs.writeFileSync(file, content, "utf8");
  return file;
}

async function sendEmail({ to, subject, text, html }) {
  if (!RESEND_API_KEY) {
    const file = writeOutbox(to, subject, text, html);
    console.log(`[email:outbox] ${to} — ${subject} → ${path.relative(ROOT, file)}`);
    return { status: "outbox", file: path.relative(ROOT, file) };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    let response;
    try {
      response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: EMAIL_FROM,
          to: [to],
          subject,
          text,
          html,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = data.message || data.error || `HTTP ${response.status}`;
      console.error(`[email:failed] ${to}: ${error}`);
      return { status: "failed", error };
    }

    console.log(`[email:sent] ${to} — ${subject} (${data.id || "no id"})`);
    return { status: "sent", id: data.id || "" };
  } catch (error) {
    const message = error && error.name === "AbortError"
      ? "Resend не відповів за 15 секунд"
      : error.message;
    console.error(`[email:failed] ${to}: ${message}`);
    return { status: "failed", error: message };
  }
}

function buyerEmail(order, key) {
  const subject = `Ваш ключ ${PRODUCT_NAME} ($${PRICE})`;
  const text = [
    `Привіт, ${order.name || "друже"}!`,
    "",
    `Оплату $${PRICE} підтверджено. Дякуємо за підтримку FolioForge.`,
    "",
    `Ваш одноразовий ключ: ${key}`,
    "",
    "Як активувати:",
    `1. Відкрийте ${APP_URL}`,
    '2. Натисніть «Free» у шапці → «Вже маєте ліцензійний ключ?»',
    "3. Введіть ключ і натисніть «Активувати».",
    "",
    "Важливо: ключ одноразовий. Після активації він більше не спрацює.",
    "Не передавайте ключ іншим людям. Якщо ви втратили доступ до браузера,",
    "напишіть власнику FolioForge і вкажіть email, на який надійшов ключ.",
    "",
    "Що відкривається у Pro:",
    "• 6 тем замість 1 базової",
    "• 5 шрифтів і власний акцентний колір",
    "• Без watermark на експортованому сайті",
    "• До 30 навичок, 12 проєктів і 10 соцмереж",
    "",
    `Замовлення: ${order.id}`,
    "Гарного дня!",
    "FolioForge",
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1d1b16;max-width:560px;margin:0 auto">
      <h2 style="margin:0 0 16px">Дякуємо за покупку!</h2>
      <p>Привіт, ${escapeHtml(order.name || "друже")}!</p>
      <p>Оплату <strong>$${PRICE}</strong> підтверджено. Ваш ключ ${escapeHtml(PRODUCT_NAME)}:</p>
      <p style="margin:22px 0;padding:16px;border-radius:10px;background:#f3efe5;font-family:monospace;font-size:20px;letter-spacing:.06em;text-align:center">
        <strong>${escapeHtml(key)}</strong>
      </p>
      <p><strong>Як активувати</strong></p>
      <ol>
        <li>Відкрийте <a href="${escapeHtml(APP_URL)}">${escapeHtml(APP_URL)}</a></li>
        <li>Натисніть «Free» у шапці → «Вже маєте ліцензійний ключ?»</li>
        <li>Введіть ключ і натисніть «Активувати».</li>
      </ol>
      <p style="padding:12px;border-left:3px solid #e8633f;background:#fff7f2">
        <strong>Ключ одноразовий.</strong> Після активації він більше не спрацює.
        Не передавайте його іншим. Якщо втратили доступ до браузера — напишіть
        власнику FolioForge і вкажіть email, на який надійшов ключ.
      </p>
      <p><strong>Що відкривається у Pro:</strong></p>
      <ul>
        <li>6 тем замість 1 базової</li>
        <li>5 шрифтів і власний акцентний колір</li>
        <li>Без watermark на експортованому сайті</li>
        <li>До 30 навичок, 12 проєктів і 10 соцмереж</li>
      </ul>
      <p style="color:#706a5e;font-size:13px">Замовлення: ${escapeHtml(order.id)}</p>
      <p>Гарного дня!<br><strong>FolioForge</strong></p>
    </div>
  `;

  return { subject, text, html };
}

function adminEmail(order) {
  const subject = `[FolioForge] Нова заявка на Pro — $${PRICE} — ${order.email}`;
  const text = [
    "Нова заявка на FolioForge Pro.",
    "",
    `Замовлення: ${order.id}`,
    `Ім'я: ${order.name}`,
    `Email: ${order.email}`,
    `Сума: $${PRICE}`,
    `Спосіб оплати: ${order.method || "не вказано"}`,
    `Транзакція / коментар: ${order.reference || "не вказано"}`,
    `Примітка: ${order.note || "—"}`,
    `Створено: ${order.createdAt}`,
    "",
    `Підтвердити оплату: ${APP_URL}/admin`,
    "",
    "Після підтвердження покупцю автоматично надійде одноразовий ключ.",
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1d1b16;max-width:560px;margin:0 auto">
      <h2 style="margin:0 0 16px">Нова заявка на ${escapeHtml(PRODUCT_NAME)}</h2>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:6px 10px;background:#f3efe5"><strong>Замовлення</strong></td><td style="padding:6px 10px">${escapeHtml(order.id)}</td></tr>
        <tr><td style="padding:6px 10px;background:#f3efe5"><strong>Ім'я</strong></td><td style="padding:6px 10px">${escapeHtml(order.name)}</td></tr>
        <tr><td style="padding:6px 10px;background:#f3efe5"><strong>Email</strong></td><td style="padding:6px 10px">${escapeHtml(order.email)}</td></tr>
        <tr><td style="padding:6px 10px;background:#f3efe5"><strong>Сума</strong></td><td style="padding:6px 10px">$${PRICE}</td></tr>
        <tr><td style="padding:6px 10px;background:#f3efe5"><strong>Оплата</strong></td><td style="padding:6px 10px">${escapeHtml(order.method || "не вказано")}</td></tr>
        <tr><td style="padding:6px 10px;background:#f3efe5"><strong>Транзакція</strong></td><td style="padding:6px 10px">${escapeHtml(order.reference || "не вказано")}</td></tr>
        <tr><td style="padding:6px 10px;background:#f3efe5"><strong>Примітка</strong></td><td style="padding:6px 10px">${escapeHtml(order.note || "—")}</td></tr>
      </table>
      <p style="margin-top:20px">
        <a href="${escapeHtml(APP_URL)}/admin" style="display:inline-block;padding:11px 18px;border-radius:8px;background:#e8633f;color:#fff;text-decoration:none">
          Відкрити адмінку та підтвердити оплату
        </a>
      </p>
      <p style="color:#706a5e;font-size:13px">Після підтвердження покупцю автоматично надійде одноразовий ключ.</p>
    </div>
  `;

  return { subject, text, html };
}

/* ─────────────────────────────  HTTP  ─────────────────────────────── */

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

function sendJson(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(body);
}

function readJsonBody(request, limit = 64 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(Object.assign(new Error("Занадто великий запит"), { status: 413 }));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });

    request.on("end", () => {
      if (!chunks.length) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(Object.assign(new Error("Некоректний JSON"), { status: 400 }));
      }
    });

    request.on("error", reject);
  });
}

function isAdmin(request, url) {
  const headerToken = request.headers["x-admin-token"];
  const queryToken = url.searchParams.get("token");
  return safeEqual(String(headerToken || queryToken || ""), ADMIN_TOKEN);
}

function publicOrder(order) {
  const license = order.licenseId
    ? db.licenses.find((item) => item.id === order.licenseId)
    : null;

  return {
    id: order.id,
    name: order.name,
    email: order.email,
    method: order.method,
    reference: order.reference,
    note: order.note,
    status: order.status,
    createdAt: order.createdAt,
    approvedAt: order.approvedAt || null,
    rejectedAt: order.rejectedAt || null,
    rejectReason: order.rejectReason || "",
    emailStatus: order.emailStatus || "",
    emailError: order.emailError || "",
    outboxFile: order.outboxFile || "",
    licenseId: order.licenseId || "",
    keyUsedAt: license ? license.usedAt : null,
  };
}

function serveStatic(request, response, url) {
  let relative = decodeURIComponent(url.pathname);
  if (relative === "/" || relative === "") relative = "/index.html";
  if (relative === "/admin" || relative === "/admin/") relative = "/admin.html";

  const filePath = path.resolve(ROOT, `.${relative}`);
  const relativeParts = path.relative(ROOT, filePath).split(path.sep);

  const forbidden =
    !filePath.startsWith(ROOT + path.sep) ||
    relativeParts[0] === "data" ||
    relativeParts[0] === "node_modules" ||
    relativeParts.some((part) => part.startsWith(".")) ||
    relativeParts[0] === "server.js";

  if (forbidden) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const type = MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    response.writeHead(200, {
      "Content-Type": type,
      "Content-Length": stats.size,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    fs.createReadStream(filePath).pipe(response);
  });
}

async function handleApi(request, response, url) {
  const route = `${request.method} ${url.pathname}`;

  if (route === "GET /api/health") {
    sendJson(response, 200, {
      ok: true,
      emailMode: RESEND_API_KEY ? "resend" : "outbox",
      adminEmail: ADMIN_EMAIL || null,
      price: PRICE,
    });
    return true;
  }

  if (route === "POST /api/purchase") {
    const ip = clientIp(request);
    if (!rateLimit(ip, "purchase", 8, 60 * 60 * 1000)) {
      sendJson(response, 429, { error: "Забагато заявок. Спробуйте пізніше." });
      return true;
    }

    const body = await readJsonBody(request);
    const name = String(body.name || "").trim().slice(0, 60);
    const email = String(body.email || "").trim().slice(0, 120);
    const method = String(body.method || "").trim().slice(0, 40);
    const reference = String(body.reference || "").trim().slice(0, 160);
    const note = String(body.note || "").trim().slice(0, 500);

    if (name.length < 2) {
      sendJson(response, 400, { error: "Вкажіть ім'я (мінімум 2 символи)." });
      return true;
    }
    if (!emailLooksValid(email)) {
      sendJson(response, 400, { error: "Вкажіть коректний email." });
      return true;
    }

    const order = {
      id: randomId("ord"),
      name,
      email,
      method,
      reference,
      note,
      amount: PRICE,
      currency: "USD",
      status: "pending",
      createdAt: nowIso(),
      approvedAt: null,
      licenseId: null,
      emailStatus: "",
      emailError: "",
    };

    db.orders.push(order);
    persistDb();

    const mail = adminEmail(order);
    const notification = await sendEmail({
      to: ADMIN_EMAIL || "owner@localhost",
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });

    if (!ADMIN_EMAIL) {
      order.outboxFile = notification.file || "";
      persistDb();
    }

    sendJson(response, 201, {
      ok: true,
      orderId: order.id,
      message: "Заявку надіслано. Після підтвердження оплати ключ прийде на email.",
      emailMode: RESEND_API_KEY ? "resend" : "outbox",
      adminNotified: ADMIN_EMAIL ? notification.status : "outbox",
    });
    return true;
  }

  if (url.pathname.startsWith("/api/admin/")) {
    if (!isAdmin(request, url)) {
      sendJson(response, 401, { error: "Невірний токен адміністратора." });
      return true;
    }

    if (route === "GET /api/admin/orders") {
      const orders = db.orders
        .slice()
        .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)))
        .map(publicOrder);

      sendJson(response, 200, {
        ok: true,
        orders,
        stats: {
          pending: db.orders.filter((order) => order.status === "pending").length,
          approved: db.orders.filter((order) => order.status === "approved").length,
          rejected: db.orders.filter((order) => order.status === "rejected").length,
          usedKeys: db.licenses.filter((license) => license.usedAt).length,
          totalKeys: db.licenses.length,
        },
        emailMode: RESEND_API_KEY ? "resend" : "outbox",
        adminEmail: ADMIN_EMAIL || "",
        price: PRICE,
      });
      return true;
    }

    if (route === "POST /api/admin/approve") {
      const body = await readJsonBody(request);
      const order = db.orders.find((item) => item.id === body.orderId);

      if (!order) {
        sendJson(response, 404, { error: "Замовлення не знайдено." });
        return true;
      }
      if (order.status === "approved") {
        sendJson(response, 409, { error: "Оплату вже підтверджено." });
        return true;
      }

      const key = generateLicenseKey();
      const license = {
        id: randomId("lic"),
        keyHash: hashKey(key),
        keyEnc: encryptSecret(key),
        email: order.email,
        orderId: order.id,
        createdAt: nowIso(),
        usedAt: null,
        usedIp: "",
        revokedAt: null,
      };

      db.licenses.push(license);
      order.status = "approved";
      order.approvedAt = nowIso();
      order.licenseId = license.id;

      const mail = buyerEmail(order, key);
      const delivery = await sendEmail({
        to: order.email,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      });

      order.emailStatus = delivery.status;
      order.emailError = delivery.error || "";
      order.outboxFile = delivery.file || "";
      persistDb();

      sendJson(response, 200, {
        ok: true,
        key,
        emailStatus: delivery.status,
        emailError: delivery.error || "",
        outboxFile: delivery.file || "",
        order: publicOrder(order),
      });
      return true;
    }

    if (route === "POST /api/admin/reject") {
      const body = await readJsonBody(request);
      const order = db.orders.find((item) => item.id === body.orderId);

      if (!order) {
        sendJson(response, 404, { error: "Замовлення не знайдено." });
        return true;
      }
      if (order.status === "approved") {
        sendJson(response, 409, { error: "Не можна відхилити вже підтверджене замовлення." });
        return true;
      }

      order.status = "rejected";
      order.rejectedAt = nowIso();
      order.rejectReason = String(body.reason || "").trim().slice(0, 300);
      persistDb();

      sendJson(response, 200, { ok: true, order: publicOrder(order) });
      return true;
    }

    if (route === "POST /api/admin/reveal") {
      const body = await readJsonBody(request);
      const order = db.orders.find((item) => item.id === body.orderId);
      const license = order && order.licenseId
        ? db.licenses.find((item) => item.id === order.licenseId)
        : null;

      if (!order || !license) {
        sendJson(response, 404, { error: "Ключ для цього замовлення не знайдено." });
        return true;
      }

      const key = decryptSecret(license.keyEnc);
      sendJson(response, 200, {
        ok: true,
        key,
        usedAt: license.usedAt,
        emailStatus: order.emailStatus || "",
      });
      return true;
    }

    if (route === "POST /api/admin/resend") {
      const body = await readJsonBody(request);
      const order = db.orders.find((item) => item.id === body.orderId);
      const license = order && order.licenseId
        ? db.licenses.find((item) => item.id === order.licenseId)
        : null;

      if (!order || !license) {
        sendJson(response, 404, { error: "Ключ для цього замовлення не знайдено." });
        return true;
      }

      const key = decryptSecret(license.keyEnc);
      if (!key) {
        sendJson(response, 500, { error: "Не вдалося розшифрувати ключ." });
        return true;
      }

      const mail = buyerEmail(order, key);
      const delivery = await sendEmail({
        to: order.email,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      });

      order.emailStatus = delivery.status;
      order.emailError = delivery.error || "";
      order.outboxFile = delivery.file || "";
      persistDb();

      sendJson(response, 200, {
        ok: true,
        emailStatus: delivery.status,
        emailError: delivery.error || "",
        outboxFile: delivery.file || "",
        usedAt: license.usedAt,
      });
      return true;
    }

    sendJson(response, 404, { error: "Невідомий admin-endpoint." });
    return true;
  }

  if (route === "POST /api/license/activate") {
    const ip = clientIp(request);
    if (!rateLimit(ip, "activate", 20, 10 * 60 * 1000)) {
      sendJson(response, 429, { error: "Забагато спроб. Спробуйте пізніше." });
      return true;
    }

    const body = await readJsonBody(request);
    const key = normalizeKey(body.key);

    if (!key || !key.startsWith("FOLIO-")) {
      sendJson(response, 400, { error: "Введіть ключ у форматі FOLIO-XXXX-XXXX-XXXX." });
      return true;
    }

    const keyHash = hashKey(key);
    const license = db.licenses.find((item) => safeEqual(item.keyHash, keyHash));

    if (!license) {
      sendJson(response, 404, {
        error: "Ключ не знайдено. Перевірте написання або зверніться до підтримки.",
        code: "KEY_NOT_FOUND",
      });
      return true;
    }
    if (license.revokedAt) {
      sendJson(response, 403, {
        error: "Цей ключ відкликано. Зверніться до підтримки FolioForge.",
        code: "KEY_REVOKED",
      });
      return true;
    }
    if (license.usedAt) {
      sendJson(response, 409, {
        error: "Цей ключ уже використано. Одноразовий ключ не можна активувати повторно.",
        code: "KEY_USED",
      });
      return true;
    }

    license.usedAt = nowIso();
    license.usedIp = ip;
    persistDb();

    const token = signToken({
      lid: license.id,
      email: license.email,
      iat: Math.floor(Date.now() / 1000),
    });

    sendJson(response, 200, {
      ok: true,
      token,
      email: maskEmail(license.email),
      activatedAt: license.usedAt,
      plan: "pro",
    });
    return true;
  }

  if (route === "POST /api/license/verify") {
    const body = await readJsonBody(request);
    const payload = verifyToken(body.token);
    if (!payload || !payload.lid) {
      sendJson(response, 401, { error: "Недійсний ліцензійний токен.", code: "TOKEN_INVALID" });
      return true;
    }

    const license = db.licenses.find((item) => item.id === payload.lid);
    if (!license || license.revokedAt) {
      sendJson(response, 401, { error: "Ліцензію не знайдено або відкликано.", code: "LICENSE_INVALID" });
      return true;
    }

    sendJson(response, 200, {
      ok: true,
      plan: "pro",
      email: maskEmail(license.email),
      activatedAt: license.usedAt,
      orderId: license.orderId,
    });
    return true;
  }

  if (url.pathname.startsWith("/api/")) {
    sendJson(response, 404, { error: "API endpoint не знайдено." });
    return true;
  }

  return false;
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

  try {
    if (url.pathname.startsWith("/api/")) {
      const handled = await handleApi(request, response, url);
      if (!handled) sendJson(response, 404, { error: "Not found" });
      return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { "Content-Type": "text/plain; charset=utf-8", Allow: "GET, HEAD" });
      response.end("Method not allowed");
      return;
    }

    serveStatic(request, response, url);
  } catch (error) {
    const status = error.status || 500;
    console.error("[server]", error);
    if (!response.headersSent) {
      sendJson(response, status, { error: status === 500 ? "Внутрішня помилка сервера." : error.message });
    } else {
      response.end();
    }
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("  FolioForge");
  console.log(`  Builder:  ${APP_URL}`);
  console.log(`  Admin:    ${APP_URL}/admin`);
  console.log(`  Admin token: ${ADMIN_TOKEN}`);
  console.log(`  Email mode: ${RESEND_API_KEY ? "Resend API" : "local outbox (data/outbox)"}`);
  console.log(`  License DB: ${path.relative(ROOT, DB_FILE)}`);
  console.log("");
});
