import mongoose, { Schema } from 'mongoose';
import { ITimeLogDocument, TimeLogStatus } from './time-log.interface';


const TimeLogSchema = new Schema<ITimeLogDocument>(
  {
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, default: null },
    durationSeconds: { type: Number, default: null },
    status: {
      type: String,
      enum: Object.values(TimeLogStatus),
      default: TimeLogStatus.ACTIVE,
      required: true,
    },
  },
  { timestamps: true }
);


export const TimeLogModel = mongoose.model<ITimeLogDocument>('TimeLog', TimeLogSchema);
