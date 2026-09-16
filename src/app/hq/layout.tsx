import Link from "next/link";
import { ClipboardList, FlaskConical, Home, Wrench } from "lucide-react";

const nav = [
  { href: "/hq", label: "Today", icon: ClipboardList },
  { href: "/hq/property", label: "Property", icon: Home },
  { href: "/hq/moto", label: "Moto", icon: Wrench },
  { href: "/hq/rd", label: "R&D", icon: FlaskConical },
];

export default function HQLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#10100f] text-[#f2eee5]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#10100f]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#b79a62]">APRISM</p>
            <p className="text-sm font-medium tracking-wide">HQ</p>
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-full border border-[#b79a62]/50 text-xs text-[#d7c08f]">AR</div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-28 pt-6">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#151513]/98 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto grid h-16 max-w-3xl grid-cols-4">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] text-[#c7c1b5] transition hover:text-[#d7c08f]">
              <Icon size={18} strokeWidth={1.6} />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
