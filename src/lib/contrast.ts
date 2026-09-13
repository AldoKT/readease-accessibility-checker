/** An RGB colour with 8-bit channel values. */
export type RGB = {
  r: number;
  g: number;
  b: number;
};

export type WCAGLevel = "AA" | "AAA";
export type TextSize = "normal" | "large";

export type WCAGEvaluation = {
  textSize: TextSize;
  passesAA: boolean;
  passesAAA: boolean;
  highestPassingLevel: WCAGLevel | null;
};

const HEX_PATTERN = /^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const SRGB_LINEAR_THRESHOLD = 0.04045;
const LUMINANCE_OFFSET = 0.05;

const LUMINANCE_COEFFICIENTS = {
  red: 0.2126,
  green: 0.7152,
  blue: 0.0722,
} as const;

const WCAG_THRESHOLDS = {
  normal: { AA: 4.5, AAA: 7 },
  large: { AA: 3, AAA: 4.5 },
} as const;

/** Converts a three- or six-digit hexadecimal colour to 8-bit RGB channels. */
export function hexToRgb(hex: string): RGB | null {
  const value = hex.trim().replace(/^#/, "");

  if (!HEX_PATTERN.test(value)) {
    return null;
  }

  const expandedValue =
    value.length === 3
      ? value
          .split("")
          .map((channel) => channel.repeat(2))
          .join("")
      : value;

  return {
    r: Number.parseInt(expandedValue.slice(0, 2), 16),
    g: Number.parseInt(expandedValue.slice(2, 4), 16),
    b: Number.parseInt(expandedValue.slice(4, 6), 16),
  };
}

/** Converts a normalized sRGB channel (0–1) to linear RGB for WCAG maths. */
export function srgbChannelToLinear(channel: number): number {
  return channel <= SRGB_LINEAR_THRESHOLD
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

/**
 * Calculates WCAG relative luminance from 8-bit RGB values.
 *
 * Calculation pipeline: HEX → RGB → normalized sRGB → linear RGB →
 * relative luminance → contrast ratio → WCAG evaluation.
 */
export function relativeLuminance({ r, g, b }: RGB): number {
  const linearRed = srgbChannelToLinear(r / 255);
  const linearGreen = srgbChannelToLinear(g / 255);
  const linearBlue = srgbChannelToLinear(b / 255);

  return (
    LUMINANCE_COEFFICIENTS.red * linearRed +
    LUMINANCE_COEFFICIENTS.green * linearGreen +
    LUMINANCE_COEFFICIENTS.blue * linearBlue
  );
}

/** Calculates the unrounded WCAG contrast ratio between two RGB colours. */
export function contrastRatio(foreground: RGB, background: RGB): number {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + LUMINANCE_OFFSET) / (darker + LUMINANCE_OFFSET);
}

/** Evaluates a contrast ratio against WCAG text thresholds. */
export function evaluateWcagContrast(
  ratio: number,
  textSize: TextSize,
): WCAGEvaluation {
  const thresholds = WCAG_THRESHOLDS[textSize];
  const passesAA = ratio >= thresholds.AA;
  const passesAAA = ratio >= thresholds.AAA;

  return {
    textSize,
    passesAA,
    passesAAA,
    highestPassingLevel: passesAAA ? "AAA" : passesAA ? "AA" : null,
  };
}
