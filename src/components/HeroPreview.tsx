type HeroPreviewProps = {
  foreground: string | null;
  background: string | null;
  ratio: number | null;
};

export function HeroPreview({ foreground, background, ratio }: HeroPreviewProps) {
  const hasValidColors = foreground !== null && background !== null && ratio !== null;

  return (
    <aside aria-label="Current contrast summary" className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-foreground">Current pairing</p>
        <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted">Live</span>
      </div>

      {hasValidColors ? (
        <>
          <div className="mt-5 overflow-hidden rounded-xl border border-border" style={{ backgroundColor: background, color: foreground }}>
            <div className="flex min-h-28 items-end justify-between p-5">
              <span className="text-xl font-semibold tracking-tight">Aa</span>
              <span className="font-mono text-sm opacity-80">{ratio.toFixed(2)} : 1</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4 text-xs font-medium text-muted">
            <span>{foreground.toUpperCase()}</span>
            <span aria-hidden="true">over</span>
            <span>{background.toUpperCase()}</span>
          </div>
        </>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-border bg-background p-5 text-sm leading-6 text-muted">
          Enter two valid colors to preview the current pairing.
        </div>
      )}
    </aside>
  );
}
