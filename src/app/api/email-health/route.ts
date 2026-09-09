export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    resendConfigured: Boolean(process.env.RESEND_API_KEY),
    siteOriginConfigured: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
  }, {
    headers: { "Cache-Control": "no-store" },
  });
}
