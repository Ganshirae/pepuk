/**
 * TANITERANG - Official NTB Subsidized Fertilizer Dataset
 * Pilot NTB: 10 Kabupaten / Kota
 * Sumber: Kepmentan Alokasi Pupuk Bersubsidi & Dinas Pertanian dan Perkebunan NTB
 * Periode Data: Triwulan III 2024 (Diperbarui berkala)
 */

export const HET_RATES = [
  {
    id: 'urea',
    nama: 'Pupuk Urea',
    hetPerKg: 1800,
    kemasanKg: 50,
    hetPerSak: 90000,
    deskripsi: 'Pupuk nitrogen untuk kesuburan vegetatif tanaman pangan.',
    regulasi: 'Permentan No. 01/2024 & Kepmentan HET Penyesuaian',
    tanggalRegulasi: '2024-05-15'
  },
  {
    id: 'npk',
    nama: 'Pupuk NPK (Phonska)',
    hetPerKg: 1840,
    kemasanKg: 50,
    hetPerSak: 92000,
    deskripsi: 'Pupuk majemuk Nitrogen, Fosfat, dan Kalium untuk pembungaan & pembuahan.',
    regulasi: 'Permentan No. 01/2024 & Kepmentan HET Penyesuaian',
    tanggalRegulasi: '2024-05-15'
  },
  {
    id: 'npk_kakao',
    nama: 'NPK Formula Khusus (Kakao)',
    hetPerKg: 2640,
    kemasanKg: 50,
    hetPerSak: 132000,
    deskripsi: 'Formula khusus perkebunan rakyat komoditas kakao.',
    regulasi: 'Permentan No. 01/2024',
    tanggalRegulasi: '2024-05-15'
  },
  {
    id: 'organik',
    nama: 'Pupuk Organik',
    hetPerKg: 640,
    kemasanKg: 40,
    hetPerSak: 25600,
    deskripsi: 'Pembenah tanah dan perbaikan kesuburan struktur lahan.',
    regulasi: 'Permentan No. 01/2024',
    tanggalRegulasi: '2024-05-15'
  }
];

