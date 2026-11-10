import { prisma } from '../../config/db';
import { TestCaseStatus, TaskPriority, ActivityAction } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../../utils/errors';

export class TestingService {
  async listTestPlans(projectId: string) {
    const plans = await prisma.testPlan.findMany({
      where: { projectId },
      include: {
        testSuites: {
          include: {
            testCases: {
              include: {
                assignedTester: { select: { id: true, name: true, avatarUrl: true } },
                bug: { select: { id: true, bugIdentifier: true, title: true } },
                task: { select: { id: true, taskIdentifier: true, title: true } },
                attachments: true
              }
            }
          }
        },
        executions: {
          orderBy: { executedAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return plans.map((p) => {
      const allCases = p.testSuites.flatMap((s) => s.testCases);
      const totalCases = allCases.length;
      const passedCases = allCases.filter((c) => c.status === TestCaseStatus.PASSED).length;
      const failedCases = allCases.filter((c) => c.status === TestCaseStatus.FAILED).length;
      const blockedCases = allCases.filter((c) => c.status === TestCaseStatus.BLOCKED).length;
      const executed = totalCases - allCases.filter((c) => c.status === TestCaseStatus.NOT_RUN).length;
      const passRate = executed > 0 ? Math.round((passedCases / executed) * 1000) / 10 : 0;

      return {
        ...p,
        totalCases,
        passedCases,
        failedCases,
        blockedCases,
        executedCases: executed,
        passRate
      };
    });
  }

  async createTestPlan(data: { projectId: string; name: string; description?: string }) {
    return prisma.testPlan.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        description: data.description,
        status: 'ACTIVE'
      }
    });
  }

  async createTestSuite(data: { testPlanId?: string; projectId?: string; name: string; description?: string }) {
    let planId = data.testPlanId;
    if (!planId && data.projectId) {
      let plan = await prisma.testPlan.findFirst({ where: { projectId: data.projectId } });
      if (!plan) {
        plan = await prisma.testPlan.create({
          data: {
            projectId: data.projectId,
            name: 'Primary Test Plan',
            description: 'Automated test suite plan'
          }
        });
      }
      planId = plan.id;
    }
    if (!planId) {
      throw new BadRequestError('Either testPlanId or projectId is required');
    }

    return prisma.testSuite.create({
      data: {
        testPlanId: planId,
        name: data.name,
        description: data.description
      }
    });
  }

  async listTestCases(projectId: string, suiteId?: string, status?: string) {
    const where: any = {
      testSuite: { testPlan: { projectId } }
    };
    if (suiteId) where.testSuiteId = suiteId;
    if (status && status !== 'ALL') where.status = status;

    return prisma.testCase.findMany({
      where,
      include: {
        testSuite: { select: { id: true, name: true } },
        assignedTester: { select: { id: true, name: true, avatarUrl: true } },
        bug: { select: { id: true, bugIdentifier: true, title: true, severity: true } },
        task: { select: { id: true, taskIdentifier: true, title: true } },
        attachments: true
      },
      orderBy: { caseIdentifier: 'asc' }
    });
  }

  async createTestCase(data: {
    testSuiteId: string;
    title: string;
    description?: string;
    testType?: string;
    environment?: string;
    preconditions?: string;
    steps: string;
    expectedResult: string;
    priority?: TaskPriority;
    assignedTesterId?: string;
    featureId?: string;
    bugId?: string;
    taskId?: string;
    releaseId?: string;
  }) {
    const count = await prisma.testCase.count({ where: { testSuiteId: data.testSuiteId } });
    const caseIdentifier = `TC-${count + 101}`;

    let priority: TaskPriority = TaskPriority.MEDIUM;
    if (data.priority) {
      const p = String(data.priority).toUpperCase();
      if (p === 'CRITICAL' || p === 'URGENT') priority = TaskPriority.URGENT;
      else if (p === 'HIGH') priority = TaskPriority.HIGH;
      else if (p === 'LOW') priority = TaskPriority.LOW;
    }

    return prisma.testCase.create({
      data: {
        testSuiteId: data.testSuiteId,
        caseIdentifier,
        title: data.title,
        description: data.description,
        testType: data.testType || 'INTEGRATION',
        environment: data.environment || 'Staging',
        preconditions: data.preconditions,
        steps: typeof data.steps === 'string' ? data.steps : JSON.stringify(data.steps || []),
        expectedResult: data.expectedResult || 'Expected system behavior verified successfully',
        status: (data as any).status || TestCaseStatus.NOT_RUN,
        priority,
        assignedTesterId: data.assignedTesterId,
        featureId: data.featureId,
        bugId: data.bugId,
        taskId: data.taskId,
        releaseId: data.releaseId
      },
      include: {
        testSuite: true,
        assignedTester: { select: { id: true, name: true, avatarUrl: true } },
        bug: true,
        task: true
      }
    });
  }

  async updateTestCase(id: string, data: any) {
    const existing = await prisma.testCase.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Test case not found');

    return prisma.testCase.update({
      where: { id },
      data,
      include: {
        testSuite: true,
        assignedTester: { select: { id: true, name: true, avatarUrl: true } },
        bug: true,
        task: true
      }
    });
  }

  async deleteTestCase(id: string) {
    const existing = await prisma.testCase.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Test case not found');

    await prisma.testCase.delete({ where: { id } });
    return { message: 'Test case deleted successfully' };
  }

  async duplicateTestCase(id: string) {
    const existing = await prisma.testCase.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Test case not found');

    const count = await prisma.testCase.count({ where: { testSuiteId: existing.testSuiteId } });
    const caseIdentifier = `TC-${count + 101}`;

    return prisma.testCase.create({
      data: {
        testSuiteId: existing.testSuiteId,
        caseIdentifier,
        title: `${existing.title} (Copy)`,
        description: existing.description,
        testType: existing.testType,
        environment: existing.environment,
        preconditions: existing.preconditions,
        steps: existing.steps,
        expectedResult: existing.expectedResult,
        status: TestCaseStatus.NOT_RUN,
        priority: existing.priority,
        assignedTesterId: existing.assignedTesterId,
        featureId: existing.featureId,
        bugId: existing.bugId,
        taskId: existing.taskId,
        releaseId: existing.releaseId
      },
      include: {
        testSuite: true,
        assignedTester: { select: { id: true, name: true, avatarUrl: true } }
      }
    });
  }

  async updateTestCaseStatus(testCaseId: string, data: { status: TestCaseStatus; actualResult?: string; notes?: string }) {
    const existing = await prisma.testCase.findUnique({ where: { id: testCaseId } });
    if (!existing) throw new NotFoundError('Test case not found');

    let history: any[] = [];
    try {
      history = JSON.parse(existing.executionHistory || '[]');
    } catch {
      history = [];
    }

    history.unshift({
      timestamp: new Date().toISOString(),
      previousStatus: existing.status,
      newStatus: data.status,
      notes: data.notes || data.actualResult || 'Status updated via QA Workbench'
    });

    return prisma.testCase.update({
      where: { id: testCaseId },
      data: {
        status: data.status,
        actualResult: data.actualResult,
        executionHistory: JSON.stringify(history.slice(0, 10))
      },
      include: {
        testSuite: true,
        assignedTester: { select: { id: true, name: true, avatarUrl: true } }
      }
    });
  }

  // =========================================================================
  // TEST RUNS
  // =========================================================================
  async listTestRuns(projectId: string) {
    return prisma.testRun.findMany({
      where: { projectId },
      include: {
        testSuite: { select: { id: true, name: true } },
        release: { select: { id: true, version: true, title: true } }
      },
      orderBy: { startedAt: 'desc' }
    });
  }

  async createTestRun(userId: string, data: {
    projectId: string;
    testSuiteId?: string;
    releaseId?: string;
    name: string;
    environment?: string;
    notes?: string;
  }) {
    // Count suite cases
    let cases = await prisma.testCase.findMany({
      where: data.testSuiteId ? { testSuiteId: data.testSuiteId } : { testSuite: { testPlan: { projectId: data.projectId } } }
    });

    const total = cases.length;
    const passed = cases.filter((c) => c.status === TestCaseStatus.PASSED).length;
    const failed = cases.filter((c) => c.status === TestCaseStatus.FAILED).length;
    const blocked = cases.filter((c) => c.status === TestCaseStatus.BLOCKED).length;
    const skipped = cases.filter((c) => c.status === TestCaseStatus.SKIPPED).length;
    const executed = total - cases.filter((c) => c.status === TestCaseStatus.NOT_RUN).length;
    const passRate = executed > 0 ? Math.round((passed / executed) * 1000) / 10 : 0;

    return prisma.testRun.create({
      data: {
        projectId: data.projectId,
        testSuiteId: data.testSuiteId,
        releaseId: data.releaseId,
        name: data.name,
        environment: data.environment || 'Staging Cluster',
        status: 'COMPLETED',
        executedById: userId,
        totalCases: total,
        passedCases: passed,
        failedCases: failed,
        blockedCases: blocked,
        skippedCases: skipped,
        passRate,
        notes: data.notes || 'Full test run execution completed.',
        startedAt: new Date(Date.now() - 120000),
        completedAt: new Date()
      },
      include: {
        testSuite: true,
        release: true
      }
    });
  }

  // =========================================================================
  // QUALITY REPORTS & METRICS
  // =========================================================================
  async getQualityReports(projectId: string) {
    const testCases = await prisma.testCase.findMany({
      where: { testSuite: { testPlan: { projectId } } },
      include: {
        testSuite: true,
        bug: true
      }
    });

    const totalCases = testCases.length;
    const passedCases = testCases.filter((c) => c.status === TestCaseStatus.PASSED).length;
    const failedCases = testCases.filter((c) => c.status === TestCaseStatus.FAILED).length;
    const blockedCases = testCases.filter((c) => c.status === TestCaseStatus.BLOCKED).length;
    const skippedCases = testCases.filter((c) => c.status === TestCaseStatus.SKIPPED).length;
    const notRunCases = testCases.filter((c) => c.status === TestCaseStatus.NOT_RUN).length;
    const executedCases = totalCases - notRunCases;

    // Actual calculated pass rate (never 100% when 0 executed!)
    const passRate = executedCases > 0 ? Math.round((passedCases / executedCases) * 1000) / 10 : 0;
    const failureRate = executedCases > 0 ? Math.round((failedCases / executedCases) * 1000) / 10 : 0;
    const coverageRate = totalCases > 0 ? Math.round((executedCases / totalCases) * 100) : 0;

    // Test types breakdown
    const typeDistribution: Record<string, number> = {};
    for (const c of testCases) {
      const type = c.testType || 'INTEGRATION';
      typeDistribution[type] = (typeDistribution[type] || 0) + 1;
    }

    // Bug defect density
    const openBugsCount = await prisma.bug.count({
      where: { projectId, status: { not: 'CLOSED' } }
    });

    const testRuns = await prisma.testRun.findMany({
      where: { projectId },
      orderBy: { startedAt: 'desc' },
      take: 5
    });

    return {
      totalCases,
      totalTests: totalCases,
      executedCases,
      passedCases,
      failedCases,
      blockedCases,
      skippedCases,
      notRunCases,
      passRate,
      failureRate,
      coverageRate,
      defectDensity: totalCases > 0 ? Math.round((openBugsCount / totalCases) * 100) / 100 : 0,
      openBugsCount,
      typeDistribution,
      recentTestRuns: testRuns
    };
  }
}

export const testingService = new TestingService();
