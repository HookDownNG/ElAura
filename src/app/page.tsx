"use client";

import React from "react";
import Image from "next/image";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased overflow-x-hidden">
      {/* Dynamic Keyframes injected so you don't mess up your tailwind config */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes marqueeUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes marqueeDown {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        @keyframes marqueeLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        @keyframes marqueeRight {
          0% { transform: translateX(-33.33%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee-up { animation: marqueeUp 20s linear infinite; }
        .animate-marquee-down { animation: marqueeDown 20s linear infinite; }
        .animate-marquee-left { animation: marqueeLeft 25s linear infinite; }
        .animate-marquee-right { animation: marqueeRight 25s linear infinite; }
        .animate-marquee-up:hover, .animate-marquee-down:hover, .animate-marquee-left:hover, .animate-marquee-right:hover {
          animation-play-state: paused;
        }
        @keyframes arrowFly {
          0% { transform: translateY(0); opacity: 1; }
          30% { transform: translateY(-24px); opacity: 0; }
          60% { transform: translateY(24px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .get-in-touch-btn:hover .arrow-icon {
          animation: arrowFly 0.7s ease-in-out;
        }
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,600;1,700;1,800;1,900&display=swap');
        .font-display-italic { font-family: 'Playfair Display', Georgia, serif; font-style: italic; }
      `,
        }}
      />

      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-green-100 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <span className="text-2xl font-black tracking-tight text-green-700">
              ElAura
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            {[
              "About",
              "Services",
              "Technology",
              "Work",
              "Resources",
              "Careers",
            ].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="hover:text-green-600 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:bg-green-500 after:transition-all"
              >
                {link}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden md:block px-6 py-2 text-sm font-medium text-gray-700 hover:bg-green-50/50 rounded-full transition-colors">
              Sign In
            </button>
            <div>
              <button className="px-3 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm whitespace-nowrap">
                <span className="hidden sm:inline">Join as </span>Brand
              </button>
            </div>
            <div>
              <button className="get-in-touch-btn flex items-center bg-green-600 hover:bg-green-700 text-white rounded-full font-medium shadow-lg shadow-green-100 transition-all hover:-translate-y-0.5 p-0 overflow-hidden pr-4 sm:pr-5.5">
                <span className="flex items-center justify-center w-8 h-8 sm:w-9.5 sm:h-9.5 rounded-full bg-lime-600 text-white shrink-0">
                  <svg
                    className="arrow-icon w-2.5 h-2.5 sm:w-4 sm:h-4"
                    fill="currentColor"
                    viewBox="0 0 14 14"
                  >
                    <path d="M 3.03386 13.8507 C 2.83595 14.0498 2.51493 14.0498 2.31703 13.8507 L 0.148733 11.6692 L 0.148694 11.6681 C -0.0492089 11.469 -0.0497418 11.1466 0.148161 10.9475 L 6.08392 4.97579 C 6.40321 4.65456 6.17712 4.1053 5.72551 4.1053 H 2.26567 C 1.9855 4.1053 1.75883 3.87726 1.75883 3.59539 V 0.509907 C 1.75883 0.228041 1.9855 0 2.26567 0 H 13.4932 C 13.7733 0 14 0.228041 14 0.509907 V 11.8054 C 14 12.0873 13.7733 12.3153 13.4932 12.3153 H 10.4268 C 10.1467 12.3153 9.92001 12.0873 9.92001 11.8054 V 8.15388 C 9.92001 7.69953 9.37406 7.47207 9.05477 7.7933 L 3.03386 13.8507 Z" />
                  </svg>
                </span>
                <span className="ml-2.5 sm:ml-3 text-sm sm:text-base whitespace-nowrap">
                  Join as Creator
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-30 md:pt-32 pb-20 px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div className="space-y-6 md:space-y-8 animate-fade-in">
            <h1 className="leading-none">
              <span className="block font-display-italic text-green-600 text-5xl sm:text-6xl md:text-7xl font-black tracking-tight mb-2">
                AuraListic
              </span>
              <span className="block text-gray-900 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter">
                Creators Meets
              </span>
              <span className="block text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none pt-1 mt-1">
                <span className="text-transparent [-webkit-text-stroke:1px_#030712] opacity-80">
                  Iconic
                </span>{" "}
                <span className="text-gray-950">BRANDS.</span>
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-lg leading-relaxed">
              ElAura connects global brands with Africa's most authentic
              creatives.
            </p>
            <div>
              <button className="get-in-touch-btn flex items-center bg-green-600 hover:bg-green-700 text-white rounded-full font-medium shadow-lg shadow-green-100 transition-all hover:-translate-y-0.5 p-0 overflow-hidden pr-4 sm:pr-5.5">
                {/* The Left-Cap Circle: Reduced by 20% from (w-10/h-10) -> w-8/h-8 and (w-12/h-12) -> w-9.5/h-9.5 */}
                <span className="flex items-center justify-center w-8 h-8 sm:w-9.5 sm:h-9.5 rounded-full bg-lime-600 text-white shrink-0">
                  <svg
                    className="arrow-icon w-2.5 h-2.5 sm:w-4 sm:h-4"
                    fill="currentColor"
                    viewBox="0 0 14 14"
                  >
                    <path d="M 3.03386 13.8507 C 2.83595 14.0498 2.51493 14.0498 2.31703 13.8507 L 0.148733 11.6692 L 0.148694 11.6681 C -0.0492089 11.469 -0.0497418 11.1466 0.148161 10.9475 L 6.08392 4.97579 C 6.40321 4.65456 6.17712 4.1053 5.72551 4.1053 H 2.26567 C 1.9855 4.1053 1.75883 3.87726 1.75883 3.59539 V 0.509907 C 1.75883 0.228041 1.9855 0 2.26567 0 H 13.4932 C 13.7733 0 14 0.228041 14 0.509907 V 11.8054 C 14 12.0873 13.7733 12.3153 13.4932 12.3153 H 10.4268 C 10.1467 12.3153 9.92001 12.0873 9.92001 11.8054 V 8.15388 C 9.92001 7.69953 9.37406 7.47207 9.05477 7.7933 L 3.03386 13.8507 Z" />
                  </svg>
                </span>

                {/* The Text Block - Text size stepped down (base -> text-sm, sm:text-lg -> sm:text-base) and margins reduced */}
                <span className="ml-2.5 sm:ml-3 text-sm sm:text-base whitespace-nowrap">
                  Join as Creator
                </span>
              </button>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <p className="text-xs font-semibold tracking-wider text-green-700 uppercase mb-4 md:mb-6">
                Trusted by
              </p>
              <div className="grid grid-cols-3 gap-4 md:gap-6">
                {[
                  { number: "500+", label: "creator partnerships" },
                  { number: "12x", label: "avg. engagement lift" },
                  { number: "94%", label: "campaign satisfaction" },
                ].map((stat, i) => (
                  <div key={i}>
                    <p className="text-xl md:text-2xl font-black text-gray-900">
                      {stat.number}
                    </p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side animated images grid */}
          <div className="grid grid-cols-2 gap-4 overflow-hidden relative rounded-3xl border border-green-50 bg-green-50/20 p-2">
            {/* Column 1: Moving UP */}
            <div className="space-y-4 animate-marquee-up flex flex-col">
              {[
                "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=80",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
                // Clones for loop continuity
                "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=80",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
              ].map((src, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl overflow-hidden shadow-md border border-white"
                >
                  <Image
                    src={src}
                    alt="African Creator"
                    width={400}
                    height={500}
                    className="w-full h-64 object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>

            {/* Column 2: Moving DOWN */}
            <div className="space-y-4 animate-marquee-down flex flex-col">
              {[
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
                "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80",
                // Clones for loop continuity
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
                "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80",
              ].map((src, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl overflow-hidden shadow-md border border-white"
                >
                  <Image
                    src={src}
                    alt="Brand Lifestyle"
                    width={400}
                    height={500}
                    className="w-full h-64 object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Concept to Content Section */}
      <section className="bg-green-50/40 py-24 px-6 border-t border-green-50">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-tight">
            From concept to culture — we put African creators at the center of
            your brand story.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              title: "Creative Strategy",
              desc: "Campaigns built around real identity — not templates. We help brands tell stories that actually resonate.",
              metric: "91% higher view-rates",
            },
            {
              title: "Precision Media",
              desc: "We place your message where it actually matters. No budget waste, no blind spending — just targeted reach.",
              metric: "70% lift in active CTR",
            },
            {
              title: "Algorithmic Commerce",
              desc: "Turn audience trust into revenue. Transparent performance data so you see exactly what's working.",
              metric: "3.3x avg. ROI",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-8 border border-green-100/60 shadow-sm hover:shadow-xl hover:border-green-300 transition-all group duration-300"
            >
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 font-bold group-hover:bg-green-600 group-hover:text-white transition-colors">
                0{i + 1}
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                {item.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm mb-6">
                {item.desc}
              </p>
              <div className="text-xs font-bold uppercase tracking-wider text-green-600 bg-green-50 py-1.5 px-3 rounded-md inline-block">
                {item.metric}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bespoke Solutions (Horizontally Animated Infinite Marquees) */}
      <section className="bg-gray-900 text-white py-24 overflow-hidden relative">
        <div className="max-w-4xl mx-auto text-center mb-16 px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Built for creators, backed by data.
          </h2>
          <p className="text-gray-400 text-lg">
            From brief to pay — everything runs on{" "}
            <span className="text-green-400 font-semibold">Waves</span>, our
            end-to-end campaign engine.
          </p>
        </div>

        {/* Marquee Row 1: Flowing LEFT */}
        <div className="flex overflow-hidden mb-4 relative w-full mask-gradient">
          <div className="flex gap-4 whitespace-nowrap animate-marquee-left py-2">
            {[
              "Content feedback",
              "Live campaign reporting",
              "Creator payments",
              "Content production",
              "Content feedback",
              "Live campaign reporting",
              "Creator payments",
              "Content production",
              "Content feedback",
              "Live campaign reporting",
              "Creator payments",
              "Content production",
            ].map((text, i) => (
              <div
                key={i}
                className="bg-green-500/10 border border-green-500/30 backdrop-blur-sm px-8 py-3.5 rounded-full text-sm font-medium text-green-300 hover:border-green-400 transition-colors"
              >
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Marquee Row 2: Flowing RIGHT */}
        <div className="flex overflow-hidden relative w-full mask-gradient">
          <div className="flex gap-4 whitespace-nowrap animate-marquee-right py-2">
            {[
              "Creator affiliate",
              "Campaign measurement",
              "End-to-end campaigns",
              "Creator contracting",
              "Creator amplification",
              "Creator affiliate",
              "Campaign measurement",
              "End-to-end campaigns",
              "Creator contracting",
              "Creator amplification",
              "Creator affiliate",
              "Campaign measurement",
              "End-to-end campaigns",
              "Creator contracting",
              "Creator amplification",
            ].map((text, i) => (
              <div
                key={i}
                className="bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-sm px-8 py-3.5 rounded-full text-sm font-medium text-emerald-300 hover:border-emerald-400 transition-colors"
              >
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase mb-8 border border-green-200">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          By creators, for brands
        </div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-gray-900">
          The bridge between African talent and global ambition.
        </h2>
        <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
          We handle the complexity — contracts, payments, production, compliance
          — so you get authentic campaigns that actually perform.
        </p>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-950 text-white py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.15),transparent)] pointer-events-none" />
        <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tight">
          Ready to work with Africa's best creators?
        </h2>
        <button className="bg-white text-green-950 px-10 py-4 rounded-full text-lg font-bold shadow-xl hover:bg-green-50 hover:scale-[1.03] transition-all">
          Start a campaign →
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-16 px-6 border-t border-gray-900">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">
                E
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                ElAura
              </span>
            </div>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              Connecting global brands with Africa's most authentic creative
              talent. No middlemen, no bureaucracy.
            </p>
          </div>

          {[
            { title: "Company", links: ["Home", "About", "Careers"] },
            {
              title: "Framework",
              links: ["Services", "Technology", "Case Studies"],
            },
            {
              title: "Governance",
              links: ["Platform Terms", "Creator Terms", "Privacy Policy"],
            },
          ].map((col, idx) => (
            <div key={idx}>
              <h4 className="font-semibold text-white text-sm tracking-wider uppercase mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((link) => (
                  <li
                    key={link}
                    className="hover:text-green-400 transition-colors cursor-pointer"
                  >
                    {link}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-900 text-center text-gray-600 text-xs tracking-widest uppercase">
          © 2026 ElAura. Engineered precisely.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
