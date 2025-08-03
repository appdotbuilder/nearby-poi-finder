
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { pointsOfInterestTable } from '../db/schema';
import { type CreatePOIInput } from '../schema';
import { getAllPOIs } from '../handlers/get_all_pois';

// Test data for POIs
const testPOIs: CreatePOIInput[] = [
  {
    name: 'Rumah Sakit Umum',
    description: 'Layanan kesehatan 24 jam',
    category: 'Layanan',
    latitude: -6.2088,
    longitude: 106.8456,
    address: 'Jl. Kesehatan No. 123',
    phone: '+62-21-1234567',
    website: null,
    rating: 4.5,
    image_url: null,
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
    website: null,
    rating: 4.2,
    image_url: null,
    is_active: true
  },
  {
    name: 'Minimarket Tutup',
    description: 'Toko yang sudah tutup',
    category: 'Belanja',
    latitude: -6.2085,
    longitude: 106.8475,
    address: 'Jl. Belanja Raya No. 78',
    phone: null,
    website: null,
    rating: null,
    image_url: null,
    is_active: false // This POI is inactive
  }
];

describe('getAllPOIs', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all active POIs', async () => {
    // Insert test data - keep numeric fields as numbers
    await db.insert(pointsOfInterestTable)
      .values(testPOIs)
      .execute();

    const result = await getAllPOIs();

    // Should only return active POIs (2 out of 3)
    expect(result).toHaveLength(2);
    
    // Verify all returned POIs are active
    result.forEach(poi => {
      expect(poi.is_active).toBe(true);
    });

    // Check specific POIs
    const hospital = result.find(poi => poi.name === 'Rumah Sakit Umum');
    expect(hospital).toBeDefined();
    expect(hospital!.category).toBe('Layanan');
    expect(typeof hospital!.latitude).toBe('number');
    expect(typeof hospital!.longitude).toBe('number');
    expect(typeof hospital!.rating).toBe('number');
    expect(hospital!.rating).toBe(4.5);

    const restaurant = result.find(poi => poi.name === 'Warung Nasi Padang');
    expect(restaurant).toBeDefined();
    expect(restaurant!.category).toBe('Kuliner');

    // Inactive POI should not be returned
    const inactivePOI = result.find(poi => poi.name === 'Minimarket Tutup');
    expect(inactivePOI).toBeUndefined();
  });

  it('should return empty array when no active POIs exist', async () => {
    // Insert only inactive POI
    await db.insert(pointsOfInterestTable)
      .values([{
        name: 'Inactive POI',
        description: 'This is inactive',
        category: 'Wisata',
        latitude: -6.2088,
        longitude: 106.8456,
        address: 'Some address',
        phone: null,
        website: null,
        rating: null,
        image_url: null,
        is_active: false
      }])
      .execute();

    const result = await getAllPOIs();

    expect(result).toHaveLength(0);
  });

  it('should handle POIs with null numeric values correctly', async () => {
    // Insert POI with null rating
    await db.insert(pointsOfInterestTable)
      .values([{
        name: 'POI with null rating',
        description: 'Testing null values',
        category: 'Belanja',
        latitude: -6.2088,
        longitude: 106.8456,
        address: 'Test address',
        phone: null,
        website: null,
        rating: null,
        image_url: null,
        is_active: true
      }])
      .execute();

    const result = await getAllPOIs();

    expect(result).toHaveLength(1);
    expect(result[0].rating).toBeNull();
    expect(typeof result[0].latitude).toBe('number');
    expect(typeof result[0].longitude).toBe('number');
  });

  it('should return POIs with correct data types', async () => {
    // Insert test POI
    await db.insert(pointsOfInterestTable)
      .values([{
        name: 'Type Test POI',
        description: 'Testing data types',
        category: 'Wisata',
        latitude: -6.2088,
        longitude: 106.8456,
        address: 'Test address',
        phone: '+62-21-1234567',
        website: 'https://example.com',
        rating: 4.7,
        image_url: 'https://example.com/image.jpg',
        is_active: true
      }])
      .execute();

    const result = await getAllPOIs();

    expect(result).toHaveLength(1);
    const poi = result[0];

    // Verify data types
    expect(typeof poi.id).toBe('number');
    expect(typeof poi.name).toBe('string');
    expect(typeof poi.description).toBe('string');
    expect(typeof poi.category).toBe('string');
    expect(typeof poi.latitude).toBe('number');
    expect(typeof poi.longitude).toBe('number');
    expect(typeof poi.address).toBe('string');
    expect(typeof poi.phone).toBe('string');
    expect(typeof poi.website).toBe('string');
    expect(typeof poi.rating).toBe('number');
    expect(typeof poi.image_url).toBe('string');
    expect(typeof poi.is_active).toBe('boolean');
    expect(poi.created_at).toBeInstanceOf(Date);
    expect(poi.updated_at).toBeInstanceOf(Date);
  });
});
