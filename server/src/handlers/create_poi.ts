
import { db } from '../db';
import { poisTable } from '../db/schema';
import { type CreatePOIInput, type POI } from '../schema';

export async function createPOI(input: CreatePOIInput): Promise<POI> {
  try {
    // Insert POI record
    const result = await db.insert(poisTable)
      .values({
        name: input.name,
        description: input.description,
        category: input.category,
        latitude: input.latitude,
        longitude: input.longitude,
        address: input.address,
        phone: input.phone
      })
      .returning()
      .execute();

    const poi = result[0];
    return {
      ...poi,
      // Ensure proper type conversion for coordinates (real columns)
      latitude: Number(poi.latitude),
      longitude: Number(poi.longitude)
    };
  } catch (error) {
    console.error('POI creation failed:', error);
    throw error;
  }
}
