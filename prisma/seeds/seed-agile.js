const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedRetrosAndBugs() {
  await prisma.sprint.updateMany({
    where: { status: 'COMPLETED' },
    data: {
      retrospectiveWentWell: 'Completed core architectural deliverables ahead of schedule. All unit and integration test suites passing with >92% coverage. Zero P0 regressions introduced in staging.',
      retrospectiveWentWrong: 'Cross-service API contract synchronization took longer than anticipated. Two stories experienced scope creep mid-sprint due to evolving schema requirements.',
      retrospectiveActionItems: '1. Lock API specifications before sprint kickoff.\n2. Add automated contract testing using OpenAPI specs.\n3. Increase story point buffer for asynchronous integration tasks.'
    }
  });

  await prisma.bug.updateMany({
    where: { status: { in: ['FIXED', 'CLOSED', 'VERIFIED'] } },
    data: {
      rootCause: 'Race condition under high concurrency due to missing pessimistic row-level locking on balance mutation queries.',
      resolutionNotes: 'Applied SELECT ... FOR UPDATE locking inside Prisma interactive transaction and verified with 5,000 req/sec k6 load test.'
    }
  });

  await prisma.bug.updateMany({
    where: { status: { in: ['OPEN', 'CONFIRMED', 'IN_PROGRESS'] } },
    data: {
      rootCause: 'Investigating potential memory leak and unhandled promise rejections during connection pool exhaustion.',
      resolutionNotes: null
    }
  });

  console.log('Agile retrospectives and defects updated successfully.');
}

seedRetrosAndBugs()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
