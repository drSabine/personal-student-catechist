/**
 * Quiet dot grid for a top corner. Dots shrink away from the corner,
 * which fades the pattern without a gradient.
 */
export function DotCorner({ className = "" }: { className?: string }) {
  const cols = 22;
  const rows = 12;
  const gap = 12;
  const dots: { x: number; y: number; r: number }[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Distance from the top right corner, 0 near it and 1 far away.
      const far = Math.hypot((cols - 1 - col) / cols, row / rows) / Math.SQRT2;
      const r = 1.3 * (1 - far * 1.25);
      if (r > 0.25) dots.push({ x: col * gap + gap / 2, y: row * gap + gap / 2, r });
    }
  }
  return (
    <svg
      aria-hidden
      width={cols * gap}
      height={rows * gap}
      viewBox={`0 0 ${cols * gap} ${rows * gap}`}
      className={`pointer-events-none text-ink/15 ${className}`}
    >
      {dots.map((dot) => (
        <circle key={`${dot.x}-${dot.y}`} cx={dot.x} cy={dot.y} r={dot.r.toFixed(2)} fill="currentColor" />
      ))}
    </svg>
  );
}
