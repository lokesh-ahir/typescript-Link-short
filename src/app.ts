import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectRedis } from './config/redis';
import { connectSupabase } from './config/supabase';
import urlRoutes from './routes/urlRoutes';
import { URLController } from './controllers/urlController';
import { generalLimiter } from './utils/rateLimiter';

dotenv.config();

const app = express();
const urlController = new URLController();


export const initializeConnections = async () => {
  connectRedis();
  connectSupabase();
  console.log('Connections initialized');
};


app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());


app.use('/api', generalLimiter, urlRoutes);


app.get('/:shortId', (req, res) => urlController.redirect(req, res));


app.get('/health', (req, res) => res.json({ status: 'OK', uptime: process.uptime() }));
app.get('/', (req, res) => res.json({ message: 'Link Shortener API', version: '1.0.0' }));


app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export { app };
