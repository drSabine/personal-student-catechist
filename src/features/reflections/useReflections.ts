"use client";

import { useCallback, useEffect, useState } from "react";
import type { Reflection } from "@/core/reflection/Reflection";
import { reflectionRepository } from "@/core/reflection/repository";

const REFRESH_MS = 15_000;

interface Options {
  /** Load the lesson's list and keep it fresh. Leave off where only saving is needed. */
  list?: boolean;
}

/** The only way components reach reflection storage. */
export function useReflections(lessonId: string, { list = false }: Options = {}) {
  const [loaded, setLoaded] = useState<{ lessonId: string; entries: Reflection[] } | null>(null);
  const [version, setVersion] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!list) return;
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
  }, [list, lessonId, version]);

  useEffect(() => {
    if (!list) return;
    const check = () => {
      if (document.visibilityState === "visible") setVersion((v) => v + 1);
    };
    const timer = window.setInterval(check, REFRESH_MS);
    document.addEventListener("visibilitychange", check);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
    };
  }, [list]);

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
  // A failed refresh keeps the list on screen and tries again; only a first load shows the error.
  return { entries, error: entries ? null : error, save, remove };
}
