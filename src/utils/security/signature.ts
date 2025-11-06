import { ethers } from 'ethers';

/**
 * Message template for wallet signature challenges
 * Following EIP-191 standard for signed data
 */
const SIGNATURE_MESSAGE_TEMPLATE = `Welcome to RocketStarter!

Sign this message to prove you own this wallet address.

Nonce: {nonce}
Timestamp: {timestamp}`;

/**
 * Signature verification result
 */
export interface SignatureVerification {
  isValid: boolean;
  recoveredAddress?: string;
  error?: string;
}

const Signature = {
  /**
   * Generate a challenge message for wallet signature
   * @param nonce - Unique random string to prevent replay attacks
   * @returns Message to be signed by the user's wallet
   */
  generateMessage(nonce: string): string {
    return SIGNATURE_MESSAGE_TEMPLATE
      .replace('{nonce}', nonce)
      .replace('{timestamp}', new Date().toISOString());
  },

  /**
   * Verify a wallet signature and recover the signer's address
   * @param message - Original message that was signed
   * @param signature - Signature produced by wallet (hex string)
   * @returns Verification result with recovered address
   */
  verify(message: string, signature: string): SignatureVerification {
    try {
      // Recover the address that signed this message
      const recoveredAddress = ethers.verifyMessage(message, signature);

      return {
        isValid: true,
        recoveredAddress: recoveredAddress.toLowerCase(),
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Invalid signature',
      };
    }
  },

  /**
   * Verify a signature matches the claimed wallet address
   * @param message - Original message that was signed
   * @param signature - Signature produced by wallet (hex string)
   * @param expectedAddress - Wallet address that should have signed
   * @returns True if signature is valid and matches expected address
   */
  verifyAddress(
    message: string,
    signature: string,
    expectedAddress: string
  ): boolean {
    const verification = this.verify(message, signature);

    if (!verification.isValid || !verification.recoveredAddress) {
      return false;
    }

    // Compare addresses (case-insensitive)
    return (
      verification.recoveredAddress.toLowerCase() ===
      expectedAddress.toLowerCase()
    );
  },

  /**
   * Validate signature format (must be hex string starting with 0x)
   * @param signature - Signature to validate
   * @returns True if format is valid
   */
  isValidFormat(signature: string): boolean {
    // Signature should be 132 characters (0x + 65 bytes in hex = 0x + 130 chars)
    return /^0x[0-9a-fA-F]{130}$/.test(signature);
  },

  /**
   * Validate Ethereum address format
   * @param address - Address to validate
   * @returns True if format is valid
   */
  isValidAddress(address: string): boolean {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  },
};

export default Signature;