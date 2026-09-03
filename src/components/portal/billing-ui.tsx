const statusTones: Record<string, string> = {
  draft: "border-black/12 bg-black/[0.035] text-black/50",
  sent: "border-[#8c6f3c]/30 bg-[#8c6f3c]/10 text-[#765b2d]",
  requested: "border-[#8c6f3c]/30 bg-[#8c6f3c]/10 text-[#765b2d]",
  approved: "border-[#68767a]/30 bg-[#68767a]/10 text-[#506064]",
  scheduled: "border-[#68767a]/30 bg-[#68767a]/10 text-[#506064]",
  "in progress": "border-[#76688a]/30 bg-[#76688a]/10 text-[#5e506f]",
  completed: "border-[#607568]/30 bg-[#607568]/10 text-[#4d6356]",
  invoiced: "border-[#607568]/30 bg-[#607568]/10 text-[#4d6356]",
  "partially paid": "border-[#8c6f3c]/30 bg-[#8c6f3c]/10 text-[#765b2d]",
  paid: "border-[#607568]/30 bg-[#607568]/10 text-[#4d6356]",
  succeeded: "border-[#607568]/30 bg-[#607568]/10 text-[#4d6356]",
  pending: "border-[#68767a]/30 bg-[#68767a]/10 text-[#506064]",
  overdue: "border-[#955047]/30 bg-[#955047]/10 text-[#793e38]",
  failed: "border-[#955047]/30 bg-[#955047]/10 text-[#793e38]",
  void: "border-black/12 bg-black/[0.035] text-black/50",
  cancelled: "border-black/12 bg-black/[0.035] text-black/50",
  refunded: "border-[#76688a]/30 bg-[#76688a]/10 text-[#5e506f]",
};

export function labelBillingStatus(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

export function BillingStatusBadge({ status }: { status: string }) {
  const normalized = status.replaceAll("_", " ").toLowerCase();
  const tone = statusTones[normalized] ?? "border-black/12 bg-black/[0.035] text-black/50";
  return <span className={`inline-flex w-fit border px-2.5 py-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.12em] ${tone}`}>{labelBillingStatus(status)}</span>;
}

export function DemoBillingNotice() {
  return <div className="mt-6 border border-[#8c6f3c]/25 bg-[#8c6f3c]/8 px-5 py-4 text-xs leading-6 text-[#6f562c]"><span className="font-semibold uppercase tracking-[0.12em]">Development demo</span> · Mountain Time Homes records contain no resident details and no completed payments. Connect Supabase and link an authenticated account member to exercise the live RLS path.</div>;
}

export function BillingDataNotice({ message }: { message: string }) {
  return <div role="alert" className="mt-7 border border-[#a5534d]/25 bg-[#a5534d]/8 px-5 py-4 text-sm leading-6 text-[#713a36]">{message}</div>;
}

export function BillingEmptyState({ title, description }: { title: string; description: string }) {
  return <div className="px-5 py-10 text-center sm:px-6"><h3 className="font-serif text-2xl">{title}</h3><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-black/42">{description}</p></div>;
}
