import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { seedDatabase } from './server/seed.js';

import authRouter from './server/routes/auth.js';
import institutionsRouter from './server/routes/institutions.js';
import saasRouter from './server/routes/saas.js';
import studentsRouter from './server/routes/students.js';
import staffRouter from './server/routes/staff.js';
import timetableRouter from './server/routes/timetable.js';
import attendanceRouter from './server/routes/attendance.js';
import feesRouter from './server/routes/fees.js';
import examsRouter from './server/routes/exams.js';
import assignmentsRouter from './server/routes/assignments.js';
import ptmRouter from './server/routes/ptm.js';
import noticesRouter from './server/routes/notices.js';
import websiteRouter from './server/routes/website.js';
import reportsRouter from './server/routes/reports.js';
import searchRouter from './server/routes/search.js';

const app = express();
const PORT = 3000;

// Security & Optimization Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'EduCore Enterprise Multi-Tenant ERP',
    timestamp: new Date().toISOString()
  });
});

// Seed DB on start
seedDatabase().catch((err) => {
  console.error('Seed Database Error:', err);
});

// API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/institutions', institutionsRouter);
app.use('/api/v1/saas', saasRouter);
app.use('/api/v1/students', studentsRouter);
app.use('/api/v1/staff', staffRouter);
app.use('/api/v1/timetable', timetableRouter);
app.use('/api/v1/attendance', attendanceRouter);
app.use('/api/v1/fees', feesRouter);
app.use('/api/v1/exams', examsRouter);
app.use('/api/v1/assignments', assignmentsRouter);
app.use('/api/v1/ptm', ptmRouter);
app.use('/api/v1/notices', noticesRouter);
app.use('/api/v1/website', websiteRouter);
app.use('/api/v1/reports', reportsRouter);
app.use('/api/v1/search', searchRouter);

// Serve static files in production or integration mode
const isProd = process.env.NODE_ENV === 'production';

async function setupServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduCore ERP Server listening on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Server setup failure:', err);
});
