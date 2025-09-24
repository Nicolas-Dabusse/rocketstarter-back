import { Sequelize, Options } from 'sequelize';

export interface DatabaseConfig extends Options {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export const getDatabaseConfig = (): DatabaseConfig => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'rocketstarter',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 20,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export const createSequelizeInstance = (): Sequelize => {
  const config = getDatabaseConfig();
  return new Sequelize(config);
};

export default createSequelizeInstance;