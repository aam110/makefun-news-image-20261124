// THE WORLD IN ONE PAGE — Tuesday 24 November 2026
// One 1024x1024 PNG summing up 24 Nov 2026 world news. Node 22 stdlib only.
// Real serif via embedded OFL font outlines (glyphs.ts, extracted with fontTools).
// Deterministic: no randomness, no timestamps, no network.
import { writeFileSync, mkdirSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { GLYPHS } from "./glyphs.ts";

const W = 1024;
const H = 1024;
const CREAM = [247, 243, 234];
const PAPER = [255, 253, 247];
const INK = [26, 26, 26];
const RED = [179, 39, 30];
const NAVY = [31, 58, 95];
const MUTED = [90, 83, 72];
const GOLD = [198, 124, 0];
const GREEN = [46, 125, 50];
const PURPLE = [106, 61, 154];
const LINE = [201, 189, 166];

const buf = new Uint8Array(W * H * 3);
function fillAll(c: number[]) {
  for (let i = 0; i < W * H; i++) { buf[i * 3] = c[0]; buf[i * 3 + 1] = c[1]; buf[i * 3 + 2] = c[2]; }
}
function setPx(x: number, y: number, c: number[]) {
  const xi = Math.round(x), yi = Math.round(y);
  if (xi < 0 || yi < 0 || xi >= W || yi >= H) return;
  const i = (yi * W + xi) * 3;
  buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2];
}
function fillRect(x: number, y: number, w: number, h: number, c: number[]) {
  const x0 = Math.max(0, Math.round(x)), y0 = Math.max(0, Math.round(y));
  const x1 = Math.min(W, Math.round(x + w)), y1 = Math.min(H, Math.round(y + h));
  for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) {
    const i = (yy * W + xx) * 3; buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2];
  }
}
function strokeRect(x: number, y: number, w: number, h: number, c: number[], t = 1) {
  fillRect(x, y, w, t, c); fillRect(x, y + h - t, w, t, c);
  fillRect(x, y, t, h, c); fillRect(x + w - t, y, t, h, c);
}
function fillCircle(cx: number, cy: number, r: number, c: number[]) {
  const r2 = r * r;
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
      if (dx * dx + dy * dy <= r2) setPx(x, y, c);
    }
  }
}
function ring(cx: number, cy: number, r: number, t: number, c: number[]) {
  for (let a = 0; a < 360; a += 1) {
    const rad = (a * Math.PI) / 180;
    for (let rr = r - t; rr <= r; rr++) setPx(cx + rr * Math.cos(rad), cy + rr * Math.sin(rad), c);
  }
}
// Even-odd polygon fill (array of [x,y] points, y down).
function fillPoly(pts: number[][], c: number[]) {
  if (pts.length < 3) return;
  let minY = Infinity, maxY = -Infinity;
  for (const p of pts) { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); }
  for (let y = Math.max(0, Math.ceil(minY)); y <= Math.min(H - 1, Math.floor(maxY)); y++) {
    const xs: number[] = [];
    const yc = y + 0.5;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) {
        xs.push(a[0] + ((yc - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
      }
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const x0 = Math.max(0, Math.ceil(xs[k])), x1 = Math.min(W - 1, Math.floor(xs[k + 1]));
      for (let x = x0; x <= x1; x++) setPx(x, y, c);
    }
  }
}
function drawLine(x0: number, y0: number, x1: number, y1: number, w: number, c: number[]) {
  const len = Math.hypot(x1 - x0, y1 - y0);
  const steps = Math.max(1, Math.ceil(len));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    fillCircle(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, w / 2, c);
  }
}
function rrect(x: number, y: number, w: number, h: number, r: number, c: number[]) {
  fillRect(x + r, y, w - 2 * r, h, c);
  fillRect(x, y + r, w, h - 2 * r, c);
  fillCircle(x + r, y + r, r, c); fillCircle(x + w - r, y + r, r, c);
  fillCircle(x + r, y + h - r, r, c); fillCircle(x + w - r, y + h - r, r, c);
}
function rrectStroke(x: number, y: number, w: number, h: number, r: number, c: number[], t = 2) {
  drawLine(x + r, y, x + w - r, y, t, c);
  drawLine(x + r, y + h, x + w - r, y + h, t, c);
  drawLine(x, y + r, x, y + h - r, t, c);
  drawLine(x + w, y + r, x + w, y + h - r, t, c);
  const arc = (cx: number, cy: number, a0: number, a1: number) => {
    for (let a = a0; a <= a1; a += 2) {
      const rad = (a * Math.PI) / 180;
      fillCircle(cx + r * Math.cos(rad), cy + r * Math.sin(rad), t / 2, c);
    }
  };
  arc(x + r, y + r, 180, 270); arc(x + w - r, y + r, 270, 360);
  arc(x + w - r, y + h - r, 0, 90); arc(x + r, y + h - r, 90, 180);
}

// ---------- Real-serif text from embedded font outlines ----------
type FontName = "serif" | "serifBold" | "serifItalic" | "display" | "sansBold";
const glyphCache = new Map<string, { w: number; h: number; ox: number; oy: number; bmp: Uint8Array }>();

