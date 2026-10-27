import { Router } from 'express';
import {
  submitSkinQuiz, getSkinProfile, updateSkinProfile,
  getPersonalizedRecommendations, getRoutines, saveRoutine, updateRoutine
} from '../controllers/skinController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validate, skinQuizSchema } from '../validators/schemas.js';

const router = Router();

router.post('/skin-quiz', optionalAuth, validate(skinQuizSchema), submitSkinQuiz);

// Protected routes
router.get('/skin-profile', authenticate, getSkinProfile);
router.put('/skin-profile', authenticate, updateSkinProfile);
router.get('/recommendations', authenticate, getPersonalizedRecommendations);
router.get('/routines', authenticate, getRoutines);
router.post('/routines', authenticate, saveRoutine);
router.put('/routines/:routineId', authenticate, updateRoutine);

export default router;
