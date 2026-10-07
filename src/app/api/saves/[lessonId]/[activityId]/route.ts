import { getLesson } from "@/content/lessons";
import { readSave, SAVE_LIMIT, type SaveSlot } from "@/core/save/GameSave";
import { getSaveStore } from "../../store";

interface SaveRouteProps {
  params: Promise<{ lessonId: string; activityId: string }>;
}

const noStore = { "Cache-Control": "no-store" };

function fail(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: noStore });
}

/** Only activities that exist can have a save. */
async function slotOf(params: SaveRouteProps["params"]): Promise<SaveSlot | null> {
  const { lessonId, activityId } = await params;
  const lesson = getLesson(lessonId);
  return lesson?.activities.some((activity) => activity.id === activityId) ? { lessonId, activityId } : null;
}

/** The activity's save, or null when there is none yet. */
export async function GET(_request: Request, { params }: SaveRouteProps) {
  const slot = await slotOf(params);
  if (!slot) return fail("Unknown activity.", 404);
  const store = getSaveStore();
  if (!store) return fail("Saving is not set up yet.", 503);

  return Response.json(await store.load(slot), { headers: noStore });
}

/** Replaces the activity's save. */
export async function PUT(request: Request, { params }: SaveRouteProps) {
  const slot = await slotOf(params);
  if (!slot) return fail("Unknown activity.", 404);
  const store = getSaveStore();
  if (!store) return fail("Saving is not set up yet.", 503);

  const text = await request.text();
  // The save's own limit plus room for its wrapper.
  if (text.length > SAVE_LIMIT * 2) return fail("That save is too big.", 413);
  const save = readSave(text);
  if (!save) return fail("That save did not look right.", 400);

  await store.save(slot, save);
  return new Response(null, { status: 204, headers: noStore });
}
