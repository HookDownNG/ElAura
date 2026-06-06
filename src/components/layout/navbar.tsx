"use client";

import Image from "next/image";
import Link from "next/link";
import { Shield, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth-actions";
import type { Profile } from "@/types";

interface NavbarProps {
  profile: Profile | null;
}

export function Navbar({ profile }: NavbarProps) {
  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <Image src="/icon.png" alt="ElAura" width={24} height={24} className="rounded-md" />
        <span className="font-bold text-lg tracking-tight hidden sm:inline">ElAura</span>
      </Link>
      <div className="flex-1" />
      <Button
        variant="ghost"
        size="icon"
        className="relative text-muted-foreground"
      >
        <Bell className="h-5 w-5" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={profile?.avatar_url ?? ""}
                alt={profile?.full_name ?? ""}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {profile?.full_name}
              </p>
              <p className="text-xs leading-none text-muted-foreground capitalize">
                {profile?.role}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <form action={signOut}>
            <DropdownMenuItem asChild>
              <button type="submit" className="w-full cursor-pointer">
                Sign Out
              </button>
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
