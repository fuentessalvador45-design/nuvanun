"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type UserAccessLevel = "guest" | "registered" | "verified";

type AuthState = {
  accessLevel: UserAccessLevel;
  isLoading: boolean;
  session: Session | null;
  user: User | null;
};

const AuthContext = createContext<AuthState>({
  accessLevel: "guest",
  isLoading: true,
  session: null,
  user: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }

      setSession(data.session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(() => {
    const user = session?.user ?? null;

    return {
      accessLevel: getUserAccessLevel(user),
      isLoading,
      session,
      user,
    };
  }, [isLoading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

function getUserAccessLevel(user: User | null): UserAccessLevel {
  if (!user) {
    return "guest";
  }

  if (user.user_metadata?.verified === true) {
    return "verified";
  }

  return "registered";
}
