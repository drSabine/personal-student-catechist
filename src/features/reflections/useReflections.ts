"use client";

import { useCallback, useEffect, useState } from "react";
import type { Reflection } from "@/core/reflection/Reflection";
import { reflectionRepository } from "@/core/reflection/repository";

/**
 * The only way components reach reflection storage.
 * Swap the storage in src/core/reflection/repository.ts; nothing here changes.
 */
export function useReflections(lessonId: string) {
  const [loaded, setLoaded] = useState<{ lessonId: string; entries: Reflection[] } | null>(null);
  const [version, setVersion] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    reflectionRepository
      .listByLesson(lessonId)
      .then((entries) => {
        if (!active) return;
        setLoaded({ lessonId, entries });
        setError(null);
      })
      .catch(() => {
        if (active) setError("Could not load reflections.");
      });
    return () => {
      active = false;
    };
  }, [lessonId, version]);

  const save = useCallback(
    async (input: { pupilName: string; content: string }) => {
      const saved = await reflectionRepository.save({ lessonId, ...input });
      setVersion((v) => v + 1);
      return saved;
    },
    [lessonId],
  );

  const remove = useCallback(async (id: string) => {
    await reflectionRepository.delete(id);
    setVersion((v) => v + 1);
  }, []);

  const entries = loaded?.lessonId === lessonId ? loaded.entries : null;
  return { entries, error, save, remove };
}
