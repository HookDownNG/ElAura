import Link from "next/link";
import Image from "next/image";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8 select-none">
      {/* Top Brand Header */}
      <div className="w-full max-w-md flex items-center justify-center pt-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1.5 shadow-2xs border border-surface-200">
            <Image
              src="/icon.png"
              alt="ElAura Logo"
              width={40}
              height={40}
              className="h-7 w-7 rounded-lg object-contain"
              priority
            />
          </div>
          <span className="text-xl font-black tracking-tight text-surface-900">
            ElAura
          </span>
        </Link>
      </div>

      {/* Main 404 Hero Content */}
      <div className="w-full max-w-md my-auto text-center space-y-6 py-8">
        {/* Animated App Logo + 404 Badge */}
        <div className="relative flex flex-col items-center justify-center gap-3">
          {/* Ambient Glow */}
          <div className="absolute h-28 w-28 rounded-full bg-linear-to-tr from-brand-300/40 via-purple-300/30 to-pink-300/30 blur-2xl animate-pulse" />

          {/* Squircle App Logo Frame */}
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

          <span className="relative inline-flex items-center rounded-full bg-brand-50 px-3.5 py-1 text-xs font-black text-brand-700 border border-brand-200 tracking-widest uppercase">
            Error 404
          </span>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-surface-900">
            Lost in the UGC Studio?
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 max-w-xs mx-auto leading-relaxed">
            The page or creator storefront you&apos;re looking for doesn&apos;t
            exist, was moved, or has a typo in the URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/creator/dashboard" className="w-full sm:w-auto">
            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 hover:bg-brand-700 active:scale-95 text-white px-6 py-3 text-xs sm:text-sm font-bold shadow-md shadow-brand-200/50 transition-all min-h-11"
            >
              <Home className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Footer Attribution */}
      <div className="text-xs font-medium text-surface-400 pb-2">
        ElAura UGC Creator Platform
      </div>
    </div>
  );
}
