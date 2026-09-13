type PreviewPanelProps = { foreground: string | null; background: string | null };

export function PreviewPanel({ foreground, background }: PreviewPanelProps) {
  const colorsAreValid = foreground !== null && background !== null;

  return (
    <section aria-labelledby="preview-heading" className="mt-16">
      <div className="mb-6 max-w-2xl">
        <p className="text-sm font-semibold tracking-wide text-muted uppercase">Live preview</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground" id="preview-heading">See the colors in context.</h2>
        <p className="mt-2 leading-7 text-muted">Compare different text sizes before using this color pairing in an interface.</p>
      </div>
      {colorsAreValid ? (
        <article className="rounded-2xl border border-border p-6 shadow-sm sm:p-10" style={{ backgroundColor: background, color: foreground }}>
          <p className="text-xs font-semibold tracking-wide uppercase opacity-75">Small text</p>
          <p className="mt-2 text-sm leading-6 opacity-90">The quick brown fox jumps over the lazy dog.</p>
          <p className="mt-8 text-sm font-semibold tracking-wide uppercase opacity-75">Body text</p>
          <p className="mt-2 max-w-2xl text-base leading-7">The quick brown fox jumps over the lazy dog. Clear contrast supports people reading in varied conditions and on different screens.</p>
          <p className="mt-8 text-sm font-semibold tracking-wide uppercase opacity-75">Large text</p>
          <p className="mt-2 text-2xl leading-8">Design for everyone.</p>
          <h3 className="mt-8 text-4xl font-semibold tracking-tight">Design for everyone.</h3>
        </article>
      ) : <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-muted">The live preview will appear when both colors are valid.</div>}
    </section>
  );
}
