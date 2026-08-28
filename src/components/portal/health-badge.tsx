const statusStyles: Record<string, string> = {
  Healthy: "border-[#75917a]/35 bg-[#75917a]/10 text-[#446349]",
  Monitor: "border-[#b18a45]/35 bg-[#b18a45]/10 text-[#80632d]",
  "Action Recommended": "border-[#bb7045]/35 bg-[#bb7045]/10 text-[#8c4e2b]",
  Critical: "border-[#a5534d]/35 bg-[#a5534d]/10 text-[#7d332f]",
};

export function HealthBadge({ status }: { status: string }) {
  return <span className={`inline-flex items-center gap-2 border px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.13em] ${statusStyles[status] ?? statusStyles.Monitor}`}><span className="size-1.5 rounded-full bg-current" />{status}</span>;
}
