// ============================================
// KONFIGURASI ONGKIR MUSTAWA PUBLISHING
// ============================================
// Kota asal: Majalengka, Jawa Barat
// Berat default: 300 gram per buku
// ============================================

export const SHIPPING_CONFIG = {
  originCity: 'Majalengka',
  originProvince: 'Jawa Barat',
  defaultWeight: 300, // gram per buku
};

// Zona pengiriman
export const SHIPPING_ZONES = {
  jawa: {
    label: 'Dalam Pulau Jawa',
    cost: 20000,
    description: 'Jawa Barat, Jawa Tengah, Jawa Timur, DKI Jakarta, Banten, DI Yogyakarta',
  },
  luar_jawa: {
    label: 'Luar Pulau Jawa',
    cost: 30000,
    description: 'Sumatera, Kalimantan, Sulawesi, Bali, Nusa Tenggara, Maluku, Papua',
  },
};

export type ShippingZone = keyof typeof SHIPPING_ZONES;

// Daftar provinsi per zona
export const PROVINCES_BY_ZONE: Record<ShippingZone, string[]> = {
  jawa: [
    'DKI Jakarta',
    'Jawa Barat',
    'Jawa Tengah',
    'DI Yogyakarta',
    'Jawa Timur',
    'Banten',
  ],
  luar_jawa: [
    'Aceh',
    'Sumatera Utara',
    'Sumatera Barat',
    'Riau',
    'Kepulauan Riau',
    'Jambi',
    'Bengkulu',
    'Sumatera Selatan',
    'Kepulauan Bangka Belitung',
    'Lampung',
    'Bali',
    'Nusa Tenggara Barat',
    'Nusa Tenggara Timur',
    'Kalimantan Barat',
    'Kalimantan Tengah',
    'Kalimantan Selatan',
    'Kalimantan Timur',
    'Kalimantan Utara',
    'Sulawesi Utara',
    'Gorontalo',
    'Sulawesi Tengah',
    'Sulawesi Barat',
    'Sulawesi Selatan',
    'Sulawesi Tenggara',
    'Maluku',
    'Maluku Utara',
    'Papua',
    'Papua Barat',
    'Papua Selatan',
    'Papua Tengah',
    'Papua Pegunungan',
    'Papua Barat Daya',
  ],
};

// Helper: dapatkan zona dari provinsi
export function getZoneFromProvince(province: string): ShippingZone {
  if (PROVINCES_BY_ZONE.jawa.includes(province)) {
    return 'jawa';
  }
  return 'luar_jawa';
}

// Helper: hitung ongkir
export function calculateShipping(
  province: string,
  totalQuantity: number = 1
): { zone: ShippingZone; cost: number; label: string } {
  const zone = getZoneFromProvince(province);
  const base = SHIPPING_ZONES[zone];

  // Kalau lebih dari 1 buku, tetap pakai harga dasar (bisa diubah nanti)
  // Nanti bisa: cost = base.cost + (quantity - 1) * 5000
  const cost = base.cost;

  return {
    zone,
    cost,
    label: base.label,
  };
}

// Format Rupiah
export function formatRupiah(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID');
}