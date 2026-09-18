import { Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { getDailySummary } from './summary.service';

/**
 * GET /api/v1/summary/daily
 * Returns a summary for the current day: tasks worked on, total time tracked,
 * and counts broken down by status (completed / in_progress / pending).
 */
export const getDailySummaryHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error('Unauthorized');
  }

  const summary = await getDailySummary(req.user.id);

  res.status(httpStatus.OK).json({
    status: 'success',
    data: { summary },
  });
});