function flattenContour(pts: number[][], scale: number): number[][] {
  const n = pts.length;
  if (n === 0) return [];
  const exp: number[][] = [];
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n];
    exp.push(p);
    if (!p[2] && !q[2]) exp.push([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, 1]);
  }
  let si = exp.findIndex((p) => p[2] === 1);
  if (si < 0) return [];
  const ord = exp.slice(si).concat(exp.slice(0, si));
  const poly: number[][] = [[ord[0][0] * scale, -ord[0][1] * scale]];
  let i = 1;
  while (i < ord.length) {
    const p = ord[i];
    if (p[2] === 1) { poly.push([p[0] * scale, -p[1] * scale]); i++; }
    else {
      const end = ord[i + 1] || ord[0];
      const x0 = poly[poly.length - 1][0], y0 = poly[poly.length - 1][1];
      const cx = p[0] * scale, cy = -p[1] * scale;
      const x1 = end[0] * scale, y1 = -end[1] * scale;
      for (let s = 1; s <= 8; s++) {
        const t = s / 8, mt = 1 - t;
        poly.push([mt * mt * x0 + 2 * mt * t * cx + t * t * x1, mt * mt * y0 + 2 * mt * t * cy + t * t * y1]);
      }
      i += 2;
    }
  }
  return poly;
}

function glyphBitmap(font: FontName, size: number, ch: string) {
  const key = font + "|" + size + "|" + ch;
  const hit = glyphCache.get(key);
  if (hit) return hit;
  const set = GLYPHS[font];
  const g = set.glyphs[ch];
  const scale = size / set.upm;
  let empty = { w: 0, h: 0, ox: 0, oy: 0, bmp: new Uint8Array(0) };
  if (!g || g.c.length === 0) { glyphCache.set(key, empty); return empty; }
  const polys = g.c.map((ct) => flattenContour(ct, scale)).filter((p) => p.length >= 3);
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const poly of polys) for (const p of poly) {
    minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]);
    minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]);
  }
  const ox = Math.floor(minX) - 1, oy = Math.floor(minY) - 1;
  const w = Math.ceil(maxX) - ox + 2, h = Math.ceil(maxY) - oy + 2;
  const bmp = new Uint8Array(w * h);
  // rasterise: for each scanline, even-odd intersections across all contours
  for (let y = 0; y < h; y++) {
    const yc = oy + y + 0.5;
    const xs: number[] = [];
    for (const poly of polys) {
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i], b = poly[(i + 1) % poly.length];
        if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) {
          xs.push(a[0] + ((yc - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
        }
      }
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const x0 = Math.max(0, Math.ceil(xs[k] - ox)), x1 = Math.min(w - 1, Math.floor(xs[k + 1] - ox));
      for (let x = x0; x <= x1; x++) bmp[y * w + x] = 1;
    }
  }
  const out = { w, h, ox, oy, bmp };
  glyphCache.set(key, out);
  return out;
}

function kernAdj(font: FontName, a: string, b: string): number {
  const set = GLYPHS[font];
  const v = set.kern[a + "," + b];
  return v === undefined ? 0 : (v * 1) / set.upm;
}
function textWidth(s: string, font: FontName, size: number): number {
  const set = GLYPHS[font];
  const scale = size / set.upm;
  let w = 0;
  for (let i = 0; i < s.length; i++) {
    const g = set.glyphs[s[i]];
    w += (g ? g.a : 500) * scale;
    if (i + 1 < s.length) w += kernAdj(font, s[i], s[i + 1]) * size;
  }
  return w;
}
function drawText(s: string, x: number, baselineY: number, font: FontName, size: number, c: number[], align: "l" | "c" | "r" = "l") {
  let x0 = x;
  const w = textWidth(s, font, size);
  if (align === "c") x0 = x - w / 2;
  if (align === "r") x0 = x - w;
  const set = GLYPHS[font];
  const scale = size / set.upm;
  let cx = x0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const g = set.glyphs[ch];
    const bm = glyphBitmap(font, size, ch);
    if (bm.bmp.length) {
      const bx = Math.round(cx + bm.ox), by = Math.round(baselineY + bm.oy);
      for (let y = 0; y < bm.h; y++) for (let xx = 0; xx < bm.w; xx++) {
        if (bm.bmp[y * bm.w + xx]) setPx(bx + xx, by + y, c);
      }
    }
    cx += (g ? g.a : 500) * scale;
    if (i + 1 < s.length) cx += kernAdj(font, ch, s[i + 1]) * size;
  }
  return cx;
}
function wrapText(s: string, font: FontName, size: number, maxW: number, maxLines: number): string[] {
  const words = s.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const wd of words) {
    const trial = cur ? cur + " " + wd : wd;
    if (textWidth(trial, font, size) <= maxW || !cur) cur = trial;
    else { lines.push(cur); cur = wd; if (lines.length >= maxLines) break; }
  }
  if (lines.length < maxLines && cur) lines.push(cur);
  return lines;
}
function drawWrapped(s: string, x: number, y: number, font: FontName, size: number, c: number[], maxW: number, maxLines: number, leading: number): string[] {
  const lines = wrapText(s, font, size, maxW, maxLines);
  lines.forEach((ln, i) => drawText(ln, x, y + i * leading, font, size, c));
  return lines;
}

