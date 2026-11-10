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

router.patch('/:workspaceId/members/:memberId/status', requireWorkspaceRole('ADMIN'), (req, res, next) =>
  workspaceController.updateMemberStatus(req, res, next)
);

router.get('/:workspaceId/team-stats', requireWorkspaceRole('VIEWER'), (req, res, next) =>
  workspaceController.getTeamStats(req, res, next)
);
router.get('/:workspaceId/team/stats', requireWorkspaceRole('VIEWER'), (req, res, next) =>
  workspaceController.getTeamStats(req, res, next)
);

// Invitations
router.get('/:workspaceId/invitations', requireWorkspaceRole('ADMIN'), (req, res, next) =>
  workspaceController.listInvitations(req, res, next)
);
router.delete('/:workspaceId/invitations/:invitationId', requireWorkspaceRole('ADMIN'), (req, res, next) =>
  workspaceController.cancelInvitation(req, res, next)
);
router.post('/:workspaceId/invitations/:invitationId/resend', requireWorkspaceRole('ADMIN'), (req, res, next) =>
  workspaceController.resendInvitation(req, res, next)
);
router.post('/invitations/accept', (req, res, next) =>
  workspaceController.acceptInvitation(req, res, next)
);

// Project Members
router.get('/projects/:projectId/members', (req, res, next) =>
  workspaceController.listProjectMembers(req, res, next)
);
router.post('/projects/:projectId/members', (req, res, next) =>
  workspaceController.assignProjectMember(req, res, next)
);
router.delete('/projects/:projectId/members/:userId', (req, res, next) =>
  workspaceController.removeProjectMember(req, res, next)
);

router.get('/:workspaceId/projects/:projectId/members', (req, res, next) =>
  workspaceController.listProjectMembers(req, res, next)
);
router.post('/:workspaceId/projects/:projectId/members', (req, res, next) =>
  workspaceController.assignProjectMember(req, res, next)
);
router.delete('/:workspaceId/projects/:projectId/members/:userId', (req, res, next) =>
  workspaceController.removeProjectMember(req, res, next)
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

