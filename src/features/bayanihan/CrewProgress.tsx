"use client";

import { Star } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { giftColor, type WorkerGift } from "@/features/storybook/cast";
import { INK } from "@/features/storybook/art/paper";

interface CrewProgressProps {
  /** Places finished, one star each. */
  done: number;
  total: number;
  /** The place on screen. */
  title: string;
  /** Jobs given in this place, as pips in each gift's color. */
  gifts: readonly WorkerGift[];
  placed: readonly WorkerGift[];
  label: string;
}

/** How far the crew has come: a star for each place finished, and a pip for each job given here. */
export function CrewProgress({ done, total, title, gifts, placed, label }: CrewProgressProps) {
  return (
    <div
      className="order-first flex min-h-11 shrink-0 flex-col items-start gap-1 pr-corner @3xl:order-none @3xl:items-center @3xl:pr-0"
      aria-label={label.replace("{done}", String(done)).replace("{total}", String(total))}
    >
      <div className="flex gap-1" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <motion.span
            key={`${i}-${i < done}`}
            className="block size-progress"
            initial={i < done ? { scale: 0, rotate: -90 } : false}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 12 }}
          >
            <Star weight={i < done ? "fill" : "bold"} color={i < done ? "var(--color-gold)" : INK} className="size-full" />
          </motion.span>
        ))}
      </div>
      <p className="font-story text-story-small font-bold leading-none">{title}</p>
      <div className="flex gap-1" aria-hidden>
        {gifts.map((gift) => (
          <motion.span
            key={gift}
            className="block size-pip rounded-full border-2 border-ink"
            animate={{
              backgroundColor: placed.includes(gift) ? giftColor(gift) : "var(--color-paper)",
              scale: placed.includes(gift) ? [1.5, 1] : 1,
            }}
          />
        ))}
      </div>
    </div>
  );
}
