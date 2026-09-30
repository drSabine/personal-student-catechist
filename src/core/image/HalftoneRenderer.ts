import type { PieceBounds } from "./ImageSlicer";

export interface HalftoneStyle {
  ink: string;
  paper: string;
  /** Dot cells across the whole photo. */
  cells: number;
}

/** Raw RGBA pixels, the shape of the browser's ImageData. */
export interface PixelSource {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

/** Width and height of the coordinate space pieces are given in. */
export interface Size {
  width: number;
  height: number;
}

/**
 * Draws parts of a photo as halftone dots. The cell grid covers the whole photo, so neighbouring
 * pieces line up. The pixels can be a small copy of the photo; pieces stay in the photo's own size.
 */
export class HalftoneRenderer {
  /** Photo size: the space piece bounds are measured in. */
  private readonly width: number;
  private readonly height: number;
  /** Size of the sampled pixels. */
  private readonly sampleWidth: number;
  private readonly sampleHeight: number;
  /** Summed-area table of darkness (0 white, 1 black), size (w+1)*(h+1) of the samples. */
  private readonly darknessSums: Float32Array;
  /** Darkness that should print as full ink. Light photos get a lower value, so they still show. */
  private readonly blackPoint: number;

  constructor(source: PixelSource, photo: Size = source) {
    this.width = photo.width;
    this.height = photo.height;
    this.sampleWidth = source.width;
    this.sampleHeight = source.height;
    this.darknessSums = buildDarknessSums(source);
    this.blackPoint = findBlackPoint(source);
  }

  /** Draws one piece to fill destWidth by destHeight. The context is already scaled for the pixel ratio. */
  renderPiece(
    ctx: CanvasRenderingContext2D,
    piece: PieceBounds,
    destWidth: number,
    destHeight: number,
    style: HalftoneStyle,
  ): void {
    const scaleX = destWidth / piece.width;
    const scaleY = destHeight / piece.height;
    const cell = this.width / style.cells;

    ctx.save();
    ctx.fillStyle = style.paper;
    ctx.fillRect(0, 0, destWidth, destHeight);
    ctx.beginPath();
    ctx.rect(0, 0, destWidth, destHeight);
    ctx.clip();

    const firstCol = Math.floor(piece.x / cell);
    const lastCol = Math.ceil((piece.x + piece.width) / cell);
    const firstRow = Math.floor(piece.y / cell);
    const lastRow = Math.ceil((piece.y + piece.height) / cell);

    ctx.fillStyle = style.ink;
    ctx.beginPath();

    for (let row = firstRow; row < lastRow; row++) {
      for (let col = firstCol; col < lastCol; col++) {
        const sx = col * cell;
        const sy = row * cell;
        const darkness = this.tone(this.averageDarkness(sx, sy, sx + cell, sy + cell));
        const dx = (sx - piece.x) * scaleX;
        const dy = (sy - piece.y) * scaleY;
        const dw = cell * scaleX;
        const dh = cell * scaleY;

        if (darkness < 0.06) continue;
        const radius = (Math.min(dw, dh) / 2) * Math.sqrt(darkness) * 1.12;
        ctx.moveTo(dx + dw / 2 + radius, dy + dh / 2);
        ctx.arc(dx + dw / 2, dy + dh / 2, radius, 0, Math.PI * 2);
      }
    }

    ctx.fill();
    ctx.restore();
  }

  /** Stretches darkness so the darkest part of the photo prints as full ink. */
  private tone(darkness: number): number {
    return Math.pow(Math.min(1, darkness / this.blackPoint), 0.85);
  }

  /** Average darkness (0 to 1) of a rectangle in photo pixels. */
  averageDarkness(x0: number, y0: number, x1: number, y1: number): number {
    const sx = this.sampleWidth / this.width;
    const sy = this.sampleHeight / this.height;
    const left = clamp(Math.floor(x0 * sx), 0, this.sampleWidth);
    const top = clamp(Math.floor(y0 * sy), 0, this.sampleHeight);
    const right = clamp(Math.ceil(x1 * sx), 0, this.sampleWidth);
    const bottom = clamp(Math.ceil(y1 * sy), 0, this.sampleHeight);
    const area = (right - left) * (bottom - top);
    if (area <= 0) return 0;

    const stride = this.sampleWidth + 1;
    const s = this.darknessSums;
    const total =
      s[bottom * stride + right] - s[top * stride + right] - s[bottom * stride + left] + s[top * stride + left];
    return total / area;
  }
}

function buildDarknessSums({ width, height, data }: PixelSource): Float32Array {
  const stride = width + 1;
  const sums = new Float32Array(stride * (height + 1));
  for (let y = 0; y < height; y++) {
    let rowSum = 0;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const alpha = data[i + 3] / 255;
      // Rec. 709 luminance; transparent pixels count as white paper.
      const luminance = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
      rowSum += (1 - luminance) * alpha;
      sums[(y + 1) * stride + (x + 1)] = sums[y * stride + (x + 1)] + rowSum;
    }
  }
  return sums;
}

/** The 99th percentile of pixel darkness, with a floor so noise is not blown up. */
function findBlackPoint({ width, height, data }: PixelSource): number {
  const bins = new Uint32Array(256);
  for (let i = 0; i < width * height * 4; i += 4) {
    const luminance = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    bins[255 - Math.round(luminance)]++;
  }
  let seen = 0;
  const target = width * height * 0.99;
  for (let level = 0; level < 256; level++) {
    seen += bins[level];
    if (seen >= target) return Math.max(0.35, level / 255);
  }
  return 1;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