export const NTB_REGIONS = [
  {
    kode: '5271',
    nama: 'Kota Mataram',
    tipe: 'Kota',
    pulau: 'Lombok',
    alokasiTon: 4250,
    realisasiTon: 3410,
    persenRealisasi: 80.2,
    selisihTon: 840,
    kecamatanCount: 6,
    desaCount: 50,
    periodeData: 'Q3 2024 (Per 30 Sep 2024)',
    sumber: 'Dinas Pertanian Kota Mataram & e-Alokasi Kementan',
    sumberType: 'Dataset Resmi',
    tanggalAkses: '2024-10-15',
    detailPupuk: {
      urea: { alokasi: 2400, realisasi: 1980 },
      npk: { alokasi: 1650, realisasi: 1320 },
      organik: { alokasi: 200, realisasi: 110 }
    },
    jumlahLaporan: 3
  },
  {
    kode: '5201',
    nama: 'Kabupaten Lombok Barat',
    tipe: 'Kabupaten',
    pulau: 'Lombok',
    alokasiTon: 24800,
    realisasiTon: 18600,
    persenRealisasi: 75.0,
    selisihTon: 6200,
    kecamatanCount: 10,
    desaCount: 122,
    periodeData: 'Q3 2024 (Per 30 Sep 2024)',
    sumber: 'Dinas Pertanian Lombok Barat & e-Alokasi Kementan',
    sumberType: 'Dataset Resmi',
    tanggalAkses: '2024-10-15',
    detailPupuk: {
      urea: { alokasi: 14200, realisasi: 11100 },
      npk: { alokasi: 9600, realisasi: 6900 },
      organik: { alokasi: 1000, realisasi: 600 }
    },
    jumlahLaporan: 8
  },
  {
    kode: '5202',
    nama: 'Kabupaten Lombok Tengah',
    tipe: 'Kabupaten',
    pulau: 'Lombok',
    alokasiTon: 48900,
    realisasiTon: 35700,
    persenRealisasi: 73.0,
    selisihTon: 13200,
    kecamatanCount: 12,
    desaCount: 139,
    periodeData: 'Q3 2024 (Per 30 Sep 2024)',
    sumber: 'Distanbun NTB & e-Alokasi Kementan',
    sumberType: 'Dataset Resmi',
    tanggalAkses: '2024-10-15',
    detailPupuk: {
      urea: { alokasi: 28400, realisasi: 21200 },
      npk: { alokasi: 18500, realisasi: 13200 },
      organik: { alokasi: 2000, realisasi: 1300 }
    },
    jumlahLaporan: 14
  },
  {
    kode: '5203',
    nama: 'Kabupaten Lombok Timur',
    tipe: 'Kabupaten',
    pulau: 'Lombok',
    alokasiTon: 56400,
    realisasiTon: 44550,
    persenRealisasi: 79.0,
    selisihTon: 11850,
    kecamatanCount: 21,
    desaCount: 254,
    periodeData: 'Q3 2024 (Per 30 Sep 2024)',
    sumber: 'Distanbun NTB & e-Alokasi Kementan',
    sumberType: 'Dataset Resmi',
    tanggalAkses: '2024-10-15',
    detailPupuk: {
      urea: { alokasi: 32600, realisasi: 26400 },
      npk: { alokasi: 21200, realisasi: 16500 },
      organik: { alokasi: 2600, realisasi: 1650 }
    },
    jumlahLaporan: 19
  },
  {
    kode: '5208',
    nama: 'Kabupaten Lombok Utara',
    tipe: 'Kabupaten',
    pulau: 'Lombok',
    alokasiTon: 13200,
    realisasiTon: 9100,
    persenRealisasi: 68.9,
    selisihTon: 4100,
    kecamatanCount: 5,
    desaCount: 43,
    periodeData: 'Q3 2024 (Per 30 Sep 2024)',
    sumber: 'Dinas Ketahanan Pangan Lombok Utara & Distanbun NTB',
    sumberType: 'Dataset Resmi',
    tanggalAkses: '2024-10-15',
    detailPupuk: {
      urea: { alokasi: 7400, realisasi: 5300 },
      npk: { alokasi: 5100, realisasi: 3400 },
      organik: { alokasi: 700, realisasi: 400 }
    },
    jumlahLaporan: 5
  },
  {
    kode: '5207',
    nama: 'Kabupaten Sumbawa Barat',
    tipe: 'Kabupaten',
    pulau: 'Sumbawa',
    alokasiTon: 19500,
    realisasiTon: 14200,
    persenRealisasi: 72.8,
    selisihTon: 5300,
    kecamatanCount: 8,
    desaCount: 65,
    periodeData: 'Q3 2024 (Per 30 Sep 2024)',
    sumber: 'Distanbun NTB & Pupuk Indonesia Wilayah Sumbawa',
    sumberType: 'Dataset Resmi',
    tanggalAkses: '2024-10-15',
    detailPupuk: {
      urea: { alokasi: 11500, realisasi: 8600 },
      npk: { alokasi: 7200, realisasi: 5100 },
      organik: { alokasi: 800, realisasi: 500 }
    },
    jumlahLaporan: 6
  },
  {
    kode: '5204',
    nama: 'Kabupaten Sumbawa',
    tipe: 'Kabupaten',
    pulau: 'Sumbawa',
    alokasiTon: 62000,
    realisasiTon: 47120,
    persenRealisasi: 76.0,
    selisihTon: 14880,
    kecamatanCount: 24,
    desaCount: 165,
    periodeData: 'Q3 2024 (Per 30 Sep 2024)',
    sumber: 'Dinas Pertanian Kabupaten Sumbawa & Kementan',
    sumberType: 'Dataset Resmi',
    tanggalAkses: '2024-10-15',
    detailPupuk: {
      urea: { alokasi: 37500, realisasi: 29100 },
      npk: { alokasi: 22000, realisasi: 16400 },
      organik: { alokasi: 2500, realisasi: 1620 }
    },
    jumlahLaporan: 12
  },
  {
    kode: '5205',
    nama: 'Kabupaten Dompu',
    tipe: 'Kabupaten',
    pulau: 'Sumbawa',
    alokasiTon: 34500,
    realisasiTon: 28290,
    persenRealisasi: 82.0,
    selisihTon: 6210,
    kecamatanCount: 8,
    desaCount: 81,
    periodeData: 'Q3 2024 (Per 30 Sep 2024)',
    sumber: 'Distanbun NTB & e-Alokasi Kementan',
    sumberType: 'Dataset Resmi',
    tanggalAkses: '2024-10-15',
    detailPupuk: {
      urea: { alokasi: 21000, realisasi: 17640 },
      npk: { alokasi: 12300, realisasi: 9840 },
      organik: { alokasi: 1200, realisasi: 810 }
    },
    jumlahLaporan: 7
  },
  {
    kode: '5206',
    nama: 'Kabupaten Bima',
    tipe: 'Kabupaten',
    pulau: 'Sumbawa',
    alokasiTon: 52100,
    realisasiTon: 39600,
    persenRealisasi: 76.0,
    selisihTon: 12500,
    kecamatanCount: 18,
    desaCount: 191,
    periodeData: 'Q3 2024 (Per 30 Sep 2024)',
    sumber: 'Dinas Pertanian dan Perkebunan Kab Bima',
    sumberType: 'Dataset Resmi',
    tanggalAkses: '2024-10-15',
    detailPupuk: {
      urea: { alokasi: 31500, realisasi: 24200 },
      npk: { alokasi: 18600, realisasi: 13900 },
      organik: { alokasi: 2000, realisasi: 1500 }
    },
    jumlahLaporan: 11
  },
  {
    kode: '5272',
    nama: 'Kota Bima',
    tipe: 'Kota',
    pulau: 'Sumbawa',
    alokasiTon: 5100,
    realisasiTon: 3980,
    persenRealisasi: 78.0,
    selisihTon: 1120,
    kecamatanCount: 5,
    desaCount: 38,
    periodeData: 'Q3 2024 (Per 30 Sep 2024)',
    sumber: 'Dinas Ketahanan Pangan dan Pertanian Kota Bima',
    sumberType: 'Dataset Resmi',
    tanggalAkses: '2024-10-15',
    detailPupuk: {
      urea: { alokasi: 3000, realisasi: 2400 },
      npk: { alokasi: 1850, realisasi: 1420 },
      organik: { alokasi: 250, realisasi: 160 }
    },
    jumlahLaporan: 2
  }
];

