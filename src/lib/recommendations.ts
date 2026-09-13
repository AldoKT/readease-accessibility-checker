import type { WCAGEvaluation } from "@/lib/contrast";
import type { SimulatedContrastEvaluation } from "@/lib/simulatedContrast";
import {
  getReadingEaseInterpretation,
  hasMinimumReadabilitySample,
  type ReadabilityAnalysis,
} from "@/lib/readability";

export type RecommendationStatus = "good" | "warning" | "action";
export type RecommendationCategory = "contrast" | "readability" | "color-vision";

export type AccessibilityRecommendation = {
  id: string;
  category: RecommendationCategory;
  status: RecommendationStatus;
  title: string;
  description: string;
};

export type ContrastRecommendationInput = {
  normalText: WCAGEvaluation;
  largeText: WCAGEvaluation;
};

export type AccessibilityRecommendationInput = {
  contrast: ContrastRecommendationInput | null;
  readability?: ReadabilityAnalysis | null;
  colorVision?: SimulatedContrastEvaluation | null;
};

/** Uses WCAG evaluations produced by the contrast engine; no ratios or thresholds are recalculated here. */
export function getContrastRecommendation({
  normalText,
  largeText,
}: ContrastRecommendationInput): AccessibilityRecommendation {
  if (normalText.passesAAA) {
    return {
      id: "contrast-aaa",
      category: "contrast",
      status: "good",
      title: "Strong text contrast",
      description: "This pairing meets AAA contrast guidance for normal and large text.",
    };
  }

  if (normalText.passesAA) {
    return {
      id: "contrast-aa",
      category: "contrast",
      status: "good",
      title: "Good contrast for text",
      description: "This pairing meets AA contrast guidance for normal and large text. Increasing contrast further may improve reading comfort.",
    };
  }

  if (largeText.passesAA) {
    return {
      id: "contrast-large-text-only",
      category: "contrast",
      status: "warning",
      title: "Limit this pairing to large text",
      description: "This pairing meets AA guidance for large text but not normal text. Avoid using it for smaller body copy.",
    };
  }

  return {
    id: "contrast-increase",
    category: "contrast",
    status: "action",
    title: "Increase text contrast",
    description: "This pairing does not meet AA contrast guidance for large text. Increase the difference between foreground and background before using it for text.",
  };
}

/** Maps the existing Reading Ease interpretation to contextual editorial guidance. */
export function getReadabilityRecommendation(
  readability: ReadabilityAnalysis | null | undefined,
): AccessibilityRecommendation | null {
  if (
    readability?.readingEase === null ||
    readability === null ||
    readability === undefined ||
    !hasMinimumReadabilitySample(readability)
  ) {
    return null;
  }

  const interpretation = getReadingEaseInterpretation(readability.readingEase);

  switch (interpretation.label) {
    case "Very easy":
    case "Easy":
    case "Fairly easy":
      return {
        id: "readability-easy",
        category: "readability",
        status: "good",
        title: "Clear, approachable reading level",
        description: "The text is likely easy for many readers to follow. Keep matching the language to your audience and task.",
      };
    case "Standard":
      return {
        id: "readability-standard",
        category: "readability",
        status: "good",
        title: "Balanced readability",
        description: "The text has a standard reading level. Consider the audience and context when deciding whether to simplify it further.",
      };
    case "Fairly difficult":
      return {
        id: "readability-fairly-difficult",
        category: "readability",
        status: "warning",
        title: "Consider simplifying the text",
        description: "Shorter sentences or more familiar word choices may make this content easier to scan and understand.",
      };
    case "Difficult":
    case "Very difficult":
      return {
        id: "readability-difficult",
        category: "readability",
        status: "action",
        title: "Review sentence complexity",
        description: "Review sentence length and vocabulary for opportunities to make the content clearer. Complex language can still be appropriate for specialist audiences.",
      };
    default:
      return null;
  }
}

/** The simulation informs review; it cannot determine color-vision accessibility on its own. */
export function getColorVisionRecommendation(
  evaluation?: SimulatedContrastEvaluation | null,
): AccessibilityRecommendation {
  const guidance = "Still, avoid relying on color alone to communicate meaning.";

  if (evaluation === null) {
    return {
      id: "color-vision-unavailable",
      category: "color-vision",
      status: "warning",
      title: "Simulated contrast unavailable",
      description: `Enter two valid HEX colors to evaluate simulated text contrast. ${guidance}`,
    };
  }

  if (evaluation !== undefined) {
    const { aggregate } = evaluation;
    if (aggregate.anyModeFailsLargeTextAA) {
      return {
        id: "color-vision-increase-contrast",
        category: "color-vision",
        status: "action",
        title: "Increase contrast across simulation modes",
        description: `At least one evaluated mode falls below large-text AA contrast. Increase contrast and check again. ${guidance}`,
      };
    }
    if (aggregate.allModesPassNormalTextAA) {
      return {
        id: aggregate.allModesPassNormalTextAAA ? "color-vision-contrast-aaa" : "color-vision-contrast-aa",
        category: "color-vision",
        status: "good",
        title: "Text contrast remains sufficient across simulation modes",
        description: `This pairing retains normal-text ${aggregate.allModesPassNormalTextAAA ? "AAA" : "AA"} contrast across all evaluated modes. ${guidance}`,
      };
    }
    return {
      id: "color-vision-large-text-only",
      category: "color-vision",
      status: "warning",
      title: "Review normal-text contrast across simulation modes",
      description: `Some evaluated modes retain AA contrast for large text only. Increase contrast for body text. ${guidance}`,
    };
  }

  return {
    id: "color-vision-redundant-cues",
    category: "color-vision",
    status: "warning",
    title: "Use more than color to communicate meaning",
    description: "Compare simulation modes and pair meaningful colors with text, icons, or patterns.",
  };
}

/** Returns recommendations in a stable contrast, readability, then color-vision order. */
export function generateAccessibilityRecommendations(
  input: AccessibilityRecommendationInput,
): AccessibilityRecommendation[] {
  const recommendations: AccessibilityRecommendation[] = input.contrast === null
    ? []
    : [getContrastRecommendation(input.contrast)];
  const readabilityRecommendation = getReadabilityRecommendation(input.readability);

  if (readabilityRecommendation !== null) {
    recommendations.push(readabilityRecommendation);
  }

  recommendations.push(getColorVisionRecommendation(input.colorVision));

  return recommendations;
}
