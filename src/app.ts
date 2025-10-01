import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/router';
import { errorHandler } from './middleware/errorHandler';
import { testConnection } from './config/db';
import { initializeModels } from './models';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// CORS configuration for React development
const getAllowedOrigins = (): string[] => {
  const envOrigins = process.env.ALLOWED_ORIGINS;
  const defaultOrigins = [
    'http://localhost:3000',    // React default port
    'http://localhost:3001',    // Alternative React port
    'http://localhost:5173',    // Vite default port
    'http://localhost:4173',    // Vite preview port
    'http://localhost:8080',    // Alternative development port
    'http://127.0.0.1:3000',    // Localhost alternative
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173',
  ];
  
  if (envOrigins) {
    return envOrigins.split(',').map(origin => origin.trim());
  }
  
  return defaultOrigins;
};

const corsOptions = {
  origin: getAllowedOrigins(),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-address', 'Cache-Control'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers for development
app.use((req, res, next) => {
  res.header('X-Powered-By', 'RocketStarter-Backend');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Request logging middleware for development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    if (req.headers['x-user-address']) {
      console.log(`  → User: ${req.headers['x-user-address']}`);
    }
    next();
  });
}

app.use(router);

app.use(errorHandler);

// Initialize database and start the server
const startServer = async (): Promise<void> => {
  try {
    // Test the database connection
    console.log('🔍 Testing database connection...');
    await testConnection();
    
    // Initialize database models
    console.log('📊 Initializing database models...');
    await initializeModels();
    
    // Start the server
    app.listen(PORT, (): void => {
      console.log(`🚀 RocketStarter Backend running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API: http://localhost:${PORT}/api/v1`);
      console.log(`💾 Database: Connected and synchronized`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;