import { Router } from 'express';
import { documentationSeedController } from './seed-controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Public / Authenticated manifest preview endpoint
router.get('/manifest', (req, res, next) =>
  documentationSeedController.getManifest(req, res, next)
);

// Seed blueprint on a project
router.post('/projects/:projectId/seed-blueprint', authenticate, (req, res, next) =>
  documentationSeedController.seedProjectBlueprint(req, res, next)
);

// Apply specific category to a project
router.post('/projects/:projectId/seed-blueprint/category', authenticate, (req, res, next) =>
  documentationSeedController.applyCategory(req, res, next)
);

export const documentationSeedRoutes = router;
