import { Types } from 'mongoose';
import { TaskModel } from '../task/task.model';
import { TimeLogModel } from '../time-log/time-log.model';
import { TimeLogStatus } from '../time-log/time-log.interface';
import { TaskStatus } from '../task/task.interface';

function getTodayRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0)
  );
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999)
  );
  return { start, end };
}

export async function getDailySummary(userId: string) {
  const { start, end } = getTodayRange();
  const userObjectId = new Types.ObjectId(userId);

  // Unique task IDs the user logged time on today + total tracked seconds
  const timeLogAgg = await TimeLogModel.aggregate<{
    taskIds: Types.ObjectId[];
    totalTrackedSeconds: number;
  }>([
    {
      $match: {
        userId: userObjectId,
        startedAt: { $gte: start, $lte: end },
        status: TimeLogStatus.COMPLETED,
      },
    },
    {
      $group: {
        _id: null,
        taskIds: { $addToSet: '$taskId' },
        totalTrackedSeconds: { $sum: '$durationSeconds' },
      },
    },
  ]);

  const workedTaskIds: Types.ObjectId[] = timeLogAgg[0]?.taskIds ?? [];
  const totalTrackedSeconds: number = timeLogAgg[0]?.totalTrackedSeconds ?? 0;

  // Count tasks worked on today by status
  const statusCounts = await TaskModel.aggregate<{ _id: TaskStatus; count: number }>([
    {
      $match: {
        _id: { $in: workedTaskIds },
        userId: userObjectId,
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const countByStatus: Record<string, number> = {};
  for (const row of statusCounts) {
    countByStatus[row._id] = row.count;
  }

  return {
    date: start.toISOString().slice(0, 10),
    totalTrackedSeconds,
    tasksWorkedOnCount: workedTaskIds.length,
    completedTasksCount: countByStatus[TaskStatus.COMPLETED] ?? 0,
    inProgressTasksCount: countByStatus[TaskStatus.IN_PROGRESS] ?? 0,
    pendingTasksCount: countByStatus[TaskStatus.PENDING] ?? 0,
  };
}
