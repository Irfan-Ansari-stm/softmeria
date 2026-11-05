import { Router } from 'express';
import { categoryController } from './categories.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  createCategorySchema,
  updateCategorySchema,
  reorderCategoriesSchema
} from './categories.validator';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/projects/:projectId/categories', (req, res, next) =>
  categoryController.listCategoriesTree(req, res, next)
);

router.post(
  '/projects/:projectId/categories',
  validate(createCategorySchema),
  (req, res, next) => categoryController.createCategory(req, res, next)
);

router.put('/categories/:categoryId', validate(updateCategorySchema), (req, res, next) =>
  categoryController.updateCategory(req, res, next)
);

router.delete('/categories/:categoryId', (req, res, next) =>
  categoryController.deleteCategory(req, res, next)
);

router.post(
  '/projects/:projectId/categories/reorder',
  validate(reorderCategoriesSchema),
  (req, res, next) => categoryController.reorderCategories(req, res, next)
);

export const categoryRoutes = router;

