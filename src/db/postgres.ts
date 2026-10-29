import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import path from 'path';
import fs from 'fs';
import { createPatisserieSvgDataUri } from '../utils/imageCanvas';
import { AdminUser, Feedback, ImageSizeOption, Product, ProductCategory } from '../types';
import { hashPassword } from '../auth/security';

const { Pool } = pg;

interface QueryResult<T = any> {
  rows: T[];
}

interface SqlExecutor {
  query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
  exec(sql: string): Promise<void>;
}

let dbExecutor: SqlExecutor | null = null;
let hasLegacyPortugueseColumns = false;

async function getDb(): Promise<SqlExecutor> {
  if (dbExecutor) return dbExecutor;

  // Support external/local PostgreSQL daemon if PGHOST is set, otherwise use embedded PGlite PostgreSQL
  if (process.env.PGHOST && process.env.PGHOST.trim() !== '') {
    const pool = new Pool({
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT || 5432),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '',
      database: process.env.PGDATABASE || 'meudoce_db',
      max: 10,
      connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected PostgreSQL pool error:', err);
    });

    dbExecutor = {
      async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
        const res = await pool.query(sql, params);
        return { rows: res.rows as T[] };
      },
      async exec(sql: string): Promise<void> {
        await pool.query(sql);
      },
    };
  } else {
    const dataDir = path.resolve(process.cwd(), 'pgdata');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const pglite = new PGlite(dataDir);
    await pglite.waitReady;

    dbExecutor = {
      async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
        const res = await pglite.query<T>(sql, params);
        return { rows: res.rows };
      },
      async exec(sql: string): Promise<void> {
        await pglite.exec(sql);
      },
    };
  }

  await initializeSchemaAndSeed(dbExecutor);
  return dbExecutor;
}

