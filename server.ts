import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  listFeedbacks,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  findAdminByUsername,
} from './src/db/postgres';
import {
  createAdminToken,
  extractTokenFromRequest,
  requireAdminAuth,
  verifyAdminToken,
  verifyPassword,
} from './src/auth/security';

dotenv.config();

export function createApp() {
  const app = express();

  // Increase JSON limit to support adaptive resized product images (500x500, 800x800, 700x900)
  app.use(express.json({ limit: '15mb' }));

  // ============================================================================
  // ADMINISTRATOR AUTHENTICATION & SESSION API
  // ============================================================================
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body || {};
      if (!username || String(username).trim() === '' || !password || String(password) === '') {
        return res.status(400).json({ error: 'Informe o nome de usuário e a senha.' });
      }

      const admin = await findAdminByUsername(String(username).trim());
      if (!admin || !verifyPassword(String(password), admin.passwordHash)) {
        return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
      }

      const token = createAdminToken({ id: admin.id, username: admin.username });
      res.setHeader(
        'Set-Cookie',
        `meudoce_session=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${8 * 3600}; SameSite=Lax`
      );

      res.json({
        token,
        admin: {
          id: admin.id,
          username: admin.username,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao autenticar administrador.' });
    }
  });

  app.post('/api/auth/logout', (_req, res) => {
    res.setHeader(
      'Set-Cookie',
      'meudoce_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax'
    );
    res.json({ success: true });
  });

  app.get('/api/auth/me', (req, res) => {
    const token = extractTokenFromRequest(req);
    const session = verifyAdminToken(token);
    if (!session) {
      return res.status(401).json({ authenticated: false });
    }
    res.json({
      authenticated: true,
      admin: {
        id: session.sub,
        username: session.username,
      },
    });
  });

  // ============================================================================
  // PRODUCTS CRUD API (PostgreSQL)
  // ============================================================================
  app.get('/api/products', async (_req, res) => {
    try {
      const products = await listProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao listar produtos.' });
    }
  });

  app.post('/api/products', requireAdminAuth, async (req, res) => {
    try {
      const {
        name,
        price,
        imageUrl,
        category,
        imageSize,
        description,
        manufacturedDate,
        redirectUrl,
      } = req.body;

      // Mandatory fields check: foto (imageUrl), preço (price), nome (name)
      if (!name || String(name).trim() === '') {
        return res.status(400).json({ error: 'O campo Nome do produto é obrigatório.' });
      }
      if (price === undefined || price === null || isNaN(Number(price)) || Number(price) <= 0) {
        return res.status(400).json({ error: 'O campo Preço é obrigatório e deve ser maior que zero.' });
      }
      if (!imageUrl || String(imageUrl).trim() === '') {
        return res.status(400).json({ error: 'A Foto do produto é obrigatória.' });
      }

      const created = await createProduct({
        name: String(name),
        price: Number(price),
        imageUrl: String(imageUrl),
        category,
        imageSize,
        description,
        manufacturedDate,
        redirectUrl,
      });

      res.status(201).json(created);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao cadastrar produto.' });
    }
  });

  app.put('/api/products/:id', requireAdminAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID de produto inválido.' });
      }

      const {
        name,
        price,
        imageUrl,
        category,
        imageSize,
        description,
        manufacturedDate,
        redirectUrl,
      } = req.body;

      if (!name || String(name).trim() === '') {
        return res.status(400).json({ error: 'O campo Nome do produto é obrigatório.' });
      }
      if (price === undefined || price === null || isNaN(Number(price)) || Number(price) <= 0) {
        return res.status(400).json({ error: 'O campo Preço é obrigatório e deve ser maior que zero.' });
      }
      if (!imageUrl || String(imageUrl).trim() === '') {
        return res.status(400).json({ error: 'A Foto do produto é obrigatória.' });
      }

      const updated = await updateProduct(id, {
        name: String(name),
        price: Number(price),
        imageUrl: String(imageUrl),
        category,
        imageSize,
        description,
        manufacturedDate,
        redirectUrl,
      });

      if (!updated) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao atualizar produto.' });
    }
  });

  app.delete('/api/products/:id', requireAdminAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID de produto inválido.' });
      }

      const deleted = await deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao excluir produto.' });
    }
  });

  // ============================================================================
  // FEEDBACKS CRUD API (PostgreSQL)
  // ============================================================================
  app.get('/api/feedbacks', async (_req, res) => {
    try {
      const feedbacks = await listFeedbacks();
      res.json(feedbacks);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao carregar avaliações.' });
    }
  });

  // Public route: visitors can submit ratings (1..5) and comments
  app.post('/api/feedbacks', async (req, res) => {
    try {
      const { authorName, rating, comment } = req.body;
      if (!authorName || String(authorName).trim() === '') {
        return res.status(400).json({ error: 'Por favor, informe seu nome.' });
      }
      if (!comment || String(comment).trim() === '') {
        return res.status(400).json({ error: 'Por favor, escreva seu comentário.' });
      }

      const created = await createFeedback({
        authorName: String(authorName),
        rating: Number(rating || 5),
        comment: String(comment),
      });

      res.status(201).json(created);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao publicar avaliação.' });
    }
  });

  // Admin-only routes: moderation (edit / delete feedback)
  app.put('/api/feedbacks/:id', requireAdminAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { authorName, rating, comment } = req.body;

      if (!authorName || String(authorName).trim() === '' || !comment || String(comment).trim() === '') {
        return res.status(400).json({ error: 'Nome e comentário são obrigatórios.' });
      }

      const updated = await updateFeedback(id, {
        authorName: String(authorName),
        rating: Number(rating || 5),
        comment: String(comment),
      });

      if (!updated) {
        return res.status(404).json({ error: 'Avaliação não encontrada.' });
      }

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao editar avaliação.' });
    }
  });

  app.delete('/api/feedbacks/:id', requireAdminAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const deleted = await deleteFeedback(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Avaliação não encontrada.' });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao apagar avaliação.' });
    }
  });

  // ============================================================================
  // STATIC ASSETS & ANGULAR SPA HOSTING
  // ============================================================================
  const publicDir = path.join(process.cwd(), 'public');
  if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
  }

  const angularBrowserDist = path.join(process.cwd(), 'dist', 'browser');
  const legacyDist = path.join(process.cwd(), 'dist');
  const activeDist = fs.existsSync(angularBrowserDist) ? angularBrowserDist : legacyDist;

  if (fs.existsSync(activeDist)) {
    app.use(express.static(activeDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      const indexFile = path.join(activeDist, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        next();
      }
    });
  }

  return app;
}

const isDirectExecution =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectExecution) {
  const PORT = Number(process.env.PORT || 3000);
  // Trigger DB & Admin initialization on startup
  listProducts()
    .then(() => {
      const app = createApp();
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Meu Doce (Angular + Express + PostgreSQL) rodando em http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Falha ao inicializar banco PostgreSQL:', err);
      process.exit(1);
    });
}
