import { GraphQLScalarType, Kind } from 'graphql'

// ============================================================
// Custom Time Scalar
// ============================================================
const TimeScalar = new GraphQLScalarType({
  name: 'Time',
  description: 'ISO 8601 datetime string',
  serialize(value: unknown) {
    return value as string
  },
  parseValue(value: unknown) {
    return new Date(value as string).toISOString()
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value).toISOString()
    }
    return null
  },
})

// ============================================================
// Helper: slugify
// ============================================================
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function uuid(): string {
  return `mock-${Math.random().toString(36).substring(2, 11)}`
}

// ============================================================
// Mock Data: Brands & Models
// ============================================================
const brands: Record<string, { name: string; country: string; models: string[] }> = {
  'brand-1': { name: 'Toyota', country: 'Jepang', models: ['Avanza', 'Innova Zenix', 'Raize', 'Fortuner', 'Yaris', 'Veloz', 'Rush', 'Calya', 'HiAce'] },
  'brand-2': { name: 'Honda', country: 'Jepang', models: ['Brio', 'HR-V', 'BR-V', 'Civic', 'Jazz', 'City', 'CR-V', 'Mobilio', 'Accord'] },
  'brand-3': { name: 'Daihatsu', country: 'Jepang', models: ['Xenia', 'Terios', 'Ayla', 'Sigra', 'Rocky', 'Sirion', 'Luxio', 'Gran Max'] },
  'brand-4': { name: 'Suzuki', country: 'Jepang', models: ['Ertiga', 'XL7', 'Ignis', 'Baleno', 'Swift', 'Jimny', 'Carry', 'S-Cross'] },
  'brand-5': { name: 'Mitsubishi', country: 'Jepang', models: ['Xpander', 'Pajero Sport', 'Xforce', 'L300', 'Outlander', 'Triton', 'Eclipse Cross'] },
  'brand-6': { name: 'BMW', country: 'Jerman', models: ['320i', '520i', 'X1', 'X3', 'X5', 'iX3', 'i5', '330i'] },
  'brand-7': { name: 'Mercedes-Benz', country: 'Jerman', models: ['C200', 'E300', 'GLC 200', 'GLC 300', 'GLE 450', 'A200', 'S450', 'CLA 200'] },
  'brand-8': { name: 'Nissan', country: 'Jepang', models: ['Livina', 'X-Trail', 'Grand Livina', 'Juke', 'Serena', 'Leaf', 'Kicks', 'Magnite'] },
}

const brandsArray = Object.entries(brands).map(([id, b]) => ({
  id,
  name: b.name,
  slug: slugify(b.name),
  logoUrl: `/brands/${slugify(b.name)}.png`,
  country: b.country,
  models: b.models.map((m, i) => ({
    id: `model-${id}-${i}`,
    name: m,
    slug: slugify(m),
    brandId: id,
  })),
}))

