import { Types } from 'mongoose';
import { TaskModel } from '../task/task.model';
import { AppError } from '../../middlewares/error.middleware';
import { ITimeLogDocument, TaskTimeTotal, TimeLogStatus } from './time-log.interface';
import { TimeLogModel } from './time-log.model';


/**
 * Ensures the task exists and belongs to the requesting user.
 * Throws 404 if not found, so ownership checks and "not found" checks
 * collapse into a single, non-leaky error.
 */
async function assertTaskOwnership(taskId: string, userId: string): Promise<void> {
  const task = await TaskModel.exists({ _id: taskId, userId });
  if (!task) {
    throw new AppError('Task not found', 404);
  }
}

/**
 * Starts a new time-tracking session for a task.
 * Only one active session is allowed per user across all tasks.
 */
export async function startTracking(
  taskId: string,
  userId: string
): Promise<ITimeLogDocument> {
  await assertTaskOwnership(taskId, userId);

  const existingActive = await TimeLogModel.findOne({
    userId,
    status: TimeLogStatus.ACTIVE,
  });

  if (existingActive) {
    throw new AppError(
      existingActive.taskId.toString() === taskId
        ? 'This task is already being tracked'
        : 'Another task is already being tracked. Stop it before starting a new one.',
      409
    );
  }

  try {
    const timeLog = await TimeLogModel.create({
      taskId: new Types.ObjectId(taskId),
      userId: new Types.ObjectId(userId),
      startedAt: new Date(),
      status: TimeLogStatus.ACTIVE,
    });
    return timeLog;
  } catch (err: unknown) {
    // Race condition guard: the partial unique index rejects a second
    // concurrent insert even if the check above raced past it.
    if (isDuplicateKeyError(err)) {
      throw new AppError('Another task is already being tracked.', 409);
    }
    throw err;
  }
}

/**
 * Stops the caller's currently active session, wherever it is.
 * The client does not need to know the time-log id — there can only
 * ever be one active session per user.
 */
export async function stopActiveTracking(userId: string): Promise<ITimeLogDocument> {
  const activeLog = await TimeLogModel.findOne({
    userId,
    status: TimeLogStatus.ACTIVE,
  });

  if (!activeLog) {
    throw new AppError('No active tracking session found', 404);
  }

  const endedAt = new Date();
  const durationSeconds = Math.max(
    0,
    Math.floor((endedAt.getTime() - activeLog.startedAt.getTime()) / 1000)
  );

  activeLog.endedAt = endedAt;
  activeLog.durationSeconds = durationSeconds;
  activeLog.status = TimeLogStatus.COMPLETED;
  await activeLog.save();

  return activeLog;
}

/**
 * Returns the caller's active session, if any.
 * The frontend uses `startedAt` from this to compute elapsed time
 * from timestamps rather than trusting a client-side counter, and to
 * recover an in-progress timer after a page refresh.
 */
export async function getActiveSession(
  userId: string
): Promise<ITimeLogDocument | any> {
  return TimeLogModel.findOne({ userId, status: TimeLogStatus.ACTIVE }).lean();
}

/**
 * Lists all time logs for a task (most recent first), scoped to the
 * requesting user so one user cannot read another user's logs.
 */
export async function getLogsForTask(
  taskId: string,
  userId: string
): Promise<ITimeLogDocument[] | any> {
  await assertTaskOwnership(taskId, userId);

  return TimeLogModel.find({ taskId }).sort({ startedAt: -1 }).lean();
}

/**
 * Returns total tracked time for a task (sum of completed sessions),
 * plus the active session if the task is currently being tracked so
 * the client can add "live" elapsed time on top of the total.
 */
export async function getTaskTimeTotal(
  taskId: string,
  userId: string
): Promise<TaskTimeTotal | any > {
  await assertTaskOwnership(taskId, userId);

  const [aggregate, activeSession] = await Promise.all([
    TimeLogModel.aggregate<{ _id: null; total: number }>([
      {
        $match: {
          taskId: new Types.ObjectId(taskId),
          status: TimeLogStatus.COMPLETED,
        },
      },
      { $group: { _id: null, total: { $sum: '$durationSeconds' } } },
    ]),
    TimeLogModel.findOne({
      taskId,
      status: TimeLogStatus.ACTIVE,
    }).lean(),
  ]);

  return {
    taskId,
    totalDurationSeconds: aggregate[0]?.total ?? 0,
    activeSession: activeSession ?? null,
  };
}

/**
 * Lists all time logs for the caller across all tasks, most recent
 * first. Used for a "recent activity" / history view.
 */
export async function getLogsForUser(userId: string): Promise<ITimeLogDocument[] | any> {
  return TimeLogModel.find({ userId }).sort({ startedAt: -1 }).lean();
}

function isDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: number }).code === 11000
  );
}
