import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes';
import { workspaceRoutes } from '../modules/workspaces/workspaces.routes';
import { projectRoutes } from '../modules/projects/projects.routes';
import { categoryRoutes } from '../modules/categories/categories.routes';
import { documentRoutes } from '../modules/documents/documents.routes';
import { templateRoutes } from '../modules/templates/templates.routes';
import { commentRoutes } from '../modules/comments/comments.routes';
import { reviewRoutes } from '../modules/reviews/reviews.routes';
import { searchRoutes } from '../modules/search/search.routes';
import { importExportRoutes } from '../modules/imports-exports/import-export.routes';
import { dashboardRoutes } from '../modules/dashboard/dashboard.routes';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/projects', projectRoutes);
router.use('/', categoryRoutes);
router.use('/documents', documentRoutes);
router.use('/templates', templateRoutes);
router.use('/comments', commentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/search', searchRoutes);
router.use('/', importExportRoutes);
router.use('/dashboard', dashboardRoutes);

export const apiRouter = router;

