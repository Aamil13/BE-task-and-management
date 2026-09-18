import { Router } from 'express';
import authRoute from './auth.route';
import taskRoute from './task.route';
import timeLogsRoute from "./time-log.route"
import summaryRoute from './summary.route';
const router = Router();

interface IRoute {
  path: string;
  route: Router;
}

const routes: IRoute[] = [
  { path: '/auth', route: authRoute },
  { path: '/tasks', route: taskRoute },
  { path: '/time-logs', route: timeLogsRoute },
  { path: '/summary', route: summaryRoute },
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
