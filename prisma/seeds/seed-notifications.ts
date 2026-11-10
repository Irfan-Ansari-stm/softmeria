import { PrismaClient } from '@prisma/client';
import { USER_IDS, PROJECT_IDS } from './seed-config';

export async function seedNotifications(prisma: PrismaClient) {
  console.log('Seeding enterprise notifications and inbox records...');

  const notificationEntries = [
    {
      userId: USER_IDS.OWNER,
      title: 'Review Request: ISO 20022 PACS.008 Payment Initiation Schema',
      message: 'Elena Rostova requested your architectural review on FPO-RFC-030.',
      link: `/projects/${PROJECT_IDS.FINTECH}?tab=discussions`,
      type: 'review_request',
      isRead: false
    },
    {
      userId: USER_IDS.OWNER,
      title: 'Task Assigned: FPO-101 Payment Gateway Routing Matrix',
      message: 'You have been assigned as lead engineer for Core Gateway Adapter Integration.',
      link: `/projects/${PROJECT_IDS.FINTECH}?tab=tasks`,
      type: 'task_assignment',
      isRead: false
    },
    {
      userId: USER_IDS.OWNER,
      title: 'Mentioned in Discussion: RabbitMQ Quorum Queues',
      message: 'Alex Rivera mentioned you: "@Sarah Connor please review the quorum queue failover test results."',
      link: `/projects/${PROJECT_IDS.MICROSERVICE}?tab=discussions`,
      type: 'mention',
      isRead: false
    },
    {
      userId: USER_IDS.OWNER,
      title: 'Approval Request: Production Release v1.0.0-GA',
      message: 'Alex Rivera requested release sign-off for Blank Scratchpad Project v1.0.0-GA deployment.',
      link: `/projects/${PROJECT_IDS.SCRATCHPAD}?tab=releases`,
      type: 'approval_request',
      isRead: true
    },
    {
      userId: USER_IDS.OWNER,
      title: 'Milestone Notification: Q1 2026 Core Gateway Switch Online',
      message: 'Milestone target date reached 80% task completion across payment adapters.',
      link: `/projects/${PROJECT_IDS.FINTECH}?tab=roadmap`,
      type: 'milestone',
      isRead: true
    },
    {
      userId: USER_IDS.OWNER,
      title: 'Comment on Document: Architecture Overview',
      message: 'David Zhao commented on Architecture Overview: "Security threat model verified for card vault tokenization."',
      link: `/projects/${PROJECT_IDS.FINTECH}?tab=docs`,
      type: 'comment',
      isRead: true
    },
    {
      userId: USER_IDS.ADMIN,
      title: 'Production Staging Deployment Successful',
      message: 'Automated Enterprise Project build #412 deployed to Staging Kubernetes Cluster.',
      link: `/projects/${PROJECT_IDS.AUTOMATION}?tab=releases`,
      type: 'project_update',
      isRead: false
    },
    {
      userId: USER_IDS.FRONTEND_DEV,
      title: 'Defect Assigned: Touch Pointer Jumps 40px',
      message: 'David Zhao assigned defect BSP-BUG-02 to you.',
      link: `/projects/${PROJECT_IDS.SCRATCHPAD}?tab=bugs`,
      type: 'task_assignment',
      isRead: false
    }
  ];

  for (const n of notificationEntries) {
    const existing = await prisma.notification.findFirst({
      where: { userId: n.userId, title: n.title }
    });

    if (!existing) {
      await prisma.notification.create({
        data: n
      });
    }
  }

  console.log('✓ Seeded realistic notification records.');
}