const INITIAL_PRODUCTS_SEED: Array<{
  name: string;
  price: number;
  category: ProductCategory;
  imageSize: ImageSizeOption;
  description: string;
  manufacturedDate: string;
  theme: 'strawberry' | 'chocolate' | 'caramel' | 'savory' | 'coffee' | 'juice';
}> = [
  // === DOCES (CARDÁPIO 01) ===
  {
    name: 'Copos da felicidade',
    price: 15.0,
    category: 'Doces',
    imageSize: '700x900',
    description: 'Camadas generosas de brigadeiro gourmet, morangos frescos selecionados, creme belga e chantilly artesanal.',
    manufacturedDate: '2026-10-27',
    theme: 'strawberry',
  },
  {
    name: 'Bolos no pote',
    price: 15.0,
    category: 'Doces',
    imageSize: '500x500',
    description: 'Massa fofinha molhadinha intercalada com recheio cremoso de brigadeiro, ninho com morango ou prestígio.',
    manufacturedDate: '2026-10-27',
    theme: 'strawberry',
  },
  {
    name: 'Mini pudim',
    price: 12.0,
    category: 'Doces',
    imageSize: '500x500',
    description: 'Pudim de leite condensado lisinho, sem furinhos, com calda artesanal de caramelo dourado.',
    manufacturedDate: '2026-10-27',
    theme: 'caramel',
  },
  {
    name: 'Brownie Tradicional',
    price: 12.0,
    category: 'Doces',
    imageSize: '500x500',
    description: 'Casquinha crocante por fora e interior super úmido de chocolate meio amargo nobre.',
    manufacturedDate: '2026-10-27',
    theme: 'chocolate',
  },
  {
    name: 'Brownie Recheado',
    price: 15.0,
    category: 'Doces',
    imageSize: '800x800',
    description: 'Duas camadas de brownie artesanal recheadas com brigadeiro cremoso ou doce de leite caseiro.',
    manufacturedDate: '2026-10-27',
    theme: 'chocolate',
  },
  {
    name: 'Fatia Brownie',
    price: 18.0,
    category: 'Doces',
    imageSize: '700x900',
    description: 'Fatia especial de brownie com cobertura dupla de ganache, morangos frescos e raspas de chocolate.',
    manufacturedDate: '2026-10-27',
    theme: 'chocolate',
  },
  {
    name: 'Potinhos da felicidade',
    price: 10.0,
    category: 'Doces',
    imageSize: '500x500',
    description: 'Porção individual perfeita de creme de leite ninho trufado com brigadeiro de colher e frutas.',
    manufacturedDate: '2026-10-27',
    theme: 'strawberry',
  },
  {
    name: 'Docinhos',
    price: 8.0,
    category: 'Doces',
    imageSize: '500x500',
    description: 'Caixinha com docinhos artesanais enrolados na hora: brigadeiro tradicional, beijinho e ninho.',
    manufacturedDate: '2026-10-27',
    theme: 'chocolate',
  },
  {
    name: 'Pão de Mel',
    price: 10.0,
    category: 'Doces',
    imageSize: '500x500',
    description: 'Massa aromática com especiarias e mel puro, recheada com doce de leite e banhada no chocolate.',
    manufacturedDate: '2026-10-27',
    theme: 'caramel',
  },
  {
    name: 'Cone Trufado',
    price: 12.0,
    category: 'Doces',
    imageSize: '700x900',
    description: 'Casquinha crocante banhada em chocolate por dentro e por fora com recheio trufado até a ponta.',
    manufacturedDate: '2026-10-27',
    theme: 'chocolate',
  },
  {
    name: 'Coxinhas morango',
    price: 12.0,
    category: 'Doces',
    imageSize: '800x800',
    description: 'Morango inteiro fresco envolvido em brigadeiro gourmet macio e finalizado com granulado belga.',
    manufacturedDate: '2026-10-27',
    theme: 'strawberry',
  },
  {
    name: 'Bombons',
    price: 15.0,
    category: 'Doces',
    imageSize: '500x500',
    description: 'Seleção de bombons artesanais recheados com frutas frescas, uva, morango e cremes trufados.',
    manufacturedDate: '2026-10-27',
    theme: 'chocolate',
  },
  {
    name: 'Fatias',
    price: 20.0,
    category: 'Doces',
    imageSize: '800x800',
    description: 'Fatia generosa de bolo confeitado artesanal com três camadas de recheio especial do dia.',
    manufacturedDate: '2026-10-27',
    theme: 'strawberry',
  },
  {
    name: 'Pavê',
    price: 10.0,
    category: 'Doces',
    imageSize: '500x500',
    description: 'Sobremesa gelada em camadas de creme aveludado, biscoito champagne umedecido e ganache.',
    manufacturedDate: '2026-10-27',
    theme: 'caramel',
  },
  {
    name: 'Trufas',
    price: 4.5,
    category: 'Doces',
    imageSize: '500x500',
    description: 'Trufa artesanal macia nos sabores maracujá, morango, brigadeiro tradicional, coco ou limão.',
    manufacturedDate: '2026-10-27',
    theme: 'chocolate',
  },

  // === SALGADOS (CARDÁPIO 02) ===
  {
    name: 'Salgados assados',
    price: 10.0,
    category: 'Salgados',
    imageSize: '500x500',
    description: 'Salgados assados na hora com massa leve e dourada, perfeitos para acompanhar um café fresquinho.',
    manufacturedDate: '2026-10-27',
    theme: 'savory',
  },
  {
    name: 'Empada carne seca',
    price: 10.0,
    category: 'Salgados',
    imageSize: '800x800',
    description: 'Massa amanteigada que derrete na boca com recheio cremoso de carne seca desfiada e requeijão.',
    manufacturedDate: '2026-10-27',
    theme: 'savory',
  },
  {
    name: 'Empada de Frango',
    price: 10.0,
    category: 'Salgados',
    imageSize: '500x500',
    description: 'Empada artesanal recheada com peito de frango desfiado temperado com ervas frescas e catupiry.',
    manufacturedDate: '2026-10-27',
    theme: 'savory',
  },
  {
    name: 'Torta Fria de frango',
    price: 15.0,
    category: 'Salgados',
    imageSize: '700x900',
    description: 'Fatia caprichada de torta fria cremosa de frango com pão macio, patê artesanal e toque caseiro.',
    manufacturedDate: '2026-10-27',
    theme: 'savory',
  },

  // === BEBIDAS (CARDÁPIO 03) ===
  {
    name: 'Refrigerante Lata 310ml',
    price: 8.0,
    category: 'Bebidas',
    imageSize: '500x500',
    description: 'Refrigerante em lata 310ml super gelado (diversos sabores disponíveis).',
    manufacturedDate: '2026-10-27',
    theme: 'juice',
  },
  {
    name: 'Refrigerante lata 220ml',
    price: 5.0,
    category: 'Bebidas',
    imageSize: '500x500',
    description: 'Refrigerante mini lata 220ml servido bem gelado.',
    manufacturedDate: '2026-10-27',
    theme: 'juice',
  },
  {
    name: 'Suco Natural morango',
    price: 12.0,
    category: 'Bebidas',
    imageSize: '700x900',
    description: 'Suco natural batido na hora com morangos frescos selecionados, bem cremoso e refrescante.',
    manufacturedDate: '2026-10-27',
    theme: 'juice',
  },
  {
    name: 'Suco 200ml',
    price: 6.0,
    category: 'Bebidas',
    imageSize: '500x500',
    description: 'Copo de suco refrescante 200ml para acompanhar seu doce ou salgado.',
    manufacturedDate: '2026-10-27',
    theme: 'juice',
  },
  {
    name: 'Refrigerante 1,5lt',
    price: 12.0,
    category: 'Bebidas',
    imageSize: '700x900',
    description: 'Garrafa de refrigerante 1,5 litro ideal para compartilhar com a família.',
    manufacturedDate: '2026-10-27',
    theme: 'juice',
  },
  {
    name: 'Suco 1lt',
    price: 10.0,
    category: 'Bebidas',
    imageSize: '700x900',
    description: 'Jarra/garrafa de 1 litro de suco gelado preparado com frutas selecionadas.',
    manufacturedDate: '2026-10-27',
    theme: 'juice',
  },
  {
    name: 'Agua sem gás',
    price: 5.0,
    category: 'Bebidas',
    imageSize: '500x500',
    description: 'Garrafa de água mineral natural sem gás 500ml gelada.',
    manufacturedDate: '2026-10-27',
    theme: 'juice',
  },
  {
    name: 'Agua com gás',
    price: 6.0,
    category: 'Bebidas',
    imageSize: '500x500',
    description: 'Garrafa de água mineral gaseificada 500ml bem gelada, perfeita antes do café expresso.',
    manufacturedDate: '2026-10-27',
    theme: 'juice',
  },
  {
    name: 'Café coado',
    price: 5.0,
    category: 'Bebidas',
    imageSize: '500x500',
    description: 'Café coado na hora, encorpado e aromático, servido quentinho.',
    manufacturedDate: '2026-10-27',
    theme: 'coffee',
  },
  {
    name: 'Café expresso',
    price: 7.0,
    category: 'Bebidas',
    imageSize: '500x500',
    description: 'Expresso tirado na pressão ideal com crema aveludada e grãos selecionados.',
    manufacturedDate: '2026-10-27',
    theme: 'coffee',
  },
  {
    name: 'Capuccino',
    price: 10.0,
    category: 'Bebidas',
    imageSize: '800x800',
    description: 'Capuccino cremoso com toque de cacau, canela e leite vaporizado.',
    manufacturedDate: '2026-10-27',
    theme: 'coffee',
  },
  {
    name: 'Chocolate quente',
    price: 18.0,
    category: 'Bebidas',
    imageSize: '800x800',
    description: 'Chocolate quente espesso estilo europeu preparado com chocolate nobre e finalizado com chantilly.',
    manufacturedDate: '2026-10-27',
    theme: 'coffee',
  },
  {
    name: 'Café com Leite',
    price: 7.0,
    category: 'Bebidas',
    imageSize: '500x500',
    description: 'Clássico café com leite vaporizado quentinho, suave e reconfortante.',
    manufacturedDate: '2026-10-27',
    theme: 'coffee',
  },
];

