import { Router } from 'express';
import { discussionController } from './discussions.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

// RFCs (place before /:id parameter matchers)
router.get('/rfcs', (req, res, next) => discussionController.listRFCs(req, res, next));
router.post('/rfcs', (req, res, next) => discussionController.createRFC(req, res, next));
router.get('/rfcs/:id', (req, res, next) => discussionController.getRFC(req, res, next));
router.put('/rfcs/:id', (req, res, next) => discussionController.updateRFC(req, res, next));
router.post('/rfcs/:id/vote', (req, res, next) => discussionController.voteRFC(req, res, next));
router.post('/rfcs/:id/reviews', (req, res, next) => discussionController.reviewRFC(req, res, next));

// Architecture Decisions (ADR)
router.get('/decisions', (req, res, next) => discussionController.listDecisions(req, res, next));
router.get('/adrs', (req, res, next) => discussionController.listDecisions(req, res, next));
router.post('/decisions', (req, res, next) => discussionController.createDecision(req, res, next));
router.post('/adrs', (req, res, next) => discussionController.createDecision(req, res, next));

// Comments
router.post('/:id/comments', (req, res, next) => discussionController.addComment(req, res, next));
router.put('/comments/:commentId', (req, res, next) => discussionController.updateComment(req, res, next));
router.delete('/comments/:commentId', (req, res, next) => discussionController.deleteComment(req, res, next));
router.post('/comments/:commentId/reactions', (req, res, next) => discussionController.reactToComment(req, res, next));

// Discussions
router.get('/', (req, res, next) => discussionController.listDiscussions(req, res, next));
router.post('/', (req, res, next) => discussionController.createDiscussion(req, res, next));
router.get('/:id', (req, res, next) => discussionController.getDiscussion(req, res, next));
router.put('/:id', (req, res, next) => discussionController.updateDiscussion(req, res, next));
router.delete('/:id', (req, res, next) => discussionController.deleteDiscussion(req, res, next));
router.patch('/:id/resolve', (req, res, next) => discussionController.resolveDiscussion(req, res, next));

export const discussionRoutes = router;
