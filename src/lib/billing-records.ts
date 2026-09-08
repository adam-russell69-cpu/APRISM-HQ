import "server-only";

import { cache } from "react";
import {
  previewBusinessBillingSnapshot,
  previewInvoiceDetail,
  type BusinessBillingSnapshot,
  type BusinessLocation,
  type ClientAccountSummary,
  type InvoiceDetail,
  type InvoiceItem,
  type InvoiceSummary,
  type Payment,
  type WorkOrder,
} from "@/lib/billing";
import { createClient } from "@/lib/supabase/server";

type Relation<T> = T | T[] | null;
type AccountRow = {
  id: string;
  account_type: "private" | "business";
  display_name: string;
  legal_name: string | null;
  billing_email: string | null;
  payment_terms_days: number;
  status: string;
};
type LocationRelation = { location_name: string; city?: string | null; state?: string | null };
type PropertyRelation = { name: string };
type WorkOrderRelation = {
  title: string;
  business_locations: Relation<LocationRelation>;
  properties: Relation<PropertyRelation>;
};
type WorkOrderRow = {
  id: string;
  client_account_id: string;
  business_location_id: string | null;
  property_id: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  scheduled_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  business_locations: Relation<LocationRelation>;
  properties: Relation<PropertyRelation>;
};
type InvoiceRow = {
  id: string;
  client_account_id: string;
  work_order_id: string | null;
  invoice_number: string;
  status: string;
  issue_date: string;
  due_date: string;
  subtotal: number | string;
  tax: number | string;
  total: number | string;
  amount_paid: number | string;
  amount_due: number | string;
  currency: string;
  payment_terms_days: number;
  notes: string | null;
  pdf_storage_path: string | null;
  client_accounts: Relation<Pick<AccountRow, "display_name" | "account_type">>;
  work_orders: Relation<WorkOrderRelation>;
};

function firstRelation<T>(value: Relation<T>): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function numberValue(value: number | string | null | undefined) {
  const result = Number(value ?? 0);
  return Number.isFinite(result) ? result : 0;
}

function mapAccount(row: AccountRow): ClientAccountSummary {
  return {
    id: row.id,
    accountType: row.account_type,
    displayName: row.display_name,
    legalName: row.legal_name,
    billingEmail: row.billing_email,
    paymentTermsDays: row.payment_terms_days,
    status: row.status,
  };
}

function mapLocation(row: {
  id: string;
  client_account_id: string;
  property_id: string | null;
  location_name: string;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  notes: string | null;
  active: boolean;
}): BusinessLocation {
  return {
    id: row.id,
    clientAccountId: row.client_account_id,
    propertyId: row.property_id,
    locationName: row.location_name,
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    notes: row.notes,
    active: row.active,
  };
}

function mapWorkOrder(row: WorkOrderRow): WorkOrder {
  const location = firstRelation(row.business_locations);
  const property = firstRelation(row.properties);
  return {
    id: row.id,
    clientAccountId: row.client_account_id,
    businessLocationId: row.business_location_id,
    propertyId: row.property_id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    scheduledAt: row.scheduled_at,
    completedAt: row.completed_at,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    locationName: location?.location_name ?? null,
    locationDetail: location ? [location.city, location.state].filter(Boolean).join(", ") || null : null,
    propertyName: property?.name ?? null,
  };
}

function mapInvoice(row: InvoiceRow): InvoiceSummary {
  const account = firstRelation(row.client_accounts);
  const workOrder = firstRelation(row.work_orders);
  const location = workOrder ? firstRelation(workOrder.business_locations) : null;
  const property = workOrder ? firstRelation(workOrder.properties) : null;
  return {
    id: row.id,
    clientAccountId: row.client_account_id,
    clientName: account?.display_name ?? "APRISM client",
    accountType: account?.account_type ?? "private",
    workOrderId: row.work_order_id,
    workOrderTitle: workOrder?.title ?? null,
    serviceLocation: location?.location_name ?? property?.name ?? null,
    invoiceNumber: row.invoice_number,
    status: row.status,
    issueDate: row.issue_date,
    dueDate: row.due_date,
    subtotal: numberValue(row.subtotal),
    tax: numberValue(row.tax),
    total: numberValue(row.total),
    amountPaid: numberValue(row.amount_paid),
    amountDue: numberValue(row.amount_due),
    currency: row.currency,
    paymentTermsDays: row.payment_terms_days,
    notes: row.notes,
    pdfStoragePath: row.pdf_storage_path,
  };
}

const workOrderSelect = "id, client_account_id, business_location_id, property_id, title, description, status, priority, scheduled_at, completed_at, notes, created_at, updated_at, business_locations(location_name, city, state), properties(name)";
const invoiceSelect = "id, client_account_id, work_order_id, invoice_number, status, issue_date, due_date, subtotal, tax, total, amount_paid, amount_due, currency, payment_terms_days, notes, pdf_storage_path, client_accounts(display_name, account_type), work_orders(title, business_locations(location_name), properties(name))";

