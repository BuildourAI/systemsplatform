#!/usr/bin/env node
/**
 * Derives the brand palette from a single hex, and checks it.
 *
 * Why this exists: most brand oranges are too light to carry white text. A
 * typical one sits near 3:1 against white, where readable text needs 4.5:1.
 * Rather than eyeball a darker shade, this finds the closest one to the brand
 * colour that actually passes, and prints the CSS to paste in.
 *
 *   node scripts/brand.mjs "#F26322"
 */

const TARGET = 4.5; // WCAG AA for normal-size text

const hexToRgb = (hex) => {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
};

const rgbToHex = (rgb) =>
  "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");

const channel = (v) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const luminance = (rgb) =>
  0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** Mix toward another colour by `amount` (0 keeps a, 1 becomes b). */
const mix = (a, b, amount) => a.map((v, i) => v + (b[i] - v) * amount);

const WHITE = [255, 255, 255];
const BLACK = [0, 0, 0];

/**
 * Walks the brand colour toward black until white text on it clears the bar.
 * Steps of 1% keep it as close to the brand hue as the requirement allows.
 */
function darkenUntilReadable(brand, text = WHITE, target = TARGET) {
  for (let step = 0; step <= 100; step += 1) {
    const candidate = mix(brand, BLACK, step / 100);
    if (contrast(candidate, text) >= target) {
      return { rgb: candidate, mixed: step };
    }
  }
  return { rgb: BLACK, mixed: 100 };
}

function lightenUntilReadable(brand, text, target = TARGET) {
  for (let step = 0; step <= 100; step += 1) {
    const candidate = mix(brand, WHITE, step / 100);
    if (contrast(candidate, text) >= target) {
      return { rgb: candidate, mixed: step };
    }
  }
  return { rgb: WHITE, mixed: 100 };
}

const input = process.argv[2];
if (!input) {
  console.error('Usage: node scripts/brand.mjs "#F26322"');
  process.exit(1);
}

const brand = hexToRgb(input);

// Light theme. Buttons take white text, so the fill has to be dark enough.
const LIGHT_GROUND = hexToRgb("#faf8f2");
const action = darkenUntilReadable(brand, WHITE);
const wash = mix(brand, LIGHT_GROUND, 0.88);

// Dark theme. A brighter orange on a near-black ground, carrying dark text,
// which is the readable direction once the ground is dark.
const DARK_GROUND = hexToRgb("#16150f");
const DARK_INK = hexToRgb("#16150f");
const brandDark = mix(brand, WHITE, 0.12);

/**
 * The highlight band behind the headline word. Body text sits ON it, so it has
 * to suit whichever ink the theme uses. In light mode the brand orange already
 * carries dark text; in dark mode the ink is near-white, so the band has to be
 * darkened until that reads.
 */
const DARK_BODY_INK = hexToRgb("#f6f3e9");
const highlightLight = brand;
const highlightDark = darkenUntilReadable(brand, DARK_BODY_INK);
const actionDark = lightenUntilReadable(brand, DARK_INK);
const washDark = mix(brand, DARK_GROUND, 0.82);

// Dark ink sits directly on --brand in several places: the logo monogram, the
// cart count, the numbered step badges, the "New" pill. Those pairs are text
// too, so they get checked like any other.
const LIGHT_INK = hexToRgb("#1b1a16");

const rows = [
  ["light", "--brand", rgbToHex(brand), "logo mark, highlight band, badges", contrast(brand, LIGHT_GROUND), "vs ground"],
  ["light", "--brand on ink", rgbToHex(brand), "monogram, cart count, step badges", contrast(brand, LIGHT_INK), "vs brand ink"],
  ["light", "--brand-action", rgbToHex(action.rgb), "button fills, links", contrast(action.rgb, WHITE), "vs white text"],
  ["light", "--brand-wash", rgbToHex(wash), "selected cards, soft fills", contrast(hexToRgb("#1b1a16"), wash), "vs body ink"],
  ["light", "--brand-highlight", rgbToHex(highlightLight), "headline highlight band", contrast(highlightLight, LIGHT_INK), "vs body ink"],
  ["dark", "--brand", rgbToHex(brandDark), "logo mark, highlight band", contrast(brandDark, DARK_GROUND), "vs ground"],
  ["dark", "--brand on ink", rgbToHex(brandDark), "monogram, cart count, step badges", contrast(brandDark, LIGHT_INK), "vs brand ink"],
  ["dark", "--brand-action", rgbToHex(actionDark.rgb), "button fills", contrast(actionDark.rgb, DARK_INK), "vs dark text"],
  ["dark", "--brand-wash", rgbToHex(washDark), "selected cards", contrast(hexToRgb("#f6f3e9"), washDark), "vs body ink"],
  ["dark", "--brand-highlight", rgbToHex(highlightDark.rgb), "headline highlight band", contrast(highlightDark.rgb, DARK_BODY_INK), "vs body ink"],
];

console.log(`\nBrand palette derived from ${rgbToHex(brand)}\n`);
console.log("theme  token           value     ratio   against          use");
console.log("-".repeat(88));
let failed = false;
for (const [theme, token, value, use, ratio, against] of rows) {
  const isText = against.includes("text") || against.includes("ink");
  const pass = !isText || ratio >= TARGET;
  if (!pass) failed = true;
  console.log(
    `${theme.padEnd(6)} ${token.padEnd(15)} ${value}   ${ratio.toFixed(2).padStart(5)}  ${pass ? "ok  " : "FAIL"}  ${against.padEnd(15)} ${use}`,
  );
}

console.log(`\n--brand-action is the brand mixed ${action.mixed}% toward black, the least`);
console.log(`darkening that lets white text sit on it and still be readable.\n`);

if (failed) {
  console.error("At least one text pair is below 4.5:1. Do not ship this palette.\n");
  process.exit(1);
}
