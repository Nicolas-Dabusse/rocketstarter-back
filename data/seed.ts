import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';
import { Sequelize } from 'sequelize-typescript';
import { User } from '../src/models/User';
import { Project } from '../src/models/Project';
import { Task } from '../src/models/Task';
import { Step } from '../src/models/Step';
import { Category } from '../src/models/Category';
import { Reward } from '../src/models/Reward';
import { TaskCategory } from '../src/models/TaskCategory';
import { ProjectCategory } from '../src/models/ProjectCategory';

// Charger les variables d'environnement
config();

// S'assurer que le dossier data existe
const dataDir = path.join(__dirname);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

async function seed() {
  // Créer une instance Sequelize avec la même config que le module
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 20,
      min: 2,
      acquire: 60000,
      idle: 10000,
      evict: 1000,
    },
    retry: {
      max: 3,
    },
    dialectOptions: {
      connectTimeout: 60000,
      statement_timeout: 30000,
      idle_in_transaction_session_timeout: 60000,
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true,
    },
    models: [
      User,
      Project,
      Task,
      Step,
      Category,
      Reward,
      TaskCategory,
      ProjectCategory,
    ], // Ajouter tous les modèles
  });

  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL database connected');

    // Forcer la recréation des tables avec la nouvelle structure
    await sequelize.sync({ force: true });
    console.log('🗂️ Database tables recreated with new structure');

    // Users
    const users = [
      {
        address: '0xOWNER1234567890',
        role: 'Owner',
        username: 'AliceOwner',
        email: 'alice.owner@example.com',
      },
      {
        address: '0xBUILDER111',
        role: 'Builder',
        username: 'BobBuilder',
        email: 'bob.builder@example.com',
      },
      {
        address: '0xBUILDER222',
        role: 'Builder',
        username: 'CharlieBuilder',
        email: 'charlie.builder@example.com',
      },
    ];
    for (const user of users) {
      await User.findOrCreate({
        where: { address: user.address },
        defaults: user,
      });
    }

    // Projects
    const [project] = await Project.findOrCreate({
      where: { slug: 'kudora' },
      defaults: {
        name: 'Kudora',
        slug: 'kudora',
        description: 'Plateforme de lancement de projets Web3',
        owner: '0xOWNER1234567890',
        logo: 'https://example.com/kudora-logo.png',
      },
    });

    // Categories
    const categories = [
      { name: 'UI/UX', type: 'general' },
      { name: 'Web3 Integration', type: 'web3' },
      { name: 'Backend', type: 'backend' },
      { name: 'Documentation', type: 'documentation' },
    ];
    const categoryInstances: { [key: string]: any } = {};
    for (const category of categories) {
      const [instance] = await Category.findOrCreate({
        where: { name: category.name },
        defaults: category,
      });
      categoryInstances[category.name] = instance;
    }

    // Steps
    const stepNames = [
      'Initial Setup',
      'Development',
      'Deployment',
      'Documentation',
    ];
    const stepInstances: { [key: string]: any } = {};
    for (const stepName of stepNames) {
      const [step] = await Step.findOrCreate({
        where: { name: stepName, projectId: project.id },
        defaults: {
          name: stepName,
          description: `Étape ${stepName} pour le projet Kudora`,
          projectId: project.id,
        },
      });
      stepInstances[stepName] = step;
    }

    // Tasks
    const tasks = [
      {
        contractAddress: '0xCONTRACT123456',
        projectId: project.id,
        taskOwner: '0xOWNER1234567890',
        stepName: 'Initial Setup',
        title: 'Setup Wallet Authentication',
        description: 'Implémenter la connexion via wallet.',
        effort: '5',
        priority: 2,
        status: 0,
        builder: null,
      },
      {
        contractAddress: '0xCONTRACT123457',
        projectId: project.id,
        taskOwner: '0xOWNER1234567890',
        stepName: 'Initial Setup',
        title: 'Project Kanban Board UI',
        description: 'Créer le drag-and-drop façon Trello.',
        effort: '2',
        priority: 1,
        status: 1,
        builder: '0xBUILDER111',
      },
      {
        contractAddress: '0xCONTRACT123458',
        projectId: project.id,
        taskOwner: '0xOWNER1234567890',
        stepName: 'Development',
        title: 'Smart Contract Deployment',
        description: 'Déployer un smart contract simple.',
        effort: '8',
        priority: 2,
        status: 2,
        builder: '0xBUILDER222',
      },
      {
        contractAddress: '0xCONTRACT123459',
        projectId: project.id,
        taskOwner: '0xOWNER1234567890',
        stepName: 'Deployment',
        title: 'API Documentation',
        description: 'Documenter tous les endpoints API',
        effort: '1',
        priority: 1,
        status: 3,
        builder: '0xBUILDER111',
      },
      {
        contractAddress: '0xCONTRACT123460',
        projectId: project.id,
        taskOwner: '0xOWNER1234567890',
        stepName: 'Development',
        title: 'Token Reward System',
        description: 'Implémenter le système de récompenses en tokens',
        effort: '13',
        priority: 2,
        status: 0,
        builder: null,
      },
    ];
    const taskInstances: { [key: string]: any } = {};
    for (const task of tasks) {
      const [instance] = await Task.findOrCreate({
        where: { title: task.title },
        defaults: {
          ...task,
          stepId: stepInstances[task.stepName].id,
        },
      });
      taskInstances[task.title] = instance;
    }

    // Rewards
    const rewards = [
      {
        type: 'token',
        value: '100',
        contractAddress: '0x1234567890123456789012345678901234567890', // Format Ethereum valide (40 chars)
        details: '100 utility tokens pour completion',
        taskTitle: 'Setup Wallet Authentication',
      },
      {
        type: 'nft',
        value: 'NFT-Badge-001',
        contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12', // Format Ethereum valide (40 chars)
        details: 'NFT exclusif pour contribution UI',
        taskTitle: 'Project Kanban Board UI',
      },
      {
        type: 'custom', // Changé de 'eth' à 'custom' pour respecter la validation du modèle
        value: '0.05',
        contractAddress: null,
        details: 'Bonus ETH pour déploiement smart contract',
        taskTitle: 'Smart Contract Deployment',
      },
    ];
    for (const reward of rewards) {
      const [instance] = await Reward.findOrCreate({
        where: {
          taskId: taskInstances[reward.taskTitle].id,
          type: reward.type,
        },
        defaults: {
          type: reward.type,
          value: reward.value,
          contractAddress: reward.contractAddress,
          details: reward.details,
          taskId: taskInstances[reward.taskTitle].id,
          createdAt: new Date(), // Ajout explicite de createdAt
        },
      });
    }

    console.log('🌱 Seeding completed successfully!');
    await sequelize.close();
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  }
}

seed();
