import { evaluateWcagContrast, type WCAGEvaluation } from "@/lib/contrast";
import type { ForegroundContrastRecommendation } from "@/lib/colorRecommendations";

type ContrastResultProps = {
  ratio: number | null;
  recommendations: readonly ForegroundContrastRecommendation[];
  onApplyRecommendation: (color: string) => void;
};

type Interpretation = {
  title: string;
  detail: string;
};

function getInterpretation(
  normalText: WCAGEvaluation,
  largeText: WCAGEvaluation,
): Interpretation {
  if (normalText.passesAAA) {
    return { title: "Excellent contrast", detail: "Meets AAA for normal and large text." };
  }

  if (normalText.passesAA) {
    return { title: "Good contrast", detail: "Meets AA for normal and large text." };
  }

  if (largeText.passesAA) {
    return { title: "Limited contrast", detail: "Meets AA for large text only." };
  }

  return { title: "Needs improvement", detail: "Does not meet WCAG AA text contrast." };
}

function ComplianceRow({ label, passes }: { label: string; passes: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border py-3 first:border-t-0 first:pt-0">
      <span className="font-medium text-foreground">{label}</span>
      <span className={passes ? "inline-flex items-center gap-1.5 font-semibold text-emerald-800" : "inline-flex items-center gap-1.5 font-semibold text-red-700"}>
        <span aria-hidden="true">{passes ? "✓" : "✕"}</span>
        {passes ? "Pass" : "Fail"}
      </span>
    </div>
  );
}

function ComplianceGroup({ title, evaluation }: { title: string; evaluation: WCAGEvaluation }) {
  return (
    <section aria-label={`${title} WCAG results`}>
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      <ComplianceRow label="AA" passes={evaluation.passesAA} />
      <ComplianceRow label="AAA" passes={evaluation.passesAAA} />
    </section>
  );
}

export function ContrastResult({ ratio, recommendations, onApplyRecommendation }: ContrastResultProps) {
  if (ratio === null) {
    return (
      <section aria-labelledby="contrast-result-heading" className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">Contrast ratio</p>
        <h2 className="mt-3 text-xl font-semibold text-foreground" id="contrast-result-heading">Results unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Correct both color values to view contrast and WCAG results.</p>
      </section>
    );
  }

  const normalText = evaluateWcagContrast(ratio, "normal");
  const largeText = evaluateWcagContrast(ratio, "large");
  const interpretation = getInterpretation(normalText, largeText);

  return (
    <section aria-labelledby="contrast-result-heading" className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">Contrast ratio</p>
      <h2 className="mt-2 font-mono text-5xl font-semibold tracking-[-0.04em] text-foreground sm:text-6xl" id="contrast-result-heading">{ratio.toFixed(2)} : 1</h2>

      <div className="mt-5 border-l-2 border-foreground pl-4">
        <p className="font-semibold text-foreground">{interpretation.title}</p>
        <p className="mt-1 text-sm leading-6 text-muted">{interpretation.detail}</p>
      </div>

      <div className="mt-7 grid gap-6 border-t border-border pt-6 sm:grid-cols-2">
        <ComplianceGroup evaluation={normalText} title="Normal text" />
        <ComplianceGroup evaluation={largeText} title="Large text" />
      </div>

      {recommendations.some(({ status }) => status === "recommended") && (
        <section aria-labelledby="contrast-recommendations-heading" className="mt-7 border-t border-border pt-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">Fix my contrast</p>
            <h3 className="mt-2 text-lg font-semibold text-foreground" id="contrast-recommendations-heading">Adjust the foreground while keeping the background unchanged.</h3>
          </div>
          <div className="mt-4 grid gap-3">
            {recommendations.filter(({ status }) => status === "recommended").map((recommendation) => (
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-background p-4" key={recommendation.target}>
                <div>
                  <p className="text-sm font-semibold text-foreground">{recommendation.target} suggestion</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span aria-hidden="true" className="h-5 w-5 shrink-0 rounded border border-foreground" style={{ backgroundColor: recommendation.recommendedForeground! }} />
                    <p className="font-mono text-lg font-semibold text-foreground">{recommendation.recommendedForeground}</p>
                  </div>
                  <p className="mt-1 text-sm text-muted">{recommendation.contrastRatio!.toFixed(2)} : 1 · Passes {recommendation.target} for normal text</p>
                </div>
                <button aria-label={`Apply ${recommendation.recommendedForeground} foreground color for normal text ${recommendation.target}`} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-surface px-4 py-2 font-semibold text-foreground shadow-sm transition-colors hover:bg-zinc-100 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-700" onClick={() => onApplyRecommendation(recommendation.recommendedForeground!)} type="button">
                  Apply
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
