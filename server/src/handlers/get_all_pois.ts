
import { db } from '../db';
import { pointsOfInterestTable } from '../db/schema';
import { type PointOfInterest } from '../schema';
import { eq } from 'drizzle-orm';

export const getAllPOIs = async (): Promise<PointOfInterest[]> => {
  try {
    // Fetch all active points of interest from the database
    const results = await db.select()
      .from(pointsOfInterestTable)
      .where(eq(pointsOfInterestTable.is_active, true))
      .execute();

    // Convert numeric fields back to numbers
    return results.map(poi => ({
      ...poi,
      latitude: parseFloat(poi.latitude?.toString() || '0'),
      longitude: parseFloat(poi.longitude?.toString() || '0'),
      rating: poi.rating ? parseFloat(poi.rating.toString()) : null
    }));
  } catch (error) {
    console.error('Failed to fetch POIs:', error);
    throw error;
  }
};
