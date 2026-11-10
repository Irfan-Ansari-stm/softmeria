import { Router } from 'express';
import { developmentController } from './development.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

// Repositories
router.get('/repositories', (req, res, next) => developmentController.listRepositories(req, res, next));
router.post('/repositories', (req, res, next) => developmentController.createRepository(req, res, next));
router.put('/repositories/:id', (req, res, next) => developmentController.updateRepository(req, res, next));
router.delete('/repositories/:id', (req, res, next) => developmentController.deleteRepository(req, res, next));
router.post('/repositories/:id/sync', (req, res, next) => developmentController.syncRepository(req, res, next));

// Pull Requests
router.get('/pull-requests', (req, res, next) => developmentController.listPullRequests(req, res, next));
router.get('/repositories/pull-requests', (req, res, next) => developmentController.listPullRequests(req, res, next));
router.post('/pull-requests', (req, res, next) => developmentController.createPullRequest(req, res, next));
router.post('/repositories/pull-requests', (req, res, next) => developmentController.createPullRequest(req, res, next));
router.patch('/pull-requests/:id/status', (req, res, next) => developmentController.updatePullRequestStatus(req, res, next));

// CI/CD Pipelines
router.get('/pipelines', (req, res, next) => developmentController.listPipelines(req, res, next));
router.get('/repositories/pipelines', (req, res, next) => developmentController.listPipelines(req, res, next));
router.post('/pipelines/trigger', (req, res, next) => developmentController.triggerPipeline(req, res, next));
router.post('/repositories/pipelines', (req, res, next) => developmentController.triggerPipeline(req, res, next));

// Stats
router.get('/development/stats', (req, res, next) => developmentController.getDevelopmentStats(req, res, next));
router.get('/repositories/stats', (req, res, next) => developmentController.getDevelopmentStats(req, res, next));

export const developmentRoutes = router;
