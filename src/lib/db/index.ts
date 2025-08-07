import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

const sqlite = new Database('planning_poker.db');
export const db = drizzle(sqlite, { schema });

// Run migrations on startup
try {
  migrate(db, { migrationsFolder: 'drizzle' });
  console.log('Database migrations completed successfully');
} catch (error) {
  console.error('Error running database migrations:', error);
}