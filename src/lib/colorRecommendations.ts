import {
  contrastRatio,
  evaluateWcagContrast,
  hexToRgb,
  type RGB,
  type WCAGLevel,
} from "@/lib/contrast";

export type ForegroundRecommendationStatus =
  | "recommended"
  | "already-sufficient"
  | "unavailable";

export type ForegroundContrastRecommendation = {
  target: WCAGLevel;
  originalForeground: string;
  background: string;
  recommendedForeground: string | null;
  contrastRatio: number | null;
  direction: "lighter" | "darker" | null;
  status: ForegroundRecommendationStatus;
};

type Hsl = { hue: number; saturation: number; lightness: number };

const LIGHTNESS_STEPS = 1000;

function rgbToHsl({ r, g, b }: RGB): Hsl {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const lightness = (maximum + minimum) / 2;
  const delta = maximum - minimum;

  if (delta === 0) {
    return { hue: 0, saturation: 0, lightness };
  }

  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue = 0;
  if (maximum === red) hue = ((green - blue) / delta) % 6;
  else if (maximum === green) hue = (blue - red) / delta + 2;
  else hue = (red - green) / delta + 4;

  return { hue: (hue * 60 + 360) % 360, saturation, lightness };
}

function hslToRgb({ hue, saturation, lightness }: Hsl): RGB {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const sector = hue / 60;
  const match = chroma * (1 - Math.abs((sector % 2) - 1));
  const adjustment = lightness - chroma / 2;
  const [red, green, blue] =
    sector < 1 ? [chroma, match, 0] :
      sector < 2 ? [match, chroma, 0] :
        sector < 3 ? [0, chroma, match] :
          sector < 4 ? [0, match, chroma] :
            sector < 5 ? [match, 0, chroma] : [chroma, 0, match];

  return {
    r: Math.round((red + adjustment) * 255),
    g: Math.round((green + adjustment) * 255),
    b: Math.round((blue + adjustment) * 255),
  };
}

function rgbToHex({ r, g, b }: RGB): string {
  return `#${[r, g, b]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

function meetsTarget(ratio: number, target: WCAGLevel): boolean {
  const evaluation = evaluateWcagContrast(ratio, "normal");
  return target === "AA" ? evaluation.passesAA : evaluation.passesAAA;
}

/**
 * Finds the closest foreground adjustment for normal text while keeping the
 * background fixed. The search preserves HSL hue and saturation and evaluates
 * each 8-bit lightness candidate with the existing WCAG contrast engine.
 */
export function recommendForegroundContrast(
  foreground: string,
  background: string,
  target: WCAGLevel,
): ForegroundContrastRecommendation {
  const foregroundRgb = hexToRgb(foreground);
  const backgroundRgb = hexToRgb(background);
  const originalForeground = foregroundRgb === null ? foreground : rgbToHex(foregroundRgb);
  const normalizedBackground = backgroundRgb === null ? background : rgbToHex(backgroundRgb);

  if (foregroundRgb === null || backgroundRgb === null) {
    return {
      target,
      originalForeground,
      background: normalizedBackground,
      recommendedForeground: null,
      contrastRatio: null,
      direction: null,
      status: "unavailable",
    };
  }

  const currentRatio = contrastRatio(foregroundRgb, backgroundRgb);
  if (meetsTarget(currentRatio, target)) {
    return {
      target,
      originalForeground,
      background: normalizedBackground,
      recommendedForeground: originalForeground,
      contrastRatio: currentRatio,
      direction: null,
      status: "already-sufficient",
    };
  }

  const originalHsl = rgbToHsl(foregroundRgb);
  let closest: { rgb: RGB; ratio: number; lightness: number } | null = null;

  for (let step = 0; step <= LIGHTNESS_STEPS; step += 1) {
    const lightness = step / LIGHTNESS_STEPS;
    const candidate = hslToRgb({ ...originalHsl, lightness });
    const candidateRatio = contrastRatio(candidate, backgroundRgb);
    if (!meetsTarget(candidateRatio, target)) continue;

    if (
      closest === null ||
      Math.abs(lightness - originalHsl.lightness) <
        Math.abs(closest.lightness - originalHsl.lightness)
    ) {
      closest = { rgb: candidate, ratio: candidateRatio, lightness };
    }
  }

  if (closest === null) {
    return {
      target,
      originalForeground,
      background: normalizedBackground,
      recommendedForeground: null,
      contrastRatio: null,
      direction: null,
      status: "unavailable",
    };
  }

  return {
    target,
    originalForeground,
    background: normalizedBackground,
    recommendedForeground: rgbToHex(closest.rgb),
    contrastRatio: closest.ratio,
    direction: closest.lightness > originalHsl.lightness ? "lighter" : "darker",
    status: "recommended",
  };
}
