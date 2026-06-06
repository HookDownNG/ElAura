import Image from "next/image";

const footerColumns = [
  {
    title: "Company",
    links: ["Home", "About", "Careers"],
  },
  {
    title: "Platform",
    links: ["Discovery", "Escrow Security", "Pricing"],
  },
  {
    title: "Governance",
    links: ["Platform Terms", "Creator Terms", "Privacy Policy"],
  },
];

export function LandingFooter() {
  return (
    <footer className="bg-surface-950 text-surface-400 py-16 px-6 border-t border-surface-900">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-12">
        <div className="col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <Image src="/icon.png" alt="ElAura" width={28} height={28} className="rounded-lg brightness-[10] saturate-0" />
            <span className="text-xl font-bold text-white tracking-tight">
              ElAura
            </span>
          </div>
          <p className="text-sm text-surface-500 max-w-xs leading-relaxed">
            Connecting global brands with Africa&apos;s most authentic creative
            talent. No middlemen, no bureaucracy.
          </p>
        </div>

        {footerColumns.map((col) => (
          <div key={col.title}>
            <h4 className="font-semibold text-white text-sm tracking-wider uppercase mb-4">
              {col.title}
            </h4>
            <ul className="space-y-2.5 text-sm">
              {col.links.map((link) => (
                <li
                  key={link}
                  className="hover:text-brand-400 transition-colors cursor-pointer"
                >
                  {link}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-surface-900 text-center text-surface-600 text-xs tracking-widest uppercase">
        &copy; 2026 ElAura.
      </div>
    </footer>
  );
}