// ============================================================
// Mock Data: Listings
// ============================================================
const listings = [
  {
    id: 'listing-1',
    title: 'Toyota Avanza 1.5 G CVT 2024',
    slug: 'toyota-avanza-1-5-g-cvt-2024-jakarta',
    brand: 'Toyota',
    model: 'Avanza',
    variant: '1.5 G CVT',
    year: 2024,
    price: 245000000,
    priceCredit: 5200000,
    mileage: 5000,
    condition: 'Baru',
    transmission: 'Automatic',
    fuelType: 'Bensin',
    bodyType: 'MPV',
    color: 'Silver Metalik',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    description: 'Toyota Avanza 1.5 G CVT kondisi baru, tangan pertama. Warna Silver Metalik, fitur lengkap termasuk airbag, ABS, dan sensor parkir. Cocok untuk keluarga Indonesia.',
    images: [
      { id: 'img-1-1', url: 'https://placehold.co/800x600/1a1a2e/e94560?text=Avanza+1', isPrimary: true, sortOrder: 1 },
      { id: 'img-1-2', url: 'https://placehold.co/800x600/1a1a2e/e94560?text=Avanza+2', isPrimary: false, sortOrder: 2 },
      { id: 'img-1-3', url: 'https://placehold.co/800x600/1a1a2e/e94560?text=Avanza+3', isPrimary: false, sortOrder: 3 },
      { id: 'img-1-4', url: 'https://placehold.co/800x600/1a1a2e/e94560?text=Avanza+4', isPrimary: false, sortOrder: 4 },
    ],
    features: { id: 'feat-1', sunroof: false, cruiseControl: false, navigation: true, leatherSeats: false, pushStart: true },
    sellerId: 'user-seller-1',
    inspection: {
      id: 'insp-1',
      status: 'completed',
      overallScore: 92,
      createdAt: '2024-12-01T10:00:00Z',
      categories: [
        {
          id: 'ic-1', name: 'Mesin & Transmisi', score: 95,
          items: [
            { id: 'ii-1', name: 'Performa Mesin', status: 'good', notes: 'Mesin halus dan responsif' },
            { id: 'ii-2', name: 'Transmisi CVT', status: 'good', notes: 'Pergantian gigi halus' },
          ],
        },
        {
          id: 'ic-2', name: 'Body & Eksterior', score: 90,
          items: [
            { id: 'ii-3', name: 'Cat Body', status: 'good', notes: 'Cat original tanpa baret' },
            { id: 'ii-4', name: 'Kondisi Panel', status: 'good', notes: 'Tidak ada penyok' },
          ],
        },
      ],
    },
    reviewCount: 3,
    viewCount: 1250,
    status: 'active',
    createdAt: '2024-11-15T08:00:00Z',
  },
  {
    id: 'listing-2',
    title: 'Honda HR-V 1.5 RS CVT 2023',
    slug: 'honda-hr-v-1-5-rs-cvt-2023-surabaya',
    brand: 'Honda',
    model: 'HR-V',
    variant: '1.5 RS CVT',
    year: 2023,
    price: 385000000,
    priceCredit: 7800000,
    mileage: 18000,
    condition: 'Bekas',
    transmission: 'Automatic',
    fuelType: 'Bensin',
    bodyType: 'SUV',
    color: 'Crystal Black Pearl',
    city: 'Surabaya',
    province: 'Jawa Timur',
    description: 'Honda HR-V RS tipe tertinggi. SUV compact dengan desain sporty, Honda Sensing, LED headlamp, dan panoramic sunroof. Kondisi terawat dengan service record lengkap di Honda resmi.',
    images: [
      { id: 'img-2-1', url: 'https://placehold.co/800x600/16213e/0f3460?text=HRV+1', isPrimary: true, sortOrder: 1 },
      { id: 'img-2-2', url: 'https://placehold.co/800x600/16213e/0f3460?text=HRV+2', isPrimary: false, sortOrder: 2 },
      { id: 'img-2-3', url: 'https://placehold.co/800x600/16213e/0f3460?text=HRV+3', isPrimary: false, sortOrder: 3 },
    ],
    features: { id: 'feat-2', sunroof: true, cruiseControl: true, navigation: true, leatherSeats: true, pushStart: true },
    sellerId: 'user-seller-2',
    inspection: {
      id: 'insp-2',
      status: 'completed',
      overallScore: 88,
      createdAt: '2024-11-20T14:00:00Z',
      categories: [
        {
          id: 'ic-3', name: 'Mesin & Transmisi', score: 90,
          items: [
            { id: 'ii-5', name: 'Performa Mesin', status: 'good', notes: 'Mesin 1.5L Turbo bertenaga' },
            { id: 'ii-6', name: 'Transmisi CVT', status: 'good', notes: 'CVT responsif' },
          ],
        },
        {
          id: 'ic-4', name: 'Interior', score: 85,
          items: [
            { id: 'ii-7', name: 'Jok Kulit', status: 'fair', notes: 'Ada sedikit bekas pemakaian' },
            { id: 'ii-8', name: 'Dashboard', status: 'good', notes: 'Bersih dan terawat' },
          ],
        },
      ],
    },
    reviewCount: 2,
    viewCount: 980,
    status: 'active',
    createdAt: '2024-10-20T09:00:00Z',
  },
  {
    id: 'listing-3',
    title: 'Daihatsu Xenia 1.3 R CVT 2024',
    slug: 'daihatsu-xenia-1-3-r-cvt-2024-bandung',
    brand: 'Daihatsu',
    model: 'Xenia',
    variant: '1.3 R CVT',
    year: 2024,
    price: 238000000,
    priceCredit: 5100000,
    mileage: 8000,
    condition: 'Baru',
    transmission: 'Automatic',
    fuelType: 'Bensin',
    bodyType: 'MPV',
    color: 'Silver Metalik',
    city: 'Bandung',
    province: 'Jawa Barat',
    description: 'Daihatsu Xenia terbaru 2024. MPV irit dan nyaman untuk keluarga Indonesia. Dilengkapi dual airbag, ABS, dan fitur keselamatan modern.',
    images: [
      { id: 'img-3-1', url: 'https://placehold.co/800x600/1b262c/0f4c75?text=Xenia+1', isPrimary: true, sortOrder: 1 },
      { id: 'img-3-2', url: 'https://placehold.co/800x600/1b262c/0f4c75?text=Xenia+2', isPrimary: false, sortOrder: 2 },
    ],
    features: { id: 'feat-3', sunroof: false, cruiseControl: false, navigation: false, leatherSeats: false, pushStart: true },
    sellerId: 'user-seller-1',
    inspection: null,
    reviewCount: 1,
    viewCount: 620,
    status: 'active',
    createdAt: '2024-11-01T07:30:00Z',
  },
  {
    id: 'listing-4',
    title: 'Mitsubishi Xpander Cross 1.5 CVT 2023',
    slug: 'mitsubishi-xpander-cross-1-5-cvt-2023-medan',
    brand: 'Mitsubishi',
    model: 'Xpander',
    variant: 'Cross 1.5 CVT',
    year: 2023,
    price: 325000000,
    priceCredit: 6800000,
    mileage: 22000,
    condition: 'Bekas',
    transmission: 'Automatic',
    fuelType: 'Bensin',
    bodyType: 'MPV',
    color: 'White Solid',
    city: 'Medan',
    province: 'Sumatera Utara',
    description: 'Mitsubishi Xpander Cross varian tertinggi. Ground clearance tinggi, suspensi stabilizer, roof rail, dan desain SUV yang gagah. Cocok untuk segala medan jalan Indonesia.',
    images: [
      { id: 'img-4-1', url: 'https://placehold.co/800x600/2d3436/636e72?text=Xpander+1', isPrimary: true, sortOrder: 1 },
      { id: 'img-4-2', url: 'https://placehold.co/800x600/2d3436/636e72?text=Xpander+2', isPrimary: false, sortOrder: 2 },
      { id: 'img-4-3', url: 'https://placehold.co/800x600/2d3436/636e72?text=Xpander+3', isPrimary: false, sortOrder: 3 },
    ],
    features: { id: 'feat-4', sunroof: false, cruiseControl: false, navigation: true, leatherSeats: false, pushStart: true },
    sellerId: 'user-seller-3',
    inspection: {
      id: 'insp-3',
      status: 'completed',
      overallScore: 85,
      createdAt: '2024-11-10T11:00:00Z',
      categories: [
        {
          id: 'ic-5', name: 'Mesin & Transmisi', score: 88,
          items: [
            { id: 'ii-9', name: 'Performa Mesin', status: 'good', notes: 'Mesin 1.5L bertenaga baik' },
          ],
        },
        {
          id: 'ic-6', name: 'Ban & Suspensi', score: 82,
          items: [
            { id: 'ii-10', name: 'Kondisi Ban', status: 'fair', notes: 'Ban depan perlu penggantian dalam 6 bulan' },
          ],
        },
      ],
    },
    reviewCount: 5,
    viewCount: 2100,
    status: 'active',
    createdAt: '2024-09-15T10:00:00Z',
  },
  {
    id: 'listing-5',
    title: 'Toyota Fortuner 2.4 VRZ AT 2023 Diesel',
    slug: 'toyota-fortuner-2-4-vrz-at-2023-diesel-jakarta',
    brand: 'Toyota',
    model: 'Fortuner',
    variant: '2.4 VRZ AT Diesel',
    year: 2023,
    price: 545000000,
    priceCredit: 11200000,
    mileage: 30000,
    condition: 'Bekas',
    transmission: 'Automatic',
    fuelType: 'Diesel',
    bodyType: 'SUV',
    color: 'Attitude Black Mica',
    city: 'Jakarta Utara',
    province: 'DKI Jakarta',
    description: 'Toyota Fortuner VRZ Diesel, SUV premium dengan mesin 2.4L turbo diesel bertenaga. Konsumsi BBM irit, ground clearance tinggi, dan fitur keselamatan Toyota Safety Sense.',
    images: [
      { id: 'img-5-1', url: 'https://placehold.co/800x600/232946/b8405e?text=Fortuner+1', isPrimary: true, sortOrder: 1 },
      { id: 'img-5-2', url: 'https://placehold.co/800x600/232946/b8405e?text=Fortuner+2', isPrimary: false, sortOrder: 2 },
      { id: 'img-5-3', url: 'https://placehold.co/800x600/232946/b8405e?text=Fortuner+3', isPrimary: false, sortOrder: 3 },
      { id: 'img-5-4', url: 'https://placehold.co/800x600/232946/b8405e?text=Fortuner+4', isPrimary: false, sortOrder: 4 },
      { id: 'img-5-5', url: 'https://placehold.co/800x600/232946/b8405e?text=Fortuner+5', isPrimary: false, sortOrder: 5 },
    ],
    features: { id: 'feat-5', sunroof: true, cruiseControl: true, navigation: true, leatherSeats: true, pushStart: true },
    sellerId: 'user-seller-2',
    inspection: {
      id: 'insp-4',
      status: 'completed',
      overallScore: 91,
      createdAt: '2024-12-05T09:30:00Z',
      categories: [
        {
          id: 'ic-7', name: 'Mesin & Transmisi', score: 93,
          items: [
            { id: 'ii-11', name: 'Mesin Diesel Turbo', status: 'good', notes: 'Turbo responsif, tidak ada bocor' },
            { id: 'ii-12', name: 'Transmisi 6AT', status: 'good', notes: 'Pergantian gigi mulus' },
          ],
        },
        {
          id: 'ic-8', name: 'Body & Eksterior', score: 89,
          items: [
            { id: 'ii-13', name: 'Cat Body', status: 'good', notes: 'Cat original, waxed' },
            { id: 'ii-14', name: 'Kaca & Cermin', status: 'good', notes: 'Semua fungsi normal' },
          ],
        },
      ],
    },
    reviewCount: 8,
    viewCount: 3200,
    status: 'active',
    createdAt: '2024-08-20T12:00:00Z',
  },
  {
    id: 'listing-6',
    title: 'Suzuki Ertiga GX AT 2024 Hybrid',
    slug: 'suzuki-ertiga-gx-at-2024-hybrid-semarang',
    brand: 'Suzuki',
    model: 'Ertiga',
    variant: 'GX AT Hybrid',
    year: 2024,
    price: 290000000,
    priceCredit: 6200000,
    mileage: 3000,
    condition: 'Baru',
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    bodyType: 'MPV',
    color: 'Silky Silver',
    city: 'Semarang',
    province: 'Jawa Tengah',
    description: 'Suzuki Ertiga Hybrid, MPV generasi terbaru dengan teknologi Smart Hybrid. Sangat irit BBM, fitur lengkap dengan head unit 9 inch, kamera mundur, dan Suzuki Connect.',
    images: [
      { id: 'img-6-1', url: 'https://placehold.co/800x600/2c3e50/3498db?text=Ertiga+1', isPrimary: true, sortOrder: 1 },
      { id: 'img-6-2', url: 'https://placehold.co/800x600/2c3e50/3498db?text=Ertiga+2', isPrimary: false, sortOrder: 2 },
    ],
    features: { id: 'feat-6', sunroof: false, cruiseControl: false, navigation: true, leatherSeats: false, pushStart: true },
    sellerId: 'user-seller-1',
    inspection: null,
    reviewCount: 2,
    viewCount: 750,
    status: 'active',
    createdAt: '2024-12-01T08:00:00Z',
  },
  {
    id: 'listing-7',
    title: 'Honda Brio RS CVT 2024',
    slug: 'honda-brio-rs-cvt-2024-jakarta',
    brand: 'Honda',
    model: 'Brio',
    variant: 'RS CVT',
    year: 2024,
    price: 215000000,
    priceCredit: 4700000,
    mileage: 2000,
    condition: 'Baru',
    transmission: 'Automatic',
    fuelType: 'Bensin',
    bodyType: 'Hatchback',
    color: 'Rallye Red',
    city: 'Jakarta Timur',
    province: 'DKI Jakarta',
    description: 'Honda Brio RS, city car sporty terlaris di Indonesia. Desain agresif dengan RS body kit, LED headlight, dan paddle shift. Cocok untuk mobilitas harian di perkotaan.',
    images: [
      { id: 'img-7-1', url: 'https://placehold.co/800x600/e74c3c/c0392b?text=Brio+1', isPrimary: true, sortOrder: 1 },
      { id: 'img-7-2', url: 'https://placehold.co/800x600/e74c3c/c0392b?text=Brio+2', isPrimary: false, sortOrder: 2 },
    ],
    features: { id: 'feat-7', sunroof: false, cruiseControl: false, navigation: true, leatherSeats: false, pushStart: true },
    sellerId: 'user-seller-3',
    inspection: null,
    reviewCount: 4,
    viewCount: 1800,
    status: 'active',
    createdAt: '2024-11-25T10:00:00Z',
  },
  {
    id: 'listing-8',
    title: 'BMW 320i M Sport 2022',
    slug: 'bmw-320i-m-sport-2022-jakarta',
    brand: 'BMW',
    model: '320i',
    variant: 'M Sport',
    year: 2022,
    price: 685000000,
    priceCredit: 14500000,
    mileage: 35000,
    condition: 'Bekas',
    transmission: 'Automatic',
    fuelType: 'Bensin',
    bodyType: 'Sedan',
    color: 'Mineral Grey Metallic',
    city: 'Jakarta Barat',
    province: 'DKI Jakarta',
    description: 'BMW 320i M Sport, sedan premium sporty. Mesin 2.0L turbo, BMW iDrive 8, M Sport steering wheel, dan suspensi M Sport. Service record lengkap di BMW Indonesia.',
    images: [
      { id: 'img-8-1', url: 'https://placehold.co/800x600/1a1a1a/e8e8e8?text=BMW+1', isPrimary: true, sortOrder: 1 },
      { id: 'img-8-2', url: 'https://placehold.co/800x600/1a1a1a/e8e8e8?text=BMW+2', isPrimary: false, sortOrder: 2 },
      { id: 'img-8-3', url: 'https://placehold.co/800x600/1a1a1a/e8e8e8?text=BMW+3', isPrimary: false, sortOrder: 3 },
    ],
    features: { id: 'feat-8', sunroof: true, cruiseControl: true, navigation: true, leatherSeats: true, pushStart: true },
    sellerId: 'user-seller-2',
    inspection: {
      id: 'insp-5',
      status: 'completed',
      overallScore: 87,
      createdAt: '2024-11-15T13:00:00Z',
      categories: [
        {
          id: 'ic-9', name: 'Mesin & Performa', score: 90,
          items: [
            { id: 'ii-15', name: 'Mesin 2.0L Turbo', status: 'good', notes: 'Tenaga dan torsi sesuai spesifikasi' },
          ],
        },
        {
          id: 'ic-10', name: 'Elektronik', score: 84,
          items: [
            { id: 'ii-16', name: 'iDrive System', status: 'good', notes: 'Fungsi normal' },
            { id: 'ii-17', name: 'Audio Harman Kardon', status: 'good', notes: 'Suara jernih' },
          ],
        },
      ],
    },
    reviewCount: 6,
    viewCount: 2800,
    status: 'active',
    createdAt: '2024-09-01T14:00:00Z',
  },
  {
    id: 'listing-9',
    title: 'Mercedes-Benz C200 AMG Line 2023',
    slug: 'mercedes-benz-c200-amg-line-2023-surabaya',
    brand: 'Mercedes-Benz',
    model: 'C200',
    variant: 'AMG Line',
    year: 2023,
    price: 795000000,
    priceCredit: 16800000,
    mileage: 15000,
    condition: 'Bekas',
    transmission: 'Automatic',
    fuelType: 'Bensin',
    bodyType: 'Sedan',
    color: 'Obsidian Black',
    city: 'Surabaya',
    province: 'Jawa Timur',
    description: 'Mercedes-Benz C200 AMG Line, luxury sedan dengan performa sporty. MBUX infotainment, Burmester audio, ambient lighting, dan advanced driver assistance. Kondisi like new.',
    images: [
      { id: 'img-9-1', url: 'https://placehold.co/800x600/0d0d0d/c0c0c0?text=Mercedes+1', isPrimary: true, sortOrder: 1 },
      { id: 'img-9-2', url: 'https://placehold.co/800x600/0d0d0d/c0c0c0?text=Mercedes+2', isPrimary: false, sortOrder: 2 },
    ],
    features: { id: 'feat-9', sunroof: true, cruiseControl: true, navigation: true, leatherSeats: true, pushStart: true },
    sellerId: 'user-seller-3',
    inspection: {
      id: 'insp-6',
      status: 'completed',
      overallScore: 95,
      createdAt: '2024-12-08T10:00:00Z',
      categories: [
        {
          id: 'ic-11', name: 'Keseluruhan', score: 95,
          items: [
            { id: 'ii-18', name: 'Kondisi Mesin', status: 'good', notes: 'Mesin prima, tidak ada masalah' },
            { id: 'ii-19', name: 'Interior', status: 'good', notes: 'Interior bersih, bebas noda' },
          ],
        },
      ],
    },
    reviewCount: 3,
    viewCount: 1950,
    status: 'active',
    createdAt: '2024-10-10T11:00:00Z',
  },
  {
    id: 'listing-10',
    title: 'Toyota Hilux D-Cab V 2.4 AT 2023 Diesel',
    slug: 'toyota-hilux-d-cab-v-2-4-at-2023-diesel-medan',
    brand: 'Toyota',
    model: 'Hilux',
    variant: 'D-Cab V 2.4 AT Diesel',
    year: 2023,
    price: 485000000,
    priceCredit: 10200000,
    mileage: 25000,
    condition: 'Bekas',
    transmission: 'Automatic',
    fuelType: 'Diesel',
    bodyType: 'Pick-up',
    color: 'Super White',
    city: 'Medan',
    province: 'Sumatera Utara',
    description: 'Toyota Hilux Double Cab tipe V, pick-up terkuat di kelasnya. Mesin diesel 2.4L turbo, 4x4, cocok untuk kebutuhan offroad dan niaga. Ban AT, roof rail, dan tonneau cover.',
    images: [
      { id: 'img-10-1', url: 'https://placehold.co/800x600/34495e/ecf0f1?text=Hilux+1', isPrimary: true, sortOrder: 1 },
      { id: 'img-10-2', url: 'https://placehold.co/800x600/34495e/ecf0f1?text=Hilux+2', isPrimary: false, sortOrder: 2 },
    ],
    features: { id: 'feat-10', sunroof: false, cruiseControl: true, navigation: true, leatherSeats: false, pushStart: true },
    sellerId: 'user-seller-1',
    inspection: null,
    reviewCount: 2,
    viewCount: 890,
    status: 'active',
    createdAt: '2024-10-25T09:00:00Z',
  },
  {
    id: 'listing-11',
    title: 'Nissan X-Trail 2.0 VL CVT 2024',
    slug: 'nissan-x-trail-2-0-vl-cvt-2024-bandung',
    brand: 'Nissan',
    model: 'X-Trail',
    variant: '2.0 VL CVT',
    year: 2024,
    price: 560000000,
    priceCredit: 11800000,
    mileage: 5000,
    condition: 'Baru',
    transmission: 'Automatic',
    fuelType: 'Bensin',
    bodyType: 'SUV',
    color: 'Brilliant Silver',
    city: 'Bandung',
    province: 'Jawa Barat',
    description: 'Nissan X-Trail generasi terbaru, SUV keluarga premium. ProPILOT semi-autonomous driving, panoramic roof, Zero Gravity seats, dan NissanConnect infotainment.',
    images: [
      { id: 'img-11-1', url: 'https://placehold.co/800x600/2c3e50/e67e22?text=XTrail+1', isPrimary: true, sortOrder: 1 },
      { id: 'img-11-2', url: 'https://placehold.co/800x600/2c3e50/e67e22?text=XTrail+2', isPrimary: false, sortOrder: 2 },
      { id: 'img-11-3', url: 'https://placehold.co/800x600/2c3e50/e67e22?text=XTrail+3', isPrimary: false, sortOrder: 3 },
    ],
    features: { id: 'feat-11', sunroof: true, cruiseControl: true, navigation: true, leatherSeats: true, pushStart: true },
    sellerId: 'user-seller-2',
    inspection: null,
    reviewCount: 1,
    viewCount: 560,
    status: 'active',
    createdAt: '2024-12-05T08:00:00Z',
  },
  {
    id: 'listing-12',
    title: 'Daihatsu Rocky 1.0 R ASA CVT 2024',
    slug: 'daihatsu-rocky-1-0-r-asa-cvt-2024-semarang',
    brand: 'Daihatsu',
    model: 'Rocky',
    variant: '1.0 R ASA CVT',
    year: 2024,
    price: 225000000,
    priceCredit: 4900000,
    mileage: 6000,
    condition: 'Baru',
    transmission: 'Automatic',
    fuelType: 'Bensin',
    bodyType: 'SUV',
    color: 'Ice Blue',
    city: 'Semarang',
    province: 'Jawa Tengah',
    description: 'Daihatsu Rocky, compact SUV turbo pertama Daihatsu. Mesin 1.0L turbo, ASA (Advanced Safety Assist) lengkap, dan desain modern. Kombinasi sempurna gaya dan fungsionalitas.',
    images: [
      { id: 'img-12-1', url: 'https://placehold.co/800x600/2980b9/f1c40f?text=Rocky+1', isPrimary: true, sortOrder: 1 },
      { id: 'img-12-2', url: 'https://placehold.co/800x600/2980b9/f1c40f?text=Rocky+2', isPrimary: false, sortOrder: 2 },
    ],
    features: { id: 'feat-12', sunroof: false, cruiseControl: false, navigation: true, leatherSeats: false, pushStart: true },
    sellerId: 'user-seller-3',
    inspection: null,
    reviewCount: 1,
    viewCount: 430,
    status: 'active',
    createdAt: '2024-11-28T10:00:00Z',
  },
  {
    id: 'listing-13',
    title: 'Toyota Innova Zenix 2.0 V CVT Hybrid 2024',
    slug: 'toyota-innova-zenix-2-0-v-cvt-hybrid-2024-jakarta',
    brand: 'Toyota',
    model: 'Innova Zenix',
    variant: '2.0 V CVT Hybrid',
    year: 2024,
    price: 420000000,
    priceCredit: 8800000,
    mileage: 10000,
    condition: 'Baru',
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    bodyType: 'MPV',
    color: 'Bronze Mica',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    description: 'Toyota Innova Zenix, generasi terbaru Innova dengan platform TNGA. Menggunakan sistem hybrid e-CVT, sangat irit BBM. Desain modern dengan Toyota Safety Sense dan fitur premium.',
    images: [
      { id: 'img-13-1', url: 'https://placehold.co/800x600/1c1c1c/d4a017?text=Zenix+1', isPrimary: true, sortOrder: 1 },
      { id: 'img-13-2', url: 'https://placehold.co/800x600/1c1c1c/d4a017?text=Zenix+2', isPrimary: false, sortOrder: 2 },
      { id: 'img-13-3', url: 'https://placehold.co/800x600/1c1c1c/d4a017?text=Zenix+3', isPrimary: false, sortOrder: 3 },
    ],
    features: { id: 'feat-13', sunroof: true, cruiseControl: true, navigation: true, leatherSeats: true, pushStart: true },
    sellerId: 'user-seller-1',
    inspection: {
      id: 'insp-7',
      status: 'completed',
      overallScore: 96,
      createdAt: '2024-12-10T08:00:00Z',
      categories: [
        {
          id: 'ic-12', name: 'Keseluruhan', score: 96,
          items: [
            { id: 'ii-20', name: 'Sistem Hybrid', status: 'good', notes: 'Sistem hybrid berfungsi sempurna' },
            { id: 'ii-21', name: 'Interior Premium', status: 'good', notes: 'Captain seat sangat nyaman' },
          ],
        },
      ],
    },
    reviewCount: 7,
    viewCount: 3500,
    status: 'active',
    createdAt: '2024-11-20T07:00:00Z',
  },
  {
    id: 'listing-14',
    title: 'Mitsubishi L300 Standard Cab 2023',
    slug: 'mitsubishi-l300-standard-cab-2023-surabaya',
    brand: 'Mitsubishi',
    model: 'L300',
    variant: 'Standard Cab',
    year: 2023,
    price: 198000000,
    priceCredit: null,
    mileage: 40000,
    condition: 'Bekas',
    transmission: 'Manual',
    fuelType: 'Diesel',
    bodyType: 'Van',
    color: 'White',
    city: 'Surabaya',
    province: 'Jawa Timur',
    description: 'Mitsubishi L300, kendaraan niaga terlaris Indonesia. Mesin diesel 2.2L yang bandel dan irit, kapasitas angkut besar. Cocok untuk usaha pengiriman barang dan transportasi.',
    images: [
      { id: 'img-14-1', url: 'https://placehold.co/800x600/7f8c8d/2c3e50?text=L300+1', isPrimary: true, sortOrder: 1 },
    ],
    features: { id: 'feat-14', sunroof: false, cruiseControl: false, navigation: false, leatherSeats: false, pushStart: false },
    sellerId: 'user-seller-1',
    inspection: null,
    reviewCount: 1,
    viewCount: 320,
    status: 'active',
    createdAt: '2024-10-05T09:00:00Z',
  },
  {
    id: 'listing-15',
    title: 'Honda Civic RS CVT 2024',
    slug: 'honda-civic-rs-cvt-2024-jakarta',
    brand: 'Honda',
    model: 'Civic',
    variant: 'RS CVT',
    year: 2024,
    price: 567000000,
    priceCredit: 12000000,
    mileage: 7000,
    condition: 'Baru',
    transmission: 'Automatic',
    fuelType: 'Bensin',
    bodyType: 'Sedan',
    color: 'Meteoroid Grey Metallic',
    city: 'Jakarta Pusat',
    province: 'DKI Jakarta',
    description: 'Honda Civic RS, sedan sporty dengan desain futuristik. Honda S+ damping, Bose premium audio, wireless Apple CarPlay, dan Honda Sensing generasi terbaru.',
    images: [
      { id: 'img-15-1', url: 'https://placehold.co/800x600/273746/5dade2?text=Civic+1', isPrimary: true, sortOrder: 1 },
      { id: 'img-15-2', url: 'https://placehold.co/800x600/273746/5dade2?text=Civic+2', isPrimary: false, sortOrder: 2 },
      { id: 'img-15-3', url: 'https://placehold.co/800x600/273746/5dade2?text=Civic+3', isPrimary: false, sortOrder: 3 },
    ],
    features: { id: 'feat-15', sunroof: false, cruiseControl: true, navigation: true, leatherSeats: true, pushStart: true },
    sellerId: 'user-seller-2',
    inspection: null,
    reviewCount: 2,
    viewCount: 1400,
    status: 'active',
    createdAt: '2024-12-08T09:00:00Z',
  },
  {
    id: 'listing-16',
    title: 'Suzuki Jimny 5-Door 2024',
    slug: 'suzuki-jimny-5-door-2024-bandung',
    brand: 'Suzuki',
    model: 'Jimny',
    variant: '5-Door',
    year: 2024,
    price: 425000000,
    priceCredit: 9000000,
    mileage: 4000,
    condition: 'Baru',
    transmission: 'Manual',
    fuelType: 'Bensin',
    bodyType: 'SUV',
    color: 'Kinetic Yellow',
    city: 'Bandung',
    province: 'Jawa Barat',
    description: 'Suzuki Jimny 5-Door, mini SUV offroad legendaris. NOW dengan 5 pintu, lebih praktis untuk keluarga. 4WD part-time, ladder frame, dan Approach angle 36°. Sangat populer di Indonesia.',
    images: [
      { id: 'img-16-1', url: 'https://placehold.co/800x600/2ecc71/27ae60?text=Jimny+1', isPrimary: true, sortOrder: 1 },
      { id: 'img-16-2', url: 'https://placehold.co/800x600/2ecc71/27ae60?text=Jimny+2', isPrimary: false, sortOrder: 2 },
    ],
    features: { id: 'feat-16', sunroof: false, cruiseControl: false, navigation: true, leatherSeats: false, pushStart: true },
    sellerId: 'user-seller-3',
    inspection: null,
    reviewCount: 9,
    viewCount: 5200,
    status: 'active',
    createdAt: '2024-11-10T08:00:00Z',
  },
  {
    id: 'listing-17',
    title: 'Daihatsu Ayla 1.0 X CVT 2023',
    slug: 'daihatsu-ayla-1-0-x-cvt-2023-medan',
    brand: 'Daihatsu',
    model: 'Ayla',
    variant: '1.0 X CVT',
    year: 2023,
    price: 125000000,
    priceCredit: 2800000,
    mileage: 20000,
    condition: 'Bekas',
    transmission: 'Automatic',
    fuelType: 'Bensin',
    bodyType: 'Hatchback',
    color: 'Orange Metallic',
    city: 'Medan',
    province: 'Sumatera Utara',
    description: 'Daihatsu Ayla, city car irit dan praktis. Harga terjangkau dengan fitur lengkap: dual airbag, ABS, immobilizer. Cocok untuk pemula dan mobilitas harian di kota.',
    images: [
      { id: 'img-17-1', url: 'https://placehold.co/800x600/e67e22/f39c12?text=Ayla+1', isPrimary: true, sortOrder: 1 },
    ],
    features: { id: 'feat-17', sunroof: false, cruiseControl: false, navigation: false, leatherSeats: false, pushStart: true },
    sellerId: 'user-seller-1',
    inspection: null,
    reviewCount: 1,
    viewCount: 280,
    status: 'active',
    createdAt: '2024-09-20T10:00:00Z',
  },
  {
    id: 'listing-18',
    title: 'Toyota Raize 1.0 GR Sport CVT 2024',
    slug: 'toyota-raize-1-0-gr-sport-cvt-2024-semarang',
    brand: 'Toyota',
    model: 'Raize',
    variant: '1.0 GR Sport CVT',
    year: 2024,
    price: 278000000,
    priceCredit: 5900000,
    mileage: 8000,
    condition: 'Baru',
    transmission: 'Automatic',
    fuelType: 'Bensin',
    bodyType: 'SUV',
    color: 'Red Mica',
    city: 'Semarang',
    province: 'Jawa Tengah',
    description: 'Toyota Raize GR Sport, compact SUV sporty dengan DNA GR. Aero kit, piano black interior, ambient lighting, dan Toyota Safety Sense. Mesin 1.0L turbo bertenaga dan irit.',
    images: [
      { id: 'img-18-1', url: 'https://placehold.co/800x600/c0392b/e74c3c?text=Raize+1', isPrimary: true, sortOrder: 1 },
      { id: 'img-18-2', url: 'https://placehold.co/800x600/c0392b/e74c3c?text=Raize+2', isPrimary: false, sortOrder: 2 },
    ],
    features: { id: 'feat-18', sunroof: false, cruiseControl: false, navigation: true, leatherSeats: false, pushStart: true },
    sellerId: 'user-seller-2',
    inspection: null,
    reviewCount: 3,
    viewCount: 1100,
    status: 'active',
    createdAt: '2024-12-02T07:00:00Z',
  },
]

