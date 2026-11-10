import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { USER_IDS, WORKSPACE_ID } from './seed-config';

export async function seedUsers(prisma: PrismaClient) {
  console.log('Seeding enterprise users and team members...');
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const usersData = [
    {
      id: USER_IDS.OWNER,
      name: 'Sarah Connor (Architect)',
      email: 'owner@devblueprint.io',
      jobTitle: 'Principal Systems Architect',
      department: 'Platform Architecture',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      role: UserRole.OWNER
    },
    {
      id: USER_IDS.ADMIN,
      name: 'Alex Rivera (DevOps Lead)',
      email: 'admin@devblueprint.io',
      jobTitle: 'DevOps & Site Reliability Lead',
      department: 'Infrastructure & SRE',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: UserRole.ADMIN
    },
    {
      id: USER_IDS.EDITOR,
      name: 'Elena Rostova (Full-Stack Dev)',
      email: 'editor@devblueprint.io',
      jobTitle: 'Senior Full-Stack Engineer',
      department: 'Core Software Engineering',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: UserRole.EDITOR
    },
    {
      id: USER_IDS.VIEWER,
      name: 'Marcus Vance (Stakeholder)',
      email: 'viewer@devblueprint.io',
      jobTitle: 'VP of Product Management',
      department: 'Product Leadership',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      role: UserRole.VIEWER
    },
    {
      id: USER_IDS.QA_LEAD,
      name: 'David Zhao (QA Lead)',
      email: 'qa@devblueprint.io',
      jobTitle: 'Lead Quality Assurance Engineer',
      department: 'Quality & Test Engineering',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      role: UserRole.EDITOR
    },
    {
      id: USER_IDS.SECURITY_LEAD,
      name: 'Rachel Sterling (Security Lead)',
      email: 'security@devblueprint.io',
      jobTitle: 'Principal AppSec Engineer',
      department: 'Information Security & Compliance',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      role: UserRole.EDITOR
    },
    {
      id: USER_IDS.FRONTEND_DEV,
      name: 'Jordan Miller (Frontend)',
      email: 'frontend@devblueprint.io',
      jobTitle: 'Senior Frontend Engineer',
      department: 'Client Applications',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      role: UserRole.EDITOR
    },
    {
      id: USER_IDS.BACKEND_DEV,
      name: 'Liam Tanaka (Backend Go/Node)',
      email: 'backend@devblueprint.io',
      jobTitle: 'Senior Distributed Systems Engineer',
      department: 'High-Throughput Services',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
      role: UserRole.EDITOR
    },
    {
      id: USER_IDS.UIUX_DESIGNER,
      name: 'Maya Patel (Product Designer)',
      email: 'design@devblueprint.io',
      jobTitle: 'Lead Product Designer',
      department: 'Design & Design Systems',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      role: UserRole.EDITOR
    },
    {
      id: USER_IDS.DEVOPS_ENGINEER,
      name: 'Carlos Mendez (Cloud Engineer)',
      email: 'cloud@devblueprint.io',
      jobTitle: 'Cloud Infrastructure Engineer',
      department: 'Cloud & Kubernetes Platform',
      avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150',
      role: UserRole.EDITOR
    }
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {
        name: u.name,
        email: u.email,
        jobTitle: u.jobTitle,
        department: u.department,
        avatarUrl: u.avatarUrl
      },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash,
        jobTitle: u.jobTitle,
        department: u.department,
        isEmailVerified: true,
        avatarUrl: u.avatarUrl
      }
    });

    // Ensure Workspace Membership
    await prisma.workspaceMember.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: WORKSPACE_ID,
          userId: u.id
        }
      },
      update: { role: u.role },
      create: {
        workspaceId: WORKSPACE_ID,
        userId: u.id,
        role: u.role
      }
    });
  }

  console.log(`✓ Seeded ${usersData.length} enterprise users with workspace memberships.`);
}
