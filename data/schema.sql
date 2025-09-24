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
  priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')),
  status VARCHAR(15) CHECK (status IN ('todo', 'inprogress', 'done')),
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