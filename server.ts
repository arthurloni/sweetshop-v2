import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  listFeedbacks,
  createFeedback,
  updateFeedback,
  deleteFeedback,
} from './src/db/postgres.ts';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase JSON limit to support adaptive resized product images (500x500, 800x800, 700x900)
  app.use(express.json({ limit: '15mb' }));

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

  app.post('/api/products', async (req, res) => {
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

  app.put('/api/products/:id', async (req, res) => {
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

  app.delete('/api/products/:id', async (req, res) => {
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

  app.put('/api/feedbacks/:id', async (req, res) => {
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

  app.delete('/api/feedbacks/:id', async (req, res) => {
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
  // VITE MIDDLEWARE / PRODUCTION ASSETS
  // ============================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Meu Doce server running on http://localhost:${PORT}`);
  });
}

startServer();
