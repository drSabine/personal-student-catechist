import { getLesson } from "@/content/lessons";
import { cleanReflection, type NewReflection } from "@/core/reflection/Reflection";
import { fail, unavailable } from "./responses";
import { getStore } from "./store";

/** A lesson's reflections, newest first. */
export async function GET(request: Request) {
  const lessonId = new URL(request.url).searchParams.get("lessonId") ?? "";
  if (!getLesson(lessonId)) return fail("Unknown lesson.", 404);

  const store = getStore();
  if (!store) return unavailable();
  return Response.json(await store.listByLesson(lessonId), { headers: { "Cache-Control": "no-store" } });
}

/** Saves one reflection, checked again on the server. */
export async function POST(request: Request) {
  const input = await readInput(request);
  if (!input) return fail("That did not look right.", 400);
  if (!getLesson(input.lessonId)) return fail("Unknown lesson.", 404);

  let clean: NewReflection;
  try {
    clean = cleanReflection(input);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "That did not look right.", 400);
  }

  const store = getStore();
  if (!store) return unavailable();
  return Response.json(await store.save(clean), { status: 201 });
}

async function readInput(request: Request): Promise<NewReflection | null> {
  try {
    const { lessonId, pupilName, content } = (await request.json()) as Record<string, unknown>;
    if (typeof lessonId === "string" && typeof pupilName === "string" && typeof content === "string") {
      return { lessonId, pupilName, content };
    }
  } catch {
    // Not JSON.
  }
  return null;
}
