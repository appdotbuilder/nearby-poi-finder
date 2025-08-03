
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { pointsOfInterestTable } from '../db/schema';
import { type GetPOIsByCategoryInput } from '../schema';
import { getPOIsByCategory } from '../handlers/get_pois_by_category';

describe('getPOIsByCategory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return POIs filtered by category', async () => {
    // Create test POIs with different categories
    await db.insert(pointsOfInterestTable)
      .values([
        {
          name: 'Rumah Sakit Umum',
          description: 'Layanan kesehatan 24 jam',
          category: 'Layanan',
          latitude: -6.2088,
          longitude: 106.8456,
          address: 'Jl. Kesehatan No. 123',
          phone: '+62-21-1234567',
          rating: 4.5,
          is_active: true
        },
        {
          name: 'Warung Nasi Padang',
          description: 'Masakan Padang autentik',
          category: 'Kuliner',
          latitude: -6.2095,
          longitude: 106.8440,
          address: 'Jl. Raya Kuliner No. 45',
          phone: '+62-21-7654321',
          rating: 4.2,
          is_active: true
        },
        {
          name: 'Minimarket 24 Jam',
          description: 'Toko swalayan lengkap',
          category: 'Belanja',
          latitude: -6.2085,
          longitude: 106.8475,
          address: 'Jl. Belanja Raya No. 78',
          rating: 4.0,
          is_active: true
        }
      ])
      .execute();

    const input: GetPOIsByCategoryInput = {
      category: 'Kuliner',
      limit: 20,
      offset: 0
    };

    const results = await getPOIsByCategory(input);

    expect(results).toHaveLength(1);
    expect(results[0].name).toEqual('Warung Nasi Padang');
    expect(results[0].category).toEqual('Kuliner');
    expect(results[0].description).toEqual('Masakan Padang autentik');
    expect(results[0].latitude).toEqual(-6.2095);
    expect(results[0].longitude).toEqual(106.8440);
    expect(results[0].rating).toEqual(4.2);
    expect(results[0].is_active).toBe(true);
    expect(results[0].id).toBeDefined();
    expect(results[0].created_at).toBeInstanceOf(Date);
  });

  it('should only return active POIs', async () => {
    // Create active and inactive POIs
    await db.insert(pointsOfInterestTable)
      .values([
        {
          name: 'Active Service',
          category: 'Layanan',
          latitude: -6.2088,
          longitude: 106.8456,
          address: 'Jl. Active No. 1',
          is_active: true
        },
        {
          name: 'Inactive Service',
          category: 'Layanan',
          latitude: -6.2090,
          longitude: 106.8460,
          address: 'Jl. Inactive No. 2',
          is_active: false
        }
      ])
      .execute();

    const input: GetPOIsByCategoryInput = {
      category: 'Layanan',
      limit: 20,
      offset: 0
    };

    const results = await getPOIsByCategory(input);

    expect(results).toHaveLength(1);
    expect(results[0].name).toEqual('Active Service');
    expect(results[0].is_active).toBe(true);
  });

  it('should apply pagination correctly', async () => {
    // Create multiple POIs in same category
    await db.insert(pointsOfInterestTable)
      .values([
        {
          name: 'Restaurant 1',
          category: 'Kuliner',
          latitude: -6.2088,
          longitude: 106.8456,
          address: 'Jl. Food No. 1',
          is_active: true
        },
        {
          name: 'Restaurant 2',
          category: 'Kuliner',
          latitude: -6.2090,
          longitude: 106.8460,
          address: 'Jl. Food No. 2',
          is_active: true
        },
        {
          name: 'Restaurant 3',
          category: 'Kuliner',
          latitude: -6.2092,
          longitude: 106.8464,
          address: 'Jl. Food No. 3',
          is_active: true
        }
      ])
      .execute();

    // Test limit
    const limitInput: GetPOIsByCategoryInput = {
      category: 'Kuliner',
      limit: 2,
      offset: 0
    };

    const limitResults = await getPOIsByCategory(limitInput);
    expect(limitResults).toHaveLength(2);

    // Test offset
    const offsetInput: GetPOIsByCategoryInput = {
      category: 'Kuliner',
      limit: 2,
      offset: 1
    };

    const offsetResults = await getPOIsByCategory(offsetInput);
    expect(offsetResults).toHaveLength(2);
    expect(offsetResults[0].name).not.toEqual(limitResults[0].name);
  });

  it('should return empty array for category with no POIs', async () => {
    const input: GetPOIsByCategoryInput = {
      category: 'Wisata',
      limit: 20,
      offset: 0
    };

    const results = await getPOIsByCategory(input);

    expect(results).toHaveLength(0);
    expect(results).toEqual([]);
  });

  it('should handle numeric field conversions correctly', async () => {
    await db.insert(pointsOfInterestTable)
      .values({
        name: 'Test POI',
        category: 'Layanan',
        latitude: -6.2088,
        longitude: 106.8456,
        address: 'Test Address',
        rating: 3.75,
        is_active: true
      })
      .execute();

    const input: GetPOIsByCategoryInput = {
      category: 'Layanan',
      limit: 20,
      offset: 0
    };

    const results = await getPOIsByCategory(input);

    expect(results).toHaveLength(1);
    expect(typeof results[0].latitude).toBe('number');
    expect(typeof results[0].longitude).toBe('number');
    expect(typeof results[0].rating).toBe('number');
    expect(results[0].latitude).toBeCloseTo(-6.2088, 4);
    expect(results[0].longitude).toBeCloseTo(106.8456, 4);
    expect(results[0].rating).toBeCloseTo(3.75, 2);
  });
});
