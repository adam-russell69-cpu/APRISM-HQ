import { Camera, PackagePlus } from "lucide-react";
import { addVisitMaterial, uploadVisitPhoto } from "@/app/admin/work-orders/actions";

const fieldClass = "mt-2 min-h-12 w-full border border-black/15 bg-white px-3 text-sm outline-none focus:border-[#8c6c33]";
const labelClass = "text-xs font-semibold text-black/55";
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

type Material = {
  id: string;
  description: string;
  quantity: number | string;
  unit_cost: number | string | null;
  client_charge: number | string | null;
  supplied_by: string;
};

type Photo = {
  id: string;
  category: string;
  visibility: string;
  caption: string | null;
};

export function FieldVisitCapture({ workOrderId, materials, photos }: { workOrderId: string; materials: Material[]; photos: Photo[] }) {
  return <div className="grid gap-5 xl:grid-cols-2">
    <section className="border border-black/10 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2"><PackagePlus aria-hidden="true" className="size-5 text-[#85652f]" /><div><p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[#80622f]">Parts & materials</p><h2 className="mt-1 font-serif text-2xl">Capture costs on site</h2></div></div>
      <form action={addVisitMaterial} className="mt-5 grid gap-4">
        <input type="hidden" name="workOrderId" value={workOrderId} />
        <label className={labelClass}>Description<input name="description" required maxLength={500} className={fieldClass} placeholder="Part or material" /></label>
        <div className="grid grid-cols-3 gap-3"><label className={labelClass}>Qty<input name="quantity" type="number" min="0" step="0.01" defaultValue="1" className={fieldClass} /></label><label className={labelClass}>APRISM cost<input name="unitCost" type="number" min="0" step="0.01" className={fieldClass} placeholder="0.00" /></label><label className={labelClass}>Client charge<input name="clientCharge" type="number" min="0" step="0.01" className={fieldClass} placeholder="0.00" /></label></div>
        <label className={labelClass}>Supplied by<select name="suppliedBy" defaultValue="aprism" className={fieldClass}><option value="aprism">APRISM</option><option value="property_manager">Property manager</option><option value="homeowner">Homeowner</option><option value="resident">Resident</option><option value="other">Other</option></select></label>
        <button type="submit" className="min-h-12 bg-[#1c211f] px-5 text-xs font-semibold uppercase tracking-[0.12em] text-white">Add material</button>
      </form>
      {materials.length ? <div className="mt-5 divide-y divide-black/8 border-t border-black/10">{materials.map((item) => <div key={item.id} className="grid grid-cols-[1fr_auto] gap-3 py-3 text-sm"><div><p className="font-medium">{item.description}</p><p className="mt-1 text-xs capitalize text-black/40">Qty {Number(item.quantity)} · {item.supplied_by.replaceAll("_", " ")}</p></div><div className="text-right text-xs text-black/45"><p>Cost {item.unit_cost == null ? "—" : money.format(Number(item.unit_cost))}</p><p className="mt-1">Charge {item.client_charge == null ? "—" : money.format(Number(item.client_charge))}</p></div></div>)}</div> : null}
    </section>

    <section className="border border-black/10 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2"><Camera aria-hidden="true" className="size-5 text-[#85652f]" /><div><p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[#80622f]">Field photos</p><h2 className="mt-1 font-serif text-2xl">Document the visit</h2></div></div>
      <form action={uploadVisitPhoto} className="mt-5 grid gap-4" encType="multipart/form-data">
        <input type="hidden" name="workOrderId" value={workOrderId} />
        <label className={labelClass}>Photo<input name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" capture="environment" required className={`${fieldClass} py-3`} /></label>
        <div className="grid grid-cols-2 gap-3"><label className={labelClass}>Category<select name="category" defaultValue="diagnostic" className={fieldClass}><option value="before">Before</option><option value="diagnostic">Diagnostic</option><option value="during">During</option><option value="after">After</option></select></label><label className={labelClass}>Visibility<select name="visibility" defaultValue="customer" className={fieldClass}><option value="customer">Client visible</option><option value="resident">Resident visible</option><option value="internal">APRISM only</option></select></label></div>
        <label className={labelClass}>Caption<input name="caption" maxLength={500} className={fieldClass} placeholder="What does this photo show?" /></label>
        <button type="submit" className="min-h-12 bg-[#1c211f] px-5 text-xs font-semibold uppercase tracking-[0.12em] text-white">Upload photo</button>
      </form>
      {photos.length ? <div className="mt-5 space-y-2 border-t border-black/10 pt-4">{photos.map((photo) => <div key={photo.id} className="flex items-start justify-between gap-3 border border-black/8 bg-[#f7f5ef] p-3"><div><p className="text-xs font-semibold capitalize">{photo.category}</p><p className="mt-1 text-xs text-black/45">{photo.caption || "Photo saved to field record"}</p></div><span className="text-[0.55rem] font-semibold uppercase tracking-[0.1em] text-[#80622f]">{photo.visibility}</span></div>)}</div> : null}
    </section>
  </div>;
}
