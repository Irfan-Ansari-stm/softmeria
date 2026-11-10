import { Request, Response, NextFunction } from 'express';
import { boardService } from './boards.service';
import { sendSuccess } from '../../utils/response';

export class BoardController {
  async getProjectBoard(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = (req.query.projectId as string) || req.params.projectId;
      const sprintId = req.query.sprintId as string | undefined;
      const boardId = (req.query.boardId as string) || (req.params.boardId as string) || undefined;
      const board = await boardService.getProjectBoard(projectId, { boardId, sprintId });
      return sendSuccess(res, board, 'Project board retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async listProjectBoards(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = (req.query.projectId as string) || req.params.projectId;
      const boards = await boardService.listProjectBoards(projectId);
      return sendSuccess(res, boards, 'Project boards list retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async createBoard(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = req.body.projectId || req.params.projectId;
      const board = await boardService.createBoard(projectId, req.body.name);
      return sendSuccess(res, board, 'Board created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async updateBoard(req: Request, res: Response, next: NextFunction) {
    try {
      const board = await boardService.updateBoard(req.params.boardId, req.body);
      return sendSuccess(res, board, 'Board updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  async deleteBoard(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await boardService.deleteBoard(req.params.boardId);
      return sendSuccess(res, result, 'Board deleted successfully');
    } catch (error) {
      return next(error);
    }
  }

  async addColumn(req: Request, res: Response, next: NextFunction) {
    try {
      const column = await boardService.addColumn(req.params.boardId, req.body);
      return sendSuccess(res, column, 'Column added successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async updateColumn(req: Request, res: Response, next: NextFunction) {
    try {
      const column = await boardService.updateColumn(req.params.columnId, req.body);
      return sendSuccess(res, column, 'Column updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  async deleteColumn(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await boardService.deleteColumn(req.params.columnId);
      return sendSuccess(res, result, 'Column deleted successfully');
    } catch (error) {
      return next(error);
    }
  }
}

export const boardController = new BoardController();
