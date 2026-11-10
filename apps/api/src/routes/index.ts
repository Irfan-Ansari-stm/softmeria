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
import { documentationSeedRoutes } from '../modules/documentation-seeds/seed-routes';

// SDLC Platform Module Routes
import { taskRoutes } from '../modules/tasks/tasks.routes';
import { boardRoutes } from '../modules/boards/boards.routes';
import { sprintRoutes } from '../modules/sprints/sprints.routes';
import { portfolioRoutes } from '../modules/portfolios/portfolios.routes';
import { productRoutes } from '../modules/products/products.routes';
import { milestoneRoutes } from '../modules/milestones/milestones.routes';
import { bugRoutes } from '../modules/bugs/bugs.routes';
import { testingRoutes } from '../modules/testing/testing.routes';
import { releaseRoutes } from '../modules/releases/releases.routes';
import { timeTrackingRoutes } from '../modules/time-tracking/time-tracking.routes';
import { discussionRoutes } from '../modules/discussions/discussions.routes';
import { riskRoutes } from '../modules/risks/risks.routes';
import { integrationRoutes } from '../modules/integrations/integrations.routes';
import { reportRoutes } from '../modules/reports/reports.routes';
import { notificationRoutes } from '../modules/notifications/notifications.routes';
import { calendarRoutes } from '../modules/calendar/calendar.routes';
import { designRoutes } from '../modules/design/design.routes';
import { developmentRoutes } from '../modules/development/development.routes';
import { filesRoutes } from '../modules/files/files.routes';
import { auditLogRoutes } from '../modules/audit-logs/audit-logs.routes';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authentication & Workspace
router.use('/auth', authRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/projects', projectRoutes);

// Planning & Portfolio
router.use('/portfolios', portfolioRoutes);
router.use('/products', productRoutes);
router.use('/milestones', milestoneRoutes);
router.use('/roadmaps', milestoneRoutes);
router.use('/calendar', calendarRoutes);
router.use('/sprints', sprintRoutes);

// Execution & Tasks
router.use('/tasks', taskRoutes);
router.use('/boards', boardRoutes);
router.use('/', boardRoutes); // For /projects/:projectId/board
router.use('/bugs', bugRoutes);
router.use('/time-entries', timeTrackingRoutes);

// Quality & Engineering
router.use('/testing', testingRoutes);
router.use('/releases', releaseRoutes);
router.use('/design', designRoutes);
router.use('/', developmentRoutes);

// Collaboration & Insights
router.use('/files', filesRoutes);
router.use('/discussions', discussionRoutes);
router.use('/risks', riskRoutes);
router.use('/integrations', integrationRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit-logs', auditLogRoutes);

// Existing Documentation & Assets
router.use('/', categoryRoutes);
router.use('/documents', documentRoutes);
router.use('/templates', templateRoutes);
router.use('/comments', commentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/search', searchRoutes);
router.use('/documentation-seeds', documentationSeedRoutes);
router.use('/', documentationSeedRoutes);
router.use('/', importExportRoutes);
router.use('/dashboard', dashboardRoutes);

export const apiRouter = router;
