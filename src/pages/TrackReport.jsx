import React, { useEffect, useState } from 'react';
import { Search, CheckCircle2, Clock, AlertTriangle, Building2, UserCheck, RotateCcw, Check, Circle } from 'lucide-react';
import { rpc } from '../lib/supabase';
import { REPORT_CATEGORIES, REPORT_STATUS, STATUS_STEPS } from '../data/ntbData';

const dt = (iso) => (iso ? new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '–');
const rp = (n) => `Rp${Math.round(n).toLocaleString('id-ID')}`;
const ACTOR = { sistem: 'Sistem', petugas: 'Petugas', pelapor: 'Pelapor' };
const ERRORS = {
  not_found: 'ID atau kode rahasia tidak cocok. Periksa kembali (huruf besar/kecil tidak berpengaruh).',
  rate_limited: 'Terlalu banyak percobaan. Tunggu 1 menit lalu coba lagi.',
  invalid_state: 'Konfirmasi hanya bisa dilakukan setelah instansi menyatakan laporan selesai.'
};

// Posisi laporan pada urutan tahap. 'dibuka_kembali' dikembalikan ke tahap tindak lanjut.
function stepIndex(status) {
  if (status === 'dibuka_kembali') return STATUS_STEPS.findIndex((s) => s.id === 'ditindaklanjuti');
  return STATUS_STEPS.findIndex((s) => s.id === status);
}

