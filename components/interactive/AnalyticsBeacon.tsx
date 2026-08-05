"use client";

import { useEffect } from "react";

/**
 * Fire-and-forget page-view beacon. Ported verbatim from the old client
 * home page so the server page can stay a server component. Renders nothing.
 */
export default function AnalyticsBeacon({ page = "/" }: { page?: string }) {
  useEffect(() => {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page }),
    }).catch(() => {});
  }, [page]);

  return null;
}
