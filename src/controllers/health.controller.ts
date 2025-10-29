import { Request, Response } from 'express';
import { HealthCheckResponse, DatabaseTestResponse, ApiInfo } from '../types';
import { testConnection } from '../config/db';

export const healthCheck = (req: Request, res: Response): void => {
  const response: HealthCheckResponse = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'RocketStarter Backend'
  };
  res.status(200).json(response);
};

export const databaseTest = async (req: Request, res: Response): Promise<void> => {
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      const response: DatabaseTestResponse = {
        status: 'Database connected',
        timestamp: new Date()
      };
      res.status(200).json(response);
    } else {
      res.status(500).json({
        status: 'Database connection failed',
        error: 'Could not establish connection'
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      status: 'Database connection failed',
      error: errorMessage
    });
  }
};

export const apiInfo = (req: Request, res: Response): void => {
  const response: ApiInfo = {
    message: 'Welcome to RocketStarter Backend API v1',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      database: '/db-test',
      api: '/api/v1'
    }
  };
  res.json(response);
};