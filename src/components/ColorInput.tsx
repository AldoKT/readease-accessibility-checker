type ColorInputProps = {
  id: string;
  label: string;
  value: string;
  colorValue: string;
  isValid: boolean;
  onChange: (value: string) => void;
};

export function ColorInput({ id, label, value, colorValue, isValid, onChange }: ColorInputProps) {
  const helpId = `${id}-help`;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <label className="text-sm font-semibold text-foreground" htmlFor={id}>{label}</label>
        <span className="text-xs text-muted">HEX color</span>
      </div>
      <div className="flex items-center gap-3">
        <input
          aria-label={`Choose ${label.toLowerCase()} with a color picker`}
          className="h-12 w-14 shrink-0 cursor-pointer rounded-lg border border-muted bg-surface p-1 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          onChange={(event) => onChange(event.target.value)}
          type="color"
          value={colorValue}
        />
        <input
          aria-describedby={helpId}
          aria-invalid={!isValid}
          autoCapitalize="characters"
          className="h-12 min-w-0 flex-1 rounded-lg border border-muted bg-background px-3 font-mono text-base text-foreground shadow-sm focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          id={id}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          type="text"
          value={value}
        />
      </div>
      <p className={isValid ? "text-sm text-muted" : "text-sm font-medium text-red-700"} id={helpId}>
        {isValid ? "Use a 3- or 6-digit hexadecimal color." : "Enter a valid 3- or 6-digit hexadecimal color, such as #123 or #112233."}
      </p>
    </div>
  );
}
