import { MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";

export function ActionMenu({ label = "More actions", children }: { label?: string; children: ReactNode }) {
  return <details className="group relative">
    <summary className="flex size-11 cursor-pointer list-none items-center justify-center border border-black/12 bg-white text-black/50 transition hover:border-black/25 hover:text-black [&::-webkit-details-marker]:hidden" aria-label={label}><MoreHorizontal aria-hidden="true" className="size-4" /></summary>
    <div className="absolute right-0 z-30 mt-2 min-w-44 border border-black/12 bg-white p-1.5 shadow-[0_18px_45px_rgba(20,22,21,0.14)]">{children}</div>
  </details>;
}

export const actionMenuItem = "flex min-h-10 w-full items-center px-3 text-left text-xs text-black/65 transition hover:bg-[#f3f0e9] hover:text-black";
