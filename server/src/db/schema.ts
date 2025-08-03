
import { serial, text, pgTable, timestamp, real, boolean, pgEnum } from 'drizzle-orm/pg-core';

// Define the POI category enum
export const poiCategoryEnum = pgEnum('poi_category', ['Layanan', 'Kuliner', 'Belanja', 'Wisata']);

export const pointsOfInterestTable = pgTable('points_of_interest', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'), // Nullable by default
  category: poiCategoryEnum('category').notNull(),
  latitude: real('latitude').notNull(), // Using real for GPS coordinates
  longitude: real('longitude').notNull(), // Using real for GPS coordinates
  address: text('address').notNull(),
  phone: text('phone'), // Nullable by default
  website: text('website'), // Nullable by default
  rating: real('rating'), // Nullable by default, 0-5 scale
  image_url: text('image_url'), // Nullable by default
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript types for the table schema
export type PointOfInterest = typeof pointsOfInterestTable.$inferSelect; // For SELECT operations
export type NewPointOfInterest = typeof pointsOfInterestTable.$inferInsert; // For INSERT operations

// Important: Export all tables for proper query building
export const tables = { pointsOfInterest: pointsOfInterestTable };
