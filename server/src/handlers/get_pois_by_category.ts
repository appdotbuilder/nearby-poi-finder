
import { db } from '../db';
import { poisTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type GetPOIsByCategoryInput, type POI } from '../schema';

export const getPOIsByCategory = async (input: GetPOIsByCategoryInput): Promise<POI[]> => {
  try {
    const results = await db.select()
      .from(poisTable)
      .where(eq(poisTable.category, input.category))
      .execute();

    // No numeric conversions needed for this table - all numeric fields are real/serial
    return results;
  } catch (error) {
    console.error('Get POIs by category failed:', error);
    throw error;
  }
};
