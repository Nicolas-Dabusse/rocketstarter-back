
import { Sequelize } from 'sequelize';

export const createSequelizeInstance = (): Sequelize => {
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || 'rocket',
    password: process.env.DB_PASSWORD || 'secret_change_in_production',
    database: process.env.DB_NAME || 'rocketstarter',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    
    // Connection pool configuration
    pool: {
      max: 20,              // Maximum number of connections in pool
      min: 2,               // Minimum number of connections in pool
      acquire: 60000,       // Maximum time (ms) to get connection before throwing error
      idle: 10000,          // Maximum time (ms) a connection can be idle before being released
      evict: 1000,          // Time interval (ms) to run eviction of idle connections
    },

    // Retry configuration for connection failures
    retry: {
      max: 3,               // Maximum number of connection retries
    },

    // PostgreSQL-specific options
    dialectOptions: {
      connectTimeout: 60000,  // Connection timeout
      statement_timeout: 30000, // Query timeout (30s)
      idle_in_transaction_session_timeout: 60000, // Transaction timeout
    },
  });

  return sequelize;
};

export default createSequelizeInstance;