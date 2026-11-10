import { Router } from 'express';
import { designController } from './design.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

// Tokens
router.get('/tokens', (req, res, next) => designController.listTokens(req, res, next));
router.post('/tokens', (req, res, next) => designController.createToken(req, res, next));
router.put('/tokens/:id', (req, res, next) => designController.updateToken(req, res, next));
router.delete('/tokens/:id', (req, res, next) => designController.deleteToken(req, res, next));

// Palettes
router.get('/palettes', (req, res, next) => designController.listPalettes(req, res, next));
router.post('/palettes', (req, res, next) => designController.createPalette(req, res, next));

// Themes
router.get('/themes', (req, res, next) => designController.listThemes(req, res, next));
router.post('/themes', (req, res, next) => designController.createTheme(req, res, next));
router.patch('/themes/:id/publish', (req, res, next) => designController.publishTheme(req, res, next));

// Component Specs
router.get('/components', (req, res, next) => designController.listComponents(req, res, next));
router.post('/components', (req, res, next) => designController.createComponent(req, res, next));
router.put('/components/:id', (req, res, next) => designController.updateComponent(req, res, next));
router.delete('/components/:id', (req, res, next) => designController.deleteComponent(req, res, next));

// Export
router.get('/export', (req, res, next) => designController.exportTokens(req, res, next));

export const designRoutes = router;
