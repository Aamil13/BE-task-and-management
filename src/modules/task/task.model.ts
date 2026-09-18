import mongoose, { Schema } from 'mongoose';
import { ITaskDocument, TaskStatus } from './task.interface';

const TaskSchema = new Schema<ITaskDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.PENDING,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const TaskModel = mongoose.model<ITaskDocument>('Task', TaskSchema);
