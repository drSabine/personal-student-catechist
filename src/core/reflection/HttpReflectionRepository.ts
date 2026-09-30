import { cleanReflection, type NewReflection, type Reflection } from "./Reflection";
import type { ReflectionRepository } from "./ReflectionRepository";

/** A reflection as the API sends it: the date is text. */
type ReflectionJson = Omit<Reflection, "createdAt"> & { createdAt: string };

const FAILED = "Could not reach the server. Please try again.";

/** Browser side. Every device shares one list through the reflections API. */
export class HttpReflectionRepository implements ReflectionRepository {
  constructor(
    private readonly baseUrl = "/api/reflections",
    private readonly send: typeof fetch = (input, init) => fetch(input, init),
  ) {}

  async save(input: NewReflection): Promise<Reflection> {
    const clean = cleanReflection(input);
    const response = await this.request(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clean),
    });
    return revive((await response.json()) as ReflectionJson);
  }

  async listByLesson(lessonId: string): Promise<Reflection[]> {
    const response = await this.request(`${this.baseUrl}?lessonId=${encodeURIComponent(lessonId)}`, {
      cache: "no-store",
    });
    return ((await response.json()) as ReflectionJson[]).map(revive);
  }

  async delete(id: string): Promise<void> {
    await this.request(`${this.baseUrl}/${encodeURIComponent(id)}`, { method: "DELETE" });
  }

  /** Any failure becomes an Error with a message a pupil can read. */
  private async request(url: string, init: RequestInit): Promise<Response> {
    let response: Response;
    try {
      response = await this.send(url, init);
    } catch {
      throw new Error(FAILED);
    }
    if (!response.ok) throw new Error(await errorMessage(response));
    return response;
  }
}

function revive(json: ReflectionJson): Reflection {
  return { ...json, createdAt: new Date(json.createdAt) };
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const { error } = (await response.json()) as { error?: unknown };
    if (typeof error === "string" && error) return error;
  } catch {
    // Not JSON: use the general message.
  }
  return FAILED;
}
