import { evaluateWcagContrast, type WCAGEvaluation } from "@/lib/contrast";

type ContrastResultProps = { ratio: number | null };

function ComplianceRow({ label, passes }: { label: string; passes: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border py-3 first:border-t-0 first:pt-0">
      <span className="font-medium text-foreground">{label}</span>
      <span className={passes ? "inline-flex items-center gap-1.5 font-semibold text-emerald-800" : "inline-flex items-center gap-1.5 font-semibold text-red-700"}>
        <span aria-hidden="true">{passes ? "✓" : "✕"}</span>{passes ? "Pass" : "Fail"}
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

export function ContrastResult({ ratio }: ContrastResultProps) {
  if (ratio === null) {
    return (
      <section aria-live="polite" aria-labelledby="contrast-result-heading" className="rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm font-semibold tracking-wide text-muted uppercase">Contrast ratio</p>
        <h2 className="mt-3 text-xl font-semibold text-foreground" id="contrast-result-heading">Results unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Correct both color values to view contrast and WCAG results.</p>
      </section>
    );
  }

  const normalText = evaluateWcagContrast(ratio, "normal");
  const largeText = evaluateWcagContrast(ratio, "large");

  return (
    <section aria-live="polite" aria-labelledby="contrast-result-heading" className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <p className="text-sm font-semibold tracking-wide text-muted uppercase">Contrast ratio</p>
      <h2 className="mt-2 font-mono text-4xl font-semibold tracking-tight text-foreground" id="contrast-result-heading">{ratio.toFixed(2)} : 1</h2>
      <p className="mt-2 text-sm text-muted">WCAG text contrast assessment</p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <ComplianceGroup evaluation={normalText} title="Normal text" />
        <ComplianceGroup evaluation={largeText} title="Large text" />
      </div>
    </section>
  );
}
