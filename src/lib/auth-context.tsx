"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import type { Profile, Creator, Brand } from "@/types";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  creator: Creator | null;
  brand: Brand | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  creator: null,
  brand: null,
  loading: true,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  async function loadAuthAndProfile() {
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        setUser(null);
        setProfile(null);
        setCreator(null);
        setBrand(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);

      // Fetch profile, creator, and brand records concurrently in parallel
      const [profRes, creatorRes, brandRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", currentUser.id).maybeSingle(),
        supabase.from("creators").select("*").eq("id", currentUser.id).maybeSingle(),
        supabase.from("brands").select("*").eq("id", currentUser.id).maybeSingle(),
      ]);

      if (profRes.data) setProfile(profRes.data);
      if (creatorRes.data) setCreator(creatorRes.data);
      if (brandRes.data) setBrand(brandRes.data);
    } catch {
      // Handle potential fetch errors gracefully
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAuthAndProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        if (event === "SIGNED_IN") {
          loadAuthAndProfile();
        }
      } else {
        setUser(null);
        setProfile(null);
        setCreator(null);
        setBrand(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        creator,
        brand,
        loading,
        refreshProfile: loadAuthAndProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
