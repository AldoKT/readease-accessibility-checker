"use client";

import { useMemo, useState } from "react";
import { AccessibilitySummary } from "@/components/AccessibilitySummary";
import { ColorInput } from "@/components/ColorInput";
import { ContrastResult } from "@/components/ContrastResult";
import { ColorVisionSimulator } from "@/components/ColorVisionSimulator";
import { HeroPreview } from "@/components/HeroPreview";
import { PreviewPanel } from "@/components/PreviewPanel";
import { ReadabilityAnalyzer } from "@/components/ReadabilityAnalyzer";
import { contrastRatio, evaluateWcagContrast, hexToRgb } from "@/lib/contrast";
import { analyzeReadability } from "@/lib/readability";
import { generateAccessibilityRecommendations } from "@/lib/recommendations";
import { evaluateSimulatedContrast } from "@/lib/simulatedContrast";

const DEFAULT_FOREGROUND = "#FFFFFF";
const DEFAULT_BACKGROUND = "#18181B";

function toColorInputValue(value: string) {
  const rgb = hexToRgb(value);
  if (rgb === null) return "#000000";

  return `#${[rgb.r, rgb.g, rgb.b]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

export default function Home() {
  const [foreground, setForeground] = useState(DEFAULT_FOREGROUND);
  const [background, setBackground] = useState(DEFAULT_BACKGROUND);
  const [text, setText] = useState("");
  const readability = useMemo(() => analyzeReadability(text), [text]);

  const foregroundRgb = useMemo(() => hexToRgb(foreground), [foreground]);
  const backgroundRgb = useMemo(() => hexToRgb(background), [background]);
  const ratio = useMemo(
    () => foregroundRgb !== null && backgroundRgb !== null
      ? contrastRatio(foregroundRgb, backgroundRgb)
      : null,
    [foregroundRgb, backgroundRgb],
  );

  const previewForeground = foregroundRgb === null ? null : toColorInputValue(foreground);
  const previewBackground = backgroundRgb === null ? null : toColorInputValue(background);
  const colorVision = useMemo(
    () => previewForeground !== null && previewBackground !== null
      ? evaluateSimulatedContrast(previewForeground, previewBackground)
      : null,
    [previewForeground, previewBackground],
  );

  const recommendations = useMemo(() => generateAccessibilityRecommendations({
    contrast: ratio === null ? null : {
      normalText: evaluateWcagContrast(ratio, "normal"),
      largeText: evaluateWcagContrast(ratio, "large"),
    },
    readability,
    colorVision,
  }), [ratio, readability, colorVision]);

  const handleSwap = () => {
    setForeground(background);
    setBackground(foreground);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <div>
            <p className="text-lg font-semibold tracking-tight">ReadEase</p>
            <p className="text-sm text-muted">Accessibility Checker</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 pb-20 sm:px-8 sm:pb-28">
        <section aria-labelledby="page-title" className="grid gap-10 py-14 sm:py-20 lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)] lg:items-center lg:gap-14">
          <div>
            <p className="text-sm font-semibold tracking-wide text-blue-800 uppercase">Color contrast checker</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl" id="page-title">Design for everyone.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">ReadEase helps designers and developers evaluate color contrast and make clearer, more inclusive visual choices before shipping.</p>
            <a className="mt-8 inline-flex min-h-11 items-center justify-center rounded-lg bg-foreground px-5 py-2.5 font-semibold text-background shadow-sm transition-colors hover:bg-zinc-700 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-700" href="#contrast-checker">
              Start Checking
            </a>
          </div>
          <HeroPreview background={previewBackground} foreground={previewForeground} ratio={ratio} />
        </section>

        <section aria-labelledby="checker-heading" className="scroll-mt-8" id="contrast-checker" tabIndex={-1}>
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-semibold tracking-wide text-muted uppercase">Contrast checker</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight" id="checker-heading">Check a color pairing.</h2>
            <p className="mt-3 leading-7 text-muted">Enter a foreground and background color to assess their text contrast against WCAG levels.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)]">
            <section aria-label="Color inputs" className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
              <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
                <ColorInput colorValue={toColorInputValue(foreground)} id="foreground-color" isValid={foregroundRgb !== null} label="Foreground color" onChange={setForeground} value={foreground} />
                <ColorInput colorValue={toColorInputValue(background)} id="background-color" isValid={backgroundRgb !== null} label="Background color" onChange={setBackground} value={background} />
              </div>
              <button className="mt-7 inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-background px-4 py-2.5 font-semibold text-foreground shadow-sm transition-colors hover:bg-zinc-100 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-700" onClick={handleSwap} type="button">
                Swap colors
              </button>
            </section>
            <ContrastResult ratio={ratio} />
          </div>
        </section>

        <PreviewPanel foreground={previewForeground} background={previewBackground} />
        <ReadabilityAnalyzer text={text} onTextChange={setText} analysis={readability} />
        <ColorVisionSimulator background={previewBackground} foreground={previewForeground} />
        <AccessibilitySummary recommendations={recommendations} readabilityWords={readability.words} />
      </div>
    </main>
  );
}
