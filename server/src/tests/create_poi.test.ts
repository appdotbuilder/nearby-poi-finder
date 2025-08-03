
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { pointsOfInterestTable } from '../db/schema';
import { type CreatePOIInput } from '../schema';
import { createPOI } from '../handlers/create_poi';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreatePOIInput = {
  name: 'Test Restaurant',
  description: 'A great place to eat',
  category: 'Kuliner',
  latitude: -6.2088,
  longitude: 106.8456,
  address: 'Jl. Test No. 123, Jakarta',
  phone: '+62-21-12345678',
  website: 'https://test-restaurant.com',
  rating: 4.5,
  image_url: 'https://example.com/image.jpg',
  is_active: true
};

// Minimal test input with only required fields
const minimalInput: CreatePOIInput = {
  name: 'Minimal POI',
  description: null,
  category: 'Layanan',
  latitude: -6.2088,
  longitude: 106.8456,
  address: 'Jl. Minimal No. 1',
  phone: null,
  website: null,
  rating: null,
  image_url: null,
  is_active: true
};

describe('createPOI', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a POI with all fields', async () => {
    const result = await createPOI(testInput);

    // Basic field validation
    expect(result.name).toEqual('Test Restaurant');
    expect(result.description).toEqual('A great place to eat');
    expect(result.category).toEqual('Kuliner');
    expect(result.latitude).toEqual(-6.2088);
    expect(result.longitude).toEqual(106.8456);
    expect(result.address).toEqual('Jl. Test No. 123, Jakarta');
    expect(result.phone).toEqual('+62-21-12345678');
    expect(result.website).toEqual('https://test-restaurant.com');
    expect(result.rating).toEqual(4.5);
    expect(result.image_url).toEqual('https://example.com/image.jpg');
    expect(result.is_active).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a POI with minimal fields', async () => {
    const result = await createPOI(minimalInput);

    expect(result.name).toEqual('Minimal POI');
    expect(result.description).toBeNull();
    expect(result.category).toEqual('Layanan');
    expect(result.latitude).toEqual(-6.2088);
    expect(result.longitude).toEqual(106.8456);
    expect(result.address).toEqual('Jl. Minimal No. 1');
    expect(result.phone).toBeNull();
    expect(result.website).toBeNull();
    expect(result.rating).toBeNull();
    expect(result.image_url).toBeNull();
    expect(result.is_active).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save POI to database', async () => {
    const result = await createPOI(testInput);

    // Query using proper drizzle syntax
    const pois = await db.select()
      .from(pointsOfInterestTable)
      .where(eq(pointsOfInterestTable.id, result.id))
      .execute();

    expect(pois).toHaveLength(1);
    expect(pois[0].name).toEqual('Test Restaurant');
    expect(pois[0].description).toEqual('A great place to eat');
    expect(pois[0].category).toEqual('Kuliner');
    expect(pois[0].latitude).toEqual(-6.2088);
    expect(pois[0].longitude).toEqual(106.8456);
    expect(pois[0].address).toEqual('Jl. Test No. 123, Jakarta');
    expect(pois[0].phone).toEqual('+62-21-12345678');
    expect(pois[0].website).toEqual('https://test-restaurant.com');
    expect(pois[0].rating).toEqual(4.5);
    expect(pois[0].image_url).toEqual('https://example.com/image.jpg');
    expect(pois[0].is_active).toEqual(true);
    expect(pois[0].created_at).toBeInstanceOf(Date);
    expect(pois[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle empty string URLs as null', async () => {
    const inputWithEmptyUrls: CreatePOIInput = {
      ...testInput,
      website: '',
      image_url: ''
    };

    const result = await createPOI(inputWithEmptyUrls);

    expect(result.website).toBeNull();
    expect(result.image_url).toBeNull();

    // Verify in database
    const pois = await db.select()
      .from(pointsOfInterestTable)
      .where(eq(pointsOfInterestTable.id, result.id))
      .execute();

    expect(pois[0].website).toBeNull();
    expect(pois[0].image_url).toBeNull();
  });

  it('should create POIs with different categories', async () => {
    const categories = ['Layanan', 'Kuliner', 'Belanja', 'Wisata'] as const;
    
    for (const category of categories) {
      const input: CreatePOIInput = {
        ...testInput,
        name: `Test ${category}`,
        category
      };

      const result = await createPOI(input);
      expect(result.category).toEqual(category);
      expect(result.name).toEqual(`Test ${category}`);
    }
  });
});
