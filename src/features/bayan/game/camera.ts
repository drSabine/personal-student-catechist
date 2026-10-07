export interface Size {
  width: number;
  height: number;
}

export interface CameraPlan {
  zoom: number;
  /** True when the map is too big to show whole at a readable size, so the camera follows the pupil. */
  follow: boolean;
}

/**
 * How far to zoom so the whole map fits the view. Sizes are in device pixels; `ratio` is the
 * device pixel ratio and `minTile` the smallest readable tile in CSS pixels.
 */
export function planCamera(view: Size, world: Size, tileSize: number, ratio: number, minTile: number): CameraPlan {
  const fit = Math.min(view.width / world.width, view.height / world.height);
  if ((fit * tileSize) / ratio < minTile) {
    return { zoom: Math.ceil((minTile * ratio) / tileSize), follow: true };
  }
  // A whole-number zoom keeps every pixel the same size. Below 2 that would shrink the map too much.
  return { zoom: fit >= 2 ? Math.floor(fit) : fit, follow: false };
}
