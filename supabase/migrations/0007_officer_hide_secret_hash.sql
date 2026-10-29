-- 0007: Petugas boleh membaca laporan, tetapi tidak kolom secret_hash.
revoke select on public.reports from authenticated;
grant select (id, public_id, category, fertilizer_id, region_code, kabkota_name, kecamatan, desa, kiosk_name,
  incident_date, quantity_kg, price_paid_per_kg, het_per_kg, description, contact, photo_paths,
  needs_field_check, status, assigned_agency, due_at, created_at, updated_at) on public.reports to authenticated;
