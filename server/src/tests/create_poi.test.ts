
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { poisTable } from '../db/schema';
import { type CreatePOIInput } from '../schema';
import { createPOI } from '../handlers/create_poi';
import { eq } from 'drizzle-orm';

// Test input for a POI
const testInput: CreatePOIInput = {
  name: 'Test Restaurant',
  description: 'A great place to eat',
  category: 'Kuliner',
  latitude: -6.2088,
  longitude: 106.8456,
  address: 'Jl. Test No. 123, Jakarta',
  phone: '+62-21-12345678'
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
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save POI to database', async () => {
    const result = await createPOI(testInput);

    // Query the database to verify data was saved
    const pois = await db.select()
      .from(poisTable)
      .where(eq(poisTable.id, result.id))
      .execute();

    expect(pois).toHaveLength(1);
    expect(pois[0].name).toEqual('Test Restaurant');
    expect(pois[0].description).toEqual('A great place to eat');
    expect(pois[0].category).toEqual('Kuliner');
    expect(Number(pois[0].latitude)).toEqual(-6.2088);
    expect(Number(pois[0].longitude)).toEqual(106.8456);
    expect(pois[0].address).toEqual('Jl. Test No. 123, Jakarta');
    expect(pois[0].phone).toEqual('+62-21-12345678');
    expect(pois[0].created_at).toBeInstanceOf(Date);
  });

  it('should create POI with nullable fields as null', async () => {
    const minimalInput: CreatePOIInput = {
      name: 'Minimal POI',
      description: null,
      category: 'Layanan',
      latitude: -6.1751,
      longitude: 106.8650,
      address: null,
      phone: null
    };

    const result = await createPOI(minimalInput);

    expect(result.name).toEqual('Minimal POI');
    expect(result.description).toBeNull();
    expect(result.category).toEqual('Layanan');
    expect(result.latitude).toEqual(-6.1751);
    expect(result.longitude).toEqual(106.8650);
    expect(result.address).toBeNull();
    expect(result.phone).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should handle different POI categories', async () => {
    const categories = ['Layanan', 'Kuliner', 'Belanja', 'Wisata'] as const;
    
    for (const category of categories) {
      const categoryInput: CreatePOIInput = {
        name: `Test ${category}`,
        description: `A test ${category} POI`,
        category: category,
        latitude: -6.2088,
        longitude: 106.8456,
        address: 'Test Address',
        phone: '+62-21-12345678'
      };

      const result = await createPOI(categoryInput);
      expect(result.category).toEqual(category);
      expect(result.name).toEqual(`Test ${category}`);
    }
  });

  it('should handle coordinate precision correctly', async () => {
    const preciseInput: CreatePOIInput = {
      name: 'Precise Location',
      description: 'A POI with precise coordinates',
      category: 'Wisata',
      latitude: -6.208763451,
      longitude: 106.845599123,
      address: 'Precise Address',
      phone: '+62-21-98765432'
    };

    const result = await createPOI(preciseInput);

    // Verify coordinates are preserved with reasonable precision
    expect(typeof result.latitude).toBe('number');
    expect(typeof result.longitude).toBe('number');
    expect(Math.abs(result.latitude - preciseInput.latitude)).toBeLessThan(0.0001);
    expect(Math.abs(result.longitude - preciseInput.longitude)).toBeLessThan(0.0001);
  });
});
