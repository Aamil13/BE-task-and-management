import { Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { timeLogService } from '.';


/**
 * POST /api/tasks/:taskId/time-logs/start
 * Starts tracking time on a task.
 */
export const startTracking = catchAsync(async (req: AuthRequest, res: Response) => {

  console.log(req.user)
  if (!req.user) {
    throw new Error('Unauthorized');
  }

  const { taskId } = req.params;
  const result = await timeLogService.startTracking(taskId, req.user.id);
  res.status(httpStatus.CREATED).json({
    status: 'success',
    data: { timeLog: result },
  });
});

/**
 * POST /api/time-logs/active/stop
 * Stops the caller's currently active session (if any).
 */
export const stopActiveTracking = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error('Unauthorized');
  }

  const result = await timeLogService.stopActiveTracking(req.user.id);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: { timeLog: result },
  });
});

/**
 * GET /api/time-logs/active
 * Returns the caller's active session, or null.
 * Used on app load / page refresh to resume the running timer.
 */
export const getActiveSession = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error('Unauthorized');
  }

  const result = await timeLogService.getActiveSession(req.user.id);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: { timeLog: result },
  });
});

/**
 * GET /api/tasks/:taskId/time-logs
 * Lists all time logs for a task.
 */
export const getLogsForTask = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error('Unauthorized');
  }

  const { taskId } = req.params;

  const result = await timeLogService.getLogsForTask(taskId, req.user.id);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: { timeLogs: result },
  });
});

/**
 * GET /api/tasks/:taskId/time-logs/total
 * Returns total completed duration + active session (if any) for a task.
 */
export const getTaskTimeTotal = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error('Unauthorized');
  }

  const { taskId } = req.params;

  const result = await timeLogService.getTaskTimeTotal(taskId, req.user.id);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: { total: result },
  });
});



export const getUserAllTaskTimeTotal = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error('Unauthorized');
  }

  const result = await timeLogService.getUserAllTaskTimeTotal( req.user.id);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: { total: result },
  });
});




/**
 * GET /api/time-logs
 * Lists all time logs for the caller, across all tasks.
 */
export const getLogsForUser = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error('Unauthorized');
  }

  const result = await timeLogService.getLogsForUser(req.user.id);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: { timeLogs: result },
  });
});
