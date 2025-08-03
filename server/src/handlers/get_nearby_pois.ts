
import { db } from '../db';
import { pointsOfInterestTable } from '../db/schema';
import { type NearbyPOIInput, type POIWithDistance } from '../schema';
import { eq, and, sql, SQL } from 'drizzle-orm';

export const getNearbyPOIs = async (input: NearbyPOIInput): Promise<POIWithDistance[]> => {
  try {
    // Build conditions array for filtering
    const conditions: SQL<unknown>[] = [];

    // Only include active POIs
    conditions.push(eq(pointsOfInterestTable.is_active, true));

    // Filter by category if specified
    if (input.category) {
      conditions.push(eq(pointsOfInterestTable.category, input.category));
    }

    // Add distance filter to WHERE clause using the Haversine formula
    conditions.push(sql`
      (6371000 * acos(
        cos(radians(${input.latitude})) * 
        cos(radians(${pointsOfInterestTable.latitude})) * 
        cos(radians(${pointsOfInterestTable.longitude}) - radians(${input.longitude})) + 
        sin(radians(${input.latitude})) * 
        sin(radians(${pointsOfInterestTable.latitude}))
      )) <= ${input.radius}
    `);

    // Build the complete query with distance calculation using Haversine formula
    const results = await db.select({
      id: pointsOfInterestTable.id,
      name: pointsOfInterestTable.name,
      description: pointsOfInterestTable.description,
      category: pointsOfInterestTable.category,
      latitude: pointsOfInterestTable.latitude,
      longitude: pointsOfInterestTable.longitude,
      address: pointsOfInterestTable.address,
      phone: pointsOfInterestTable.phone,
      website: pointsOfInterestTable.website,
      rating: pointsOfInterestTable.rating,
      image_url: pointsOfInterestTable.image_url,
      is_active: pointsOfInterestTable.is_active,
      created_at: pointsOfInterestTable.created_at,
      updated_at: pointsOfInterestTable.updated_at,
      // Haversine formula to calculate distance in meters
      distance: sql<number>`
        (6371000 * acos(
          cos(radians(${input.latitude})) * 
          cos(radians(${pointsOfInterestTable.latitude})) * 
          cos(radians(${pointsOfInterestTable.longitude}) - radians(${input.longitude})) + 
          sin(radians(${input.latitude})) * 
          sin(radians(${pointsOfInterestTable.latitude}))
        ))
      `.as('distance')
    })
    .from(pointsOfInterestTable)
    .where(and(...conditions))
    .orderBy(sql`
      (6371000 * acos(
        cos(radians(${input.latitude})) * 
        cos(radians(${pointsOfInterestTable.latitude})) * 
        cos(radians(${pointsOfInterestTable.longitude}) - radians(${input.longitude})) + 
        sin(radians(${input.latitude})) * 
        sin(radians(${pointsOfInterestTable.latitude}))
      )) ASC
    `)
    .limit(input.limit)
    .execute();

    // Convert results to proper types
    return results.map(result => ({
      ...result,
      latitude: Number(result.latitude),
      longitude: Number(result.longitude),
      rating: result.rating ? Number(result.rating) : null,
      distance: Number(result.distance)
    }));
  } catch (error) {
    console.error('Nearby POIs search failed:', error);
    throw error;
  }
};