// ============================================================
// Mock Data: Users
// ============================================================
const users: Record<string, typeof listings[number] & { id: string; name: string; email: string; phone: string; avatarUrl: string; role: string; emailVerified: boolean; isActive: boolean; createdAt: string; settings: { id: string; emailNotifications: boolean; pushNotifications: boolean; language: string; currency: string }; tokenBalance: { id: string; balance: number; totalPurchased: number; totalUsed: number; totalBonus: number } }> = {} as never

const mockUsers = {
  'user-me': {
    id: 'user-me',
    name: 'Ahmad Rizki Pratama',
    email: 'ahmad.rizki@email.com',
    phone: '0812-3456-7890',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ahmad',
    role: 'user',
    emailVerified: true,
    isActive: true,
    createdAt: '2024-06-15T08:00:00Z',
    settings: { id: 'settings-1', emailNotifications: true, pushNotifications: true, language: 'id', currency: 'IDR' },
    tokenBalance: { id: 'ut-1', balance: 75, totalPurchased: 200, totalUsed: 125, totalBonus: 0 },
  },
  'user-seller-1': {
    id: 'user-seller-1',
    name: 'Budi Santoso Motor',
    email: 'budi.santoso@motor.co.id',
    phone: '0813-9876-5432',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Budi',
    role: 'dealer',
    emailVerified: true,
    isActive: true,
    createdAt: '2024-01-10T10:00:00Z',
    settings: { id: 'settings-2', emailNotifications: true, pushNotifications: false, language: 'id', currency: 'IDR' },
    tokenBalance: { id: 'ut-2', balance: 350, totalPurchased: 500, totalUsed: 150, totalBonus: 0 },
  },
  'user-seller-2': {
    id: 'user-seller-2',
    name: 'Siti Nurhaliza Auto Gallery',
    email: 'siti.nurhaliza@autogallery.co.id',
    phone: '0821-1122-3344',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Siti',
    role: 'dealer',
    emailVerified: true,
    isActive: true,
    createdAt: '2024-03-20T09:00:00Z',
    settings: { id: 'settings-3', emailNotifications: true, pushNotifications: true, language: 'id', currency: 'IDR' },
    tokenBalance: { id: 'ut-3', balance: 180, totalPurchased: 200, totalUsed: 20, totalBonus: 0 },
  },
  'user-seller-3': {
    id: 'user-seller-3',
    name: 'PT Jaya Mandiri Motors',
    email: 'info@jayamandiri.co.id',
    phone: '0815-6677-8899',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Jaya',
    role: 'dealer',
    emailVerified: true,
    isActive: true,
    createdAt: '2024-02-05T11:00:00Z',
    settings: { id: 'settings-4', emailNotifications: false, pushNotifications: true, language: 'id', currency: 'IDR' },
    tokenBalance: { id: 'ut-4', balance: 500, totalPurchased: 500, totalUsed: 0, totalBonus: 0 },
  },
}

