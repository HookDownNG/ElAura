"use client";

import React from "react";
import Image from "next/image";
import { LandingNavbar } from "@/components/layout/landing-navbar";
import { LandingFooter } from "@/components/layout/landing-footer";
import {
  Handshake,
  KanbanSquare,
  ShieldCheck,
  Link,
  MessageCircle,
  Headphones,
} from "lucide-react";

const showcaseImages = [
  "https://kywxrunpxavowwikbsmc.supabase.co/storage/v1/object/public/brand_assets/landing_page/IMG_1490.webp",
  "https://kywxrunpxavowwikbsmc.supabase.co/storage/v1/object/public/brand_assets/landing_page/IMG_1486.webp",
  "https://kywxrunpxavowwikbsmc.supabase.co/storage/v1/object/public/brand_assets/landing_page/IMG_1496.webp",
  "https://kywxrunpxavowwikbsmc.supabase.co/storage/v1/object/public/brand_assets/landing_page/IMG_1493.webp",
  "https://kywxrunpxavowwikbsmc.supabase.co/storage/v1/object/public/brand_assets/landing_page/IMG_1488.webp",
  "https://kywxrunpxavowwikbsmc.supabase.co/storage/v1/object/public/brand_assets/landing_page/IMG_1492.webp",
];

const categories = [
  "Lifestyle",
  "Fashion",
  "Beauty",
  "Travel",
  "Health & Fitness",
];

const creators = [
  {
    name: "Amara Okafor",
    handle: "AmaraOkafor",
    image: showcaseImages[0],
    views: "470.0k",
    rating: 4.0,
    description: "Lifestyle & Fashion Vlogs",
    rate: "₦200,000",
    location: "Lagos, Nigeria",
  },
  {
    name: "Kwame Mensah",
    handle: "KwameM",
    image: showcaseImages[1],
    views: "6.6k",
    rating: 5.0,
    description: "Travel & Culture Photography",
    rate: "₦150,000",
    location: "Nairobi, Kenya",
  },
  {
    name: "Zuri Adebayo",
    handle: "ZuriAdebayo",
    image: showcaseImages[2],
    type: "UGC",
    rating: 4.9,
    description: "Content Creator, UGC, Brand Deals",
    rate: "₦350,000",
    location: "Accra, Ghana",
  },
  {
    name: "Thabo Ndlovu",
    handle: "ThaboNdlovu",
    image: showcaseImages[3],
    type: "UGC",
    rating: 5.0,
    description: "Fitness, Family, Fashion, Tech",
    rate: "₦100,000",
    location: "Johannesburg, SA",
  },
];

const steps = [
  {
    number: "1",
    title: "Create Your Profile",
    desc: "Set up your personal page and list your services for Instagram, TikTok, YouTube, and UGC content.",
  },
  {
    number: "2",
    title: "Share Your Link",
    desc: "Drop your custom link in your bio and social profiles. Brands can discover and purchase your services directly.",
  },
  {
    number: "3",
    title: "Start Earning",
    desc: "Manage brand deals and get paid securely through the platform. No chasing invoices.",
  },
];

const features = [
  {
    title: "Get Brand Deals",
    desc: "Get discovered by brands on our marketplace looking to work with African creators.",
    icon: Handshake,
  },
  {
    title: "Manage Collabs",
    desc: "Track brand deals and deadlines. Submit deliverables directly through the platform.",
    icon: KanbanSquare,
  },
  {
    title: "Always Get Paid",
    desc: "Funds are collected upfront and paid out when you complete the collaboration.",
    icon: ShieldCheck,
  },
  {
    title: "Custom Link",
    desc: "Share your personalized URL in your bio and drive traffic to your profile.",
    icon: Link,
  },
  {
    title: "Instant Chat",
    desc: "Receive messages from brands and communicate directly throughout the collaboration.",
    icon: MessageCircle,
  },
  {
    title: "Local Support",
    desc: "Get help from a team that understands the African creator ecosystem.",
    icon: Headphones,
  },
];

const faqs = [
  {
    q: "How do I get paid?",
    a: "Funds are held securely and released to you once you complete the deliverables. Payouts are processed via mobile money or bank transfer.",
  },
  {
    q: "Is this free to join?",
    a: "Yes. Creating a profile and getting discovered is completely free. We take a small platform fee only when you complete a paid collaboration.",
  },
  {
    q: "Which countries are supported?",
    a: "We currently fully support creators and brands within Nigeria. We are actively building out our localized escrow and banking pipelines for Kenya, Ghana, and South Africa, which will be rolling out in our next phase.",
  },
  {
    q: "What kind of brands use ElAura?",
    a: "Brands of all sizes — from fast-growing African startups to global companies looking to connect authentically with African audiences.",
  },
  {
    q: "Can I offer multiple services?",
    a: "Absolutely. You can list Instagram posts, TikTok videos, YouTube integrations, UGC content, and more — all from one profile.",
  },
];

function FadeInSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function CreatorPage() {
  const [username, setUsername] = React.useState("");

  return (
    <div className="min-h-screen bg-white font-sans text-surface-900 antialiased overflow-x-hidden">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes marqueeUp { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
        @keyframes marqueeDown { 0% { transform: translateY(-50%); } 100% { transform: translateY(0); } }
        .animate-marquee-up { animation: marqueeUp 20s linear infinite; }
        .animate-marquee-down { animation: marqueeDown 20s linear infinite; }
        .animate-marquee-up:hover, .animate-marquee-down:hover { animation-play-state: paused; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,600;1,700;1,800;1,900&display=swap');
        .font-display-italic { font-family: 'Playfair Display', Georgia, serif; font-style: italic; }
      `,
        }}
      />

      <LandingNavbar />

      {/* Hero */}
      <FadeInSection>
        <section className="pt-36 pb-16 px-6 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight mb-6">
            <span className="text-brand-600 font-display-italic">Get Paid</span>{" "}
            to Work With Brands You Love
          </h1>
          <p className="text-lg sm:text-xl text-surface-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            The simple way to get paid for your Instagram, TikTok, YouTube, and
            UGC brand deals.
          </p>

          <div className="max-w-lg mx-auto">
            <div className="flex items-center border-2 border-brand-200 rounded-full overflow-hidden bg-white shadow-lg shadow-brand-100/50 focus-within:border-brand-400 transition-colors">
              <span className="pl-5 text-sm text-surface-400 whitespace-nowrap shrink-0">
                elaura.com/
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourname"
                className="flex-1 py-3.5 pr-2 text-sm outline-none text-surface-900 placeholder:text-surface-300 min-w-0 bg-transparent"
              />
              <button className="m-1.5 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-full transition-colors whitespace-nowrap shrink-0">
                Claim
              </button>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm text-surface-500">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              Join hundreds of forward-thinking African creators
            </span>
          </div>
        </section>
      </FadeInSection>

      {/* Creator Showcase — Portrait Card Row */}
      <FadeInSection>
        <section className="py-16 px-6 bg-surface-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-center mb-2">
              Creator Showcase
            </h2>
            <p className="text-surface-500 text-center mb-10 max-w-md mx-auto text-sm">
              Meet the faces behind Africa&apos;s fastest-growing creator
              economy.
            </p>

            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
              {showcaseImages.map((src, idx) => (
                <div
                  key={idx}
                  className="relative shrink-0 w-[200px] sm:w-[220px] aspect-[9/16] rounded-3xl overflow-hidden shadow-lg border border-brand-100 snap-center group cursor-pointer"
                >
                  <Image
                    src={src}
                    alt="Creator showcase"
                    width={220}
                    height={390}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md">
                    <svg
                      className="w-3.5 h-3.5 text-brand-600 ml-0.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Loved by Creators */}
      <FadeInSection>
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
              Loved by Creators Across Africa
            </h2>
            <p className="text-surface-500 max-w-xl mx-auto">
              Join a growing community of African creators earning from brand
              partnerships.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                className="px-5 py-2.5 rounded-full border border-brand-200 text-sm font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Creator Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {creators.map((c) => (
              <div key={c.handle} className="group cursor-pointer">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-3">
                  <Image
                    src={c.image}
                    alt={c.name}
                    width={400}
                    height={500}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="flex items-center gap-2 mb-1">
                  {"views" in c && c.views ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-surface-600 bg-surface-100 px-2 py-0.5 rounded">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      {c.views}
                    </span>
                  ) : "type" in c && c.type ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-surface-600 bg-surface-100 px-2 py-0.5 rounded">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {c.type}
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-bold text-sm text-surface-900">
                    {c.name}
                  </span>
                  <span className="text-amber-500 text-xs">★</span>
                  <span className="text-xs font-medium text-surface-500">
                    {c.rating}
                  </span>
                </div>

                <p className="text-xs text-surface-400 truncate mb-1">
                  {c.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-400 truncate">
                    {c.location}
                  </span>
                  <span className="font-bold text-sm text-surface-900 shrink-0">
                    {c.rate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </FadeInSection>

      {/* How Elaura Works */}
      <FadeInSection>
        <section className="py-20 px-6 bg-surface-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-center mb-4">
              How ElAura Works
            </h2>
            <p className="text-surface-500 text-center mb-14 max-w-xl mx-auto">
              Everything you need to run your business as a creator.
            </p>

            <div className="grid sm:grid-cols-3 gap-8 mb-20">
              {steps.map((step) => (
                <div key={step.number} className="text-center">
                  <div className="w-14 h-14 rounded-full bg-brand-600 text-white text-xl font-black flex items-center justify-center mx-auto mb-5">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-surface-500 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="bg-white rounded-2xl p-6 border border-surface-200 hover:shadow-md transition-shadow group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base mb-2">{f.title}</h3>
                    <p className="text-sm text-surface-500 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* FAQ */}
      <FadeInSection>
        <section className="py-20 px-6 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-2xl border border-surface-200 p-5 open:border-brand-200 open:bg-brand-50/30 transition-all"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-sm">
                  {faq.q}
                  <svg
                    className="w-4 h-4 text-surface-400 shrink-0 ml-4 group-open:rotate-180 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <p className="mt-3 text-sm text-surface-500 leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </FadeInSection>

      {/* CTA */}
      <FadeInSection>
        <section className="bg-surface-950 text-white py-20 px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight">
            Ready to start earning?
          </h2>
          <p className="text-surface-400 text-lg mb-8 max-w-lg mx-auto">
            Create your free profile and get discovered by brands looking for
            African creators.
          </p>
          <button className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3.5 rounded-full text-base font-semibold shadow-lg hover:scale-[1.02] transition-all">
            Claim Your Link
          </button>
        </section>
      </FadeInSection>

      <LandingFooter />
    </div>
  );
}