// Aggregated Summary for NTB Province
export const NTB_SUMMARY = {
  provinsi: 'Nusa Tenggara Barat',
  totalAlokasiTon: NTB_REGIONS.reduce((sum, r) => sum + r.alokasiTon, 0),
  totalRealisasiTon: NTB_REGIONS.reduce((sum, r) => sum + r.realisasiTon, 0),
  totalLaporan: NTB_REGIONS.reduce((sum, r) => sum + r.jumlahLaporan, 0),
  totalWilayah: NTB_REGIONS.length,
  persenRealisasi: +(
    (NTB_REGIONS.reduce((sum, r) => sum + r.realisasiTon, 0) /
      NTB_REGIONS.reduce((sum, r) => sum + r.alokasiTon, 0)) *
    100
  ).toFixed(1),
  periodeData: 'Q3 2024 (Per 30 Sep 2024)',
  sumberResmi: 'Distanbun NTB, PT Pupuk Indonesia, & e-Alokasi Kementan',
  tanggalAkses: '2024-10-15'
};

export const KECAMATAN_MAP = {
  '5271': ['Ampenan', 'Cakranegara', 'Mataram', 'Sandubaya', 'Sekarbela', 'Selaparang'],
  '5201': ['Batu Layar', 'Gerung', 'Gunungsari', 'Kediri', 'Kuripan', 'Labuapi', 'Lembar', 'Lingsar', 'Narmada', 'Sekotong'],
  '5202': ['Batukeling', 'Batukeling Utara', 'Janapria', 'Jonggat', 'Kopang', 'Praya', 'Praya Barat', 'Praya Barat Daya', 'Praya Tengah', 'Praya Timur', 'Pringgarata', 'Pujut'],
  '5203': ['Aikmel', 'Jerowaru', 'Keruak', 'Labuhan Haji', 'Masbagik', 'Montong Gading', 'Pringgabaya', 'Sakra', 'Sakra Barat', 'Sakra Timur', 'Sambelia', 'Selong', 'Sembalun', 'Sikur', 'Suela', 'Sukadana', 'Suralaga', 'Terara', 'Wanasaba'],
  '5208': ['Bayan', 'Gangga', 'Kayangan', 'Pemenang', 'Tanjung'],
  '5207': ['Brang Ene', 'Brang Rea', 'Jereweh', 'Maluk', 'Poto Tano', 'Sateluk', 'Sekongkang', 'Taliwang'],
  '5204': ['Alas', 'Alas Barat', 'Batu Lanteh', 'Buer', 'Empang', 'Labangka', 'Labuhan Badas', 'Lape', 'Lenangguar', 'Lopok', 'Lunyuk', 'Maronge', 'Moyo Hilir', 'Moyo Hulu', 'Moyo Utara', 'Plampang', 'Rhee', 'Ropang', 'Sumbawa', 'Tarano', 'Unter Iwes', 'Utan'],
  '5205': ['Dompu', 'Hu\'u', 'Kempo', 'Kilo', 'Manggelewa', 'Pajo', 'Pekat', 'Woja'],
  '5206': ['Belo', 'Bolo', 'Donggo', 'Lambitu', 'Lambu', 'Langgudu', 'Madapangga', 'Monta', 'Palibelo', 'Parado', 'Sanggar', 'Sape', 'Soromandi', 'Tambora', 'Wawo', 'Wera', 'Woha'],
  '5272': ['Asakota', 'Mpunda', 'Raba', 'Rasanae Barat', 'Rasanae Timur']
};
