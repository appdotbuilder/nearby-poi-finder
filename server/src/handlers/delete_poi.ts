
import { db } from '../db';
import { poisTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deletePOI = async (id: number): Promise<{ success: boolean }> => {
  try {
    // Delete the POI from the database
    const result = await db.delete(poisTable)
      .where(eq(poisTable.id, id))
      .returning()
      .execute();

    // Check if any rows were deleted
    if (result.length === 0) {
      throw new Error('POI not found');
    }

    return { success: true };
  } catch (error) {
    console.error('POI deletion failed:', error);
    throw error;
  }
};
