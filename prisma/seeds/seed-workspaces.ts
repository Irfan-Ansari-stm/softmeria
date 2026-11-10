import { PrismaClient } from '@prisma/client';
import { WORKSPACE_ID, USER_IDS } from './seed-config';

export async function seedWorkspaces(prisma: PrismaClient) {
  console.log('Ensuring enterprise workspace & portfolios...');

  await prisma.workspace.upsert({
    where: { id: WORKSPACE_ID },
    update: {
      name: 'Acme Cloud Engineering',
      slug: 'acme-cloud-engineering',
      ownerId: USER_IDS.OWNER,
      logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=acme'
    },
    create: {
      id: WORKSPACE_ID,
      name: 'Acme Cloud Engineering',
      slug: 'acme-cloud-engineering',
      ownerId: USER_IDS.OWNER,
      logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=acme',
      settings: {
        create: {
          themePreference: 'light',
          notifyOnComment: true,
          notifyOnReview: true
        }
      }
    }
  });

  const portfolio = await prisma.portfolio.upsert({
    where: {
      workspaceId_slug: {
        workspaceId: WORKSPACE_ID,
        slug: 'global-financial-infrastructure-2026'
      }
    },
    update: {
      name: 'Global Cloud Systems & Modernization 2026',
      description: 'Strategic portfolio covering full-stack web applications, distributed microservice meshes, workflow automation engines, and fintech switches.',
      status: 'ACTIVE'
    },
    create: {
      workspaceId: WORKSPACE_ID,
      name: 'Global Cloud Systems & Modernization 2026',
      slug: 'global-financial-infrastructure-2026',
      description: 'Strategic portfolio covering full-stack web applications, distributed microservice meshes, workflow automation engines, and fintech switches.',
      category: 'Enterprise Engineering Modernization',
      budget: 3500000.0,
      status: 'ACTIVE',
      targetDate: new Date('2026-12-31')
    }
  });

  return portfolio;
}
