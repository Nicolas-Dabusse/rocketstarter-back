import { Request, Response } from 'express';
import authService from '../../services/auth.service';

/**
 * POST /api/v1/auth/challenge
 * Generate a nonce and message for wallet signature
 */
export const requestChallenge = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { address } = req.body;

    if (!address) {
      res.status(400).json({
        success: false,
        error: 'Wallet address is required',
      });
      return;
    }

    const challenge = await authService.generateChallenge(address);

    res.json({
      success: true,
      data: challenge,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate challenge';
    const statusCode = message.includes('not found') ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      error: message,
    });
  }
};