import { Router } from 'express';
import { releaseController } from './releases.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

// List & Create
router.get('/', (req, res, next) => releaseController.listReleases(req, res, next));
router.get('/projects/:projectId/releases', (req, res, next) => releaseController.listReleases(req, res, next));
router.post('/', (req, res, next) => releaseController.createRelease(req, res, next));

// Single release actions
router.get('/:id', (req, res, next) => releaseController.getRelease(req, res, next));
router.put('/:id', (req, res, next) => releaseController.updateRelease(req, res, next));
router.delete('/:id', (req, res, next) => releaseController.deleteRelease(req, res, next));
router.patch('/:id/checklist', (req, res, next) => releaseController.updateChecklist(req, res, next));
router.post('/:id/approvals', (req, res, next) => releaseController.approveRelease(req, res, next));
router.get('/:id/readiness', (req, res, next) => releaseController.getReleaseReadiness(req, res, next));

// Deployments & Rollbacks
router.post('/:id/deployments', (req, res, next) => releaseController.recordDeployment(req, res, next));
router.post('/:id/rollbacks', (req, res, next) => releaseController.recordRollback(req, res, next));
router.post('/:id/rollback', (req, res, next) => releaseController.recordRollback(req, res, next));

export const releaseRoutes = router;
