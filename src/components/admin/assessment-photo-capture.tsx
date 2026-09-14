"use client";

import { useMemo, useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { fieldAssessmentAreas } from "@/lib/assessment-config";
import { createClient } from "@/lib/supabase/client";

type AssessmentPhoto = {
  id: string;
  area: string | null;
  storagePath: string;
  originalName: string | null;
  url: string;
};

type AssessmentPhotoCaptureProps = {
  assessmentId: string;
  initialPhotos: AssessmentPhoto[];
};

const bucket = "assessment-photos";
const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp", "heic", "heif"]);

function fileExtension(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (allowedExtensions.has(ext)) return ext;
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/heic") return "heic";
  if (file.type === "image/heif") return "heif";
  return "jpg";
}

export function AssessmentPhotoCapture({ assessmentId, initialPhotos }: AssessmentPhotoCaptureProps) {
  const supabase = useMemo(() => createClient(), []);
  const cameraInput = useRef<HTMLInputElement>(null);
  const libraryInput = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState(initialPhotos);
  const [area, setArea] = useState("General");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function upload(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Choose an image file.");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setMessage("Photo is too large. Maximum size is 12 MB.");
      return;
    }

    setBusy(true);
    setMessage("Uploading photo...");
    const extension = fileExtension(file);
    const path = `${assessmentId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const uploadResult = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

    if (uploadResult.error) {
      setBusy(false);
      setMessage("Photo upload failed. Please try again.");
      return;
    }

    const insertResult = await supabase
      .from("property_assessment_photos")
      .insert({ assessment_id: assessmentId, area, storage_path: path, original_name: file.name || null })
      .select("id, area, storage_path, original_name")
      .single();

    if (insertResult.error || !insertResult.data) {
      await supabase.storage.from(bucket).remove([path]);
      setBusy(false);
      setMessage("Photo could not be attached to this assessment.");
      return;
    }

    const signed = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);
    if (!signed.data?.signedUrl) {
      setBusy(false);
      setMessage("Photo saved, but the preview could not be loaded.");
      return;
    }

    setPhotos((current) => [
      ...current,
      {
        id: insertResult.data.id,
        area: insertResult.data.area,
        storagePath: insertResult.data.storage_path,
        originalName: insertResult.data.original_name,
        url: signed.data.signedUrl,
      },
    ]);
    setBusy(false);
    setMessage("Photo added to assessment.");
    if (cameraInput.current) cameraInput.current.value = "";
    if (libraryInput.current) libraryInput.current.value = "";
  }

  async function remove(photo: AssessmentPhoto) {
    if (busy) return;
    setBusy(true);
    setMessage("Removing photo...");
    const storageResult = await supabase.storage.from(bucket).remove([photo.storagePath]);
    if (storageResult.error) {
      setBusy(false);
      setMessage("Photo could not be removed. Please try again.");
      return;
    }
    const databaseResult = await supabase.from("property_assessment_photos").delete().eq("id", photo.id);
    if (databaseResult.error) {
      setBusy(false);
      setMessage("Photo file was removed, but its record still needs cleanup.");
      return;
    }
    setPhotos((current) => current.filter((item) => item.id !== photo.id));
    setBusy(false);
    setMessage("Photo removed.");
  }

  return (
    <section className="print-hidden mb-5 border border-black/10 bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#87682f]">Assessment photos</p>
          <h2 className="mt-2 font-serif text-2xl">Capture field photos</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/48">Use the rear camera while walking the property, or add an existing image from your photo library. Photos stay private and attached to this assessment.</p>
        </div>
        <label className="block text-xs font-semibold text-black/50 lg:w-64">
          Property area
          <select value={area} onChange={(event) => setArea(event.target.value)} className="mt-2 min-h-11 w-full border border-black/15 bg-white px-3.5 text-sm text-[#171a19] focus:border-[#8f713d] focus:outline-none">
            <option>General</option>
            {fieldAssessmentAreas.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button type="button" disabled={busy} onClick={() => cameraInput.current?.click()} className="inline-flex min-h-14 items-center justify-center gap-3 bg-[#171b19] px-5 text-sm font-semibold text-white disabled:opacity-60">
          {busy ? <Loader2 aria-hidden="true" className="size-5 animate-spin" /> : <Camera aria-hidden="true" className="size-5" />}
          Take Photo
        </button>
        <button type="button" disabled={busy} onClick={() => libraryInput.current?.click()} className="inline-flex min-h-14 items-center justify-center gap-3 border border-black/15 bg-[#faf8f3] px-5 text-sm font-semibold text-black/65 disabled:opacity-60">
          <ImagePlus aria-hidden="true" className="size-5" />
          Add from Photos
        </button>
        <input ref={cameraInput} className="sr-only" type="file" accept="image/*" capture="environment" onChange={(event) => void upload(event.target.files?.[0])} />
        <input ref={libraryInput} className="sr-only" type="file" accept="image/*" onChange={(event) => void upload(event.target.files?.[0])} />
      </div>

      {message ? <p role="status" className="mt-3 text-xs text-black/48">{message}</p> : null}

      {photos.length ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <figure key={photo.id} className="group overflow-hidden border border-black/10 bg-[#f8f6f0]">
              <a href={photo.url} target="_blank" rel="noreferrer" className="block aspect-square overflow-hidden bg-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={photo.area ? `${photo.area} assessment photo` : "Assessment photo"} className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]" />
              </a>
              <figcaption className="flex items-center justify-between gap-2 p-2.5">
                <span className="truncate text-[0.68rem] font-semibold text-black/50">{photo.area || "General"}</span>
                <button type="button" disabled={busy} onClick={() => void remove(photo)} aria-label="Remove photo" className="inline-flex size-8 shrink-0 items-center justify-center text-black/35 hover:bg-black/5 hover:text-[#8c4943] disabled:opacity-50"><Trash2 aria-hidden="true" className="size-4" /></button>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : <p className="mt-5 border-l-2 border-[#a8864e] pl-3 text-xs leading-5 text-black/42">No photos have been added yet.</p>}
    </section>
  );
}
