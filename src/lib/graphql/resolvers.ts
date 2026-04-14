import type { IResolvers } from '@graphql-tools/utils'

// ──────────────────────────────────────────────
// In-memory favorites store
// ──────────────────────────────────────────────
const favorites: Set<string> = new Set()

// ──────────────────────────────────────────────
// Mock Brands
// ──────────────────────────────────────────────
const brands = [
  {
    id: 'brand-1',
    name: 'Toyota',
    slug: 'toyota',
    logo: 'https://www.carlogos.org/car-logos/toyota-logo-2020-europe.png',
    description: 'Toyota Motor Corporation adalah produsen otomotif terbesar di Indonesia dan dunia. Dikenal dengan keandalan, efisiensi bahan bakar, dan nilai jual kembali yang tinggi.',
    founded: 1937,
    headquarters: 'Toyota City, Aichi, Jepang',
    website: 'https://www.toyota.astra.co.id',
    country: 'Jepang',
    totalListings: 12450,
  },
  {
    id: 'brand-2',
    name: 'Honda',
    slug: 'honda',
    logo: 'https://www.carlogos.org/car-logos/honda-logo-2000.png',
    description: 'Honda Motor Co. Ltd. adalah produsen otomotif Jepang yang terkenal dengan teknologi mesin VTEC, kenyamanan berkendara, dan desain modern yang sporty.',
    founded: 1948,
    headquarters: 'Minato, Tokyo, Jepang',
    website: 'https://www.honda-indonesia.com',
    country: 'Jepang',
    totalListings: 9870,
  },
  {
    id: 'brand-3',
    name: 'Daihatsu',
    slug: 'daihatsu',
    logo: 'https://www.carlogos.org/car-logos/daihatsu-logo.png',
    description: 'Daihatsu Motor Co. Ltd. adalah produsen otomotif yang sangat populer di segmen LCGC (Low Cost Green Car) Indonesia dengan model Ayla, Sigra, dan Xenia.',
    founded: 1907,
    headquarters: 'Ikeda, Osaka, Jepang',
    website: 'https://www.daihatsu.co.id',
    country: 'Jepang',
    totalListings: 8340,
  },
  {
    id: 'brand-4',
    name: 'Suzuki',
    slug: 'suzuki',
    logo: 'https://www.carlogos.org/car-logos/suzuki-logo.png',
    description: 'Suzuki Motor Corporation dikenal dengan produk kendaraan kompak yang tangguh dan irit bahan bakar. Sangat populer di segmen LCGC dan SUV kompak di Indonesia.',
    founded: 1909,
    headquarters: 'Hamamatsu, Shizuoka, Jepang',
    website: 'https://www.suzuki.co.id',
    country: 'Jepang',
    totalListings: 7650,
  },
  {
    id: 'brand-5',
    name: 'Mitsubishi',
    slug: 'mitsubishi',
    logo: 'https://www.carlogos.org/car-logos/mitsubishi-logo.png',
    description: 'Mitsubishi Motors Corporation adalah produsen otomotif yang kuat di segmen MPV dan SUV di Indonesia, dengan Xpander sebagai model terlaris.',
    founded: 1970,
    headquarters: 'Minato, Tokyo, Jepang',
    website: 'https://www.mitsubishi-motors.co.id',
    country: 'Jepang',
    totalListings: 6980,
  },
  {
    id: 'brand-6',
    name: 'BMW',
    slug: 'bmw',
    logo: 'https://www.carlogos.org/car-logos/bmw-logo.png',
    description: 'Bayerische Motoren Werke AG adalah produsen mobil mewah asal Jerman yang terkenal dengan performa berkendara dinamis, teknologi canggih, dan prestise tinggi.',
    founded: 1916,
    headquarters: 'Munich, Bavaria, Jerman',
    website: 'https://www.bmw.co.id',
    country: 'Jerman',
    totalListings: 2340,
  },
  {
    id: 'brand-7',
    name: 'Mercedes-Benz',
    slug: 'mercedes-benz',
    logo: 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png',
    description: 'Mercedes-Benz adalah merek mobil mewah yang melambangkan kemewahan, keamanan, dan inovasi teknologi. Sangat diminati di pasar mobil premium Indonesia.',
    founded: 1926,
    headquarters: 'Stuttgart, Baden-Württemberg, Jerman',
    website: 'https://www.mercedes-benz.co.id',
    country: 'Jerman',
    totalListings: 2100,
  },
  {
    id: 'brand-8',
    name: 'Hyundai',
    slug: 'hyundai',
    logo: 'https://www.carlogos.org/car-logos/hyundai-logo-2011.png',
    description: 'Hyundai Motor Company berkembang pesat di Indonesia dengan desain modern, fitur melimpah, dan garansi terbaik di kelasnya. Creta dan Stargazer menjadi model populer.',
    founded: 1967,
    headquarters: 'Seoul, Korea Selatan',
    website: 'https://www.hyundai.com/id',
    country: 'Korea Selatan',
    totalListings: 4560,
  },
]

// ──────────────────────────────────────────────
// Mock Car Models
// ──────────────────────────────────────────────
const carModels: Record<string, Array<{ id: string; name: string; slug: string; brandId: string }>> = {
  toyota: [
    { id: 'model-1', name: 'Avanza', slug: 'avanza', brandId: 'brand-1' },
    { id: 'model-2', name: 'Rush', slug: 'rush', brandId: 'brand-1' },
    { id: 'model-3', name: 'Fortuner', slug: 'fortuner', brandId: 'brand-1' },
    { id: 'model-4', name: 'Innova Zenix', slug: 'innova-zenix', brandId: 'brand-1' },
  ],
  honda: [
    { id: 'model-5', name: 'BR-V', slug: 'br-v', brandId: 'brand-2' },
    { id: 'model-6', name: 'HR-V', slug: 'hr-v', brandId: 'brand-2' },
    { id: 'model-7', name: 'Brio', slug: 'brio', brandId: 'brand-2' },
    { id: 'model-8', name: 'Civic', slug: 'civic', brandId: 'brand-2' },
  ],
  daihatsu: [
    { id: 'model-9', name: 'Xenia', slug: 'xenia', brandId: 'brand-3' },
    { id: 'model-10', name: 'Sigra', slug: 'sigra', brandId: 'brand-3' },
  ],
  suzuki: [
    { id: 'model-11', name: 'Ertiga', slug: 'ertiga', brandId: 'brand-4' },
    { id: 'model-12', name: 'XL7', slug: 'xl7', brandId: 'brand-4' },
  ],
  mitsubishi: [
    { id: 'model-13', name: 'Xpander', slug: 'xpander', brandId: 'brand-5' },
    { id: 'model-14', name: 'Pajero Sport', slug: 'pajero-sport', brandId: 'brand-5' },
  ],
  bmw: [
    { id: 'model-15', name: 'X3', slug: 'x3', brandId: 'brand-6' },
  ],
  'mercedes-benz': [
    { id: 'model-16', name: 'C-Class', slug: 'c-class', brandId: 'brand-7' },
  ],
  hyundai: [
    { id: 'model-17', name: 'Creta', slug: 'creta', brandId: 'brand-8' },
    { id: 'model-18', name: 'Stargazer', slug: 'stargazer', brandId: 'brand-8' },
    { id: 'model-19', name: 'Ioniq 5', slug: 'ioniq-5', brandId: 'brand-8' },
  ],
}

const allModels = Object.values(carModels).flat()

// ──────────────────────────────────────────────
// Mock Sellers
// ──────────────────────────────────────────────
const sellers = [
  {
    id: 'seller-1',
    name: 'Budi Santoso',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=budi',
    phone: '0812-3456-7890',
    email: 'budi.santoso@email.com',
    isVerified: true,
    rating: 4.8,
    totalSales: 156,
    joinDate: '2022-03-15',
    address: 'Jl. Gatot Subroto No. 45, Kuningan',
    city: 'Jakarta Selatan',
  },
  {
    id: 'seller-2',
    name: 'Siti Rahayu',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=siti',
    phone: '0813-7654-3210',
    email: 'siti.rahayu@email.com',
    isVerified: true,
    rating: 4.9,
    totalSales: 203,
    joinDate: '2021-08-20',
    address: 'Jl. Dago No. 78, Coblong',
    city: 'Bandung',
  },
  {
    id: 'seller-3',
    name: 'Ahmad Wijaya',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=ahmad',
    phone: '0856-1234-5678',
    email: 'ahmad.wijaya@email.com',
    isVerified: false,
    rating: 4.5,
    totalSales: 42,
    joinDate: '2023-01-10',
    address: 'Jl. Ahmad Yani No. 120, Gayamsari',
    city: 'Semarang',
  },
  {
    id: 'seller-4',
    name: 'Dewi Lestari',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=dewi',
    phone: '0878-9876-5432',
    email: 'dewi.lestari@email.com',
    isVerified: true,
    rating: 4.7,
    totalSales: 89,
    joinDate: '2022-06-01',
    address: 'Jl. Udayana No. 56, Denpasar',
    city: 'Denpasar',
  },
  {
    id: 'seller-5',
    name: 'Rizky Pratama',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=rizky',
    phone: '0821-5555-6666',
    email: 'rizky.pratama@email.com',
    isVerified: true,
    rating: 4.6,
    totalSales: 134,
    joinDate: '2022-09-12',
    address: 'Jl. Pemuda No. 33, Gubeng',
    city: 'Surabaya',
  },
  {
    id: 'seller-6',
    name: 'Putri Handayani',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=putri',
    phone: '0819-7777-8888',
    email: 'putri.handayani@email.com',
    isVerified: true,
    rating: 4.9,
    totalSales: 267,
    joinDate: '2021-02-28',
    address: 'Jl. Sudirman No. 99, Medan',
    city: 'Medan',
  },
]

