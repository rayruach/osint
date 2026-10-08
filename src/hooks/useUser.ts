"use client";

import { useState, useEffect } from "react";
import type { User } from "@/types";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const refresh = async () => {
    const r = await fetch("/api/auth/me");
    const data = await r.json();
    setUser(data.user ?? null);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  return { user, loading, refresh, logout };
}
