import { Router } from 'express';
import { workspaceController } from './workspaces.controller';
import { authenticate, requireWorkspaceRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteMemberSchema,
  updateMemberRoleSchema
} from './workspaces.validator';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => workspaceController.listUserWorkspaces(req, res, next));
router.post('/', validate(createWorkspaceSchema), (req, res, next) =>
  workspaceController.createWorkspace(req, res, next)
);

router.get('/:workspaceId', (req, res, next) =>
  workspaceController.getWorkspace(req, res, next)
);

router.put(
  '/:workspaceId',
  requireWorkspaceRole('ADMIN'),
  validate(updateWorkspaceSchema),
  (req, res, next) => workspaceController.updateWorkspace(req, res, next)
);

router.delete('/:workspaceId', requireWorkspaceRole('OWNER'), (req, res, next) =>
  workspaceController.deleteWorkspace(req, res, next)
);

router.get('/:workspaceId/members', requireWorkspaceRole('VIEWER'), (req, res, next) =>
  workspaceController.listMembers(req, res, next)
);

router.post(
  '/:workspaceId/members',
  requireWorkspaceRole('ADMIN'),
  validate(inviteMemberSchema),
  (req, res, next) => workspaceController.inviteMember(req, res, next)
);

router.put(
  '/:workspaceId/members/:memberId',
  requireWorkspaceRole('ADMIN'),
  validate(updateMemberRoleSchema),
  (req, res, next) => workspaceController.updateMemberRole(req, res, next)
);

router.delete(
  '/:workspaceId/members/:memberId',
  requireWorkspaceRole('ADMIN'),
  (req, res, next) => workspaceController.removeMember(req, res, next)
);

export const workspaceRoutes = router;

