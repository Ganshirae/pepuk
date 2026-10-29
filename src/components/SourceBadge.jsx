import React from 'react';
import { Database, FileText, Newspaper } from 'lucide-react';

const TYPE_LABEL = { dataset_resmi: 'Dataset Resmi', regulasi: 'Regulasi', berita: 'Berita' };

// Menampilkan asal sebuah angka: jenis sumber, penerbit (tautan), dan tanggal rilis/akses.
export default function SourceBadge({ source, className = '' }) {
  if (!source) return null;
  const Icon = source.source_type === 'dataset_resmi' ? Database : source.source_type === 'regulasi' ? FileText : Newspaper;
  const tanggal = source.released_on ? `rilis ${source.released_on}` : `diakses ${source.accessed_on}`;

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      title={`${source.title}${source.notes ? `\n\nCatatan: ${source.notes}` : ''}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-300 hover:border-slate-700 text-[11px] font-mono text-slate-700 max-w-full ${className}`}
    >
      <Icon className="w-3 h-3 text-gov-forest shrink-0" />
      <span className="font-bold uppercase tracking-wider text-slate-900 shrink-0">{TYPE_LABEL[source.source_type]}</span>
      <span className="text-slate-400">|</span>
      <span className="truncate font-sans font-medium">{source.publisher}</span>
      <span className="text-slate-400">|</span>
      <span className="text-slate-500 whitespace-nowrap">{tanggal}</span>
    </a>
  );
}
