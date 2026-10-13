import type { SceneId } from "../content";
import { brigada } from "./brigada";
import { classroom } from "./classroom";
import { parish } from "./parish";
import type { SceneArt } from "./types";

/** Every scene's art. A new scenario adds one line here and its entry in the lesson's content. */
export const SCENES: Readonly<Record<SceneId, SceneArt>> = { brigada, classroom, parish };
