import path       from 'node:path';
import { defineConfig } from 'prisma/config';
import { Pool }         from 'pg';
import { PrismaPg }     from '@prisma/adapter-pg';

// Prisma charge .env automatiquement — DATABASE_URL et DIRECT_URL sont disponibles ici

export default defineConfig({
  schemaPath: path.join(import.meta.dirname, 'prisma', 'schema.prisma'),

  // DIRECT_URL = pooler session mode (port 5432) — supporte les DDL (CREATE TABLE)
  datasource: {
    url: process.env.DIRECT_URL!,
  },

  migrate: {
    async adapter() {
      const pool = new Pool({
        connectionString: process.env.DIRECT_URL,
        ssl: { rejectUnauthorized: false },
      });
      return new PrismaPg(pool);
    },
  },
});
