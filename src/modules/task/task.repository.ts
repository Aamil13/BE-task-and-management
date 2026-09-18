import { TaskModel } from './task.model';
import { ICreateTaskInput, IUpdateTaskInput } from './task.interface';

export const findById = (id: string) => TaskModel.findById(id);

export const findByUserId = (userId: string, skip: number, limit: number) =>
  TaskModel.find({ userId }).skip(skip).limit(limit).sort({ createdAt: -1 });

export const countByUserId = (userId: string) => TaskModel.countDocuments({ userId });

export const create = (input: ICreateTaskInput & { userId: string }) => TaskModel.create(input);

export const updateById = (id: string, input: IUpdateTaskInput) =>
  TaskModel.findByIdAndUpdate(id, input, { new: true, runValidators: true });

export const deleteById = (id: string) => TaskModel.findByIdAndDelete(id);

export const findByIdAndUserId = (id: string, userId: string) =>
  TaskModel.findOne({ _id: id, userId });
