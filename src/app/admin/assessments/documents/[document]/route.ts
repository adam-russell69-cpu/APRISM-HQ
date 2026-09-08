import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const protectedDocuments = new Set([
  "APRISM_Field_Assessment_Checklist.pdf",
  "APRISM_Property_Assessment_Report_Template_Fillable.pdf",
]);

export async function GET(_request: Request, { params }: { params: Promise<{ document: string }> }) {
  const { document } = await params;
  if (!protectedDocuments.has(document)) return new Response("Not found", { status: 404 });

  const supabase = await createClient();
  if (!supabase) return new Response("Not found", { status: 404 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Not found", { status: 404 });

  const { data: staff } = await supabase.from("staff_users").select("active, role").eq("user_id", user.id).maybeSingle();
  if (!staff?.active || !["owner", "admin", "steward"].includes(staff.role)) return new Response("Not found", { status: 404 });

  const file = await readFile(join(process.cwd(), "private-documents", "assessments", document));
  return new Response(file, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="${document}"`,
      "Content-Type": "application/pdf",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
