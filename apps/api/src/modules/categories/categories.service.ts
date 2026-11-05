import { prisma } from '../../config/db';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { slugify } from '@devblueprint/shared';
import { DocumentStatus } from '@prisma/client';

export class CategoryService {
  async listCategoriesTree(projectId: string) {
    const categories = await prisma.category.findMany({
      where: { projectId },
      include: {
        documents: {
          where: { isArchived: false },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            projectId: true,
            categoryId: true,
            title: true,
            fileName: true,
            slug: true,
            description: true,
            status: true,
            isOptional: true,
            sortOrder: true,
            versionNumber: true,
            createdAt: true,
            updatedAt: true
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    const categoryMap = new Map<string, any>();
    categories.forEach((cat) => {
      const nonOptional = cat.documents.filter((d) => !d.isOptional);
      const totalDocs = nonOptional.length;
      const completedDocs = nonOptional.filter(
        (d) => d.status === DocumentStatus.COMPLETED || d.status === DocumentStatus.APPROVED
      ).length;
      const completionPercentage = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0;

      categoryMap.set(cat.id, {
        id: cat.id,
        projectId: cat.projectId,
        parentId: cat.parentId,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        sortOrder: cat.sortOrder,
        isCustom: cat.isCustom,
        documentCount: cat.documents.length,
        completedCount: completedDocs,
        completionPercentage,
        documents: cat.documents.map((d) => ({
          ...d,
          createdAt: d.createdAt.toISOString(),
          updatedAt: d.updatedAt.toISOString()
        })),
        children: []
      });
    });

    const rootCategories: any[] = [];
    categoryMap.forEach((node) => {
      if (node.parentId && categoryMap.has(node.parentId)) {
        categoryMap.get(node.parentId).children.push(node);
      } else {
        rootCategories.push(node);
      }
    });

    return rootCategories;
  }

  async createCategory(
    projectId: string,
    data: {
      name: string;
      slug?: string;
      description?: string;
      parentId?: string | null;
      sortOrder?: number;
    }
  ) {
    const slug = data.slug || slugify(data.name);

    let sortOrder = data.sortOrder;
    if (sortOrder === undefined) {
      const maxCat = await prisma.category.findFirst({
        where: { projectId },
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true }
      });
      sortOrder = (maxCat?.sortOrder ?? 0) + 1;
    }

    const category = await prisma.category.create({
      data: {
        projectId,
        name: data.name,
        slug,
        description: data.description,
        parentId: data.parentId,
        sortOrder,
        isCustom: true
      }
    });

    return category;
  }

  async updateCategory(
    categoryId: string,
    data: {
      name?: string;
      description?: string | null;
      parentId?: string | null;
      sortOrder?: number;
    }
  ) {
    const existing = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!existing) throw new NotFoundError('Category not found');

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(data.name ? { name: data.name, slug: slugify(data.name) } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.parentId !== undefined ? { parentId: data.parentId } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {})
      }
    });

    return updated;
  }

  async deleteCategory(categoryId: string) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { documents: true, children: true }
        }
      }
    });

    if (!category) throw new NotFoundError('Category not found');

    await prisma.category.delete({
      where: { id: categoryId }
    });

    return { message: 'Category deleted successfully' };
  }

  async reorderCategories(projectId: string, orderedIds: string[]) {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.category.update({
          where: { id },
          data: { sortOrder: index + 1 }
        })
      )
    );

    return { message: 'Categories reordered successfully' };
  }
}

export const categoryService = new CategoryService();

