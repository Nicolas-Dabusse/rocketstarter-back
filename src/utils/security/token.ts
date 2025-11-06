import crypto from 'node:crypto';
import jwt, { type Algorithm } from 'jsonwebtoken';
import jwtConfig from './jwtConfig';

// Extract config parameters
const { audience, expiresIn, issuer, secret, type } = jwtConfig.accessToken;

// Force typing of algorithm to satisfy TypeScript
const algorithm = jwtConfig.accessToken.algorithm as Algorithm;

/**
 * JWT payload for Web3 authenticated users
 */
export interface JwtPayload {
  address: string; // Wallet address
  role: 'Owner' | 'Builder';
  email?: string;
  username?: string;
}

/**
 * JWT token response structure
 */
export interface AuthToken {
  token: string;
  type: string;
  expiresAt: Date;
  expiresIn: string;
}

const JWT = {
  /**
   * Generate an authentication token for a Web3 user
   * @param user - User data from wallet authentication
   * @returns Token object with expiration details
   */
  generateAuthToken(user: JwtPayload): { accessToken: AuthToken } {
    const payload: JwtPayload = {
      address: user.address,
      role: user.role,
      email: user.email,
      username: user.username,
    };

    return {
      accessToken: {
        token: this.sign(payload),
        type,
        expiresAt: this.createExpirationDate(),
        expiresIn: expiresIn as string,
      },
    };
  },

  /**
   * Sign a payload to create a JWT token
   * @param payload - Data to encode in the token
   * @returns Signed JWT string
   */
  sign(payload: JwtPayload): string {
    return jwt.sign(payload, secret, {
      algorithm,
      audience,
      expiresIn,
      issuer,
    });
  },

  /**
   * Verify and decode a JWT token
   * @param token - JWT string to verify
   * @returns Decoded payload if valid, null otherwise
   */
  verify(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, secret, {
        algorithms: [algorithm],
        audience,
        issuer,
      });
      return decoded as JwtPayload;
    } catch (_error) {
      return null;
    }
  },

  /**
   * Generate a secure random string (useful for nonces, challenges)
   * @returns Base64 encoded random string
   */
  generateRandomString(): string {
    return crypto.randomBytes(128).toString('base64');
  },

  /**
   * Create an expiration date based on configured token lifetime
   * @returns Future expiration date
   */
  createExpirationDate(): Date {
    // Handle both string format ("24h") and number format (milliseconds)
    if (typeof expiresIn === 'string') {
      // Parse string format like "24h", "7d", etc.
      const match = expiresIn.match(/^(\d+)([smhd])$/);
      if (!match) return new Date(Date.now() + 24 * 60 * 60 * 1000); // Default 24h

      const value = parseInt(match[1], 10);
      const unit = match[2];

      const multipliers: Record<string, number> = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
      };

      return new Date(Date.now() + value * multipliers[unit]);
    }

    // Handle number format (milliseconds)
    return new Date(Date.now() + expiresIn);
  },
};

export default JWT;