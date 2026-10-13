"use client";

import { motion } from "motion/react";
import type { Expression, GiftId, Look } from "./cast";
import { Token } from "./art/Token";

interface SayProps {
  look: Look;
  gift: GiftId;
  face: Expression;
  name: string;
  text: string;
}

/** Someone speaking: their token and a speech bubble. Screen readers hear each new line. */
export function Say({ look, gift, face, name, text }: SayProps) {
  return (
    <div className="flex min-w-0 items-center gap-story-gap">
      <Token look={look} gift={gift} face={face} className="w-strip-token shrink-0" />
      <div className="relative min-w-0 rounded-story border-3 border-ink bg-paper px-story-gap py-[0.4em] shadow-story">
        <p aria-live="polite">
          <span className="sr-only">{name}: </span>
          <motion.span
            key={text}
            className="block text-story font-bold"
            initial={{ opacity: 0, y: "0.3em" }}
            animate={{ opacity: 1, y: 0 }}
          >
            {text}
          </motion.span>
        </p>
      </div>
    </div>
  );
}
