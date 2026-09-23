import "server-only";

import { cache } from "react";
import {
  healthLabel,
  humanizeStatus,
  previewPortalSnapshot,
  type PortalSnapshot,
} from "@/lib/portal-data";
import { getPortalScope } from "@/lib/portal-scope";
import { createClient } from "@/lib/supabase/server";

const emptyLiveSnapshot: PortalSnapshot = {
  mode: "live",
  errorMessage: null,
  properties: [],
  systems: [],
  inspections: [],
  inspectionItems: [],
  maintenanceTasks: [],
  issues: [],
  documents: [],
  vendors: [],
  propertyVendors: [],
  serviceRequests: [],
};

export const getPortalSnapshot = cache(async (): Promise<PortalSnapshot> => {
  const supabase = await createClient();
  if (!supabase) return previewPortalSnapshot;

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (claimsError || !userId) {
    return { ...emptyLiveSnapshot, errorMessage: "Your secure portal session could not be verified. Please sign in again." };
  }

  let portalPropertyIds: string[] = [];
  try {
    const scope = await getPortalScope(supabase, userId);
    portalPropertyIds = scope.propertyIds;
  } catch (error) {
    console.error("[portal-records] Portal scope lookup failed", error);
    return { ...emptyLiveSnapshot, errorMessage: "APRISM could not verify your property access right now. Please try again shortly." };
  }

  if (!portalPropertyIds.length) {
    return { ...emptyLiveSnapshot, errorMessage: "No property is currently linked to this portal account." };
  }

  const [
    propertiesResult,
    systemsResult,
    inspectionsResult,
    inspectionItemsResult,
    maintenanceResult,
    issuesResult,
    documentsResult,
    vendorsResult,
    propertyVendorsResult,
    serviceRequestsResult,
  ] = await Promise.all([
    supabase.from("properties").select("id, name, city, state, property_type, occupancy_type, approximate_sq_ft, year_built, health_status, summary, created_at, updated_at").order("name"),
    supabase.from("property_systems").select("id, property_id, name, category, manufacturer, model_number, status, installed_on, warranty_expires_on, service_interval, notes, updated_at").order("name"),
    supabase.from("inspections").select("id, property_id, inspection_type, status, health_status, scheduled_for, completed_at, summary, updated_at").order("scheduled_for", { ascending: false }),
    supabase.from("inspection_items").select("id, inspection_id, title, area, status, observation, recommendation, photo_paths").order("created_at", { ascending: false }),
    supabase.from("maintenance_tasks").select("id, property_id, property_system_id, vendor_id, title, description, status, priority, due_date, completed_at, recurrence, updated_at").order("due_date", { ascending: true, nullsFirst: false }),
    supabase.from("issues").select("id, property_id, inspection_id, assigned_vendor_id, title, description, status, severity, resolved_at, created_at, updated_at").order("created_at", { ascending: false }),
    supabase.from("documents").select("id, property_id, name, category, mime_type, size_bytes, updated_at").order("updated_at", { ascending: false }),
    supabase.from("vendors").select("id, name, trade, primary_contact").order("name"),
    supabase.from("property_vendors").select("id, property_id, vendor_id, scope, is_preferred").order("created_at"),
    supabase.from("service_requests").select("id, property_id, category, title, description, preferred_timing, status, created_at, updated_at").order("created_at", { ascending: false }),
  ]);

  const failedResult = [
    propertiesResult,
    systemsResult,
    inspectionsResult,
    inspectionItemsResult,
    maintenanceResult,
    issuesResult,
    documentsResult,
    vendorsResult,
    propertyVendorsResult,
    serviceRequestsResult,
  ].find((result) => result.error);

  if (failedResult?.error) {
    console.error("[portal-records] Member-scoped portal query failed", {
      code: failedResult.error.code,
      message: failedResult.error.message,
    });
    return { ...emptyLiveSnapshot, errorMessage: "APRISM could not load the property record right now. Please try again shortly." };
  }

  const propertySet = new Set(portalPropertyIds);
  const properties = (propertiesResult.data ?? []).filter((row) => propertySet.has(row.id));
  const systems = (systemsResult.data ?? []).filter((row) => propertySet.has(row.property_id));
  const inspections = (inspectionsResult.data ?? []).filter((row) => propertySet.has(row.property_id));
  const inspectionIds = new Set(inspections.map((row) => row.id));
  const inspectionItems = (inspectionItemsResult.data ?? []).filter((row) => inspectionIds.has(row.inspection_id));
  const maintenanceTasks = (maintenanceResult.data ?? []).filter((row) => propertySet.has(row.property_id));
  const issues = (issuesResult.data ?? []).filter((row) => propertySet.has(row.property_id));
  const documents = (documentsResult.data ?? []).filter((row) => propertySet.has(row.property_id));
  const propertyVendors = (propertyVendorsResult.data ?? []).filter((row) => propertySet.has(row.property_id));
  const vendorIds = new Set(propertyVendors.map((row) => row.vendor_id));
  const vendors = (vendorsResult.data ?? []).filter((row) => vendorIds.has(row.id));
  const serviceRequests = (serviceRequestsResult.data ?? []).filter((row) => propertySet.has(row.property_id));

  return {
    mode: "live",
    errorMessage: null,
    properties: properties.map((row) => ({
      id: row.id,
      name: row.name,
      location: [row.city, row.state].filter(Boolean).join(", "),
      type: humanizeStatus(row.occupancy_type || row.property_type, "Residence"),
      size: row.approximate_sq_ft ? `${row.approximate_sq_ft.toLocaleString("en-US")} sq. ft.` : "Not recorded",
      built: row.year_built ? String(row.year_built) : "Not recorded",
      health: healthLabel(row.health_status),
      summary: row.summary,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    systems: systems.map((row) => ({
      id: row.id,
      propertyId: row.property_id,
      name: row.name,
      category: row.category,
      manufacturer: row.manufacturer,
      modelNumber: row.model_number,
      status: healthLabel(row.status),
      installedOn: row.installed_on,
      warrantyExpiresOn: row.warranty_expires_on,
      serviceInterval: row.service_interval,
      notes: row.notes,
      updatedAt: row.updated_at,
    })),
    inspections: inspections.map((row) => ({
      id: row.id,
      propertyId: row.property_id,
      type: humanizeStatus(row.inspection_type, "Property inspection"),
      status: humanizeStatus(row.status),
      health: healthLabel(row.health_status),
      scheduledFor: row.scheduled_for,
      completedAt: row.completed_at,
      summary: row.summary,
      updatedAt: row.updated_at,
    })),
    inspectionItems: inspectionItems.map((row) => ({
      id: row.id,
      inspectionId: row.inspection_id,
      title: row.title,
      area: row.area,
      status: healthLabel(row.status),
      observation: row.observation,
      recommendation: row.recommendation,
      photoCount: row.photo_paths.length,
    })),
    maintenanceTasks: maintenanceTasks.map((row) => ({
      id: row.id,
      propertyId: row.property_id,
      propertySystemId: row.property_system_id,
      vendorId: row.vendor_id,
      title: row.title,
      description: row.description,
      status: humanizeStatus(row.status),
      priority: humanizeStatus(row.priority),
      dueDate: row.due_date,
      completedAt: row.completed_at,
      recurrence: row.recurrence,
      updatedAt: row.updated_at,
    })),
    issues: issues.map((row) => ({
      id: row.id,
      propertyId: row.property_id,
      inspectionId: row.inspection_id,
      assignedVendorId: row.assigned_vendor_id,
      title: row.title,
      description: row.description,
      status: humanizeStatus(row.status),
      severity: healthLabel(row.severity),
      resolvedAt: row.resolved_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    documents: documents.map((row) => ({
      id: row.id,
      propertyId: row.property_id,
      name: row.name,
      category: humanizeStatus(row.category, "Document"),
      mimeType: row.mime_type,
      sizeBytes: row.size_bytes,
      updatedAt: row.updated_at,
    })),
    vendors: vendors.map((row) => ({
      id: row.id,
      name: row.name,
      trade: row.trade,
      primaryContact: row.primary_contact,
    })),
    propertyVendors: propertyVendors.map((row) => ({
      id: row.id,
      propertyId: row.property_id,
      vendorId: row.vendor_id,
      scope: row.scope,
      isPreferred: row.is_preferred,
    })),
    serviceRequests: serviceRequests.map((row) => ({
      id: row.id,
      propertyId: row.property_id,
      category: humanizeStatus(row.category),
      title: row.title,
      description: row.description,
      preferredTiming: row.preferred_timing,
      status: humanizeStatus(row.status),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
  };
});
