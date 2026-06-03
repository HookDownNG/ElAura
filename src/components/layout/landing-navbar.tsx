"use client";
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
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-brand-100 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-brand-700"
          >
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

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <button className="px-5 py-2.5 text-sm whitespace-nowrap">
              Join as Brand
            </button>
          </div>
          <div className="hidden md:block">
            <Link
              href="/creator"
              className="get-in-touch-btn flex items-center bg-brand-600 hover:bg-brand-700 text-white rounded-full font-medium shadow-lg shadow-brand-100 transition-all hover:-translate-y-0.5 p-0 overflow-hidden pr-4 cursor-pointer"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-lime-600 text-white shrink-0">
                <svg
                  className="arrow-icon w-2.5 h-2.5"
                  fill="currentColor"
                  viewBox="0 0 14 14"
                >
                  <path d="M 3.03386 13.8507 C 2.83595 14.0498 2.51493 14.0498 2.31703 13.8507 L 0.148733 11.6692 L 0.148694 11.6681 C -0.0492089 11.469 -0.0497418 11.1466 0.148161 10.9475 L 6.08392 4.97579 C 6.40321 4.65456 6.17712 4.1053 5.72551 4.1053 H 2.26567 C 1.9855 4.1053 1.75883 3.87726 1.75883 3.59539 V 0.509907 C 1.75883 0.228041 1.9855 0 2.26567 0 H 13.4932 C 13.7733 0 14 0.228041 14 0.509907 V 11.8054 C 14 12.0873 13.7733 12.3153 13.4932 12.3153 H 10.4268 C 10.1467 12.3153 9.92001 12.0873 9.92001 11.8054 V 8.15388 C 9.92001 7.69953 9.37406 7.47207 9.05477 7.7933 L 3.03386 13.8507 Z" />
                </svg>
              </span>
              <span className="ml-2.5 text-sm whitespace-nowrap">
                Join as Creator
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
