import { Router } from 'express';
import multer from 'multer';
import { importExportController } from './import-export.controller';
import { authenticate } from '../../middleware/auth';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});

const router = Router();

router.use(authenticate);

router.get('/documents/:documentId/export', (req, res, next) =>
  importExportController.exportSingleDoc(req, res, next)
);

router.get('/projects/:projectId/export', (req, res, next) =>
  importExportController.exportProjectZip(req, res, next)
);

router.get('/categories/:categoryId/export', (req, res, next) =>
  importExportController.exportCategoryZip(req, res, next)
);

router.post('/import/files', upload.array('files', 20), (req, res, next) =>
  importExportController.importFiles(req, res, next)
);

router.post('/import/zip', upload.single('zipFile'), (req, res, next) =>
  importExportController.importZip(req, res, next)
);

export const importExportRoutes = router;

