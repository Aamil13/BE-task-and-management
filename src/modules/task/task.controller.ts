import { Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import * as taskService from './task.service';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const createTask = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error('Unauthorized');
  }
  const result = await taskService.createTask(req.user.id, req.body);
  res.status(httpStatus.CREATED).json({
    status: 'success',
    message: 'Task created successfully',
    data: result,
  });
});

export const getAllTasks = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error('Unauthorized');
  }

  const result = await taskService.getAllTasks(req.user.id);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: { tasks: result },
  });
});

export const getTaskById = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error('Unauthorized');
  }
  const result = await taskService.getTaskById(req.params.id, req.user.id);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: result,
  });
});

export const updateTask = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error('Unauthorized');
  }
  const result = await taskService.updateTask(req.params.id, req.user.id, req.body);
  res.status(httpStatus.OK).json({
    status: 'success',
    message: 'Task updated successfully',
    data: result,
  });
});

export const deleteTask = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error('Unauthorized');
  }
  await taskService.deleteTask(req.params.id, req.user.id);
  res.status(httpStatus.OK).json({
    status: 'success',
    message: 'Task deleted successfully',
  });
});
