import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';
import fs from 'fs';

// Use environment variable for database path, with fallbacks for different environments
let dbPath: string;
let migrationsPath: string;

if (process.env.NODE_ENV === 'production') {
  // Azure Web Apps - use a writeable directory
  // Azure provides /home as a persistent storage location
  dbPath = process.env.DATABASE_PATH || '/home/planning_poker.db';
  
  // Try multiple possible migration paths for production
  const possiblePaths = [
    path.join(process.cwd(), 'drizzle'),
    path.join(__dirname, '../../../drizzle'),
    path.join(__dirname, '../../drizzle'),
    path.join(__dirname, '../drizzle'),
    path.join(__dirname, 'drizzle'),
    '/home/site/wwwroot/drizzle',
    path.join(process.cwd(), 'build/standalone/drizzle'),
  ];
  
  // Find the first existing migration path
  migrationsPath = possiblePaths.find(p => {
    try {
      return fs.existsSync(p);
    } catch {
      return false;
    }
  }) || path.join(process.cwd(), 'drizzle');
  
  console.log('Checking migration paths:', possiblePaths);
  console.log('Found migration path:', migrationsPath);
} else {
  // Development
  dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'planning_poker.db');
  migrationsPath = path.join(process.cwd(), 'drizzle');
}

console.log(`Using database path: ${dbPath}`);
console.log(`Using migrations path: ${migrationsPath}`);
console.log(`Current working directory: ${process.cwd()}`);
console.log(`__dirname: ${__dirname}`);

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

// Run migrations on startup
try {
  console.log('Attempting to run migrations from:', migrationsPath);
  
  // Check if migration folder exists
  if (!fs.existsSync(migrationsPath)) {
    console.error(`Migration folder does not exist at: ${migrationsPath}`);
    
    // In production, create tables directly if migrations are not found
    if (process.env.NODE_ENV === 'production') {
      console.log('Creating tables directly without migrations...');
      
      // Create sessions table
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          session_id TEXT NOT NULL UNIQUE,
          ticket_name TEXT,
          ticket_number TEXT,
          status TEXT DEFAULT 'active' NOT NULL,
          created_at REAL NOT NULL,
          created_by TEXT NOT NULL
        )
      `);
      
      // Create participants table
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS participants (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          session_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          display_name TEXT NOT NULL,
          vote INTEGER,
          has_voted INTEGER DEFAULT 0 NOT NULL,
          joined_at REAL NOT NULL,
          FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
        )
      `);
      
      console.log('Tables created successfully');
    }
  } else {
    migrate(db, { migrationsFolder: migrationsPath });
    console.log('Database migrations completed successfully');
  }
} catch (error) {
  console.error('Error during database setup:', error);
  
  // Last resort: create tables directly
  if (process.env.NODE_ENV === 'production') {
    try {
      console.log('Attempting to create tables directly as fallback...');
      
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          session_id TEXT NOT NULL UNIQUE,
          ticket_name TEXT,
          ticket_number TEXT,
          status TEXT DEFAULT 'active' NOT NULL,
          created_at REAL NOT NULL,
          created_by TEXT NOT NULL
        )
      `);
      
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS participants (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          session_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          display_name TEXT NOT NULL,
          vote INTEGER,
          has_voted INTEGER DEFAULT 0 NOT NULL,
          joined_at REAL NOT NULL,
          FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
        )
      `);
      
      console.log('Tables created successfully via fallback');
    } catch (fallbackError) {
      console.error('Fallback table creation also failed:', fallbackError);
    }
  }
}