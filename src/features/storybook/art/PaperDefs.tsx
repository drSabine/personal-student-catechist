import { memo } from "react";

/** A fixed scatter of fibers for the grain, made once, so every render draws the same paper. */
const FIBERS = (() => {
  let seed = 7;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: 70 }, () => ({
    // Whole numbers, so the server and the browser write the same markup.
    x: Math.round(random() * 180),
    y: Math.round(random() * 180),
    length: Math.round(2 + random() * 6),
    angle: Math.round(random() * 180),
    dot: random() < 0.45,
  }));
})();

/**
 * The paper's shared pieces, drawn once per game: the cut-out shadow filter that static layers use,
 * and the grain pattern laid over the whole scene.
 */
export const PaperDefs = memo(function PaperDefs() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <defs>
        <filter id="paper-cut" x="-5%" y="-5%" width="115%" height="120%">
          <feDropShadow dx="3" dy="5" stdDeviation="2" style={{ floodColor: "var(--paper-shadow)" }} />
        </filter>
        <pattern id="paper-grain" width="180" height="180" patternUnits="userSpaceOnUse">
          {FIBERS.map((fiber, i) =>
            fiber.dot ? (
              <circle key={i} cx={fiber.x} cy={fiber.y} r={fiber.length / 6} fill="var(--paper-grain)" />
            ) : (
              <line
                key={i}
                x1={fiber.x}
                y1={fiber.y}
                x2={fiber.x + fiber.length}
                y2={fiber.y}
                transform={`rotate(${fiber.angle} ${fiber.x} ${fiber.y})`}
                stroke="var(--paper-grain)"
                strokeWidth="0.8"
                strokeLinecap="round"
              />
            ),
          )}
        </pattern>
      </defs>
    </svg>
  );
});

/** The grain laid over a whole scene. It never takes a tap. */
export const PaperGrain = memo(function PaperGrain() {
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 size-full">
      <rect width="100%" height="100%" fill="url(#paper-grain)" />
    </svg>
  );
});
