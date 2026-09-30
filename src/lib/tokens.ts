/**
 * Reads a design token (a CSS variable from src/app/globals.css) at run time.
 * For code that cannot use classes, such as drawing on a canvas.
 */
export function readToken(name: `--${string}`): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