const INITIAL_FEEDBACKS_SEED = [
  {
    authorName: 'Camila Rodrigues',
    rating: 5,
    comment: 'O Copo da Felicidade e a Coxinha de Morango são simplesmente maravilhosos! Tudo super fresquinho e atendimento impecável aqui no Jardim Leblon.',
  },
  {
    authorName: 'Mariana Souza',
    rating: 5,
    comment: 'Encomendei bolo e docinhos para o aniversário da minha mãe e todos elogiaram. A empada de carne seca com um capuccino também é parada obrigatória!',
  },
  {
    authorName: 'Lucas Ferreira',
    rating: 5,
    comment: 'Melhor brownie recheado de Cuiabá! Pelo site ficou super prático olhar os preços atualizados e mandar o pedido pronto no WhatsApp.',
  },
];

async function hasMigration(executor: SqlExecutor, version: string): Promise<boolean> {
  const res = await executor.query<{ version: string }>(
    'SELECT version FROM schema_migrations WHERE version = $1',
    [version]
  );
  return res.rows.length > 0;
}

async function recordMigration(executor: SqlExecutor, version: string): Promise<void> {
  await executor.query(
    'INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT (version) DO NOTHING',
    [version]
  );
}

/**
 * Versioned, non-destructive database migration and seed runner.
 * Preserves all existing records in `products`, `feedbacks`, and `admins`.
 */
