
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { poisTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { updatePOI, type UpdatePOIInput } from '../handlers/update_poi';

describe('updatePOI', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a POI with all fields', async () => {
    // Create a POI directly in database
    const insertResult = await db.insert(poisTable)
      .values({
        name: 'Original Restaurant',
        description: 'Original description',
        category: 'Kuliner',
        latitude: -6.2088,
        longitude: 106.8456,
        address: 'Original Address',
        phone: '+62-21-1234567'
      })
      .returning()
      .execute();

    const createdPOI = insertResult[0];

    // Update the POI
    const updateInput: UpdatePOIInput = {
      id: createdPOI.id,
      name: 'Updated Restaurant',
      description: 'Updated description',
      category: 'Belanja',
      latitude: -6.3000,
      longitude: 106.9000,
      address: 'Updated Address',
      phone: '+62-21-9876543'
    };

    const result = await updatePOI(updateInput);

    expect(result.id).toEqual(createdPOI.id);
    expect(result.name).toEqual('Updated Restaurant');
    expect(result.description).toEqual('Updated description');
    expect(result.category).toEqual('Belanja');
    expect(result.latitude).toEqual(-6.3000);
    expect(result.longitude).toEqual(106.9000);
    expect(result.address).toEqual('Updated Address');
    expect(result.phone).toEqual('+62-21-9876543');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update only provided fields', async () => {
    // Create a POI directly in database
    const insertResult = await db.insert(poisTable)
      .values({
        name: 'Original Service',
        description: 'Original description',
        category: 'Layanan',
        latitude: -6.2088,
        longitude: 106.8456,
        address: 'Original Address',
        phone: '+62-21-1234567'
      })
      .returning()
      .execute();

    const createdPOI = insertResult[0];

    // Update only name and category
    const updateInput: UpdatePOIInput = {
      id: createdPOI.id,
      name: 'Updated Service',
      category: 'Wisata'
    };

    const result = await updatePOI(updateInput);

    expect(result.id).toEqual(createdPOI.id);
    expect(result.name).toEqual('Updated Service');
    expect(result.category).toEqual('Wisata');
    // Other fields should remain unchanged
    expect(result.description).toEqual('Original description');
    expect(result.latitude).toEqual(-6.2088);
    expect(result.longitude).toEqual(106.8456);
    expect(result.address).toEqual('Original Address');
    expect(result.phone).toEqual('+62-21-1234567');
  });

  it('should update nullable fields to null', async () => {
    // Create a POI directly in database
    const insertResult = await db.insert(poisTable)
      .values({
        name: 'Service Center',
        description: 'Service description',
        category: 'Layanan',
        latitude: -6.2088,
        longitude: 106.8456,
        address: 'Service Address',
        phone: '+62-21-1234567'
      })
      .returning()
      .execute();

    const createdPOI = insertResult[0];

    // Update nullable fields to null
    const updateInput: UpdatePOIInput = {
      id: createdPOI.id,
      description: null,
      address: null,
      phone: null
    };

    const result = await updatePOI(updateInput);

    expect(result.id).toEqual(createdPOI.id);
    expect(result.name).toEqual('Service Center'); // Unchanged
    expect(result.category).toEqual('Layanan'); // Unchanged
    expect(result.description).toBeNull();
    expect(result.address).toBeNull();
    expect(result.phone).toBeNull();
  });

  it('should save updated POI to database', async () => {
    // Create a POI directly in database
    const insertResult = await db.insert(poisTable)
      .values({
        name: 'Mall Center',
        description: 'Shopping center',
        category: 'Belanja',
        latitude: -6.2088,
        longitude: 106.8456,
        address: 'Mall Address',
        phone: '+62-21-1234567'
      })
      .returning()
      .execute();

    const createdPOI = insertResult[0];

    // Update the POI
    const updateInput: UpdatePOIInput = {
      id: createdPOI.id,
      name: 'Updated Mall',
      latitude: -6.5000,
      longitude: 107.0000
    };

    await updatePOI(updateInput);

    // Verify in database
    const poisInDB = await db.select()
      .from(poisTable)
      .where(eq(poisTable.id, createdPOI.id))
      .execute();

    expect(poisInDB).toHaveLength(1);
    expect(poisInDB[0].name).toEqual('Updated Mall');
    expect(Number(poisInDB[0].latitude)).toEqual(-6.5000);
    expect(Number(poisInDB[0].longitude)).toEqual(107.0000);
    // Unchanged fields
    expect(poisInDB[0].description).toEqual('Shopping center');
    expect(poisInDB[0].category).toEqual('Belanja');
  });

  it('should throw error for non-existent POI', async () => {
    const updateInput: UpdatePOIInput = {
      id: 999999, // Non-existent ID
      name: 'Updated Name'
    };

    await expect(updatePOI(updateInput)).rejects.toThrow(/POI with id 999999 not found/i);
  });

  it('should handle coordinate validation', async () => {
    // Create a POI directly in database
    const insertResult = await db.insert(poisTable)
      .values({
        name: 'Tourist Spot',
        description: 'Beautiful place',
        category: 'Wisata',
        latitude: -6.2088,
        longitude: 106.8456,
        address: null,
        phone: null
      })
      .returning()
      .execute();

    const createdPOI = insertResult[0];

    // Update with valid coordinates
    const updateInput: UpdatePOIInput = {
      id: createdPOI.id,
      latitude: -7.7956, // Yogyakarta
      longitude: 110.3695
    };

    const result = await updatePOI(updateInput);

    expect(result.latitude).toEqual(-7.7956);
    expect(result.longitude).toEqual(110.3695);
    expect(typeof result.latitude).toBe('number');
    expect(typeof result.longitude).toBe('number');
  });
});
