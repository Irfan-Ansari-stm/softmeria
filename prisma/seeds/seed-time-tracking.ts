import { PrismaClient } from '@prisma/client';
import { PROJECT_IDS, USER_IDS, WORKSPACE_ID } from './seed-config';

export async function seedTimeTracking(prisma: PrismaClient) {
  console.log('Seeding time tracking worklogs for all 4 projects...');

  for (const [key, projectId] of Object.entries(PROJECT_IDS)) {
    const tasks = await prisma.task.findMany({
      where: { projectId },
      take: 6
    });

    const entries = [
      { taskId: tasks[0]?.id, hours: 4.0, desc: 'Initial architecture specification and component hierarchy design', billable: true, userId: USER_IDS.OWNER, date: new Date('2026-01-22') },
      { taskId: tasks[1]?.id, hours: 3.0, desc: 'Database schema migration scripts and foreign key constraint validation', billable: true, userId: USER_IDS.BACKEND_DEV, date: new Date('2026-01-23') },
      { taskId: tasks[2]?.id, hours: 5.0, desc: 'Core logic implementation and unit test coverage setup', billable: true, userId: USER_IDS.FRONTEND_DEV, date: new Date('2026-01-26') },
      { taskId: tasks[3]?.id, hours: 3.5, desc: 'Debugging integration latency and optimizing memory allocations', billable: true, userId: USER_IDS.EDITOR, date: new Date('2026-01-29') },
      { taskId: tasks[4]?.id, hours: 2.0, desc: 'Sprint planning and backlog grooming with product team', billable: false, userId: USER_IDS.VIEWER, date: new Date('2026-01-30') },
      { taskId: tasks[5]?.id, hours: 4.0, desc: 'Automated end-to-end regression testing and performance benchmarking', billable: true, userId: USER_IDS.QA_LEAD, date: new Date('2026-02-02') },
      { taskId: tasks[0]?.id, hours: 3.0, desc: 'Security audit and dependency vulnerability scanning', billable: true, userId: USER_IDS.SECURITY_LEAD, date: new Date('2026-02-03') },
      { taskId: tasks[1]?.id, hours: 2.5, desc: 'CI/CD deployment pipeline configuration and Docker optimization', billable: false, userId: USER_IDS.DEVOPS_ENGINEER, date: new Date('2026-02-05') }
    ];

    for (const e of entries) {
      await prisma.timeEntry.create({
        data: {
          workspaceId: WORKSPACE_ID,
          projectId,
          taskId: e.taskId,
          userId: e.userId,
          hours: e.hours,
          description: e.desc,
          isBillable: e.billable,
          isApproved: true,
          date: e.date
        }
      });
    }
  }

  console.log('✓ Seeded realistic time tracking logs across all 4 projects.');
}
