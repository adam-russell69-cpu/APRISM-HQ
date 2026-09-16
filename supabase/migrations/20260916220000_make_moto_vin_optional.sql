-- Allow a Moto customer and motorcycle to be created before the VIN is known.
-- VIN can be added later when the motorcycle arrives or the customer provides it.

alter table public.motorcycles
  alter column vin drop not null;

alter table public.motorcycles
  drop constraint if exists motorcycles_vin_check;

alter table public.motorcycles
  add constraint motorcycles_vin_check
  check (vin is null or length(btrim(vin)) between 5 and 32);
