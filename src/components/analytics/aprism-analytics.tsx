"use client";

import { GoogleAnalytics, sendGAEvent } from "@next/third-parties/google";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

type MarketingEventName =
  | "assessment_start"
  | "generate_lead"
  | "view_memberships"
  | "view_moto";

type MarketingEventParameters = Record<string, string | number | boolean>;

function currentPageLocation() {
  return `${window.location.origin}${window.location.pathname}`;
}

export function trackMarketingEvent(
  eventName: MarketingEventName,
  parameters: MarketingEventParameters = {},
) {
  if (!measurementId || typeof window === "undefined") return;

  window.dataLayer = window.dataLayer ?? [];
  sendGAEvent("event", eventName, {
    ...parameters,
    page_location: currentPageLocation(),
  });
}

function MarketingRouteEvents() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;

    if (pathname === "/memberships") {
      trackMarketingEvent("view_memberships");
    } else if (pathname === "/moto") {
      trackMarketingEvent("view_moto");
    }
  }, [pathname]);

  return null;
}

export function AprismAnalytics() {
  if (!measurementId) return null;

  return (
    <>
      <GoogleAnalytics gaId={measurementId} />
      <MarketingRouteEvents />
    </>
  );
}
