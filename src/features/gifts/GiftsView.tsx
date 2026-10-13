"use client";

import dynamic from "next/dynamic";
import type { ActivityViewProps } from "@/core/activity/ActivityRegistry";
import type { GiftsActivity } from "./GiftsActivity";

// The save needs the browser, so the game never renders on the server.
const GiftsPlay = dynamic(() => import("./GiftsPlay").then((module) => module.GiftsPlay), {
  ssr: false,
  loading: () => <p className="flex flex-1 items-center justify-center text-muted">Loading the game</p>,
});

/** Stage 2, Gifts for Our Barangay. */
export function GiftsView({ activity, lesson }: ActivityViewProps<GiftsActivity>) {
  return <GiftsPlay activity={activity} lessonId={lesson.id} />;
}
