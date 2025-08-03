
import { db } from '../db';
import { pointsOfInterestTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deletePOI = async (id: number): Promise<{ success: boolean }> => {
  try {
    // Check if POI exists first
    const existingPOI = await db.select()
      .from(pointsOfInterestTable)
      .where(eq(pointsOfInterestTable.id, id))
      .execute();

    if (existingPOI.length === 0) {
      throw new Error(`Point of Interest with ID ${id} not found`);
    }

    // Soft delete - set is_active to false
    const result = await db.update(pointsOfInterestTable)
      .set({ 
        is_active: false,
        updated_at: new Date()
      })
      .where(eq(pointsOfInterestTable.id, id))
      .returning()
      .execute();

    return { success: result.length > 0 };
  } catch (error) {
    console.error('POI deletion failed:', error);
    throw error;
  }
};
