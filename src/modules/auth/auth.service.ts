import jwt from 'jsonwebtoken';
import { config } from '../../config/env';
import * as authRepository from './auth.repository';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../middlewares/error.middleware';
import { IRegisterInput, ILoginInput, IAuthResponse } from './auth.interface';
import logger from '../../utils/logger';

const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

export const register = async (input: IRegisterInput): Promise<IAuthResponse> => {
  const existingEmail = await authRepository.findByEmail(input.email);
  if (existingEmail) {
    throw new ConflictError('Email already in use');
  }

  const existingUserName = await authRepository.findByUserName(input.userName);
  if (existingUserName) {
    throw new ConflictError('Username already in use');
  }

  const user = await authRepository.create(input);
  const token = generateToken(user._id.toString());

  logger.info({ userId: user._id }, 'New user registered');

  return {
    user: {
      id: user._id.toString(),
      userName: user.userName,
      email: user.email,
    },
    token,
  };
};

export const login = async (input: ILoginInput): Promise<IAuthResponse> => {
  const user = await authRepository.findByEmail(input.email);
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const userWithPassword = await authRepository.findByIdWithPassword(user._id.toString());
  if (!userWithPassword) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isPasswordValid = await userWithPassword.comparePassword(input.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const token = generateToken(user._id.toString());

  logger.info({ userId: user._id }, 'User logged in');

  return {
    user: {
      id: user._id.toString(),
      userName: user.userName,
      email: user.email,
    },
    token,
  };
};

export const getMe = async (userId: string): Promise<IAuthResponse['user']> => {
  const user = await authRepository.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  return {
    id: user._id.toString(),
    userName: user.userName,
    email: user.email,
  };
};

export const logout = async (userId: string): Promise<void> => {
  logger.info({ userId }, 'User logged out');
};
