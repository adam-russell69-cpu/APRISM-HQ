import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin-account";

async function createMotoClient(formData: FormData) {
  "use server";
  const { supabase } = await requireStaff();
  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  if (!firstName || !lastName || !phone) redirect("/hq/moto/clients/new?error=required");
  const displayName = `${firstName} ${lastName}`.trim();
  const { error } = await supabase.from("client_accounts").insert({ account_type: "private", display_name: displayName, legal_name: displayName, phone, email: email || null, status: "active", billing_address: notes ? { moto_notes: notes } : {} });
  if (error) redirect(`/hq/moto/clients/new?error=${encodeURIComponent(error.message)}`);
  redirect("/hq/moto/clients");
}

export default async function NewMotoClientPage({searchParams}:{searchParams:Promise<{error?:string}>}){
 const params=await searchParams;
 return <div className="space-y-7"><section><p className="text-xs uppercase tracking-[0.22em] text-[#b79a62]">Moto · Clients</p><h1 className="mt-2 text-3xl font-semibold">New client</h1><p className="mt-2 text-sm text-[#aaa398]">Add the customer now. Build a repair order when the bike actually comes in.</p></section>{params.error&&<div className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{params.error==="required"?"First name, last name and mobile are required.":params.error}</div>}<form action={createMotoClient} className="space-y-5"><div className="grid grid-cols-2 gap-3"><Input name="first_name" label="First name *"/><Input name="last_name" label="Last name *"/></div><Input name="phone" label="Mobile *" type="tel"/><Input name="email" label="Email" type="email"/><label className="block text-sm text-[#bdb7ac]"><span>Notes</span><textarea name="notes" rows={4} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3.5 text-[#f2eee5] outline-none focus:border-[#b79a62]/70" placeholder="Preferred contact, bike notes, referral, etc."/></label><button type="submit" className="w-full rounded-xl bg-[#c5aa72] px-5 py-4 font-semibold text-[#151513]">Save client</button></form></div>;
}
function Input({name,label,type="text"}:{name:string;label:string;type?:string}){return <label className="block text-sm text-[#bdb7ac]"><span>{label}</span><input name={name} type={type} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3.5 text-[#f2eee5] outline-none focus:border-[#b79a62]/70"/></label>}
