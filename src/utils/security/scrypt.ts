import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const Scrypt = {
    /**
     * Hash a password using scrypt algorithm.
     * @param password - The plain text password.
     * @returns The hash in the format `${hash}.${salt}`
     */
    hash(password: string): string {
        const salt = randomBytes(16).toString('hex');
        const buf = scryptSync(password, salt, 64, {
            N: 131072,
            maxmem: 134220800,
        });

        return `${buf.toString('hex')}.${salt}`;
    },

    /**
     * Compare a plain text password with a hash.
     * @param plainTextPassword - The plain text password.
     * @param hash - The hash to compare (format `${hash}.${salt}`).
     * @returns true if the passwords match, false otherwise.
     */
    compare(plainTextPassword: string, hash: string): boolean {
        const [hashedPassword, salt] = hash.split('.');
        if (!hashedPassword || !salt) {
            return false;
        }

        const hashedPasswordBuf = Buffer.from(hashedPassword, 'hex');

        const clearPasswordBuffer = scryptSync(plainTextPassword, salt, 64, {
            N: 131072,
            maxmem: 134220800,
        });

        return timingSafeEqual(hashedPasswordBuf, clearPasswordBuffer);
    }
}

export default Scrypt;