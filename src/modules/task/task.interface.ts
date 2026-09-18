import { Document, Types } from 'mongoose';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export interface ITask {
  title: string;
  description?: string;
  status: TaskStatus;
  userId: Types.ObjectId;
}

export interface ITaskDocument extends ITask, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
}

export interface IUpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

export interface ITaskResponse {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPaginatedTasksResponse {
  tasks: ITaskResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
