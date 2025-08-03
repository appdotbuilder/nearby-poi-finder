
import { db } from '../db';
import { poisTable } from '../db/schema';
import { type POI } from '../schema';

export const getAllPOIs = async (): Promise<POI[]> => {
  try {
    const results = await db.select()
      .from(poisTable)
      .execute();

    // Convert real (float) fields - latitude and longitude are already numbers from real type
    return results.map(poi => ({
      ...poi,
      // No conversion needed for real type fields - they're already numbers
    }));
  } catch (error) {
    console.error('Get all POIs failed:', error);
    throw error;
  }
};