// ──────────────────────────────────────────────
// Mock Car Listings
// ──────────────────────────────────────────────
const listings = [
  {
    id: 'listing-1',
    title: 'Toyota Avanza 1.5 G CVT 2024 — Baru, Garansi Resmi',
    slug: 'toyota-avanza-1-5-g-cvt-2024',
    brandId: 'brand-1',
    modelId: 'model-1',
    variant: '1.5 G CVT',
    year: 2024,
    price: 268000000,
    originalPrice: 268000000,
    mileage: null,
    condition: 'NEW' as const,
    transmission: 'CVT' as const,
    fuelType: 'GASOLINE' as const,
    bodyType: 'MPV',
    exteriorColor: 'Putih Mutiara',
    interiorColor: 'Hitam',
    images: [
      'https://picsum.photos/seed/avanza-white-1/800/600',
      'https://picsum.photos/seed/avanza-white-2/800/600',
      'https://picsum.photos/seed/avanza-white-3/800/600',
      'https://picsum.photos/seed/avanza-white-4/800/600',
    ],
    description: 'Toyota Avanza 1.5 G CVT 2024 kondisi baru, garansi resmi Toyota Astra Motor 3 tahun / 100.000 km. Tipe tertinggi dengan fitur Toyota Safety Sense (TSS), head unit 9 inci, LED headlamp, smart key system, dan leather seat. Mobil keluarga terlaris di Indonesia dengan kabin luas 7 penumpang dan konsumsi BBM sangat efisien.',
    features: ['Toyota Safety Sense', 'Head Unit 9"', 'LED Headlamp', 'Smart Key', 'Leather Seat', 'Auto AC', 'Camera Depan', 'ABS + EBD', 'Dual Airbag', 'ISOFIX'],
    sellerId: 'seller-1',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    inspectionScore: null,
    inspectionDate: null,
    isFeatured: true,
    isNegotiable: false,
    views: 3842,
    createdAt: '2024-11-15T08:30:00Z',
    updatedAt: '2024-11-15T08:30:00Z',
  },
  {
    id: 'listing-2',
    title: 'Honda HR-V 1.5 SE CVT 2023 — Mulus Seperti Baru',
    slug: 'honda-hrv-1-5-se-cvt-2023',
    brandId: 'brand-2',
    modelId: 'model-6',
    variant: '1.5 SE CVT',
    year: 2023,
    price: 385000000,
    originalPrice: 405000000,
    mileage: 12500,
    condition: 'USED' as const,
    transmission: 'CVT' as const,
    fuelType: 'GASOLINE' as const,
    bodyType: 'SUV',
    exteriorColor: 'Meteoroid Grey',
    interiorColor: 'Hitam',
    images: [
      'https://picsum.photos/seed/hrv-grey-1/800/600',
      'https://picsum.photos/seed/hrv-grey-2/800/600',
      'https://picsum.photos/seed/hrv-grey-3/800/600',
      'https://picsum.photos/seed/hrv-grey-4/800/600',
      'https://picsum.photos/seed/hrv-grey-5/800/600',
    ],
    description: 'Honda HR-V 1.5 SE CVT 2023, pemakaian pribadi, tangan pertama. Kondisi sangat terawat, serviced rutin di Honda resmi. Body kaleng mulus tanpa cacat. Ban Bridgestone baru ganti. Fitur Honda Sensing lengkap aktif. Surat-surat lengkap, faktur asli, nik 2023.',
    features: ['Honda Sensing', 'Lane Watch', 'Remote Engine Start', 'Push Start Button', 'LED DRL', 'Paddle Shift', 'Electric Parking Brake', 'Auto Brake Hold', 'Multi-Angle Camera', '8 Airbag'],
    sellerId: 'seller-2',
    city: 'Bandung',
    province: 'Jawa Barat',
    inspectionScore: 92.5,
    inspectionDate: '2024-10-20T10:00:00Z',
    isFeatured: true,
    isNegotiable: true,
    views: 5621,
    createdAt: '2024-10-25T14:15:00Z',
    updatedAt: '2024-11-10T09:00:00Z',
  },
  {
    id: 'listing-3',
    title: 'Mitsubishi Xpander Cross 1.5 AT 2023 — Low KM',
    slug: 'mitsubishi-xpander-cross-1-5-at-2023',
    brandId: 'brand-5',
    modelId: 'model-13',
    variant: '1.5 AT Cross',
    year: 2023,
    price: 315000000,
    originalPrice: 335000000,
    mileage: 8500,
    condition: 'USED' as const,
    transmission: 'AUTOMATIC' as const,
    fuelType: 'GASOLINE' as const,
    bodyType: 'MPV',
    exteriorColor: 'Jet Black Mica',
    interiorColor: 'Coklat',
    images: [
      'https://picsum.photos/seed/xpander-black-1/800/600',
      'https://picsum.photos/seed/xpander-black-2/800/600',
      'https://picsum.photos/seed/xpander-black-3/800/600',
    ],
    description: 'Mitsubishi Xpander Cross 1.5 AT 2023, tangan pertama dari baru. Pemakaian harian untuk antar anak sekolah, jarang dipakai jarak jauh. Full orisinal, cat masih mulus. Service berkala di dealer resmi Mitsubishi. Ban masih tebal semua. Kondisi siap pakai tanpa PR.',
    features: ['LED Headlamp & Foglamp', 'Roof Rail', 'Skid Plate', 'Black Alloy Wheel', '7" Touchscreen', 'Steering Wheel Switch', 'Cruise Control', 'Dual SRS Airbag', 'ABS + EBD', 'Hill Start Assist'],
    sellerId: 'seller-5',
    city: 'Surabaya',
    province: 'Jawa Timur',
    inspectionScore: 88.0,
    inspectionDate: '2024-11-01T11:30:00Z',
    isFeatured: false,
    isNegotiable: true,
    views: 2876,
    createdAt: '2024-11-05T16:45:00Z',
    updatedAt: '2024-11-12T08:20:00Z',
  },
  {
    id: 'listing-4',
    title: 'Toyota Fortuner 2.4 VRZ AT 2022 — Diesel Mewah',
    slug: 'toyota-fortuner-2-4-vrz-at-2022',
    brandId: 'brand-1',
    modelId: 'model-3',
    variant: '2.4 VRZ 4x2 AT Diesel',
    year: 2022,
    price: 485000000,
    originalPrice: 545000000,
    mileage: 32000,
    condition: 'USED' as const,
    transmission: 'AUTOMATIC' as const,
    fuelType: 'DIESEL' as const,
    bodyType: 'SUV',
    exteriorColor: 'Silver Metalik',
    interiorColor: 'Coklat',
    images: [
      'https://picsum.photos/seed/fortuner-silver-1/800/600',
      'https://picsum.photos/seed/fortuner-silver-2/800/600',
      'https://picsum.photos/seed/fortuner-silver-3/800/600',
      'https://picsum.photos/seed/fortuner-silver-4/800/600',
    ],
    description: 'Toyota Fortuner 2.4 VRZ AT Diesel 2022, tangan pertama, nik akhir 2022. SUV premium dengan mesin diesel 2.4L yang bertenaga dan irit. Cocok untuk keluarga dan perjalanan jauh. Kondisi terawat, body mulus, mesin halus tidak ngebul. Bisa tukar tambah.',
    features: ['Diesel 2.4L Turbo', '6 Airbag', 'VSC + TRC', 'HAC + DAC', 'Kick Sensor', 'Push Start', 'Auto AC Digital', 'Touchscreen 9"', 'Wireless Charger', 'Panoramic Camera'],
    sellerId: 'seller-1',
    city: 'Jakarta Utara',
    province: 'DKI Jakarta',
    inspectionScore: 90.0,
    inspectionDate: '2024-10-28T09:15:00Z',
    isFeatured: true,
    isNegotiable: true,
    views: 7203,
    createdAt: '2024-10-30T12:00:00Z',
    updatedAt: '2024-11-14T10:30:00Z',
  },
  {
    id: 'listing-5',
    title: 'Daihatsu Sigra 1.2 R CVT 2023 — LCGC Irit',
    slug: 'daihatsu-sigra-1-2-r-cvt-2023',
    brandId: 'brand-3',
    modelId: 'model-10',
    variant: '1.2 R CVT',
    year: 2023,
    price: 165000000,
    originalPrice: 175000000,
    mileage: 15000,
    condition: 'USED' as const,
    transmission: 'CVT' as const,
    fuelType: 'GASOLINE' as const,
    bodyType: 'MPV',
    exteriorColor: 'Merah Metalik',
    interiorColor: 'Abu-abu',
    images: [
      'https://picsum.photos/seed/sigra-red-1/800/600',
      'https://picsum.photos/seed/sigra-red-2/800/600',
      'https://picsum.photos/seed/sigra-red-3/800/600',
    ],
    description: 'Daihatsu Sigra 1.2 R CVT 2023, pemakaian pribadi wanita. Mobil kecil 7 penumpang yang sangat irit BBM, cocok untuk keluarga kecil. Kondisi terawat, mesin halus, AC dingin. Service rutin di Daihatsu resmi. Pajak panjang sampai Desember 2025.',
    features: ['CVT', 'Double Blower AC', 'Touchscreen 8"', 'Rear Wiper', 'Spoiler', 'Chrome Grille', 'Digital AC', ' Immobilizer', 'ABS', 'Dual Airbag'],
    sellerId: 'seller-3',
    city: 'Semarang',
    province: 'Jawa Tengah',
    inspectionScore: 85.0,
    inspectionDate: '2024-11-05T13:00:00Z',
    isFeatured: false,
    isNegotiable: true,
    views: 1923,
    createdAt: '2024-11-08T09:30:00Z',
    updatedAt: '2024-11-13T14:00:00Z',
  },
  {
    id: 'listing-6',
    title: 'Hyundai Ioniq 5 Prime Long Range 2024 — Listrik Masa Depan',
    slug: 'hyundai-ioniq-5-prime-long-range-2024',
    brandId: 'brand-8',
    modelId: 'model-19',
    variant: 'Prime Long Range',
    year: 2024,
    price: 648000000,
    originalPrice: 648000000,
    mileage: null,
    condition: 'NEW' as const,
    transmission: 'AUTOMATIC' as const,
    fuelType: 'ELECTRIC' as const,
    bodyType: 'SUV',
    exteriorColor: 'Gravity Gold Matte',
    interiorColor: 'Hitam Eco Leather',
    images: [
      'https://picsum.photos/seed/ioniq5-gold-1/800/600',
      'https://picsum.photos/seed/ioniq5-gold-2/800/600',
      'https://picsum.photos/seed/ioniq5-gold-3/800/600',
      'https://picsum.photos/seed/ioniq5-gold-4/800/600',
      'https://picsum.photos/seed/ioniq5-gold-5/800/600',
    ],
    description: 'Hyundai Ioniq 5 Prime Long Range 2024, mobil listrik terbaik di Indonesia. Jarak tempuh hingga 481 km dengan pengisian ultra-cepat 350 kW dari 10% ke 80% hanya 18 menit. Dilengkapi Vehicle-to-Load (V2L) untuk mengisi daya perangkat elektronik. Interior futuristik dengan material ramah lingkungan.',
    features: ['Electric Motor 217 HP', '72.6 kWh Battery', 'V2L', '350kW Ultra-Fast Charging', 'Augmented Reality HUD', '12.3" Dual Screen', 'Relaxation Seat', 'BOSE Premium Sound', 'Highway Driving Assist', 'SmartSense Safety'],
    sellerId: 'seller-6',
    city: 'Medan',
    province: 'Sumatera Utara',
    inspectionScore: null,
    inspectionDate: null,
    isFeatured: true,
    isNegotiable: false,
    views: 9342,
    createdAt: '2024-11-01T07:00:00Z',
    updatedAt: '2024-11-14T16:00:00Z',
  },
  {
    id: 'listing-7',
    title: 'Suzuki Ertiga GX AT 2022 — Keluarga Irit',
    slug: 'suzuki-ertiga-gx-at-2022',
    brandId: 'brand-4',
    modelId: 'model-11',
    variant: '1.5 GX AT Hybrid',
    year: 2022,
    price: 225000000,
    originalPrice: 260000000,
    mileage: 28000,
    condition: 'USED' as const,
    transmission: 'AUTOMATIC' as const,
    fuelType: 'HYBRID' as const,
    bodyType: 'MPV',
    exteriorColor: 'Biru Metalik',
    interiorColor: 'Abu-abu',
    images: [
      'https://picsum.photos/seed/ertiga-blue-1/800/600',
      'https://picsum.photos/seed/ertiga-blue-2/800/600',
      'https://picsum.photos/seed/ertiga-blue-3/800/600',
    ],
    description: 'Suzuki Ertiga GX AT Hybrid 2022, tangan pertama, pemakaian keluarga. Sudah hybrid sehingga lebih irit BBM. Kabin luas 7 penumpang, AC double blower dingin. Body kaleng mulus, interior bersih terawat. Service record lengkap di Suzuki resmi.',
    features: ['Smart Hybrid', 'Auto AC', 'Head Unit 8"', 'Steering Wheel Control', 'Cruise Control', 'ABS + EBD', 'Dual Airbag', 'ISOFIX', 'Rear Parking Sensor', 'Immobilizer'],
    sellerId: 'seller-5',
    city: 'Surabaya',
    province: 'Jawa Timur',
    inspectionScore: 86.5,
    inspectionDate: '2024-11-02T10:00:00Z',
    isFeatured: false,
    isNegotiable: true,
    views: 2456,
    createdAt: '2024-11-03T11:00:00Z',
    updatedAt: '2024-11-11T15:30:00Z',
  },
  {
    id: 'listing-8',
    title: 'BMW X3 xDrive20i M Sport 2023 — Premium SUV',
    slug: 'bmw-x3-xdrive20i-m-sport-2023',
    brandId: 'brand-6',
    modelId: 'model-15',
    variant: 'xDrive20i M Sport',
    year: 2023,
    price: 895000000,
    originalPrice: 1050000000,
    mileage: 18500,
    condition: 'USED' as const,
    transmission: 'AUTOMATIC' as const,
    fuelType: 'GASOLINE' as const,
    bodyType: 'SUV',
    exteriorColor: 'Mineral White',
    interiorColor: 'Cognac Vernasca Leather',
    images: [
      'https://picsum.photos/seed/bmwx3-white-1/800/600',
      'https://picsum.photos/seed/bmwx3-white-2/800/600',
      'https://picsum.photos/seed/bmwx3-white-3/800/600',
      'https://picsum.photos/seed/bmwx3-white-4/800/600',
    ],
    description: 'BMW X3 xDrive20i M Sport 2023, import CBU Jerman. SUV premium dengan performa sporty berkendara AWD. Tangan pertama, kilometer rendah, serviced hanya di BMW Authorized. M Sport package lengkap: bumper sport, side skirt, velg M 19 inci, interior M. Kondisi pristine seperti baru.',
    features: ['M Sport Package', 'xDrive AWD', '2.0L Turbo 184 HP', '8-Speed Steptronic', 'Harman Kardon', 'Live Cockpit Professional', 'Head-Up Display', 'Driving Assistant Professional', 'Parking Assistant', 'Electric Tailgate'],
    sellerId: 'seller-2',
    city: 'Jakarta Barat',
    province: 'DKI Jakarta',
    inspectionScore: 95.0,
    inspectionDate: '2024-11-10T09:00:00Z',
    isFeatured: true,
    isNegotiable: true,
    views: 11205,
    createdAt: '2024-11-10T10:00:00Z',
    updatedAt: '2024-11-15T12:00:00Z',
  },
  {
    id: 'listing-9',
    title: 'Honda Brio RS CVT 2024 — Hatchback Sporty',
    slug: 'honda-brio-rs-cvt-2024',
    brandId: 'brand-2',
    modelId: 'model-7',
    variant: '1.2 RS CVT',
    year: 2024,
    price: 195000000,
    originalPrice: 195000000,
    mileage: null,
    condition: 'NEW' as const,
    transmission: 'CVT' as const,
    fuelType: 'GASOLINE' as const,
    bodyType: 'Hatchback',
    exteriorColor: 'Champagne Gold',
    interiorColor: 'Hitam',
    images: [
      'https://picsum.photos/seed/brio-gold-1/800/600',
      'https://picsum.photos/seed/brio-gold-2/800/600',
      'https://picsum.photos/seed/brio-gold-3/800/600',
    ],
    description: 'Honda Brio RS CVT 2024 baru, hatchback paling laris di Indonesia. Desain sporty dengan aggressive grille, LED projector headlamp, dan diffuser belakang racing. Mesin 1.2L i-VTEC yang bertenaga dan irit. Cocok untuk mobilitas harian di kota. Garansi resmi Honda 3 tahun / 100.000 km.',
    features: ['LED Projector Headlamp', 'RS Body Kit', '15" Alloy Wheel', 'Smart Key System', 'Push Start Button', 'Touchscreen 8"', 'Paddle Shift', 'Dual Airbag', 'ABS + EBD', 'Vehicle Stability Assist'],
    sellerId: 'seller-4',
    city: 'Denpasar',
    province: 'Bali',
    inspectionScore: null,
    inspectionDate: null,
    isFeatured: false,
    isNegotiable: false,
    views: 4567,
    createdAt: '2024-11-12T08:00:00Z',
    updatedAt: '2024-11-12T08:00:00Z',
  },
  {
    id: 'listing-10',
    title: 'Mercedes-Benz C200 AMG Line 2023 — Elegan Mewah',
    slug: 'mercedes-benz-c200-amg-line-2023',
    brandId: 'brand-7',
    modelId: 'model-16',
    variant: 'C200 AMG Line',
    year: 2023,
    price: 785000000,
    originalPrice: 920000000,
    mileage: 22000,
    condition: 'USED' as const,
    transmission: 'AUTOMATIC' as const,
    fuelType: 'GASOLINE' as const,
    bodyType: 'Sedan',
    exteriorColor: 'Obsidian Black',
    interiorColor: 'Macchiato Beige',
    images: [
      'https://picsum.photos/seed/mercc200-black-1/800/600',
      'https://picsum.photos/seed/mercc200-black-2/800/600',
      'https://picsum.photos/seed/mercc200-black-3/800/600',
      'https://picsum.photos/seed/mercc200-black-4/800/600',
    ],
    description: 'Mercedes-Benz C200 AMG Line 2023, sedan premium kelas menengah. Tangan pertama, kilometer rendah. Mesin 1.5L turbo mild hybrid yang halus dan bertenaga. Interior mewah dengan MBUX terbaru, ambient lighting 64 warna, dan Burmester sound system. AMG Line exterior package memberikan tampilan sporty yang elegan.',
    features: ['AMG Line Package', '1.5L Turbo + EQ Boost', '9G-Tronic', 'MBUX', 'Ambient Lighting 64 Colors', 'Burmester Sound', 'Digital Instrument Cluster', '360° Camera', 'Active Parking Assist', 'PRE-SAFE System'],
    sellerId: 'seller-6',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    inspectionScore: 93.5,
    inspectionDate: '2024-11-08T14:00:00Z',
    isFeatured: true,
    isNegotiable: true,
    views: 8901,
    createdAt: '2024-11-08T15:00:00Z',
    updatedAt: '2024-11-14T11:00:00Z',
  },
  {
    id: 'listing-11',
    title: 'Toyota Rush 1.5 GR Sport AT 2023 — SUV Tangguh',
    slug: 'toyota-rush-1-5-gr-sport-at-2023',
    brandId: 'brand-1',
    modelId: 'model-2',
    variant: '1.5 GR Sport AT',
    year: 2023,
    price: 295000000,
    originalPrice: 310000000,
    mileage: 20000,
    condition: 'USED' as const,
    transmission: 'AUTOMATIC' as const,
    fuelType: 'GASOLINE' as const,
    bodyType: 'SUV',
    exteriorColor: 'Merah GR Sport',
    interiorColor: 'Hitam',
    images: [
      'https://picsum.photos/seed/rush-red-1/800/600',
      'https://picsum.photos/seed/rush-red-2/800/600',
      'https://picsum.photos/seed/rush-red-3/800/600',
    ],
    description: 'Toyota Rush 1.5 GR Sport AT 2023, tangan pertama dari baru. SUV 7 penumpang dengan ground clearance tinggi, cocok untuk segala medan. GR Sport package dengan aksen merah, grille sport, dan side body molding. Service record lengkap di Auto2000.',
    features: ['GR Sport Package', 'Ground Clearance 220mm', '7 Seater', 'LED Headlamp', 'Touchscreen 9"', 'Push Start', 'Auto AC', '4 Airbag', 'VSC + TRC + HSA', 'Rear Parking Camera'],
    sellerId: 'seller-3',
    city: 'Semarang',
    province: 'Jawa Tengah',
    inspectionScore: 87.0,
    inspectionDate: '2024-11-03T09:30:00Z',
    isFeatured: false,
    isNegotiable: true,
    views: 3210,
    createdAt: '2024-11-06T10:30:00Z',
    updatedAt: '2024-11-12T14:15:00Z',
  },
  {
    id: 'listing-12',
    title: 'Daihatsu Xenia 1.5 R CVT 2024 — Baru LCGC',
    slug: 'daihatsu-xenia-1-5-r-cvt-2024',
    brandId: 'brand-3',
    modelId: 'model-9',
    variant: '1.5 R CVT',
    year: 2024,
    price: 243000000,
    originalPrice: 243000000,
    mileage: null,
    condition: 'NEW' as const,
    transmission: 'CVT' as const,
    fuelType: 'GASOLINE' as const,
    bodyType: 'MPV',
    exteriorColor: 'Silver Metalik',
    interiorColor: 'Abu-abu',
    images: [
      'https://picsum.photos/seed/xenia-silver-1/800/600',
      'https://picsum.photos/seed/xenia-silver-2/800/600',
      'https://picsum.photos/seed/xenia-silver-3/800/600',
    ],
    description: 'Daihatsu Xenia 1.5 R CVT 2024 baru, garansi resmi 3 tahun/100.000 km. MPV terlaris Daihatsu dengan mesin 1.5L yang bertenaga namun tetap irit. Kabin lega untuk 7 penumpang dengan headroom dan legroom terbaik di kelasnya. Fitur keamanan lengkap.',
    features: ['WIRA-WIRI Technology', 'LED Headlamp', 'Touchscreen 9"', 'Steering Wheel Switch', 'Digital AC', 'Rear Camera', 'ABS + EBD', 'Dual Airbag', 'ISOFIX', 'Immobilizer'],
    sellerId: 'seller-4',
    city: 'Denpasar',
    province: 'Bali',
    inspectionScore: null,
    inspectionDate: null,
    isFeatured: false,
    isNegotiable: false,
    views: 2134,
    createdAt: '2024-11-13T09:00:00Z',
    updatedAt: '2024-11-13T09:00:00Z',
  },
  {
    id: 'listing-13',
    title: 'Honda BR-V 1.5 N7X CVT 2023 — Recondition Istimewa',
    slug: 'honda-brv-1-5-n7x-cvt-2023',
    brandId: 'brand-2',
    modelId: 'model-5',
    variant: '1.5 N7X CVT Prestige',
    year: 2023,
    price: 298000000,
    originalPrice: 320000000,
    mileage: 34000,
    condition: 'RECON' as const,
    transmission: 'CVT' as const,
    fuelType: 'GASOLINE' as const,
    bodyType: 'SUV',
    exteriorColor: 'Lunar Silver',
    interiorColor: 'Hitam',
    images: [
      'https://picsum.photos/seed/brv-silver-1/800/600',
      'https://picsum.photos/seed/brv-silver-2/800/600',
      'https://picsum.photos/seed/brv-silver-3/800/600',
    ],
    description: 'Honda BR-V N7X CVT Prestige 2023, unit recondition berkualitas tinggi. Mesin sudah diperiksa dan diservis menyeluruh, AC diganti baru, ban diganti baru. Body sudah di detailing dan poles. Tampil dan berkendara seperti unit baru. Surat-surat lengkap dan legal.',
    features: ['Walk Away Auto Lock', 'Remote Engine Start', 'LED Headlamp & Foglamp', 'Paddle Shift', 'Electric Parking Brake', 'Multi-Angle Camera', '6 Airbag', 'VSA', 'Hill Start Assist', 'ISOFIX'],
    sellerId: 'seller-5',
    city: 'Surabaya',
    province: 'Jawa Timur',
    inspectionScore: 89.0,
    inspectionDate: '2024-11-09T11:00:00Z',
    isFeatured: false,
    isNegotiable: true,
    views: 1876,
    createdAt: '2024-11-09T12:00:00Z',
    updatedAt: '2024-11-14T16:30:00Z',
  },
  {
    id: 'listing-14',
    title: 'Suzuki XL7 Alpha AT 2024 — SUV Tangguh Irit',
    slug: 'suzuki-xl7-alpha-at-2024',
    brandId: 'brand-4',
    modelId: 'model-12',
    variant: '1.5 Alpha AT',
    year: 2024,
    price: 285000000,
    originalPrice: 285000000,
    mileage: null,
    condition: 'NEW' as const,
    transmission: 'AUTOMATIC' as const,
    fuelType: 'GASOLINE' as const,
    bodyType: 'SUV',
    exteriorColor: 'Khaki',
    interiorColor: 'Hitam',
    images: [
      'https://picsum.photos/seed/xl7-khaki-1/800/600',
      'https://picsum.photos/seed/xl7-khaki-2/800/600',
      'https://picsum.photos/seed/xl7-khaki-3/800/600',
    ],
    description: 'Suzuki XL7 Alpha AT 2024 baru, garansi resmi Suzuki Indonesia 3 tahun/100.000 km. SUV 7 penumpang dengan ground clearance tinggi 200mm, tangguh di segala medan. Desain adventure yang gagah dengan roof rail, side body cladding, dan velg alloy 17 inci. Sangat irit dengan konsumsi BBM 15 km/liter.',
    features: ['SHVS Smart Hybrid', 'Roof Rail', '17" Alloy Wheel', 'Touchscreen 8"', 'Steering Wheel Control', 'Cruise Control', 'Auto Climate Control', 'ABS + EBD', 'Dual Airbag', 'Rear Parking Sensor'],
    sellerId: 'seller-3',
    city: 'Semarang',
    province: 'Jawa Tengah',
    inspectionScore: null,
    inspectionDate: null,
    isFeatured: false,
    isNegotiable: false,
    views: 1678,
    createdAt: '2024-11-14T08:00:00Z',
    updatedAt: '2024-11-14T08:00:00Z',
  },
  {
    id: 'listing-15',
    title: 'Mitsubishi Pajero Sport Dakar 2.4 AT 2022 — Diesel Legendaris',
    slug: 'mitsubishi-pajero-sport-dakar-2-4-at-2022',
    brandId: 'brand-5',
    modelId: 'model-14',
    variant: '2.4 Dakar 4x2 AT',
    year: 2022,
    price: 475000000,
    originalPrice: 560000000,
    mileage: 38000,
    condition: 'USED' as const,
    transmission: 'AUTOMATIC' as const,
    fuelType: 'DIESEL' as const,
    bodyType: 'SUV',
    exteriorColor: 'White Diamond',
    interiorColor: 'Hitam',
    images: [
      'https://picsum.photos/seed/pajero-white-1/800/600',
      'https://picsum.photos/seed/pajero-white-2/800/600',
      'https://picsum.photos/seed/pajero-white-3/800/600',
      'https://picsum.photos/seed/pajero-white-4/800/600',
    ],
    description: 'Mitsubishi Pajero Sport Dakar 2.4 AT 2022, tangan pertama. SUV diesel tangguh dengan Super Select 4WD-II (tipe 4x4). Mesin 2.4L MIVEC turbo diesel bertenaga dan torsi besar. Cocok untuk offroad ringan dan perjalanan luar kota. Kondisi terawat, serviced rutin, ban Bridgestone Dueler baru.',
    features: ['Super Select 4WD-II', '2.4L MIVEC Turbo Diesel', '8-Speed AT', 'Jet Fighter Grille', 'LED DRL', 'Power Tailgate', 'Rockford Fosgate Sound', '8" Touchscreen', '360° Camera', 'Ultrasonic Misaccel Prevention'],
    sellerId: 'seller-1',
    city: 'Jakarta Timur',
    province: 'DKI Jakarta',
    inspectionScore: 91.0,
    inspectionDate: '2024-11-06T10:00:00Z',
    isFeatured: false,
    isNegotiable: true,
    views: 5432,
    createdAt: '2024-11-07T13:00:00Z',
    updatedAt: '2024-11-13T09:45:00Z',
  },
  {
    id: 'listing-16',
    title: 'Toyota Innova Zenix 2.0 V CVT 2023 — Hybrid MPV Premium',
    slug: 'toyota-innova-zenix-2-0-v-cvt-2023',
    brandId: 'brand-1',
    modelId: 'model-4',
    variant: '2.0 V CVT Hybrid',
    year: 2023,
    price: 420000000,
    originalPrice: 450000000,
    mileage: 16000,
    condition: 'USED' as const,
    transmission: 'CVT' as const,
    fuelType: 'HYBRID' as const,
    bodyType: 'MPV',
    exteriorColor: 'Silver Metalik',
    interiorColor: 'Coklat',
    images: [
      'https://picsum.photos/seed/zenix-silver-1/800/600',
      'https://picsum.photos/seed/zenix-silver-2/800/600',
      'https://picsum.photos/seed/zenix-silver-3/800/600',
    ],
    description: 'Toyota Innova Zenix 2.0 V CVT Hybrid 2023, penerus legendaris Kijang Innova. Tangan pertama, pemakaian keluarga. Platform TNGA baru yang lebih nyaman dan sporty. Hybrid system membuat konsumsi BBM sangat irit untuk ukuran MPV sebesar ini. Interior premium dengan captain seat baris kedua.',
    features: ['Hybrid System', 'TNGA Platform', 'Toyota Safety Sense', 'Captain Seat', 'Electric Ottoman Seat', 'Panoramic Roof', '10" Head Unit', 'Digital Meter Cluster', '9 Airbag', 'Adaptive Cruise Control'],
    sellerId: 'seller-2',
    city: 'Bandung',
    province: 'Jawa Barat',
    inspectionScore: 94.0,
    inspectionDate: '2024-11-11T08:30:00Z',
    isFeatured: true,
    isNegotiable: true,
    views: 6789,
    createdAt: '2024-11-11T10:00:00Z',
    updatedAt: '2024-11-15T09:00:00Z',
  },
  {
    id: 'listing-17',
    title: 'Hyundai Creta Prime AT 2023 — Compact SUV Modern',
    slug: 'hyundai-creta-prime-at-2023',
    brandId: 'brand-8',
    modelId: 'model-17',
    variant: '1.5 Prime AT',
    year: 2023,
    price: 340000000,
    originalPrice: 365000000,
    mileage: 11000,
    condition: 'USED' as const,
    transmission: 'AUTOMATIC' as const,
    fuelType: 'GASOLINE' as const,
    bodyType: 'SUV',
    exteriorColor: 'Titan Gray',
    interiorColor: 'Hitam',
    images: [
      'https://picsum.photos/seed/creta-gray-1/800/600',
      'https://picsum.photos/seed/creta-gray-2/800/600',
      'https://picsum.photos/seed/creta-gray-3/800/600',
    ],
    description: 'Hyundai Creta Prime AT 2023, compact SUV modern dengan fitur melimpah. Tangan pertama, kilometer rendah. Desain fresh dengan parametric front grille dan LED strip light. Interior modern dengan dual 10.25" screen, panaromic sunroof, dan Bose sound system. SmartSense safety features lengkap.',
    features: ['Dual 10.25" Screen', 'Panoramic Sunroof', 'BOSE Sound', 'Digital Key', 'Bluelink Connected', 'SmartSense ADAS', 'LED Headlamp', 'Ventilated Seats', 'Wireless Charging', 'Electric Seat'],
    sellerId: 'seller-4',
    city: 'Denpasar',
    province: 'Bali',
    inspectionScore: 88.5,
    inspectionDate: '2024-11-04T15:00:00Z',
    isFeatured: false,
    isNegotiable: true,
    views: 3654,
    createdAt: '2024-11-04T16:00:00Z',
    updatedAt: '2024-11-12T10:00:00Z',
  },
  {
    id: 'listing-18',
    title: 'BMW X3 xDrive30e M Sport 2024 — Plug-in Hybrid',
    slug: 'bmw-x3-xdrive30e-m-sport-2024',
    brandId: 'brand-6',
    modelId: 'model-15',
    variant: 'xDrive30e M Sport PHEV',
    year: 2024,
    price: 1280000000,
    originalPrice: 1280000000,
    mileage: null,
    condition: 'NEW' as const,
    transmission: 'AUTOMATIC' as const,
    fuelType: 'HYBRID' as const,
    bodyType: 'SUV',
    exteriorColor: 'British Racing Green',
    interiorColor: 'Cognac Vernasca Leather',
    images: [
      'https://picsum.photos/seed/bmwx3-green-1/800/600',
      'https://picsum.photos/seed/bmwx3-green-2/800/600',
      'https://picsum.photos/seed/bmwx3-green-3/800/600',
      'https://picsum.photos/seed/bmwx3-green-4/800/600',
      'https://picsum.photos/seed/bmwx3-green-5/800/600',
    ],
    description: 'BMW X3 xDrive30e M Sport 2024, plug-in hybrid SUV terbaru. Menggabungkan mesin bensin 2.0L turbo dengan motor listrik untuk performa total 292 HP. Jarak tempuh listrik hingga 50 km. M Sport package lengkap, import CBU Jerman. Garansi BMW Service Inclusive 5 tahun tanpa batas kilometer.',
    features: ['PHEV 292 HP', '50km Electric Range', 'M Sport Package', 'xDrive AWD', '8-Speed Steptronic', 'Harman Kardon Surround', 'BMW Live Cockpit Pro', 'Driving Assistant Professional', 'Parking Assistant Plus', 'BMW Theater Screen'],
    sellerId: 'seller-6',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    inspectionScore: null,
    inspectionDate: null,
    isFeatured: true,
    isNegotiable: false,
    views: 4521,
    createdAt: '2024-11-13T11:00:00Z',
    updatedAt: '2024-11-13T11:00:00Z',
  },
]

