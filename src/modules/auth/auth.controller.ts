import { Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import * as authService from './auth.service';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const register = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await authService.register(req.body);
  res.status(httpStatus.CREATED).json({
    status: 'success',
    message: 'Account created successfully',
    data: result,
  });
});

export const login = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await authService.login(req.body);
  res.status(httpStatus.OK).json({
    status: 'success',
    message: 'Login successful',
    data: result,
  });
});

export const getMe = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error('Unauthorized');
  }
  const result = await authService.getMe(req.user.id);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: result,
  });
});

export const logout = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error('Unauthorized');
  }
  await authService.logout(req.user.id);
  res.status(httpStatus.OK).json({
    status: 'success',
    message: 'Logout successful',
  });
});
