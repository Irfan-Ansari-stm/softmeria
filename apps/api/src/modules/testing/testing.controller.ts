import { Request, Response, NextFunction } from 'express';
import { testingService } from './testing.service';
import { sendSuccess } from '../../utils/response';

export class TestingController {
  async listTestPlans(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = (req.query.projectId as string) || req.params.projectId;
      const plans = await testingService.listTestPlans(projectId);
      return sendSuccess(res, plans, 'Test plans retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async createTestPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await testingService.createTestPlan(req.body);
      return sendSuccess(res, plan, 'Test plan created', 201);
    } catch (error) {
      return next(error);
    }
  }

  async createTestSuite(req: Request, res: Response, next: NextFunction) {
    try {
      const suite = await testingService.createTestSuite(req.body);
      return sendSuccess(res, suite, 'Test suite created', 201);
    } catch (error) {
      return next(error);
    }
  }

  async listTestCases(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = req.query.projectId as string;
      const suiteId = req.query.suiteId as string;
      const status = req.query.status as string;
      const cases = await testingService.listTestCases(projectId, suiteId, status);
      return sendSuccess(res, cases, 'Test cases retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async createTestCase(req: Request, res: Response, next: NextFunction) {
    try {
      const testCase = await testingService.createTestCase(req.body);
      return sendSuccess(res, testCase, 'Test case created', 201);
    } catch (error) {
      return next(error);
    }
  }

  async updateTestCase(req: Request, res: Response, next: NextFunction) {
    try {
      const testCase = await testingService.updateTestCase(req.params.id, req.body);
      return sendSuccess(res, testCase, 'Test case updated');
    } catch (error) {
      return next(error);
    }
  }

  async deleteTestCase(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await testingService.deleteTestCase(req.params.id);
      return sendSuccess(res, result, 'Test case deleted');
    } catch (error) {
      return next(error);
    }
  }

  async duplicateTestCase(req: Request, res: Response, next: NextFunction) {
    try {
      const copy = await testingService.duplicateTestCase(req.params.id);
      return sendSuccess(res, copy, 'Test case duplicated', 201);
    } catch (error) {
      return next(error);
    }
  }

  async updateTestCaseStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const caseId = req.params.caseId || req.params.id;
      const testCase = await testingService.updateTestCaseStatus(caseId, req.body);
      return sendSuccess(res, testCase, 'Test case status updated');
    } catch (error) {
      return next(error);
    }
  }

  async listTestRuns(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = req.query.projectId as string;
      const runs = await testingService.listTestRuns(projectId);
      return sendSuccess(res, runs, 'Test runs retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async createTestRun(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const run = await testingService.createTestRun(userId, req.body);
      return sendSuccess(res, run, 'Test run recorded', 201);
    } catch (error) {
      return next(error);
    }
  }

  async getQualityReports(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = req.query.projectId as string;
      const reports = await testingService.getQualityReports(projectId);
      return sendSuccess(res, reports, 'Quality reports generated');
    } catch (error) {
      return next(error);
    }
  }
}

export const testingController = new TestingController();
