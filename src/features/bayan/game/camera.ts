export interface Size {
  width: number;
  height: number;
}

export interface CameraPlan {
  zoom: number;
  /** True when the focus is too big to show whole at a readable size, so the camera follows the pupil. */
  follow: boolean;
}

/**
 * How far to zoom so the focus (the town) fits the view. Sizes are in device pixels; `ratio` is the
 * device pixel ratio and `minTile` the smallest readable tile in CSS pixels. With `world`, the zoom
 * never drops below what covers the view with the world, so no backdrop shows past its edge.
 */
export function planCamera(view: Size, focus: Size, tileSize: number, ratio: number, minTile: number, world?: Size): CameraPlan {
  const cover = world ? Math.max(view.width / world.width, view.height / world.height) : 0;
  const fit = Math.min(view.width / focus.width, view.height / focus.height);
  if ((fit * tileSize) / ratio < minTile) {
    return { zoom: Math.max(Math.ceil((minTile * ratio) / tileSize), cover), follow: true };
  }
  // A whole-number zoom keeps every pixel the same size. Below 2 that would shrink the map too much.
  const zoom = fit >= 2 ? Math.floor(fit) : fit;
  return { zoom: Math.max(zoom, cover), follow: false };
}
