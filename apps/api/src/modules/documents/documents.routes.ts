import { Router } from 'express';
import { documentController } from './documents.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  createDocumentSchema,
  updateDocumentSchema,
  moveDocumentSchema,
  restoreVersionSchema
} from './documents.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate(createDocumentSchema), (req, res, next) =>
  documentController.createDocument(req, res, next)
);

router.get('/:documentId', (req, res, next) =>
  documentController.getDocument(req, res, next)
);

router.put('/:documentId', validate(updateDocumentSchema), (req, res, next) =>
  documentController.updateDocument(req, res, next)
);

router.post('/:documentId/duplicate', (req, res, next) =>
  documentController.duplicateDocument(req, res, next)
);

router.post('/:documentId/move', validate(moveDocumentSchema), (req, res, next) =>
  documentController.moveDocument(req, res, next)
);

router.post('/:documentId/archive', (req, res, next) =>
  documentController.archiveDocument(req, res, next)
);

router.post('/:documentId/restore', (req, res, next) =>
  documentController.restoreDocument(req, res, next)
);

router.delete('/:documentId', (req, res, next) =>
  documentController.deleteDocument(req, res, next)
);

router.get('/:documentId/versions', (req, res, next) =>
  documentController.listVersions(req, res, next)
);

router.get('/:documentId/versions/:versionNumber', (req, res, next) =>
  documentController.getVersion(req, res, next)
);

router.post(
  '/:documentId/versions/restore',
  validate(restoreVersionSchema),
  (req, res, next) => documentController.restoreVersion(req, res, next)
);

export const documentRoutes = router;

