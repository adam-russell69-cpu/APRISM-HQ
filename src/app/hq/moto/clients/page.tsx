import Link from "next/link";
import { requireStaff } from "@/lib/admin-account";

export default async function MotoClientsPage(){
 const { supabase }=await requireStaff();
 const { data: bikes }=await supabase.from("motorcycles").select("client_account_id");
 const motoIds=[...new Set((bikes??[]).map((bike)=>bike.client_account_id))];
 const { data: clients }=motoIds.length?await supabase.from("client_accounts").select("id, display_name, phone, email, updated_at").in("id",motoIds).order("display_name"):{data:[]};
 return <div className="space-y-7"><section className="flex items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.22em] text-[#b79a62]">Moto</p><h1 className="mt-2 text-3xl font-semibold">Clients</h1><p className="mt-2 text-sm text-[#aaa398]">Outpost Moto customer book.</p></div><Link href="/hq/moto/clients/new" className="rounded-xl bg-[#c5aa72] px-4 py-3 text-sm font-semibold text-[#151513]">+ New Client</Link></section>{clients?.length?<div className="space-y-3">{clients.map((client)=><div key={client.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><p className="font-medium">{client.display_name}</p><p className="mt-1 text-sm text-[#918b82]">{client.phone||"No mobile"}{client.email?` · ${client.email}`:""}</p></div>)}</div>:<div className="rounded-2xl border border-white/10 p-4 text-sm text-[#918b82]">No Moto clients with motorcycles yet. New clients can be saved before a bike or repair order is added.</div>}</div>;
}
