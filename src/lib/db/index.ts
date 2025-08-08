import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';

// Use environment variable for database path, with fallbacks for different environments
let dbPath: string;
let migrationsPath: string;

if (process.env.NODE_ENV === 'production') {
  // Azure Web Apps - use a writeable directory
  dbPath = process.env.DATABASE_PATH || path.join(process.env.HOME || '/tmp', 'planning_poker.db');
  migrationsPath = path.join(__dirname, '../../../drizzle');
} else {
  // Development
  dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'planning_poker.db');
  migrationsPath = path.join(process.cwd(), 'drizzle');
}

console.log(`Using database path: ${dbPath}`);
console.log(`Using migrations path: ${migrationsPath}`);

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

// Run migrations on startup
try {
  migrate(db, { migrationsFolder: migrationsPath });
  console.log('Database migrations completed successfully');
} catch (error) {
  console.error('Error running database migrations:', error);
  console.error('Migration path attempted:', migrationsPath);
  
  // Try alternative migration path for production
  if (process.env.NODE_ENV === 'production') {
    try {
      const altMigrationsPath = path.join(process.cwd(), 'drizzle');
      console.log('Trying alternative migration path:', altMigrationsPath);
      migrate(db, { migrationsFolder: altMigrationsPath });
      console.log('Database migrations completed successfully with alternative path');
    } catch (altError) {
      console.error('Alternative migration path also failed:', altError);
    }
  }
}