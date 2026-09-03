import { FileCheck2, FileText } from "lucide-react";
import { EmptyState, Panel, PortalDataNotice, PortalPageHeader } from "@/components/portal/portal-ui";
import { formatFileSize, formatDate } from "@/lib/portal-data";
import { getPortalSnapshot } from "@/lib/portal-records";

export default async function DocumentsPage() {
  const snapshot = await getPortalSnapshot();
  return <main className="mx-auto max-w-[1480px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
    <PortalPageHeader eyebrow="Property library" title="Documents" description="Plans, warranties, manuals, service records, inspection reports, and essential property references." />
    {snapshot.errorMessage ? <PortalDataNotice message={snapshot.errorMessage} /> : null}
    <Panel title="Property records" eyebrow={`${snapshot.documents.length} document${snapshot.documents.length === 1 ? "" : "s"}`} className="mt-7">{snapshot.documents.length ? <div className="divide-y divide-black/10">{snapshot.documents.map((document) => {
      const property = snapshot.properties.find((item) => item.id === document.propertyId);
      const size = formatFileSize(document.sizeBytes);
      return <article key={document.id} className="flex items-center gap-4 px-5 py-5 sm:px-6"><span className="flex size-11 shrink-0 items-center justify-center border border-black/10 bg-white"><FileText aria-hidden="true" className="size-4 text-[#80632d]" /></span><div className="min-w-0 flex-1"><h2 className="truncate text-sm font-medium">{document.name}</h2><p className="mt-1 text-xs text-black/40">{property?.name ?? "Property"} · {document.category} · Updated {formatDate(document.updatedAt)}{size ? ` · ${size}` : ""}</p></div><span className="inline-flex items-center gap-2 text-[0.5rem] font-semibold uppercase tracking-[0.12em] text-black/36"><FileCheck2 aria-hidden="true" className="size-4" />On file</span></article>;
    })}</div> : <EmptyState title="No documents on file" description="Plans, warranties, manuals, and service records will appear here." />}</Panel>
  </main>;
}
