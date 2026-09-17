import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { BadRequestError } from './error.middleware';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    if (error) {
      const message = error.details.map((detail) => detail.message).join(', ');
      next(new BadRequestError(message));
      return;
    }
    next();
  };
};
