"use client";

import {
  type ReadabilityAnalysis,
  getGradeLevelInterpretation,
  getReadingEaseInterpretation,
} from "@/lib/readability";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <dt className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</dt>
      <dd className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</dd>
    </div>
  );
}

type ReadabilityAnalyzerProps = {
  text: string;
  onTextChange: (text: string) => void;
  analysis: ReadabilityAnalysis;
};

export function ReadabilityAnalyzer({ text, onTextChange, analysis }: ReadabilityAnalyzerProps) {

  const readingEase = getReadingEaseInterpretation(analysis.readingEase);
  const gradeLevel = getGradeLevelInterpretation(analysis.gradeLevel);

  return (
    <section aria-labelledby="readability-heading" className="mt-20 border-t border-border pt-16 sm:mt-24 sm:pt-20">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold tracking-wide text-muted uppercase">Readability analyzer</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground" id="readability-heading">Make content easier to read.</h2>
        <p className="mt-3 leading-7 text-muted">Paste English text to see how easily it reads and the approximate school grade level needed to understand it.</p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)]">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          <label className="text-sm font-semibold text-foreground" htmlFor="readability-text">Text to analyze</label>
          <p className="mt-2 text-sm leading-6 text-muted" id="readability-help">Analysis updates as you type. Add a few English sentences for the most useful result.</p>
          <textarea
            aria-describedby="readability-help"
            className="mt-4 min-h-64 w-full resize-y rounded-xl border border-border bg-background p-4 text-base leading-7 text-foreground shadow-sm outline-none transition-colors placeholder:text-muted focus-visible:border-blue-700 focus-visible:ring-3 focus-visible:ring-blue-100"
            id="readability-text"
            onChange={(event) => onTextChange(event.target.value)}
            placeholder="Write or paste text here…"
            value={text}
          />
          <p className="mt-3 text-sm text-muted">Reading Ease estimates how easy text is to read. Grade Level is approximate and based on U.S. school grades.</p>
        </div>

        <div aria-live="polite" className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          {analysis.readingEase !== null && analysis.gradeLevel !== null ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
                <section aria-labelledby="reading-ease-result">
                  <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">Flesch Reading Ease</p>
                  <h3 className="mt-2 font-mono text-5xl font-semibold tracking-[-0.04em] text-foreground" id="reading-ease-result">{analysis.readingEase.toFixed(1)}</h3>
                  <p className="mt-3 font-semibold text-foreground">{readingEase.label}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{readingEase.description}</p>
                </section>

                <section className="border-t border-border pt-6" aria-labelledby="grade-level-result">
                  <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">Flesch-Kincaid Grade Level</p>
                  <h3 className="mt-2 font-mono text-5xl font-semibold tracking-[-0.04em] text-foreground" id="grade-level-result">{analysis.gradeLevel.toFixed(1)}</h3>
                  <p className="mt-3 font-semibold text-foreground">{gradeLevel.label}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{gradeLevel.description}</p>
                </section>
              </div>

              <dl className="mt-7 grid grid-cols-2 gap-3 border-t border-border pt-6 sm:grid-cols-4 lg:grid-cols-2">
                <Stat label="Words" value={analysis.words} />
                <Stat label="Sentences" value={analysis.sentences} />
                <Stat label="Syllables" value={analysis.syllables} />
                <Stat label="Characters" value={analysis.characters} />
              </dl>
            </>
          ) : (
            <div className="flex min-h-64 flex-col justify-center">
              <p className="text-sm font-semibold tracking-[0.14em] text-muted uppercase">Your results</p>
              <h3 className="mt-3 text-xl font-semibold text-foreground">Ready when your text is.</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted">Enter English words to calculate Reading Ease, Grade Level, and supporting text statistics.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
