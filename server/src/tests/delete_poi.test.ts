
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { poisTable } from '../db/schema';
import { type CreatePOIInput } from '../schema';
import { deletePOI } from '../handlers/delete_poi';
import { eq } from 'drizzle-orm';

// Test data for creating POIs
const testPOI: CreatePOIInput = {
  name: 'Test Restaurant',
  description: 'A restaurant for testing',
  category: 'Kuliner',
  latitude: -6.2088,
  longitude: 106.8456,
  address: '123 Test Street',
  phone: '+62123456789'
};

describe('deletePOI', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing POI', async () => {
    // Create a POI first
    const createResult = await db.insert(poisTable)
      .values({
        name: testPOI.name,
        description: testPOI.description,
        category: testPOI.category,
        latitude: testPOI.latitude,
        longitude: testPOI.longitude,
        address: testPOI.address,
        phone: testPOI.phone
      })
      .returning()
      .execute();

    const createdPOI = createResult[0];

    // Delete the POI
    const result = await deletePOI(createdPOI.id);

    // Verify deletion was successful
    expect(result.success).toBe(true);

    // Verify POI no longer exists in database
    const pois = await db.select()
      .from(poisTable)
      .where(eq(poisTable.id, createdPOI.id))
      .execute();

    expect(pois).toHaveLength(0);
  });

  it('should throw error when trying to delete non-existent POI', async () => {
    const nonExistentId = 99999;

    // Attempt to delete non-existent POI
    await expect(deletePOI(nonExistentId))
      .rejects
      .toThrow(/POI not found/i);
  });

  it('should not affect other POIs when deleting one', async () => {
    // Create multiple POIs
    const poi1Data = { ...testPOI, name: 'POI 1' };
    const poi2Data = { ...testPOI, name: 'POI 2', category: 'Wisata' as const };

    const createResults = await db.insert(poisTable)
      .values([
        {
          name: poi1Data.name,
          description: poi1Data.description,
          category: poi1Data.category,
          latitude: poi1Data.latitude,
          longitude: poi1Data.longitude,
          address: poi1Data.address,
          phone: poi1Data.phone
        },
        {
          name: poi2Data.name,
          description: poi2Data.description,
          category: poi2Data.category,
          latitude: poi2Data.latitude,
          longitude: poi2Data.longitude,
          address: poi2Data.address,
          phone: poi2Data.phone
        }
      ])
      .returning()
      .execute();

    const [poi1, poi2] = createResults;

    // Delete first POI
    const result = await deletePOI(poi1.id);
    expect(result.success).toBe(true);

    // Verify first POI is deleted
    const deletedPOIs = await db.select()
      .from(poisTable)
      .where(eq(poisTable.id, poi1.id))
      .execute();
    expect(deletedPOIs).toHaveLength(0);

    // Verify second POI still exists
    const remainingPOIs = await db.select()
      .from(poisTable)
      .where(eq(poisTable.id, poi2.id))
      .execute();
    expect(remainingPOIs).toHaveLength(1);
    expect(remainingPOIs[0].name).toEqual('POI 2');
  });

  it('should handle deletion with valid ID data types', async () => {
    // Create a POI
    const createResult = await db.insert(poisTable)
      .values({
        name: testPOI.name,
        description: testPOI.description,
        category: testPOI.category,
        latitude: testPOI.latitude,
        longitude: testPOI.longitude,
        address: testPOI.address,
        phone: testPOI.phone
      })
      .returning()
      .execute();

    const createdPOI = createResult[0];

    // Verify ID is a number
    expect(typeof createdPOI.id).toBe('number');

    // Delete using the numeric ID
    const result = await deletePOI(createdPOI.id);
    expect(result.success).toBe(true);

    // Verify deletion
    const pois = await db.select()
      .from(poisTable)
      .where(eq(poisTable.id, createdPOI.id))
      .execute();
    expect(pois).toHaveLength(0);
  });
});
