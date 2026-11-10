import { DocumentStatus } from '@prisma/client';

export type BlueprintOption = 'FULL' | 'MINIMAL' | 'BLANK' | 'CUSTOM';

export interface SeedTemplateDoc {
  id: string;
  fileName: string;
  relativePath: string;
  title: string;
  description: string;
  categorySlug: string;
  initialStatus: DocumentStatus;
  isRequired: boolean;
  tags: string[];
  content: string;
  version: string;
}

export interface SeedCategory {
  name: string;
  slug: string;
  folderName: string;
  description: string;
  sortOrder: number;
}

export interface ProjectSeedOptions {
  projectName?: string;
  projectType?: string;
  techStack?: string[];
  blueprintOption?: BlueprintOption;
  selectedCategories?: string[];
  selectedDocumentIds?: string[];
}

export interface SeedResult {
  projectId: string;
  categoriesCreated: number;
  documentsCreated: number;
  documentsUpdated: number;
  documentsSkipped: number;
  blueprintOption: BlueprintOption;
  totalDocuments: number;
  requiredDocuments: number;
  completedDocuments: number;
  completionPercentage: number;
  summary: {
    categoryCounts: Record<string, number>;
  };
}

export interface BlueprintManifestSummary {
  version: string;
  totalCategories: number;
  totalDocuments: number;
  categories: Array<{
    name: string;
    slug: string;
    folderName: string;
    description: string;
    sortOrder: number;
    documentCount: number;
    documents: Array<{
      id: string;
      fileName: string;
      relativePath: string;
      title: string;
      description: string;
      isRequired: boolean;
      initialStatus: DocumentStatus;
      tags: string[];
      version: string;
    }>;
  }>;
}
