export type ClientAccountType = "private" | "business";

export type ClientAccountSummary = {
  id: string;
  accountType: ClientAccountType;
  displayName: string;
  legalName: string | null;
  billingEmail: string | null;
  paymentTermsDays: number;
  status: string;
};

export type BusinessLocation = {
  id: string;
  clientAccountId: string;
  propertyId: string | null;
  locationName: string;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  notes: string | null;
  active: boolean;
};

export type WorkOrder = {
  id: string;
  clientAccountId: string;
  businessLocationId: string | null;
  propertyId: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  scheduledAt: string | null;
  completedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  locationName: string | null;
  locationDetail: string | null;
  propertyName: string | null;
};

export type InvoiceSummary = {
  id: string;
  clientAccountId: string;
  clientName: string;
  accountType: ClientAccountType;
  workOrderId: string | null;
  workOrderTitle: string | null;
  serviceLocation: string | null;
  invoiceNumber: string;
  status: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  paymentTermsDays: number;
  notes: string | null;
  pdfStoragePath: string | null;
};

export type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  serviceDate: string | null;
};

export type Payment = {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
};

export type InvoiceDetail = InvoiceSummary & {
  items: InvoiceItem[];
  payments: Payment[];
};

export type BusinessBillingSnapshot = {
  mode: "preview" | "live";
  errorMessage: string | null;
  account: ClientAccountSummary | null;
  locations: BusinessLocation[];
  workOrders: WorkOrder[];
  invoices: InvoiceSummary[];
};

const moneyFormatters = new Map<string, Intl.NumberFormat>();
const billingDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "America/Denver",
});

export function formatMoney(value: number, currency = "USD") {
  const normalizedCurrency = /^[A-Z]{3}$/.test(currency) ? currency : "USD";
  let formatter = moneyFormatters.get(normalizedCurrency);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: normalizedCurrency });
    moneyFormatters.set(normalizedCurrency, formatter);
  }
  return formatter.format(value);
}

export function formatBillingDate(value: string | null | undefined, fallback = "Not scheduled") {
  if (!value) return fallback;
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00Z` : value);
  return Number.isNaN(date.valueOf()) ? fallback : billingDateFormatter.format(date);
}

export function locationLabel(workOrder: Pick<WorkOrder, "locationName" | "propertyName">) {
  return workOrder.locationName ?? workOrder.propertyName ?? "Location coordinated by APRISM";
}

const previewAccount: ClientAccountSummary = {
  id: "40000000-0000-4000-8000-000000000001",
  accountType: "business",
  displayName: "Mountain Time Homes",
  legalName: "Mountain Time Homes",
  billingEmail: "billing@example.invalid",
  paymentTermsDays: 15,
  status: "active",
};

const previewLocations: BusinessLocation[] = [
  {
    id: "41000000-0000-4000-8000-000000000001",
    clientAccountId: previewAccount.id,
    propertyId: null,
    locationName: "Deer Valley Residence",
    city: "Park City",
    state: "UT",
    postalCode: "84060",
    notes: "Street and resident details intentionally omitted from demo data.",
    active: true,
  },
  {
    id: "41000000-0000-4000-8000-000000000002",
    clientAccountId: previewAccount.id,
    propertyId: null,
    locationName: "Old Town Residence",
    city: "Park City",
    state: "UT",
    postalCode: "84060",
    notes: "Street and resident details intentionally omitted from demo data.",
    active: true,
  },
];

const previewWorkOrders: WorkOrder[] = [
  {
    id: "42000000-0000-4000-8000-000000000001",
    clientAccountId: previewAccount.id,
    businessLocationId: previewLocations[0].id,
    propertyId: null,
    title: "Arrival preparation and property systems check",
    description: "Prepare the managed residence for arrival and verify priority systems.",
    status: "invoiced",
    priority: "priority",
    scheduledAt: "2026-08-28T15:00:00Z",
    completedAt: "2026-08-28T18:15:00Z",
    notes: "Development demo work order.",
    createdAt: "2026-08-25T16:00:00Z",
    updatedAt: "2026-09-01T16:00:00Z",
    locationName: previewLocations[0].locationName,
    locationDetail: "Park City, UT",
    propertyName: null,
  },
  {
    id: "42000000-0000-4000-8000-000000000002",
    clientAccountId: previewAccount.id,
    businessLocationId: previewLocations[1].id,
    propertyId: null,
    title: "Seasonal exterior readiness review",
    description: "Review exterior access, drainage, and pre-winter readiness items.",
    status: "scheduled",
    priority: "routine",
    scheduledAt: "2026-09-10T16:00:00Z",
    completedAt: null,
    notes: "Development demo work order.",
    createdAt: "2026-09-01T16:00:00Z",
    updatedAt: "2026-09-01T16:00:00Z",
    locationName: previewLocations[1].locationName,
    locationDetail: "Park City, UT",
    propertyName: null,
  },
];

const previewInvoice: InvoiceDetail = {
  id: "43000000-0000-4000-8000-000000000001",
  clientAccountId: previewAccount.id,
  clientName: previewAccount.displayName,
  accountType: "business",
  workOrderId: previewWorkOrders[0].id,
  workOrderTitle: previewWorkOrders[0].title,
  serviceLocation: previewLocations[0].locationName,
  invoiceNumber: "DEMO-MTH-2026-001",
  status: "sent",
  issueDate: "2026-09-01",
  dueDate: "2026-09-16",
  subtotal: 937.5,
  tax: 68,
  total: 1005.5,
  amountPaid: 0,
  amountDue: 1005.5,
  currency: "USD",
  paymentTermsDays: 15,
  notes: "DEVELOPMENT DEMO — not a request for payment.",
  pdfStoragePath: null,
  items: [
    { id: "44000000-0000-4000-8000-000000000001", description: "Property stewardship and arrival preparation", quantity: 2.5, unit: "hour", unitPrice: 185, amount: 462.5, serviceDate: "2026-08-28" },
    { id: "44000000-0000-4000-8000-000000000002", description: "Whole-property systems and access check", quantity: 1, unit: "service", unitPrice: 325, amount: 325, serviceDate: "2026-08-28" },
    { id: "44000000-0000-4000-8000-000000000003", description: "Guest-readiness supplies and coordination", quantity: 1, unit: "allowance", unitPrice: 150, amount: 150, serviceDate: "2026-08-28" },
  ],
  payments: [],
};

export const previewBusinessBillingSnapshot: BusinessBillingSnapshot = {
  mode: "preview",
  errorMessage: null,
  account: previewAccount,
  locations: previewLocations,
  workOrders: previewWorkOrders,
  invoices: [previewInvoice],
};

export const previewInvoiceDetail = previewInvoice;
