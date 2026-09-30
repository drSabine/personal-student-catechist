"use client";

import { useEffect, useState } from "react";
import { HalftoneRenderer, type Size } from "@/core/image/HalftoneRenderer";

/** Samples per dot, across. Four is plenty for a smooth average and keeps memory small. */
const SAMPLES_PER_CELL = 4;

interface Entry {
  promise: Promise<HalftoneRenderer>;
  users: number;
}

/** Shared while any wall is on screen, dropped when the last one leaves. */
const entries = new Map<string, Entry>();

async function load(src: string, photo: Size, cells: number): Promise<HalftoneRenderer> {
  const image = new Image();
  image.decoding = "async";
  image.src = src;
  await image.decode();

  const width = Math.min(image.naturalWidth, cells * SAMPLES_PER_CELL);
  const height = Math.max(1, Math.round((width * image.naturalHeight) / image.naturalWidth));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is not available.");
  ctx.drawImage(image, 0, 0, width, height);
  const pixels = ctx.getImageData(0, 0, width, height);
  // Let the browser free the scratch canvas right away.
  canvas.width = 0;
  canvas.height = 0;
  return new HalftoneRenderer(pixels, photo);
}

function acquire(key: string, create: () => Promise<HalftoneRenderer>): Promise<HalftoneRenderer> {
  let entry = entries.get(key);
  if (!entry) {
    entry = { promise: create(), users: 0 };
    entries.set(key, entry);
    entry.promise.catch(() => entries.delete(key));
  }
  entry.users += 1;
  return entry.promise;
}

function release(key: string): void {
  const entry = entries.get(key);
  if (entry && --entry.users <= 0) entries.delete(key);
}

/**
 * Loads the photo once, samples it at the size the dots need,
 * and gives back a renderer for its pieces. Memory is released on unmount.
 */
export function useHalftoneRenderer(src: string, photo: Size, cells: number): HalftoneRenderer | null {
  const [loaded, setLoaded] = useState<{ key: string; renderer: HalftoneRenderer } | null>(null);
  const { width, height } = photo;
  const key = `${src}@${cells}`;

  useEffect(() => {
    let mounted = true;
    acquire(key, () => load(src, { width, height }, cells))
      .then((renderer) => {
        if (mounted) setLoaded({ key, renderer });
      })
      .catch(() => {
        // Leave slots blank if the photo cannot load; the wall still works.
      });
    return () => {
      mounted = false;
      release(key);
    };
  }, [key, src, width, height, cells]);

  return loaded?.key === key ? loaded.renderer : null;
}