// ---------- Data: 20 verified stories, Tue 24 Nov 2026 ----------
type Hero = { n: number; tag: string; color: number[]; head: string; sum: string; src: string };
const HEROES: Hero[] = [
  { n: 1, tag: "1  ·  ASIA — MARKETS", color: NAVY, head: "Tokyo roars back: Nikkei futures point to a near-3% reopen", sum: "After a 5.1% slide on Friday and a long holiday weekend, CME futures last printed 58,110 — up 1,673 points on Friday's cash close.", src: "REPORTED · Peter Lewis Briefing / Nerosignal" },
  { n: 2, tag: "2  ·  EUROPE — CHESS", color: GREEN, head: "The youngest title match in chess history begins", sum: "Gukesh, 20, defends his crown against Sindarov, 20, in Geneva. Game 1 starts 15:00 CET; Sindarov has White. Prize fund US$2.5m.", src: "CONFIRMED · FIDE / ChessBase India" },
  { n: 3, tag: "3  ·  AUSTRALIA — LANGUAGE", color: RED, head: "\u201CPervert glasses\u201D is Australia's Word of the Year", sum: "Macquarie Dictionary picks the slang for camera smart glasses — also the People's Choice winner, three years running.", src: "CONFIRMED · Macquarie Dictionary / The Guardian" },
];
type Med = { n: number; tag: string; color: number[]; head: string; sum: string; src: string };
const MEDIUMS: Med[] = [
  { n: 4, tag: "AUSTRALIA", color: NAVY, head: "Wong defends US alliance, puts AI at policy heart", sum: "Wong: the US alliance stands, and AI is now a security challenge.", src: "CONFIRMED · AIIA / AAP" },
  { n: 5, tag: "AFRICA · SPORT", color: GREEN, head: "CAS to rule on Senegal AFCON title appeal today", sum: "Sport's top court decides this afternoon on Senegal's title appeal.", src: "OFFICIAL · Reuters / CAS" },
  { n: 6, tag: "NEW ZEALAND · SPORT", color: RED, head: "Tickner out of second India Test, hamstring injury", sum: "Tickner, 33, is out of the Christchurch Test with a hamstring injury.", src: "OFFICIAL · Reuters / NZ Cricket" },
  { n: 7, tag: "NEW ZEALAND", color: GOLD, head: "Overnight fire shuts Auckland's Angkor Bakery", sum: "Fire crews forced entry into the smoke-filled bakery; shop closed.", src: "CONFIRMED · NZ Herald / RNZ" },
  { n: 8, tag: "NEW ZEALAND", color: [60, 60, 70], head: "TVNZ union issues 24-hour strike notice", sum: "Union members give notice of a nationwide 24-hour strike from midnight.", src: "CONFIRMED · NZ Herald" },
  { n: 9, tag: "NEW ZEALAND", color: PURPLE, head: "Seymour wants answers on RNZ by Christmas", sum: "Seymour demands a tougher, faster inquiry into RNZ's failures.", src: "CONFIRMED · RNZ" },
  { n: 10, tag: "PACIFIC", color: NAVY, head: "Treaties panel backs Vanuatu-Australia deal", sum: "The treaties committee recommends ratifying the Nakamal Agreement.", src: "OFFICIAL · Parliament of Australia" },
  { n: 11, tag: "AUSTRALIA", color: GOLD, head: "Chalmers: Labor to \u201Csave more than we spend\u201D", sum: "Budget update lands as rental affordability hits a 14-year low.", src: "CONFIRMED · Guardian Australia" },
  { n: 12, tag: "EUROPE · SPORT", color: RED, head: "Sinner to have knee surgery today; Open in doubt", sum: "Sinner is due for knee surgery in Finland today; return in 3–4 months.", src: "REPORTED · Reuters / AAP" },
  { n: 13, tag: "NEW ZEALAND", color: [90, 90, 90], head: "Minister denies workforce data held till election", sum: "Brown's office denies ordering workforce data held back until the election.", src: "REPORTED · NZ Doctor" },
];
const ONELINERS: { head: string; src: string }[] = [
  { head: "Police seek sightings of missing W\u0101naka hiker Shaun Gilbert", src: "RNZ" },
  { head: "Retired k\u0101k\u0101riki karaka pair stun keepers with two surprise sets of eggs", src: "RNZ" },
  { head: "Napier caf\u00E9 bystanders step in as knife allegedly held to worker's neck", src: "NZ Herald" },
  { head: "Auckland Grammar head: digital exams can't be trusted after NCEA glitches", src: "NZ Herald" },
  { head: "Stolen-digger driver allegedly tried to ram police vehicle in Eastern Bay", src: "NZ Herald" },
  { head: "Summer heat hits NZ: Christchurch in for another sizzling day at 27\u00B0C", src: "NZ Herald" },
  { head: "Locals oppose housing on flood-prone Christchurch land — 800 homes planned", src: "NZ Herald" },
];
const STATS: { big: string; l1: string; l2: string; color: number[] }[] = [
  { big: "+2.97%", l1: "NIKKEI FUTURES", l2: "CME 58,110", color: NAVY },
  { big: "+2.8%", l1: "NIKKEI OPEN", l2: "PROJ. 58,030", color: NAVY },
  { big: "+0.6%", l1: "HANG SENG OPEN", l2: "PROJ. 22,523", color: GOLD },
  { big: "$2.5m", l1: "CHESS PRIZE FUND", l2: "14 GAMES, GENEVA", color: GREEN },
  { big: "27\u00B0C", l1: "CHRISTCHURCH HIGH", l2: "+8\u00B0C ABOVE AVG", color: RED },
  { big: "14-YR LOW", l1: "AU RENTAL", l2: "AFFORDABILITY", color: PURPLE },
];
const REGIONS: { name: string; n: number; color: number[] }[] = [
  { name: "NEW ZEALAND 12", n: 12, color: RED },
  { name: "AUSTRALIA 4", n: 4, color: NAVY },
  { name: "EUROPE 2", n: 2, color: GREEN },
  { name: "ASIA 1", n: 1, color: GOLD },
  { name: "AFRICA 1", n: 1, color: PURPLE },
];

