alter table public.vendors
  add column if not exists status text not null default 'candidate'
    check (status in ('candidate','vetted','preferred','inactive')),
  add column if not exists coverage_area text,
  add column if not exists emergency_availability text not null default 'unknown'
    check (emergency_availability in ('unknown','none','after_hours','24_7')),
  add column if not exists standard_rates text,
  add column if not exists emergency_rates text,
  add column if not exists license_required boolean not null default false,
  add column if not exists license_verified boolean not null default false,
  add column if not exists license_number text,
  add column if not exists license_expires_on date,
  add column if not exists insurance_verified boolean not null default false,
  add column if not exists insurance_expires_on date,
  add column if not exists w9_received boolean not null default false,
  add column if not exists w9_received_on date,
  add column if not exists client_approval_required boolean not null default false,
  add column if not exists client_approval_status text not null default 'not_required'
    check (client_approval_status in ('not_required','pending','approved','restricted')),
  add column if not exists service_request_method text,
  add column if not exists service_request_process text,
  add column if not exists approval_checkpoint text not null default 'intake'
    check (approval_checkpoint in ('intake','documentation','operational_review','vetted','preferred','rejected')),
  add column if not exists approved_by text,
  add column if not exists approved_at timestamptz;