// ============================================================
// Mock Data: Master Data
// ============================================================
const colorsData = [
  { id: 'color-1', name: 'Hitam', slug: 'hitam' },
  { id: 'color-2', name: 'Putih', slug: 'putih' },
  { id: 'color-3', name: 'Silver', slug: 'silver' },
  { id: 'color-4', name: 'Abu-abu', slug: 'abu-abu' },
  { id: 'color-5', name: 'Merah', slug: 'merah' },
  { id: 'color-6', name: 'Biru', slug: 'biru' },
  { id: 'color-7', name: 'Hijau', slug: 'hijau' },
  { id: 'color-8', name: 'Cokelat', slug: 'cokelat' },
  { id: 'color-9', name: 'Oranye', slug: 'oranye' },
  { id: 'color-10', name: 'Kuning', slug: 'kuning' },
]

const bodyTypesData = [
  { id: 'bt-1', name: 'SUV', slug: 'suv' },
  { id: 'bt-2', name: 'Sedan', slug: 'sedan' },
  { id: 'bt-3', name: 'MPV', slug: 'mpv' },
  { id: 'bt-4', name: 'Hatchback', slug: 'hatchback' },
  { id: 'bt-5', name: 'Pick-up', slug: 'pick-up' },
  { id: 'bt-6', name: 'Van', slug: 'van' },
]

