import { Router } from 'express';
import { productController } from './products.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

// Product vision
router.get('/', (req, res, next) => productController.getProduct(req, res, next));
router.put('/', (req, res, next) => productController.updateProductVision(req, res, next));

// Features
router.get('/features', (req, res, next) => productController.listFeatures(req, res, next));
router.post('/features', (req, res, next) => productController.createFeature(req, res, next));

// Requirements
router.get('/requirements', (req, res, next) => productController.listRequirements(req, res, next));
router.post('/requirements', (req, res, next) => productController.createRequirement(req, res, next));

// User Stories
router.get('/stories', (req, res, next) => productController.listUserStories(req, res, next));
router.post('/stories', (req, res, next) => productController.createUserStory(req, res, next));

export const productRoutes = router;
