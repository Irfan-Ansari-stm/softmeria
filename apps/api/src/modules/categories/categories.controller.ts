import { Request, Response, NextFunction } from 'express';
import { categoryService } from './categories.service';
import { sendSuccess } from '../../utils/response';

export class CategoryController {
  async listCategoriesTree(req: Request, res: Response, next: NextFunction) {
    try {
      const tree = await categoryService.listCategoriesTree(req.params.projectId);
      return sendSuccess(res, tree, 'Categories tree retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.createCategory(req.params.projectId, req.body);
      return sendSuccess(res, category, 'Category created', 201);
    } catch (error) {
      return next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.updateCategory(req.params.categoryId, req.body);
      return sendSuccess(res, category, 'Category updated');
    } catch (error) {
      return next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await categoryService.deleteCategory(req.params.categoryId);
      return sendSuccess(res, result, 'Category deleted');
    } catch (error) {
      return next(error);
    }
  }

  async reorderCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await categoryService.reorderCategories(
        req.params.projectId,
        req.body.orderedIds
      );
      return sendSuccess(res, result, 'Categories reordered');
    } catch (error) {
      return next(error);
    }
  }
}

export const categoryController = new CategoryController();

