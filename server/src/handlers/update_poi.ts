
import { db } from '../db';
import { pointsOfInterestTable } from '../db/schema';
import { type UpdatePOIInput, type PointOfInterest } from '../schema';
import { eq, sql } from 'drizzle-orm';

export const updatePOI = async (input: UpdatePOIInput): Promise<PointOfInterest> => {
  try {
    // Check if POI exists
    const existingPOI = await db.select()
      .from(pointsOfInterestTable)
      .where(eq(pointsOfInterestTable.id, input.id))
      .execute();

    if (existingPOI.length === 0) {
      throw new Error(`Point of Interest with ID ${input.id} not found`);
    }

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: sql`NOW()` // Always update the timestamp
    };

    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    if (input.category !== undefined) {
      updateData.category = input.category;
    }
    if (input.latitude !== undefined) {
      updateData.latitude = input.latitude;
    }
    if (input.longitude !== undefined) {
      updateData.longitude = input.longitude;
    }
    if (input.address !== undefined) {
      updateData.address = input.address;
    }
    if (input.phone !== undefined) {
      updateData.phone = input.phone;
    }
    if (input.website !== undefined) {
      updateData.website = input.website || null; // Convert empty string to null
    }
    if (input.rating !== undefined) {
      updateData.rating = input.rating;
    }
    if (input.image_url !== undefined) {
      updateData.image_url = input.image_url || null; // Convert empty string to null
    }
    if (input.is_active !== undefined) {
      updateData.is_active = input.is_active;
    }

    // Update the POI
    const result = await db.update(pointsOfInterestTable)
      .set(updateData)
      .where(eq(pointsOfInterestTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('POI update failed:', error);
    throw error;
  }
};
