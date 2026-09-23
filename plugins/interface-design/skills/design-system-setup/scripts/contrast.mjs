#!/usr/bin/env node
/**
 * WCAG 2 contrast ratios, with no dependencies.
 *
 *   node contrast.mjs <fg> <bg>                    one pair
 *   node contrast.mjs --ladder <bg> <fg> <fg> …    a text ladder, top tier first
 *   node contrast.mjs --min 3 <fg> <bg>            a different floor (icons, borders, focus)
 *
 * Colours: #rgb, #rgba, #rrggbb, #rrggbbaa, rgb()/rgba(), hsl()/hsla(),
 * oklch(). A translucent foreground is composited over the background first —
 * which is the number that matters, since that's the colour the reader sees.
 *
 * --ladder checks the two things a text ladder has to do at once: every tier
 * clears the floor (4.5:1 unless --min says otherwise), and the tiers stay
 * strictly descending. Passing the first while failing the second is the common
 * failure — every tier readable, and no hierarchy left between them.
 */

function die(message) {
  console.error(`contrast: ${message}`);
  process.exit(1);
}

function parse(input) {
  const s = input.trim().toLowerCase();

  let m = s.match(/^#([0-9a-f]{3,8})$/);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
    if (h.length !== 6 && h.length !== 8) die(`can't read ${input}`);
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
  }

  m = s.match(/^(rgba?|hsla?|oklch)\((.*)\)$/);
  if (!m) die(`can't read ${input} — use hex, rgb(), hsl() or oklch()`);
  const parts = m[2].split(/[\s,/]+/).filter(Boolean);
  const alpha = (v) => (v === undefined ? 1 : v.endsWith("%") ? parseFloat(v) / 100 : parseFloat(v));

  if (m[1].startsWith("rgb")) {
    const ch = (v) => (v.endsWith("%") ? (parseFloat(v) / 100) * 255 : parseFloat(v));
    return { r: ch(parts[0]), g: ch(parts[1]), b: ch(parts[2]), a: alpha(parts[3]) };
  }

  if (m[1].startsWith("hsl")) {
    const h = ((parseFloat(parts[0]) % 360) + 360) % 360;
    const sat = parseFloat(parts[1]) / 100;
    const l = parseFloat(parts[2]) / 100;
    const k = (n) => (n + h / 30) % 12;
    const a = sat * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return { r: f(0) * 255, g: f(8) * 255, b: f(4) * 255, a: alpha(parts[3]) };
  }

  // oklch(L C H) → OKLab → linear sRGB → sRGB, clamped into gamut.
  const L = parts[0].endsWith("%") ? parseFloat(parts[0]) / 100 : parseFloat(parts[0]);
  const C = parseFloat(parts[1]);
  const H = (parseFloat(parts[2]) * Math.PI) / 180;
  const A = C * Math.cos(H);
  const B = C * Math.sin(H);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const mm = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const sq = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * sq,
    -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * sq,
    -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * sq,
  ];
  const enc = (v) => {
    const c = Math.min(1, Math.max(0, v));
    return (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055) * 255;
  };
  return { r: enc(lin[0]), g: enc(lin[1]), b: enc(lin[2]), a: alpha(parts[3]) };
}

/** A translucent colour as the reader sees it, over an opaque background. */
function over(fg, bg) {
  return {
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  };
}

function luminance({ r, g, b }) {
  const lin = (v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function ratio(fgInput, bgInput) {
  const bg = parse(bgInput);
  if (bg.a < 1) die(`the background ${bgInput} is translucent — give the opaque colour it sits on`);
  const fg = over(parse(fgInput), bg);
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

const fmt = (n) => `${n.toFixed(2)}:1`;

const argv = process.argv.slice(2);
let floor = 4.5;
let ladder = false;
const rest = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--min") floor = parseFloat(argv[++i]);
  else if (argv[i] === "--ladder") ladder = true;
  else if (argv[i] === "-h" || argv[i] === "--help") {
    console.log("contrast.mjs <fg> <bg> | --ladder <bg> <fg>… | --min <n> …");
    process.exit(0);
  } else rest.push(argv[i]);
}
if (Number.isNaN(floor)) die("--min needs a number");

if (ladder) {
  const [bg, ...tiers] = rest;
  if (!bg || tiers.length === 0) die("--ladder needs a background, then the tiers top first");
  let previous = Infinity;
  let ok = true;
  for (const tier of tiers) {
    const r = ratio(tier, bg);
    const problems = [];
    if (r < floor) problems.push(`below ${floor}:1`);
    if (r >= previous) problems.push("not below the tier above");
    if (problems.length) ok = false;
    console.log(`${problems.length ? "✗" : "✓"} ${tier.padEnd(24)} ${fmt(r).padStart(9)}${problems.length ? `  ${problems.join(", ")}` : ""}`);
    previous = r;
  }
  process.exit(ok ? 0 : 2);
}

if (rest.length !== 2) die("give a foreground and a background (or --ladder)");
const r = ratio(rest[0], rest[1]);
console.log(`${r >= floor ? "✓" : "✗"} ${fmt(r)} (floor ${floor}:1)`);
process.exit(r >= floor ? 0 : 2);
