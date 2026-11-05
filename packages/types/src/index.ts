export type UserRole = 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';

export type ProjectVisibility = 'PUBLIC' | 'PRIVATE' | 'INTERNAL';

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';

export type DocumentStatus =
  | 'NOT_STARTED'
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'COMPLETED'
  | 'ARCHIVED';

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED';

export type ActivityAction =
  | 'CREATED'
  | 'UPDATED'
  | 'DELETED'
  | 'RESTORED'
  | 'ARCHIVED'
  | 'COMMENTED'
  | 'REVIEW_REQUESTED'
  | 'REVIEW_APPROVED'
  | 'EXPORTED'
  | 'IMPORTED';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  ownerId: string;
  role?: UserRole;
  memberCount?: number;
  projectCount?: number;
  createdAt: string;
}

export interface ProjectSummary {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  description?: string | null;
  projectType: string;
  category: string;
  techStack: string[];
  repositoryUrl?: string | null;
  icon?: string | null;
  color?: string | null;
  visibility: ProjectVisibility;
  status: ProjectStatus;
  completionPercentage: number;
  totalDocuments: number;
  completedDocuments: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryNode {
  id: string;
  projectId: string;
  parentId?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder: number;
  isCustom: boolean;
  documents?: DocumentSummary[];
  children?: CategoryNode[];
  documentCount?: number;
  completedCount?: number;
  completionPercentage?: number;
}

export interface DocumentSummary {
  id: string;
  projectId: string;
  categoryId: string;
  title: string;
  fileName: string;
  slug: string;
  description?: string | null;
  status: DocumentStatus;
  isOptional: boolean;
  sortOrder: number;
  versionNumber: number;
  tags?: string[];
  createdById?: string;
  updatedById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentDetail extends DocumentSummary {
  content: string;
  categoryName?: string;
  createdBy?: UserSummary;
  updatedBy?: UserSummary;
  versions?: DocumentVersionSummary[];
  comments?: DocumentComment[];
  reviewRequests?: DocumentReviewRequest[];
}

export interface DocumentVersionSummary {
  id: string;
  documentId: string;
  versionNumber: number;
  title: string;
  changeSummary?: string | null;
  authorId: string;
  authorName?: string;
  createdAt: string;
}

export interface DocumentVersionDetail extends DocumentVersionSummary {
  content: string;
}

export interface DocumentComment {
  id: string;
  documentId: string;
  userId: string;
  user: UserSummary;
  content: string;
  parentId?: string | null;
  isResolved: boolean;
  replies?: DocumentComment[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentReviewRequest {
  id: string;
  documentId: string;
  requesterId: string;
  requester: UserSummary;
  status: ReviewStatus;
  notes?: string | null;
  createdAt: string;
  approvals?: ReviewApproval[];
}

export interface ReviewApproval {
  id: string;
  reviewRequestId: string;
  reviewerId: string;
  reviewer: UserSummary;
  status: ReviewStatus;
  comment?: string | null;
  createdAt: string;
}

export interface DocumentationTemplate {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  purpose: string;
  recommendedSections: string[];
  content: string;
  isBuiltin: boolean;
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalDocuments: number;
  completedDocuments: number;
  pendingDocuments: number;
  inReviewDocuments: number;
  overallCompletionPercentage: number;
  recentlyUpdatedDocs: DocumentSummary[];
  recentlyAccessedProjects: ProjectSummary[];
  recentActivities: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  workspaceId: string;
  projectId?: string | null;
  projectName?: string | null;
  documentId?: string | null;
  documentTitle?: string | null;
  userId: string;
  userName: string;
  action: ActivityAction;
  entityType: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  error?: {
    code?: string;
    details?: any;
  };
}

