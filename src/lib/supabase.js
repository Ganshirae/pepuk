import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error('VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY wajib diisi di .env');
}

export const supabase = createClient(url, key, {
  auth: { persistSession: true }
});

// RPC publik: lempar error dengan pesan dari server (sudah aman & berbahasa Indonesia).
export async function rpc(name, args = {}) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw new Error(error.message);
  return data;
}

// Semua data referensi publik dalam satu kali muat (ukurannya kecil: <1.000 baris).
export async function loadReferenceData() {
  const [regions, fertilizers, het, stats, sources] = await Promise.all([
    supabase.from('regions').select('code,name,level,parent_code').order('code'),
    supabase.from('fertilizer_types').select('id,name,sort_order').order('sort_order'),
    supabase.from('het_rates').select('fertilizer_id,price_per_kg,pack_kg,regulation,effective_from,source_id').order('effective_from', { ascending: false }),
    supabase.from('distribution_stats').select('region_code,fertilizer_id,year,allocation_ton,realization_ton,realization_pct,source_id').limit(5000),
    supabase.from('data_sources').select('*')
  ]);
  const failed = [regions, fertilizers, het, stats, sources].find((r) => r.error);
  if (failed) throw new Error(failed.error.message);

  // HET terbaru per jenis pupuk
  const hetLatest = [];
  for (const h of het.data) {
    if (!hetLatest.some((x) => x.fertilizer_id === h.fertilizer_id)) hetLatest.push(h);
  }

  return {
    regions: regions.data,
    fertilizers: fertilizers.data,
    het: hetLatest,
    stats: stats.data.map((s) => ({
      ...s,
      allocation_ton: s.allocation_ton === null ? null : Number(s.allocation_ton),
      realization_ton: s.realization_ton === null ? null : Number(s.realization_ton),
      realization_pct: s.realization_pct === null ? null : Number(s.realization_pct)
    })),
    sources: Object.fromEntries(sources.data.map((s) => [s.id, s]))
  };
}
