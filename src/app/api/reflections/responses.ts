export function fail(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

/** The server has no storage configured. */
export function unavailable() {
  return fail("Reflections are not set up yet. Ask your teacher.", 503);
}
