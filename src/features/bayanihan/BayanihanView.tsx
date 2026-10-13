"use client";

import dynamic from "next/dynamic";
import type { ActivityViewProps } from "@/core/activity/ActivityRegistry";
import type { BayanihanActivity } from "./BayanihanActivity";

// The save needs the browser, so the game never renders on the server.
const BayanihanPlay = dynamic(() => import("./BayanihanPlay").then((module) => module.BayanihanPlay), {
  ssr: false,
  loading: () => <p className="flex flex-1 items-center justify-center text-muted">Loading the game</p>,
});

/** Stage 1, Bayanihan Tayo! */
export function BayanihanView({ activity, lesson }: ActivityViewProps<BayanihanActivity>) {
  return <BayanihanPlay activity={activity} lessonId={lesson.id} />;
}
