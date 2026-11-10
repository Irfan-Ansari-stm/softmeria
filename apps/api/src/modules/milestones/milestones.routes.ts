import { Router } from 'express';
import { milestoneController } from './milestones.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

// Roadmap item routes (support both /items and /roadmaps/items)
router.post('/items', (req, res, next) => milestoneController.createRoadmapItem(req, res, next));
router.put('/items/:itemId', (req, res, next) => milestoneController.updateRoadmapItem(req, res, next));
router.delete('/items/:itemId', (req, res, next) => milestoneController.deleteRoadmapItem(req, res, next));
router.post('/roadmaps/items', (req, res, next) => milestoneController.createRoadmapItem(req, res, next));
router.put('/roadmaps/items/:itemId', (req, res, next) => milestoneController.updateRoadmapItem(req, res, next));
router.delete('/roadmaps/items/:itemId', (req, res, next) => milestoneController.deleteRoadmapItem(req, res, next));

// Roadmap root or Milestone root depending on mount point
router.get('/', (req, res, next) => {
  if (req.baseUrl.endsWith('/roadmaps')) {
    return milestoneController.getRoadmap(req, res, next);
  }
  return milestoneController.listMilestones(req, res, next);
});

router.get('/roadmaps', (req, res, next) => milestoneController.getRoadmap(req, res, next));

// Milestone routes
router.post('/', (req, res, next) => milestoneController.createMilestone(req, res, next));
router.get('/:milestoneId', (req, res, next) => milestoneController.getMilestone(req, res, next));
router.put('/:milestoneId', (req, res, next) => milestoneController.updateMilestone(req, res, next));
router.patch('/:milestoneId', (req, res, next) => milestoneController.updateMilestone(req, res, next));
router.delete('/:milestoneId', (req, res, next) => milestoneController.deleteMilestone(req, res, next));
router.post('/:milestoneId/tasks', (req, res, next) => milestoneController.linkTask(req, res, next));
router.delete('/:milestoneId/tasks/:taskId', (req, res, next) => milestoneController.unlinkTask(req, res, next));

export const milestoneRoutes = router;
