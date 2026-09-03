export function PortalPageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="flex flex-col gap-5 border-b border-black/10 pb-7 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[#8c6f3c]">{eyebrow}</p><h1 className="mt-2 font-serif text-4xl leading-none tracking-[-0.025em] sm:text-5xl">{title}</h1>{description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-black/48">{description}</p> : null}</div>{action}</div>;
}

export function Panel({ title, eyebrow, action, children, className = "" }: { title: string; eyebrow?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <section className={`border border-black/10 bg-[#f8f7f2] ${className}`}><div className="flex min-h-16 items-center justify-between border-b border-black/10 px-5 sm:px-6"><div>{eyebrow ? <p className="text-[0.5rem] font-semibold uppercase tracking-[0.16em] text-black/34">{eyebrow}</p> : null}<h2 className="font-serif text-2xl">{title}</h2></div>{action}</div>{children}</section>;
}

export function Metric({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return <article className="border border-black/10 bg-[#f8f7f2] p-5"><p className="text-[0.54rem] font-semibold uppercase tracking-[0.15em] text-black/36">{label}</p><p className="mt-5 font-serif text-4xl leading-none">{value}</p><p className="mt-3 text-xs text-black/42">{detail}</p></article>;
}

export function PortalDataNotice({ message }: { message: string }) {
  return <div role="alert" className="mt-7 border border-[#a5534d]/25 bg-[#a5534d]/8 px-5 py-4 text-sm leading-6 text-[#713a36]">{message}</div>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="px-5 py-10 text-center sm:px-6"><h3 className="font-serif text-2xl">{title}</h3><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-black/42">{description}</p></div>;
}
