import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ invoiceNumber: string }> }) {
  const { invoiceNumber } = await params;
  const supabase = await createClient();
  if (!supabase) return Response.json({ error: "Invoice documents are unavailable in preview mode" }, { status: 404 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const loginUrl = new URL("/portal/login", request.url);
    loginUrl.searchParams.set("next", `/portal/invoices/${encodeURIComponent(invoiceNumber)}`);
    return NextResponse.redirect(loginUrl);
  }

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("pdf_storage_path")
    .eq("invoice_number", invoiceNumber)
    .maybeSingle();
  if (error || !invoice?.pdf_storage_path) return Response.json({ error: "Invoice document not found" }, { status: 404 });

  const admin = createAdminClient();
  if (!admin) return Response.json({ error: "Invoice document service is not configured" }, { status: 503 });

  const { data, error: signingError } = await admin.storage.from("invoice-documents").createSignedUrl(invoice.pdf_storage_path, 60, { download: `${invoiceNumber}.pdf` });
  if (signingError || !data.signedUrl) return Response.json({ error: "Invoice document is temporarily unavailable" }, { status: 503 });

  return NextResponse.redirect(data.signedUrl);
}
