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
    const take = query.limit || 25;

    // Search documents
    const docWhere: any = {
      project: {
        workspaceId,
        isArchived: false
      },
      isArchived: false
    };

    if (query.projectId) {
      docWhere.projectId = query.projectId;
    }

    if (query.categoryId) {
      docWhere.categoryId = query.categoryId;
    }

    if (query.status) {
      docWhere.status = query.status;
    }

    if (query.tag) {
      docWhere.documentTags = {
        some: {
          tag: {
            name: { equals: query.tag, mode: 'insensitive' }
          }
        }
      };
    }

    if (term) {
      docWhere.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { fileName: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { content: { contains: term, mode: 'insensitive' } }
      ];
    }

    const documents = await prisma.document.findMany({
      where: docWhere,
      take,
      orderBy: { updatedAt: 'desc' },
      include: {
        project: { select: { id: true, name: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
        documentTags: { include: { tag: true } }
      }
    });

    // Also search projects if no projectId filter is applied
    let projects: any[] = [];
    if (!query.projectId && term) {
      projects = await prisma.project.findMany({
        where: {
          workspaceId,
          isArchived: false,
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
            { category: { contains: term, mode: 'insensitive' } }
          ]
        },
        take: 5
      });
    }

    return {
      query: term,
      totalDocuments: documents.length,
      documents: documents.map((d) => {
        // Snippet preview with matched term highlighted
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
          isOptional: d.isOptional,
          versionNumber: d.versionNumber,
          project: d.project,
          category: d.category,
          tags: d.documentTags.map((dt) => dt.tag.name),
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
      }))
    };
  }
}

export const searchService = new SearchService();

