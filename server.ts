import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { apiRouter } from './server/routes/index.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/v1', apiRouter);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    platform: 'Continuum Health',
    timestamp: new Date().toISOString(),
  });
});

// Serve the built frontend, including JS, CSS, and images.
app.use(express.static(path.resolve(process.cwd(), 'public')));

// Frontend fallback for client-side routes.
app.get('*', (_req, res) => {
  res.sendFile(path.resolve(process.cwd(), 'public', 'index.html'));
});

export default app;

// Start a local/Render server, but not when imported by Vercel.
if (!process.env.VERCEL) {
  const PORT = Number(process.env.PORT || 3000);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}