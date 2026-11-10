import { prisma } from '../../config/db';
import { NotFoundError } from '../../utils/errors';
import { FeatureStatus, TaskPriority, RequirementType, TaskStatus } from '@prisma/client';

export class ProductService {
  async getProduct(projectId: string) {
    let product = await prisma.product.findFirst({
      where: { projectId }
    });

    if (!product) {
      product = await prisma.product.create({
        data: {
          projectId,
          name: 'Core Product Definition',
          vision: 'Provide seamless, reliable, mission-critical infrastructure.',
          strategy: 'Deliver customer-first value iteratively with enterprise security and high scalability.'
        }
      });
    }

    return product;
  }

  async updateProductVision(projectId: string, data: { vision?: string; strategy?: string; targetAudience?: string }) {
    const product = await this.getProduct(projectId);
    return prisma.product.update({
      where: { id: product.id },
      data
    });
  }

  async listFeatures(projectId: string) {
    const features = await prisma.feature.findMany({
      where: { projectId },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
        requirements: { select: { id: true } },
        userStories: { select: { id: true } },
        tasks: { select: { id: true, status: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return features.map((f) => ({
      ...f,
      requirementCount: f.requirements.length,
      userStoryCount: f.userStories.length,
      taskCount: f.tasks.length,
      completedTaskCount: f.tasks.filter((t) => t.status === 'DONE').length
    }));
  }

  async createFeature(data: {
    projectId: string;
    title: string;
    description?: string;
    businessValue?: string;
    priority?: TaskPriority;
    ownerId?: string;
    targetRelease?: string;
  }) {
    const product = await this.getProduct(data.projectId);

    return prisma.feature.create({
      data: {
        projectId: data.projectId,
        productId: product.id,
        title: data.title,
        description: data.description,
        businessValue: data.businessValue || 'High',
        priority: data.priority || TaskPriority.MEDIUM,
        status: FeatureStatus.PLANNED,
        ownerId: data.ownerId,
        targetRelease: data.targetRelease
      },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } }
      }
    });
  }

  async listRequirements(projectId: string, featureId?: string) {
    const where: any = { projectId };
    if (featureId) where.featureId = featureId;

    return prisma.requirement.findMany({
      where,
      include: {
        feature: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createRequirement(data: {
    projectId: string;
    featureId?: string;
    title: string;
    type?: RequirementType;
    description: string;
    acceptanceCriteria?: string;
    priority?: TaskPriority;
  }) {
    return prisma.requirement.create({
      data: {
        projectId: data.projectId,
        featureId: data.featureId,
        title: data.title,
        type: data.type || RequirementType.FUNCTIONAL,
        description: data.description,
        acceptanceCriteria: data.acceptanceCriteria,
        priority: data.priority || TaskPriority.MEDIUM
      }
    });
  }

  async listUserStories(projectId: string, featureId?: string) {
    const where: any = { projectId };
    if (featureId) where.featureId = featureId;

    const stories = await prisma.userStory.findMany({
      where,
      include: {
        feature: { select: { id: true, title: true } },
        tasks: { select: { id: true, status: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return stories.map((s) => ({
      ...s,
      taskCount: s.tasks.length
    }));
  }

  async createUserStory(data: {
    projectId: string;
    featureId?: string;
    title: string;
    asA: string;
    iWant: string;
    soThat: string;
    acceptanceCriteria?: string;
    storyPoints?: number;
    priority?: TaskPriority;
  }) {
    return prisma.userStory.create({
      data: {
        projectId: data.projectId,
        featureId: data.featureId,
        title: data.title,
        asA: data.asA,
        iWant: data.iWant,
        soThat: data.soThat,
        acceptanceCriteria: data.acceptanceCriteria,
        storyPoints: data.storyPoints || 3,
        priority: data.priority || TaskPriority.MEDIUM,
        status: TaskStatus.TODO
      }
    });
  }
}

export const productService = new ProductService();