// ──────────────────────────────────────────────
// Mock Categories
// ──────────────────────────────────────────────
const categories = [
  {
    id: 'cat-1',
    name: 'SUV',
    slug: 'suv',
    icon: '🚙',
    description: 'Sport Utility Vehicle — Tangguh di segala medan dengan kabin luas dan ground clearance tinggi',
    count: 8450,
  },
  {
    id: 'cat-2',
    name: 'MPV',
    slug: 'mpv',
    icon: '🚐',
    description: 'Multi-Purpose Vehicle — Pilihan utama keluarga Indonesia dengan kapasitas 7 penumpang',
    count: 12300,
  },
  {
    id: 'cat-3',
    name: 'Sedan',
    slug: 'sedan',
    icon: '🚗',
    description: 'Sedan mewah dan elegan untuk profesional yang mengutamakan kenyamanan berkendara',
    count: 3200,
  },
  {
    id: 'cat-4',
    name: 'Hatchback',
    slug: 'hatchback',
    icon: '🏎️',
    description: 'Hatchback sporty dan kompak, pilihan tepat untuk mobilitas harian di perkotaan',
    count: 5600,
  },
  {
    id: 'cat-5',
    name: 'Pickup',
    slug: 'pickup',
    icon: '🛻',
    description: 'Kendaraan pikap tangguh untuk kebutuhan bisnis dan aktivitas outdoor',
    count: 4100,
  },
  {
    id: 'cat-6',
    name: 'Sport',
    slug: 'sport',
    icon: '🏁',
    description: 'Mobil sport dan performa tinggi untuk pecinta kecepatan dan adrenalin',
    count: 890,
  },
]

