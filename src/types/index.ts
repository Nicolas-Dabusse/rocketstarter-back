// User types
export interface User {
  address: string; // Wallet address as unique ID
  role: 'Owner' | 'Builder';
  username?: string;
  email?: string;
  createdAt: Date;
}

export interface CreateUserRequest {
  address: string;
  role: 'Owner' | 'Builder';
  username?: string;
  email?: string;
}

export interface UpdateUserRequest {
  role?: 'Owner' | 'Builder';
  username?: string;
  email?: string;
}

// Project types
export interface Project {
  id: number;
  name: string;
  progress: number; // percentage 0-100
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  owner: string; // User address
  contractAddress?: string;
  bank: number;
  whitelist: string[]; // array of whitelisted addresses
  twoCryptoId?: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  owner: string;
  bank: number;
  whitelist: string[];
  contractAddress?: string;
  twoCryptoId?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  progress?: number;
  description?: string;
  bank?: number;
  whitelist?: string[];
  contractAddress?: string;
  twoCryptoId?: string;
}

// Task types
// 0=low, 1=medium, 2=high
export type TaskPriority = 0 | 1 | 2;
export const TaskPriorityLabel: Record<TaskPriority, string> = {
  0: 'low',
  1: 'medium',
  2: 'high',
};

// 0=todo, 1=inprogress, 2=inreview, 3=done
export type TaskStatus = 0 | 1 | 2 | 3;
export const TaskStatusLabel: Record<TaskStatus, string> = {
  0: 'todo',
  1: 'inprogress',
  2: 'inreview',
  3: 'done',
};

export interface Task {
  id: number;
  contractAddress?: string;
  projectId: number;
  stepId?: number;
  title: string;
  image?: string;
  description?: string;
  link?: string;
  taskOwner?: string;
  builder?: string; // User address
  createdAt: Date;
  updatedAt: Date;
  effort?: number; // Fibonacci integer
  priority?: TaskPriority;
  status: TaskStatus;
  claimedAt?: Date;
  duration?: number; // in hours
  dueDate?: Date;
  dueDateStatus?: number;
}

export interface CreateTaskRequest {
  projectId: number;
  stepId?: number;
  title: string;
  contractAddress?: string;
  image?: string;
  description?: string;
  link?: string;
  taskOwner?: string;
  builder?: string;
  effort?: number;
  priority?: TaskPriority;
  status?: TaskStatus;
  duration?: number;
  dueDate?: Date;
  dueDateStatus?: number;
}

export interface UpdateTaskRequest {
  stepId?: number;
  title?: string;
  contractAddress?: string;
  image?: string;
  description?: string;
  link?: string;
  taskOwner?: string;
  builder?: string;
  effort?: number;
  priority?: TaskPriority;
  status?: TaskStatus;
  claimedAt?: Date;
  duration?: number;
  dueDate?: Date;
  dueDateStatus?: number;
}

// Category types
export interface Category {
  id: number;
  type: string;
  name: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  service: string;
}

export interface DatabaseTestResponse {
  status: string;
  timestamp: Date;
}

export interface ApiInfo {
  message: string;
  version: string;
  endpoints: {
    health: string;
    database: string;
    api: string;
  };
}