import { prisma } from '../../config/db';
import { NotFoundError } from '../../utils/errors';
import { slugify } from '@devblueprint/shared';
import { documentService } from '../documents/documents.service';
import { DocumentStatus } from '@prisma/client';

export class TemplateService {
  async listTemplates(query: { workspaceId?: string; category?: string; search?: string }) {
    const where: any = {
      OR: [
        { isBuiltin: true },
        { workspaceId: null },
        ...(query.workspaceId ? [{ workspaceId: query.workspaceId }] : [{ isBuiltin: false }])
      ]
    };

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      where.AND = [
        {
          OR: [
            { title: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
            { purpose: { contains: query.search, mode: 'insensitive' } }
          ]
        }
      ];
    }

    const templates = await prisma.template.findMany({
      where,
      orderBy: [{ isBuiltin: 'desc' }, { title: 'asc' }]
    });

    return templates.map((t) => {
      let sections: string[] = [];
      try {
        sections = JSON.parse(t.recommendedSections);
      } catch {
        sections = [];
      }

      return {
        id: t.id,
        workspaceId: t.workspaceId,
        title: t.title,
        slug: t.slug,
        category: t.category,
        description: t.description,
        purpose: t.purpose,
        recommendedSections: sections,
        content: t.content,
        isBuiltin: t.isBuiltin,
        createdAt: t.createdAt.toISOString()
      };
    });
  }

  async getTemplate(templateId: string) {
    const template = await prisma.template.findUnique({
      where: { id: templateId }
    });

    if (!template) throw new NotFoundError('Template not found');

    let sections: string[] = [];
    try {
      sections = JSON.parse(template.recommendedSections);
    } catch {
      sections = [];
    }

    return {
      id: template.id,
      workspaceId: template.workspaceId,
      title: template.title,
      slug: template.slug,
      category: template.category,
      description: template.description,
      purpose: template.purpose,
      recommendedSections: sections,
      content: template.content,
      isBuiltin: template.isBuiltin,
      createdAt: template.createdAt.toISOString()
    };
  }

  async createTemplate(
    userId: string,
    data: {
      workspaceId?: string;
      title: string;
      category: string;
      description: string;
      purpose: string;
      recommendedSections: string[];
      content: string;
    }
  ) {
    const slug = slugify(data.title);

    const template = await prisma.template.create({
      data: {
        workspaceId: data.workspaceId,
        createdById: userId,
        title: data.title,
        slug,
        category: data.category,
        description: data.description,
        purpose: data.purpose || data.description || 'Architecture specification',
        recommendedSections: JSON.stringify(data.recommendedSections || []),
        content: data.content || '',
        isBuiltin: false
      }
    });

    return template;
  }

  async updateTemplate(id: string, data: any) {
    const existing = await prisma.template.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Template not found');

    const updateData: any = { ...data };
    if (data.recommendedSections && Array.isArray(data.recommendedSections)) {
      updateData.recommendedSections = JSON.stringify(data.recommendedSections);
    }
    if (data.title) {
      updateData.slug = slugify(data.title);
    }

    return prisma.template.update({
      where: { id },
      data: updateData
    });
  }

  async deleteTemplate(id: string) {
    const existing = await prisma.template.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Template not found');

    await prisma.template.delete({ where: { id } });
    return { message: 'Template deleted successfully' };
  }

  async duplicateTemplate(userId: string, id: string) {
    const existing = await this.getTemplate(id);

    return prisma.template.create({
      data: {
        workspaceId: existing.workspaceId,
        createdById: userId,
        title: `${existing.title} (Copy)`,
        slug: slugify(`${existing.title}-copy-${Date.now().toString().slice(-4)}`),
        category: existing.category,
        description: existing.description,
        purpose: existing.purpose,
        recommendedSections: JSON.stringify(existing.recommendedSections),
        content: existing.content,
        isBuiltin: false
      }
    });
  }

  async applyTemplate(
    templateId: string,
    projectId: string,
    categoryId: string,
    title: string,
    userId: string
  ) {
    const template = await this.getTemplate(templateId);

    const doc = await documentService.createDocument(userId, {
      projectId,
      categoryId,
      title,
      description: template.description,
      content: template.content,
      status: DocumentStatus.DRAFT
    });

    return doc;
  }
}

export const templateService = new TemplateService();