// ──────────────────────────────────────────────
// Mock Reviews
// ──────────────────────────────────────────────
const reviews = [
  {
    id: 'review-1',
    author: 'Agus Hermawan',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=agus',
    rating: 5.0,
    comment: 'Pengalaman beli mobil di AutoMarket sangat menyenangkan! Mobil yang saya beli sesuai dengan deskripsi, kondisi mulus tanpa cacat. Proses administrasi cepat dan pelayanan ramah. Terima kasih AutoMarket!',
    carModel: 'Honda HR-V 1.5 SE CVT 2023',
    date: '2024-11-10',
    location: 'Bandung, Jawa Barat',
  },
  {
    id: 'review-2',
    author: 'Rina Wulandari',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=rina',
    rating: 4.5,
    comment: 'Harga kompetitif dan transparan. Mobil di-inspect oleh tim profesional, jadi saya yakin dengan kondisinya. Cuma sedikit telat di pengiriman dokumen, tapi overall puas. Recommended!',
    carModel: 'Toyota Avanza 1.5 G CVT 2024',
    date: '2024-11-08',
    location: 'Jakarta Selatan, DKI Jakarta',
  },
  {
    id: 'review-3',
    author: 'Hendra Gunawan',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=hendra',
    rating: 5.0,
    comment: 'Sudah 3 kali beli mobil melalui AutoMarket dan tidak pernah kecewa. Platform terpercaya dengan jaminan inspeksi menyeluruh. Pilihan mobil sangat lengkap, dari MPV sampai SUV premium.',
    carModel: 'Mitsubishi Xpander Cross 1.5 AT 2023',
    date: '2024-11-05',
    location: 'Surabaya, Jawa Timur',
  },
  {
    id: 'review-4',
    author: 'Maya Putri',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=maya',
    rating: 4.0,
    comment: 'Proses jual mobil juga mudah di AutoMarket. Tim appraisal-nya profesional dan harga penawaran fair. Dari listing sampai deal hanya 5 hari. Top!',
    carModel: 'Suzuki Ertiga GX AT 2022',
    date: '2024-11-03',
    location: 'Semarang, Jawa Tengah',
  },
  {
    id: 'review-5',
    author: 'Fajar Nugroho',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=fajar',
    rating: 5.0,
    comment: 'Beli Hyundai Ioniq 5 lewat AutoMarket, prosesnya gampang banget. Sales-nya helpful, jelaskan semua detail mobil termasuk fitur V2L dan pengisian daya. Mobil listrik pertama saya dan sangat puas!',
    carModel: 'Hyundai Ioniq 5 Prime Long Range 2024',
    date: '2024-11-01',
    location: 'Medan, Sumatera Utara',
  },
  {
    id: 'review-6',
    author: 'Dian Permata',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=dian',
    rating: 4.5,
    comment: 'Cari mobil bekas berkualitas memang susah, tapi di AutoMarket semua listing sudah di-inspect jadi aman. Fitur perbandingan mobilnya sangat membantu. Saya dapat BMW X3 kondisi prime dengan harga terbaik!',
    carModel: 'BMW X3 xDrive20i M Sport 2023',
    date: '2024-10-28',
    location: 'Jakarta Barat, DKI Jakarta',
  },
]

