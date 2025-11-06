import { Request, Response } from 'express';
import authService from '../../services/auth.service';

/**
 * GET /api/v1/auth/me
 * Get current authenticated user info (requires JWT in Authorization header)
 */
export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No token provided',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const userData = await authService.getUserFromToken(token);

    res.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get user info';
    const statusCode = message.includes('Invalid') || message.includes('expired') ? 401 : 500;

    res.status(statusCode).json({
      success: false,
      error: message,
    });
  }
};