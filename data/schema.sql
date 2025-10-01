-- Table: Reward
CREATE TABLE "Reward" (
  id VARCHAR(255) PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- ex: token, nft, free, btc, eth, custom, etc.
  value VARCHAR(255) NOT NULL, -- montant, id NFT, description, etc.
  contractAddress VARCHAR(255), -- optionnel, pour token/NFT
  details TEXT, -- optionnel, infos complémentaires
  taskId VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_reward_task FOREIGN KEY (taskId) REFERENCES "Task"(id)
);
-- Table: User
CREATE TABLE "User" (
  address VARCHAR(255) PRIMARY KEY, -- Wallet address as unique ID
  role VARCHAR(20) NOT NULL,        -- Owner | Builder
  username VARCHAR(255),            -- Optional, for UI
  email VARCHAR(255),               -- Optional
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table: Project
CREATE TABLE "Project" (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  progress NUMERIC(5,2) DEFAULT 0,       -- number, could be percentage
  description TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  owner VARCHAR(255) NOT NULL,
  CONSTRAINT fk_project_owner FOREIGN KEY (owner) REFERENCES "User"(address)
);

-- Table: Task
CREATE TABLE "Task" (
  id VARCHAR(255) PRIMARY KEY,
  projectId VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  link VARCHAR(512),
  builder VARCHAR(255),
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  effort VARCHAR(50),
  -- priority: 0=low, 1=medium, 2=high
  priority INTEGER CHECK (priority IN (0, 1, 2)),
  -- status: 0=todo, 1=inprogress, 2=inreview, 3=done
  status INTEGER CHECK (status IN (0, 1, 2, 3)),
  CONSTRAINT fk_task_project FOREIGN KEY (projectId) REFERENCES "Project"(id),
  CONSTRAINT fk_task_builder FOREIGN KEY (builder) REFERENCES "User"(address)
);

-- Table: Category
CREATE TABLE "Category" (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

-- Project <-> Category (Many-to-Many)
CREATE TABLE "ProjectCategory" (
  projectId VARCHAR(255) NOT NULL,
  categoryId VARCHAR(255) NOT NULL,
  PRIMARY KEY (projectId, categoryId),
  FOREIGN KEY (projectId) REFERENCES "Project"(id),
  FOREIGN KEY (categoryId) REFERENCES "Category"(id)
);

-- Task <-> Category (Many-to-Many)
CREATE TABLE "TaskCategory" (
  taskId VARCHAR(255) NOT NULL,
  categoryId VARCHAR(255) NOT NULL,
  PRIMARY KEY (taskId, categoryId),
  FOREIGN KEY (taskId) REFERENCES "Task"(id),
  FOREIGN KEY (categoryId) REFERENCES "Category"(id)
);