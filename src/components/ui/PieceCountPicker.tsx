"use client";

import { Segmented } from "./Segmented";

interface PieceCountPickerProps {
  counts: readonly number[];
  value: number;
  onChange: (count: number) => void;
}

export function PieceCountPicker({ counts, value, onChange }: PieceCountPickerProps) {
  return (
    <Segmented
      label="Number of pieces"
      options={counts.map((count) => ({ value: count, label: String(count) }))}
      value={value}
      onChange={onChange}
    />
  );
}