const fuelTypesData = [
  { id: 'ft-1', name: 'Bensin', slug: 'bensin' },
  { id: 'ft-2', name: 'Diesel', slug: 'diesel' },
  { id: 'ft-3', name: 'Hybrid', slug: 'hybrid' },
]

const transmissionsData = [
  { id: 'tr-1', name: 'Manual', slug: 'manual' },
  { id: 'tr-2', name: 'Automatic', slug: 'automatic' },
]

const categoriesData = [
  { id: 'cat-1', name: 'SUV', slug: 'suv', icon: '🚙', sortOrder: 1, isActive: true },
  { id: 'cat-2', name: 'Sedan', slug: 'sedan', icon: '🚗', sortOrder: 2, isActive: true },
  { id: 'cat-3', name: 'MPV', slug: 'mpv', icon: '🚐', sortOrder: 3, isActive: true },
  { id: 'cat-4', name: 'Hatchback', slug: 'hatchback', icon: '🚘', sortOrder: 4, isActive: true },
  { id: 'cat-5', name: 'Commercial', slug: 'commercial', icon: '🛻', sortOrder: 5, isActive: true },
  { id: 'cat-6', name: 'Luxury', slug: 'luxury', icon: '✨', sortOrder: 6, isActive: true },
]

// ============================================================
// Mock Data: Token Packages
// ============================================================
const tokenPackagesData = [
  {
    id: 'pkg-1',
    name: 'Starter',
    tokens: 50,
    price: 99000,
    bonus: 0,
    isPopular: false,
    features: ['Pasang 5 iklan', 'Foto hingga 5 per iklan', 'Durasi iklan 30 hari', 'Chat penjual'],
  },
  {
    id: 'pkg-2',
    name: 'Pro',
    tokens: 200,
    price: 349000,
    bonus: 25,
    isPopular: true,
    features: ['Pasang 20 iklan', 'Foto hingga 15 per iklan', 'Durasi iklan 60 hari', 'Chat & telepon penjual', 'Iklan prioritas', 'Inspeksi diskon 20%'],
  },
  {
    id: 'pkg-3',
    name: 'Bisnis',
    tokens: 500,
    price: 799000,
    bonus: 75,
    isPopular: false,
    features: ['Pasang 50+ iklan', 'Foto unlimited', 'Durasi iklan 90 hari', 'Semua fitur Pro', 'Iklan boosted', 'Inspeksi gratis 2x', 'Support prioritas dealer'],
  },
]

// ============================================================
// Mock Data: Banners
// ============================================================
const bannersData = [
  {
    id: 'banner-1',
    title: 'Promo Akhir Tahun - Diskon Token 30%',
    imageUrl: 'https://placehold.co/1200x400/e74c3c/ffffff?text=Promo+Akhir+Tahun',
    linkUrl: '/tokens',
    position: 'home_hero',
    sortOrder: 1,
    isActive: true,
    clickCount: 1250,
    impressions: 45000,
    startDate: '2024-12-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
  },
  {
    id: 'banner-2',
    title: 'AutoMarket x Toyota - Spesial Fortuner & Innova',
    imageUrl: 'https://placehold.co/1200x400/2c3e50/ffffff?text=Toyota+Special',
    linkUrl: '/listings?brand=Toyota',
    position: 'home_hero',
    sortOrder: 2,
    isActive: true,
    clickCount: 890,
    impressions: 38000,
    startDate: '2024-12-05T00:00:00Z',
    endDate: '2024-12-25T23:59:59Z',
  },
  {
    id: 'banner-3',
    title: 'Gratis Inspeksi untuk Listing Baru',
    imageUrl: 'https://placehold.co/1200x400/27ae60/ffffff?text=Gratis+Inspeksi',
    linkUrl: '/listing/create',
    position: 'listing_page',
    sortOrder: 1,
    isActive: true,
    clickCount: 340,
    impressions: 12000,
    startDate: '2024-12-10T00:00:00Z',
    endDate: '2025-01-10T23:59:59Z',
  },
  {
    id: 'banner-4',
    title: 'Dealer Verified Badge - Bangun Kepercayaan Pembeli',
    imageUrl: 'https://placehold.co/1200x400/8e44ad/ffffff?text=Dealer+Verified',
    linkUrl: '/dealer/register',
    position: 'home_hero',
    sortOrder: 3,
    isActive: true,
    clickCount: 560,
    impressions: 22000,
    startDate: '2024-12-08T00:00:00Z',
    endDate: '2025-02-28T23:59:59Z',
  },
]

// ============================================================
// Mock Data: Favorites
// ============================================================
const favoritesData = [
  { id: 'fav-1', listingId: 'listing-5', userId: 'user-me', createdAt: '2024-11-20T14:30:00Z' },
  { id: 'fav-2', listingId: 'listing-9', userId: 'user-me', createdAt: '2024-11-22T09:15:00Z' },
  { id: 'fav-3', listingId: 'listing-13', userId: 'user-me', createdAt: '2024-12-01T16:45:00Z' },
  { id: 'fav-4', listingId: 'listing-16', userId: 'user-me', createdAt: '2024-12-05T11:20:00Z' },
]

// ============================================================
// Mock Data: Reviews
// ============================================================
const reviewsData = [
  {
    id: 'review-1',
    listingId: 'listing-5',
    userId: 'user-review-1',
    userName: 'Dewi Anggraeni',
    userAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Dewi',
    rating: 5,
    title: 'Kondisi sesuai deskripsi, sangat puas!',
    comment: 'Saya beli Fortuner ini lewat AutoMarket. Kondisi sesuai deskripsi, inspeksi membantu banget. Penjual jujur dan responsif. Proses pembayaran aman via escrow. Recommended!',
    status: 'approved',
    createdAt: '2024-12-01T10:00:00Z',
  },
  {
    id: 'review-2',
    listingId: 'listing-8',
    userId: 'user-review-2',
    userName: 'Raka Wibisono',
    userAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Raka',
    rating: 4,
    title: 'BMW 320i terawat baik',
    comment: 'BMW 320i M Sport-nya mantap, service record lengkap. Sedikit nego berhasil. Overall pengalaman belanja aman dan nyaman di AutoMarket.',
    status: 'approved',
    createdAt: '2024-11-28T15:30:00Z',
  },
]

// ============================================================
// Mock Data: Orders
// ============================================================
const ordersData = [
  {
    id: 'order-1',
    buyerId: 'user-me',
    sellerId: 'user-seller-2',
    listingId: 'listing-5',
    status: 'completed',
    totalPrice: 545000000,
    paymentStatus: 'paid',
    paymentMethod: 'bank_transfer',
    createdAt: '2024-11-15T10:00:00Z',
    updatedAt: '2024-11-20T14:00:00Z',
  },
  {
    id: 'order-2',
    buyerId: 'user-me',
    sellerId: 'user-seller-2',
    listingId: 'listing-8',
    status: 'completed',
    totalPrice: 685000000,
    paymentStatus: 'paid',
    paymentMethod: 'bank_transfer',
    createdAt: '2024-11-25T09:00:00Z',
    updatedAt: '2024-11-30T16:00:00Z',
  },
]

// ============================================================
// Mock Data: Conversations & Messages
// ============================================================
const conversationsData = [
  {
    id: 'conv-1',
    listingId: 'listing-2',
    buyerId: 'user-me',
    sellerId: 'user-seller-2',
    lastMessage: 'Mas, bisa COD di showroom ya?',
    lastMessageAt: '2024-12-08T14:30:00Z',
    unreadCount: 2,
    status: 'active',
    createdAt: '2024-12-07T09:00:00Z',
  },
  {
    id: 'conv-2',
    listingId: 'listing-9',
    buyerId: 'user-me',
    sellerId: 'user-seller-3',
    lastMessage: 'Terima kasih, saya sudah transfer DP-nya.',
    lastMessageAt: '2024-12-05T11:00:00Z',
    unreadCount: 0,
    status: 'active',
    createdAt: '2024-12-03T10:00:00Z',
  },
]

const messagesData = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'user-me',
    content: 'Halo Mas, Honda HR-V nya masih ada?',
    type: 'text',
    isRead: true,
    createdAt: '2024-12-07T09:05:00Z',
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: 'user-seller-2',
    content: 'Masih ada kak, kondisi sangat terawat. Bisa lihat langsung di showroom kami di Surabaya.',
    type: 'text',
    isRead: true,
    createdAt: '2024-12-07T09:10:00Z',
  },
  {
    id: 'msg-3',
    conversationId: 'conv-1',
    senderId: 'user-me',
    content: 'Bisa kirimkan foto detail interior dan mesinnya?',
    type: 'text',
    isRead: true,
    createdAt: '2024-12-07T09:15:00Z',
  },
  {
    id: 'msg-4',
    conversationId: 'conv-1',
    senderId: 'user-seller-2',
    content: 'Siap kak, ini foto detailnya. [3 foto terlampir]',
    type: 'text',
    isRead: true,
    createdAt: '2024-12-07T09:20:00Z',
  },
  {
    id: 'msg-5',
    conversationId: 'conv-1',
    senderId: 'user-me',
    content: 'Mas, bisa COD di showroom ya?',
    type: 'text',
    isRead: false,
    createdAt: '2024-12-08T14:30:00Z',
  },
  {
    id: 'msg-6',
    conversationId: 'conv-2',
    senderId: 'user-me',
    content: 'Selamat siang, untuk Mercedes C200-nya bisa DP berapa?',
    type: 'text',
    isRead: true,
    createdAt: '2024-12-03T10:05:00Z',
  },
  {
    id: 'msg-7',
    conversationId: 'conv-2',
    senderId: 'user-seller-3',
    content: 'Selamat siang kak, DP minimal 20% dari harga. Kami bisa bantu proses kredit melalui leasing rekanan.',
    type: 'text',
    isRead: true,
    createdAt: '2024-12-03T10:15:00Z',
  },
  {
    id: 'msg-8',
    conversationId: 'conv-2',
    senderId: 'user-me',
    content: 'Terima kasih, saya sudah transfer DP-nya.',
    type: 'text',
    isRead: true,
    createdAt: '2024-12-05T11:00:00Z',
  },
]