// ---------- Page ----------
fillAll(CREAM);
const MX = 24, CW = 976;

// Masthead
fillRect(MX, 10, CW, 3, RED);
drawText("THE WORLD IN ONE PAGE", 512, 58, "display", 46, INK, "c");
fillRect(MX, 66, CW, 1, LINE);
drawText("Tuesday 24 November 2026  —  20 stories  —  5 regions", 512, 88, "serifBold", 17, NAVY, "c");
drawText("Tokyo roars back, the youngest chess final in history opens, and \u201Cpervert glasses\u201D enters the dictionary — a Pacific-led Tuesday.", 512, 108, "serifItalic", 13.5, MUTED, "c");

// Region bar
{
  let bx = MX;
  for (const r of REGIONS) {
    const w = (CW * r.n) / 20;
    fillRect(bx, 118, w, 16, r.color);
    drawText(r.name, bx + w / 2, 130, "sansBold", 9, [255, 255, 255], "c");
    bx += w;
  }
}

// Stats strip
{
  const sw = 159, gap = 4.4;
  STATS.forEach((s, i) => {
    const x = MX + i * (sw + gap);
    fillRect(x, 142, sw, 46, PAPER);
    fillRect(x, 142, sw, 3, s.color);
    strokeRect(x, 142, sw, 46, LINE, 1);
    drawText(s.big, x + sw / 2, 163, "serifBold", 17, s.color, "c");
    drawText(s.l1, x + sw / 2, 175, "sansBold", 8, INK, "c");
    drawText(s.l2, x + sw / 2, 184, "sansBold", 8, MUTED, "c");
  });
}