// ──────────────────────────────────────────────
// Mock Banners
// ──────────────────────────────────────────────
const banners = [
  {
    id: 'banner-1',
    title: 'Festival Otomotif Akhir Tahun',
    subtitle: 'Diskon hingga 15% untuk semua mobil! Periode terbatas Desember 2024.',
    image: 'https://picsum.photos/seed/banner-promo-1/1200/400',
    link: '/search?promotion=year-end',
    position: 'hero',
    active: true,
    order: 1,
  },
  {
    id: 'banner-2',
    title: 'Koleksi Mobil Listrik',
    subtitle: 'Masa depan berkendara dimulai sekarang. Jelajahi lineup EV terlengkap.',
    image: 'https://picsum.photos/seed/banner-ev-2/1200/400',
    link: '/search?fuelType=ELECTRIC',
    position: 'hero',
    active: true,
    order: 2,
  },
  {
    id: 'banner-3',
    title: 'Jual Mobil Anda di AutoMarket',
    subtitle: 'Dapatkan penawaran terbaik dalam 24 jam. Gratis penilaian mobil!',
    image: 'https://picsum.photos/seed/banner-sell-3/1200/400',
    link: '/sell',
    position: 'sidebar',
    active: true,
    order: 1,
  },
  {
    id: 'banner-4',
    title: 'Toyota Safety Sense',
    subtitle: 'Keamanan terdepan untuk keluarga Anda. Lihat semua model Toyota.',
    image: 'https://picsum.photos/seed/banner-tss-4/1200/400',
    link: '/brand/toyota',
    position: 'sidebar',
    active: true,
    order: 2,
  },
]

