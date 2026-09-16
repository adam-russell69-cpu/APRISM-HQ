import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/admin-account";

async function createRepairOrder(formData: FormData) {
  "use server";

  const { supabase, account } = await requireStaff();
  const customerName = String(formData.get("customer_name") ?? "").trim();
  const mobile = String(formData.get("mobile") ?? "").trim();
  const year = Number(formData.get("year"));
  const make = String(formData.get("make") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const vin = String(formData.get("vin") ?? "").trim().toUpperCase();
  const mileage = Number(formData.get("mileage"));
  const serviceName = String(formData.get("service_name") ?? "").trim();
  const hours = Number(formData.get("hours") ?? 0);
  const laborRate = Number(formData.get("labor_rate") ?? 0);

  if (!customerName || !mobile || !year || !make || !model || !vin || !Number.isFinite(mileage) || !serviceName) {
    throw new Error("Please complete all required repair-order fields.");
  }

  const { data: organization, error: orgError } = await supabase.from("organizations").select("id").eq("slug", "aprism").single();
  if (orgError || !organization) throw new Error("APRISM organization is not available.");

  const { data: businessUnit, error: unitError } = await supabase.from("business_units").select("id").eq("organization_id", organization.id).eq("slug", "moto").single();
  if (unitError || !businessUnit) throw new Error("Outpost Moto business unit is not available.");

  let clientAccountId: string;
  let motorcycleId: string;

  const { data: existingBike } = await supabase
    .from("motorcycles")
    .select("id, client_account_id")
    .eq("organization_id", organization.id)
    .eq("business_unit_id", businessUnit.id)
    .eq("vin", vin)
    .maybeSingle();

  if (existingBike) {
    motorcycleId = existingBike.id;
    clientAccountId = existingBike.client_account_id;
    await supabase.from("motorcycles").update({ current_mileage: mileage, year, make, model }).eq("id", motorcycleId);
  } else {
    const { data: client, error: clientError } = await supabase
      .from("client_accounts")
      .insert({ account_type: "private", display_name: customerName, phone: mobile, status: "active" })
      .select("id")
      .single();
    if (clientError || !client) throw new Error(clientError?.message || "Could not create Moto customer.");
    clientAccountId = client.id;

    const { data: bike, error: bikeError } = await supabase
      .from("motorcycles")
      .insert({
        organization_id: organization.id,
        business_unit_id: businessUnit.id,
        client_account_id: clientAccountId,
        vin,
        year,
        make,
        model,
        current_mileage: mileage,
      })
      .select("id")
      .single();
    if (bikeError || !bike) throw new Error(bikeError?.message || "Could not create motorcycle record.");
    motorcycleId = bike.id;
  }

  const roNumber = `RO-${Date.now().toString(36).toUpperCase()}`;
  const { error: roError } = await supabase.from("repair_orders").insert({
    organization_id: organization.id,
    business_unit_id: businessUnit.id,
    motorcycle_id: motorcycleId,
    client_account_id: clientAccountId,
    technician_id: account.userId,
    ro_number: roNumber,
    status: "dropped_off",
    service_name: serviceName,
    mileage_in: mileage,
    labor_type: "flat_rate",
    labor_rate: Number.isFinite(laborRate) ? laborRate : 0,
    estimated_labor_hours: Number.isFinite(hours) ? hours : 0,
    customer_supplied_fluids: formData.get("customer_supplied_fluids") === "on",
    customer_supplied_parts: formData.get("customer_supplied_parts") === "on",
  });
  if (roError) throw new Error(roError.message);

  revalidatePath("/hq");
  revalidatePath("/hq/moto");
  redirect("/hq/moto");
}

export default function NewROPage(){return <div className="space-y-7"><section><p className="text-xs uppercase tracking-[0.22em] text-[#b79a62]">Moto</p><h1 className="mt-2 text-3xl font-semibold">New repair order</h1><p className="mt-2 text-sm text-[#aaa398]">Customer → motorcycle → service. Only the essentials.</p></section><form action={createRepairOrder} className="space-y-6"><fieldset className="space-y-3"><legend className="text-lg font-medium">Customer</legend><Input name="customer_name" label="Customer name *" required/><Input name="mobile" label="Mobile *" type="tel" required/></fieldset><fieldset className="space-y-3"><legend className="text-lg font-medium">Motorcycle</legend><div className="grid grid-cols-2 gap-3"><Input name="year" label="Year *" type="number" required/><Input name="make" label="Make *" required/></div><Input name="model" label="Model *" required/><Input name="vin" label="VIN *" required/><Input name="mileage" label="Mileage *" type="number" required/></fieldset><fieldset className="space-y-3"><legend className="text-lg font-medium">Service</legend><Input name="service_name" label="Service requested *" required/><div className="grid grid-cols-2 gap-3"><Input name="hours" label="Hours" type="number" step="0.25"/><Input name="labor_rate" label="Labor rate" type="number" step="0.01"/></div><label className="flex items-center gap-3 rounded-xl border border-white/10 p-4 text-sm"><input name="customer_supplied_fluids" type="checkbox"/> Customer-supplied fluids</label><label className="flex items-center gap-3 rounded-xl border border-white/10 p-4 text-sm"><input name="customer_supplied_parts" type="checkbox"/> Customer-supplied parts</label></fieldset><button type="submit" className="w-full rounded-xl bg-[#c5aa72] px-5 py-4 font-semibold text-[#151513]">Create RO</button></form></div>}
function Input({name,label,type='text',required=false,step}:{name:string;label:string;type?:string;required?:boolean;step?:string}){return <label className="block text-sm text-[#bdb7ac]"><span>{label}</span><input name={name} type={type} required={required} step={step} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3.5 text-[#f2eee5] outline-none focus:border-[#b79a62]/70"/></label>}
