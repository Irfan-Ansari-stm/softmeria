import { Router } from 'express';
import { auditLogController } from './audit-logs.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/export/csv', (req, res, next) => auditLogController.exportAuditLogsCSV(req, res, next));
router.get('/', (req, res, next) => auditLogController.listAuditLogs(req, res, next));
router.get('/:id', (req, res, next) => auditLogController.getAuditLog(req, res, next));

export const auditLogRoutes = router;