// ──────────────────────────────────────────────
// Mock Token Packages
// ──────────────────────────────────────────────
const tokenPackages = [
  {
    id: 'pkg-1',
    name: 'Basic',
    price: 99000,
    tokens: 10,
    features: [
      '10 listing views',
      'Filter dasar',
      'Akses galeri foto',
      'Notifikasi listing baru',
    ],
    popular: false,
  },
  {
    id: 'pkg-2',
    name: 'Pro',
    price: 249000,
    tokens: 50,
    features: [
      '50 listing views',
      'Filter lanjutan',
      'Akses galeri foto HD',
      'Notifikasi real-time',
      'Inspeksi virtual',
      'Perbandingan mobil',
      'Chat langsung penjual',
    ],
    popular: true,
  },
  {
    id: 'pkg-3',
    name: 'Enterprise',
    price: 499000,
    tokens: 200,
    features: [
      '200 listing views',
      'Semua filter Pro',
      'Report inspeksi lengkap',
      'Prioritas customer service',
      'Test drive terjadwal',
      'Konsultasi pembelian',
      'Garansi buyback 7 hari',
      'Accessories discount 10%',
    ],
    popular: false,
  },
]

// ──────────────────────────────────────────────
// Mock Dealers
// ──────────────────────────────────────────────
const dealers = [
  {
    id: 'dealer-1',
    brandId: 'brand-1',
    address: 'Jl. Jend. Gatot Subroto Kav. 37, Jakarta Selatan',
    phone: '(021) 5050-111',
    email: 'info@toyota-astra.co.id',
    website: 'https://www.toyota.astra.co.id',
    rating: 4.7,
    totalReviews: 3842,
    totalListings: 234,
    openHours: 'Senin - Sabtu: 08.00 - 17.00 WIB',
    description: 'Auto2000 Cabang Gatot Subroto adalah dealer resmi Toyota terbesar di Indonesia bagian barat. Melayani penjualan mobil baru Toyota, servis berkala, suku cadang asli, dan body & paint. Dilengkapi showroom modern dengan test drive area luas.',
    latitude: -6.2247,
    longitude: 106.8261,
    verified: true,
    featuredListingIds: ['listing-1', 'listing-4', 'listing-16'],
    createdAt: '2019-01-15T00:00:00Z',
  },
  {
    id: 'dealer-2',
    brandId: 'brand-2',
    address: 'Jl. Pasteur No. 45, Bandung',
    phone: '(022) 2030-888',
    email: 'info@honda-bandung.co.id',
    website: 'https://www.honda-bandung.co.id',
    rating: 4.8,
    totalReviews: 2156,
    totalListings: 189,
    openHours: 'Senin - Sabtu: 08.30 - 17.00 WIB',
    description: 'Honda Anugerah Sejahtera Bandung, dealer resmi Honda terpercaya sejak 2005. Menyediakan mobil baru Honda, servis berkala, body repair, dan suku cadang. Tim mekanik bersertifikasi Honda dengan standar pelayanan terbaik.',
    latitude: -6.9057,
    longitude: 107.6153,
    verified: true,
    featuredListingIds: ['listing-2', 'listing-9', 'listing-13'],
    createdAt: '2019-03-20T00:00:00Z',
  },
  {
    id: 'dealer-3',
    brandId: 'brand-3',
    address: 'Jl. Ahmad Yani No. 22, Semarang',
    phone: '(024) 7654-321',
    email: 'info@daihatsu-semarang.co.id',
    website: 'https://www.daihatsu-semarang.co.id',
    rating: 4.5,
    totalReviews: 1234,
    totalListings: 145,
    openHours: 'Senin - Sabtu: 08.00 - 16.30 WIB',
    description: 'Daihatsu Semarang adalah dealer resmi Daihatsu terbesar di Jawa Tengah. Menyediakan lineup lengkap Daihatsu Indonesia mulai dari Sigra, Ayla, Xenia, hingga Terios. Pelayanan ramah dengan harga bersaing.',
    latitude: -6.9667,
    longitude: 110.4196,
    verified: true,
    featuredListingIds: ['listing-5', 'listing-12'],
    createdAt: '2020-06-10T00:00:00Z',
  },
  {
    id: 'dealer-4',
    brandId: 'brand-4',
    address: 'Jl. HR Muhammad No. 88, Surabaya',
    phone: '(031) 5678-123',
    email: 'info@suzuki-surabaya.co.id',
    website: 'https://www.suzuki-surabaya.co.id',
    rating: 4.6,
    totalReviews: 1678,
    totalListings: 167,
    openHours: 'Senin - Sabtu: 08.00 - 17.00 WIB',
    description: 'Suzuki Basuki Rahmat Surabaya, dealer Suzuki tertua dan terbesar di Jawa Timur. Berpengalaman melayani masyarakat Surabaya dan sekitarnya sejak 1985. Menyediakan Ertiga, XL7, Baleno, Jimny, dan Carry.',
    latitude: -7.2575,
    longitude: 112.7521,
    verified: true,
    featuredListingIds: ['listing-7', 'listing-14'],
    createdAt: '2018-09-05T00:00:00Z',
  },
  {
    id: 'dealer-5',
    brandId: 'brand-5',
    address: 'Jl. Pemuda No. 56, Surabaya',
    phone: '(031) 8765-432',
    email: 'info@mitsubishi-surabaya.co.id',
    website: 'https://www.mitsubishi-surabaya.co.id',
    rating: 4.7,
    totalReviews: 2345,
    totalListings: 198,
    openHours: 'Senin - Sabtu: 08.00 - 17.00 WIB',
    description: 'Mitsubishi Surabaya Pemuda adalah dealer resmi Mitsubishi Motors dengan fasilitas 3S terlengkap (Sales, Service, Spare Parts). Melayani penjualan Xpander, Pajero Sport, Triton, L300, dan Outlander PHEV.',
    latitude: -7.2756,
    longitude: 112.7426,
    verified: true,
    featuredListingIds: ['listing-3', 'listing-15'],
    createdAt: '2019-07-22T00:00:00Z',
  },
  {
    id: 'dealer-6',
    brandId: 'brand-6',
    address: 'Jl. Sultan Iskandar Muda No. 88, Jakarta Selatan',
    phone: '(021) 7890-1234',
    email: 'info@bmw-jakarta.co.id',
    website: 'https://www.bmw.co.id',
    rating: 4.9,
    totalReviews: 876,
    totalListings: 87,
    openHours: 'Senin - Jumat: 08.30 - 17.30 WIB, Sabtu: 09.00 - 15.00 WIB',
    description: 'BMW Indonesia Arteri adalah dealer BMW premium di Jakarta. Menampilkan lineup lengkap BMW mulai dari Seri 1, Seri 3, X Series, hingga M Performance. Dilengkapi BMW Excellence Center untuk pengalaman premium.',
    latitude: -6.2443,
    longitude: 106.7866,
    verified: true,
    featuredListingIds: ['listing-8', 'listing-18'],
    createdAt: '2020-01-15T00:00:00Z',
  },
  {
    id: 'dealer-7',
    brandId: 'brand-7',
    address: 'Jl. MT Haryono Kav. 8, Jakarta Selatan',
    phone: '(021) 2345-6789',
    email: 'info@mercedes-jakarta.co.id',
    website: 'https://www.mercedes-benz.co.id',
    rating: 4.8,
    totalReviews: 654,
    totalListings: 73,
    openHours: 'Senin - Jumat: 08.30 - 17.30 WIB, Sabtu: 09.00 - 14.00 WIB',
    description: 'Mercedes-Benz Indonesia MT Haryono adalah dealer Mercedes-Benz terlengkap di Indonesia. Menjual A-Class, C-Class, E-Class, GLC, GLE, dan AMG. Service center dengan peralatan diagnostik terbaru langsung dari Jerman.',
    latitude: -6.2389,
    longitude: 106.8539,
    verified: true,
    featuredListingIds: ['listing-10'],
    createdAt: '2019-11-30T00:00:00Z',
  },
  {
    id: 'dealer-8',
    brandId: 'brand-8',
    address: 'Jl. Ring Road Utara No. 156, Medan',
    phone: '(061) 8880-1234',
    email: 'info@hyundai-medan.co.id',
    website: 'https://www.hyundai-medan.co.id',
    rating: 4.6,
    totalReviews: 987,
    totalListings: 112,
    openHours: 'Senin - Sabtu: 08.30 - 17.00 WIB',
    description: 'Hyundai Medan adalah dealer resmi Hyundai terbesar di Sumatera. Menyediakan Creta, Stargazer, Tucson, Santa Fe, Ioniq 5, dan Ioniq 6. Dilengkapi Ultra-Fast Charging Station untuk kendaraan listrik Hyundai.',
    latitude: 3.5697,
    longitude: 98.6806,
    verified: true,
    featuredListingIds: ['listing-6', 'listing-17'],
    createdAt: '2021-04-18T00:00:00Z',
  },
]

