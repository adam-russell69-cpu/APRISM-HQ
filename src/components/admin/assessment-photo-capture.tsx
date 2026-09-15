"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, CloudOff, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { fieldAssessmentAreas } from "@/lib/assessment-config";
import { listQueuedAssessmentPhotos, queueAssessmentPhoto, removeQueuedAssessmentPhoto } from "@/lib/offline-assessment";
import { createClient } from "@/lib/supabase/client";

type AssessmentPhoto = { id: string; area: string | null; storagePath: string; originalName: string | null; url: string; queued?: boolean };
type AssessmentPhotoCaptureProps = { assessmentId: string; initialPhotos: AssessmentPhoto[]; fixedArea?: string; compact?: boolean };
const bucket = "assessment-photos";
const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp", "heic", "heif"]);

function fileExtension(file: File) { const ext = file.name.split(".").pop()?.toLowerCase() ?? ""; if (allowedExtensions.has(ext)) return ext; if (file.type === "image/png") return "png"; if (file.type === "image/webp") return "webp"; if (file.type === "image/heic") return "heic"; if (file.type === "image/heif") return "heif"; return "jpg"; }

export function AssessmentPhotoCapture({ assessmentId, initialPhotos, fixedArea, compact = false }: AssessmentPhotoCaptureProps) {
  const supabase = useMemo(() => createClient(), []);
  const cameraInput = useRef<HTMLInputElement>(null); const libraryInput = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState(initialPhotos); const [selectedArea, setSelectedArea] = useState("General"); const [busy, setBusy] = useState(false); const [message, setMessage] = useState(""); const [online, setOnline] = useState(true);
  const area = fixedArea ?? selectedArea;

  async function uploadNow(file: File, photoArea: string) {
    const extension = fileExtension(file); const path = `${assessmentId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const uploadResult = await supabase.storage.from(bucket).upload(path, file, { cacheControl: "3600", contentType: file.type || (extension === "heic" ? "image/heic" : extension === "heif" ? "image/heif" : "image/jpeg"), upsert: false });
    if (uploadResult.error) throw uploadResult.error;
    const insertResult = await supabase.from("property_assessment_photos").insert({ assessment_id: assessmentId, area: photoArea, storage_path: path, original_name: file.name || null }).select("id, area, storage_path, original_name").single();
    if (insertResult.error || !insertResult.data) { await supabase.storage.from(bucket).remove([path]); throw insertResult.error ?? new Error("Photo record failed"); }
    const signed = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);
    return { id: insertResult.data.id, area: insertResult.data.area, storagePath: insertResult.data.storage_path, originalName: insertResult.data.original_name, url: signed.data?.signedUrl ?? "" } satisfies AssessmentPhoto;
  }

  async function syncQueued() {
    if (!navigator.onLine || busy) return;
    const queued = await listQueuedAssessmentPhotos(assessmentId); if (!queued.length) return;
    setBusy(true); setMessage(`Syncing ${queued.length} offline photo${queued.length === 1 ? "" : "s"}...`);
    for (const item of queued) {
      try { const file = new File([item.blob], item.name, { type: item.type }); const saved = await uploadNow(file, item.area); await removeQueuedAssessmentPhoto(item.id); setPhotos((current) => [...current.filter((photo) => photo.id !== item.id), saved]); }
      catch { setMessage("Some offline photos are still waiting to sync."); setBusy(false); return; }
    }
    setBusy(false); setMessage("Offline photos synced.");
  }

  useEffect(() => {
    setOnline(navigator.onLine);
    void listQueuedAssessmentPhotos(assessmentId).then((queued) => setPhotos((current) => [...current, ...queued.filter((q) => !current.some((p) => p.id === q.id)).map((q) => ({ id: q.id, area: q.area, storagePath: "", originalName: q.name, url: URL.createObjectURL(q.blob), queued: true }))]));
    const onOnline = () => { setOnline(true); void syncQueued(); }; const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline); window.addEventListener("offline", onOffline); if (navigator.onLine) void syncQueued();
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId]);

  async function upload(file?: File) {
    if (!file) return; const extension = fileExtension(file);
    if (file.type && !file.type.startsWith("image/") && !allowedExtensions.has(extension)) { setMessage("Choose an image file."); return; }
    if (file.size > 12 * 1024 * 1024) { setMessage("Photo is too large. Maximum size is 12 MB."); return; }
    if (!navigator.onLine) { const id = `offline-${crypto.randomUUID()}`; await queueAssessmentPhoto({ id, assessmentId, area, name: file.name || `photo.${extension}`, type: file.type || "image/jpeg", createdAt: Date.now(), blob: file }); setPhotos((current) => [...current, { id, area, storagePath: "", originalName: file.name, url: URL.createObjectURL(file), queued: true }]); setMessage("Photo saved offline. It will sync when connection returns."); return; }
    setBusy(true); setMessage("Uploading photo..."); try { const saved = await uploadNow(file, area); setPhotos((current) => [...current, saved]); setMessage("Photo added."); } catch { setMessage("Photo upload failed. It was not lost. Try again or save it while offline."); } finally { setBusy(false); if (cameraInput.current) cameraInput.current.value = ""; if (libraryInput.current) libraryInput.current.value = ""; }
  }

  async function remove(photo: AssessmentPhoto) {
    if (busy) return; setBusy(true);
    if (photo.queued) { await removeQueuedAssessmentPhoto(photo.id); setPhotos((current) => current.filter((item) => item.id !== photo.id)); setBusy(false); setMessage("Offline photo removed."); return; }
    setMessage("Removing photo..."); const storageResult = await supabase.storage.from(bucket).remove([photo.storagePath]); if (storageResult.error) { setBusy(false); setMessage("Photo could not be removed."); return; }
    const databaseResult = await supabase.from("property_assessment_photos").delete().eq("id", photo.id); if (databaseResult.error) { setBusy(false); setMessage("Photo file was removed, but its record still needs cleanup."); return; }
    setPhotos((current) => current.filter((item) => item.id !== photo.id)); setBusy(false); setMessage("Photo removed.");
  }

  return <section className={`print-hidden ${compact ? "mt-4 border-t border-black/10 pt-4" : "mb-5 border border-black/10 bg-white p-5 sm:p-6"}`}>
    {!compact ? <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#87682f]">Assessment photos</p><h2 className="mt-2 font-serif text-2xl">Capture field photos</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-black/48">Use the rear camera or photo library. If service drops, photos stay queued on this phone and sync when you reconnect.</p></div>{!fixedArea ? <label className="block text-xs font-semibold text-black/50 lg:w-64">Property area<select value={selectedArea} onChange={(event) => setSelectedArea(event.target.value)} className="mt-2 min-h-11 w-full border border-black/15 bg-white px-3.5 text-sm"><option>General</option>{fieldAssessmentAreas.map((item) => <option key={item}>{item}</option>)}</select></label> : null}</div> : <div className="flex items-center justify-between"><p className="text-xs font-semibold text-black/45">Photos · {area}</p>{!online ? <span className="inline-flex items-center gap-1 text-[0.62rem] font-semibold text-[#8f713d]"><CloudOff className="size-3" />Offline</span> : null}</div>}
    <div className={`${compact ? "mt-2" : "mt-5"} grid grid-cols-2 gap-2`}><button type="button" disabled={busy} onClick={() => cameraInput.current?.click()} className={`inline-flex items-center justify-center gap-2 bg-[#171b19] px-4 text-xs font-semibold text-white disabled:opacity-60 ${compact ? "min-h-11" : "min-h-14 text-sm"}`}>{busy ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}Take Photo</button><button type="button" disabled={busy} onClick={() => libraryInput.current?.click()} className={`inline-flex items-center justify-center gap-2 border border-black/15 bg-white px-4 text-xs font-semibold text-black/65 disabled:opacity-60 ${compact ? "min-h-11" : "min-h-14 text-sm"}`}><ImagePlus className="size-4" />Add Photos</button><input ref={cameraInput} className="sr-only" type="file" accept="image/*" capture="environment" onChange={(event) => void upload(event.target.files?.[0])} /><input ref={libraryInput} className="sr-only" type="file" accept="image/*" multiple onChange={(event) => { const files = Array.from(event.target.files ?? []); void (async () => { for (const file of files) await upload(file); })(); }} /></div>
    {message ? <p role="status" className="mt-2 text-xs text-black/48">{message}</p> : null}
    {photos.length ? <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">{photos.map((photo) => <figure key={photo.id} className="group overflow-hidden border border-black/10 bg-[#f8f6f0]"><a href={photo.url || undefined} target="_blank" rel="noreferrer" className="relative block aspect-square overflow-hidden bg-black/5">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={photo.url} alt={`${photo.area || "General"} assessment photo`} className="h-full w-full object-cover" />{photo.queued ? <span className="absolute bottom-1 left-1 bg-[#171b19]/85 px-1.5 py-1 text-[0.55rem] font-semibold text-white">Saved offline</span> : null}</a><figcaption className="flex items-center justify-between p-1.5"><span className="truncate text-[0.62rem] font-semibold text-black/45">{photo.area || "General"}</span><button type="button" disabled={busy} onClick={() => void remove(photo)} aria-label="Remove photo" className="inline-flex size-7 items-center justify-center text-black/35"><Trash2 className="size-3.5" /></button></figcaption></figure>)}</div> : !compact ? <p className="mt-5 border-l-2 border-[#a8864e] pl-3 text-xs leading-5 text-black/42">No photos have been added yet.</p> : null}
  </section>;
}
