"use client";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  "About",
  "Services",
  "Technology",
  "Work",
  "Resources",
  "Careers",
];

export function LandingNavbar() {
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-brand-100 z-50 transition-all select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer">
          <Link href="/" className="flex items-center gap-2 text-xl sm:text-2xl font-black tracking-tight text-brand-700">
            <Image src="/icon.png" alt="ElAura" width={28} height={28} className="rounded-lg" />
            ElAura
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-surface-600">
          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="hover:text-brand-600 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:bg-brand-500 after:h-0.5 after:transition-all"
            >
              {link}
            </a>
          ))}
        </div>

        {/* Log In & Sign Up Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/auth/login"
            className="px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-surface-700 hover:text-brand-600 hover:bg-surface-50 transition-colors min-h-10 flex items-center"
          >
            Log In
          </Link>
          <Link
            href="/auth/signup"
            className="px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-100/50 transition-all hover:-translate-y-0.5 min-h-10 flex items-center"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}
