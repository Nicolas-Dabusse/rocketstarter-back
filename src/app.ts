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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);

app.use(errorHandler);

// Initialize database and start server
const startServer = async (): Promise<void> => {
  try {
    // Test database connection
    console.log('🔍 Testing database connection...');
    await testConnection();
    
    // Initialize models
    console.log('📊 Initializing database models...');
    await initializeModels();
    
    // Start server
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