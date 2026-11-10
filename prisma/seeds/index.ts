import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seed-users';
import { seedWorkspaces } from './seed-workspaces';
import { seedProjects } from './seed-projects';
import { seedDocumentation } from './seed-documentation';
import { seedBoards } from './seed-boards';
import { seedSprints } from './seed-sprints';
import { seedRoadmaps } from './seed-roadmaps';
import { seedTasks } from './seed-tasks';
import { seedBugs } from './seed-bugs';
import { seedTesting } from './seed-testing';
import { seedReleases } from './seed-releases';
import { seedTeams } from './seed-teams';
import { seedTimeTracking } from './seed-time-tracking';
import { seedRisks } from './seed-risks';
import { seedDiscussions } from './seed-discussions';
import { seedNotifications } from './seed-notifications';
import { seedEcosystem } from './seed-ecosystem';
import { verifySeed } from './verify';

const prisma = new PrismaClient();

export async function runCompleteDemoSeed() {
  console.log('================================================================');
  console.log('   STARTING COMPLETE ENTERPRISE DEMO SEED — ALL FOUR PROJECTS');
  console.log('================================================================\n');

  const startTime = Date.now();

  try {
    // 1. Users & Team Members
    await seedUsers(prisma);

    // 2. Workspace & Portfolio
    const portfolio = await seedWorkspaces(prisma);

    // 3. Four Projects Metadata
    await seedProjects(prisma, portfolio.id);

    // 4. 139 Blueprint Documents per Project (100% Complete)
    await seedDocumentation(prisma);

    // 5. 7-Column Kanban Boards
    await seedBoards(prisma);

    // 6. Sprints
    const sprintsMap = await seedSprints(prisma);

    // 7. Roadmaps & Milestones
    await seedRoadmaps(prisma);

    // 8. Products, Features, User Stories, Tasks & Subtasks
    await seedTasks(prisma, sprintsMap);

    // 9. Bugs & QA Defects
    await seedBugs(prisma);

    // 10. QA Test Plans, Suites, Cases & Executions
    await seedTesting(prisma);

    // 11. Releases & Deployments
    await seedReleases(prisma);

    // 12. Teams & Project Memberships
    await seedTeams(prisma);

    // 13. Time Tracking Entries
    await seedTimeTracking(prisma);

    // 14. 3x3 Risk Matrix & Register
    await seedRisks(prisma);

    // 15. Engineering Discussions & Decisions
    await seedDiscussions(prisma);

    // 16. Enterprise Notifications & Inbox
    await seedNotifications(prisma);

    // 17. Engineering Ecosystem (Design Tokens, Repos, CI/CD, Test Runs, Approvals)
    await seedEcosystem(prisma);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✓ Enterprise demonstration seeding completed in ${elapsed}s.\n`);

    // Run verification audit
    await verifySeed();

  } catch (error) {
    console.error('❌ Error during enterprise demo seeding:', error);
    throw error;
  }
}

if (require.main === module) {
  runCompleteDemoSeed()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
