interface PageHeadingProps {
  eyebrow: string;
  title: string;
  intro?: string;
}

/** Lowercase pixel heading with a short line under it. */
export function PageHeading({ eyebrow, title, intro }: PageHeadingProps) {
  return (
    <header className="mb-8">
      <p className="text-xs uppercase tracking-label text-muted">{eyebrow}</p>
      <h1 className="pixel mt-2 text-display lowercase">{title}</h1>
      {intro && <p className="mt-2 max-w-xl text-muted">{intro}</p>}
    </header>
  );
}
