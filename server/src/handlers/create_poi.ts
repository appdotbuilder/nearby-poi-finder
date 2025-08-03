
import { db } from '../db';
import { pointsOfInterestTable } from '../db/schema';
import { type CreatePOIInput, type PointOfInterest } from '../schema';

export const createPOI = async (input: CreatePOIInput): Promise<PointOfInterest> => {
  try {
    // Insert POI record
    const result = await db.insert(pointsOfInterestTable)
      .values({
        name: input.name,
        description: input.description,
        category: input.category,
        latitude: input.latitude,
        longitude: input.longitude,
        address: input.address,
        phone: input.phone,
        website: input.website || null,
        rating: input.rating,
        image_url: input.image_url || null,
        is_active: input.is_active
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('POI creation failed:', error);
    throw error;
  }
};
