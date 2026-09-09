"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createAttachmentUpload, registerAttachment } from "./attachment-actions";

export function InvoiceAttachmentUploader({ invoiceNumber }: { invoiceNumber: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setStatus("");
    const supabase = createClient();
    try {
      for (const file of Array.from(files)) {
        const ticket = await createAttachmentUpload({
          invoiceNumber,
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
        });
        const { error } = await supabase.storage.from("billing-attachments")
          .uploadToSignedUrl(ticket.path, ticket.token, file, { contentType: file.type, upsert: false });
        if (error) throw new Error(error.message);
        await registerAttachment({
          invoiceNumber,
          storagePath: ticket.path,
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          kind: file.type === "application/pdf" ? "document" : "photo",
          clientVisible: true,
        });
      }
      setStatus(`${files.length} attachment${files.length === 1 ? "" : "s"} added.`);
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="border border-black/10 bg-[#f8f6f0] p-5">
    <div className="flex items-start gap-3"><UploadCloud className="mt-0.5 size-5 text-[#87682f]" /><div><h2 className="font-serif text-2xl">Attachments</h2><p className="mt-1 text-xs leading-5 text-black/45">JPG, PNG, WEBP, or PDF. Up to 10 MB each. Uploaded files are private and linked to this invoice.</p></div></div>
    <label className="mt-4 flex min-h-12 cursor-pointer items-center justify-center border border-dashed border-black/25 bg-white px-4 text-xs font-semibold">
      {busy ? "Uploading…" : "Choose photos or receipt"}
      <input type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" disabled={busy} onChange={(event) => void upload(event.target.files)} className="sr-only" />
    </label>
    {status ? <p className="mt-3 text-xs text-black/55">{status}</p> : null}
  </div>;
}
