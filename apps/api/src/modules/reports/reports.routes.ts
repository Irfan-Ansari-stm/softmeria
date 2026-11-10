import { Router } from 'express';
import { reportController } from './reports.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

// Export CSV
router.get('/export/csv', (req, res, next) => reportController.exportReportCSV(req, res, next));

// Executive and Detailed reports
router.get('/executive', (req, res, next) => reportController.getExecutiveReport(req, res, next));
router.get('/summary', (req, res, next) => reportController.getExecutiveReport(req, res, next));
router.get('/', (req, res, next) => reportController.getExecutiveReport(req, res, next));

export const reportRoutes = router;
