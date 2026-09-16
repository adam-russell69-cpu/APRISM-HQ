import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/admin-account";

async function createMotoClient(formData: FormData) {
  "use server";
  const { supabase } = await requireStaff();
  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const year = Number(formData.get("year") ?? 0);
  const make = String(formData.get("make") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const vin = String(formData.get("vin") ?? "").trim().toUpperCase();
  const mileage = Number(formData.get("mileage") ?? 0);
  const color = String(formData.get("color") ?? "").trim();
  const plate = String(formData.get("license_plate") ?? "").trim();

  if (!firstName || !lastName || !phone || !year || !make || !model || !vin || !mileage) redirect("/hq/moto/clients/new?error=required");

  // Resolve the tenant the same way the working New RO flow does. RLS can hide
  // organization_members before a Moto membership exists, but staff can read
  // the bootstrapped APRISM organization/business unit directly.
  const { data: organization, error: orgError } = await supabase.from("organizations").select("id").eq("slug", "aprism").single();
  if (orgError || !organization) redirect(`/hq/moto/clients/new?error=${encodeURIComponent(orgError?.message || "APRISM organization is not available")}`);
  const { data: unit, error: unitError } = await supabase.from("business_units").select("id").eq("organization_id", organization.id).eq("slug", "moto").single();
  if (unitError || !unit) redirect(`/hq/moto/clients/new?error=${encodeURIComponent(unitError?.message || "Outpost Moto business unit is not available")}`);

  const displayName = `${firstName} ${lastName}`.trim();
  const { data: client, error: clientError } = await supabase.from("client_accounts").insert({ account_type: "private", display_name: displayName, legal_name: displayName, phone, email: email || null, status: "active" }).select("id").single();
  if (clientError || !client) redirect(`/hq/moto/clients/new?error=${encodeURIComponent(clientError?.message || "Client could not be saved")}`);

  const { error: bikeError } = await supabase.from("motorcycles").insert({ organization_id: organization.id, business_unit_id: unit.id, client_account_id: client.id, year, make, model, vin, current_mileage: mileage, color: color || null, license_plate: plate || null, notes: notes || null });
  if (bikeError) {
    await supabase.from("client_accounts").delete().eq("id", client.id);
    redirect(`/hq/moto/clients/new?error=${encodeURIComponent(bikeError.message)}`);
  }
  revalidatePath("/hq/moto");
  revalidatePath("/hq/moto/clients");
  redirect("/hq/moto/clients");
}

export default async function NewMotoClientPage({searchParams}:{searchParams:Promise<{error?:string}>}){
 const params=await searchParams;
 return <div className="space-y-7"><section><p className="text-xs uppercase tracking-[0.22em] text-[#b79a62]">Moto · Clients</p><h1 className="mt-2 text-3xl font-semibold">New client + bike</h1><p className="mt-2 text-sm text-[#aaa398]">Build the customer and their motorcycle once, then use them for future repair orders and service history.</p></section>{params.error&&<div className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{params.error==="required"?"Customer name, mobile, year, make, model, VIN and mileage are required.":params.error}</div>}<form action={createMotoClient} className="space-y-7"><section className="space-y-5"><h2 className="text-lg font-medium">Customer</h2><div className="grid grid-cols-2 gap-3"><Input name="first_name" label="First name *" required/><Input name="last_name" label="Last name *" required/></div><Input name="phone" label="Mobile *" type="tel" required/><Input name="email" label="Email" type="email"/></section><section className="space-y-5 border-t border-white/10 pt-6"><div><h2 className="text-lg font-medium">Motorcycle</h2><p className="mt-1 text-sm text-[#918b82]">This becomes the bike's permanent service record.</p></div><div className="grid grid-cols-2 gap-3"><Input name="year" label="Year *" type="number" required/><Input name="make" label="Make *" required/></div><Input name="model" label="Model *" required/><Input name="vin" label="VIN *" required/><Input name="mileage" label="Mileage *" type="number" required/><div className="grid grid-cols-2 gap-3"><Input name="color" label="Color"/><Input name="license_plate" label="Plate"/></div><label className="block text-sm text-[#bdb7ac]"><span>Bike / customer notes</span><textarea name="notes" rows={4} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3.5 text-[#f2eee5] outline-none focus:border-[#b79a62]/70" placeholder="Modifications, preferences, known history, referral, etc."/></label></section><button type="submit" className="w-full rounded-xl bg-[#c5aa72] px-5 py-4 font-semibold text-[#151513]">Save client + motorcycle</button></form></div>;
}
function Input({name,label,type="text",required=false}:{name:string;label:string;type?:string;required?:boolean}){return <label className="block text-sm text-[#bdb7ac]"><span>{label}</span><input name={name} type={type} required={required} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3.5 text-[#f2eee5] outline-none focus:border-[#b79a62]/70"/></label>}
