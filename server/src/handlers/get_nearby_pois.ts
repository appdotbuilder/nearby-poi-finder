
import { type GetNearbyPOIsInput, type POIWithDistance } from '../schema';

// Dummy data with consistent 2+ examples per category and varied distances
const DUMMY_POIS_WITH_DISTANCE: POIWithDistance[] = [
  // Layanan (Services) - 3 examples
  {
    id: 1,
    name: 'Bank BCA Sudirman',
    description: 'Bank dan layanan ATM 24 jam',
    category: 'Layanan',
    latitude: -6.2088,
    longitude: 106.8456,
    address: 'Jl. Jend. Sudirman No.1, Jakarta',
    phone: '+62-21-2358-8000',
    created_at: new Date('2024-01-01'),
    distance: 150 // 150 meters
  },
  {
    id: 2,
    name: 'Rumah Sakit Siloam',
    description: 'Rumah sakit umum dengan layanan 24 jam',
    category: 'Layanan',
    latitude: -6.2100,
    longitude: 106.8470,
    address: 'Jl. Garnisun Dalam No.8, Jakarta',
    phone: '+62-21-7919-2001',
    created_at: new Date('2024-01-02'),
    distance: 850 // 850 meters
  },
  {
    id: 3,
    name: 'Kantor Pos Pusat',
    description: 'Layanan pos dan pengiriman paket',
    category: 'Layanan',
    latitude: -6.2150,
    longitude: 106.8500,
    address: 'Jl. Pos Raya No.2, Jakarta',
    phone: '+62-21-384-4875',
    created_at: new Date('2024-01-03'),
    distance: 2100 // 2.1 km
  },
  
  // Kuliner (Food & Beverage) - 3 examples
  {
    id: 4,
    name: 'Warung Padang Sederhana',
    description: 'Masakan Padang autentik dengan cita rasa tradisional',
    category: 'Kuliner',
    latitude: -6.2095,
    longitude: 106.8445,
    address: 'Jl. Kebon Sirih No.15, Jakarta',
    phone: '+62-21-3904-5678',
    created_at: new Date('2024-01-04'),
    distance: 320 // 320 meters
  },
  {
    id: 5,
    name: 'Starbucks Coffee',
    description: 'Kedai kopi internasional dengan wifi gratis',
    category: 'Kuliner',
    latitude: -6.2080,
    longitude: 106.8480,
    address: 'Plaza Indonesia, Lt. Ground, Jakarta',
    phone: '+62-21-2992-3456',
    created_at: new Date('2024-01-05'),
    distance: 450 // 450 meters
  },
  {
    id: 6,
    name: 'Sate Khas Senayan',
    description: 'Sate bakar khas Indonesia dengan bumbu rahasia',
    category: 'Kuliner',
    latitude: -6.2120,
    longitude: 106.8420,
    address: 'Jl. Kemanggisan Raya No.25, Jakarta',
    phone: '+62-21-5306-7890',
    created_at: new Date('2024-01-06'),
    distance: 1200 // 1.2 km
  },
  
  // Belanja (Shopping) - 3 examples
  {
    id: 7,
    name: 'Plaza Indonesia',
    description: 'Pusat perbelanjaan mewah dengan brand internasional',
    category: 'Belanja',
    latitude: -6.2082,
    longitude: 106.8485,
    address: 'Jl. M.H. Thamrin Kav. 28-30, Jakarta',
    phone: '+62-21-310-7081',
    created_at: new Date('2024-01-07'),
    distance: 280 // 280 meters
  },
  {
    id: 8,
    name: 'Grand Indonesia Mall',
    description: 'Mall besar dengan berbagai tenant dan food court',
    category: 'Belanja',
    latitude: -6.2075,
    longitude: 106.8465,
    address: 'Jl. M.H. Thamrin No.1, Jakarta',
    phone: '+62-21-2358-7000',
    created_at: new Date('2024-01-08'),
    distance: 380 // 380 meters
  },
  {
    id: 9,
    name: 'Pasar Tanah Abang',
    description: 'Pasar tekstil terbesar di Asia Tenggara',
    category: 'Belanja',
    latitude: -6.2200,
    longitude: 106.8350,
    address: 'Jl. Jatibaru Raya, Jakarta',
    phone: '+62-21-345-6789',
    created_at: new Date('2024-01-09'),
    distance: 3200 // 3.2 km
  },
  
  // Wisata (Tourism) - 3 examples
  {
    id: 10,
    name: 'Monumen Nasional (Monas)',
    description: 'Monumen bersejarah simbol kemerdekaan Indonesia',
    category: 'Wisata',
    latitude: -6.1754,
    longitude: 106.8272,
    address: 'Gambir, Jakarta Pusat',
    phone: '+62-21-382-2255',
    created_at: new Date('2024-01-10'),
    distance: 650 // 650 meters
  },
  {
    id: 11,
    name: 'Museum Bank Indonesia',
    description: 'Museum yang menampilkan sejarah perbankan Indonesia',
    category: 'Wisata',
    latitude: -6.1680,
    longitude: 106.8310,
    address: 'Jl. Pintu Besar Utara No.3, Jakarta',
    phone: '+62-21-2600-1200',
    created_at: new Date('2024-01-11'),
    distance: 1800 // 1.8 km
  },
  {
    id: 12,
    name: 'Taman Mini Indonesia Indah',
    description: 'Taman rekreasi yang menampilkan kebudayaan Indonesia',
    category: 'Wisata',
    latitude: -6.3025,
    longitude: 106.8950,
    address: 'Jl. Raya Taman Mini, Jakarta Timur',
    phone: '+62-21-840-1687',
    created_at: new Date('2024-01-12'),
    distance: 4500 // 4.5 km
  },
  
  // Additional POIs with distances beyond 5km to test radius filtering
  {
    id: 13,
    name: 'Apotek Kimia Farma',
    description: 'Apotek 24 jam dengan layanan konsultasi dokter',
    category: 'Layanan',
    latitude: -6.2500,
    longitude: 106.9000,
    address: 'Jl. Raya Bogor No.50, Jakarta',
    phone: '+62-21-8765-4321',
    created_at: new Date('2024-01-13'),
    distance: 6200 // 6.2 km - beyond default radius
  },
  {
    id: 14,
    name: 'KFC Kemang',
    description: 'Restoran cepat saji ayam goreng crispy',
    category: 'Kuliner',
    latitude: -6.2800,
    longitude: 106.8100,
    address: 'Jl. Kemang Raya No.100, Jakarta',
    phone: '+62-21-7194-5678',
    created_at: new Date('2024-01-14'),
    distance: 7500 // 7.5 km - beyond default radius
  }
];

