"""Buat SQL seed data referensi dari berkas resmi di data/raw/.

Pemakaian:  python3 scripts/seed_reference.py | psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -X -q
Idempoten (upsert), hanya pustaka standar Python.
"""
import csv
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

RAW = Path(__file__).resolve().parent.parent / 'data' / 'raw'
NS = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'

# Kode Kemendagri 38 provinsi. 'Papua Barat Barat' adalah salah ketik di sumber untuk Papua Barat Daya.
PROVINCES = {
    'Aceh': '11', 'Sumatera Utara': '12', 'Sumatera Barat': '13', 'Riau': '14', 'Jambi': '15',
    'Sumatera Selatan': '16', 'Bengkulu': '17', 'Lampung': '18', 'Kepulauan Bangka Belitung': '19',
    'Kepulauan Riau': '21', 'DKI Jakarta': '31', 'Jawa Barat': '32', 'Jawa Tengah': '33',
    'DI Yogyakarta': '34', 'Jawa Timur': '35', 'Banten': '36', 'Bali': '51', 'Nusa Tenggara Barat': '52',
    'Nusa Tenggara Timur': '53', 'Kalimantan Barat': '61', 'Kalimantan Tengah': '62',
    'Kalimantan Selatan': '63', 'Kalimantan Timur': '64', 'Kalimantan Utara': '65', 'Sulawesi Utara': '71',
    'Sulawesi Tengah': '72', 'Sulawesi Selatan': '73', 'Sulawesi Tenggara': '74', 'Gorontalo': '75',
    'Sulawesi Barat': '76', 'Maluku': '81', 'Maluku Utara': '82', 'Papua': '91', 'Papua Barat': '92',
    'Papua Selatan': '93', 'Papua Tengah': '94', 'Papua Pegunungan': '95', 'Papua Barat Barat': '96',
    'Papua Barat Daya': '96',
}
PROVINCE_NAME_FIX = {'Papua Barat Barat': 'Papua Barat Daya'}

FERTILIZERS = [  # id, nama, urutan
    ('urea', 'Urea', 1), ('npk', 'NPK', 2), ('npk_fk', 'NPK Formula Khusus', 3), ('za', 'ZA', 4),
    ('sp36', 'SP-36', 5), ('organik', 'Organik', 6), ('organik_granul', 'Organik Granul', 7),
    ('organik_cair', 'Organik Cair', 8),
]
NTB_FERTILIZER = {'urea': 'urea', 'npk': 'npk', 'npk formula khusus': 'npk_fk', 'za': 'za', 'sp-36': 'sp36',
                  'organik': 'organik', 'organik granul': 'organik_granul', 'organik cair': 'organik_cair'}

KEMENTAN_URL = 'https://satudata.pertanian.go.id/assets/docs/metadata/'
KEMENTAN_PUBLISHER = 'Kementerian Pertanian (Ditjen PSP), diolah dari PT Pupuk Indonesia'
PAPUA_NOTE = ('Provinsi pemekaran Papua bernilai 0 pada 2024 (belum dipisah); realisasi Papua 2024 melebihi '
              'alokasi karena masih mencakup wilayah pemekaran.')

# Berkas nasional per provinsi (Satu Data Pertanian, Data Prioritas 2025, rilis 31 Des 2025).
# known_mismatch: tahun yang jumlah per provinsinya tidak sama dengan baris "Indonesia" di berkas sumber.
KEMENTAN_FILES = [
    dict(fert='urea', label='Urea', file='kementan_urea_provinsi.xlsx', remote='61_Jumlah_Penyaluran_Pupuk_Urea_Bersubsidi.xlsx',
         table='Tabel 1.3.28', data_until='Oktober 2025 (untuk tahun 2025)', known_mismatch={2025},
         notes=PAPUA_NOTE + ' Tahun 2025: jumlah per provinsi lebih besar dari baris total Indonesia '
                            '(alokasi +10.076 t, realisasi +3.166 t).'),
    dict(fert='npk', label='NPK', file='kementan_npk_provinsi.xlsx', remote='58_Jumlah_Penyaluran_Pupuk_NPK_Bersubsidi.xlsx',
         table='Tabel 1.3.31', data_until='Oktober 2025 (untuk tahun 2025)', known_mismatch=set(),
         notes=PAPUA_NOTE + ' Header kolom tahun 2014 tercantum dua kali di sumber (tidak memengaruhi 2019+).'),
    dict(fert='za', label='ZA', file='kementan_za_provinsi.xlsx', remote='62_Jumlah_Penyaluran_Pupuk_ZA_Bersubsidi.xlsx',
         table='Tabel 1.3.30', data_until='realisasi 2022 s.d. September 2022; 2025 s.d. Oktober 2025',
         known_mismatch=set(),
         notes='Tidak ada data ZA tahun 2023 dan 2024 di berkas sumber.'),
    dict(fert='organik', label='Organik', file='kementan_organik_provinsi.xlsx', remote='59_Jumlah_Penyaluran_Pupuk_Organik_Bersubsidi.xlsx',
         table='Tabel 1.3.32', data_until='realisasi 2022 s.d. September 2022; 2025 s.d. Oktober 2025',
         known_mismatch=set(),
         notes='Tidak ada data Organik tahun 2023 di berkas sumber.'),
    dict(fert='sp36', label='SP-36', file='kementan_sp36_provinsi.xlsx', remote='60_Jumlah_Penyaluran_Pupuk_SP36_Bersubsidi.xlsx',
         table='Tabel 1.3.29', data_until='realisasi 2022 s.d. September 2022', known_mismatch=set(),
         notes='Berkas sumber hanya memuat data sampai tahun 2022.'),
]
MIN_YEAR = 2019