// ──────────────────────────────────────────────
// Helper: Get brand by ID
// ──────────────────────────────────────────────
function getBrandById(id: string) {
  return brands.find((b) => b.id === id)
}

function getModelById(id: string) {
  return allModels.find((m) => m.id === id)
}

function getSellerById(id: string) {
  return sellers.find((s) => s.id === id)
}

function getListingById(id: string) {
  return listings.find((l) => l.id === id)
}

function getDealerByBrandId(brandId: string) {
  return dealers.find((d) => d.brandId === brandId)
}

// ──────────────────────────────────────────────
// Resolvers
// ──────────────────────────────────────────────
export const resolvers: IResolvers = {
  Query: {
    landingData: () => ({
      heroStats: {
        totalCars: 54823,
        totalBrands: 48,
        happyCustomers: 128500,
        cities: 34,
      },
      featured: listings.filter((l) => l.isFeatured),
      popular: listings.filter((l) => l.views > 4000).sort((a, b) => b.views - a.views).slice(0, 8),
      categories,
      brands,
      tokenPackages,
    }),

    trendingCars: (_: unknown, args: { limit?: number; bodyType?: string }) => {
      const limit = args.limit ?? 10
      let result = [...listings]
      if (args.bodyType) {
        result = result.filter((l) => l.bodyType === args.bodyType)
      }
      return result.sort((a, b) => b.views - a.views).slice(0, limit)
    },

    car: (_: unknown, args: { id: string; slug?: string }) => {
      if (args.slug) {
        return listings.find((l) => l.slug === args.slug) ?? null
      }
      return getListingById(args.id) ?? null
    },

    searchListings: (_: unknown, args: { filter?: Record<string, unknown>; page?: number; perPage?: number }) => {
      const filter = args.filter ?? {}
      const page = args.page ?? 1
      const perPage = args.perPage ?? 12

      let result = [...listings]

      // Apply filters
      if (filter.brand) {
        const brand = brands.find(
          (b) => b.slug === filter.brand || b.name.toLowerCase() === (filter.brand as string).toLowerCase(),
        )
        if (brand) {
          result = result.filter((l) => l.brandId === brand.id)
        }
      }

      if (filter.model) {
        const model = allModels.find(
          (m) => m.slug === filter.model || m.name.toLowerCase() === (filter.model as string).toLowerCase(),
        )
        if (model) {
          result = result.filter((l) => l.modelId === model.id)
        }
      }

      if (filter.city) {
        result = result.filter((l) => l.city.toLowerCase().includes((filter.city as string).toLowerCase()))
      }

      if (filter.condition) {
        result = result.filter((l) => l.condition === filter.condition)
      }

      if (filter.fuelType) {
        result = result.filter((l) => l.fuelType === filter.fuelType)
      }

      if (filter.transmission) {
        result = result.filter((l) => l.transmission === filter.transmission)
      }

      if (filter.bodyType) {
        result = result.filter((l) => l.bodyType === filter.bodyType)
      }

      if (filter.priceMin) {
        result = result.filter((l) => l.price >= (filter.priceMin as number))
      }

      if (filter.priceMax) {
        result = result.filter((l) => l.price <= (filter.priceMax as number))
      }

      if (filter.yearMin) {
        result = result.filter((l) => l.year >= (filter.yearMin as number))
      }

      if (filter.yearMax) {
        result = result.filter((l) => l.year <= (filter.yearMax as number))
      }

      if (filter.search) {
        const search = (filter.search as string).toLowerCase()
        result = result.filter(
          (l) =>
            l.title.toLowerCase().includes(search) ||
            l.description.toLowerCase().includes(search) ||
            l.bodyType.toLowerCase().includes(search) ||
            l.exteriorColor.toLowerCase().includes(search),
        )
      }

      // Sort
      if (filter.sort) {
        switch (filter.sort) {
          case 'price_asc':
            result.sort((a, b) => a.price - b.price)
            break
          case 'price_desc':
            result.sort((a, b) => b.price - a.price)
            break
          case 'year_desc':
            result.sort((a, b) => b.year - a.year)
            break
          case 'year_asc':
            result.sort((a, b) => a.year - b.year)
            break
          case 'mileage_asc':
            result.sort((a, b) => (a.mileage ?? 0) - (b.mileage ?? 0))
            break
          case 'mileage_desc':
            result.sort((a, b) => (b.mileage ?? 0) - (a.mileage ?? 0))
            break
          case 'newest':
          default:
            result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            break
        }
      }

      const total = result.length
      const totalPages = Math.ceil(total / perPage)
      const start = (page - 1) * perPage
      const paginatedListings = result.slice(start, start + perPage)

      // Compute unique cities
      const uniqueCities = Array.from(new Set(listings.map((l) => l.city)))

      return {
        listings: paginatedListings,
        total,
        page,
        totalPages,
        filters: {
          brands,
          categories,
          cities: uniqueCities,
          priceRange: {
            min: Math.min(...listings.map((l) => l.price)),
            max: Math.max(...listings.map((l) => l.price)),
          },
        },
      }
    },

    brand: (_: unknown, args: { id: string; slug?: string }) => {
      if (args.slug) {
        return brands.find((b) => b.slug === args.slug) ?? null
      }
      return getBrandById(args.id) ?? null
    },

    brands: () => brands,

    categories: () => categories,

    dealer: (_: unknown, args: { id: string; slug?: string }) => {
      if (args.slug) {
        // Try to match by brand slug
        const brand = brands.find((b) => b.slug === args.slug)
        if (brand) {
          return dealers.find((d) => d.brandId === brand.id) ?? null
        }
        return null
      }
      return dealers.find((d) => d.id === args.id) ?? null
    },

    dealers: () => dealers,

    banners: (_: unknown, args: { position?: string }) => {
      if (args.position) {
        return banners.filter((b) => b.position === args.position && b.active).sort((a, b) => a.order - b.order)
      }
      return banners.filter((b) => b.active).sort((a, b) => a.order - b.order)
    },

    reviews: (_: unknown, args: { carId?: string; limit?: number }) => {
      const limit = args.limit ?? 10
      // In a real app, filter by carId. For now return all reviews.
      return reviews.slice(0, limit)
    },

    similarCars: (_: unknown, args: { carId: string; limit?: number }) => {
      const limit = args.limit ?? 6
      const car = getListingById(args.carId)
      if (!car) return []

      // Find similar: same brand or same body type, excluding current car
      const similar = listings.filter((l) => {
        if (l.id === args.carId) return false
        return l.brandId === car.brandId || l.bodyType === car.bodyType
      })

      // Prioritize same brand, then same body type
      similar.sort((a, b) => {
        const aScore = (a.brandId === car.brandId ? 2 : 0) + (a.bodyType === car.bodyType ? 1 : 0)
        const bScore = (b.brandId === car.brandId ? 2 : 0) + (b.bodyType === car.bodyType ? 1 : 0)
        return bScore - aScore || b.views - a.views
      })

      return similar.slice(0, limit)
    },

    myFavorites: () => {
      return listings.filter((l) => favorites.has(l.id))
    },

    myListings: () => {
      // Return first 3 listings as mock "my" listings
      return listings.slice(0, 3)
    },

    myProfile: () => ({
      id: 'user-1',
      name: 'Budi Santoso',
      email: 'budi.santoso@email.com',
      phone: '0812-3456-7890',
      avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=budi',
      role: 'USER',
      createdAt: '2022-03-15T08:00:00Z',
    }),
  },

  Mutation: {
    toggleFavorite: (_: unknown, args: { carId: string }) => {
      if (favorites.has(args.carId)) {
        favorites.delete(args.carId)
        return false
      } else {
        favorites.add(args.carId)
        return true
      }
    },

    createListing: (_: unknown, args: { input: Record<string, unknown> }) => {
      const input = args.input
      const brand = brands.find(
        (b) => b.slug === input.brand || b.name.toLowerCase() === (input.brand as string).toLowerCase(),
      )
      const brandId = brand?.id ?? 'brand-1'

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newListing: any = {
        id: `listing-${listings.length + 1}`,
        title: input.title,
        slug: `${(input.brand as string).toLowerCase()}-${(input.model as string).toLowerCase()}-${Date.now()}`,
        brandId,
        modelId: `model-${listings.length + 20}`,
        variant: input.variant,
        year: input.year,
        price: input.price,
        originalPrice: input.price,
        mileage: input.mileage ?? null,
        condition: input.condition ?? 'USED',
        transmission: input.transmission ?? 'AUTOMATIC',
        fuelType: input.fuelType ?? 'GASOLINE',
        bodyType: input.bodyType,
        exteriorColor: input.exteriorColor,
        interiorColor: input.interiorColor,
        images: [
          `https://picsum.photos/seed/new-${Date.now()}-1/800/600`,
          `https://picsum.photos/seed/new-${Date.now()}-2/800/600`,
          `https://picsum.photos/seed/new-${Date.now()}-3/800/600`,
        ],
        description: input.description,
        features: input.features ?? [],
        sellerId: 'seller-1',
        city: input.city,
        province: input.province,
        inspectionScore: null,
        inspectionDate: null,
        isFeatured: false,
        isNegotiable: true,
        views: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      listings.push(newListing)
      return newListing
    },

    updateProfile: (_: unknown, args: { input: Record<string, unknown> }) => {
      return {
        id: 'user-1',
        name: (args.input.name as string) ?? 'Budi Santoso',
        email: 'budi.santoso@email.com',
        phone: (args.input.phone as string) ?? '0812-3456-7890',
        avatar: (args.input.avatarUrl as string) ?? 'https://api.dicebear.com/9.x/avataaars/svg?seed=budi',
        role: 'USER',
        createdAt: '2022-03-15T08:00:00Z',
      }
    },

    login: (_: unknown, _args: { email: string; password: string }) => {
      return {
        user: {
          id: 'user-1',
          name: 'Budi Santoso',
          email: 'budi.santoso@email.com',
          phone: '0812-3456-7890',
          avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=budi',
          role: 'USER',
          createdAt: '2022-03-15T08:00:00Z',
        },
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEiLCJuYW1lIjoiQnVkaSBTYW50b3NvIiwiaWF0IjoxNzAwMDAwMDAwfQ.mock-token',
      }
    },

    register: (_: unknown, args: { input: Record<string, unknown> }) => {
      return {
        user: {
          id: `user-${Date.now()}`,
          name: args.input.name as string,
          email: args.input.email as string,
          phone: args.input.phone as string,
          avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=new-user',
          role: 'USER',
          createdAt: new Date().toISOString(),
        },
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLW5ldyIsImlhdCI6MTcwMDAwMDAwMH0.mock-token',
      }
    },
  },

  // ──────────────────────────────────────────────
  // Type Resolvers (field-level)
  // ──────────────────────────────────────────────
  CarListing: {
    brand: (parent: { brandId: string }) => getBrandById(parent.brandId)!,
    model: (parent: { modelId: string }) => {
      const model = getModelById(parent.modelId)
      if (!model) return null
      return {
        ...model,
        brand: getBrandById(model.brandId),
      }
    },
    seller: (parent: { sellerId: string }) => getSellerById(parent.sellerId)!,
  },

  CarModel: {
    brand: (parent: { brandId: string }) => getBrandById(parent.brandId)!,
  },

  Dealer: {
    name: (parent: { brandId: string }) => getBrandById(parent.brandId)!,
    featuredListings: (parent: { featuredListingIds: string[] }) => {
      return parent.featuredListingIds.map((id) => getListingById(id)!).filter(Boolean)
    },
  },
}