export default function TrackReport({ initialLookup, setActivePage }) {
  const [publicId, setPublicId] = useState(initialLookup?.publicId || '');
  const [secret, setSecret] = useState(initialLookup?.secretCode || '');
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');
  const [feedback, setFeedback] = useState('');

  const search = async (id = publicId, code = secret) => {
    if (!id.trim() || !code.trim()) return setError('Isi ID laporan dan kode rahasia.');
    setLoading(true);
    setError('');
    setFeedback('');
    try {
      const res = await rpc('track_report', { p_public_id: id, p_secret: code });
      if (res.error) {
        setReport(null);
        setError(ERRORS[res.error] || 'Gagal memeriksa laporan.');
      } else setReport(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialLookup?.publicId && initialLookup?.secretCode) search(initialLookup.publicId, initialLookup.secretCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLookup]);

  const confirm = async (resolved) => {
    setLoading(true);
    try {
      const res = await rpc('confirm_resolution', { p_public_id: publicId, p_secret: secret, p_resolved: resolved, p_note: note || null });
      if (res.error) return setError(ERRORS[res.error] || 'Konfirmasi gagal.');
      setReport(res);
      setNote('');
      setFeedback(resolved ? 'Terima kasih. Laporan dinyatakan selesai atas konfirmasi Anda.' : 'Laporan dibuka kembali dan dikembalikan ke petugas dengan tenggat baru 14 hari kerja.');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const current = report ? stepIndex(report.status) : -1;
  const lastByStatus = report ? Object.fromEntries(report.events.map((e) => [e.status, e])) : {};

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <header className="bg-white border border-slate-200 p-5 sm:p-6 rounded-gov space-y-2">
        <p className="font-mono text-[11px] font-bold text-gov-forest uppercase tracking-wider">Lacak laporan</p>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sudah sampai mana laporan saya?</h1>
        <p className="text-sm text-slate-600">Lihat siapa yang memegang laporan, batas waktunya, dan catatan tindak lanjut di setiap tahap.</p>
      </header>

      <form onSubmit={(e) => { e.preventDefault(); search(); }} className="bg-white border border-slate-200 rounded-gov p-5 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
        <label className="text-xs font-bold text-slate-900 space-y-1">
          <span>ID laporan</span>
          <input value={publicId} onChange={(e) => setPublicId(e.target.value.toUpperCase())} placeholder="TT-2026-XXXXXX" autoComplete="off" className="w-full px-3 py-2.5 rounded border border-slate-300 font-mono text-sm" />
        </label>
        <label className="text-xs font-bold text-slate-900 space-y-1">
          <span>Kode rahasia</span>
          <input value={secret} onChange={(e) => setSecret(e.target.value.toUpperCase())} placeholder="XXXX-XXXX" autoComplete="off" className="w-full px-3 py-2.5 rounded border border-slate-300 font-mono text-sm" />
        </label>
        <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded bg-gov-forest hover:bg-gov-hover text-white text-sm font-bold disabled:opacity-60">
          <Search className="w-4 h-4" />{loading ? 'Memeriksa…' : 'Lacak'}
        </button>
        {error && <p className="sm:col-span-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded p-3" role="alert">{error}</p>}
        <p className="sm:col-span-3 text-[11px] text-slate-500">Kode tersimpan di menu <button type="button" onClick={() => setActivePage('my-reports')} className="underline font-bold">Laporan Saya</button> jika Anda melapor dari perangkat ini.</p>
      </form>

      {report && (
        <>
          <section className="bg-white border-2 border-slate-800 rounded-gov p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs font-bold text-slate-500">{report.public_id}</p>
                <h2 className="text-lg font-black text-slate-900">{REPORT_CATEGORIES.find((c) => c.id === report.category)?.title}</h2>
                <p className="text-xs text-slate-600">{[report.desa, report.kecamatan, report.kabkota_name, report.region_name].filter(Boolean).join(', ')} • kejadian {report.incident_date}</p>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-bold border ${report.status === 'selesai' ? 'bg-gov-light text-gov-forest border-gov-border' : report.status === 'ditolak' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-slate-100 text-slate-800 border-slate-300'}`}>
                {REPORT_STATUS[report.status]?.label}
              </span>
            </div>

            {report.due_at && report.status !== 'selesai' && (
              <p className={`flex items-center gap-2 text-sm p-3 rounded border ${report.overdue ? 'bg-red-50 border-red-200 text-red-800' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                {report.overdue ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <Clock className="w-4 h-4 shrink-0" />}
                {report.overdue ? 'Terlambat: ' : 'Batas waktu tahap ini: '}<strong>{dt(report.due_at)}</strong>
                {report.status === 'selesai_instansi' && <span>(batas konfirmasi Anda)</span>}
              </p>
            )}
            {report.assigned_agency && <p className="text-xs text-slate-700 flex gap-1.5"><Building2 className="w-4 h-4" />Ditangani: <strong>{report.assigned_agency}</strong></p>}

            {/* Tracker tahap */}
            {report.status !== 'ditolak' && (
              <ol className="space-y-0">
                {STATUS_STEPS.map((s, i) => {
                  const done = i < current || (i === current && s.id === 'selesai');
                  const active = i === current && s.id !== 'selesai';
                  const ev = lastByStatus[s.id];
                  return (
                    <li key={s.id} className="grid grid-cols-[1.5rem_1fr] gap-3">
                      <div className="flex flex-col items-center">
                        {done ? <CheckCircle2 className="w-6 h-6 text-gov-forest" /> : active ? <Clock className="w-6 h-6 text-amber-600" /> : <Circle className="w-6 h-6 text-slate-300" />}
                        {i < STATUS_STEPS.length - 1 && <span className={`w-0.5 flex-1 min-h-[1.25rem] ${done ? 'bg-gov-forest' : 'bg-slate-200'}`} />}
                      </div>
                      <div className="pb-4">
                        <p className={`text-sm font-bold ${done || active ? 'text-slate-900' : 'text-slate-400'}`}>{s.label}{active && <span className="ml-2 text-[11px] font-mono text-amber-700">SEKARANG</span>}</p>
                        {ev && <p className="text-[11px] text-slate-500">{dt(ev.created_at)}{ev.agency ? ` • ${ev.agency}` : ''}</p>}
                        {!ev && s.sla && (active || !done) && <p className="text-[11px] text-slate-400">{s.sla}</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            {(report.price_paid_per_kg && report.het_per_kg) && (
              <p className="text-xs text-slate-700">Harga dibayar {rp(report.price_paid_per_kg)}/kg, HET saat kejadian {rp(report.het_per_kg)}/kg.</p>
            )}
          </section>

          {report.status === 'selesai_instansi' && (
            <section className="bg-amber-light border-2 border-amber-500 rounded-gov p-5 space-y-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2"><UserCheck className="w-5 h-5" />Instansi menyatakan selesai. Apakah masalah Anda benar-benar teratasi?</h3>
              <p className="text-xs text-slate-700">Laporan baru dihitung "selesai menurut pelapor" jika Anda mengonfirmasi. Jika belum, laporan dibuka kembali.</p>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={2} placeholder="Catatan (opsional), mis. kios sudah menjual sesuai HET" className="w-full px-3 py-2 rounded border border-slate-300 text-sm" />
              <div className="flex flex-wrap gap-2">
                <button onClick={() => confirm(true)} disabled={loading} className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-gov-forest text-white text-sm font-bold"><Check className="w-4 h-4" />Ya, sudah teratasi</button>
                <button onClick={() => confirm(false)} disabled={loading} className="inline-flex items-center gap-2 px-4 py-2.5 rounded border-2 border-slate-800 bg-white text-sm font-bold"><RotateCcw className="w-4 h-4" />Belum, buka kembali</button>
              </div>
            </section>
          )}
          {feedback && <p className="text-sm text-gov-forest bg-gov-light border border-gov-border rounded p-3" role="status">{feedback}</p>}

          <section className="bg-white border border-slate-200 rounded-gov p-5 space-y-3">
            <h3 className="text-sm font-black text-slate-900">Riwayat lengkap</h3>
            <ol className="space-y-3">
              {[...report.events].reverse().map((e, i) => (
                <li key={i} className="text-xs border-l-2 border-slate-300 pl-3">
                  <p className="font-bold text-slate-900">{REPORT_STATUS[e.status]?.label}</p>
                  <p className="text-slate-500">{dt(e.created_at)} • {ACTOR[e.actor]}{e.agency ? ` (${e.agency})` : ''}</p>
                  {e.note && <p className="text-slate-700 mt-0.5">{e.note}</p>}
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </div>
  );
}
