import Joi from 'joi';

// Matches a Mongo ObjectId (24 hex chars). Used for route params like :taskId.
const objectId = Joi.string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/)
  .messages({
    'string.pattern.base': 'Must be a valid id',
    'any.required': 'Id is required',
  });

// Params: POST /tasks/:taskId/time-logs/start
export const startTrackingParamsSchema = Joi.object({
  taskId: objectId.required().messages({
    'any.required': 'taskId is required',
  }),
});

// Params: GET /tasks/:taskId/time-logs
export const getLogsForTaskParamsSchema = Joi.object({
  taskId: objectId.required().messages({
    'any.required': 'taskId is required',
  }),
});

// Params: GET /tasks/:taskId/time-logs/total
export const getTaskTimeTotalParamsSchema = Joi.object({
  taskId: objectId.required().messages({
    'any.required': 'taskId is required',
  }),
});

// Query: GET /time-logs
// Optional filters/pagination for the caller's full time-log history.
export const getLogsForUserQuerySchema = Joi.object({
  status: Joi.string().valid('ACTIVE', 'COMPLETED').optional().messages({
    'any.only': 'status must be either ACTIVE or COMPLETED',
  }),
  from: Joi.date().iso().optional().messages({
    'date.format': 'from must be a valid ISO date',
  }),
  to: Joi.date().iso().min(Joi.ref('from')).optional().messages({
    'date.format': 'to must be a valid ISO date',
    'date.min': 'to must be the same as or after from',
  }),
  page: Joi.number().integer().min(1).default(1).optional().messages({
    'number.min': 'page must be at least 1',
  }),
  limit: Joi.number().integer().min(1).max(100).default(20).optional().messages({
    'number.min': 'limit must be at least 1',
    'number.max': 'limit must not exceed 100',
  }),
});
