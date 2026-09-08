import { Panel, PortalPageHeader } from "@/components/portal/portal-ui";
import { getPortalAccount } from "@/lib/portal-account";

function formatContactMethod(value: string | null) {
  if (!value) return "Not provided";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default async function ProfilePage() {
  const account = await getPortalAccount();
  const contactDetails = [
    ["Name", account.fullName ?? "Not provided"],
    ["Email", account.email ?? "Not provided"],
    ["Phone", account.phone ?? "Not provided"],
    ["Preferred contact", formatContactMethod(account.preferredContactMethod)],
  ];
  const roleLabel = account.role
    ? `${account.role.charAt(0).toUpperCase()}${account.role.slice(1)} access`
    : "Member access";

  return (
    <main className="mx-auto max-w-[1480px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
      <PortalPageHeader eyebrow="Client preferences" title="Profile" description="Contact details, communication preferences, and authorized property access." />
      <div className="mt-7 grid gap-5 xl:grid-cols-2">
        <Panel title="Contact information" eyebrow="Account">
          <div className="grid gap-px bg-black/10 sm:grid-cols-2">
            {contactDetails.map(([label, value]) => (
              <div key={label} className="bg-[#f8f7f2] p-5">
                <p className="text-[0.5rem] uppercase tracking-[0.14em] text-black/34">{label}</p>
                <p className="mt-2 text-sm">{value}</p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Property access" eyebrow="Membership">
          <div className="p-6">
            <p className="font-serif text-3xl">{account.propertyName ?? "APRISM property"}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.13em] text-black/38">{roleLabel} · Full property record</p>
            <p className="mt-6 text-sm leading-6 text-black/48">Access is granted explicitly through APRISM property membership records and protected by database row-level security.</p>
          </div>
        </Panel>
      </div>
    </main>
  );
}
