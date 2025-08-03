
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { poisTable } from '../db/schema';
import { type GetPOIsByCategoryInput, type POICategory } from '../schema';
import { getPOIsByCategory } from '../handlers/get_pois_by_category';

// Test POI data - at least 2 examples per category
const testPOIs = [
  // Layanan category
  {
    name: 'Bank BCA Sudirman',
    description: 'Bank dan layanan ATM 24 jam',
    category: 'Layanan' as POICategory,
    latitude: -6.2088,
    longitude: 106.8456,
    address: 'Jl. Jend. Sudirman No.1, Jakarta',
    phone: '+62-21-2358-8000'
  },
  {
    name: 'Rumah Sakit Siloam',
    description: 'Rumah sakit umum dengan layanan 24 jam',
    category: 'Layanan' as POICategory,
    latitude: -6.2100,
    longitude: 106.8470,
    address: 'Jl. Garnisun Dalam No.8, Jakarta',
    phone: '+62-21-7919-2001'
  },
  // Kuliner category
  {
    name: 'Warung Padang Sederhana',
    description: 'Masakan Padang autentik dengan cita rasa tradisional',
    category: 'Kuliner' as POICategory,
    latitude: -6.2095,
    longitude: 106.8445,
    address: 'Jl. Kebon Sirih No.15, Jakarta',
    phone: '+62-21-3904-5678'
  },
  {
    name: 'Starbucks Coffee',
    description: 'Kedai kopi internasional dengan wifi gratis',
    category: 'Kuliner' as POICategory,
    latitude: -6.2080,
    longitude: 106.8480,
    address: 'Plaza Indonesia, Lt. Ground, Jakarta',
    phone: '+62-21-2992-3456'
  },
  // Belanja category
  {
    name: 'Plaza Indonesia',
    description: 'Pusat perbelanjaan mewah dengan brand internasional',
    category: 'Belanja' as POICategory,
    latitude: -6.2082,
    longitude: 106.8485,
    address: 'Jl. M.H. Thamrin Kav. 28-30, Jakarta',
    phone: '+62-21-310-7081'
  },
  {
    name: 'Grand Indonesia Mall',
    description: 'Mall besar dengan berbagai tenant dan food court',
    category: 'Belanja' as POICategory,
    latitude: -6.2075,
    longitude: 106.8465,
    address: 'Jl. M.H. Thamrin No.1, Jakarta',
    phone: '+62-21-2358-7000'
  },
  // Wisata category
  {
    name: 'Monumen Nasional (Monas)',
    description: 'Monumen bersejarah simbol kemerdekaan Indonesia',
    category: 'Wisata' as POICategory,
    latitude: -6.1754,
    longitude: 106.8272,
    address: 'Gambir, Jakarta Pusat',
    phone: '+62-21-382-2255'
  },
  {
    name: 'Museum Bank Indonesia',
    description: 'Museum yang menampilkan sejarah perbankan Indonesia',
    category: 'Wisata' as POICategory,
    latitude: -6.1680,
    longitude: 106.8310,
    address: 'Jl. Pintu Besar Utara No.3, Jakarta',
    phone: '+62-21-2600-1200'
  }
];

describe('getPOIsByCategory', () => {
  beforeEach(async () => {
    await createDB();
    
    // Insert test data
    await db.insert(poisTable)
      .values(testPOIs)
      .execute();
  });

  afterEach(resetDB);

  it('should get POIs by Layanan category', async () => {
    const input: GetPOIsByCategoryInput = {
      category: 'Layanan'
    };

    const result = await getPOIsByCategory(input);

    expect(result).toHaveLength(2);
    expect(result.every(poi => poi.category === 'Layanan')).toBe(true);
    
    const names = result.map(poi => poi.name);
    expect(names).toContain('Bank BCA Sudirman');
    expect(names).toContain('Rumah Sakit Siloam');
  });

  it('should get POIs by Kuliner category', async () => {
    const input: GetPOIsByCategoryInput = {
      category: 'Kuliner'
    };

    const result = await getPOIsByCategory(input);

    expect(result).toHaveLength(2);
    expect(result.every(poi => poi.category === 'Kuliner')).toBe(true);
    
    const names = result.map(poi => poi.name);
    expect(names).toContain('Warung Padang Sederhana');
    expect(names).toContain('Starbucks Coffee');
  });

  it('should get POIs by Belanja category', async () => {
    const input: GetPOIsByCategoryInput = {
      category: 'Belanja'
    };

    const result = await getPOIsByCategory(input);

    expect(result).toHaveLength(2);
    expect(result.every(poi => poi.category === 'Belanja')).toBe(true);
    
    const names = result.map(poi => poi.name);
    expect(names).toContain('Plaza Indonesia');
    expect(names).toContain('Grand Indonesia Mall');
  });

  it('should get POIs by Wisata category', async () => {
    const input: GetPOIsByCategoryInput = {
      category: 'Wisata'
    };

    const result = await getPOIsByCategory(input);

    expect(result).toHaveLength(2);
    expect(result.every(poi => poi.category === 'Wisata')).toBe(true);
    
    const names = result.map(poi => poi.name);
    expect(names).toContain('Monumen Nasional (Monas)');
    expect(names).toContain('Museum Bank Indonesia');
  });

  it('should return empty array for category with no POIs', async () => {
    // Clear all data first
    await db.delete(poisTable).execute();

    const input: GetPOIsByCategoryInput = {
      category: 'Layanan'
    };

    const result = await getPOIsByCategory(input);

    expect(result).toHaveLength(0);
  });

  it('should return POIs with correct structure', async () => {
    const input: GetPOIsByCategoryInput = {
      category: 'Layanan'
    };

    const result = await getPOIsByCategory(input);

    expect(result.length).toBeGreaterThan(0);
    
    const poi = result[0];
    expect(poi.id).toBeDefined();
    expect(typeof poi.name).toBe('string');
    expect(typeof poi.category).toBe('string');
    expect(typeof poi.latitude).toBe('number');
    expect(typeof poi.longitude).toBe('number');
    expect(poi.created_at).toBeInstanceOf(Date);
  });
});
