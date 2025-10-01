import dotenv from "dotenv";
import { createSequelizeInstance } from '../src/utils/database';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

// Connexion SQLite (même config que l'app)
const sequelize = createSequelizeInstance();

// S'assurer que le dossier data existe
const dataDir = path.join(__dirname);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("✅ SQLite database connected");

    // Synchroniser les modèles (créer les tables si elles n'existent pas)
    await sequelize.sync({ force: false });

    // Importer les modèles
    const { User, Project, Task, Category, Reward } = require('../src/models');

    // Users
    await User.findOrCreate({
      where: { address: '0xOWNER1234567890' },
      defaults: { role: 'Owner', username: 'AliceOwner', email: 'alice.owner@example.com' }
    });

    await User.findOrCreate({
      where: { address: '0xBUILDER111' },
      defaults: { role: 'Builder', username: 'BobBuilder', email: 'bob.builder@example.com' }
    });

    await User.findOrCreate({
      where: { address: '0xBUILDER222' },
      defaults: { role: 'Builder', username: 'CharlieBuilder', email: 'charlie.builder@example.com' }
    });

    // Categories
    await Category.findOrCreate({
      where: { id: 'cat-uiux' },
      defaults: { name: 'UI/UX' }
    });

    await Category.findOrCreate({
      where: { id: 'cat-web3' },
      defaults: { name: 'Web3 Integration' }
    });

    await Category.findOrCreate({
      where: { id: 'cat-backend' },
      defaults: { name: 'Backend' }
    });

    await Category.findOrCreate({
      where: { id: 'cat-docs' },
      defaults: { name: 'Documentation' }
    });

    // Project
    const [project] = await Project.findOrCreate({
      where: { id: 'proj-kudora' },
      defaults: {
        name: 'Kudora',
        description: 'Plateforme de gestion de projet web2 → web3',
        owner: '0xOWNER1234567890',
        progress: 25.00
      }
    });

    // Tasks
    await Task.findOrCreate({
      where: { id: 'task-1' },
      defaults: {
        projectId: 'proj-kudora',
        title: 'Setup Wallet Authentication',
        description: 'Implémenter la connexion via wallet.',
        effort: '8h',
        priority: 2,
        status: 0,
        builder: null
      }
    });

    await Task.findOrCreate({
      where: { id: 'task-2' },
      defaults: {
        projectId: 'proj-kudora',
        title: 'Project Kanban Board UI',
        description: 'Créer le drag-and-drop façon Trello.',
        effort: '6h',
        priority: 1,
        status: 1,
        builder: '0xBUILDER111'
      }
    });

    await Task.findOrCreate({
      where: { id: 'task-3' },
      defaults: {
        projectId: 'proj-kudora',
        title: 'Smart Contract Deployment',
        description: 'Déployer un smart contract simple.',
        effort: '12h',
        priority: 2,
        status: 2,
        builder: '0xBUILDER222'
      }
    });

    // Rewards
    await Reward.findOrCreate({
      where: { id: 'reward-1' },
      defaults: {
        type: 'token',
        value: '100',
        contractAddress: '0xTOKENADDRESS123',
        details: '100 utility tokens pour completion',
        taskId: 'task-1'
      }
    });

    await Reward.findOrCreate({
      where: { id: 'reward-2' },
      defaults: {
        type: 'nft',
        value: 'NFT-Badge-001',
        contractAddress: '0xNFTADDRESS456',
        details: 'NFT exclusif pour contribution UI',
        taskId: 'task-2'
      }
    });

    await Reward.findOrCreate({
      where: { id: 'reward-3' },
      defaults: {
        type: 'eth',
        value: '0.05',
        contractAddress: null,
        details: 'Bonus ETH pour déploiement smart contract',
        taskId: 'task-3'
      }
    });

    console.log("🌱 Seeding completed successfully!");
    await sequelize.close();
  } catch (err) {
    console.error("❌ Error during seeding:", err);
    process.exit(1);
  }
}

seed();
