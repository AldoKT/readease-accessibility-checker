import {
  contrastRatio,
  evaluateWcagContrast,
  hexToRgb,
  type WCAGEvaluation,
} from "@/lib/contrast";

export type PaletteColor = {
  id: string;
  value: string;
};

export type PalettePairStatus =
  | "strong"
  | "usable"
  | "limited"
  | "needs-improvement";

export type PaletteContrastPair = {
  first: PaletteColor;
  second: PaletteColor;
  contrastRatio: number;
  normalText: WCAGEvaluation;
  largeText: WCAGEvaluation;
  status: PalettePairStatus;
};

export type PaletteContrastResult = {
  pairs: PaletteContrastPair[];
  invalidColorIds: string[];
};

export function getPalettePairStatus(
  normalText: WCAGEvaluation,
  largeText: WCAGEvaluation,
): PalettePairStatus {
  if (normalText.passesAAA) return "strong";
  if (normalText.passesAA) return "usable";
  if (largeText.passesAA) return "limited";
  return "needs-improvement";
}

/** Evaluates each unique unordered pair of valid palette colors with the existing WCAG engine. */
export function evaluatePaletteContrast(
  colors: readonly PaletteColor[],
): PaletteContrastResult {
  const validColors: Array<{ color: PaletteColor; rgb: NonNullable<ReturnType<typeof hexToRgb>> }> = [];
  const invalidColorIds: string[] = [];

  for (const color of colors) {
    const rgb = hexToRgb(color.value);
    if (rgb === null) invalidColorIds.push(color.id);
    else validColors.push({ color, rgb });
  }

  const pairs: PaletteContrastPair[] = [];
  for (let firstIndex = 0; firstIndex < validColors.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < validColors.length; secondIndex += 1) {
      const first = validColors[firstIndex];
      const second = validColors[secondIndex];
      const ratio = contrastRatio(first.rgb, second.rgb);
      const normalText = evaluateWcagContrast(ratio, "normal");
      const largeText = evaluateWcagContrast(ratio, "large");

      pairs.push({
        first: first.color,
        second: second.color,
        contrastRatio: ratio,
        normalText,
        largeText,
        status: getPalettePairStatus(normalText, largeText),
      });
    }
  }

  return { pairs, invalidColorIds };
}