// ---------- Heroes ----------
function heroChart(x: number, y: number, w: number, h: number) {
  fillRect(x, y, w, h, [238, 242, 247]);
  // grid + axes
  for (let g = 1; g <= 3; g++) fillRect(x + 34, y + 18 + g * 22, w - 44, 1, [210, 220, 230]);
  fillRect(x + 34, y + 12, 1, h - 24, NAVY);
  fillRect(x + 34, y + h - 12, w - 44, 1, NAVY);
  const vals = [56.4, 56.9, 57.3, 57.6, 58.1];
  const bw = 34, gap = 16;
  vals.forEach((v, i) => {
    const bh = (v - 55.8) * 34;
    const bx = x + 48 + i * (bw + gap);
    fillRect(bx, y + h - 12 - bh, bw, bh, i === 4 ? RED : NAVY);
  });
  // rising line with arrowhead
  const pts: number[][] = vals.map((v, i) => [x + 48 + i * (bw + gap) + bw / 2, y + h - 12 - (v - 55.8) * 34 - 8]);
  for (let i = 0; i + 1 < pts.length; i++) drawLine(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 3, RED);
  const last = pts[pts.length - 1];
  fillPoly([[last[0], last[1] - 12], [last[0] - 5, last[1] - 2], [last[0] + 5, last[1] - 2]], RED);
  drawText("+2.97%", x + 12, y + 26, "serifBold", 24, RED);
  drawText("NIKKEI FUTURES 58,110", x + 12, y + 42, "sansBold", 9, NAVY);
  drawText("FRI CLOSE 56,437", x + w - 12, y + 14, "sansBold", 8, MUTED, "r");
}
function heroChess(x: number, y: number, w: number, h: number) {
  fillRect(x, y, w, h, [233, 223, 201]);
  const bs = 13, bx0 = x + 14, by0 = y + 7;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    fillRect(bx0 + c * bs, by0 + r * bs, bs, bs, (r + c) % 2 === 0 ? [240, 217, 181] : [181, 136, 99]);
  }
  strokeRect(bx0, by0, 8 * bs, 8 * bs, [90, 60, 30], 2);
  const back = ["R", "N", "B", "Q", "K", "B", "N", "R"];
  const put = (col: number, row: number, ch: string, white: boolean) => {
    const cx = bx0 + col * bs + bs / 2, cy = by0 + row * bs + bs / 2;
    fillCircle(cx, cy, 5.5, white ? [250, 248, 240] : NAVY);
    drawText(ch, cx, cy + 3.5, "serifBold", 8, white ? NAVY : [250, 248, 240], "c");
  };
  back.forEach((p, c) => { put(c, 0, p, false); put(c, 7, p, true); });
  for (let c = 0; c < 8; c++) { put(c, 1, "P", false); put(c, 6, "P", true); }
  // kings highlighted mid-board
  put(4, 3, "K", true); put(3, 4, "K", false);
  const tx = bx0 + 8 * bs + 12;
  drawText("GAME 1", tx, y + 24, "sansBold", 11, RED);
  drawText("15:00 CET", tx, y + 40, "serifBold", 15, INK);
  drawText("Fondation Martin Bodmer,", tx, y + 56, "serif", 10, INK);
  drawText("Cologny, Geneva", tx, y + 68, "serif", 10, INK);
  drawText("Gukesh (20) v", tx, y + 86, "serifBold", 11, INK);
  drawText("Sindarov (20)", tx, y + 99, "serifBold", 11, INK);
  drawText("Youngest final ever.", tx, y + 114, "serifItalic", 10, MUTED);
}
function heroGlasses(x: number, y: number, w: number, h: number) {
  fillRect(x, y, w, h, [232, 238, 244]);
  const ly = y + 18, lh = 76, lw = 122;
  // temples
  fillRect(x + 4, ly + 30, 16, 6, NAVY);
  fillRect(x + w - 20, ly + 30, 16, 6, NAVY);
  // lenses
  rrect(x + 20, ly, lw, lh, 30, [127, 179, 213]);
  rrect(x + 178, ly, lw, lh, 30, [127, 179, 213]);
  rrectStroke(x + 20, ly, lw, lh, 30, NAVY, 4);
  rrectStroke(x + 178, ly, lw, lh, 30, NAVY, 4);
  // bridge
  fillRect(x + 142, ly + 26, 36, 8, NAVY);
  // reflections
  drawLine(x + 44, ly + 66, x + 84, ly + 10, 5, [255, 255, 255]);
  drawLine(x + 62, ly + 66, x + 96, ly + 16, 3, [255, 255, 255]);
  drawLine(x + 202, ly + 66, x + 242, ly + 10, 5, [255, 255, 255]);
  drawLine(x + 220, ly + 66, x + 254, ly + 16, 3, [255, 255, 255]);
  // camera dot + mic
  fillCircle(x + 178 + 104, ly + 14, 6, RED);
  fillCircle(x + 178 + 104, ly + 14, 2.5, [255, 255, 255]);
  drawText("WORD OF THE YEAR 2026", x + w / 2, y + h - 8, "sansBold", 10, RED, "c");
}
const heroDraw = [heroChart, heroChess, heroGlasses];
{
  const hw = 320, gap = 8, hy = 196, hh = 218;
  HEROES.forEach((hero, i) => {
    const x = MX + i * (hw + gap);
    fillRect(x, hy, hw, hh, PAPER);
    strokeRect(x, hy, hw, hh, LINE, 1);
    fillRect(x, hy, hw, 20, hero.color);
    drawText(hero.tag, x + 8, hy + 13.5, "sansBold", 9.5, [255, 255, 255]);
    drawText("No. " + hero.n, x + hw - 8, hy + 13.5, "sansBold", 9.5, [255, 255, 255], "r");
    heroDraw[i](x, hy + 20, hw, 118);
    drawWrapped(hero.head, x + 10, hy + 154, "serifBold", 16.5, INK, hw - 20, 2, 18);
    drawWrapped(hero.sum, x + 10, hy + 186, "serif", 10.5, MUTED, hw - 20, 2, 13);
    drawText(hero.src, x + 10, hy + hh - 6, "sansBold", 8, MUTED);
  });
}

