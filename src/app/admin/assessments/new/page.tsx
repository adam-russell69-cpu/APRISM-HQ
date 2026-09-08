import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { FieldAssessmentTool } from "@/components/admin/assessment-tools";
import { requireStaff } from "@/lib/admin-account";

export const metadata: Metadata = { title: "New Field Assessment" };

export default async function NewAssessmentPage() {
  const { supabase } = await requireStaff();
  const [{ data: properties }, { data: inquiries }] = await Promise.all([
    supabase.from("properties").select("id, name, city").order("name"),
    supabase.from("inquiries").select("id, name, property_location").order("created_at", { ascending: false }).limit(100),
  ]);

  return <main className="mx-auto max-w-[1300px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
    <Link href="/admin/assessments" className="mb-5 inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-black/45 hover:text-black"><ChevronLeft aria-hidden="true" className="size-4" />All assessments</Link>
    <AdminPageHeader eyebrow="Standalone workflow" title="New Field Assessment" description="Start a new assessment only when there is no existing client intake record. An existing intake should be opened and advanced from its assessment detail page." />
    <section className="mt-6"><FieldAssessmentTool properties={(properties ?? []).map((property) => ({ id: property.id, label: `${property.name} · ${property.city}` }))} inquiries={(inquiries ?? []).map((inquiry) => ({ id: inquiry.id, label: `${inquiry.name} · ${inquiry.property_location}` }))} /></section>
  </main>;
}
