import { Pool } from 'pg';
import type { PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

class Database {
  private static instance: Database;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || '5432'),
      max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'), // Maximum number of connections in the pool
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<PoolClient> {
    return this.pool.connect();
  }

  public async query(text: string, params?: any[]): Promise<any> {
    const client = await this.connect();
    try {
      return await client.query(text, params);
    } finally {
      client.release();
    }
  }

  public async begin(): Promise<PoolClient> {
    const client = await this.connect();
    await client.query('BEGIN');
    return client;
  }

  public async commit(client: PoolClient): Promise<void> {
    await client.query('COMMIT');
    client.release();
  }

  public async rollback(client: PoolClient): Promise<void> {
    await client.query('ROLLBACK');
    client.release();
  }

  public async end(): Promise<void> {
    await this.pool.end();
  }
}

const dbInstance = Database.getInstance();
export const connectDB = async (): Promise<void> => {
  try {
    await dbInstance.connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
};

export default dbInstance;