// ---------- Mediums ----------
function medArt(kind: number, x: number, y: number, w: number, h: number) {
  const arts: (() => void)[] = [
    () => { // M1 podium + mic
      fillRect(x, y, w, h, NAVY);
      fillRect(x + 78, y + 26, 34, 24, [255, 255, 255]);
      fillRect(x + 66, y + 34, 58, 16, [200, 210, 225]);
      fillRect(x + 88, y + 16, 14, 10, [255, 255, 255]);
      fillCircle(x + 150, y + 18, 5, [255, 255, 255]);
      drawLine(x + 150, y + 23, x + 150, y + 40, 2, [255, 255, 255]);
      drawText("AI", x + 20, y + 30, "sansBold", 13, GOLD);
    },
    () => { // M2 trophy
      fillRect(x, y, w, h, GREEN);
      fillPoly([[x + 80, y + 8], [x + 110, y + 8], [x + 106, y + 28], [x + 84, y + 28]], GOLD);
      fillRect(x + 92, y + 28, 6, 10, GOLD);
      fillRect(x + 82, y + 38, 26, 5, GOLD);
      drawText("CAS", x + 130, y + 30, "sansBold", 12, [255, 255, 255]);
      drawLine(x + 40, y + 44, x + 60, y + 44, 2, [255, 255, 255]);
    },
    () => { // M3 cricket ball + bat
      fillRect(x, y, w, h, [0, 105, 105]);
      fillCircle(x + 60, y + 25, 14, RED);
      drawLine(x + 50, y + 16, x + 70, y + 34, 1, [255, 255, 255]);
      fillPoly([[x + 130, y + 6], [x + 142, y + 6], [x + 138, y + 34], [x + 126, y + 34]], [222, 184, 135]);
      fillRect(x + 132, y + 34, 5, 12, [222, 184, 135]);
      drawText("TEST 2", x + w - 10, y + 30, "sansBold", 10, [255, 255, 255], "r");
    },
    () => { // M4 bakery fire
      fillRect(x, y, w, h, [200, 90, 20]);
      fillRect(x + 30, y + 22, 70, 28, [255, 240, 210]);
      fillPoly([[x + 26, y + 22], [x + 65, y + 8], [x + 104, y + 22]], [120, 60, 30]);
      fillPoly([[x + 120, y + 34], [x + 130, y + 14], [x + 140, y + 34]], [255, 200, 0]);
      fillPoly([[x + 138, y + 34], [x + 146, y + 20], [x + 154, y + 34]], [255, 120, 0]);
      fillCircle(x + 160, y + 14, 6, [220, 220, 220]);
      drawText("BAKERY", x + 38, y + 40, "sansBold", 9, [120, 60, 30]);
    },
    () => { // M5 TV strike
      fillRect(x, y, w, h, [50, 50, 62]);
      fillRect(x + 52, y + 10, 86, 30, [20, 20, 28]);
      strokeRect(x + 52, y + 10, 86, 30, [255, 255, 255], 2);
      drawText("TVNZ", x + 95, y + 30, "sansBold", 11, [255, 255, 255], "c");
      drawLine(x + 56, y + 10, x + 134, y + 40, 3, RED);
      drawText("24h", x + w - 10, y + 30, "sansBold", 11, RED, "r");
    },
    () => { // M6 mic / radio
      fillRect(x, y, w, h, PURPLE);
      fillCircle(x + 60, y + 20, 11, [255, 255, 255]);
      drawLine(x + 60, y + 31, x + 60, y + 44, 2, [255, 255, 255]);
      fillRect(x + 48, y + 44, 24, 3, [255, 255, 255]);
      drawText("RNZ", x + 120, y + 30, "sansBold", 13, [255, 255, 255]);
      drawText("by Christmas", x + 120, y + 44, "serifItalic", 10, [230, 220, 245]);
    },
    () => { // M7 two flags + document
      fillRect(x, y, w, h, [30, 90, 140]);
      fillRect(x + 16, y + 10, 44, 30, [0, 40, 120]);
      fillCircle(x + 38, y + 25, 3, [255, 255, 255]);
      fillRect(x + 66, y + 10, 44, 30, [0, 120, 60]);
      fillRect(x + 66, y + 20, 44, 5, [200, 0, 0]);
      fillRect(x + 66, y + 30, 44, 5, [0, 0, 0]);
      drawText("NAKAMAL", x + 118, y + 30, "sansBold", 9, [255, 255, 255]);
    },
    () => { // M8 house + coins
      fillRect(x, y, w, h, [150, 100, 10]);
      fillPoly([[x + 40, y + 28], [x + 70, y + 8], [x + 100, y + 28]], [120, 40, 20]);
      fillRect(x + 46, y + 28, 48, 20, [255, 245, 220]);
      fillCircle(x + 130, y + 38, 9, GOLD); fillCircle(x + 148, y + 38, 9, GOLD);
      fillCircle(x + 139, y + 28, 9, [255, 210, 80]);
      drawText("$", x + 139, y + 31, "sansBold", 9, [120, 80, 0], "c");
    },
    () => { // M9 tennis ball + cross
      fillRect(x, y, w, h, [140, 30, 40]);
      fillCircle(x + 60, y + 25, 15, [180, 220, 60]);
      drawLine(x + 48, y + 14, x + 72, y + 36, 2, [255, 255, 255]);
      fillCircle(x + 140, y + 25, 13, [255, 255, 255]);
      fillRect(x + 136, y + 18, 8, 14, RED); fillRect(x + 133, y + 21, 14, 8, RED);
      drawText("KNEE", x + w - 10, y + 30, "sansBold", 10, [255, 255, 255], "r");
    },
    () => { // M10 document + stamp
      fillRect(x, y, w, h, [110, 110, 110]);
      fillRect(x + 60, y + 8, 60, 34, [255, 255, 255]);
      fillRect(x + 68, y + 15, 44, 2, [80, 80, 80]);
      fillRect(x + 68, y + 22, 44, 2, [80, 80, 80]);
      fillRect(x + 68, y + 29, 30, 2, [80, 80, 80]);
      ring(x + 145, y + 25, 12, 2, RED);
      drawText("NO", x + 145, y + 28, "sansBold", 8, RED, "c");
    },
  ];
  arts[kind]();
}
{
  const mw = 189, gap = 8, mh = 136;
  MEDIUMS.forEach((m, i) => {
    const col = i % 5, row = Math.floor(i / 5);
    const x = MX + col * (mw + gap);
    const y = 422 + row * (mh + 8);
    fillRect(x, y, mw, mh, PAPER);
    strokeRect(x, y, mw, mh, LINE, 1);
    medArt(i, x, y, mw, 46);
    drawText(m.n + " · " + m.tag, x + 8, y + 58, "sansBold", 8, m.color);
    drawWrapped(m.head, x + 8, y + 72, "serifBold", 12.5, INK, mw - 16, 2, 13);
    drawWrapped(m.sum, x + 8, y + 97, "serif", 9.5, MUTED, mw - 16, 2, 13);
    drawText(m.src, x + 8, y + 124, "sansBold", 7.5, MUTED);
  });
}

