
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { pointsOfInterestTable } from '../db/schema';
import { type CreatePOIInput, type UpdatePOIInput } from '../schema';
import { updatePOI } from '../handlers/update_poi';
import { eq } from 'drizzle-orm';

// Helper function to create a test POI
const createTestPOI = async (overrides: Partial<CreatePOIInput> = {}) => {
  const defaultPOI = {
    name: 'Test POI',
    description: 'A test point of interest',
    category: 'Layanan' as const,
    latitude: -6.2088,
    longitude: 106.8456,
    address: 'Test Address',
    phone: '+62-21-1234567',
    website: 'https://example.com',
    rating: 4.0,
    image_url: 'https://example.com/image.jpg',
    is_active: true,
    ...overrides
  };

  const result = await db.insert(pointsOfInterestTable)
    .values(defaultPOI)
    .returning()
    .execute();

  return result[0];
};

describe('updatePOI', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a POI with all fields', async () => {
    // Create a test POI
    const createdPOI = await createTestPOI();

    const updateInput: UpdatePOIInput = {
      id: createdPOI.id,
      name: 'Updated POI Name',
      description: 'Updated description',
      category: 'Kuliner',
      latitude: -6.9175,
      longitude: 107.6191,
      address: 'Updated Address',
      phone: '+62-22-9876543',
      website: 'https://updated-example.com',
      rating: 4.5,
      image_url: 'https://updated-example.com/image.jpg',
      is_active: false
    };

    const result = await updatePOI(updateInput);

    // Verify all fields are updated
    expect(result.id).toEqual(createdPOI.id);
    expect(result.name).toEqual('Updated POI Name');
    expect(result.description).toEqual('Updated description');
    expect(result.category).toEqual('Kuliner');
    expect(result.latitude).toEqual(-6.9175);
    expect(result.longitude).toEqual(107.6191);
    expect(result.address).toEqual('Updated Address');
    expect(result.phone).toEqual('+62-22-9876543');
    expect(result.website).toEqual('https://updated-example.com');
    expect(result.rating).toEqual(4.5);
    expect(result.image_url).toEqual('https://updated-example.com/image.jpg');
    expect(result.is_active).toEqual(false);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(createdPOI.updated_at.getTime());
  });

  it('should update only provided fields', async () => {
    // Create a test POI
    const createdPOI = await createTestPOI({
      name: 'Original Name',
      description: 'Original description',
      category: 'Layanan'
    });

    const updateInput: UpdatePOIInput = {
      id: createdPOI.id,
      name: 'Updated Name Only',
      rating: 5.0
    };

    const result = await updatePOI(updateInput);

    // Verify only specified fields are updated
    expect(result.name).toEqual('Updated Name Only');
    expect(result.rating).toEqual(5.0);
    // Verify other fields remain unchanged
    expect(result.description).toEqual('Original description');
    expect(result.category).toEqual('Layanan');
    expect(result.latitude).toEqual(-6.2088);
    expect(result.longitude).toEqual(106.8456);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(createdPOI.updated_at.getTime());
  });

  it('should handle null values correctly', async () => {
    // Create a test POI with non-null optional fields
    const createdPOI = await createTestPOI({
      description: 'Original description',
      phone: '+62-21-1234567',
      website: 'https://example.com',
      rating: 4.0,
      image_url: 'https://example.com/image.jpg'
    });

    const updateInput: UpdatePOIInput = {
      id: createdPOI.id,
      description: null,
      phone: null,
      website: null,
      rating: null,
      image_url: null
    };

    const result = await updatePOI(updateInput);

    // Verify fields are set to null
    expect(result.description).toBeNull();
    expect(result.phone).toBeNull();
    expect(result.website).toBeNull();
    expect(result.rating).toBeNull();
    expect(result.image_url).toBeNull();
  });

  it('should handle empty strings for URL fields', async () => {
    // Create a test POI
    const createdPOI = await createTestPOI({
      website: 'https://example.com',
      image_url: 'https://example.com/image.jpg'
    });

    const updateInput: UpdatePOIInput = {
      id: createdPOI.id,
      website: '',
      image_url: ''
    };

    const result = await updatePOI(updateInput);

    // Verify empty strings are converted to null
    expect(result.website).toBeNull();
    expect(result.image_url).toBeNull();
  });

  it('should save updated POI to database', async () => {
    // Create a test POI
    const createdPOI = await createTestPOI();

    const updateInput: UpdatePOIInput = {
      id: createdPOI.id,
      name: 'Database Updated Name',
      category: 'Wisata'
    };

    await updatePOI(updateInput);

    // Query database directly to verify update
    const updatedPOI = await db.select()
      .from(pointsOfInterestTable)
      .where(eq(pointsOfInterestTable.id, createdPOI.id))
      .execute();

    expect(updatedPOI).toHaveLength(1);
    expect(updatedPOI[0].name).toEqual('Database Updated Name');
    expect(updatedPOI[0].category).toEqual('Wisata');
    expect(updatedPOI[0].updated_at).toBeInstanceOf(Date);
    expect(updatedPOI[0].updated_at.getTime()).toBeGreaterThan(createdPOI.updated_at.getTime());
  });

  it('should throw error when POI does not exist', async () => {
    const updateInput: UpdatePOIInput = {
      id: 99999, // Non-existent ID
      name: 'This should fail'
    };

    await expect(updatePOI(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should update with coordinate boundary values', async () => {
    // Create a test POI
    const createdPOI = await createTestPOI();

    const updateInput: UpdatePOIInput = {
      id: createdPOI.id,
      latitude: -90, // Minimum latitude
      longitude: 180 // Maximum longitude
    };

    const result = await updatePOI(updateInput);

    expect(result.latitude).toEqual(-90);
    expect(result.longitude).toEqual(180);
  });
});