// ============================================================
// Mock Data: Notifications
// ============================================================
const notificationsData = [
  {
    id: 'notif-1',
    userId: 'user-me',
    type: 'message',
    title: 'Pesan baru dari Siti Nurhaliza Auto Gallery',
    body: 'Mas, bisa COD di showroom ya?',
    isRead: false,
    createdAt: '2024-12-08T14:30:00Z',
  },
  {
    id: 'notif-2',
    userId: 'user-me',
    type: 'favorite',
    title: 'Listing favorit Anda mendapat review baru',
    body: 'Toyota Fortuner 2.4 VRZ mendapat review baru dengan rating 5 bintang.',
    isRead: false,
    createdAt: '2024-12-07T10:00:00Z',
  },
  {
    id: 'notif-3',
    userId: 'user-me',
    type: 'promo',
    title: 'Promo Akhir Tahun! Diskon Token 30%',
    body: 'Gunakan kode AKHIRTAHUN untuk diskon 30% pembelian semua paket token. Berlaku hingga 31 Desember 2024.',
    isRead: true,
    createdAt: '2024-12-05T08:00:00Z',
  },
  {
    id: 'notif-4',
    userId: 'user-me',
    type: 'system',
    title: 'Selamat datang di AutoMarket!',
    body: 'Terima kasih sudah bergabung. Anda mendapat bonus 50 token untuk pertama kali. Mulai jelajahi mobil impian Anda!',
    isRead: true,
    createdAt: '2024-06-15T08:05:00Z',
  },
]

