"use client";

import { Printer } from "lucide-react";
import { adminSecondaryButton } from "./admin-page-header";

export function PrintControl() {
  return <button type="button" onClick={() => window.print()} className={`print-hidden ${adminSecondaryButton}`}><Printer aria-hidden="true" className="size-4" />Print</button>;
}
