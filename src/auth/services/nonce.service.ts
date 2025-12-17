import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { randomBytes } from 'crypto';

/**
 * Nonce data structure
 */
interface NonceData {
  nonce: string;
  timestamp: number;
  expiresAt: number;
}

/**
 * NonceService
 * Manages temporary nonces for Web3 authentication challenges
 *
 * TODO: Replace in-memory storage with Redis for production
 * - Scalable across multiple instances
 * - Persistent across restarts
 * - Built-in TTL support
 */
@Injectable()
export class NonceService implements OnModuleDestroy {
  private store = new Map<string, NonceData>();
  private readonly NONCE_TTL = 5 * 60 * 1000; // 5 minutes
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean expired nonces every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanExpired();
    }, 60 * 1000);
  }

  /**
   * Called by NestJS when the module is destroyed
   * Stops the cleanup interval to prevent memory leaks
   */
  onModuleDestroy() {
    clearInterval(this.cleanupInterval);
  }

  /**
   * Generate and store a new nonce for an address
   * @param address - Wallet address (will be normalized to lowercase)
   * @returns Generated nonce string
   */
  create(address: string): string {
    const nonce = this.generateRandomString();
    const now = Date.now();

    this.store.set(address.toLowerCase(), {
      nonce,
      timestamp: now,
      expiresAt: now + this.NONCE_TTL,
    });

    return nonce;
  }

  /**
   * Retrieve and validate a nonce
   * @param address - Wallet address
   * @returns Nonce if valid and not expired, null otherwise
   */
  get(address: string): string | null {
    const data = this.store.get(address.toLowerCase());

    if (!data) {
      return null;
    }

    // Check expiration
    if (Date.now() > data.expiresAt) {
      this.store.delete(address.toLowerCase());
      return null;
    }

    return data.nonce;
  }

  /**
   * Consume a nonce (delete after use to prevent replay attacks)
   * @param address - Wallet address
   * @returns True if nonce was found and deleted
   */
  consume(address: string): boolean {
    return this.store.delete(address.toLowerCase());
  }

  /**
   * Check if a nonce exists for an address
   * @param address - Wallet address
   * @returns True if valid nonce exists
   */
  exists(address: string): boolean {
    return this.get(address) !== null;
  }

  /**
   * Generate a secure random string (useful for nonces, challenges)
   * @returns Base64 encoded random string
   */
  private generateRandomString(): string {
    return randomBytes(128).toString('base64');
  }

  /**
   * Clean all expired nonces
   */
  private cleanExpired(): void {
    const now = Date.now();
    for (const [address, data] of this.store.entries()) {
      if (now > data.expiresAt) {
        this.store.delete(address);
      }
    }
  }

  /**
   * Clear all nonces (useful for testing)
   */
  clear(): void {
    this.store.clear();
  }
}