// ---------- One-liners ----------
drawText("MORE FROM TUESDAY — IN BRIEF", MX, 712, "sansBold", 11, RED);
fillRect(MX + 218, 706, CW - 218, 1, RED);
{
  const colW = 478, rowH = 30;
  ONELINERS.forEach((o, i) => {
    const col = i < 4 ? 0 : 1;
    const row = i < 4 ? i : i - 4;
    const x = MX + col * (colW + 20);
    const y = 722 + row * rowH;
    fillCircle(x + 8, y + 8, 8, NAVY);
    drawText(String(i + 14), x + 8, y + 11.5, "sansBold", 9, [255, 255, 255], "c");
    const lines = drawWrapped(o.head, x + 22, y + 11, "serifBold", 11, INK, colW - 22, 2, 13);
    const srcY = y + 11 + (lines.length - 1) * 13 + 11;
    drawText(o.src.toUpperCase(), x + 22, Math.min(srcY, y + 28), "sansBold", 7.5, MUTED);
  });
}

// ---------- Bottom: map + DATE CHECK ----------
function lonLatToXY(lon: number, lat: number, x0: number, y0: number, w: number, h: number): number[] {
  return [x0 + ((lon + 180) / 360) * w, y0 + ((83 - lat) / 138) * h];
}
function drawContinent(pts: number[][], x0: number, y0: number, w: number, h: number) {
  fillPoly(pts.map((p) => lonLatToXY(p[0], p[1], x0, y0, w, h)), [217, 203, 166]);
}
{
  const px = MX, py = 852, pw = 468, ph = 134;
  fillRect(px, py, pw, ph, PAPER);
  strokeRect(px, py, pw, ph, LINE, 1);
  drawText("WHERE IT HAPPENED — PINS 1–13 = ILLUSTRATED STORIES", px + 10, py + 13, "sansBold", 9.5, NAVY);
  const mx0 = px + 12, my0 = py + 20, mw2 = pw - 24, mh2 = 88;
  fillRect(mx0, my0, mw2, mh2, [223, 233, 238]);
  drawContinent([[-168, 66], [-140, 70], [-120, 72], [-95, 80], [-80, 73], [-60, 60], [-55, 47], [-70, 42], [-75, 35], [-80, 26], [-90, 21], [-97, 16], [-105, 20], [-115, 28], [-125, 40], [-125, 49], [-145, 60], [-165, 60]], mx0, my0, mw2, mh2);
  drawContinent([[-80, 10], [-60, 5], [-50, 0], [-35, -8], [-40, -20], [-48, -28], [-58, -35], [-70, -40], [-73, -50], [-70, -55], [-65, -45], [-75, -30], [-80, -15], [-80, 5]], mx0, my0, mw2, mh2);
  drawContinent([[-18, 15], [-10, 30], [0, 36], [10, 37], [20, 32], [32, 31], [35, 28], [43, 12], [51, 11], [48, 0], [40, -10], [35, -20], [32, -29], [20, -35], [15, -30], [12, -18], [9, 4], [-8, 5], [-17, 15]], mx0, my0, mw2, mh2);
  drawContinent([[-10, 36], [-9, 43], [-2, 48], [0, 50], [5, 53], [8, 57], [10, 59], [18, 56], [21, 55], [24, 58], [28, 60], [30, 70], [25, 71], [18, 69], [12, 65], [5, 60], [5, 58], [-2, 55], [-5, 50], [-10, 44]], mx0, my0, mw2, mh2);
  drawContinent([[30, 70], [40, 68], [60, 70], [75, 73], [90, 75], [110, 76], [130, 72], [160, 70], [180, 66], [162, 60], [158, 52], [142, 50], [140, 40], [135, 35], [127, 35], [122, 30], [120, 22], [108, 18], [105, 10], [100, 8], [95, 15], [90, 22], [80, 20], [75, 10], [70, 20], [60, 25], [55, 26], [50, 30], [45, 30], [40, 36], [35, 40], [30, 45], [30, 60]], mx0, my0, mw2, mh2);
  drawContinent([[113, -22], [114, -30], [115, -35], [124, -33], [130, -32], [137, -35], [140, -38], [147, -39], [150, -37], [153, -27], [146, -19], [142, -11], [136, -12], [132, -12], [126, -14], [122, -17], [114, -22]], mx0, my0, mw2, mh2);
  drawContinent([[167, -45], [168, -44], [170, -43], [173, -41], [175, -38], [177, -38], [178, -37], [175, -40], [172, -43], [168, -46]], mx0, my0, mw2, mh2);
  const pins: [number, number, number, number, number][] = [
    [1, 139.7, 35.7, 0, 0], [2, 6.1, 46.2, 0, 0], [3, 151.2, -33.9, 0, 0],
    [4, 149.1, -35.3, 4, 4], [5, -17.4, 14.7, 0, 0], [6, 172.6, -43.5, -4, 3],
    [7, 174.8, -36.9, -7, -4], [8, 174.8, -41.3, 7, 0], [9, 174.8, -41.3, -8, 5],
    [10, 168.3, -17.7, 0, 0], [11, 149.1, -35.3, -6, -5], [12, 24.9, 60.2, 0, 0],
    [13, 174.8, -41.3, 0, -7],
  ];
  for (const [n, lon, lat, dx, dy] of pins) {
    const [pxx, pyy] = lonLatToXY(lon, lat, mx0, my0, mw2, mh2);
    fillCircle(pxx + dx, pyy + dy, 7, RED);
    ring(pxx + dx, pyy + dy, 7, 1, [255, 255, 255]);
    drawText(String(n), pxx + dx, pyy + dy + 3, "sansBold", 8, [255, 255, 255], "c");
  }
  drawText("NZ pins spread slightly for legibility.", px + 10, py + ph - 6, "serifItalic", 8.5, MUTED);
  drawText("1 Tokyo  2 Geneva  3 Sydney", px + pw - 10, py + ph - 6, "sansBold", 8, MUTED, "r");
}
{
  const dx = 500, dy = 852, dw = 500, dh = 134;
  fillRect(dx, dy, dw, dh, PAPER);
  strokeRect(dx, dy, dw, dh, RED, 2);
  drawText("DATE CHECK — WHAT WE LEFT OUT (ON PURPOSE)", dx + 10, dy + 14, "sansBold", 10, RED);
  const left = ["Nvidia +31% — Mon 23 Nov", "Banten fire, 24 dead — 21 Nov", "700k Russian troops dead — 23 Nov", "Sputnik-S satellite claim — 23 Nov"];
  const right = ["Molly Meldrum dies — 23 Nov", "COP31 ends, no deal — 23 Nov", "Gaza toxic report — 23 Nov", "Trump hush-money ruling — 23 Nov"];
  left.forEach((t, i) => drawText("\u2022  " + t, dx + 10, dy + 32 + i * 13, "serif", 10, INK));
  right.forEach((t, i) => drawText("\u2022  " + t, dx + 258, dy + 32 + i * 13, "serif", 10, INK));
  fillRect(dx + 10, dy + 88, dw - 20, 1, RED);
  drawWrapped("NOT YET KNOWN TODAY: the CAS ruling on Senegal's AFCON title is due this afternoon, and Sinner's knee surgery is due today. Neither result is in yet — nothing here is shown as decided.", dx + 10, dy + 102, "serifItalic", 10, INK, dw - 20, 3, 12);
}

