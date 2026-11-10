import { Request, Response, NextFunction } from 'express';
import { productService } from './products.service';
import { sendSuccess } from '../../utils/response';

export class ProductController {
  async getProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = (req.query.projectId as string) || req.params.projectId;
      const product = await productService.getProduct(projectId);
      return sendSuccess(res, product, 'Product information retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async updateProductVision(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = (req.query.projectId as string) || req.params.projectId;
      const product = await productService.updateProductVision(projectId, req.body);
      return sendSuccess(res, product, 'Product vision updated');
    } catch (error) {
      return next(error);
    }
  }

  async listFeatures(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = (req.query.projectId as string) || req.params.projectId;
      const features = await productService.listFeatures(projectId);
      return sendSuccess(res, features, 'Features retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async createFeature(req: Request, res: Response, next: NextFunction) {
    try {
      const feature = await productService.createFeature(req.body);
      return sendSuccess(res, feature, 'Feature created', 201);
    } catch (error) {
      return next(error);
    }
  }

  async listRequirements(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = (req.query.projectId as string) || req.params.projectId;
      const featureId = req.query.featureId as string;
      const requirements = await productService.listRequirements(projectId, featureId);
      return sendSuccess(res, requirements, 'Requirements retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async createRequirement(req: Request, res: Response, next: NextFunction) {
    try {
      const requirement = await productService.createRequirement(req.body);
      return sendSuccess(res, requirement, 'Requirement created', 201);
    } catch (error) {
      return next(error);
    }
  }

  async listUserStories(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = (req.query.projectId as string) || req.params.projectId;
      const featureId = req.query.featureId as string;
      const stories = await productService.listUserStories(projectId, featureId);
      return sendSuccess(res, stories, 'User stories retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async createUserStory(req: Request, res: Response, next: NextFunction) {
    try {
      const story = await productService.createUserStory(req.body);
      return sendSuccess(res, story, 'User story created', 201);
    } catch (error) {
      return next(error);
    }
  }
}

export const productController = new ProductController();