SOURCES = [
    *[dict(id=f"kementan_{k['fert']}_prov", publisher=KEMENTAN_PUBLISHER,
           title=f"{k['table']} Alokasi dan Realisasi Penyaluran Pupuk {k['label']} Bersubsidi (Data Prioritas 2025)",
           url=KEMENTAN_URL + k['remote'], source_type='dataset_resmi', released_on='2025-12-31',
           data_until=k['data_until'], accessed_on='2026-10-29', license=None, notes='Level provinsi. ' + k['notes'])
      for k in KEMENTAN_FILES],
    dict(id='ntb_kabkota', publisher='Pemerintah Provinsi Nusa Tenggara Barat (Satu Data NTB)',
         title='Jumlah Target dan Realisasi Pupuk Subsidi Berdasarkan Kabupaten/Kota',
         url='https://data.ntbprov.go.id', source_type='dataset_resmi', released_on=None, data_until=None,
         accessed_on='2026-10-21', license=None,
         notes='Diunduh 21 Okt 2026. Tautan dataset spesifik perlu dilengkapi.'),
    dict(id='kepmentan_1117_2025', publisher='ANTARA (memberitakan Kementerian Pertanian)',
         title='Kepmentan No. 1117/Kpts./SR.310/M/10/2025 tentang perubahan HET pupuk bersubsidi',
         url='https://www.antaranews.com/berita/5226377/kementan-sebut-serapan-pupuk-subsidi-naik-pascapenurunan-het',
         source_type='berita', released_on='2025-11-07', data_until=None, accessed_on='2026-10-28', license=None,
         notes='Dokumen Kepmentan asli belum ditemukan di JDIH; angka dari pemberitaan resmi.'),
]

HET = [  # fertilizer_id, harga/kg, kemasan kg
    ('urea', 1800, 50), ('npk', 1840, 50), ('npk_fk', 2640, 50), ('za', 1360, 50), ('organik', 640, 40),
]
HET_REGULATION = 'Kepmentan No. 1117/Kpts./SR.310/M/10/2025'
HET_EFFECTIVE = '2025-10-22'



def q(v):
    if v is None:
        return 'null'
    if isinstance(v, (int, float)):
        return repr(v)
    return "'" + str(v).replace("'", "''") + "'"


def num(s):
    s = (s or '').strip()
    return None if s in ('', '-') else round(float(s.replace(',', '')), 3)


def read_xlsx_rows(path):
    z = zipfile.ZipFile(path)
    shared = [''.join(t.text or '' for t in si.iter(NS + 't'))
              for si in ET.fromstring(z.read('xl/sharedStrings.xml')).findall(NS + 'si')]
    for row in ET.fromstring(z.read('xl/worksheets/sheet1.xml')).iter(NS + 'row'):
        cells = {}
        for c in row.findall(NS + 'c'):
            v = c.find(NS + 'v')
            if v is None:
                continue
            col = re.match(r'[A-Z]+', c.get('r')).group()
            cells[col] = shared[int(v.text)] if c.get('t') == 's' else v.text
        yield cells


def next_col(col):
    n = 0
    for ch in col:
        n = n * 26 + ord(ch) - 64
    n += 1
    s = ''
    while n:
        n, r = divmod(n - 1, 26)
        s = chr(65 + r) + s
    return s


