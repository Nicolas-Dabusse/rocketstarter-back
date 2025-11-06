import { User } from '../models';
import JWT, { JwtPayload } from '../utils/security/token';
import Signature from '../utils/security/signature';
import nonceService from './nonce.service';

/**
 * Authentication Service
 * Contains business logic for Web3 authentication
 */
class AuthService {
  /**
   * Generate a challenge for wallet authentication
   * @param address - Wallet address
   * @returns Message to sign and nonce
   * @throws Error if user not found or address invalid
   */
  async generateChallenge(address: string): Promise<{
    message: string;
    address: string;
  }> {
    // Normalize address
    const normalizedAddress = address.toLowerCase();

    // Validate address format
    if (!Signature.isValidAddress(normalizedAddress)) {
      throw new Error('Invalid wallet address format');
    }

    // Check if user exists
    const user = await User.findByPk(normalizedAddress);
    if (!user) {
      throw new Error('User not found. Please register first.');
    }

    // Generate nonce and message
    const nonce = nonceService.create(normalizedAddress);
    const message = Signature.generateMessage(nonce);

    return {
      message,
      address: normalizedAddress,
    };
  }

  /**
   * Verify signature and generate JWT
   * @param address - Claimed wallet address
   * @param signature - Signature from wallet
   * @param message - Original message that was signed
   * @returns User data and JWT token
   * @throws Error if verification fails
   */
  async verifyAndAuthenticate(
    address: string,
    signature: string,
    message: string
  ): Promise<{
    user: {
      address: string;
      role: string;
      username?: string;
      email?: string;
    };
    accessToken: {
      token: string;
      type: string;
      expiresAt: Date;
      expiresIn: string;
    };
  }> {
    // Normalize address
    const normalizedAddress = address.toLowerCase();

    // Validate formats
    if (!Signature.isValidAddress(normalizedAddress)) {
      throw new Error('Invalid wallet address format');
    }

    if (!Signature.isValidFormat(signature)) {
      throw new Error('Invalid signature format');
    }

    // Retrieve stored nonce
    const storedNonce = nonceService.get(normalizedAddress);
    if (!storedNonce) {
      throw new Error('No challenge found. Request a new challenge first.');
    }

    // Verify nonce is in the message
    if (!message.includes(storedNonce)) {
      throw new Error('Invalid nonce in message');
    }

    // Verify signature
    if (!Signature.verifyAddress(message, signature, normalizedAddress)) {
      throw new Error('Invalid signature. Signature verification failed.');
    }

    // Consume nonce (prevent replay attacks)
    nonceService.consume(normalizedAddress);

    // Get user data
    const user = await User.findByPk(normalizedAddress);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate JWT token
    const authToken = JWT.generateAuthToken({
      address: user.address,
      role: user.role,
      email: user.email,
      username: user.username,
    });

    return {
      user: {
        address: user.address,
        role: user.role,
        username: user.username,
        email: user.email,
      },
      ...authToken,
    };
  }

  /**
   * Get user from JWT token
   * @param token - JWT token
   * @returns User data
   * @throws Error if token invalid or user not found
   */
  async getUserFromToken(token: string): Promise<{
    address: string;
    role: string;
    username?: string;
    email?: string;
    createdAt: Date;
  }> {
    // Verify JWT
    const payload = JWT.verify(token);
    if (!payload) {
      throw new Error('Invalid or expired token');
    }

    // Get fresh user data
    const user = await User.findByPk(payload.address);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      address: user.address,
      role: user.role,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}

export default new AuthService();