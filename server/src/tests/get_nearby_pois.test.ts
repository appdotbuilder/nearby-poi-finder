
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { pointsOfInterestTable } from '../db/schema';
import { type NearbyPOIInput } from '../schema';
import { getNearbyPOIs } from '../handlers/get_nearby_pois';

// Test location: Jakarta city center
const testInput: NearbyPOIInput = {
  latitude: -6.2088,
  longitude: 106.8456,
  radius: 5000, // 5km
  limit: 20
};

describe('getNearbyPOIs', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should find nearby POIs within radius', async () => {
    // Create test POIs at different distances
    await db.insert(pointsOfInterestTable).values([
      {
        name: 'Nearby Restaurant',
        description: 'Close restaurant',
        category: 'Kuliner',
        latitude: -6.2090, // Very close (~22m)
        longitude: 106.8458,
        address: 'Jl. Test No. 1',
        is_active: true
      },
      {
        name: 'Distant Shop',
        description: 'Far away shop',
        category: 'Belanja',
        latitude: -6.3000, // Far away (~10km)
        longitude: 106.9000,
        address: 'Jl. Far No. 2',
        is_active: true
      },
      {
        name: 'Medium Distance Service',
        description: 'Medium distance service',
        category: 'Layanan',
        latitude: -6.2200, // Medium distance (~1.2km)
        longitude: 106.8500,
        address: 'Jl. Medium No. 3',
        is_active: true
      }
    ]).execute();

    const result = await getNearbyPOIs(testInput);

    // Should return only POIs within 5km radius
    expect(result.length).toBe(2);
    
    // Results should be sorted by distance
    expect(result[0].name).toBe('Nearby Restaurant');
    expect(result[1].name).toBe('Medium Distance Service');

    // Check distance values are reasonable
    expect(result[0].distance).toBeLessThan(100); // Very close
    expect(result[1].distance).toBeLessThan(2000); // Medium distance
    
    // All results should have distance property
    result.forEach(poi => {
      expect(typeof poi.distance).toBe('number');
      expect(poi.distance).toBeLessThanOrEqual(testInput.radius);
    });
  });

  it('should filter by category when specified', async () => {
    // Create POIs of different categories
    await db.insert(pointsOfInterestTable).values([
      {
        name: 'Restaurant A',
        description: 'Food place',
        category: 'Kuliner',
        latitude: -6.2090,
        longitude: 106.8458,
        address: 'Jl. Food No. 1',
        is_active: true
      },
      {
        name: 'Shop B',
        description: 'Shopping place',
        category: 'Belanja',
        latitude: -6.2095,
        longitude: 106.8460,
        address: 'Jl. Shop No. 2',
        is_active: true
      },
      {
        name: 'Restaurant C',
        description: 'Another food place',
        category: 'Kuliner',
        latitude: -6.2100,
        longitude: 106.8465,
        address: 'Jl. Food No. 3',
        is_active: true
      }
    ]).execute();

    const inputWithCategory: NearbyPOIInput = {
      ...testInput,
      category: 'Kuliner'
    };

    const result = await getNearbyPOIs(inputWithCategory);

    // Should return only Kuliner POIs
    expect(result.length).toBe(2);
    result.forEach(poi => {
      expect(poi.category).toBe('Kuliner');
    });
  });

  it('should respect limit parameter', async () => {
    // Create multiple POIs within radius
    const poisToCreate = Array.from({ length: 15 }, (_, i) => ({
      name: `POI ${i + 1}`,
      description: `Description ${i + 1}`,
      category: 'Layanan' as const,
      latitude: -6.2088 + (i * 0.001), // Spread them out slightly
      longitude: 106.8456 + (i * 0.001),
      address: `Jl. Test No. ${i + 1}`,
      is_active: true
    }));

    await db.insert(pointsOfInterestTable).values(poisToCreate).execute();

    const inputWithLimit: NearbyPOIInput = {
      ...testInput,
      limit: 5
    };

    const result = await getNearbyPOIs(inputWithLimit);

    expect(result.length).toBe(5);
  });

  it('should only return active POIs', async () => {
    // Create both active and inactive POIs
    await db.insert(pointsOfInterestTable).values([
      {
        name: 'Active POI',
        description: 'This is active',
        category: 'Layanan',
        latitude: -6.2090,
        longitude: 106.8458,
        address: 'Jl. Active No. 1',
        is_active: true
      },
      {
        name: 'Inactive POI',
        description: 'This is inactive',
        category: 'Layanan',
        latitude: -6.2095,
        longitude: 106.8460,
        address: 'Jl. Inactive No. 2',
        is_active: false
      }
    ]).execute();

    const result = await getNearbyPOIs(testInput);

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Active POI');
    expect(result[0].is_active).toBe(true);
  });

  it('should return empty array when no POIs within radius', async () => {
    // Create POI far outside the radius
    await db.insert(pointsOfInterestTable).values({
      name: 'Very Far POI',
      description: 'Too far away',
      category: 'Layanan',
      latitude: -7.0000, // Very far (~88km)
      longitude: 107.0000,
      address: 'Jl. Far Away No. 1',
      is_active: true
    }).execute();

    const result = await getNearbyPOIs(testInput);

    expect(result.length).toBe(0);
  });

  it('should handle real coordinate values correctly', async () => {
    // Create POI with real coordinates
    await db.insert(pointsOfInterestTable).values({
      name: 'Test POI',
      description: 'Real coordinate test',
      category: 'Wisata',
      latitude: -6.2088,
      longitude: 106.8456,
      address: 'Jl. Real No. 1',
      rating: 4.5,
      is_active: true
    }).execute();

    const result = await getNearbyPOIs(testInput);

    expect(result.length).toBe(1);
    expect(typeof result[0].latitude).toBe('number');
    expect(typeof result[0].longitude).toBe('number');
    expect(typeof result[0].rating).toBe('number');
    expect(result[0].distance).toBeLessThan(10); // Should be very close (same coordinates)
  });
});
