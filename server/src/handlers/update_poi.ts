
import { db } from '../db';
import { poisTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type POI } from '../schema';

// Define the input type for updating POI
export interface UpdatePOIInput {
  id: number;
  name?: string;
  description?: string | null;
  category?: 'Layanan' | 'Kuliner' | 'Belanja' | 'Wisata';
  latitude?: number;
  longitude?: number;
  address?: string | null;
  phone?: string | null;
}

export const updatePOI = async (input: UpdatePOIInput): Promise<POI> => {
  try {
    // First, check if the POI exists
    const existingPOI = await db.select()
      .from(poisTable)
      .where(eq(poisTable.id, input.id))
      .execute();

    if (existingPOI.length === 0) {
      throw new Error(`POI with id ${input.id} not found`);
    }

    // Build update object with only provided fields
    const updateData: any = {};
    
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.latitude !== undefined) updateData.latitude = input.latitude;
    if (input.longitude !== undefined) updateData.longitude = input.longitude;
    if (input.address !== undefined) updateData.address = input.address;
    if (input.phone !== undefined) updateData.phone = input.phone;

    // Update the POI
    const result = await db.update(poisTable)
      .set(updateData)
      .where(eq(poisTable.id, input.id))
      .returning()
      .execute();

    const updatedPOI = result[0];
    
    // Convert real fields to numbers (they come back as numbers from real columns)
    return {
      ...updatedPOI,
      latitude: Number(updatedPOI.latitude),
      longitude: Number(updatedPOI.longitude)
    };
  } catch (error) {
    console.error('POI update failed:', error);
    throw error;
  }
};
