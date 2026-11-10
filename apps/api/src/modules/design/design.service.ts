import { prisma } from '../../config/db';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { ActivityAction } from '@prisma/client';

export class DesignService {
  // =========================================================================
  // TOKENS
  // =========================================================================
  async listTokens(projectId: string, category?: string) {
    const where: any = { projectId };
    if (category && category !== 'ALL') {
      where.category = category;
    }

    return prisma.designToken.findMany({
      where,
      include: { palette: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    });
  }

  async createToken(userId: string, data: {
    projectId: string;
    name: string;
    key: string;
    category: string;
    value: string;
    type?: string;
    description?: string;
    semanticRole?: string;
    paletteId?: string;
    metadata?: any;
  }) {
    const key = data.key || data.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
    const existing = await prisma.designToken.findUnique({
      where: { projectId_key: { projectId: data.projectId, key } }
    });
    if (existing) {
      throw new BadRequestError(`Token with key "${key}" already exists in this project.`);
    }

    const token = await prisma.designToken.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        key,
        category: data.category,
        value: data.value,
        type: data.type || 'color',
        description: data.description,
        semanticRole: data.semanticRole,
        paletteId: data.paletteId,
        metadata: data.metadata ? JSON.stringify(data.metadata) : '{}'
      },
      include: { palette: true }
    });

    // Activity log
    const project = await prisma.project.findUnique({ where: { id: data.projectId }, select: { workspaceId: true } });
    if (project) {
      await prisma.activityLog.create({
        data: {
          workspaceId: project.workspaceId,
          projectId: data.projectId,
          userId,
          action: ActivityAction.CREATED,
          entityType: 'DesignToken',
          metadata: JSON.stringify({ tokenKey: token.key, value: token.value })
        }
      });
    }

    return token;
  }

  async updateToken(userId: string, id: string, data: {
    name?: string;
    value?: string;
    category?: string;
    type?: string;
    description?: string;
    semanticRole?: string;
    paletteId?: string;
    metadata?: any;
  }) {
    const existing = await prisma.designToken.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Design token not found');

    const updateData: any = { ...data };
    if (data.metadata) {
      updateData.metadata = typeof data.metadata === 'string' ? data.metadata : JSON.stringify(data.metadata);
    }

    const updated = await prisma.designToken.update({
      where: { id },
      data: updateData,
      include: { palette: true }
    });

    const project = await prisma.project.findUnique({ where: { id: existing.projectId }, select: { workspaceId: true } });
    if (project) {
      await prisma.activityLog.create({
        data: {
          workspaceId: project.workspaceId,
          projectId: existing.projectId,
          userId,
          action: ActivityAction.UPDATED,
          entityType: 'DesignToken',
          metadata: JSON.stringify({ tokenKey: updated.key, oldValue: existing.value, newValue: updated.value })
        }
      });
    }

    return updated;
  }

  async deleteToken(userId: string, id: string) {
    const existing = await prisma.designToken.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Design token not found');

    await prisma.designToken.delete({ where: { id } });

    const project = await prisma.project.findUnique({ where: { id: existing.projectId }, select: { workspaceId: true } });
    if (project) {
      await prisma.activityLog.create({
        data: {
          workspaceId: project.workspaceId,
          projectId: existing.projectId,
          userId,
          action: ActivityAction.DELETED,
          entityType: 'DesignToken',
          metadata: JSON.stringify({ tokenKey: existing.key })
        }
      });
    }

    return { message: 'Design token deleted successfully' };
  }

  // =========================================================================
  // COLOR PALETTES
  // =========================================================================
  async listPalettes(projectId: string) {
    return prisma.colorPalette.findMany({
      where: { projectId },
      include: { tokens: true },
      orderBy: { name: 'asc' }
    });
  }

  async createPalette(projectId: string, data: { name: string; description?: string }) {
    return prisma.colorPalette.create({
      data: {
        projectId,
        name: data.name,
        description: data.description
      }
    });
  }

  // =========================================================================
  // THEMES
  // =========================================================================
  async listThemes(projectId: string) {
    return prisma.theme.findMany({
      where: { projectId },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }]
    });
  }

  async createTheme(projectId: string, data: {
    name: string;
    slug: string;
    isDark?: boolean;
    isDefault?: boolean;
    tokenOverrides?: Record<string, string>;
  }) {
    if (data.isDefault) {
      await prisma.theme.updateMany({
        where: { projectId, isDefault: true },
        data: { isDefault: false }
      });
    }

    return prisma.theme.create({
      data: {
        projectId,
        name: data.name,
        slug: data.slug,
        isDark: data.isDark || false,
        isDefault: data.isDefault || false,
        isPublished: true,
        tokenOverrides: JSON.stringify(data.tokenOverrides || {})
      }
    });
  }

  async publishTheme(userId: string, themeId: string) {
    const theme = await prisma.theme.findUnique({ where: { id: themeId } });
    if (!theme) throw new NotFoundError('Theme not found');

    const updated = await prisma.theme.update({
      where: { id: themeId },
      data: { isPublished: true, updatedAt: new Date() }
    });

    const project = await prisma.project.findUnique({ where: { id: theme.projectId }, select: { workspaceId: true } });
    if (project) {
      await prisma.activityLog.create({
        data: {
          workspaceId: project.workspaceId,
          projectId: theme.projectId,
          userId,
          action: ActivityAction.STATUS_CHANGED,
          entityType: 'Theme',
          metadata: JSON.stringify({ themeName: theme.name, action: 'PUBLISHED' })
        }
      });
    }

    return updated;
  }

  // =========================================================================
  // COMPONENT SPECIFICATIONS
  // =========================================================================
  async listComponents(projectId: string) {
    return prisma.componentSpecification.findMany({
      where: { projectId },
      orderBy: { name: 'asc' }
    });
  }

  async createComponent(data: {
    projectId: string;
    name: string;
    componentType: string;
    category?: string;
    description?: string;
    status?: string;
    variants?: string[];
    properties?: any[];
    accessibility?: string;
    usageExamples?: string;
    notes?: string;
  }) {
    return prisma.componentSpecification.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        componentType: data.componentType,
        category: data.category || 'COMPONENTS',
        description: data.description,
        status: data.status || 'STABLE',
        variants: JSON.stringify(data.variants || []),
        properties: JSON.stringify(data.properties || []),
        accessibility: data.accessibility,
        usageExamples: data.usageExamples,
        notes: data.notes
      }
    });
  }

  async updateComponent(id: string, data: any) {
    const existing = await prisma.componentSpecification.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Component specification not found');

    const updateData: any = { ...data };
    if (Array.isArray(data.variants)) updateData.variants = JSON.stringify(data.variants);
    if (Array.isArray(data.properties)) updateData.properties = JSON.stringify(data.properties);

    return prisma.componentSpecification.update({
      where: { id },
      data: updateData
    });
  }

  async deleteComponent(id: string) {
    const existing = await prisma.componentSpecification.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Component specification not found');

    await prisma.componentSpecification.delete({ where: { id } });
    return { message: 'Component specification deleted successfully' };
  }

  // =========================================================================
  // TOKEN EXPORT (CSS, Tailwind, JSON, SCSS)
  // =========================================================================
  async exportTokens(projectId: string, format: 'css' | 'tailwind' | 'json' | 'scss') {
    const tokens = await prisma.designToken.findMany({
      where: { projectId },
      orderBy: { key: 'asc' }
    });

    if (format === 'json') {
      const tokenTree: Record<string, any> = {};
      for (const t of tokens) {
        const parts = t.key.split('.');
        let current = tokenTree;
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          current[part] = current[part] || {};
          current = current[part];
        }
        current[parts[parts.length - 1]] = {
          value: t.value,
          type: t.type,
          category: t.category,
          description: t.description || undefined
        };
      }
      return { format: 'json', content: JSON.stringify(tokenTree, null, 2), filename: 'tokens.json' };
    }

    if (format === 'css') {
      let css = `/**\n * DevBlueprint Design System Tokens\n * Project ID: ${projectId}\n * Generated: ${new Date().toISOString()}\n */\n\n:root {\n`;
      for (const t of tokens) {
        const varName = `--${t.key.replace(/\./g, '-')}`;
        css += `  ${varName}: ${t.value};${t.description ? ` /* ${t.description} */` : ''}\n`;
      }
      css += `}\n`;
      return { format: 'css', content: css, filename: 'tokens.css' };
    }

    if (format === 'scss') {
      let scss = `// DevBlueprint SCSS Variables\n// Generated: ${new Date().toISOString()}\n\n`;
      for (const t of tokens) {
        const varName = `$${t.key.replace(/\./g, '-')}`;
        scss += `${varName}: ${t.value};${t.description ? ` // ${t.description}` : ''}\n`;
      }
      return { format: 'scss', content: scss, filename: '_tokens.scss' };
    }

    if (format === 'tailwind') {
      const colorTokens = tokens.filter((t) => t.type === 'color');
      const spacingTokens = tokens.filter((t) => t.category === 'SPACING');
      const radiusTokens = tokens.filter((t) => t.category === 'BORDER_RADIUS');

      const colorsObj: Record<string, any> = {};
      for (const c of colorTokens) {
        const cleanKey = c.key.replace(/^colors\./, '').replace(/\./g, '-');
        colorsObj[cleanKey] = c.value;
      }

      const spacingObj: Record<string, string> = {};
      for (const s of spacingTokens) {
        const cleanKey = s.key.replace(/^spacing\./, '');
        spacingObj[cleanKey] = s.value;
      }

      const radiusObj: Record<string, string> = {};
      for (const r of radiusTokens) {
        const cleanKey = r.key.replace(/^border\.radius\./, '');
        radiusObj[cleanKey] = r.value;
      }

      const configStr = `/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: ${JSON.stringify(colorsObj, null, 8)},\n      spacing: ${JSON.stringify(spacingObj, null, 8)},\n      borderRadius: ${JSON.stringify(radiusObj, null, 8)}\n    }\n  }\n};\n`;
      return { format: 'tailwind', content: configStr, filename: 'tailwind.tokens.js' };
    }

    throw new BadRequestError(`Unsupported export format: ${format}`);
  }
}

export const designService = new DesignService();
