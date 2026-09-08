import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return <div className="flex min-h-40 flex-col items-center justify-center px-6 py-10 text-center">
    <div className="flex size-10 items-center justify-center border border-black/10 bg-[#f5f2eb]"><Icon aria-hidden="true" className="size-4 text-[#8a6a34]" /></div>
    <h3 className="mt-4 font-serif text-2xl text-[#1b1e1d]">{title}</h3>
    <p className="mt-2 max-w-md text-sm leading-6 text-black/45">{description}</p>
  </div>;
}
