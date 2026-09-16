import Link from "next/link";
import { requireStaff } from "@/lib/admin-account";

const Section = ({title,children}:{title:string;children:React.ReactNode}) => <section className="space-y-3"><h2 className="text-lg font-medium">{title}</h2>{children}</section>;
const Empty = ({children}:{children:React.ReactNode}) => <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm text-[#918b82]">{children}</div>;

export default async function MotoPage(){
 const { supabase } = await requireStaff();
 const { data: repairOrders } = await supabase.from("repair_orders").select("id, ro_number, status, service_name, mileage_in, updated_at").order("updated_at", { ascending: false }).limit(30);
 const rows = repairOrders ?? [];
 const active = rows.filter((ro) => !["completed", "cancelled"].includes(ro.status));
 const ready = active.filter((ro) => ro.status === "ready");
 const inShop = active.filter((ro) => ro.status !== "ready");
 const recent = rows.filter((ro) => ["completed", "cancelled"].includes(ro.status)).slice(0, 5);

 const Card = ({ro}:{ro:(typeof rows)[number]}) => <div className="rounded-2xl border border-[#b79a62]/25 bg-white/[0.035] p-4"><div className="flex justify-between gap-4"><div><p className="font-medium">{ro.service_name}</p><p className="mt-1 text-sm text-[#aaa398]">RO {ro.ro_number} · {ro.mileage_in.toLocaleString()} mi</p></div><div className="text-right"><span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-wider text-[#bdb7ac]">{ro.status.replaceAll("_", " ")}</span></div></div></div>;

 return <div className="space-y-8">
  <section className="flex items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.22em] text-[#b79a62]">Outpost</p><h1 className="mt-2 text-3xl font-semibold">Moto</h1><p className="mt-2 text-sm text-[#aaa398]">Repair orders and motorcycle history.</p></div><Link href="/hq/moto/ro/new" className="rounded-xl bg-[#c5aa72] px-4 py-3 text-sm font-semibold text-[#151513]">+ New RO</Link></section>
  <Section title="In shop">{inShop.length ? <div className="space-y-3">{inShop.map((ro)=><Card key={ro.id} ro={ro}/>)}</div> : <Empty>No active repair orders.</Empty>}</Section>
  <Section title="Ready">{ready.length ? <div className="space-y-3">{ready.map((ro)=><Card key={ro.id} ro={ro}/>)}</div> : <Empty>No motorcycles waiting for pickup.</Empty>}</Section>
  <Section title="Recent">{recent.length ? <div className="space-y-3">{recent.map((ro)=><Card key={ro.id} ro={ro}/>)}</div> : <Empty>No completed repair orders yet.</Empty>}</Section>
 </div>;
}
