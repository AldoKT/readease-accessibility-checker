"use client";

import { useMemo } from "react";
import {
  evaluatePaletteContrast,
  type PaletteColor,
  type PalettePairStatus,
} from "@/lib/paletteContrast";
import { hexToRgb } from "@/lib/contrast";

type PaletteCheckerProps = {
  colors: readonly PaletteColor[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, value: string) => void;
};

const MINIMUM_COLORS = 2;
const MAXIMUM_COLORS = 6;

const STATUS_DETAILS: Record<PalettePairStatus, { label: string; detail: string; className: string }> = {
  strong: { label: "Strong", detail: "AAA for normal text", className: "bg-emerald-50 text-emerald-800" },
  usable: { label: "Usable", detail: "AA for normal text", className: "bg-blue-50 text-blue-800" },
  limited: { label: "Large text only", detail: "AA for large text", className: "bg-amber-50 text-amber-900" },
  "needs-improvement": { label: "Needs improvement", detail: "Insufficient text contrast", className: "bg-red-50 text-red-800" },
};

function toColorInputValue(value: string): string {
  const rgb = hexToRgb(value);
  if (rgb === null) return "#000000";
  return `#${[rgb.r, rgb.g, rgb.b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

export function PaletteChecker({ colors, onAdd, onRemove, onUpdate }: PaletteCheckerProps) {
  const result = useMemo(() => evaluatePaletteContrast(colors), [colors]);
  const counts = useMemo(() => result.pairs.reduce<Record<PalettePairStatus, number>>((summary, pair) => {
    summary[pair.status] += 1;
    return summary;
  }, { strong: 0, usable: 0, limited: 0, "needs-improvement": 0 }), [result.pairs]);

  return (
    <section aria-labelledby="palette-checker-heading" className="mt-20 border-t border-border pt-16 sm:mt-24 sm:pt-20">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold tracking-wide text-muted uppercase">Palette checker</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground" id="palette-checker-heading">Check colors together.</h2>
        <p className="mt-3 leading-7 text-muted">Check how colors in your palette perform against each other for text contrast.</p>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-foreground">Palette colors</h3>
            <p className="mt-1 text-sm text-muted">{colors.length} of {MAXIMUM_COLORS} colors</p>
          </div>
          <button className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-background px-4 py-2 font-semibold text-foreground shadow-sm transition-colors hover:bg-zinc-100 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-60" disabled={colors.length >= MAXIMUM_COLORS} onClick={onAdd} type="button">
            Add color
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {colors.map((color, index) => {
            const isValid = hexToRgb(color.value) !== null;
            const inputId = `palette-color-${color.id}`;

            return (
              <div className="min-w-0 rounded-xl border border-border bg-background p-4" key={color.id}>
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-semibold text-foreground" htmlFor={inputId}>Color {index + 1}</label>
                  <button aria-label={`Remove color ${index + 1}`} className="inline-flex min-h-11 items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold text-foreground hover:bg-zinc-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-60" disabled={colors.length <= MINIMUM_COLORS} onClick={() => onRemove(color.id)} type="button">
                    Remove
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <input aria-label={`Choose color ${index + 1} with a color picker`} className="h-11 w-12 shrink-0 cursor-pointer rounded-lg border border-muted bg-surface p-1 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700" onChange={(event) => onUpdate(color.id, event.target.value)} type="color" value={toColorInputValue(color.value)} />
                  <input aria-describedby={`${inputId}-help`} aria-invalid={!isValid} autoCapitalize="characters" className="h-11 min-w-0 flex-1 rounded-lg border border-muted bg-background px-3 font-mono text-base text-foreground shadow-sm focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700" id={inputId} onChange={(event) => onUpdate(color.id, event.target.value)} spellCheck={false} type="text" value={color.value} />
                </div>
                <p className={isValid ? "mt-2 text-sm text-muted" : "mt-2 text-sm font-medium text-red-700"} id={`${inputId}-help`}>{isValid ? "HEX color" : "Enter a valid 3- or 6-digit HEX color."}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-wide text-muted uppercase">Pairwise results</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{result.pairs.length} {result.pairs.length === 1 ? "pair" : "pairs"} checked.</h3>
          </div>
          <p className="text-sm text-muted">{counts.strong} strong · {counts.usable} usable · {counts.limited} limited · {counts["needs-improvement"]} need improvement</p>
        </div>

        {result.invalidColorIds.length > 0 && <p className="mt-4 text-sm font-medium text-red-700">Correct invalid palette colors to include them in pairwise results.</p>}

        {result.pairs.length > 0 ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {result.pairs.map((pair) => {
              const status = STATUS_DETAILS[pair.status];
              return (
                <article className="min-w-0 rounded-2xl border border-border bg-surface p-5 shadow-sm" key={`${pair.first.id}-${pair.second.id}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2 font-mono text-sm font-semibold text-foreground">
                      <span aria-hidden="true" className="h-6 w-6 shrink-0 rounded border border-foreground" style={{ backgroundColor: pair.first.value }} />
                      <span>{pair.first.value.toUpperCase()}</span>
                      <span aria-hidden="true" className="text-muted">↔</span>
                      <span aria-hidden="true" className="h-6 w-6 shrink-0 rounded border border-foreground" style={{ backgroundColor: pair.second.value }} />
                      <span>{pair.second.value.toUpperCase()}</span>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
                  </div>
                  <p className="mt-5 font-mono text-3xl font-semibold tracking-[-0.04em] text-foreground">{pair.contrastRatio.toFixed(2)} : 1</p>
                  <p className="mt-2 text-sm leading-6 text-muted">{status.detail}</p>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-surface p-6 text-sm leading-6 text-muted">Enter at least two valid colors to check their pairwise contrast.</div>
        )}
      </div>
    </section>
  );
}
