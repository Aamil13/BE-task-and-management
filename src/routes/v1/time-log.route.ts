import { Router } from 'express';
import { getLogsForTaskParamsSchema, getLogsForUserQuerySchema, getTaskTimeTotalParamsSchema, startTrackingParamsSchema } from '../../modules/time-log/time-log.validate';
import { timeLogController } from '../../modules/time-log';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate } from '../../middlewares/auth.middleware';



const router = Router();



// Task-scoped time-log routes
router.post(
  '/tasks/:taskId/time-logs/start',
  authenticate,
  validate(startTrackingParamsSchema,"params"),
  timeLogController.startTracking
);

router.get(
  '/tasks/:taskId/time-logs',
  authenticate,
  validate(getLogsForTaskParamsSchema,"params"),
  timeLogController.getLogsForTask
);

router.get(
  '/tasks/:taskId/time-logs/total',
  authenticate,
  validate(getTaskTimeTotalParamsSchema,"params"),
  timeLogController.getTaskTimeTotal
);

router.get(
  '/time-logs/total',
  authenticate,
  timeLogController.getUserAllTaskTimeTotal
);



// User-scoped time-log routes
router.post('/time-logs/active/stop',authenticate, timeLogController.stopActiveTracking);
router.get('/time-logs/active',authenticate, timeLogController.getActiveSession);

router.get(
  '/time-logs',
  authenticate,
  validate(getLogsForUserQuerySchema),
  timeLogController.getLogsForUser
);

export default router;
