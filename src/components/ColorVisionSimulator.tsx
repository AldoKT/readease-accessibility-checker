"use client";

import { useMemo, useState } from "react";
import {
  simulateHexColor,
  type ColorVisionMode,
} from "@/lib/colorblind";

type ColorVisionSimulatorProps = {
  foreground: string | null;
  background: string | null;
};

const MODES: ReadonlyArray<{ value: ColorVisionMode; label: string }> = [
  { value: "normal", label: "Normal" },
  { value: "protanopia", label: "Protanopia" },
  { value: "deuteranopia", label: "Deuteranopia" },
  { value: "tritanopia", label: "Tritanopia" },
];

export function ColorVisionSimulator({
  foreground,
  background,
}: ColorVisionSimulatorProps) {
  const [mode, setMode] = useState<ColorVisionMode>("normal");
  const simulatedForeground = useMemo(
    () => (foreground === null ? null : simulateHexColor(foreground, mode)),
    [foreground, mode],
  );
  const simulatedBackground = useMemo(
    () => (background === null ? null : simulateHexColor(background, mode)),
    [background, mode],
  );
  const isAvailable =
    simulatedForeground !== null && simulatedBackground !== null;

  return (
    <section aria-labelledby="color-vision-heading" className="mt-20 border-t border-border pt-16 sm:mt-24 sm:pt-20">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold tracking-wide text-muted uppercase">Color vision simulator</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground" id="color-vision-heading">See color beyond one perspective.</h2>
        <p className="mt-3 leading-7 text-muted">Compare the current interface colors through common color vision deficiency models to support more considered visual decisions.</p>
      </div>

      <fieldset className="mt-8">
        <legend className="text-sm font-semibold text-foreground">Simulation mode</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {MODES.map(({ value, label }) => {
            const isSelected = mode === value;

            return (
              <button
                aria-pressed={isSelected}
                className={isSelected ? "inline-flex min-h-11 items-center gap-2 rounded-lg bg-foreground px-4 py-2 font-semibold text-background shadow-sm focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-700" : "inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 font-semibold text-foreground shadow-sm hover:bg-zinc-100 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-700"}
                key={value}
                onClick={() => setMode(value)}
                type="button"
              >
                {label}
                {isSelected && <span className="text-xs font-medium">Selected</span>}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.6fr)]">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          {isAvailable ? (
            <article className="rounded-xl border border-border p-6 sm:p-8" style={{ backgroundColor: simulatedBackground, color: simulatedForeground }}>
              <p className="text-xs font-semibold tracking-[0.14em] uppercase opacity-75">Interface label</p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight">A clearer path forward.</h3>
              <p className="mt-4 max-w-xl text-base leading-7">Preview the current foreground and background pairing in a small interface context before using it in product decisions.</p>
              <span className="mt-6 inline-flex rounded-lg border border-current px-4 py-2 text-sm font-semibold">Continue</span>
            </article>
          ) : (
            <div className="flex min-h-64 flex-col justify-center">
              <p className="text-sm font-semibold tracking-[0.14em] text-muted uppercase">Preview unavailable</p>
              <h3 className="mt-3 text-xl font-semibold text-foreground">Enter two valid colors to simulate them.</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted">The simulator uses the foreground and background values from the Contrast Checker above.</p>
            </div>
          )}
        </div>

        <aside className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">Simulated values</p>
          {isAvailable ? (
            <dl className="mt-5 space-y-4">
              <div className="rounded-xl border border-border bg-background p-4">
                <dt className="text-sm font-medium text-muted">Foreground</dt>
                <dd className="mt-2 font-mono text-lg font-semibold text-foreground">{simulatedForeground}</dd>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <dt className="text-sm font-medium text-muted">Background</dt>
                <dd className="mt-2 font-mono text-lg font-semibold text-foreground">{simulatedBackground}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-5 text-sm leading-6 text-muted">Simulated HEX values will appear when both checker colors are valid.</p>
          )}
          <p className="mt-6 border-t border-border pt-5 text-sm leading-6 text-muted">This simulation is an approximation for interface evaluation and does not represent exactly how every individual with a color vision deficiency sees color.</p>
        </aside>
      </div>
    </section>
  );
}
