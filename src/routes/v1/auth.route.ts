import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { authController, authValidation } from '../../modules/auth';
import { authLimiter } from '../../middlewares/rateLimiter.middleware';

const router = Router();

router.post('/register', validate(authValidation.registerSchema), authController.register);
router.post('/login', authLimiter, validate(authValidation.loginSchema), authController.login);
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authenticate, authController.logout);

export default router;
