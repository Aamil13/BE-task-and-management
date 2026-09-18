import Joi from 'joi';
import { TaskStatus } from './task.interface';

export const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required().messages({
    'string.min': 'Title must be at least 1 character long',
    'string.max': 'Title must not exceed 200 characters',
    'any.required': 'Title is required',
  }),
  description: Joi.string().trim().max(1000).optional().messages({
    'string.max': 'Description must not exceed 1000 characters',
  }),

});

export const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).optional().messages({
    'string.min': 'Title must be at least 1 character long',
    'string.max': 'Title must not exceed 200 characters',
  }),
  description: Joi.string().trim().max(1000).optional().messages({
    'string.max': 'Description must not exceed 1000 characters',
  }),
  status: Joi.string()
    .valid(...Object.values(TaskStatus))
    .optional()
    .messages({
      'any.only': `Status must be one of: ${Object.values(TaskStatus).join(', ')}`,
    }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});
