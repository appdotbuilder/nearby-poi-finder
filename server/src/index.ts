
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import { 
  createPOIInputSchema, 
  updatePOIInputSchema, 
  nearbyPOIInputSchema, 
  getPOIsByCategoryInputSchema 
} from './schema';

// Import handlers
import { createPOI } from './handlers/create_poi';
import { getNearbyPOIs } from './handlers/get_nearby_pois';
import { getPOIsByCategory } from './handlers/get_pois_by_category';
import { getAllPOIs } from './handlers/get_all_pois';
import { updatePOI } from './handlers/update_poi';
import { deletePOI } from './handlers/delete_poi';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check endpoint
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Create a new point of interest
  createPOI: publicProcedure
    .input(createPOIInputSchema)
    .mutation(({ input }) => createPOI(input)),

  // Get nearby points of interest based on user location
  getNearbyPOIs: publicProcedure
    .input(nearbyPOIInputSchema)
    .query(({ input }) => getNearbyPOIs(input)),

  // Get points of interest by category
  getPOIsByCategory: publicProcedure
    .input(getPOIsByCategoryInputSchema)
    .query(({ input }) => getPOIsByCategory(input)),

  // Get all points of interest
  getAllPOIs: publicProcedure
    .query(() => getAllPOIs()),

  // Update an existing point of interest
  updatePOI: publicProcedure
    .input(updatePOIInputSchema)
    .mutation(({ input }) => updatePOI(input)),

  // Delete a point of interest
  deletePOI: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deletePOI(input.id)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
