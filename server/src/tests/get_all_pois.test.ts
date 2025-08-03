
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { poisTable } from '../db/schema';
import { type CreatePOIInput } from '../schema';
import { getAllPOIs } from '../handlers/get_all_pois';

// Test POIs with at least 2 examples per category
const testPOIs: CreatePOIInput[] = [
  // Layanan (Services) - 2 examples
  {
    name: 'Bank BCA Sudirman',
    description: 'Bank dan layanan ATM 24 jam',
    category: 'Layanan',
    latitude: -6.2088,
    longitude: 106.8456,
    address: 'Jl. Jend. Sudirman No.1, Jakarta',
    phone: '+62-21-2358-8000'
  },
  {
    name: 'Rumah Sakit Siloam',
    description: 'Rumah sakit umum dengan layanan 24 jam',
    category: 'Layanan',
    latitude: -6.2100,
    longitude: 106.8470,
    address: 'Jl. Garnisun Dalam No.8, Jakarta',
    phone: '+62-21-7919-2001'
  },
  
  // Kuliner (Food & Beverage) - 2 examples
  {
    name: 'Warung Padang Sederhana',
    description: 'Masakan Padang autentik dengan cita rasa tradisional',
    category: 'Kuliner',
    latitude: -6.2095,
    longitude: 106.8445,
    address: 'Jl. Kebon Sirih No.15, Jakarta',
    phone: '+62-21-3904-5678'
  },
  {
    name: 'Starbucks Coffee',
    description: 'Kedai kopi internasional dengan wifi gratis',
    category: 'Kuliner',
    latitude: -6.2080,
    longitude: 106.8480,
    address: 'Plaza Indonesia, Lt. Ground, Jakarta',
    phone: '+62-21-2992-3456'
  },
  
  // Belanja (Shopping) - 2 examples
  {
    name: 'Plaza Indonesia',
    description: 'Pusat perbelanjaan mewah dengan brand internasional',
    category: 'Belanja',
    latitude: -6.2082,
    longitude: 106.8485,
    address: 'Jl. M.H. Thamrin Kav. 28-30, Jakarta',
    phone: '+62-21-310-7081'
  },
  {
    name: 'Grand Indonesia Mall',
    description: 'Mall besar dengan berbagai tenant dan food court',
    category: 'Belanja',
    latitude: -6.2075,
    longitude: 106.8465,
    address: 'Jl. M.H. Thamrin No.1, Jakarta',
    phone: '+62-21-2358-7000'
  },
  
  // Wisata (Tourism) - 2 examples
  {
    name: 'Monumen Nasional (Monas)',
    description: 'Monumen bersejarah simbol kemerdekaan Indonesia',
    category: 'Wisata',
    latitude: -6.1754,
    longitude: 106.8272,
    address: 'Gambir, Jakarta Pusat',
    phone: '+62-21-382-2255'
  },
  {
    name: 'Museum Bank Indonesia',
    description: 'Museum yang menampilkan sejarah perbankan Indonesia',
    category: 'Wisata',
    latitude: -6.1680,
    longitude: 106.8310,
    address: 'Jl. Pintu Besar Utara No.3, Jakarta',
    phone: '+62-21-2600-1200'
  }
];

describe('getAllPOIs', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no POIs exist', async () => {
    const result = await getAllPOIs();
    expect(result).toEqual([]);
  });

  it('should return all POIs from database', async () => {
    // Insert test POIs
    await db.insert(poisTable)
      .values(testPOIs)
      .execute();

    const result = await getAllPOIs();

    expect(result).toHaveLength(8);
    
    // Verify all categories are represented with at least 2 examples each
    const layananPOIs = result.filter(poi => poi.category === 'Layanan');
    const kulinerPOIs = result.filter(poi => poi.category === 'Kuliner');
    const belanjaPOIs = result.filter(poi => poi.category === 'Belanja');
    const wisataPOIs = result.filter(poi => poi.category === 'Wisata');

    expect(layananPOIs).toHaveLength(2);
    expect(kulinerPOIs).toHaveLength(2);
    expect(belanjaPOIs).toHaveLength(2);
    expect(wisataPOIs).toHaveLength(2);
  });

  it('should return POIs with correct field types', async () => {
    // Insert one POI for testing
    await db.insert(poisTable)
      .values([testPOIs[0]])
      .execute();

    const result = await getAllPOIs();

    expect(result).toHaveLength(1);
    const poi = result[0];

    // Verify field types
    expect(typeof poi.id).toBe('number');
    expect(typeof poi.name).toBe('string');
    expect(typeof poi.category).toBe('string');
    expect(typeof poi.latitude).toBe('number');
    expect(typeof poi.longitude).toBe('number');
    expect(poi.created_at).toBeInstanceOf(Date);

    // Verify specific values
    expect(poi.name).toEqual('Bank BCA Sudirman');
    expect(poi.category).toEqual('Layanan');
    expect(poi.latitude).toEqual(-6.2088);
    expect(poi.longitude).toEqual(106.8456);
  });

  it('should handle nullable fields correctly', async () => {
    // Insert POI with null values
    const poiWithNulls: CreatePOIInput = {
      name: 'Test POI',
      description: null,
      category: 'Layanan',
      latitude: -6.2088,
      longitude: 106.8456,
      address: null,
      phone: null
    };

    await db.insert(poisTable)
      .values([poiWithNulls])
      .execute();

    const result = await getAllPOIs();

    expect(result).toHaveLength(1);
    const poi = result[0];

    expect(poi.description).toBeNull();
    expect(poi.address).toBeNull();
    expect(poi.phone).toBeNull();
    expect(poi.name).toEqual('Test POI');
  });
});
