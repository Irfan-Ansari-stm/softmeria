import { PrismaClient, UserRole } from '@prisma/client';
import { PROJECT_IDS, USER_IDS } from './seed-config';

export async function seedTeams(prisma: PrismaClient) {
  console.log('Seeding project teams and resource memberships for all 4 projects...');

  const teamRoster = [
    { userId: USER_IDS.OWNER, role: UserRole.OWNER },
    { userId: USER_IDS.ADMIN, role: UserRole.ADMIN },
    { userId: USER_IDS.EDITOR, role: UserRole.EDITOR },
    { userId: USER_IDS.VIEWER, role: UserRole.VIEWER },
    { userId: USER_IDS.QA_LEAD, role: UserRole.EDITOR },
    { userId: USER_IDS.SECURITY_LEAD, role: UserRole.EDITOR },
    { userId: USER_IDS.FRONTEND_DEV, role: UserRole.EDITOR },
    { userId: USER_IDS.BACKEND_DEV, role: UserRole.EDITOR },
    { userId: USER_IDS.UIUX_DESIGNER, role: UserRole.EDITOR },
    { userId: USER_IDS.DEVOPS_ENGINEER, role: UserRole.EDITOR }
  ];

  for (const [key, projectId] of Object.entries(PROJECT_IDS)) {
    for (const member of teamRoster) {
      await prisma.projectMember.upsert({
        where: {
          projectId_userId: {
            projectId,
            userId: member.userId
          }
        },
        update: { role: member.role },
        create: {
          projectId,
          userId: member.userId,
          role: member.role
        }
      });
    }
  }

  console.log('✓ Seeded 10-person enterprise teams across all 4 projects.');
}
