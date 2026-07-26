"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  FileText,
  Settings,
  LogOut,
  User,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { signOut } from "@/lib/auth-actions";
import type { Profile } from "@/types";

export function CreatorNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (data) {
          setProfile(data);
        }
      }
    }

    loadProfile();
  }, [supabase]);

  const navLinks = [
    { href: "/creator/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/campaigns", label: "Briefs", icon: Megaphone },
    { href: "/contracts", label: "Contracts", icon: FileText },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "C";

  async function handleSignOut() {
    try {
      setDropdownOpen(false);
      await supabase.auth.signOut();
      await signOut();
    } catch {
      window.location.href = "/";
    }
  }

  return (
    <>
      {/* Top App Header */}
      <header className="sticky top-0 z-40 border-b border-surface-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo & Studio Tag */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/creator/dashboard" className="flex items-center gap-2 shrink-0">
              <Image
                src="/icon.png"
                alt="ElAura"
                width={26}
                height={26}
                className="rounded-lg shadow-xs sm:w-7 sm:h-7"
              />
              <span className="font-black text-lg sm:text-xl tracking-tight text-surface-900">
                ElAura
              </span>
              <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-brand-700 border border-brand-100">
                Studio
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-brand-50 text-brand-700 font-bold"
                        : "text-surface-600 hover:text-surface-900 hover:bg-surface-100/70"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? "text-brand-600" : "text-surface-400"}`} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Actions & Avatar */}
          <div className="flex items-center gap-2.5">
            {profile?.user_name && (
              <a
                href={`/${profile.user_name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl border border-surface-200 bg-surface-50 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-surface-700 hover:bg-surface-100 transition-colors min-h-[38px]"
              >
                <ExternalLink className="h-3.5 w-3.5 text-surface-500" />
                <span className="hidden xs:inline">Storefront</span>
              </a>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 rounded-full p-1 border border-surface-200 hover:border-brand-300 transition-all focus:outline-none min-h-[40px] min-w-[40px] justify-center"
              >
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name || "Profile"}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                    {initials}
                  </div>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl border border-surface-200 z-50 space-y-1">
                  <div className="px-3 py-2 border-b border-surface-100">
                    <p className="text-xs font-bold text-surface-900 truncate">
                      {profile?.full_name || "Creator"}
                    </p>
                    <p className="text-[11px] text-surface-400 truncate">
                      @{profile?.user_name || "creator"}
                    </p>
                  </div>

                  {profile?.user_name && (
                    <a
                      href={`/${profile.user_name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-surface-700 hover:bg-surface-100 transition-colors min-h-[40px]"
                    >
                      <User className="h-4 w-4 text-surface-400" />
                      View Storefront
                    </a>
                  )}

                  <Link
                    href="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-surface-700 hover:bg-surface-100 transition-colors min-h-[40px]"
                  >
                    <Settings className="h-4 w-4 text-surface-400" />
                    Account Settings
                  </Link>

                  <div className="border-t border-surface-100 pt-1">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors min-h-[40px]"
                    >
                      <LogOut className="h-4 w-4 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-surface-200 px-2 py-1.5 shadow-lg">
        <nav className="flex items-center justify-around">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center min-h-[48px] px-3 py-1 rounded-xl transition-all ${
                  isActive
                    ? "text-brand-600 font-bold"
                    : "text-surface-500 hover:text-surface-900"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-brand-600 scale-110" : "text-surface-400"}`} />
                <span className="text-[10px] mt-0.5 font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
