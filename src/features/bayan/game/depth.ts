/**
 * What draws over what, bottom to top. People sort among themselves by how low they stand, within
 * `people` and the next whole number, so a vehicle on the road sorts with them the same way.
 */
export const DEPTH = {
  ground: 0,
  hoverTile: 9,
  people: 10,
  scaffold: 30,
  dust: 40,
  confetti: 45,
  /** Tree tops and banderitas, over the people. */
  above: 50,
  marker: 52,
  arrow: 53,
  bump: 54,
} as const;

/** A person's or vehicle's depth from the bottom of their sprite, in world pixels. */
export function standingDepth(bottom: number): number {
  return DEPTH.people + bottom / 1000;
}
