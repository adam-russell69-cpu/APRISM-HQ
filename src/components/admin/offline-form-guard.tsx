"use client";

import { useEffect, useRef, useState } from "react";
import { Cloud, CloudOff, Save } from "lucide-react";
import { clearAssessmentDraft, restoreAssessmentDraft, saveAssessmentDraft } from "@/lib/offline-assessment";

export function OfflineFormGuard({ draftKey }: { draftKey: string }) {
  const marker = useRef<HTMLDivElement>(null);
  const [online, setOnline] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setOnline(navigator.onLine);
    const form = marker.current?.closest("form");
    if (!form) return;
    if (restoreAssessmentDraft(draftKey, form)) setMessage("Offline draft restored on this phone.");
    const onOnline = () => { setOnline(true); setMessage("Back online. Tap Save to sync this draft."); };
    const onOffline = () => { setOnline(false); setMessage("Offline. Changes can be saved on this phone."); };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, [draftKey]);

  function saveOffline() {
    const form = marker.current?.closest("form");
    if (!form) return;
    saveAssessmentDraft(draftKey, form);
    setMessage(online ? "Draft saved on this phone as a backup." : "Saved offline on this phone.");
  }

  function discardLocal() {
    clearAssessmentDraft(draftKey);
    setMessage("Local offline copy cleared.");
  }

  return <div ref={marker} className="print-hidden mb-5 flex flex-col gap-3 border border-black/10 bg-white p-4 sm:flex-row sm:items-center">
    <div className="flex items-center gap-2 text-xs font-semibold text-black/60">{online ? <Cloud className="size-4 text-[#4e704e]" aria-hidden="true" /> : <CloudOff className="size-4 text-[#8f713d]" aria-hidden="true" />}<span>{online ? "Online" : "Offline field mode"}</span></div>
    <button type="button" onClick={saveOffline} className="inline-flex min-h-11 items-center justify-center gap-2 border border-black/15 bg-[#f8f6f0] px-4 text-xs font-semibold text-black/65"><Save className="size-4" aria-hidden="true" />Save on this phone</button>
    {message ? <p role="status" className="text-xs text-black/45 sm:ml-auto">{message}</p> : <button type="button" onClick={discardLocal} className="text-left text-[0.68rem] text-black/35 sm:ml-auto">Clear local copy</button>}
  </div>;
}