// ---------- Footer ----------
fillRect(MX, 994, CW, 1, LINE);
drawText("Sources: Reuters · NZ Herald · RNZ · The Guardian · FIDE · Macquarie Dictionary · Parliament of Australia · Peter Lewis Briefing · AAP · NZ Doctor", 512, 1006, "sansBold", 8.5, MUTED, "c");
drawText("Futures vs projected open differ by source — CME last print 58,110; Peter Lewis projection 58,030. Both shown as reported. All 20 stories first reported or occurring Tue 24 Nov 2026.", 512, 1017, "serifItalic", 9, MUTED, "c");

// ---------- PNG encoder (own, stdlib zlib) ----------
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c >>> 0;
}
function crc32(b: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  const crcIn = new Uint8Array(4 + data.length);
  crcIn.set(out.subarray(4, 8), 0);
  crcIn.set(data, 4);
  dv.setUint32(8 + data.length, crc32(crcIn));
  return out;
}
function encodePNG(): Uint8Array {
  const raw = new Uint8Array(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0;
    raw.set(buf.subarray(y * W * 3, (y + 1) * W * 3), y * (1 + W * 3) + 1);
  }
  const idat = deflateSync(raw, { level: 9 });
  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, W); dv.setUint32(4, H);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const parts = [sig, chunk("IHDR", ihdr), chunk("IDAT", new Uint8Array(idat)), chunk("IEND", new Uint8Array(0))];
  const total = parts.reduce((a, p) => a + p.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "out";
mkdirSync(outDir, { recursive: true });
writeFileSync(outDir + "/entry.png", encodePNG());
