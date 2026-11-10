import { Router } from 'express';
import { portfolioController } from './portfolios.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => portfolioController.listPortfolios(req, res, next));
router.post('/', (req, res, next) => portfolioController.createPortfolio(req, res, next));
router.get('/:portfolioId', (req, res, next) => portfolioController.getPortfolio(req, res, next));
router.put('/:portfolioId', (req, res, next) => portfolioController.updatePortfolio(req, res, next));
router.delete('/:portfolioId', (req, res, next) => portfolioController.deletePortfolio(req, res, next));
router.post('/:portfolioId/archive', (req, res, next) => portfolioController.archivePortfolio(req, res, next));
router.post('/:portfolioId/duplicate', (req, res, next) => portfolioController.duplicatePortfolio(req, res, next));
router.post('/:portfolioId/projects', (req, res, next) => portfolioController.addProject(req, res, next));
router.delete('/:portfolioId/projects/:projectId', (req, res, next) => portfolioController.removeProject(req, res, next));
router.post('/:portfolioId/objectives', (req, res, next) => portfolioController.addObjective(req, res, next));
router.put('/objectives/:objectiveId', (req, res, next) => portfolioController.updateObjective(req, res, next));
router.delete('/objectives/:objectiveId', (req, res, next) => portfolioController.deleteObjective(req, res, next));

export const portfolioRoutes = router;
