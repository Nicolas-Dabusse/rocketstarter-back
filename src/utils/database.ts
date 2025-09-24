
import { Sequelize, Options } from 'sequelize';

export interface DatabaseConfig extends Options {
  storage: string;
}

export const getDatabaseConfig = (): DatabaseConfig => ({
  dialect: 'sqlite',
  storage: process.env.SQLITE_PATH || './data/database.sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

export const createSequelizeInstance = (): Sequelize => {
  const config = getDatabaseConfig();
  return new Sequelize(config);
};

export default createSequelizeInstance;