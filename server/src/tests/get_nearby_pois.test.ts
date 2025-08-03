
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { type GetNearbyPOIsInput } from '../schema';
import { getNearbyPOIs } from '../handlers/get_nearby_pois';

// Test input with Jakarta coordinates
const testInput: GetNearbyPOIsInput = {
  latitude: -6.2088,
  longitude: 106.8456,
  radius: 5000 // 5km default radius
};

describe('getNearbyPOIs', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return POIs within radius sorted by distance', async () => {
    const result = await getNearbyPOIs(testInput);

    // Should have results from all categories within 5km
    expect(result.length).toBeGreaterThan(0);
    
    // All results should be within radius
    result.forEach(poi => {
      expect(poi.distance).toBeLessThanOrEqual(5000);
    });
    
    // Results should be sorted by distance (ascending)
    for (let i = 1; i < result.length; i++) {
      expect(result[i].distance).toBeGreaterThanOrEqual(result[i - 1].distance);
    }
  });

  it('should include POIs from all four categories', async () => {
    const result = await getNearbyPOIs(testInput);
    
    const categories = new Set(result.map(poi => poi.category));
    expect(categories.size).toBeGreaterThanOrEqual(4);
    expect(categories.has('Layanan')).toBe(true);
    expect(categories.has('Kuliner')).toBe(true);
    expect(categories.has('Belanja')).toBe(true);
    expect(categories.has('Wisata')).toBe(true);
  });

  it('should have at least 2 examples per category within default radius', async () => {
    const result = await getNearbyPOIs(testInput);
    
    const categoryCount = result.reduce((acc, poi) => {
      acc[poi.category] = (acc[poi.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Each category should have at least 2 examples
    expect(categoryCount['Layanan']).toBeGreaterThanOrEqual(2);
    expect(categoryCount['Kuliner']).toBeGreaterThanOrEqual(2);
    expect(categoryCount['Belanja']).toBeGreaterThanOrEqual(2);
    expect(categoryCount['Wisata']).toBeGreaterThanOrEqual(2);
  });

  it('should filter by category when specified', async () => {
    const layananInput: GetNearbyPOIsInput = {
      ...testInput,
      category: 'Layanan'
    };
    
    const result = await getNearbyPOIs(layananInput);
    
    expect(result.length).toBeGreaterThan(0);
    result.forEach(poi => {
      expect(poi.category).toBe('Layanan');
      expect(poi.distance).toBeLessThanOrEqual(5000);
    });
    
    // Should have at least 2 Layanan POIs
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  it('should respect custom radius', async () => {
    const smallRadiusInput: GetNearbyPOIsInput = {
      ...testInput,
      radius: 500 // 500 meters only
    };
    
    const result = await getNearbyPOIs(smallRadiusInput);
    
    // All results should be within 500m
    result.forEach(poi => {
      expect(poi.distance).toBeLessThanOrEqual(500);
    });
    
    // Should have fewer results than default radius
    const defaultResult = await getNearbyPOIs(testInput);
    expect(result.length).toBeLessThan(defaultResult.length);
  });

  it('should return empty array when no POIs within radius', async () => {
    const verySmallRadiusInput: GetNearbyPOIsInput = {
      ...testInput,
      radius: 10 // Only 10 meters
    };
    
    const result = await getNearbyPOIs(verySmallRadiusInput);
    expect(result).toEqual([]);
  });

  it('should handle large radius correctly', async () => {
    const largeRadiusInput: GetNearbyPOIsInput = {
      ...testInput,
      radius: 10000 // 10km radius
    };
    
    const result = await getNearbyPOIs(largeRadiusInput);
    
    // Should include POIs that were beyond 5km default radius
    expect(result.length).toBeGreaterThan(0);
    result.forEach(poi => {
      expect(poi.distance).toBeLessThanOrEqual(10000);
    });
    
    // Should have more results than default radius
    const defaultResult = await getNearbyPOIs(testInput);
    expect(result.length).toBeGreaterThanOrEqual(defaultResult.length);
  });

  it('should return POI with distance properties', async () => {
    const result = await getNearbyPOIs(testInput);
    
    expect(result.length).toBeGreaterThan(0);
    
    const firstPOI = result[0];
    expect(firstPOI.id).toBeDefined();
    expect(firstPOI.name).toBeDefined();
    expect(firstPOI.category).toBeDefined();
    expect(firstPOI.latitude).toBeDefined();
    expect(firstPOI.longitude).toBeDefined();
    expect(firstPOI.distance).toBeDefined();
    expect(typeof firstPOI.distance).toBe('number');
    expect(firstPOI.created_at).toBeInstanceOf(Date);
  });

  it('should vary distances based on input coordinates', async () => {
    // Test with different coordinates
    const differentInput: GetNearbyPOIsInput = {
      latitude: -6.2000,
      longitude: 106.8300,
      radius: 5000
    };
    
    const originalResult = await getNearbyPOIs(testInput);
    const differentResult = await getNearbyPOIs(differentInput);
    
    // Results should have different distances due to coordinate variation
    expect(originalResult.length).toBeGreaterThan(0);
    expect(differentResult.length).toBeGreaterThan(0);
    
    // At least some distances should be different
    let hasDifferentDistances = false;
    for (let i = 0; i < Math.min(originalResult.length, differentResult.length); i++) {
      if (originalResult[i].distance !== differentResult[i].distance) {
        hasDifferentDistances = true;
        break;
      }
    }
    expect(hasDifferentDistances).toBe(true);
  });
});
