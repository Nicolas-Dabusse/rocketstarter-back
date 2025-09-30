import { createSequelizeInstance } from '../utils/database';

// Initialize Sequelize instance (using SQLite)
export const sequelize = createSequelizeInstance();

// Test the database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the SQLite database:', error);
    return false;
  }
};

// Synchronize the database (create tables)
export const syncDatabase = async (force: boolean = false): Promise<void> => {
  try {
    await sequelize.sync({ force });
    console.log('✅ SQLite database synchronized successfully.');
  } catch (error) {
    console.error('❌ Error synchronizing SQLite database:', error);
    throw error;
  }
};

// Close the database connection
export const closeConnection = async (): Promise<void> => {
  try {
    await sequelize.close();
    console.log('✅ SQLite database connection closed.');
  } catch (error) {
    console.error('❌ Error closing SQLite database connection:', error);
  }
};

export default sequelize;
