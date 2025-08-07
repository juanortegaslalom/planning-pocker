import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';

// Use environment variable for database path, with fallback
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'planning_poker.db');
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

// Run migrations on startup
try {
  const migrationsPath = path.join(process.cwd(), 'drizzle');
  migrate(db, { migrationsFolder: migrationsPath });
  console.log('Database migrations completed successfully');
} catch (error) {
  console.error('Error running database migrations:', error);
}