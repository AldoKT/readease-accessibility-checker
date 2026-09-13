"use client";

import { useEffect, useState } from "react";
import type {
  AccessibilityRecommendation,
  RecommendationCategory,
  RecommendationStatus,
} from "@/lib/recommendations";

type AccessibilitySummaryProps = {
  recommendations: readonly AccessibilityRecommendation[];
  readabilityWords: number;
};

const STATUS_STYLES: Record<RecommendationStatus, { label: string; className: string }> = {
  good: { label: "Good", className: "bg-emerald-50 text-emerald-800" },
  warning: { label: "Review", className: "bg-amber-50 text-amber-900" },
  action: { label: "Action needed", className: "bg-red-50 text-red-800" },
};

const CATEGORIES: readonly {
  category: RecommendationCategory;
  label: string;
  emptyTitle: string;
  emptyDescription: string;
}[] = [
  {
    category: "contrast",
    label: "Text contrast",
    emptyTitle: "Contrast unavailable",
    emptyDescription: "Enter two valid HEX colors in the contrast checker to get guidance for this pairing.",
  },
  {
    category: "readability",
    label: "Readability",
    emptyTitle: "Add text to get guidance",
    emptyDescription: "Enter English words in the readability analyzer to see recommendations for your content.",
  },
  {
    category: "color-vision",
    label: "Color vision",
    emptyTitle: "Guidance unavailable",
    emptyDescription: "Use the simulator to review how your interface communicates meaning.",
  },
];

export function AccessibilitySummary({ recommendations, readabilityWords }: AccessibilitySummaryProps) {
  const [announcement, setAnnouncement] = useState("");
  const summary = CATEGORIES.map(({ category, label, emptyTitle }) => {
    const recommendation = recommendations.find((item) => item.category === category);
    return `${label}: ${recommendation ? `${STATUS_STYLES[recommendation.status].label}. ${recommendation.title}` : emptyTitle}.`;
  }).join(" ");

  // Announce interpretation changes after a pause, rather than every numeric
  // update in each tool. Detailed results remain available for navigation.
  useEffect(() => {
    const timeout = setTimeout(() => setAnnouncement(summary), 600);
    return () => clearTimeout(timeout);
  }, [summary]);

  return (
    <section aria-labelledby="accessibility-summary-heading" className="mt-20 border-t border-border pt-16 sm:mt-24 sm:pt-20">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold tracking-wide text-muted uppercase">Accessibility summary</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight" id="accessibility-summary-heading">Your next steps, in one place.</h2>
        <p className="mt-3 leading-7 text-muted">Guidance updates with your colors and text. Use it to support your review and decide what to improve next.</p>
      </div>

      <p role="status" className="sr-only">{announcement}</p>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {CATEGORIES.map(({ category, label, emptyTitle, emptyDescription }) => {
          const recommendation = recommendations.find((item) => item.category === category);
          const status = recommendation ? STATUS_STYLES[recommendation.status] : null;
          const isShortReadabilitySample =
            category === "readability" && readabilityWords > 0 && readabilityWords < 20;
          const unavailableTitle = isShortReadabilitySample
            ? "Add more text for guidance"
            : emptyTitle;
          const unavailableDescription = isShortReadabilitySample
            ? "Add at least 20 words for a more meaningful readability estimate."
            : emptyDescription;

          return (
            <section aria-labelledby={`summary-${category}`} className="min-w-0 rounded-2xl border border-border bg-surface p-6 shadow-sm" key={category}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</p>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status?.className ?? "bg-zinc-100 text-zinc-700"}`}>
                  {status?.label ?? "Not evaluated"}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight" id={`summary-${category}`}>
                {recommendation?.title ?? unavailableTitle}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted">{recommendation?.description ?? unavailableDescription}</p>
            </section>
          );
        })}
      </div>

      <p className="mt-6 max-w-3xl text-sm leading-6 text-muted">These checks cover selected aspects of accessibility and do not establish full WCAG compliance. Readability depends on your audience. Color vision simulations are approximations, not medical representations or definitive accessibility tests.</p>
    </section>
  );
}
