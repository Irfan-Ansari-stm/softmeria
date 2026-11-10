import { Router } from 'express';
import { integrationController } from './integrations.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', (req, res, next) => integrationController.listIntegrations(req, res, next));
router.post('/:provider/connect', (req, res, next) => integrationController.connectIntegration(req, res, next));
router.post('/:provider/test', (req, res, next) => integrationController.testConnection(req, res, next));
router.post('/:provider/sync', (req, res, next) => integrationController.syncIntegration(req, res, next));
router.delete('/:provider/disconnect', (req, res, next) => integrationController.disconnectIntegration(req, res, next));
router.post('/:integrationId/toggle', (req, res, next) => integrationController.toggleIntegration(req, res, next));

export const integrationRoutes = router;
