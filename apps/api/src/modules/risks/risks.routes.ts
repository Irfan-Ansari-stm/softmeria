import { Router } from 'express';
import { riskController } from './risks.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

// Matrix, Stats & Exports (before :id)
router.get('/matrix', (req, res, next) => riskController.getRiskMatrix(req, res, next));
router.get('/export/csv', (req, res, next) => riskController.exportRisksCSV(req, res, next));

// Dependencies (before :id)
router.get('/dependencies', (req, res, next) => riskController.listDependencies(req, res, next));
router.post('/dependencies', (req, res, next) => riskController.createDependency(req, res, next));
router.put('/dependencies/:depId', (req, res, next) => riskController.updateDependency(req, res, next));
router.delete('/dependencies/:depId', (req, res, next) => riskController.deleteDependency(req, res, next));
router.get('/dependencies/export/csv', (req, res, next) => riskController.exportDependenciesCSV(req, res, next));

// Single Risk Actions
router.post('/:id/mitigations', (req, res, next) => riskController.addMitigation(req, res, next));
router.put('/mitigations/:mitigationId', (req, res, next) => riskController.updateMitigation(req, res, next));
router.patch('/mitigations/:mitigationId', (req, res, next) => riskController.updateMitigation(req, res, next));
router.post('/:id/comments', (req, res, next) => riskController.addComment(req, res, next));

// Standard Risk CRUD
router.get('/', (req, res, next) => riskController.listRisks(req, res, next));
router.post('/', (req, res, next) => riskController.createRisk(req, res, next));
router.get('/:id', (req, res, next) => riskController.getRisk(req, res, next));
router.put('/:id', (req, res, next) => riskController.updateRisk(req, res, next));
router.patch('/:id', (req, res, next) => riskController.updateRisk(req, res, next));
router.delete('/:id', (req, res, next) => riskController.deleteRisk(req, res, next));

export const riskRoutes = router;
