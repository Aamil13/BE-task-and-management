import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { BadRequestError } from './error.middleware';

type ValidationSource = 'body' | 'params' | 'query';

export const validate = (
  schema: Joi.ObjectSchema,
  source: ValidationSource = 'body'
) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const message = error.details.map((detail) => detail.message).join(', ');
      next(new BadRequestError(message));
      return;
    }
    req[source] = value;
    next();
  };
};
