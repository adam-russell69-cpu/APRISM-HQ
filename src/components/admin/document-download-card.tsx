"use client";

import { useState } from "react";
import { Download, FileText } from "lucide-react";

export function DocumentDownloadCard({ href, title, description }: { href: string; title: string; description: string }) {
  const [message, setMessage] = useState("");
  async function saveOffline() {
    try {
      const response = await fetch(href, { credentials: "same-origin" });
      if (!response.ok) throw new Error("download failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = href.split("/").pop() || `${title}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setMessage("Downloaded. On iPhone, save it to Files to keep it available offline.");
    } catch { setMessage("Could not download this file. Check your connection and try again."); }
  }
  return <article className="border border-black/10 bg-white p-5"><FileText aria-hidden="true" className="size-5 text-[#8f713d]" /><p className="mt-4 font-serif text-xl">{title}</p><p className="mt-2 text-xs leading-5 text-black/42">{description}</p><div className="mt-4 grid grid-cols-2 gap-2"><a href={href} className="inline-flex min-h-11 items-center justify-center border border-black/15 px-3 text-xs font-semibold text-black/60">Open</a><button type="button" onClick={() => void saveOffline()} className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#171b19] px-3 text-xs font-semibold text-white"><Download className="size-4" aria-hidden="true" />Download</button></div>{message ? <p role="status" className="mt-3 text-xs leading-5 text-black/45">{message}</p> : null}</article>;
}
