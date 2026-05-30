"use client";

import { useState } from "react";
import { useAuth } from "@/app/auth-provider";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export function AuthStatus() {
  const { accessLevel, isLoading, user } = useAuth();
  const [error, setError] = useState("");

  const displayName =
    getStringMetadata(user?.user_metadata?.full_name) ||
    getStringMetadata(user?.user_metadata?.name) ||
    user?.email ||
    "Usuario registrado";
  const avatarUrl = getStringMetadata(user?.user_metadata?.avatar_url);

  async function signInWithGoogle() {
    setError("");

    if (!supabase) {
      setError("Configura Supabase para iniciar sesion.");
      return;
    }

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (authError) {
      setError("No se pudo iniciar sesion con Google.");
    }
  }

  async function signOut() {
    setError("");

    if (!supabase) {
      return;
    }

    const { error: authError } = await supabase.auth.signOut();

    if (authError) {
      setError("No se pudo cerrar la sesion.");
    }
  }

  if (isLoading) {
    return (
      <div className="hidden h-10 min-w-36 rounded-full border border-white/10 bg-[#15151D] sm:block" />
    );
  }

  if (user) {
    return (
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-[#15151D] py-1.5 pl-2 pr-3">
          <div
            className="h-8 w-8 rounded-full border border-white/10 bg-[#7B3FE4] bg-cover bg-center"
            style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
            aria-hidden="true"
          />
          <div className="hidden min-w-0 sm:block">
            <p className="max-w-40 truncate text-xs font-semibold text-white">
              {displayName}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#C7A8FF]">
              {accessLevel === "verified" ? "Verificado" : "Registrado"}
            </p>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="text-xs font-semibold text-zinc-400 transition hover:text-white"
          >
            Salir
          </button>
        </div>
        {error && <p className="max-w-56 text-right text-xs text-red-200">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={!isSupabaseConfigured()}
        className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#7B3FE4]/45 px-4 py-2 text-xs font-semibold text-white transition hover:border-[#9F6BFF] hover:bg-[#1A1A22] disabled:cursor-not-allowed disabled:opacity-60"
      >
        Continuar con Google
      </button>
      {error && <p className="max-w-56 text-right text-xs text-red-200">{error}</p>}
    </div>
  );
}

function getStringMetadata(value: unknown) {
  return typeof value === "string" ? value : "";
}
