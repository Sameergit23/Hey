import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { requestLogger } from './middleware/requestLogger';
import logger from './lib/logger';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import chatRoutes from './modules/chats/chats.routes';
import messageRoutes from './modules/messages/messages.routes';
import uploadRoutes from './modules/uploads/uploads.routes';
import callRoutes from './modules/calls/calls.routes';
import notificationRoutes from './modules/notifications/notifications.routes';
import presenceRoutes from './modules/presence/presence.routes';
import contactRoutes from './modules/contacts/contacts.routes';

export const createApp = (): Application => {
  const app = express();

  // ═══════════════════════════════════════════════
  // SECURITY MIDDLEWARE
  // ═══════════════════════════════════════════════
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", config.frontendUrl],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
        mediaSrc: ["'self'", 'https://res.cloudinary.com'],
      },
    },
  }));

  // ═══════════════════════════════════════════════
  // CORS
  // ═══════════════════════════════════════════════
  app.use(cors({
    origin: config.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // ═══════════════════════════════════════════════
  // BODY PARSING & COMPRESSION
  // ═══════════════════════════════════════════════
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  app.use(compression());

  // ═══════════════════════════════════════════════
  // LOGGING
  // ═══════════════════════════════════════════════
  if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
  }
  app.use(requestLogger);

  // ═══════════════════════════════════════════════
  // HEALTH CHECK
  // ═══════════════════════════════════════════════
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
    });
  });

  // ═══════════════════════════════════════════════
  // API ROUTES
  // ═══════════════════════════════════════════════
  const API_PREFIX = '/api/v1';

  app.use(`${API_PREFIX}/auth`, authRoutes);
  app.use(`${API_PREFIX}/users`, userRoutes);
  app.use(`${API_PREFIX}/chats`, chatRoutes);
  app.use(`${API_PREFIX}/messages`, messageRoutes);
  app.use(`${API_PREFIX}/uploads`, uploadRoutes);
  app.use(`${API_PREFIX}/calls`, callRoutes);
  app.use(`${API_PREFIX}/notifications`, notificationRoutes);
  app.use(`${API_PREFIX}/presence`, presenceRoutes);
  app.use(`${API_PREFIX}/contacts`, contactRoutes);

  // ═══════════════════════════════════════════════
  // ERROR HANDLING
  // ═══════════════════════════════════════════════
  app.use(notFoundHandler);
  app.use(errorHandler);

  logger.info('Express app initialized');

  return app;
};
