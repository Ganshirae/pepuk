-- 0003: Validasi eksplisit di submit_report.
-- Tanpa ini, pelanggaran CHECK mengembalikan pesan Postgres berisi seluruh baris (termasuk secret_hash) ke publik.

create or replace function public.submit_report(p jsonb)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_secret text := public.random_code(4) || '-' || public.random_code(4);
  v_public text;
  v_id     uuid;
  v_fert   text := nullif(p->>'fertilizer_id', '');
  v_desc   text := trim(coalesce(p->>'description', ''));
  v_date   date;
  v_qty    numeric;
  v_price  numeric;
  v_photos text[];
  v_due    timestamptz := public.add_working_days(now(), 3);
begin
  begin
    v_date   := (p->>'incident_date')::date;
    v_qty    := (p->>'quantity_kg')::numeric;
    v_price  := (p->>'price_paid_per_kg')::numeric;
    v_photos := coalesce(array(select jsonb_array_elements_text(p->'photo_paths')), '{}');
  exception when others then
    raise exception 'Format tanggal, jumlah, harga, atau foto tidak valid' using errcode = '22023';
  end;

  if p->>'category' is null or p->>'category' not in ('harga_di_atas_het', 'stok_kosong', 'tidak_terdaftar',
       'paket_paksa', 'penebusan_diwakilkan', 'pupuk_palsu', 'lainnya') then
    raise exception 'Kategori laporan tidak valid' using errcode = '22023';
  end if;
  if not exists (select 1 from public.regions where code = p->>'region_code') then
    raise exception 'Wilayah tidak valid' using errcode = '22023';
  end if;
  if v_fert is not null and not exists (select 1 from public.fertilizer_types where id = v_fert) then
    raise exception 'Jenis pupuk tidak valid' using errcode = '22023';
  end if;
  if v_date is null or v_date > current_date or v_date < current_date - interval '2 years' then
    raise exception 'Tanggal kejadian wajib diisi, tidak boleh di masa depan atau lebih dari 2 tahun lalu' using errcode = '22023';
  end if;
  if length(v_desc) not between 20 and 2000 then
    raise exception 'Kronologi wajib 20–2000 karakter' using errcode = '22023';
  end if;
  if coalesce(v_qty, 1) <= 0 or coalesce(v_price, 1) <= 0 then
    raise exception 'Jumlah dan harga harus lebih dari 0' using errcode = '22023';
  end if;
  if length(coalesce(p->>'contact', '')) > 100 or length(coalesce(p->>'kiosk_name', '')) > 150
     or length(coalesce(p->>'kecamatan', '')) > 100 or length(coalesce(p->>'desa', '')) > 100 then
    raise exception 'Isian terlalu panjang' using errcode = '22023';
  end if;
  if cardinality(v_photos) > 3 or exists (select 1 from unnest(v_photos) x where x !~ '^[A-Za-z0-9/_.-]{1,200}$') then
    raise exception 'Maksimal 3 foto dengan nama berkas valid' using errcode = '22023';
  end if;
  if p->>'category' = 'harga_di_atas_het' and (v_fert is null or v_price is null) then
    raise exception 'Laporan harga wajib menyertakan jenis pupuk dan harga per kg yang dibayar' using errcode = '22023';
  end if;

  loop
    v_public := 'PP-' || to_char(now(), 'YYYY') || '-' || public.random_code(6);
    exit when not exists (select 1 from public.reports where public_id = v_public);
  end loop;

  insert into public.reports (public_id, secret_hash, category, fertilizer_id, region_code, kecamatan, desa,
    kiosk_name, incident_date, quantity_kg, price_paid_per_kg, het_per_kg, description, contact, photo_paths, due_at)
  values (v_public, extensions.crypt(v_secret, extensions.gen_salt('bf')), p->>'category', v_fert,
    p->>'region_code', nullif(trim(p->>'kecamatan'), ''), nullif(trim(p->>'desa'), ''),
    nullif(trim(p->>'kiosk_name'), ''), v_date, v_qty, v_price,
    case when v_fert is not null then public.het_on(v_fert, v_date) end,
    v_desc, nullif(trim(p->>'contact'), ''), v_photos, v_due)
  returning id into v_id;

  insert into public.report_events (report_id, status, actor, note, due_at)
  values (v_id, 'diterima', 'sistem', 'Laporan diterima dan menunggu verifikasi petugas.', v_due);

  return jsonb_build_object('public_id', v_public, 'secret_code', v_secret, 'due_at', v_due);
exception
  when sqlstate '22023' then raise;
  when others then raise exception 'Laporan gagal disimpan, periksa kembali isian' using errcode = '22023';
end $$;
