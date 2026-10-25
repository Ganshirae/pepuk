import React from 'react';
import { Database, FileText, Newspaper, ShieldCheck } from 'lucide-react';

export default function SourceBadge({ sumber, tipe = 'Dataset Resmi', tanggal = '2024-10-15', className = '' }) {
  const getIcon = () => {
    switch (tipe.toLowerCase()) {
      case 'dataset resmi':
        return <Database className="w-3 h-3 text-gov-forest" />;
      case 'regulasi':
      case 'regulasi resmi':
        return <FileText className="w-3 h-3 text-blue-700" />;
      default:
        return <Newspaper className="w-3 h-3 text-amber-700" />;
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-300 text-[11px] font-mono text-slate-700 ${className}`}>
      {getIcon()}
      <span className="font-bold uppercase tracking-wider text-slate-900">{tipe}</span>
      <span className="text-slate-400">|</span>
      <span className="truncate max-w-[220px] font-sans font-medium" title={sumber}>{sumber}</span>
      <span className="text-slate-400">|</span>
      <span className="text-slate-500 whitespace-nowrap">{tanggal}</span>
    </div>
  );
}
