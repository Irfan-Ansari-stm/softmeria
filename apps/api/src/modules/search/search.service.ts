import { prisma } from '../../config/db';
import { DocumentStatus } from '@prisma/client';

export class SearchService {
  async globalSearch(
    workspaceId: string,
    query: {
      q: string;
      projectId?: string;
      categoryId?: string;
      status?: DocumentStatus;
      tag?: string;
      limit?: number;
    }
  ) {
    const term = query.q ? query.q.trim() : '';
    const take = query.limit || 20;

    if (!term) {
      return {
        query: '',
        totalDocuments: 0,
        documents: [],
        projects: [],
        tasks: [],
        templates: [],
        teamMembers: [],
        discussions: [],
        bugs: [],
        releases: []
      };
    }

    // 1. Search Documents
    const docWhere: any = {
      project: {
        workspaceId,
        isArchived: false
      },
      isArchived: false,
      OR: [
        { title: { contains: term, mode: 'insensitive' } },
        { fileName: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { content: { contains: term, mode: 'insensitive' } }
      ]
    };
    if (query.projectId) docWhere.projectId = query.projectId;

    const [
      documents,
      projects,
      tasks,
      templates,
      workspaceMembers,
      discussions,
      bugs,
      releases
    ] = await Promise.all([
      // Documents
      prisma.document.findMany({
        where: docWhere,
        take,
        orderBy: { updatedAt: 'desc' },
        include: {
          project: { select: { id: true, name: true, slug: true, color: true } },
          category: { select: { id: true, name: true, slug: true } }
        }
      }),

      // Projects
      prisma.project.findMany({
        where: {
          workspaceId,
          isArchived: false,
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
            { category: { contains: term, mode: 'insensitive' } },
            { projectType: { contains: term, mode: 'insensitive' } }
          ]
        },
        take: 8
      }),

      // Tasks
      prisma.task.findMany({
        where: {
          project: { workspaceId, isArchived: false },
          OR: [
            { title: { contains: term, mode: 'insensitive' } },
            { taskIdentifier: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } }
          ]
        },
        take: 8,
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true, avatarUrl: true } }
        }
      }),

      // Templates
      prisma.template.findMany({
        where: {
          OR: [
            { title: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
            { category: { contains: term, mode: 'insensitive' } }
          ]
        },
        take: 6
      }),

      // Team Members
      prisma.workspaceMember.findMany({
        where: {
          workspaceId,
          user: {
            OR: [
              { name: { contains: term, mode: 'insensitive' } },
              { email: { contains: term, mode: 'insensitive' } },
              { department: { contains: term, mode: 'insensitive' } },
              { jobTitle: { contains: term, mode: 'insensitive' } }
            ]
          }
        },
        take: 6,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              jobTitle: true,
              department: true
            }
          }
        }
      }),

      // Discussions
      prisma.discussion.findMany({
        where: {
          project: { workspaceId },
          OR: [
            { title: { contains: term, mode: 'insensitive' } },
            { content: { contains: term, mode: 'insensitive' } }
          ]
        },
        take: 6,
        include: {
          project: { select: { id: true, name: true } },
          author: { select: { id: true, name: true } }
        }
      }),

      // Bugs
      prisma.bug.findMany({
        where: {
          project: { workspaceId },
          OR: [
            { title: { contains: term, mode: 'insensitive' } },
            { bugIdentifier: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } }
          ]
        },
        take: 6,
        include: {
          project: { select: { id: true, name: true } }
        }
      }),

      // Releases
      prisma.release.findMany({
        where: {
          project: { workspaceId },
          OR: [
            { version: { contains: term, mode: 'insensitive' } },
            { title: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } }
          ]
        },
        take: 6,
        include: {
          project: { select: { id: true, name: true } }
        }
      })
    ]);

    return {
      query: term,
      totalDocuments: documents.length,
      documents: documents.map((d) => {
        let snippet = d.description || '';
        if (term && d.content) {
          const idx = d.content.toLowerCase().indexOf(term.toLowerCase());
          if (idx !== -1) {
            const start = Math.max(0, idx - 40);
            const end = Math.min(d.content.length, idx + term.length + 60);
            snippet = `...${d.content.substring(start, end).replace(/\n/g, ' ')}...`;
          }
        }
        return {
          id: d.id,
          title: d.title,
          fileName: d.fileName,
          slug: d.slug,
          snippet,
          status: d.status,
          versionNumber: d.versionNumber,
          project: d.project,
          category: d.category,
          updatedAt: d.updatedAt.toISOString()
        };
      }),
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        projectType: p.projectType,
        color: p.color
      })),
      tasks: tasks.map((t) => ({
        id: t.id,
        key: t.taskIdentifier,
        title: t.title,
        status: t.status,
        priority: t.priority,
        projectId: t.projectId,
        projectName: t.project.name,
        assignee: t.assignee
      })),
      templates: templates.map((tmpl) => ({
        id: tmpl.id,
        title: tmpl.title,
        description: tmpl.description,
        category: tmpl.category
      })),
      teamMembers: workspaceMembers.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        jobTitle: m.user.jobTitle,
        department: m.user.department,
        avatarUrl: m.user.avatarUrl,
        role: m.role
      })),
      discussions: discussions.map((disc) => ({
        id: disc.id,
        title: disc.title,
        projectId: disc.projectId,
        projectName: disc.project?.name || 'Workspace',
        author: disc.author.name
      })),
      bugs: bugs.map((b) => ({
        id: b.id,
        key: b.bugIdentifier,
        title: b.title,
        severity: b.severity,
        status: b.status,
        projectId: b.projectId,
        projectName: b.project.name
      })),
      releases: releases.map((rel) => ({
        id: rel.id,
        version: rel.version,
        title: rel.title,
        status: rel.status,
        projectId: rel.projectId,
        projectName: rel.project.name
      }))
    };
  }
}

export const searchService = new SearchService();
