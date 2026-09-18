import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { taskController, taskValidation } from '../../modules/task';

const router = Router();

router.post(
  '/',
  authenticate,
  validate(taskValidation.createTaskSchema),
  taskController.createTask
);

router.get('/', authenticate, taskController.getAllTasks);

router.get('/:id', authenticate, taskController.getTaskById);

router.put(
  '/:id',
  authenticate,
  validate(taskValidation.updateTaskSchema),
  taskController.updateTask
);

router.delete('/:id', authenticate, taskController.deleteTask);

export default router;
