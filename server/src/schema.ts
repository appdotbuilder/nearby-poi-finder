
import { z } from 'zod';

// POI Categories enum
export const poiCategorySchema = z.enum(['Layanan', 'Kuliner', 'Belanja', 'Wisata']);
export type POICategory = z.infer<typeof poiCategorySchema>;

// POI schema with proper numeric handling
export const poiSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  category: poiCategorySchema,
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  created_at: z.coerce.date()
});

export type POI = z.infer<typeof poiSchema>;

// Input schema for creating POIs
export const createPOIInputSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  category: poiCategorySchema,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().nullable(),
  phone: z.string().nullable()
});

export type CreatePOIInput = z.infer<typeof createPOIInputSchema>;

// Input schema for getting nearby POIs
export const getNearbyPOIsInputSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().positive().optional().default(5000), // Default 5km radius in meters
  category: poiCategorySchema.optional()
});

export type GetNearbyPOIsInput = z.infer<typeof getNearbyPOIsInputSchema>;

// Input schema for getting POIs by category
export const getPOIsByCategoryInputSchema = z.object({
  category: poiCategorySchema
});

export type GetPOIsByCategoryInput = z.infer<typeof getPOIsByCategoryInputSchema>;

// POI with distance for nearby queries
export const poiWithDistanceSchema = poiSchema.extend({
  distance: z.number() // Distance in meters
});

export type POIWithDistance = z.infer<typeof poiWithDistanceSchema>;
