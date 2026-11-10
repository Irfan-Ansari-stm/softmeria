import { Router } from 'express';
import { projectController } from './projects.controller';
import { workspaceController } from '../workspaces/workspaces.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createProjectSchema, updateProjectSchema } from './projects.validator';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => projectController.listProjects(req, res, next));
router.post('/', validate(createProjectSchema), (req, res, next) =>
  projectController.createProject(req, res, next)
);

router.get('/:projectId', (req, res, next) =>
  projectController.getProject(req, res, next)
);

// Project Members
router.get('/:projectId/members', (req, res, next) =>
  workspaceController.listProjectMembers(req, res, next)
);
router.post('/:projectId/members', (req, res, next) =>
  workspaceController.assignProjectMember(req, res, next)
);
router.delete('/:projectId/members/:userId', (req, res, next) =>
  workspaceController.removeProjectMember(req, res, next)
);

router.put('/:projectId', validate(updateProjectSchema), (req, res, next) =>
  projectController.updateProject(req, res, next)
);

router.post('/:projectId/duplicate', (req, res, next) =>
  projectController.duplicateProject(req, res, next)
);

router.post('/:projectId/archive', (req, res, next) =>
  projectController.archiveProject(req, res, next)
);

router.post('/:projectId/restore', (req, res, next) =>
  projectController.restoreProject(req, res, next)
);

router.delete('/:projectId', (req, res, next) =>
  projectController.deleteProject(req, res, next)
);

export const projectRoutes = router;