// Helper function to simulate distance calculation based on input coordinates
function calculateSimulatedDistance(
  inputLat: number,
  inputLng: number,
  poiLat: number,
  poiLng: number,
  baseDummyDistance: number
): number {
  // Simple distance variation based on coordinate differences
  const latDiff = Math.abs(inputLat - poiLat);
  const lngDiff = Math.abs(inputLng - poiLng);
  const coordinateVariation = (latDiff + lngDiff) * 10000; // Scale factor for simulation
  
  // Add some variation to the base dummy distance based on coordinates
  const variation = coordinateVariation % 500; // Max 500m variation
  return Math.round(baseDummyDistance + variation);
}

export async function getNearbyPOIs(input: GetNearbyPOIsInput): Promise<POIWithDistance[]> {
  // Create a copy of dummy data with recalculated distances based on input coordinates
  const poisWithCalculatedDistances = DUMMY_POIS_WITH_DISTANCE.map(poi => ({
    ...poi,
    distance: calculateSimulatedDistance(
      input.latitude,
      input.longitude,
      poi.latitude,
      poi.longitude,
      poi.distance
    )
  }));
  
  let filteredPOIs = poisWithCalculatedDistances;
  
  // Filter by category if specified
  if (input.category) {
    filteredPOIs = filteredPOIs.filter(poi => poi.category === input.category);
  }
  
  // Filter by radius
  filteredPOIs = filteredPOIs.filter(poi => poi.distance <= input.radius);
  
  // Sort by distance (nearest first)
  filteredPOIs.sort((a, b) => a.distance - b.distance);
  
  return filteredPOIs;
}
