import type { CSSProperties } from "react";

interface PortraitProps {
  sheet: string;
  rows: Record<string, number> | null;
  sprite: string;
}

/** A speaker's face, cut from the people sheet. */
export function Portrait({ sheet, rows, sprite }: PortraitProps) {
  const row = rows?.[sprite];
  if (rows === null || row === undefined) return null;
  const style = {
    backgroundImage: `url(${sheet})`,
    "--row": row,
    "--rows": Object.keys(rows).length,
  } as CSSProperties;
  return <div aria-hidden className="portrait size-portrait shrink-0 rounded-xl bg-wash" style={style} />;
}
