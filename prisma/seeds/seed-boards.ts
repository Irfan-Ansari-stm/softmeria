import { PrismaClient, TaskStatus } from '@prisma/client';
import { PROJECT_IDS } from './seed-config';

export async function seedBoards(prisma: PrismaClient) {
  console.log('Seeding 7-column Kanban boards for all four projects...');

  const columnDefs = [
    { name: 'Backlog', statusValue: TaskStatus.BACKLOG, sortOrder: 0, wipLimit: 0 },
    { name: 'To Do', statusValue: TaskStatus.TODO, sortOrder: 1, wipLimit: 15 },
    { name: 'In Progress', statusValue: TaskStatus.IN_PROGRESS, sortOrder: 2, wipLimit: 8 },
    { name: 'In Review', statusValue: TaskStatus.IN_REVIEW, sortOrder: 3, wipLimit: 5 },
    { name: 'Testing', statusValue: TaskStatus.TESTING, sortOrder: 4, wipLimit: 5 },
    { name: 'Blocked', statusValue: TaskStatus.BLOCKED, sortOrder: 5, wipLimit: 4 },
    { name: 'Done', statusValue: TaskStatus.DONE, sortOrder: 6, wipLimit: 0 }
  ];

  for (const [key, projectId] of Object.entries(PROJECT_IDS)) {
    let board = await prisma.board.findFirst({
      where: { projectId, isDefault: true }
    });

    if (!board) {
      board = await prisma.board.create({
        data: {
          projectId,
          name: 'Main Product Delivery Board',
          isDefault: true
        }
      });
    }

    for (const col of columnDefs) {
      const existingCol = await prisma.boardColumn.findFirst({
        where: { boardId: board.id, statusValue: col.statusValue }
      });

      if (!existingCol) {
        await prisma.boardColumn.create({
          data: {
            boardId: board.id,
            name: col.name,
            statusValue: col.statusValue,
            sortOrder: col.sortOrder,
            wipLimit: col.wipLimit
          }
        });
      } else {
        await prisma.boardColumn.update({
          where: { id: existingCol.id },
          data: {
            name: col.name,
            sortOrder: col.sortOrder,
            wipLimit: col.wipLimit
          }
        });
      }
    }
  }

  console.log('✓ Seeded 7-column Kanban boards for all 4 projects.');
}
