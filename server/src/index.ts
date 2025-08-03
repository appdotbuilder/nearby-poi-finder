
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schema types
import { 
  createPOIInputSchema, 
  getNearbyPOIsInputSchema, 
  getPOIsByCategoryInputSchema 
} from './schema';

// Import handlers
import { createPOI } from './handlers/create_poi';
import { getNearbyPOIs } from './handlers/get_nearby_pois';
import { getPOIsByCategory } from './handlers/get_pois_by_category';
import { getAllPOIs } from './handlers/get_all_pois';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Create a new POI
  createPOI: publicProcedure
    .input(createPOIInputSchema)
    .mutation(({ input }) => createPOI(input)),
  
  // Get nearby POIs with optional filtering by category and radius
  getNearbyPOIs: publicProcedure
    .input(getNearbyPOIsInputSchema)
    .query(({ input }) => getNearbyPOIs(input)),
  
  // Get all POIs in a specific category
  getPOIsByCategory: publicProcedure
    .input(getPOIsByCategoryInputSchema)
    .query(({ input }) => getPOIsByCategory(input)),
  
  // Get all POIs regardless of category
  getAllPOIs: publicProcedure
    .query(() => getAllPOIs()),
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
