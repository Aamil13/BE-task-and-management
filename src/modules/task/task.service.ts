import * as taskRepository from './task.repository';
import { NotFoundError } from '../../middlewares/error.middleware';
import { ICreateTaskInput, IUpdateTaskInput, ITaskResponse, TaskStatus } from './task.interface';
import logger from '../../utils/logger';

const formatTask = (task: any): ITaskResponse => ({
  id: task._id.toString(),
  title: task.title,
  description: task.description,
  status: task.status,
  userId: task.userId.toString(),
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

export const createTask = async (userId: string, input: ICreateTaskInput): Promise<ITaskResponse> => {
  const task = await taskRepository.create({
    ...input,
    status: TaskStatus.PENDING,
    userId,
  });

  logger.info({ taskId: task._id, userId }, 'Task created');

  return formatTask(task);
};

export const getAllTasks = async (userId: string): Promise<ITaskResponse[]> => {
  const tasks = await taskRepository.findByUserId(userId);
  return  tasks.map(formatTask);
};

export const getTaskById = async (taskId: string, userId: string): Promise<ITaskResponse> => {
  const task = await taskRepository.findByIdAndUserId(taskId, userId);
  if (!task) {
    throw new NotFoundError('Task not found');
  }

  return formatTask(task);
};

export const updateTask = async (
  taskId: string,
  userId: string,
  input: IUpdateTaskInput
): Promise<ITaskResponse> => {
  const existingTask = await taskRepository.findByIdAndUserId(taskId, userId);
  if (!existingTask) {
    throw new NotFoundError('Task not found');
  }

  const updatedTask = await taskRepository.updateById(taskId, input);
  if (!updatedTask) {
    throw new NotFoundError('Task not found');
  }

  logger.info({ taskId, userId }, 'Task updated');

  return formatTask(updatedTask);
};

export const deleteTask = async (taskId: string, userId: string): Promise<void> => {
  const existingTask = await taskRepository.findByIdAndUserId(taskId, userId);
  if (!existingTask) {
    throw new NotFoundError('Task not found');
  }

  await taskRepository.deleteById(taskId);

  logger.info({ taskId, userId }, 'Task deleted');
};
