/** Which way each edge of a piece bulges: 1 out, -1 in, 0 straight (the picture's border). */
interface Edges {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Neighbors always fit: where one piece bulges out, the next bulges in. The pattern alternates like
 * a checkerboard so no two pieces look alike.
 */
export function edgesOf(col: number, row: number, cols: number, rows: number): Edges {
  const vertical = (c: number) => ((c + row) % 2 === 0 ? 1 : -1);
  const horizontal = (r: number) => ((col + r) % 2 === 0 ? -1 : 1);
  return {
    top: row === 0 ? 0 : -horizontal(row - 1),
    right: col === cols - 1 ? 0 : vertical(col),
    bottom: row === rows - 1 ? 0 : horizontal(row),
    left: col === 0 ? 0 : -vertical(col - 1),
  };
}

interface Point {
  x: number;
  y: number;
}

/** One edge from a to b, with a round tab bulging to the outside (the left of travel, clockwise). */
function edge(a: Point, b: Point, bulge: number): string {
  const length = Math.hypot(b.x - a.x, b.y - a.y);
  const along = { x: (b.x - a.x) / length, y: (b.y - a.y) / length };
  const out = { x: along.y, y: -along.x };
  const at = (t: number, k: number) => {
    const x = a.x + along.x * length * t + out.x * length * k * bulge;
    const y = a.y + along.y * length * t + out.y * length * k * bulge;
    return `${x.toFixed(1)} ${y.toFixed(1)}`;
  };
  if (bulge === 0) return `L${at(1, 0)}`;
  return [
    `L${at(0.36, 0)}`,
    `C${at(0.42, 0.02)} ${at(0.3, 0.24)} ${at(0.5, 0.24)}`,
    `C${at(0.7, 0.24)} ${at(0.58, 0.02)} ${at(0.64, 0)}`,
    `L${at(1, 0)}`,
  ].join(" ");
}

/** The outline of the piece at col, row, in the picture's own units. */
export function piecePath(col: number, row: number, cols: number, rows: number, width: number, height: number): string {
  const w = width / cols;
  const h = height / rows;
  const x = col * w;
  const y = row * h;
  const edges = edgesOf(col, row, cols, rows);
  const corners = [
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y + h },
    { x, y: y + h },
  ];
  return [
    `M${corners[0].x} ${corners[0].y}`,
    edge(corners[0], corners[1], edges.top),
    edge(corners[1], corners[2], edges.right),
    edge(corners[2], corners[3], edges.bottom),
    edge(corners[3], corners[0], edges.left),
    "Z",
  ].join(" ");
}
