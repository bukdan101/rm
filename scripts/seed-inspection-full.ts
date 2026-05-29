/**
 * SEED INSPECTION SYSTEM - 160 Items + 50 Cars + Certificates
 * AutoMarket Car Marketplace
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vxigrlqpzzzgmlddijyj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4aWdybHFwenp6Z21sZGRpanlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU5MjczMSwiZXhwIjoyMDg5MTY4NzMxfQ.gevslDCcOOfYkub9_fAfLrE7w82Utr8PCb26J7lP_Yo'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// ============================================
// 1. INSPECTION CATEGORIES (14 categories)
// ============================================
const categories = [
  { name: 'Engine', description: 'Sistem mesin kendaraan', icon: 'engine', display_order: 1, total_items: 15 },
  { name: 'Transmission', description: 'Sistem transmisi dan persneling', icon: 'settings', display_order: 2, total_items: 10 },
  { name: 'Brake', description: 'Sistem pengereman', icon: 'disc', display_order: 3, total_items: 10 },
  { name: 'Suspension', description: 'Sistem suspensi dan peredam kejut', icon: 'activity', display_order: 4, total_items: 10 },
  { name: 'Steering', description: 'Sistem kemudi', icon: 'navigation', display_order: 5, total_items: 5 },
  { name: 'Exterior', description: 'Kondisi eksterior kendaraan', icon: 'car', display_order: 6, total_items: 15 },
  { name: 'Interior', description: 'Kondisi interior kabin', icon: 'grid', display_order: 7, total_items: 10 },
  { name: 'Electrical', description: 'Sistem kelistrikan', icon: 'zap', display_order: 8, total_items: 10 },
  { name: 'Safety', description: 'Fitur keselamatan', icon: 'shield', display_order: 9, total_items: 5 },
  { name: 'Wheels & Tires', description: 'Kondisi ban dan velg', icon: 'circle', display_order: 10, total_items: 6 },
  { name: 'Underbody', description: 'Kondisi bawah kendaraan', icon: 'layers', display_order: 11, total_items: 4 },
  { name: 'Body Structure', description: 'Struktur bodi kendaraan', icon: 'box', display_order: 12, total_items: 5 },
  { name: 'Features', description: 'Fitur tambahan', icon: 'star', display_order: 13, total_items: 45 },
  { name: 'Road Test', description: 'Pengujian jalan', icon: 'play', display_order: 14, total_items: 10 },
]

// Store category IDs after insertion
let categoryMap: Record<string, string> = {}

// ============================================
// 2. INSPECTION ITEMS (160 items)
// ============================================
const getInspectionItems = () => [
  // ENGINE (1-15)
  { category: 'Engine', name: 'Engine Start', description: 'Mesin dapat menyala dengan mudah saat distarter', display_order: 1, is_critical: true },
  { category: 'Engine', name: 'Engine Idle', description: 'Putaran mesin stabil saat idle', display_order: 2, is_critical: false },
  { category: 'Engine', name: 'Engine Noise', description: 'Tidak ada suara berisik abnormal dari mesin', display_order: 3, is_critical: true },
  { category: 'Engine', name: 'Engine Oil Level', description: 'Level oli mesin normal', display_order: 4, is_critical: true },
  { category: 'Engine', name: 'Engine Oil Leak', description: 'Tidak ada kebocoran oli mesin', display_order: 5, is_critical: true },
  { category: 'Engine', name: 'Radiator Condition', description: 'Kondisi radiator baik', display_order: 6, is_critical: true },
  { category: 'Engine', name: 'Radiator Coolant Level', description: 'Level coolant radiator normal', display_order: 7, is_critical: true },
  { category: 'Engine', name: 'Cooling Fan', description: 'Kipas pendingin berfungsi dengan baik', display_order: 8, is_critical: false },
  { category: 'Engine', name: 'Drive Belt', description: 'V-belt/serpentine belt kondisi baik', display_order: 9, is_critical: false },
  { category: 'Engine', name: 'Battery Condition', description: 'Aki dalam kondisi baik', display_order: 10, is_critical: true },
  { category: 'Engine', name: 'Air Filter', description: 'Filter udara bersih', display_order: 11, is_critical: false },
  { category: 'Engine', name: 'Fuel Pump', description: 'Pompa bensin berfungsi normal', display_order: 12, is_critical: true },
  { category: 'Engine', name: 'Spark Plug', description: 'Busi dalam kondisi baik', display_order: 13, is_critical: false },
  { category: 'Engine', name: 'Engine Mounting', description: 'Engine mounting tidak rusak', display_order: 14, is_critical: false },
  { category: 'Engine', name: 'Turbo Condition', description: 'Turbo berfungsi normal (jika ada)', display_order: 15, is_critical: false },

  // TRANSMISSION (16-25)
  { category: 'Transmission', name: 'Transmission Shift', description: 'Perpindahan gigi halus', display_order: 16, is_critical: true },
  { category: 'Transmission', name: 'Transmission Oil', description: 'Level oli transmisi normal', display_order: 17, is_critical: true },
  { category: 'Transmission', name: 'Clutch Condition', description: 'Kopling tidak slip (manual)', display_order: 18, is_critical: true },
  { category: 'Transmission', name: 'Gearbox Noise', description: 'Tidak ada suara abnormal pada gearbox', display_order: 19, is_critical: false },
  { category: 'Transmission', name: 'Drive Shaft', description: 'Drive shaft kondisi baik', display_order: 20, is_critical: true },
  { category: 'Transmission', name: 'Differential', description: 'Differential berfungsi normal', display_order: 21, is_critical: false },
  { category: 'Transmission', name: 'CV Joint', description: 'CV Joint tidak berbunyi', display_order: 22, is_critical: true },
  { category: 'Transmission', name: 'Transmission Mount', description: 'Transmission mounting kondisi baik', display_order: 23, is_critical: false },
  { category: 'Transmission', name: 'Propeller Shaft', description: 'Propeller shaft kondisi baik (4WD)', display_order: 24, is_critical: false },
  { category: 'Transmission', name: 'Transmission Leak', description: 'Tidak ada kebocoran transmisi', display_order: 25, is_critical: true },

  // BRAKE (26-35)
  { category: 'Brake', name: 'Brake Pad Front', description: 'Kampas rem depan masih tebal', display_order: 26, is_critical: true },
  { category: 'Brake', name: 'Brake Pad Rear', description: 'Kampas rem belakang masih tebal', display_order: 27, is_critical: true },
  { category: 'Brake', name: 'Brake Disc', description: 'Disc brake tidak aus', display_order: 28, is_critical: true },
  { category: 'Brake', name: 'Brake Fluid', description: 'Level minyak rem normal', display_order: 29, is_critical: true },
  { category: 'Brake', name: 'Brake Hose', description: 'Selang rem tidak bocor', display_order: 30, is_critical: true },
  { category: 'Brake', name: 'Brake Caliper', description: 'Caliper rem berfungsi normal', display_order: 31, is_critical: true },
  { category: 'Brake', name: 'ABS System', description: 'Sistem ABS berfungsi', display_order: 32, is_critical: true },
  { category: 'Brake', name: 'Hand Brake', description: 'Rem tangan berfungsi baik', display_order: 33, is_critical: false },
  { category: 'Brake', name: 'Brake Booster', description: 'Brake booster berfungsi', display_order: 34, is_critical: false },
  { category: 'Brake', name: 'Brake Performance', description: 'Performa pengereman optimal', display_order: 35, is_critical: true },

  // SUSPENSION (36-45)
  { category: 'Suspension', name: 'Front Shock Absorber', description: 'Shock absorber depan berfungsi', display_order: 36, is_critical: false },
  { category: 'Suspension', name: 'Rear Shock Absorber', description: 'Shock absorber belakang berfungsi', display_order: 37, is_critical: false },
  { category: 'Suspension', name: 'Spring Condition', description: 'Per kondisi baik', display_order: 38, is_critical: false },
  { category: 'Suspension', name: 'Lower Arm', description: 'Lower arm tidak rusak', display_order: 39, is_critical: true },
  { category: 'Suspension', name: 'Ball Joint', description: 'Ball joint tidak longgar', display_order: 40, is_critical: true },
  { category: 'Suspension', name: 'Stabilizer Link', description: 'Stabilizer link kondisi baik', display_order: 41, is_critical: false },
  { category: 'Suspension', name: 'Suspension Bushings', description: 'Bushings suspensi tidak aus', display_order: 42, is_critical: false },
  { category: 'Suspension', name: 'Suspension Noise', description: 'Tidak ada suara abnormal suspensi', display_order: 43, is_critical: false },
  { category: 'Suspension', name: 'Wheel Bearing', description: 'Wheel bearing kondisi baik', display_order: 44, is_critical: false },
  { category: 'Suspension', name: 'Wheel Alignment', description: 'Wheel alignment sesuai', display_order: 45, is_critical: false },

  // STEERING (46-50)
  { category: 'Steering', name: 'Steering Wheel', description: 'Setir tidak bergetar', display_order: 46, is_critical: false },
  { category: 'Steering', name: 'Steering Rack', description: 'Steering rack kondisi baik', display_order: 47, is_critical: true },
  { category: 'Steering', name: 'Power Steering Pump', description: 'Pompa power steering berfungsi', display_order: 48, is_critical: false },
  { category: 'Steering', name: 'Steering Fluid', description: 'Level oli power steering normal', display_order: 49, is_critical: false },
  { category: 'Steering', name: 'Steering Column', description: 'Steering column tidak longgar', display_order: 50, is_critical: true },

  // EXTERIOR (51-65)
  { category: 'Exterior', name: 'Front Bumper', description: 'Bumper depan kondisi baik', display_order: 51, is_critical: false },
  { category: 'Exterior', name: 'Rear Bumper', description: 'Bumper belakang kondisi baik', display_order: 52, is_critical: false },
  { category: 'Exterior', name: 'Hood', description: 'Kap mesin tidak penyok', display_order: 53, is_critical: false },
  { category: 'Exterior', name: 'Front Left Door', description: 'Pintu depan kiri kondisi baik', display_order: 54, is_critical: false },
  { category: 'Exterior', name: 'Front Right Door', description: 'Pintu depan kanan kondisi baik', display_order: 55, is_critical: false },
  { category: 'Exterior', name: 'Rear Left Door', description: 'Pintu belakang kiri kondisi baik', display_order: 56, is_critical: false },
  { category: 'Exterior', name: 'Rear Right Door', description: 'Pintu belakang kanan kondisi baik', display_order: 57, is_critical: false },
  { category: 'Exterior', name: 'Roof', description: 'Atap tidak penyok', display_order: 58, is_critical: false },
  { category: 'Exterior', name: 'Front Fender Left', description: 'Fender depan kiri kondisi baik', display_order: 59, is_critical: false },
  { category: 'Exterior', name: 'Front Fender Right', description: 'Fender depan kanan kondisi baik', display_order: 60, is_critical: false },
  { category: 'Exterior', name: 'Rear Quarter Panel Left', description: 'Panel quarter kiri kondisi baik', display_order: 61, is_critical: false },
  { category: 'Exterior', name: 'Rear Quarter Panel Right', description: 'Panel quarter kanan kondisi baik', display_order: 62, is_critical: false },
  { category: 'Exterior', name: 'Paint Condition', description: 'Cat tidak pudar', display_order: 63, is_critical: false },
  { category: 'Exterior', name: 'Rust Check', description: 'Tidak ada karat berat', display_order: 64, is_critical: true },
  { category: 'Exterior', name: 'Windshield', description: 'Kaca depan tidak retak', display_order: 65, is_critical: true },

  // INTERIOR (66-75)
  { category: 'Interior', name: 'Dashboard', description: 'Dashboard tidak retak', display_order: 66, is_critical: false },
  { category: 'Interior', name: 'Steering Condition', description: 'Kulit setir tidak aus', display_order: 67, is_critical: false },
  { category: 'Interior', name: 'Seat Condition', description: 'Jok tidak robek', display_order: 68, is_critical: false },
  { category: 'Interior', name: 'Seat Belt', description: 'Sabuk pengaman berfungsi', display_order: 69, is_critical: true },
  { category: 'Interior', name: 'Interior Trim', description: 'Trim interior lengkap', display_order: 70, is_critical: false },
  { category: 'Interior', name: 'Carpet Condition', description: 'Karpet bersih tidak lembab', display_order: 71, is_critical: false },
  { category: 'Interior', name: 'Door Trim', description: 'Trim pintu kondisi baik', display_order: 72, is_critical: false },
  { category: 'Interior', name: 'AC Cooling', description: 'AC dingin', display_order: 73, is_critical: true },
  { category: 'Interior', name: 'AC Blower', description: 'Blower AC berfungsi', display_order: 74, is_critical: false },
  { category: 'Interior', name: 'AC Filter', description: 'Filter AC bersih', display_order: 75, is_critical: false },

  // ELECTRICAL (76-85)
  { category: 'Electrical', name: 'Headlight', description: 'Lampu depan menyala', display_order: 76, is_critical: true },
  { category: 'Electrical', name: 'Tail Light', description: 'Lampu belakang menyala', display_order: 77, is_critical: true },
  { category: 'Electrical', name: 'Turn Signal', description: 'Lampu sein berfungsi', display_order: 78, is_critical: true },
  { category: 'Electrical', name: 'Fog Lamp', description: 'Lampu kabut berfungsi (jika ada)', display_order: 79, is_critical: false },
  { category: 'Electrical', name: 'Hazard Light', description: 'Lampu hazard berfungsi', display_order: 80, is_critical: true },
  { category: 'Electrical', name: 'Power Window', description: 'Power window berfungsi semua', display_order: 81, is_critical: false },
  { category: 'Electrical', name: 'Central Lock', description: 'Central lock berfungsi', display_order: 82, is_critical: false },
  { category: 'Electrical', name: 'Horn', description: 'Klakson berbunyi', display_order: 83, is_critical: false },
  { category: 'Electrical', name: 'Wiper Motor', description: 'Wiper berfungsi', display_order: 84, is_critical: false },
  { category: 'Electrical', name: 'Rear Defogger', description: 'Rear defogger berfungsi', display_order: 85, is_critical: false },

  // SAFETY (86-90)
  { category: 'Safety', name: 'Airbag System', description: 'Sistem airbag aktif', display_order: 86, is_critical: true },
  { category: 'Safety', name: 'ABS Warning', description: 'Tidak ada warning ABS', display_order: 87, is_critical: true },
  { category: 'Safety', name: 'Seat Belt Lock', description: 'Pengunci sabuk berfungsi', display_order: 88, is_critical: true },
  { category: 'Safety', name: 'Parking Sensor', description: 'Parking sensor berfungsi (jika ada)', display_order: 89, is_critical: false },
  { category: 'Safety', name: 'Rear Camera', description: 'Kamera belakang berfungsi (jika ada)', display_order: 90, is_critical: false },

  // WHEELS (91-96)
  { category: 'Wheels & Tires', name: 'Front Tire', description: 'Ban depan masih bagus', display_order: 91, is_critical: true },
  { category: 'Wheels & Tires', name: 'Rear Tire', description: 'Ban belakang masih bagus', display_order: 92, is_critical: true },
  { category: 'Wheels & Tires', name: 'Spare Tire', description: 'Ban cadangan ada', display_order: 93, is_critical: false },
  { category: 'Wheels & Tires', name: 'Wheel Rim', description: 'Velg tidak bengkok', display_order: 94, is_critical: false },
  { category: 'Wheels & Tires', name: 'Wheel Alignment', description: 'Spoor/stuur sesuai', display_order: 95, is_critical: false },
  { category: 'Wheels & Tires', name: 'Wheel Balance', description: 'Balance roda baik', display_order: 96, is_critical: false },

  // UNDERBODY (97-100)
  { category: 'Underbody', name: 'Chassis Frame', description: 'Chassis tidak rusak', display_order: 97, is_critical: true },
  { category: 'Underbody', name: 'Exhaust Pipe', description: 'Knalpot tidak bocor', display_order: 98, is_critical: false },
  { category: 'Underbody', name: 'Fuel Tank', description: 'Tangki bensin tidak bocor', display_order: 99, is_critical: true },
  { category: 'Underbody', name: 'Underbody Rust', description: 'Underbody bebas karat berat', display_order: 100, is_critical: true },

  // BODY STRUCTURE (101-105)
  { category: 'Body Structure', name: 'Front Frame', description: 'Frame depan tidak penyok', display_order: 101, is_critical: true },
  { category: 'Body Structure', name: 'Rear Frame', description: 'Frame belakang baik', display_order: 102, is_critical: true },
  { category: 'Body Structure', name: 'Side Frame', description: 'Frame samping tidak rusak', display_order: 103, is_critical: true },
  { category: 'Body Structure', name: 'Impact Damage', description: 'Tidak ada bekas tabrakan berat', display_order: 104, is_critical: true },
  { category: 'Body Structure', name: 'Structural Weld', description: 'Tidak ada las bekas kecelakaan', display_order: 105, is_critical: true },

  // FEATURES (106-150)
  { category: 'Features', name: 'Key Condition', description: 'Kunci kondisi baik', display_order: 106, is_critical: false },
  { category: 'Features', name: 'Remote Key', description: 'Remote kunci berfungsi (jika ada)', display_order: 107, is_critical: false },
  { category: 'Features', name: 'Infotainment System', description: 'Head unit berfungsi', display_order: 108, is_critical: false },
  { category: 'Features', name: 'Navigation System', description: 'Navigasi berfungsi (jika ada)', display_order: 109, is_critical: false },
  { category: 'Features', name: 'USB Port', description: 'Port USB berfungsi', display_order: 110, is_critical: false },
  { category: 'Features', name: 'Bluetooth', description: 'Bluetooth terkoneksi', display_order: 111, is_critical: false },
  { category: 'Features', name: 'Speaker', description: 'Semua speaker berfungsi', display_order: 112, is_critical: false },
  { category: 'Features', name: 'Sunroof', description: 'Sunroof berfungsi (jika ada)', display_order: 113, is_critical: false },
  { category: 'Features', name: 'Cruise Control', description: 'Cruise control berfungsi (jika ada)', display_order: 114, is_critical: false },
  { category: 'Features', name: 'Driver Assist', description: 'Driver assist berfungsi (jika ada)', display_order: 115, is_critical: false },
  { category: 'Features', name: 'Lane Assist', description: 'Lane assist aktif (jika ada)', display_order: 116, is_critical: false },
  { category: 'Features', name: 'Adaptive Cruise', description: 'Adaptive cruise berfungsi (jika ada)', display_order: 117, is_critical: false },
  { category: 'Features', name: 'Auto Brake', description: 'Auto brake berfungsi (jika ada)', display_order: 118, is_critical: false },
  { category: 'Features', name: 'Parking Brake Electric', description: 'Parking brake elektrik berfungsi', display_order: 119, is_critical: false },
  { category: 'Features', name: 'Interior Light', description: 'Lampu kabin berfungsi', display_order: 120, is_critical: false },
  { category: 'Features', name: 'Door Lock', description: 'Kunci pintu berfungsi semua', display_order: 121, is_critical: false },
  { category: 'Features', name: 'Seat Adjuster', description: 'Pengatur jok berfungsi', display_order: 122, is_critical: false },
  { category: 'Features', name: 'Seat Heater', description: 'Heater jok berfungsi (jika ada)', display_order: 123, is_critical: false },
  { category: 'Features', name: 'Seat Ventilation', description: 'Ventilasi jok berfungsi (jika ada)', display_order: 124, is_critical: false },
  { category: 'Features', name: 'Rear Seat Condition', description: 'Jok belakang kondisi baik', display_order: 125, is_critical: false },
  { category: 'Features', name: 'Third Row Seat', description: 'Jok baris ketiga (jika ada)', display_order: 126, is_critical: false },
  { category: 'Features', name: 'Roof Rack', description: 'Roof rack kondisi baik (jika ada)', display_order: 127, is_critical: false },
  { category: 'Features', name: 'Tow Hook', description: 'Tow hook tersedia', display_order: 128, is_critical: false },
  { category: 'Features', name: 'Fuel Cap', description: 'Tutup bensin ada', display_order: 129, is_critical: false },
  { category: 'Features', name: 'Trunk Lock', description: 'Kunci bagasi berfungsi', display_order: 130, is_critical: false },
  { category: 'Features', name: 'Trunk Carpet', description: 'Karpet bagasi ada', display_order: 131, is_critical: false },
  { category: 'Features', name: 'Spare Tools', description: 'Alat-alat cadangan lengkap', display_order: 132, is_critical: false },
  { category: 'Features', name: 'Jack Tools', description: 'Dongkrak tersedia', display_order: 133, is_critical: false },
  { category: 'Features', name: 'Owner Manual', description: 'Buku manual ada', display_order: 134, is_critical: false },
  { category: 'Features', name: 'Service Book', description: 'Buku service ada', display_order: 135, is_critical: false },
  { category: 'Features', name: 'Emission Test', description: 'Emisi sesuai standar', display_order: 136, is_critical: false },
  { category: 'Features', name: 'OBD Scan', description: 'Tidak ada error code', display_order: 137, is_critical: true },
  { category: 'Features', name: 'Battery Voltage', description: 'Tegangan aki normal (12.6V)', display_order: 138, is_critical: false },
  { category: 'Features', name: 'Engine Compression', description: 'Kompresi mesin baik', display_order: 139, is_critical: true },
  { category: 'Features', name: 'Engine Smoke', description: 'Tidak ada asap berlebih', display_order: 140, is_critical: true },
  { category: 'Features', name: 'Fuel Consumption', description: 'Konsumsi BBM normal', display_order: 141, is_critical: false },
  { category: 'Features', name: 'Acceleration Test', description: 'Akselerasi responsif', display_order: 142, is_critical: false },
  { category: 'Features', name: 'Braking Distance', description: 'Jarak pengereman normal', display_order: 143, is_critical: true },
  { category: 'Features', name: 'Steering Response', description: 'Respon setir presisi', display_order: 144, is_critical: false },
  { category: 'Features', name: 'Suspension Comfort', description: 'Suspensi nyaman', display_order: 145, is_critical: false },
  { category: 'Features', name: 'Noise Level', description: 'Suara mesin halus', display_order: 146, is_critical: false },
  { category: 'Features', name: 'Vibration Level', description: 'Getaran minimal', display_order: 147, is_critical: false },
  { category: 'Features', name: 'Interior Smell', description: 'Tidak ada bau apek', display_order: 148, is_critical: false },
  { category: 'Features', name: 'Water Leak', description: 'Tidak ada kebocoran air', display_order: 149, is_critical: true },
  { category: 'Features', name: 'Electrical Error', description: 'Tidak ada error listrik', display_order: 150, is_critical: true },

  // ROAD TEST (151-160)
  { category: 'Road Test', name: 'Engine Start Test', description: 'Mesin menyala dengan mudah', display_order: 151, is_critical: true },
  { category: 'Road Test', name: 'Idle Stability', description: 'Idle stabil saat mesin panas', display_order: 152, is_critical: false },
  { category: 'Road Test', name: 'Transmission Shift Test', description: 'Perpindahan gigi halus saat jalan', display_order: 153, is_critical: true },
  { category: 'Road Test', name: 'Acceleration Performance', description: 'Akselerasi normal tanpa tersendat', display_order: 154, is_critical: false },
  { category: 'Road Test', name: 'Brake Performance Test', description: 'Rem berfungsi optimal saat jalan', display_order: 155, is_critical: true },
  { category: 'Road Test', name: 'Steering Feel', description: 'Setir stabil dan responsif', display_order: 156, is_critical: true },
  { category: 'Road Test', name: 'Suspension Test', description: 'Suspensi bekerja baik saat jalan', display_order: 157, is_critical: false },
  { category: 'Road Test', name: 'AC Performance Test', description: 'AC dingin saat mesin panas', display_order: 158, is_critical: false },
  { category: 'Road Test', name: 'Noise Test', description: 'Tidak ada suara abnormal saat jalan', display_order: 159, is_critical: false },
  { category: 'Road Test', name: 'Final Road Test', description: 'Kendaraan layak jalan', display_order: 160, is_critical: true },
]

// Random utilities
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomStatus(isCritical: boolean): string {
  const rand = Math.random()
  if (isCritical) {
    // Critical items have higher chance of being good
    if (rand < 0.85) return 'baik'
    if (rand < 0.95) return 'cukup'
    return 'rusak'
  } else {
    // Non-critical items have more variation
    if (rand < 0.70) return 'baik'
    if (rand < 0.85) return 'cukup'
    if (rand < 0.95) return 'rusak'
    return 'n/a'
  }
}

function generateCertificateNumber(): string {
  const year = new Date().getFullYear()
  const random = randomInt(10000, 99999)
  return `INS-${year}-${random}`
}

function calculateGrade(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 75) return 'B'
  if (score >= 60) return 'C'
  return 'D'
}

async function seed() {
  console.log('🚀 Starting Inspection System Seed...\n')

  // Step 1: Clear existing data
  console.log('📋 Step 1: Clearing existing data...')
  await supabase.from('inspection_results').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('car_inspections').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('inspection_items').delete().neq('id', 0)
  await supabase.from('inspection_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  console.log('✅ Existing data cleared\n')

  // Step 2: Insert categories
  console.log('📋 Step 2: Inserting 14 categories...')
  const { data: insertedCategories, error: catError } = await supabase
    .from('inspection_categories')
    .insert(categories)
    .select()
  
  if (catError || !insertedCategories) {
    console.log('❌ Category error:', catError?.message)
    return
  }
  
  // Create category map
  insertedCategories.forEach((cat: any) => {
    categoryMap[cat.name] = cat.id
  })
  console.log(`✅ ${insertedCategories.length} categories inserted\n`)

  // Step 3: Insert items with category_id
  console.log('📋 Step 3: Inserting 160 inspection items...')
  const itemsToInsert = getInspectionItems().map(item => ({
    name: item.name,
    description: item.description,
    category_id: categoryMap[item.category],
    display_order: item.display_order,
    is_critical: item.is_critical
  }))

  const batchSize = 50
  for (let i = 0; i < itemsToInsert.length; i += batchSize) {
    const batch = itemsToInsert.slice(i, i + batchSize)
    const { error: itemError } = await supabase.from('inspection_items').insert(batch)
    if (itemError) {
      console.log(`❌ Items batch ${i}-${i + batchSize} error:`, itemError.message)
    } else {
      console.log(`✅ Items ${i + 1}-${Math.min(i + batchSize, itemsToInsert.length)} inserted`)
    }
  }
  console.log('✅ 160 inspection items inserted\n')

  // Step 4: Get all items and listings
  console.log('📋 Step 4: Fetching items and listings...')
  const { data: items, error: itemsFetchError } = await supabase
    .from('inspection_items')
    .select('id, is_critical')
    .order('display_order')
  
  const { data: listings } = await supabase
    .from('car_listings')
    .select('id, title, year')
    .order('created_at', { ascending: false })

  if (!items || !listings) {
    console.log('❌ Failed to fetch items or listings')
    return
  }
  console.log(`✅ Found ${items.length} items and ${listings.length} listings\n`)

  // Step 5: Create inspections and results
  console.log('📋 Step 5: Creating inspections for each car...')
  
  let totalResults = 0
  let inspectionCount = 0

  for (const listing of listings) {
    // Create inspection
    const certificateNumber = generateCertificateNumber()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days

    const { data: inspection, error: inspError } = await supabase
      .from('car_inspections')
      .insert({
        car_listing_id: listing.id,
        status: 'completed',
        inspection_date: now.toISOString(),
        certificate_number: certificateNumber,
        certificate_issued_at: now.toISOString(),
        certificate_expires_at: expiresAt.toISOString(),
        accident_free: Math.random() > 0.1,
        flood_free: Math.random() > 0.15,
        fire_free: Math.random() > 0.05,
        odometer_tampered: Math.random() < 0.1,
        risk_level: ['low', 'medium', 'low', 'low', 'high'][randomInt(0, 4)],
        recommended: Math.random() > 0.2,
      })
      .select()
      .single()

    if (inspError || !inspection) {
      console.log(`❌ Failed to create inspection for ${listing.title}:`, inspError?.message)
      continue
    }

    inspectionCount++

    // Generate random results for all 160 items
    const results = items.map((item: any) => ({
      inspection_id: inspection.id,
      item_id: item.id,
      status: randomStatus(item.is_critical || false),
      notes: null,
    }))

    // Insert results in batches
    const resultBatchSize = 40
    for (let i = 0; i < results.length; i += resultBatchSize) {
      const batch = results.slice(i, i + resultBatchSize)
      const { error: resError } = await supabase.from('inspection_results').insert(batch)
      if (resError) {
        console.log(`❌ Results batch error:`, resError.message)
      } else {
        totalResults += batch.length
      }
    }

    // Calculate and update score
    const { data: allResults } = await supabase
      .from('inspection_results')
      .select('status')
      .eq('inspection_id', inspection.id)

    if (allResults) {
      const passed = allResults.filter((r: any) => r.status === 'baik').length
      const score = Math.round((passed / allResults.length) * 100)
      const grade = calculateGrade(score)
      
      await supabase
        .from('car_inspections')
        .update({
          inspection_score: score,
          overall_grade: grade,
          passed_points: passed,
          failed_points: allResults.length - passed,
        })
        .eq('id', inspection.id)
    }

    if (inspectionCount % 10 === 0) {
      console.log(`✅ Processed ${inspectionCount}/${listings.length} inspections...`)
    }
  }

  console.log(`\n✅ ${inspectionCount} inspections created`)
  console.log(`✅ ${totalResults} inspection results generated`)

  // Final summary
  const { count: finalCatCount } = await supabase.from('inspection_categories').select('*', { count: 'exact', head: true })
  const { count: finalItemCount } = await supabase.from('inspection_items').select('*', { count: 'exact', head: true })
  const { count: finalInspCount } = await supabase.from('car_inspections').select('*', { count: 'exact', head: true })
  const { count: finalResCount } = await supabase.from('inspection_results').select('*', { count: 'exact', head: true })

  console.log('\n========================================')
  console.log('📊 FINAL SUMMARY:')
  console.log(`   Categories: ${finalCatCount}`)
  console.log(`   Items: ${finalItemCount}`)
  console.log(`   Inspections: ${finalInspCount}`)
  console.log(`   Results: ${finalResCount}`)
  console.log('========================================\n')
}

seed()
