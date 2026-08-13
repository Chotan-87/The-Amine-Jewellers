import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { db } from './src/db/index.ts';
import { users, stockItems, mortgages, artisans, artisanJobs, goldRates } from './src/db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // User Management
  app.get('/api/user/profile', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.uid, req.user!.uid)
      });
      if (!user) {
        // Create user if doesn't exist (Sync from Firebase)
        const newUser = await db.insert(users).values({
          uid: req.user!.uid,
          email: req.user!.email!,
          displayName: req.user!.name || '',
        }).returning();
        return res.json(newUser[0]);
      }
      res.json(user);
    } catch (error) {
      console.error('Database Error:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  });

  // Stock Management
  app.get('/api/stock', requireAuth, async (req, res) => {
    try {
      const items = await db.select().from(stockItems).orderBy(desc(stockItems.createdAt));
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stock' });
    }
  });

  app.post('/api/stock', requireAuth, async (req, res) => {
    try {
      const newItem = await db.insert(stockItems).values(req.body).returning();
      res.json(newItem[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create stock item' });
    }
  });

  // Mortgage Management
  app.get('/api/mortgages', requireAuth, async (req, res) => {
    try {
      const records = await db.select().from(mortgages).orderBy(desc(mortgages.createdAt));
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch mortgages' });
    }
  });

  // Gold Rates
  app.get('/api/gold-rates', requireAuth, async (req, res) => {
    try {
      const rates = await db.select().from(goldRates);
      res.json(rates);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch gold rates' });
    }
  });

  app.post('/api/gold-rates', requireAuth, async (req, res) => {
    try {
      const { rates } = req.body; // Array of rates
      const results = await Promise.all(rates.map((r: any) => 
        db.insert(goldRates).values({
          karat: r.karat,
          rate: r.rate.toString()
        }).onConflictDoUpdate({
          target: goldRates.karat,
          set: { rate: r.rate.toString(), updatedAt: new Date() }
        }).returning()
      ));
      res.json(results.flat());
    } catch (error) {
      res.status(500).json({ error: 'Failed to update gold rates' });
    }
  });

  // Example Gemini API endpoint
  app.post('/api/ai/analyze-stock', async (req, res) => {
    try {
      const { stockData } = req.body;
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `As a jewelry shop consultant, analyze this stock data and provide insights in Bengali: ${JSON.stringify(stockData)}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      res.json({ insight: response.text() });
    } catch (error) {
      console.error('Gemini Error:', error);
      res.status(500).json({ error: 'AI analysis failed' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    console.log('Production mode: serving static files from', distPath);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      res.sendFile(indexPath);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
