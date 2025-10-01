import dotenv from "dotenv";
import * as fs from 'fs';
import * as path from 'path';
import { sequelize } from '../src/config/db';

dotenv.config();

// S'assurer que le dossier data existe
const dataDir = path.join(__dirname);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("✅ SQLite database connected");

    // Importer les modèles et la fonction d'initialisation
    const { User, Project, Task, Category, Reward, initializeModels } = require('../src/models');

    // Forcer la recréation des tables avec la nouvelle structure
    await sequelize.sync({ force: true });
    console.log("🗂️ Database tables recreated with new structure");

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
    const [categoryUIUX] = await Category.findOrCreate({
      where: { name: 'UI/UX' },
      defaults: { name: 'UI/UX' }
    });

    const [categoryWeb3] = await Category.findOrCreate({
      where: { name: 'Web3 Integration' },
      defaults: { name: 'Web3 Integration' }
    });

    const [categoryBackend] = await Category.findOrCreate({
      where: { name: 'Backend' },
      defaults: { name: 'Backend' }
    });

    const [categoryDocs] = await Category.findOrCreate({
      where: { name: 'Documentation' },
      defaults: { name: 'Documentation' }
    });

    // Project
    const [project] = await Project.findOrCreate({
      where: { name: 'Kudora' },
      defaults: {
        name: 'Kudora',
        description: 'Plateforme de gestion de projet web2 → web3',
        owner: '0xOWNER1234567890',
        progress: 25.00
      }
    });

    // Tasks
    const [task1] = await Task.findOrCreate({
      where: { title: 'Setup Wallet Authentication' },
      defaults: {
        projectId: project.id,
        title: 'Setup Wallet Authentication',
        description: 'Implémenter la connexion via wallet.',
        effort: '8h',
        priority: 2,
        status: 0,
        builder: null
      }
    });

    const [task2] = await Task.findOrCreate({
      where: { title: 'Project Kanban Board UI' },
      defaults: {
        projectId: project.id,
        title: 'Project Kanban Board UI',
        description: 'Créer le drag-and-drop façon Trello.',
        effort: '6h',
        priority: 1,
        status: 1,
        builder: '0xBUILDER111'
      }
    });

    const [task3] = await Task.findOrCreate({
      where: { title: 'Smart Contract Deployment' },
      defaults: {
        projectId: project.id,
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
      where: { taskId: task1.id, type: 'token' },
      defaults: {
        type: 'token',
        value: '100',
        contractAddress: '0xTOKENADDRESS123',
        details: '100 utility tokens pour completion',
        taskId: task1.id
      }
    });

    await Reward.findOrCreate({
      where: { taskId: task2.id, type: 'nft' },
      defaults: {
        type: 'nft',
        value: 'NFT-Badge-001',
        contractAddress: '0xNFTADDRESS456',
        details: 'NFT exclusif pour contribution UI',
        taskId: task2.id
      }
    });

    await Reward.findOrCreate({
      where: { taskId: task3.id, type: 'eth' },
      defaults: {
        type: 'eth',
        value: '0.05',
        contractAddress: null,
        details: 'Bonus ETH pour déploiement smart contract',
        taskId: task3.id
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
