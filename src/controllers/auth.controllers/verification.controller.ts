import { Request, Response } from 'express';
import authService from '../../services/auth.service';

/**
 * POST /api/v1/auth/verify
 * Verify wallet signature and issue JWT token
 */
export const verifySignature = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { address, signature, message } = req.body;

    // Validate required fields
    if (!address || !signature || !message) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: address, signature, message',
      });
      return;
    }

    const authData = await authService.verifyAndAuthenticate(
      address,
      signature,
      message
    );

    res.json({
      success: true,
      data: authData,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed';
    const statusCode = message.includes('not found') ? 404 : 401;

    res.status(statusCode).json({
      success: false,
      error: message,
    });
  }
};