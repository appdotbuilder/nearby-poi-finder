
import { db } from '../db';
import { pointsOfInterestTable } from '../db/schema';
import { type GetPOIsByCategoryInput, type PointOfInterest } from '../schema';
import { eq, and } from 'drizzle-orm';

export const getPOIsByCategory = async (input: GetPOIsByCategoryInput): Promise<PointOfInterest[]> => {
  try {
    // Build base query with category and active filters
    const query = db.select()
      .from(pointsOfInterestTable)
      .where(
        and(
          eq(pointsOfInterestTable.category, input.category),
          eq(pointsOfInterestTable.is_active, true)
        )
      )
      .limit(input.limit)
      .offset(input.offset);

    const results = await query.execute();

    // Convert numeric fields back to numbers (latitude, longitude, rating are stored as real/float)
    return results.map(poi => ({
      ...poi,
      latitude: typeof poi.latitude === 'string' ? parseFloat(poi.latitude) : poi.latitude,
      longitude: typeof poi.longitude === 'string' ? parseFloat(poi.longitude) : poi.longitude,
      rating: poi.rating && typeof poi.rating === 'string' ? parseFloat(poi.rating) : poi.rating
    }));
  } catch (error) {
    console.error('Failed to get POIs by category:', error);
    throw error;
  }
};
