"use client";

import Image from "next/image";

interface GlobalLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export function GlobalLoader({
  message = "Loading ElAura...",
  fullScreen = true,
}: GlobalLoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-between bg-white px-6 py-12 transition-all duration-300 select-none ${
        fullScreen
          ? "fixed inset-0 z-50 min-h-screen w-full"
          : "min-h-[60vh] w-full rounded-2xl"
      }`}
    >
      {/* Top Spacer for Native Mobile Balance */}
      <div className="w-full h-8" />

      {/* Main Brand & Logo Presentation */}
      <div className="flex flex-col items-center justify-center gap-6 text-center my-auto">
        {/* Native App Icon Frame with Glowing Gradient Halo */}
        <div className="relative flex items-center justify-center">
          {/* Ambient Glow */}
          <div className="absolute h-24 w-24 rounded-3xl bg-linear-to-tr from-brand-400/30 via-purple-400/20 to-pink-400/30 blur-xl animate-pulse" />

          {/* Squircle App Icon Container */}
          <div className="relative flex h-20 w-20 items-center justify-center rounded-[22px] bg-linear-to-b from-white to-surface-50 p-3 shadow-xl ring-1 ring-black/5">
            <Image
              src="/icon.png"
              alt="ElAura Logo"
              width={64}
              height={64}
              className="h-12 w-12 rounded-xl object-contain"
              priority
            />
          </div>
        </div>

        {/* Brand Name & Tagline */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-surface-900">
            ElAura
          </h1>
          <p className="text-[11px] font-bold uppercase tracking-widest text-brand-600/90">
            UGC Creator Studio
          </p>
        </div>

        {/* Native iOS-Style Horizontal Loading Indicator */}
        <div className="w-36 space-y-3 pt-2">
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-surface-100">
            <div className="absolute inset-y-0 left-0 w-full bg-linear-to-r from-brand-600 via-purple-600 to-brand-500 rounded-full animate-loader-bar" />
          </div>
          {message && (
            <p className="text-[12px] font-medium text-surface-400 tracking-tight">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default GlobalLoader;
