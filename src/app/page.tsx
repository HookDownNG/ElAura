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
            <div className="hidden md:block">
              <button className="px-5 py-2.5 text-sm whitespace-nowrap">
                Join as Brand
              </button>
            </div>
            <div className="hidden md:block">
              <button className="get-in-touch-btn flex items-center bg-green-600 hover:bg-green-700 text-white rounded-full font-medium shadow-lg shadow-green-100 transition-all hover:-translate-y-0.5 p-0 overflow-hidden pr-4">
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
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-30 pb-0 px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-start">
          <div className="space-y-6 md:space-y-8 animate-fade-in">
            <h1 className="leading-none">
              <span className="block font-display-italic text-green-600 text-5xl sm:text-6xl md:text-7xl font-black tracking-tight mb-2">
                AuraListic
              </span>
              <span className="block text-gray-900 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter">
                Creators Meet
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
            <div className="flex flex-row flex-wrap gap-3">
              <button className="px-3 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm bg-white text-green-700 border-2 border-green-600 rounded-full font-medium hover:bg-green-50 transition-all hover:-translate-y-0.5 shadow-lg shadow-green-100 whitespace-nowrap">
                Join as Brand
              </button>
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

            <div className="pt-8 border-t border-gray-100">
              <p className="text-xs font-semibold tracking-widest text-green-600/70 uppercase mb-6">
                By the numbers
              </p>
              <div className="flex flex-wrap gap-x-8 gap-y-4">
                {[
                  { number: "50+", label: "creator partnerships" },
                  { number: "12x", label: "avg. engagement lift" },
                  { number: "94%", label: "campaign satisfaction" },
                ].map((stat, i) => (
                  <div key={i} className="relative pl-5">
                    <span className="absolute left-0 top-2 w-2 h-2 rounded-full bg-green-500/30" />
                    <p className="text-2xl md:text-3xl font-black text-green-700 leading-none mb-0.5">
                      {stat.number}
                    </p>
                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side animated images grid */}
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 h-16 bg-linear-to-b from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-80 bg-linear-to-t from-white via-white to-transparent z-10 pointer-events-none" />

            <div className="grid grid-cols-2 gap-2 overflow-hidden relative rounded-3xl border border-green-50 bg-green-50/20 p-1.5">
              <div className="space-y-2 animate-marquee-up flex flex-col">
                {[
                  "https://kywxrunpxavowwikbsmc.supabase.co/storage/v1/object/public/brand_assets/landing_page/IMG_1490.webp",
                  "https://kywxrunpxavowwikbsmc.supabase.co/storage/v1/object/public/brand_assets/landing_page/IMG_1486.webp",
                  "https://kywxrunpxavowwikbsmc.supabase.co/storage/v1/object/public/brand_assets/landing_page/IMG_1496.webp",
                  "https://kywxrunpxavowwikbsmc.supabase.co/storage/v1/object/public/brand_assets/landing_page/IMG_1493.webp",
                ].map((src, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl overflow-hidden shadow-md border border-white bg-green-100/50"
                  >
                    <Image
                      src={src}
                      alt="African Creator"
                      width={400}
                      height={500}
                      className="w-full h-80 object-cover"
                      loading="eager"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2 animate-marquee-down flex flex-col">
                {[
                  "https://kywxrunpxavowwikbsmc.supabase.co/storage/v1/object/public/brand_assets/landing_page/IMG_1490.webp",
                  "https://kywxrunpxavowwikbsmc.supabase.co/storage/v1/object/public/brand_assets/landing_page/IMG_1488.webp",
                  "https://kywxrunpxavowwikbsmc.supabase.co/storage/v1/object/public/brand_assets/landing_page/IMG_1492.webp",
                  "https://kywxrunpxavowwikbsmc.supabase.co/storage/v1/object/public/brand_assets/landing_page/IMG_1488.webp",
                ].map((src, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl overflow-hidden shadow-md border border-white bg-green-100/50"
                  >
                    <Image
                      src={src}
                      alt="Brand Lifestyle"
                      width={400}
                      height={500}
                      className="w-full h-80 object-cover"
                      loading="eager"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Concept to Culture Section --- */}
      <section className="relative z-20 -mt-16 md:-mt-24 bg-green-50/40 px-6 pt-12 pb-24 border-t border-green-50">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-tight">
            From concept to culture — we put African creators at the center of
            your brand story.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              title: "Creative Strategy",
              desc: "Campaigns built around real identity — not templates. Discover creators who tell authentic stories that seamlessly connect with your target audience.",
              metric: "91% higher view-rates",
            },
            {
              title: "Full-Spectrum Discovery",
              desc: "From hyper-local micro-influencers to mega cultural icons. Filter our network by niche, reach, and location to find your perfect match instantly.",
              metric: "70% lift in active CTR",
            },
            {
              title: "Secure Escrow Payments",
              desc: "Protect your campaign budget entirely. Funds are held safely in escrow and released to creators only after deliverables are fully approved.",
              metric: "100% secure milestone tracking",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-8 border border-green-100/60 shadow-sm hover:shadow-xl hover:border-green-300 transition-all group duration-300"
            >
              {/* Keep the numbers: Simple, editorial, and clean */}
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

      {/* --- Marketplace Capabilities (Horizontally Animated Infinite Marquees) --- */}
      <section className="bg-gray-900 text-white py-24 overflow-hidden relative">
        <div className="max-w-4xl mx-auto text-center mb-16 px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Built for creators, backed by data.
          </h2>
          <p className="text-gray-400 text-lg">
            From discovery to secure payout — everything runs on our end-to-end
            infrastructure.
          </p>
        </div>

        {/* Marquee Row 1: Flowing LEFT */}
        <div className="flex overflow-hidden mb-4 relative w-full mask-gradient">
          <div className="flex gap-4 whitespace-nowrap animate-marquee-left py-2">
            {[
              "Escrow protection",
              "Influencer discovery",
              "Direct connection",
              "Niche filtering",
              "Escrow protection",
              "Influencer discovery",
              "Direct connection",
              "Niche filtering",
              "Escrow protection",
              "Influencer discovery",
              "Direct connection",
              "Niche filtering",
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
              "Verified metrics",
              "Secure milestones",
              "Direct chat pipeline",
              "Talent curation",
              "Full-spectrum reach",
              "Verified metrics",
              "Secure milestones",
              "Direct chat pipeline",
              "Talent curation",
              "Full-spectrum reach",
              "Verified metrics",
              "Secure milestones",
              "Direct chat pipeline",
              "Talent curation",
              "Full-spectrum reach",
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

      {/* --- Trust & Scale Bar --- */}
      <section className="py-16 md:py-24 px-4 sm:px-6 border-t border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-6 text-gray-900">
            The bridge between African talent and global ambition.
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            We handle the infrastructure — verified discovery, secure escrow,
            and direct communication — so you can build authentic partnerships
            that actually perform.
          </p>
        </div>

        {/* High-Trust Infrastructure Metrics — Tailored for Mobile Responsiveness */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6 mt-12 md:mt-16 border-t border-b border-gray-100 py-10">
          {[
            {
              metric: "100%",
              label: "Verified African Creators",
              sub: "No bot accounts, no fake engagement stats.",
            },
            {
              metric: "10%",
              label: "Flat Platform Fee",
              sub: "Simple, transparent pricing added at checkout. No hidden agency cuts.",
            },
            {
              metric: "Escrowed",
              label: "Payment Pipeline",
              sub: "Capital is only released when milestones are met.",
            },
            {
              metric: "Multi-Tier",
              label: "Talent Network",
              sub: "Access from local micro-niches to mega icons.",
            },
          ].map((item, index) => (
            <div key={index} className="text-center px-2 sm:px-4">
              <span className="block text-4xl font-black text-green-600 mb-2">
                {item.metric}
              </span>
              <h4 className="text-base font-bold text-gray-900 mb-1">
                {item.label}
              </h4>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto">
                {item.sub}
              </p>
            </div>
          ))}
        </div>
      </section>
      {/* --- CTA Section --- */}
      <section className="bg-gray-950 text-white py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.15),transparent)] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
            Ready to tap into Africa's creator economy?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Create a free brand account, filter our network, and secure your
            first partnership today.
          </p>
          <button className="bg-white text-green-950 px-10 py-4 rounded-full text-lg font-bold shadow-xl hover:bg-green-50 hover:scale-[1.03] transition-all">
            Find Creators Now →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-16 px-6 border-t border-gray-900">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
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
              title: "Platform",
              links: ["Discovery", "Escrow Security", "Pricing"],
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
          © 2026 ElAura.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