export const getBusinessBillingSnapshot = cache(async (): Promise<BusinessBillingSnapshot> => {
  const supabase = await createClient();
  if (!supabase) return previewBusinessBillingSnapshot;

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claimsData?.claims?.sub) {
    return { mode: "live", errorMessage: "Your secure portal session could not be verified. Please sign in again.", account: null, locations: [], workOrders: [], invoices: [] };
  }

  const accountResult = await supabase
    .from("client_accounts")
    .select("id, account_type, display_name, legal_name, billing_email, payment_terms_days, status")
    .eq("account_type", "business")
    .eq("status", "active")
    .order("display_name")
    .limit(1)
    .maybeSingle();

  if (accountResult.error) {
    console.error("[billing-records] Business account lookup failed", { code: accountResult.error.code, message: accountResult.error.message });
    return { mode: "live", errorMessage: "APRISM could not load this business account right now.", account: null, locations: [], workOrders: [], invoices: [] };
  }
  if (!accountResult.data) return { mode: "live", errorMessage: null, account: null, locations: [], workOrders: [], invoices: [] };

  const account = mapAccount(accountResult.data as AccountRow);
  const [locationsResult, workOrdersResult, invoicesResult] = await Promise.all([
    supabase.from("business_locations").select("id, client_account_id, property_id, location_name, city, state, postal_code, notes, active").eq("client_account_id", account.id).order("location_name"),
    supabase.from("work_orders").select(workOrderSelect).eq("client_account_id", account.id).order("created_at", { ascending: false }),
    supabase.from("invoices").select(invoiceSelect).eq("client_account_id", account.id).order("issue_date", { ascending: false }),
  ]);

  const failedResult = [locationsResult, workOrdersResult, invoicesResult].find((result) => result.error);
  if (failedResult?.error) {
    console.error("[billing-records] Business snapshot query failed", { code: failedResult.error.code, message: failedResult.error.message });
    return { mode: "live", errorMessage: "APRISM could not load all business records right now.", account, locations: [], workOrders: [], invoices: [] };
  }

  return {
    mode: "live",
    errorMessage: null,
    account,
    locations: (locationsResult.data ?? []).map((row) => mapLocation(row)),
    workOrders: (workOrdersResult.data ?? []).map((row) => mapWorkOrder(row as unknown as WorkOrderRow)),
    invoices: (invoicesResult.data ?? []).map((row) => mapInvoice(row as unknown as InvoiceRow)),
  };
});

export const getBusinessWorkOrder = cache(async (id: string): Promise<WorkOrder | null> => {
  const supabase = await createClient();
  if (!supabase) return previewBusinessBillingSnapshot.workOrders.find((workOrder) => workOrder.id === id) ?? null;

  const { data, error } = await supabase.from("work_orders").select(workOrderSelect).eq("id", id).maybeSingle();
  if (error) {
    console.error("[billing-records] Work order lookup failed", { code: error.code, message: error.message });
    return null;
  }
  return data ? mapWorkOrder(data as unknown as WorkOrderRow) : null;
});

export const getClientInvoices = cache(async (): Promise<{ mode: "preview" | "live"; invoices: InvoiceSummary[]; errorMessage: string | null }> => {
  const supabase = await createClient();
  if (!supabase) return { mode: "preview", invoices: previewBusinessBillingSnapshot.invoices, errorMessage: null };

  const { data, error } = await supabase.from("invoices").select(invoiceSelect).order("issue_date", { ascending: false });
  if (error) {
    console.error("[billing-records] Invoice list query failed", { code: error.code, message: error.message });
    return { mode: "live", invoices: [], errorMessage: "APRISM could not load invoices right now." };
  }
  return { mode: "live", invoices: (data ?? []).map((row) => mapInvoice(row as unknown as InvoiceRow)), errorMessage: null };
});

export const getInvoiceByNumber = cache(async (invoiceNumber: string): Promise<{ mode: "preview" | "live"; invoice: InvoiceDetail | null }> => {
  const supabase = await createClient();
  if (!supabase) return { mode: "preview", invoice: invoiceNumber === previewInvoiceDetail.invoiceNumber ? previewInvoiceDetail : null };

  const invoiceResult = await supabase.from("invoices").select(invoiceSelect).eq("invoice_number", invoiceNumber).maybeSingle();
  if (invoiceResult.error || !invoiceResult.data) {
    if (invoiceResult.error) console.error("[billing-records] Invoice detail query failed", { code: invoiceResult.error.code, message: invoiceResult.error.message });
    return { mode: "live", invoice: null };
  }

  const invoice = mapInvoice(invoiceResult.data as unknown as InvoiceRow);
  const [itemsResult, paymentsResult] = await Promise.all([
    supabase.from("invoice_items").select("id, description, quantity, unit, unit_price, amount, service_date").eq("invoice_id", invoice.id).order("created_at"),
    supabase.from("payments").select("id, invoice_id, amount, currency, payment_method, status, paid_at, created_at").eq("invoice_id", invoice.id).order("created_at", { ascending: false }),
  ]);

  if (itemsResult.error || paymentsResult.error) {
    console.error("[billing-records] Invoice child-record query failed", {
      items: itemsResult.error?.message,
      payments: paymentsResult.error?.message,
    });
  }

  const items: InvoiceItem[] = (itemsResult.data ?? []).map((row) => ({
    id: row.id,
    description: row.description,
    quantity: numberValue(row.quantity),
    unit: row.unit,
    unitPrice: numberValue(row.unit_price),
    amount: numberValue(row.amount),
    serviceDate: row.service_date,
  }));
  const payments: Payment[] = (paymentsResult.data ?? []).map((row) => ({
    id: row.id,
    invoiceId: row.invoice_id,
    amount: numberValue(row.amount),
    currency: row.currency,
    paymentMethod: row.payment_method,
    status: row.status,
    paidAt: row.paid_at,
    createdAt: row.created_at,
  }));

  return { mode: "live", invoice: { ...invoice, items, payments } };
});