async function initializeSchemaAndSeed(executor: SqlExecutor) {
  await executor.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migration 001: Initial products and feedbacks tables
  if (!(await hasMigration(executor, '001_initial_schema'))) {
    await executor.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        image_url TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'Doces',
        image_size TEXT NOT NULL DEFAULT '500x500',
        description TEXT NOT NULL DEFAULT '',
        manufactured_date TEXT NOT NULL DEFAULT '',
        redirect_url TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS feedbacks (
        id SERIAL PRIMARY KEY,
        author_name TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await recordMigration(executor, '001_initial_schema');
  }

  // Migration 002: Administrator accounts table for authentication & authorization
  if (!(await hasMigration(executor, '002_create_admins_table'))) {
    await executor.exec(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await recordMigration(executor, '002_create_admins_table');
  }

  // Detect whether `products` has legacy Portuguese columns (`nome`, `preco`, etc.)
  const colsRes = await executor.query<{ column_name: string }>(
    `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products'`
  );
  const colNames = new Set(colsRes.rows.map((r) => r.column_name));
  hasLegacyPortugueseColumns = colNames.has('nome');

  // Migration 003: Reconcile legacy Portuguese columns (`nome`, `preco`, `descricao`, `imagem_url`, `data_fabricacao`)
  // with documented columns (`name`, `price`, `category`, `image_url`, `image_size`, `description`, `manufactured_date`, `redirect_url`)
  // without losing any existing records!
  if (!(await hasMigration(executor, '003_reconcile_products_schema'))) {
    await executor.exec(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS name TEXT DEFAULT '';
      ALTER TABLE products ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) DEFAULT 0;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
      ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Doces';
      ALTER TABLE products ADD COLUMN IF NOT EXISTS image_size TEXT DEFAULT '500x500';
      ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
      ALTER TABLE products ADD COLUMN IF NOT EXISTS manufactured_date TEXT DEFAULT '';
      ALTER TABLE products ADD COLUMN IF NOT EXISTS redirect_url TEXT DEFAULT '';
      ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    if (hasLegacyPortugueseColumns) {
      await executor.exec(`
        ALTER TABLE products ALTER COLUMN nome DROP NOT NULL;
        ALTER TABLE products ALTER COLUMN preco DROP NOT NULL;
        UPDATE products
        SET name = COALESCE(NULLIF(name, ''), nome, 'Doce Artesanal'),
            price = CASE WHEN price IS NULL OR price = 0 THEN COALESCE(preco, 10.00) ELSE price END,
            description = COALESCE(NULLIF(description, ''), descricao, ''),
            image_url = COALESCE(NULLIF(image_url, ''), imagem_url, ''),
            manufactured_date = COALESCE(NULLIF(manufactured_date, ''), CAST(data_fabricacao AS TEXT), '');
      `);
    }

    // Ensure any existing row without an image receives an artisanal SVG illustration
    const existingRows = await executor.query<any>('SELECT * FROM products');
    for (const row of existingRows.rows) {
      const currentImg = row.image_url || row.imagem_url || '';
      if (!currentImg || String(currentImg).trim() === '') {
        const title = row.name || row.nome || 'Doce Artesanal';
        const category = (row.category || 'Doces') as ProductCategory;
        const svgUri = createPatisserieSvgDataUri(title, category, 'strawberry');
        await executor.query(
          'UPDATE products SET image_url = $1 WHERE id = $2',
          [svgUri, row.id]
        );
      }
    }

    await recordMigration(executor, '003_reconcile_products_schema');
  }

  // Seed products only if table is completely empty
  const countRes = await executor.query<{ count: string | number }>(
    'SELECT COUNT(*) as count FROM products'
  );
  const productCount = Number(countRes.rows[0]?.count || 0);

  if (productCount === 0) {
    for (const item of INITIAL_PRODUCTS_SEED) {
      const svgUri = createPatisserieSvgDataUri(item.name, item.category, item.theme);
      await executor.query(
        `INSERT INTO products (name, price, image_url, category, image_size, description, manufactured_date, redirect_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          item.name,
          item.price,
          svgUri,
          item.category,
          item.imageSize,
          item.description,
          item.manufacturedDate,
          '',
        ]
      );
    }
  }

  // Seed feedbacks only if table is completely empty
  const fbCountRes = await executor.query<{ count: string | number }>(
    'SELECT COUNT(*) as count FROM feedbacks'
  );
  const fbCount = Number(fbCountRes.rows[0]?.count || 0);

  if (fbCount === 0) {
    for (const fb of INITIAL_FEEDBACKS_SEED) {
      await executor.query(
        `INSERT INTO feedbacks (author_name, rating, comment) VALUES ($1, $2, $3)`,
        [fb.authorName, fb.rating, fb.comment]
      );
    }
  }

  // Bootstrap initial administrator from environment variables if configured
  await bootstrapAdminFromEnv(executor);
}

async function bootstrapAdminFromEnv(executor: SqlExecutor) {
  const envUsername = process.env.ADMIN_USERNAME?.trim();
  const envPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!envUsername || !envPassword) {
    return;
  }

  const existing = await executor.query<{ id: number; username: string }>(
    'SELECT id, username FROM admins WHERE username = $1',
    [envUsername]
  );

  const passwordHash = hashPassword(envPassword);

  if (existing.rows.length === 0) {
    await executor.query(
      'INSERT INTO admins (username, password_hash) VALUES ($1, $2)',
      [envUsername, passwordHash]
    );
  } else {
    await executor.query(
      'UPDATE admins SET password_hash = $1 WHERE username = $2',
      [passwordHash, envUsername]
    );
  }
}

export async function ensureAdminAccount(username: string, plainPassword: string): Promise<AdminUser> {
  const db = await getDb();
  const cleanUser = username.trim();
  const passwordHash = hashPassword(plainPassword);
  const existing = await db.query<{ id: number; username: string; created_at: string }>(
    'SELECT id, username, created_at FROM admins WHERE username = $1',
    [cleanUser]
  );

  if (existing.rows.length > 0) {
    const updated = await db.query<{ id: number; username: string; created_at: string }>(
      'UPDATE admins SET password_hash = $1 WHERE username = $2 RETURNING id, username, created_at',
      [passwordHash, cleanUser]
    );
    return {
      id: Number(updated.rows[0].id),
      username: updated.rows[0].username,
      createdAt: updated.rows[0].created_at,
    };
  }

  const inserted = await db.query<{ id: number; username: string; created_at: string }>(
    'INSERT INTO admins (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at',
    [cleanUser, passwordHash]
  );
  return {
    id: Number(inserted.rows[0].id),
    username: inserted.rows[0].username,
    createdAt: inserted.rows[0].created_at,
  };
}

export async function findAdminByUsername(
  username: string
): Promise<{ id: number; username: string; passwordHash: string } | null> {
  const db = await getDb();
  const res = await db.query<{ id: number; username: string; password_hash: string }>(
    'SELECT id, username, password_hash FROM admins WHERE username = $1',
    [username.trim()]
  );
  if (!res.rows[0]) return null;
  return {
    id: Number(res.rows[0].id),
    username: res.rows[0].username,
    passwordHash: res.rows[0].password_hash,
  };
}

export async function deleteAdminByUsername(username: string): Promise<void> {
  const db = await getDb();
  await db.query('DELETE FROM admins WHERE username = $1', [username.trim()]);
}

export async function listAppliedMigrations(): Promise<string[]> {
  const db = await getDb();
  const res = await db.query<{ version: string }>(
    'SELECT version FROM schema_migrations ORDER BY version ASC'
  );
  return res.rows.map((r) => r.version);
}

function mapProductRow(row: any): Product {
  const resolvedName = row.name || row.nome || 'Doce Artesanal';
  const resolvedCategory = (row.category || 'Doces') as ProductCategory;
  const rawImg = row.image_url || row.imagem_url || '';
  const resolvedImg =
    rawImg && String(rawImg).trim() !== ''
      ? String(rawImg)
      : createPatisserieSvgDataUri(resolvedName, resolvedCategory, 'strawberry');

  let resolvedDate = row.manufactured_date || '';
  if (!resolvedDate && row.data_fabricacao) {
    resolvedDate =
      row.data_fabricacao instanceof Date
        ? row.data_fabricacao.toISOString().slice(0, 10)
        : String(row.data_fabricacao).slice(0, 10);
  }

  const createdRaw = row.created_at || row.criado_em;

  return {
    id: Number(row.id),
    name: resolvedName,
    price: Number(row.price ?? row.preco ?? 0),
    imageUrl: resolvedImg,
    category: resolvedCategory,
    imageSize: (row.image_size || '500x500') as ImageSizeOption,
    description: row.description || row.descricao || '',
    manufacturedDate: resolvedDate,
    redirectUrl: row.redirect_url || '',
    createdAt: createdRaw ? new Date(createdRaw).toISOString() : undefined,
  };
}

function mapFeedbackRow(row: any): Feedback {
  return {
    id: Number(row.id),
    authorName: row.author_name,
    rating: Number(row.rating),
    comment: row.comment,
    createdAt: row.created_at
      ? new Date(row.created_at).toISOString()
      : new Date().toISOString(),
  };
}

export async function listProducts(): Promise<Product[]> {
  try {
    const db = await getDb();
    const res = await db.query('SELECT * FROM products ORDER BY id ASC');
    return res.rows.map(mapProductRow);
  } catch (error) {
    console.error('Database query failed in listProducts:', error);
    throw new Error('Falha ao consultar produtos no banco PostgreSQL.', { cause: error });
  }
}

export async function createProduct(input: {
  name: string;
  price: number;
  imageUrl: string;
  category?: ProductCategory;
  imageSize?: ImageSizeOption;
  description?: string;
  manufacturedDate?: string;
  redirectUrl?: string;
}): Promise<Product> {
  try {
    const db = await getDb();
    const cleanName = input.name.trim();
    const cleanPrice = Number(input.price);
    const cleanDesc = input.description?.trim() || '';
    const cleanDate = input.manufacturedDate?.trim() || '';

    if (hasLegacyPortugueseColumns) {
      const res = await db.query(
        `INSERT INTO products (name, nome, price, preco, image_url, imagem_url, category, image_size, description, descricao, manufactured_date, redirect_url)
         VALUES ($1::text, $1::varchar, $2::numeric, $2::numeric, $3::text, $3::text, $4::text, $5::text, $6::text, $6::text, $7::text, $8::text)
         RETURNING *`,
        [
          cleanName,
          cleanPrice,
          input.imageUrl,
          input.category || 'Doces',
          input.imageSize || '500x500',
          cleanDesc,
          cleanDate,
          input.redirectUrl?.trim() || '',
        ]
      );
      return mapProductRow(res.rows[0]);
    }

    const res = await db.query(
      `INSERT INTO products (name, price, image_url, category, image_size, description, manufactured_date, redirect_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        cleanName,
        cleanPrice,
        input.imageUrl,
        input.category || 'Doces',
        input.imageSize || '500x500',
        cleanDesc,
        cleanDate,
        input.redirectUrl?.trim() || '',
      ]
    );
    return mapProductRow(res.rows[0]);
  } catch (error) {
    console.error('Database query failed in createProduct:', error);
    throw new Error('Falha ao cadastrar produto no banco PostgreSQL.', { cause: error });
  }
}

export async function updateProduct(
  id: number,
  input: {
    name: string;
    price: number;
    imageUrl: string;
    category?: ProductCategory;
    imageSize?: ImageSizeOption;
    description?: string;
    manufacturedDate?: string;
    redirectUrl?: string;
  }
): Promise<Product | null> {
  try {
    const db = await getDb();
    const cleanName = input.name.trim();
    const cleanPrice = Number(input.price);
    const cleanDesc = input.description?.trim() || '';
    const cleanDate = input.manufacturedDate?.trim() || '';

    if (hasLegacyPortugueseColumns) {
      const res = await db.query(
        `UPDATE products
         SET name = $1::text,
             nome = $1::varchar,
             price = $2::numeric,
             preco = $2::numeric,
             image_url = $3::text,
             imagem_url = $3::text,
             category = $4::text,
             image_size = $5::text,
             description = $6::text,
             descricao = $6::text,
             manufactured_date = $7::text,
             redirect_url = $8::text
         WHERE id = $9
         RETURNING *`,
        [
          cleanName,
          cleanPrice,
          input.imageUrl,
          input.category || 'Doces',
          input.imageSize || '500x500',
          cleanDesc,
          cleanDate,
          input.redirectUrl?.trim() || '',
          id,
        ]
      );
      if (!res.rows[0]) return null;
      return mapProductRow(res.rows[0]);
    }

    const res = await db.query(
      `UPDATE products
       SET name = $1,
           price = $2,
           image_url = $3,
           category = $4,
           image_size = $5,
           description = $6,
           manufactured_date = $7,
           redirect_url = $8
       WHERE id = $9
       RETURNING *`,
      [
        cleanName,
        cleanPrice,
        input.imageUrl,
        input.category || 'Doces',
        input.imageSize || '500x500',
        cleanDesc,
        cleanDate,
        input.redirectUrl?.trim() || '',
        id,
      ]
    );
    if (!res.rows[0]) return null;
    return mapProductRow(res.rows[0]);
  } catch (error) {
    console.error('Database query failed in updateProduct:', error);
    throw new Error('Falha ao atualizar produto no banco PostgreSQL.', { cause: error });
  }
}

export async function deleteProduct(id: number): Promise<boolean> {
  try {
    const db = await getDb();
    const res = await db.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    return res.rows.length > 0;
  } catch (error) {
    console.error('Database query failed in deleteProduct:', error);
    throw new Error('Falha ao remover produto no banco PostgreSQL.', { cause: error });
  }
}

export async function listFeedbacks(): Promise<Feedback[]> {
  try {
    const db = await getDb();
    const res = await db.query('SELECT * FROM feedbacks ORDER BY id DESC');
    return res.rows.map(mapFeedbackRow);
  } catch (error) {
    console.error('Database query failed in listFeedbacks:', error);
    throw new Error('Falha ao buscar avaliações no banco PostgreSQL.', { cause: error });
  }
}

export async function createFeedback(input: {
  authorName: string;
  rating: number;
  comment: string;
}): Promise<Feedback> {
  try {
    const db = await getDb();
    const clampedRating = Math.min(5, Math.max(1, Math.round(Number(input.rating) || 5)));
    const res = await db.query(
      `INSERT INTO feedbacks (author_name, rating, comment)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [input.authorName.trim(), clampedRating, input.comment.trim()]
    );
    return mapFeedbackRow(res.rows[0]);
  } catch (error) {
    console.error('Database query failed in createFeedback:', error);
    throw new Error('Falha ao salvar avaliação no banco PostgreSQL.', { cause: error });
  }
}

export async function updateFeedback(
  id: number,
  input: {
    authorName: string;
    rating: number;
    comment: string;
  }
): Promise<Feedback | null> {
  try {
    const db = await getDb();
    const clampedRating = Math.min(5, Math.max(1, Math.round(Number(input.rating) || 5)));
    const res = await db.query(
      `UPDATE feedbacks
       SET author_name = $1,
           rating = $2,
           comment = $3
       WHERE id = $4
       RETURNING *`,
      [input.authorName.trim(), clampedRating, input.comment.trim(), id]
    );
    if (!res.rows[0]) return null;
    return mapFeedbackRow(res.rows[0]);
  } catch (error) {
    console.error('Database query failed in updateFeedback:', error);
    throw new Error('Falha ao editar avaliação no banco PostgreSQL.', { cause: error });
  }
}

export async function deleteFeedback(id: number): Promise<boolean> {
  try {
    const db = await getDb();
    const res = await db.query('DELETE FROM feedbacks WHERE id = $1 RETURNING id', [id]);
    return res.rows.length > 0;
  } catch (error) {
    console.error('Database query failed in deleteFeedback:', error);
    throw new Error('Falha ao excluir avaliação no banco PostgreSQL.', { cause: error });
  }
}
