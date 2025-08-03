
import { z } from 'zod';

// Point of Interest category enum
export const poiCategorySchema = z.enum(['Layanan', 'Kuliner', 'Belanja', 'Wisata']);
export type POICategory = z.infer<typeof poiCategorySchema>;

// Point of Interest schema
export const pointOfInterestSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  category: poiCategorySchema,
  latitude: z.number(),
  longitude: z.number(),
  address: z.string(),
  phone: z.string().nullable(),
  website: z.string().nullable(),
  rating: z.number().nullable(),
  image_url: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type PointOfInterest = z.infer<typeof pointOfInterestSchema>;

// Input schema for creating points of interest
export const createPOIInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable(),
  category: poiCategorySchema,
  latitude: z.number().min(-90).max(90, "Invalid latitude"),
  longitude: z.number().min(-180).max(180, "Invalid longitude"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().nullable(),
  website: z.string().url().nullable().or(z.literal("")),
  rating: z.number().min(0).max(5).nullable(),
  image_url: z.string().url().nullable().or(z.literal("")),
  is_active: z.boolean().default(true)
});

export type CreatePOIInput = z.infer<typeof createPOIInputSchema>;

// Input schema for updating points of interest
export const updatePOIInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  category: poiCategorySchema.optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  address: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
  website: z.string().url().nullable().or(z.literal("")).optional(),
  rating: z.number().min(0).max(5).nullable().optional(),
  image_url: z.string().url().nullable().or(z.literal("")).optional(),
  is_active: z.boolean().optional()
});

export type UpdatePOIInput = z.infer<typeof updatePOIInputSchema>;

// Input schema for nearby POI search
export const nearbyPOIInputSchema = z.object({
  latitude: z.number().min(-90).max(90, "Invalid latitude"),
  longitude: z.number().min(-180).max(180, "Invalid longitude"),
  radius: z.number().positive().default(5000), // Default 5km radius in meters
  category: poiCategorySchema.optional(),
  limit: z.number().int().positive().max(100).default(20)
});

export type NearbyPOIInput = z.infer<typeof nearbyPOIInputSchema>;

// POI with distance for nearby searches
export const poiWithDistanceSchema = pointOfInterestSchema.extend({
  distance: z.number() // Distance in meters
});

export type POIWithDistance = z.infer<typeof poiWithDistanceSchema>;

// Input schema for getting POIs by category
export const getPOIsByCategoryInputSchema = z.object({
  category: poiCategorySchema,
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0)
});

export type GetPOIsByCategoryInput = z.infer<typeof getPOIsByCategoryInputSchema>;
