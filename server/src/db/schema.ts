
import { serial, text, pgTable, timestamp, real, pgEnum } from 'drizzle-orm/pg-core';

// Define POI category enum
export const poiCategoryEnum = pgEnum('poi_category', ['Layanan', 'Kuliner', 'Belanja', 'Wisata']);

export const poisTable = pgTable('pois', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'), // Nullable by default
  category: poiCategoryEnum('category').notNull(),
  latitude: real('latitude').notNull(), // Use real for geographic coordinates
  longitude: real('longitude').notNull(), // Use real for geographic coordinates
  address: text('address'), // Nullable by default
  phone: text('phone'), // Nullable by default
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript type for the table schema
export type POI = typeof poisTable.$inferSelect; // For SELECT operations
export type NewPOI = typeof poisTable.$inferInsert; // For INSERT operations

// Important: Export all tables and relations for proper query building
export const tables = { pois: poisTable };