def parse_kementan(spec):
    """Baca satu berkas Kementan per provinsi -> (wilayah, statistik). Kolom tahun dicari dari baris header,
    kolom realisasi = kolom tepat setelah alokasi. Jumlah provinsi divalidasi terhadap baris 'Indonesia'."""
    rows = list(read_xlsx_rows(RAW / spec['file']))
    header = next(r for r in rows if r.get('B', '').startswith('Provinsi'))
    years = {}
    for col, label in header.items():
        m = re.match(r'^(\d{4})', label)
        if m and int(m.group(1)) >= MIN_YEAR:
            years[int(m.group(1))] = (col, next_col(col))
    total = next(r for r in rows if (r.get('A') or '').strip() == 'Indonesia')
    src = f"kementan_{spec['fert']}_prov"

    regions, stats = [], []
    for cells in rows:
        name = (cells.get('B') or '').strip()
        if name not in PROVINCES:
            continue
        code = PROVINCES[name]
        regions.append((code, PROVINCE_NAME_FIX.get(name, name), 'provinsi', None))
        for year, (ca, cr) in years.items():
            alloc, real = num(cells.get(ca)), num(cells.get(cr))
            if alloc is None and real is None:
                continue
            stats.append((code, spec['fert'], year, alloc, real, src))
    assert len(regions) == 38, f"{spec['file']}: harus 38 provinsi, dapat {len(regions)}"

    for year, (ca, cr) in years.items():
        for col, idx in ((ca, 3), (cr, 4)):
            diff = sum(s[idx] or 0 for s in stats if s[2] == year) - (num(total.get(col)) or 0)
            if year in spec['known_mismatch']:
                print(f"-- PERINGATAN {spec['fert']} {year}: jumlah provinsi - total sumber = {diff:.2f} ton", file=sys.stderr)
            else:
                assert abs(diff) < 1, f"{spec['fert']} {year} {col}: selisih {diff}"
    print(f"-- {spec['fert']}: tahun {sorted(years)}, {len(stats)} baris", file=sys.stderr)
    return regions, stats


def upsert(table, cols, rows, conflict):
    if not rows:
        return
    values = ',\n  '.join('(' + ', '.join(q(v) for v in r) + ')' for r in rows)
    updates = ', '.join(f'{c} = excluded.{c}' for c in cols if c not in conflict)
    print(f'insert into public.{table} ({", ".join(cols)}) values\n  {values}\n'
          f'on conflict ({", ".join(conflict)}) do update set {updates};')


def main():
    print('begin;')
    upsert('data_sources', list(SOURCES[0]), [list(s.values()) for s in SOURCES], ['id'])
    upsert('fertilizer_types', ['id', 'name', 'sort_order'], FERTILIZERS, ['id'])
    upsert('het_rates', ['fertilizer_id', 'price_per_kg', 'pack_kg', 'regulation', 'effective_from', 'source_id'],
           [(f, p, k, HET_REGULATION, HET_EFFECTIVE, 'kepmentan_1117_2025') for f, p, k in HET],
           ['fertilizer_id', 'effective_from'])

    # Provinsi + statistik nasional per jenis pupuk
    regions, stats = [], []
    for spec in KEMENTAN_FILES:
        r, s = parse_kementan(spec)
        regions += r
        stats += s

    # Kab/kota NTB
    with open(RAW / 'ntb_kabkota_2021_2025.csv', encoding='utf-8-sig') as f:
        for r in csv.DictReader(f):
            code = r['Kode Kabupaten/Kota'].strip()
            regions.append((code, r['Nama Kabupaten/Kota'].strip(), 'kabkota', '52'))
            fert = NTB_FERTILIZER[r['Jenis Pupuk'].strip().lower()]
            stats.append((code, fert, int(r['Tahun']), num(r['Alokasi (Ton)']), num(r['Realisasi (Ton)']),
                          'ntb_kabkota'))

    upsert('regions', ['code', 'name', 'level', 'parent_code'], list(dict.fromkeys(regions)), ['code'])
    upsert('distribution_stats',
           ['region_code', 'fertilizer_id', 'year', 'allocation_ton', 'realization_ton', 'source_id'],
           stats, ['region_code', 'fertilizer_id', 'year', 'source_id'])
    print('commit;')
    print(f'-- {len(set(regions))} wilayah, {len(stats)} baris statistik', file=sys.stderr)


if __name__ == '__main__':
    main()
