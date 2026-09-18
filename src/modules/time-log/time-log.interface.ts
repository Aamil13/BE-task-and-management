import { Document, Types } from 'mongoose';

export enum TimeLogStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export interface ITimeLog {
  taskId: Types.ObjectId;
  userId: Types.ObjectId;
  startedAt: Date;
  endedAt: Date | null;
  durationSeconds: number | null;
  status: TimeLogStatus;
}

export interface ITimeLogDocument extends ITimeLog, Document {
  createdAt: Date;
  updatedAt: Date;
}

// Shape returned to the client for a task's aggregated time
export interface TaskTimeTotal {
  taskId: string;
  totalDurationSeconds: number; // sum of completed sessions
  activeSession: ITimeLogDocument | null; // present if currently tracking
}
