-- Table: Reward
CREATE TABLE "Reward" (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type VARCHAR(50) NOT NULL, -- ex: token, nft, free, btc, eth, custom, etc.
  value VARCHAR(255) NOT NULL, -- montant, id NFT, description, etc.
  contractAddress VARCHAR(255), -- optionnel, pour token/NFT
  details TEXT, -- optionnel, infos complémentaires
  taskId INTEGER NOT NULL,
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
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner VARCHAR(255) NOT NULL,
  progress INTEGER DEFAULT 0,           -- number, could be percentage
  project_status INTEGER CHECK (project_status IN (0, 1, 2, 3)) DEFAULT 0, -- 0=planning, 1=inprogress, 2=completed, 3=archived
  providerId VARCHAR(255),              -- optional, for 2crypto integration
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  bank NUMERIC(20,8) DEFAULT 0, -- total funds raised
  whitelist TEXT '[]', -- JSON array of whitelisted addresses
  CONSTRAINT fk_project_owner FOREIGN KEY (owner) REFERENCES "User"(address)
);
  

-- table: step
CREATE TABLE "Step" (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  projectId INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  progress NUMERIC(5,2) DEFAULT 0,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_step_project FOREIGN KEY (projectId) REFERENCES "Project"(id)
);


-- Table: Task
CREATE TABLE "Task" (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contractAddress VARCHAR(255),
  projectId INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  image VARCHAR(512),
  description TEXT,
  link VARCHAR(512),
  taskOwner VARCHAR(255), -- owner wallet
  builder VARCHAR(255),
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  effort INTEGER CHECK (effort IN (1, 2, 3, 5, 8, 13)), -- Fibonacci sequence
  priority INTEGER CHECK (priority IN (0, 1, 2)), -- priority: 0=low, 1=medium, 2=high
  status INTEGER CHECK (status IN (0, 1, 2, 3)), -- status: 0=todo, 1=inprogress, 2=inreview, 3=done
  claimedAt TIMESTAMP,
  duration INTEGER,
  dueDate TIMESTAMP,
  dueDateStatus INTEGER CHECK (dueDateStatus IN (0, 1, 2)), -- 0=onTime 1=EndingSoon 2=OutOfTime
  CONSTRAINT fk_task_project FOREIGN KEY (projectId) REFERENCES "Project"(id),
  CONSTRAINT fk_task_builder FOREIGN KEY (builder) REFERENCES "User"(address),
  CONSTRAINT fk_task_step FOREIGN KEY (stepId) REFERENCES "Step"(id),
  CONSTRAINT fk_task_taskOwner FOREIGN KEY (taskOwner) REFERENCES "User"(address)
);

-- Table: Category
CREATE TABLE "Category" (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL
);

-- Project <-> Category (Many-to-Many)
CREATE TABLE "ProjectCategory" (
  projectId INTEGER NOT NULL,
  categoryId INTEGER NOT NULL,
  PRIMARY KEY (projectId, categoryId),
  FOREIGN KEY (projectId) REFERENCES "Project"(id),
  FOREIGN KEY (categoryId) REFERENCES "Category"(id)
);

-- Task <-> Category (Many-to-Many)
CREATE TABLE "TaskCategory" (
  taskId INTEGER NOT NULL,
  categoryId INTEGER NOT NULL,
  PRIMARY KEY (taskId, categoryId),
  FOREIGN KEY (taskId) REFERENCES "Task"(id),
  FOREIGN KEY (categoryId) REFERENCES "Category"(id)
);