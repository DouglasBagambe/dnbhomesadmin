"use client";
import { useCallback, useEffect, useState } from "react";
import { api, ApiPage, queryString } from "../lib/api";
import { friendlyError } from "../lib/presentation.mjs";
export function useQueue<T>(
  endpoint: string,
  filters: Record<string, string | number>,
) {
  const [result, setResult] = useState<ApiPage<T>>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const query = queryString(filters);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) {
        setLoading(true);
        setError("");
      }
    });
    api<ApiPage<T>>(`${endpoint}${query}`, { signal: controller.signal })
      .then((value) => {
        if (!controller.signal.aborted) setResult(value);
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(friendlyError(e));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [endpoint, query, revision]);
  return { result, error, loading, reload };
}
