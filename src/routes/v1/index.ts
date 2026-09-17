import { Router } from 'express';
import authRoute from './auth.route';

const router = Router();

interface IRoute {
  path: string;
  route: Router;
}

const routes: IRoute[] = [
  { path: '/auth', route: authRoute },
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
