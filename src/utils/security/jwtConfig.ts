/**
 * JWT Configuration for RocketStarter API
 * Used for authenticating Web3 wallet users
 */
const jwtConfig = {
  accessToken: {
    // Token format (typically "Bearer")
    type: process.env.ACCESS_TOKEN_TYPE || "Bearer",

    // Algorithm used to sign JWT tokens
    algorithm: process.env.ACCESS_TOKEN_ALGORITHM || "HS256",

    // Secret key used to sign/validate JWTs
    secret: process.env.JWT_SECRET || "change_this_secret_in_production",

    // Token lifetime (default: 24 hours in milliseconds)
    expiresIn: process.env.JWT_EXPIRATION || "24h",

    // Token audience (who the token is intended for)
    audience: process.env.JWT_AUDIENCE || "rocketstarter_front",

    // Token issuer (identifies the service that generated the token)
    issuer: process.env.JWT_ISSUER || "rocketstarter_api"
  }
};

export default jwtConfig;