/**
 * JWT Configuration for RocketStarter API
 * Used for authenticating Web3 wallet users
 */
export const jwtConfig = {
  // Secret key used to sign/validate JWTs
  secret: process.env.JWT_SECRET || 'change_this_secret_in_production',

  // Token lifetime (default: 24 hours)
  signOptions: {
    expiresIn: (process.env.JWT_EXPIRATION || '24h') as '24h',

    // Token audience (who the token is intended for)
    audience: process.env.JWT_AUDIENCE || 'rocketstarter_front',

    // Token issuer (identifies the service that generated the token)
    issuer: process.env.JWT_ISSUER || 'rocketstarter_api',
  },
};
