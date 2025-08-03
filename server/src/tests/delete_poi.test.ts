
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { pointsOfInterestTable } from '../db/schema';
import { type CreatePOIInput } from '../schema';
import { deletePOI } from '../handlers/delete_poi';
import { eq } from 'drizzle-orm';

// Test POI data
const testPOI: CreatePOIInput = {
  name: 'Test Restaurant',
  description: 'A test restaurant',
  category: 'Kuliner',
  latitude: -6.2088,
  longitude: 106.8456,
  address: 'Jakarta, Indonesia',
  phone: '+62123456789',
  website: 'https://test-restaurant.com',
  rating: 4.5,
  image_url: 'https://example.com/image.jpg',
  is_active: true
};

describe('deletePOI', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should soft delete a POI successfully', async () => {
    // Create test POI first
    const createResult = await db.insert(pointsOfInterestTable)
      .values({
        name: testPOI.name,
        description: testPOI.description,
        category: testPOI.category,
        latitude: testPOI.latitude,
        longitude: testPOI.longitude,
        address: testPOI.address,
        phone: testPOI.phone,
        website: testPOI.website,
        rating: testPOI.rating,
        image_url: testPOI.image_url,
        is_active: testPOI.is_active
      })
      .returning()
      .execute();

    const createdPOI = createResult[0];

    // Delete the POI
    const result = await deletePOI(createdPOI.id);

    expect(result.success).toBe(true);

    // Verify POI is soft deleted (is_active = false)
    const deletedPOI = await db.select()
      .from(pointsOfInterestTable)
      .where(eq(pointsOfInterestTable.id, createdPOI.id))
      .execute();

    expect(deletedPOI).toHaveLength(1);
    expect(deletedPOI[0].is_active).toBe(false);
    expect(deletedPOI[0].updated_at).toBeInstanceOf(Date);
    expect(deletedPOI[0].updated_at.getTime()).toBeGreaterThan(deletedPOI[0].created_at.getTime());
  });

  it('should throw error when POI does not exist', async () => {
    const nonExistentId = 999;

    await expect(deletePOI(nonExistentId)).rejects.toThrow(/Point of Interest with ID 999 not found/i);
  });

  it('should handle already deleted POI', async () => {
    // Create test POI
    const createResult = await db.insert(pointsOfInterestTable)
      .values({
        name: testPOI.name,
        description: testPOI.description,
        category: testPOI.category,
        latitude: testPOI.latitude,
        longitude: testPOI.longitude,
        address: testPOI.address,
        phone: testPOI.phone,
        website: testPOI.website,
        rating: testPOI.rating,
        image_url: testPOI.image_url,
        is_active: false // Already inactive
      })
      .returning()
      .execute();

    const createdPOI = createResult[0];

    // Should still succeed even if already inactive
    const result = await deletePOI(createdPOI.id);

    expect(result.success).toBe(true);

    // Verify POI remains inactive
    const poi = await db.select()
      .from(pointsOfInterestTable)
      .where(eq(pointsOfInterestTable.id, createdPOI.id))
      .execute();

    expect(poi[0].is_active).toBe(false);
  });
});
