"use client";

type QueuedPhoto = {
  id: string;
  assessmentId: string;
  area: string;
  name: string;
  type: string;
  createdAt: number;
  blob: Blob;
};

const DB_NAME = "aprism-field-offline";
const DB_VERSION = 1;
const PHOTO_STORE = "assessment-photos";
const DRAFT_PREFIX = "aprism-assessment-draft:";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PHOTO_STORE)) db.createObjectStore(PHOTO_STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function queueAssessmentPhoto(photo: QueuedPhoto) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE, "readwrite");
    tx.objectStore(PHOTO_STORE).put(photo);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function listQueuedAssessmentPhotos(assessmentId: string): Promise<QueuedPhoto[]> {
  const db = await openDb();
  const rows = await new Promise<QueuedPhoto[]>((resolve, reject) => {
    const request = db.transaction(PHOTO_STORE, "readonly").objectStore(PHOTO_STORE).getAll();
    request.onsuccess = () => resolve((request.result as QueuedPhoto[]).filter((row) => row.assessmentId === assessmentId));
    request.onerror = () => reject(request.error);
  });
  db.close();
  return rows.sort((a, b) => a.createdAt - b.createdAt);
}

export async function removeQueuedAssessmentPhoto(id: string) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE, "readwrite");
    tx.objectStore(PHOTO_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export function saveAssessmentDraft(key: string, form: HTMLFormElement) {
  const data: Record<string, string> = {};
  new FormData(form).forEach((value, name) => { if (typeof value === "string") data[name] = value; });
  localStorage.setItem(`${DRAFT_PREFIX}${key}`, JSON.stringify({ savedAt: Date.now(), data }));
}

export function restoreAssessmentDraft(key: string, form: HTMLFormElement) {
  const raw = localStorage.getItem(`${DRAFT_PREFIX}${key}`);
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw) as { data?: Record<string, string> };
    Object.entries(parsed.data ?? {}).forEach(([name, value]) => {
      const field = form.elements.namedItem(name);
      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) field.value = value;
    });
    return true;
  } catch { return false; }
}

export function clearAssessmentDraft(key: string) {
  localStorage.removeItem(`${DRAFT_PREFIX}${key}`);
}
