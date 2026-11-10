import { Request, Response, NextFunction } from 'express';
import { documentationSeedService } from './seed-service';
import { BlueprintOption } from './types/seed.types';

export class DocumentationSeedController {
  async getManifest(req: Request, res: Response, next: NextFunction) {
    try {
      const option = (req.query.option as BlueprintOption) || 'FULL';
      const projectName = req.query.projectName as string | undefined;

      const summary = documentationSeedService.getManifestSummary(option, {
        projectName,
        blueprintOption: option
      });

      res.status(200).json({
        success: true,
        data: summary,
        message: 'Documentation blueprint manifest retrieved successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  async seedProjectBlueprint(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const userId = (req as any).user?.id || 'system';
      const { blueprintOption, selectedCategories, selectedDocumentIds } = req.body;

      const result = await documentationSeedService.seedProjectDocumentation(projectId, userId, {
        blueprintOption: blueprintOption || 'FULL',
        selectedCategories,
        selectedDocumentIds
      });

      res.status(200).json({
        success: true,
        data: result,
        message: `Successfully seeded documentation blueprint (${result.documentsCreated} documents created, ${result.documentsSkipped} skipped)`
      });
    } catch (err) {
      next(err);
    }
  }

  async applyCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const userId = (req as any).user?.id || 'system';
      const { categorySlug } = req.body;

      if (!categorySlug) {
        return res.status(400).json({
          success: false,
          message: 'categorySlug is required'
        });
      }

      const result = await documentationSeedService.applyBlueprintCategory(
        projectId,
        categorySlug,
        userId
      );

      res.status(200).json({
        success: true,
        data: result,
        message: `Successfully applied category "${categorySlug}" (${result.documentsCreated} documents created)`
      });
    } catch (err) {
      next(err);
    }
  }
}

export const documentationSeedController = new DocumentationSeedController();
