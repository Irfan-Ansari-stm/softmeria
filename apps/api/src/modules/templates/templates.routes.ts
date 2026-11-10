import { Router } from 'express';
import { templateController } from './templates.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createTemplateSchema, applyTemplateSchema } from './templates.validator';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => templateController.listTemplates(req, res, next));
router.post('/', validate(createTemplateSchema), (req, res, next) =>
  templateController.createTemplate(req, res, next)
);

router.get('/:templateId', (req, res, next) =>
  templateController.getTemplate(req, res, next)
);

router.put('/:templateId', (req, res, next) =>
  templateController.updateTemplate(req, res, next)
);

router.delete('/:templateId', (req, res, next) =>
  templateController.deleteTemplate(req, res, next)
);

router.post('/:templateId/duplicate', (req, res, next) =>
  templateController.duplicateTemplate(req, res, next)
);

router.post('/:templateId/apply', validate(applyTemplateSchema), (req, res, next) =>
  templateController.applyTemplate(req, res, next)
);

export const templateRoutes = router;
