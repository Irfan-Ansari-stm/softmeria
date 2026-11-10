import { Router } from 'express';
import { testingController } from './testing.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

// Plans & Suites
router.get('/plans', (req, res, next) => testingController.listTestPlans(req, res, next));
router.get('/projects/:projectId/plans', (req, res, next) => testingController.listTestPlans(req, res, next));
router.post('/plans', (req, res, next) => testingController.createTestPlan(req, res, next));
router.post('/suites', (req, res, next) => testingController.createTestSuite(req, res, next));

// Test Cases
router.get('/cases', (req, res, next) => testingController.listTestCases(req, res, next));
router.post('/cases', (req, res, next) => testingController.createTestCase(req, res, next));
router.put('/cases/:id', (req, res, next) => testingController.updateTestCase(req, res, next));
router.delete('/cases/:id', (req, res, next) => testingController.deleteTestCase(req, res, next));
router.post('/cases/:id/duplicate', (req, res, next) => testingController.duplicateTestCase(req, res, next));
router.patch('/cases/:id/status', (req, res, next) => testingController.updateTestCaseStatus(req, res, next));
router.post('/executions', (req, res, next) => testingController.updateTestCaseStatus(req, res, next));

// Test Runs
router.get('/runs', (req, res, next) => testingController.listTestRuns(req, res, next));
router.post('/runs', (req, res, next) => testingController.createTestRun(req, res, next));

// Quality Reports
router.get('/reports', (req, res, next) => testingController.getQualityReports(req, res, next));

export const testingRoutes = router;
