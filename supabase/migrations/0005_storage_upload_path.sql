-- 0005: Upload publik hanya boleh ke reports/<uuid>.<ext> di bucket report-evidence.
drop policy if exists "anon upload evidence" on storage.objects;
create policy "anon upload evidence" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'report-evidence' and name ~ '^reports/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$');
