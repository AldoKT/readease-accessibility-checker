import { rgbToHex, simulateColorVision, type ColorVisionMode } from "@/lib/colorblind";
import { contrastRatio, evaluateWcagContrast, hexToRgb, type WCAGEvaluation } from "@/lib/contrast";

export type SimulatedContrastModeResult = {
  mode: ColorVisionMode;
  simulatedForeground: string;
  simulatedBackground: string;
  contrastRatio: number;
  normalText: WCAGEvaluation;
  largeText: WCAGEvaluation;
};

export type SimulatedContrastAggregate = {
  allModesPassNormalTextAA: boolean;
  allModesPassNormalTextAAA: boolean;
  anyModePassesOnlyLargeTextAA: boolean;
  anyModeFailsLargeTextAA: boolean;
};

export type SimulatedContrastEvaluation = {
  modes: readonly SimulatedContrastModeResult[];
  aggregate: SimulatedContrastAggregate;
};

const MODES = ["normal", "protanopia", "deuteranopia", "tritanopia"] as const;

/**
 * Evaluates the existing approximation's 8-bit simulated colors, matching the
 * simulator preview. Ratios remain unrounded for WCAG evaluation. All aggregates
 * include the normal baseline. Returns null if either HEX color is invalid.
 * This evaluates text contrast only, not overall color-vision accessibility.
 */
export function evaluateSimulatedContrast(
  foreground: string,
  background: string,
): SimulatedContrastEvaluation | null {
  const foregroundRgb = hexToRgb(foreground);
  const backgroundRgb = hexToRgb(background);
  if (foregroundRgb === null || backgroundRgb === null) return null;

  const modes = MODES.map((mode): SimulatedContrastModeResult => {
    const simulatedForeground = simulateColorVision(foregroundRgb, mode);
    const simulatedBackground = simulateColorVision(backgroundRgb, mode);
    const ratio = contrastRatio(simulatedForeground, simulatedBackground);

    return {
      mode,
      simulatedForeground: rgbToHex(simulatedForeground),
      simulatedBackground: rgbToHex(simulatedBackground),
      contrastRatio: ratio,
      normalText: evaluateWcagContrast(ratio, "normal"),
      largeText: evaluateWcagContrast(ratio, "large"),
    };
  });

  return {
    modes,
    aggregate: {
      allModesPassNormalTextAA: modes.every(({ normalText }) => normalText.passesAA),
      allModesPassNormalTextAAA: modes.every(({ normalText }) => normalText.passesAAA),
      anyModePassesOnlyLargeTextAA: modes.some(({ normalText, largeText }) => !normalText.passesAA && largeText.passesAA),
      anyModeFailsLargeTextAA: modes.some(({ largeText }) => !largeText.passesAA),
    },
  };
}