// ============================================================
// Mock Data: System Settings
// ============================================================
const systemSettingsData = [
  {
    id: 'ss-1',
    key: 'listing_cost_basic',
    value: '5',
    type: 'integer',
    group: 'credits',
    description: 'Biaya token untuk pasang listing basic',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ss-2',
    key: 'listing_cost_premium',
    value: '15',
    type: 'integer',
    group: 'credits',
    description: 'Biaya token untuk pasang listing premium (boosted)',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
  },
  {
    id: 'ss-3',
    key: 'inspection_cost',
    value: '25',
    type: 'integer',
    group: 'credits',
    description: 'Biaya token untuk inspeksi kendaraan',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-02-20T09:00:00Z',
  },
  {
    id: 'ss-4',
    key: 'boost_listing_cost',
    value: '10',
    type: 'integer',
    group: 'credits',
    description: 'Biaya token untuk boost listing selama 7 hari',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ss-5',
    key: 'highlight_listing_cost',
    value: '8',
    type: 'integer',
    group: 'credits',
    description: 'Biaya token untuk highlight listing',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ss-6',
    key: 'platform_commission_rate',
    value: '2.5',
    type: 'float',
    group: 'payments',
    description: 'Persentase komisi platform dari transaksi',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },
  {
    id: 'ss-7',
    key: 'max_free_photos',
    value: '5',
    type: 'integer',
    group: 'listings',
    description: 'Jumlah maksimum foto gratis per listing',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ss-8',
    key: 'listing_duration_days',
    value: '30',
    type: 'integer',
    group: 'listings',
    description: 'Durasi aktif listing dalam hari',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

// ============================================================
// Mock Data: Dealers
// ============================================================
const dealersData = [
  {
    id: 'dealer-1',
    name: 'Budi Santoso Motor',
    slug: 'budi-santoso-motor',
    description: 'Showroom mobil bekas terpercaya sejak 2010. Spesialis Toyota dan Daihatsu dengan ribuan unit terjual. Semua unit diinspeksi dan bergaransi mesin.',
    logoUrl: 'https://api.dicebear.com/9.x/identicon/svg?seed=BSM',
    coverUrl: 'https://placehold.co/1200x300/2c3e50/ffffff?text=Budi+Santoso+Motor',
    address: 'Jl. Raya Bogor KM 28, No. 15',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    phone: '021-8765-4321',
    email: 'info@budisantoso.co.id',
    website: 'https://www.budisantoso.co.id',
    isVerified: true,
    rating: 4.7,
    reviewCount: 234,
    listingCount: 45,
    branchCount: 3,
    createdAt: '2024-01-10T10:00:00Z',
    branches: [
      { id: 'branch-1', name: 'Cabang Utama Jakarta', address: 'Jl. Raya Bogor KM 28, No. 15', city: 'Jakarta Selatan', province: 'DKI Jakarta', phone: '021-8765-4321', isPrimary: true },
      { id: 'branch-2', name: 'Cabang Bandung', address: 'Jl. Soekarno-Hatta No. 456', city: 'Bandung', province: 'Jawa Barat', phone: '022-7654-3210', isPrimary: false },
      { id: 'branch-3', name: 'Cabang Surabaya', address: 'Jl. Ahmad Yani No. 789', city: 'Surabaya', province: 'Jawa Timur', phone: '031-6543-2100', isPrimary: false },
    ],
  },
  {
    id: 'dealer-2',
    name: 'Siti Nurhaliza Auto Gallery',
    slug: 'siti-nurhaliza-auto-gallery',
    description: 'Auto Gallery premium dengan koleksi mobil mewah dan SUV. Berdiri sejak 2015, melayani area Jawa Timur dan sekitarnya.',
    logoUrl: 'https://api.dicebear.com/9.x/identicon/svg?seed=SNAG',
    coverUrl: 'https://placehold.co/1200x300/8e44ad/ffffff?text=Siti+Nurhaliza+Auto+Gallery',
    address: 'Jl. Mayjen Sungkono No. 88',
    city: 'Surabaya',
    province: 'Jawa Timur',
    phone: '031-5678-1234',
    email: 'info@snagallery.co.id',
    website: 'https://www.snagallery.co.id',
    isVerified: true,
    rating: 4.9,
    reviewCount: 156,
    listingCount: 28,
    branchCount: 1,
    createdAt: '2024-03-20T09:00:00Z',
    branches: [
      { id: 'branch-4', name: 'Showroom Utama', address: 'Jl. Mayjen Sungkono No. 88', city: 'Surabaya', province: 'Jawa Timur', phone: '031-5678-1234', isPrimary: true },
    ],
  },
  {
    id: 'dealer-3',
    name: 'PT Jaya Mandiri Motors',
    slug: 'jaya-mandiri-motors',
    description: 'Dealer resmi multi-brand dengan layanan one-stop. Tersedia mobil baru, bekas, dan tukar tambah. Service center tersedia di setiap cabang.',
    logoUrl: 'https://api.dicebear.com/9.x/identicon/svg?seed=JMM',
    coverUrl: 'https://placehold.co/1200x300/2980b9/ffffff?text=Jaya+Mandiri+Motors',
    address: 'Jl. Gajah Mada No. 120',
    city: 'Medan',
    province: 'Sumatera Utara',
    phone: '061-4567-8901',
    email: 'sales@jayamandiri.co.id',
    website: 'https://www.jayamandiri.co.id',
    isVerified: true,
    rating: 4.5,
    reviewCount: 312,
    listingCount: 62,
    branchCount: 5,
    createdAt: '2024-02-05T11:00:00Z',
    branches: [
      { id: 'branch-5', name: 'Kantor Pusat Medan', address: 'Jl. Gajah Mada No. 120', city: 'Medan', province: 'Sumatera Utara', phone: '061-4567-8901', isPrimary: true },
      { id: 'branch-6', name: 'Cabang Pekanbaru', address: 'Jl. Jend. Sudirman No. 55', city: 'Pekanbaru', province: 'Riau', phone: '0761-345-6789', isPrimary: false },
      { id: 'branch-7', name: 'Cabang Palembang', address: 'Jl. Jenderal Ahmad Yani No. 100', city: 'Palembang', province: 'Sumatera Selatan', phone: '0711-567-890', isPrimary: false },
      { id: 'branch-8', name: 'Cabang Padang', address: 'Jl. M. Yamin No. 33', city: 'Padang', province: 'Sumatera Barat', phone: '0751-234-567', isPrimary: false },
      { id: 'branch-9', name: 'Cabang Lampung', address: 'Jl. Teuku Umar No. 77', city: 'Bandar Lampung', province: 'Lampung', phone: '0721-345-678', isPrimary: false },
    ],
  },
]

// ============================================================
// Resolver functions
// ============================================================
const getCurrentUser = () => mockUsers['user-me']

const resolveSeller = (sellerId: string) => {
  return mockUsers[sellerId] || null
}

const resolveListing = (listing: (typeof listings)[number]) => ({
  ...listing,
  seller: resolveSeller(listing.sellerId),
})

// Helper: look up brand by name from brandsArray
const resolveBrandByName = (brandName: string) => {
  return brandsArray.find((b) => b.name === brandName) || null
}

// Helper: look up model by brand name + model name
const resolveModelByName = (brandName: string, modelName: string) => {
  const brand = resolveBrandByName(brandName)
  if (!brand) return null
  return brand.models.find((m) => m.name === modelName) || null
}

// Helper: find category by body type name
const resolveCategoryByBodyType = (bodyType: string) => {
  const nameMap: Record<string, string> = {
    SUV: 'SUV', Sedan: 'Sedan', MPV: 'MPV', Hatchback: 'Hatchback',
    'Pick-up': 'Commercial', Van: 'Commercial',
  }
  const catName = nameMap[bodyType] || bodyType
  return categoriesData.find((c) => c.name === catName) || null
}

// ============================================================
// Resolvers Map
// ============================================================
export const resolvers = {
  Time: TimeScalar,

  // ============================================================
  // Type Resolvers: CarListing
  // ============================================================
  CarListing: {
    brand: (parent: Record<string, unknown>) => {
      const brandName = parent.brand as string
      return resolveBrandByName(brandName)
    },
    model: (parent: Record<string, unknown>) => {
      const brandName = parent.brand as string
      const modelName = parent.model as string
      return resolveModelByName(brandName, modelName)
    },
    images: (parent: Record<string, unknown>) => {
      const imgs = parent.images as Array<Record<string, unknown> | string>
      return imgs.map((img) => (typeof img === 'string' ? img : (img.url as string)))
    },
    category: (parent: Record<string, unknown>) => {
      return resolveCategoryByBodyType(parent.bodyType as string)
    },
    views: (parent: Record<string, unknown>) => parent.viewCount as number,
    isFeatured: () => false,
    isNegotiable: () => true,
    favorites: () => 0,
    updatedAt: (parent: Record<string, unknown>) => {
      return parent.updatedAt || parent.createdAt || null
    },
    engineCapacity: () => 1500,
    seatCapacity: () => 5,
    features: (parent: Record<string, unknown>) => {
      const f = parent.features as Record<string, unknown> | undefined
      if (!f) return []
      return Object.entries(f)
        .filter(([key]) => key !== 'id' && f[key as string] === true)
        .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
    },
    seller: (parent: Record<string, unknown>) => {
      if (parent.seller) return parent.seller
      return resolveSeller(parent.sellerId as string)
    },
  },

  // ============================================================
  // Type Resolvers: User
  // ============================================================
  User: {
    avatar: (parent: Record<string, unknown>) => parent.avatarUrl as string || null,
    isVerified: (parent: Record<string, unknown>) => parent.emailVerified as boolean || false,
    isOnline: () => false,
    lastSeen: () => null,
    joinedAt: (parent: Record<string, unknown>) => parent.createdAt as string || null,
    rating: () => 4.8,
    totalReviews: () => 12,
    totalListings: (parent: Record<string, unknown>) => {
      const userId = parent.id as string
      return listings.filter((l) => l.sellerId === userId).length
    },
    tokenBalance: (parent: Record<string, unknown>) => {
      const tb = parent.tokenBalance as Record<string, unknown> | undefined
      return (tb?.balance as number) ?? 0
    },
    settings: (parent: Record<string, unknown>) => {
      const s = parent.settings as Record<string, unknown> | undefined
      if (!s) return null
      return {
        id: s.id as string,
        userId: parent.id as string,
        key: 'preferences',
        value: JSON.stringify({
          emailNotifications: s.emailNotifications,
          pushNotifications: s.pushNotifications,
          language: s.language,
          currency: s.currency,
        }),
      }
    },
  },

  // ============================================================
  // Type Resolvers: Brand
  // ============================================================
  Brand: {
    logo: (parent: Record<string, unknown>) => parent.logoUrl as string || null,
  },

  // ============================================================
  // Type Resolvers: Banner
  // ============================================================
  Banner: {
    subtitle: () => null,
    image: (parent: Record<string, unknown>) => parent.imageUrl as string,
    link: (parent: Record<string, unknown>) => parent.linkUrl as string || null,
    order: (parent: Record<string, unknown>) => parent.sortOrder as number,
  },

  // ============================================================
  // Type Resolvers: Conversation
  // ============================================================
  Conversation: {
    participants: (parent: Record<string, unknown>) => {
      const participants: Array<Record<string, unknown>> = []
      if (parent.buyer) participants.push(parent.buyer as Record<string, unknown>)
      if (parent.seller) participants.push(parent.seller as Record<string, unknown>)
      return participants
    },
    lastMessage: (parent: Record<string, unknown>) => {
      const lm = parent.lastMessage
      if (typeof lm === 'string') {
        return {
          id: null,
          content: lm,
          createdAt: parent.lastMessageAt || null,
          sender: parent.buyer || null,
        }
      }
      return lm || null
    },
    updatedAt: (parent: Record<string, unknown>) => parent.lastMessageAt as string || parent.createdAt || null,
    messages: (parent: Record<string, unknown>) => {
      const convId = parent.id as string
      return messagesData.filter((m) => m.conversationId === convId)
    },
  },

  // ============================================================
  // Type Resolvers: Message
  // ============================================================
  Message: {
    sender: (parent: Record<string, unknown>) => {
      return resolveSeller(parent.senderId as string)
    },
  },

  // ============================================================
  // Type Resolvers: Review
  // ============================================================
  Review: {
    user: (parent: Record<string, unknown>) => {
      return {
        id: parent.userId as string,
        name: parent.userName as string || null,
        avatar: parent.userAvatar as string || null,
      }
    },
  },

  // ============================================================
  // Type Resolvers: Favorite
  // ============================================================
  Favorite: {
    listing: (parent: Record<string, unknown>) => {
      const found = listings.find((l) => l.id === parent.listingId)
      return found ? resolveListing(found) : null
    },
  },

  // ============================================================
  // Type Resolvers: Notification
  // ============================================================
  Notification: {
    message: (parent: Record<string, unknown>) => parent.body as string || null,
    data: () => null,
  },

  // ============================================================
  // Type Resolvers: TokenPackage
  // ============================================================
  TokenPackage: {
    description: () => null,
    tokenAmount: (parent: Record<string, unknown>) => parent.tokens as number,
    bonusTokens: (parent: Record<string, unknown>) => parent.bonus as number || 0,
  },

  // ============================================================
  // Type Resolvers: Dealer
  // ============================================================
  Dealer: {
    logo: (parent: Record<string, unknown>) => parent.logoUrl as string || null,
    totalReviews: (parent: Record<string, unknown>) => parent.reviewCount as number,
    totalListings: (parent: Record<string, unknown>) => parent.listingCount as number,
    joinedAt: (parent: Record<string, unknown>) => parent.createdAt as string || null,
    listings: (parent: Record<string, unknown>) => {
      const dealerId = parent.id as string
      const dealerUserMap: Record<string, string> = {
        'dealer-1': 'user-seller-1',
        'dealer-2': 'user-seller-2',
        'dealer-3': 'user-seller-3',
      }
      const sellerId = dealerUserMap[dealerId]
      if (!sellerId) return []
      return listings.filter((l) => l.sellerId === sellerId).map(resolveListing)
    },
  },

  // ============================================================
  // Type Resolvers: DealerBranch
  // ============================================================
  DealerBranch: {
    lat: () => -6.2088,
    lng: () => 106.8456,
  },

  // ============================================================
  // Type Resolvers: CarInspection
  // ============================================================
  CarInspection: {
    inspectedAt: (parent: Record<string, unknown>) => parent.createdAt as string || null,
    reportUrl: () => 'https://automarket.co.id/inspection/report',
    items: (parent: Record<string, unknown>) => {
      const categories = parent.categories as Array<Record<string, unknown>> | undefined
      if (!categories) return []
      return categories.flatMap((cat) => (cat.items as Array<Record<string, unknown>>) || [])
    },
  },

  // ============================================================
  // Type Resolvers: Category
  // ============================================================
  Category: {
    listingCount: (parent: Record<string, unknown>) => {
      const catName = parent.name as string
      const bodyTypeMap: Record<string, string[]> = {
        SUV: ['SUV'],
        Sedan: ['Sedan'],
        MPV: ['MPV'],
        Hatchback: ['Hatchback'],
        Commercial: ['Pick-up', 'Van'],
        Luxury: ['Sedan'],
      }
      const bodyTypes = bodyTypeMap[catName] || [catName]
      return listings.filter((l) => bodyTypes.includes(l.bodyType)).length
    },
  },

  // ============================================================
  // Query Resolvers
  // ============================================================
  Query: {
    health: () => 'OK',

    me: () => getCurrentUser(),

    listings: (_: unknown, args: { page?: number; perPage?: number; filter?: Record<string, unknown> }) => {
      const page = args.page || 1
      const perPage = args.perPage || 20
      const filter = args.filter || {}

      let filtered = [...listings]

      if (filter.brand) {
        filtered = filtered.filter((l) => l.brand.toLowerCase().includes((filter.brand as string).toLowerCase()))
      }
      if (filter.model) {
        filtered = filtered.filter((l) => l.model.toLowerCase().includes((filter.model as string).toLowerCase()))
      }
      if (filter.city) {
        filtered = filtered.filter((l) => l.city.toLowerCase().includes((filter.city as string).toLowerCase()))
      }
      if (filter.condition) {
        filtered = filtered.filter((l) => l.condition.toLowerCase() === (filter.condition as string).toLowerCase())
      }
      if (filter.fuelType) {
        filtered = filtered.filter((l) => l.fuelType.toLowerCase() === (filter.fuelType as string).toLowerCase())
      }
      if (filter.transmission) {
        filtered = filtered.filter((l) => l.transmission.toLowerCase() === (filter.transmission as string).toLowerCase())
      }
      if (filter.bodyType) {
        filtered = filtered.filter((l) => l.bodyType.toLowerCase() === (filter.bodyType as string).toLowerCase())
      }
      if (filter.priceMin !== undefined && filter.priceMin !== null) {
        filtered = filtered.filter((l) => l.price >= (filter.priceMin as number))
      }
      if (filter.priceMax !== undefined && filter.priceMax !== null) {
        filtered = filtered.filter((l) => l.price <= (filter.priceMax as number))
      }
      if (filter.yearMin !== undefined && filter.yearMin !== null) {
        filtered = filtered.filter((l) => l.year >= (filter.yearMin as number))
      }
      if (filter.yearMax !== undefined && filter.yearMax !== null) {
        filtered = filtered.filter((l) => l.year <= (filter.yearMax as number))
      }
      if (filter.search) {
        const search = (filter.search as string).toLowerCase()
        filtered = filtered.filter(
          (l) =>
            l.title.toLowerCase().includes(search) ||
            l.brand.toLowerCase().includes(search) ||
            l.model.toLowerCase().includes(search) ||
            l.city.toLowerCase().includes(search) ||
            l.description?.toLowerCase().includes(search),
        )
      }

      if (filter.sort) {
        switch (filter.sort) {
          case 'price_asc':
            filtered.sort((a, b) => a.price - b.price)
            break
          case 'price_desc':
            filtered.sort((a, b) => b.price - a.price)
            break
          case 'newest':
            filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            break
          case 'popular':
            filtered.sort((a, b) => b.viewCount - a.viewCount)
            break
        }
      } else {
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      }

      const start = (page - 1) * perPage
      return filtered.slice(start, start + perPage).map(resolveListing)
    },

    listing: (_: unknown, args: { id: string }) => {
      const found = listings.find((l) => l.id === args.id)
      return found ? resolveListing(found) : null
    },

    listingBySlug: (_: unknown, args: { slug: string }) => {
      const found = listings.find((l) => l.slug === args.slug)
      return found ? resolveListing(found) : null
    },

    myListings: (_: unknown, args: { page?: number; perPage?: number }) => {
      const myListings = listings.filter((l) => l.sellerId === 'user-me')
      return myListings.slice(0, args.perPage || 20).map(resolveListing)
    },

    brands: () => brandsArray,

    colors: () => colorsData,

    bodyTypes: () => bodyTypesData,

    fuelTypes: () => fuelTypesData,

    transmissions: () => transmissionsData,

    categories: () => categoriesData,

    trending: (_: unknown, args: { limit?: number }) => {
      const limit = args.limit || 5
      return [...listings].sort((a, b) => b.viewCount - a.viewCount).slice(0, limit).map(resolveListing)
    },

    favorites: () => favoritesData,

    recommendations: () => {
      const shuffled = [...listings].sort(() => Math.random() - 0.5)
      return shuffled.slice(0, 6).map(resolveListing)
    },

    listingReviews: (_: unknown, args: { listingId: string }) => {
      return reviewsData.filter((r) => r.listingId === args.listingId)
    },

    orders: () => {
      return ordersData.map((o) => ({
        ...o,
        listing: resolveListing(listings.find((l) => l.id === o.listingId)!),
      }))
    },

    tokenPackages: () => tokenPackagesData,

    dealers: () => dealersData,

    dealer: (_: unknown, args: { id: string }) => {
      return dealersData.find((d) => d.id === args.id) || null
    },

    dealerBySlug: (_: unknown, args: { slug: string }) => {
      return dealersData.find((d) => d.slug === args.slug) || null
    },

    banners: (_: unknown, args: { position?: string }) => {
      if (args.position) {
        return bannersData.filter((b) => b.position === args.position && b.isActive)
      }
      return bannersData.filter((b) => b.isActive)
    },

    conversations: () => {
      return conversationsData.map((c) => ({
        ...c,
        listing: resolveListing(listings.find((l) => l.id === c.listingId)!),
        buyer: resolveSeller(c.buyerId),
        seller: resolveSeller(c.sellerId),
      }))
    },

    conversation: (_: unknown, args: { id: string }) => {
      const conv = conversationsData.find((c) => c.id === args.id)
      if (!conv) return null
      return {
        ...conv,
        listing: resolveListing(listings.find((l) => l.id === conv.listingId)!),
        buyer: resolveSeller(conv.buyerId),
        seller: resolveSeller(conv.sellerId),
      }
    },

    messages: (_: unknown, args: { conversationId: string }) => {
      return messagesData.filter((m) => m.conversationId === args.conversationId)
    },

    notifications: (_: unknown, args: { unreadOnly?: boolean }) => {
      if (args.unreadOnly) {
        return notificationsData.filter((n) => !n.isRead)
      }
      return notificationsData
    },

    unreadNotificationCount: () => {
      return notificationsData.filter((n) => !n.isRead).length
    },

    systemSettings: (_: unknown, args: { group?: string }) => {
      if (args.group) {
        return systemSettingsData.filter((s) => s.group === args.group)
      }
      return systemSettingsData
    },

    landingData: () => {
      const featured = [listings[4], listings[8], listings[12]].map(resolveListing)
      const latest = [...listings]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8)
        .map(resolveListing)
      const popular = [...listings]
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 8)
        .map(resolveListing)

      return {
        categories: categoriesData,
        featured,
        latest,
        popular,
      }
    },
  },

  // ============================================================
  // Mutation Resolvers
  // ============================================================
  Mutation: {
    googleLogin: (_: unknown, _args: { token: string }) => ({
      success: true,
      message: 'Login berhasil',
      token: 'mock-jwt-token-' + uuid(),
      user: getCurrentUser(),
    }),

    refreshToken: (_: unknown, _args: { token: string }) => ({
      success: true,
      message: 'Token refreshed',
      token: 'mock-jwt-token-refreshed-' + uuid(),
      user: getCurrentUser(),
    }),

    updateProfile: (_: unknown, args: { input: { name?: string; phone?: string; avatarUrl?: string } }) => {
      const user = getCurrentUser()
      return {
        ...user,
        name: args.input.name || user.name,
        phone: args.input.phone || user.phone,
        avatarUrl: args.input.avatarUrl || user.avatarUrl,
      }
    },

    createListing: (_: unknown, args: { input: { title?: string; brand?: string; model?: string; variant?: string; year?: number; price?: number; mileage?: number; condition?: string; transmission?: string; fuelType?: string; bodyType?: string; color?: string; city?: string; province?: string; description?: string; imageUrls?: string[] | null } }) => {
      const input = args.input
      const title = input.title || `${input.brand || 'Mobil'} ${input.model || 'Unknown'} ${input.year || 2024}`
      const newListing = {
        id: 'listing-new-' + uuid(),
        title,
        slug: slugify(title),
        brand: input.brand || 'Toyota',
        model: input.model || 'Avanza',
        variant: input.variant || '',
        year: input.year || 2024,
        price: input.price || 200000000,
        priceCredit: null as number | null,
        mileage: input.mileage || 0,
        condition: input.condition || 'Bekas',
        transmission: input.transmission || 'Automatic',
        fuelType: input.fuelType || 'Bensin',
        bodyType: input.bodyType || 'MPV',
        color: input.color || 'Putih',
        city: input.city || 'Jakarta',
        province: input.province || 'DKI Jakarta',
        description: input.description || '',
        images: (input.imageUrls || []).map((url, i) => ({
          id: `img-new-${i}`,
          url,
          isPrimary: i === 0,
          sortOrder: i + 1,
        })),
        features: { id: 'feat-new', sunroof: false, cruiseControl: false, navigation: false, leatherSeats: false, pushStart: false },
        sellerId: 'user-me',
        inspection: null,
        reviewCount: 0,
        viewCount: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
      }
      return resolveListing(newListing)
    },

    updateListing: (_: unknown, args: { id: string; input: { title?: string; brand?: string; model?: string; variant?: string; year?: number; price?: number; mileage?: number; condition?: string; transmission?: string; fuelType?: string; bodyType?: string; color?: string; city?: string; province?: string; description?: string; imageUrls?: string[] | null } }) => {
      const found = listings.find((l) => l.id === args.id)
      if (!found) throw new Error('Listing not found')
      const updated = {
        ...found,
        ...args.input,
        title: args.input.title || found.title,
        brand: args.input.brand || found.brand,
        model: args.input.model || found.model,
      }
      return resolveListing(updated)
    },

    deleteListing: (_: unknown, _args: { id: string }) => {
      return { success: true, message: 'Listing berhasil dihapus' }
    },

    toggleFavorite: (_: unknown, _args: { listingId: string }) => {
      return { isFavorited: true, favoriteCount: 1 }
    },

    createReview: (_: unknown, args: { input: { listingId: string; rating: number; title?: string; comment?: string } }) => {
      return {
        id: 'review-new-' + uuid(),
        listingId: args.input.listingId,
        userId: 'user-me',
        userName: 'Ahmad Rizki Pratama',
        userAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ahmad',
        rating: args.input.rating,
        title: args.input.title || '',
        comment: args.input.comment || '',
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
    },

    createOrder: (_: unknown, args: { input: { listingId: string; paymentMethod?: string } }) => {
      const listing = listings.find((l) => l.id === args.input.listingId)
      if (!listing) throw new Error('Listing not found')
      return {
        id: 'order-new-' + uuid(),
        buyerId: 'user-me',
        sellerId: listing.sellerId,
        listingId: args.input.listingId,
        status: 'pending',
        totalPrice: listing.price,
        paymentStatus: 'pending',
        paymentMethod: args.input.paymentMethod || 'bank_transfer',
        createdAt: new Date().toISOString(),
        updatedAt: null as string | null,
        listing: resolveListing(listing),
      }
    },

    createConversation: (_: unknown, args: { listingId: string; sellerId?: string }) => {
      const listing = listings.find((l) => l.id === args.listingId)
      const sellerId = args.sellerId || listing?.sellerId || 'user-seller-1'
      return {
        id: 'conv-new-' + uuid(),
        listingId: args.listingId,
        buyerId: 'user-me',
        sellerId,
        lastMessage: null,
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        listing: listing ? resolveListing(listing) : null,
        buyer: getCurrentUser(),
        seller: resolveSeller(sellerId),
      }
    },

    sendMessage: (_: unknown, args: { conversationId: string; content: string }) => {
      return {
        id: 'msg-new-' + uuid(),
        conversationId: args.conversationId,
        senderId: 'user-me',
        content: args.content,
        type: 'text',
        isRead: false,
        createdAt: new Date().toISOString(),
      }
    },
  },
}
