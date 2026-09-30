import { unavailable } from "../responses";
import { getStore } from "../store";

/** Removes one reflection. Removing one that is already gone is fine. */
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const store = getStore();
  if (!store) return unavailable();

  const { id } = await context.params;
  await store.delete(id);
  return new Response(null, { status: 204 });
}
