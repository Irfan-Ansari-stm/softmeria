export type UserRole = 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';

export type ProjectVisibility = 'PUBLIC' | 'PRIVATE' | 'INTERNAL';

export type ProjectStatus =
  | 'PLANNING'
  | 'ACTIVE'
  | 'ARCHIVED'
  | 'COMPLETED'
  | 'ON_HOLD'
  | 'AT_RISK'
  | 'CANCELLED';

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
  | 'IMPORTED'
  | 'STATUS_CHANGED'
  | 'ASSIGNED';

// Task & Agile Types
export type TaskType =
  | 'EPIC'
  | 'FEATURE'
  | 'STORY'
  | 'TASK'
  | 'SUBTASK'
  | 'BUG'
  | 'IMPROVEMENT'
  | 'RESEARCH'
  | 'TECH_DEBT';

export type TaskStatus =
  | 'BACKLOG'
  | 'TODO'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'TESTING'
  | 'BLOCKED'
  | 'DONE'
  | 'CANCELLED';

export type TaskPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export type SprintStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type DependencyType = 'BLOCKS' | 'BLOCKED_BY' | 'RELATES_TO' | 'DUPLICATES';

// Product & Requirements Types
export type RequirementType = 'BUSINESS' | 'FUNCTIONAL' | 'NON_FUNCTIONAL';

export type FeatureStatus =
  | 'PROPOSED'
  | 'UNDER_REVIEW'
  | 'PLANNED'
  | 'IN_DEVELOPMENT'
  | 'TESTING'
  | 'RELEASED'
  | 'DEPRECATED';

// Milestone & Roadmap Types
export type MilestoneStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';

export type RoadmapTimeframe = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';

// QA & Bug Types
export type BugSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type BugStatus =
  | 'OPEN'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'FIXED'
  | 'READY_FOR_TESTING'
  | 'VERIFIED'
  | 'REOPENED'
  | 'CLOSED';

export type TestCaseStatus = 'PASSED' | 'FAILED' | 'BLOCKED' | 'SKIPPED' | 'NOT_RUN';

// Release & Deployment Types
export type ReleaseStatus = 'PLANNED' | 'IN_PROGRESS' | 'READY' | 'RELEASED' | 'ROLLED_BACK';

export type EnvironmentType = 'DEVELOPMENT' | 'TESTING' | 'STAGING' | 'PRODUCTION';

export type DeploymentStatus = 'PENDING' | 'DEPLOYING' | 'DEPLOYED' | 'FAILED' | 'ROLLED_BACK';

// Risk Types
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RiskStatus = 'IDENTIFIED' | 'MITIGATING' | 'ACCEPTED' | 'RESOLVED' | 'CLOSED';

// Integration Provider
export type IntegrationProvider =
  | 'GITHUB'
  | 'GITLAB'
  | 'BITBUCKET'
  | 'FIGMA'
  | 'SLACK'
  | 'TEAMS'
  | 'JIRA'
  | 'WEBHOOK';

// ---------------------------------------------------------------------------
// DATA INTERFACES
// ---------------------------------------------------------------------------

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  jobTitle?: string | null;
  department?: string | null;
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

export interface PortfolioSummary {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  description?: string | null;
  category: string;
  budget: number;
  status: string;
  targetDate?: string | null;
  projectCount?: number;
  completedProjectCount?: number;
  totalTasks?: number;
  completedTasks?: number;
  createdAt: string;
}

export interface ProjectSummary {
  id: string;
  workspaceId: string;
  portfolioId?: string | null;
  name: string;
  slug: string;
  projectKey: string;
  description?: string | null;
  projectType: string;
  category: string;
  techStack: string[];
  repositoryUrl?: string | null;
  icon?: string | null;
  color?: string | null;
  visibility: ProjectVisibility;
  status: ProjectStatus;
  priority: string;
  startDate?: string | null;
  targetDate?: string | null;
  budget?: number | null;
  goals?: string[];
  completionPercentage: number;
  totalDocuments: number;
  completedDocuments: number;
  totalTasks?: number;
  completedTasks?: number;
  openBugs?: number;
  createdAt: string;
  updatedAt: string;
}

// Product & Feature Interfaces
export interface FeatureSummary {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  businessValue: string;
  priority: TaskPriority;
  status: FeatureStatus;
  ownerId?: string | null;
  owner?: UserSummary | null;
  targetRelease?: string | null;
  requirementCount?: number;
  userStoryCount?: number;
  taskCount?: number;
  completedTaskCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RequirementSummary {
  id: string;
  projectId: string;
  featureId?: string | null;
  title: string;
  type: RequirementType;
  description: string;
  acceptanceCriteria?: string | null;
  priority: TaskPriority;
  status: string;
  createdAt: string;
}

export interface UserStorySummary {
  id: string;
  projectId: string;
  featureId?: string | null;
  title: string;
  asA: string;
  iWant: string;
  soThat: string;
  acceptanceCriteria?: string | null;
  storyPoints: number;
  priority: TaskPriority;
  status: TaskStatus;
  taskCount?: number;
  createdAt: string;
}

// Task & Agile Interfaces
export interface TaskSummary {
  id: string;
  projectId: string;
  taskIdentifier: string;
  title: string;
  description?: string | null;
  taskType: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  parentTaskId?: string | null;
  assigneeId?: string | null;
  assignee?: UserSummary | null;
  reporterId?: string | null;
  reporter?: UserSummary | null;
  sprintId?: string | null;
  sprintName?: string | null;
  milestoneId?: string | null;
  featureId?: string | null;
  documentId?: string | null;
  documentTitle?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
  storyPoints?: number | null;
  labels?: Array<{ id: string; name: string; color: string }>;
  subtaskCount?: number;
  completedSubtasks?: number;
  dependencies?: Array<{ id: string; taskIdentifier: string; title: string; type: DependencyType }>;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SprintSummary {
  id: string;
  projectId: string;
  name: string;
  goal?: string | null;
  status: SprintStatus;
  startDate?: string | null;
  endDate?: string | null;
  capacityPoints: number;
  velocity?: number | null;
  totalStoryPoints?: number;
  completedStoryPoints?: number;
  taskCount?: number;
  completedTaskCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BoardColumnSummary {
  id: string;
  boardId: string;
  name: string;
  statusValue: TaskStatus;
  wipLimit?: number | null;
  sortOrder: number;
}

export interface BoardSummary {
  id: string;
  projectId: string;
  name: string;
  isDefault: boolean;
  columns: BoardColumnSummary[];
}

// Milestone & Roadmap Interfaces
export interface MilestoneSummary {
  id: string;
  projectId: string;
  name: string;
  description?: string | null;
  ownerId?: string | null;
  owner?: UserSummary | null;
  targetDate?: string | null;
  status: MilestoneStatus;
  completionPercentage: number;
  taskCount?: number;
  completedTaskCount?: number;
  createdAt: string;
}

export interface RoadmapItemSummary {
  id: string;
  roadmapId: string;
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  progress: number;
  color: string;
}

export interface RoadmapSummary {
  id: string;
  projectId: string;
  name: string;
  timeframe: RoadmapTimeframe;
  status: string;
  items: RoadmapItemSummary[];
}

// Design Management
export interface DesignItemSummary {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  category: string;
  figmaUrl?: string | null;
  version: string;
  status: string;
  createdAt: string;
}

// Development Management
export interface RepositorySummary {
  id: string;
  projectId: string;
  name: string;
  url: string;
  defaultBranch: string;
  provider: string;
  isConnected: boolean;
  createdAt: string;
}

export interface CodeReferenceSummary {
  id: string;
  projectId: string;
  taskId?: string | null;
  title: string;
  refType: string;
  refIdentifier: string;
  url?: string | null;
  status: string;
  createdAt: string;
}

// Bug & Issue Interfaces
export interface BugSummary {
  id: string;
  projectId: string;
  taskId?: string | null;
  bugIdentifier: string;
  title: string;
  description: string;
  severity: BugSeverity;
  priority: TaskPriority;
  status: BugStatus;
  environment?: string | null;
  browser?: string | null;
  device?: string | null;
  stepsToReproduce?: string | null;
  expectedResult?: string | null;
  actualResult?: string | null;
  reporterId: string;
  reporter?: UserSummary | null;
  assigneeId?: string | null;
  assignee?: UserSummary | null;
  relatedReleaseId?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Testing & QA Interfaces
export interface TestCaseSummary {
  id: string;
  testSuiteId: string;
  caseIdentifier: string;
  title: string;
  preconditions?: string | null;
  steps: string;
  expectedResult: string;
  actualResult?: string | null;
  status: TestCaseStatus;
  priority: TaskPriority;
  assignedTesterId?: string | null;
  assignedTester?: UserSummary | null;
  featureId?: string | null;
  bugId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TestSuiteSummary {
  id: string;
  testPlanId: string;
  name: string;
  description?: string | null;
  testCases: TestCaseSummary[];
}

export interface TestPlanSummary {
  id: string;
  projectId: string;
  name: string;
  description?: string | null;
  status: string;
  testSuites?: TestSuiteSummary[];
  totalCases?: number;
  passedCases?: number;
  failedCases?: number;
  blockedCases?: number;
  createdAt: string;
}

// Release & Deployment Interfaces
export interface DeploymentSummary {
  id: string;
  releaseId: string;
  environment: EnvironmentType;
  status: DeploymentStatus;
  deployedById: string;
  deployedBy?: UserSummary | null;
  deployedAt: string;
  rollbackReason?: string | null;
}

export interface ReleaseSummary {
  id: string;
  projectId: string;
  version: string;
  title: string;
  description?: string | null;
  status: ReleaseStatus;
  targetDate?: string | null;
  releasedAt?: string | null;
  releaseNotes?: string | null;
  checklistItems: Array<{ id: string; label: string; completed: boolean }>;
  deployments?: DeploymentSummary[];
  resolvedBugCount?: number;
  completedTaskCount?: number;
  createdAt: string;
}

// Time Tracking Interfaces
export interface TimeEntrySummary {
  id: string;
  workspaceId: string;
  projectId: string;
  projectName?: string;
  taskId?: string | null;
  taskTitle?: string | null;
  userId: string;
  user?: UserSummary;
  hours: number;
  date: string;
  description?: string | null;
  isBillable: boolean;
  isApproved: boolean;
  createdAt: string;
}

// Discussion Interfaces
export interface DiscussionCommentSummary {
  id: string;
  discussionId: string;
  authorId: string;
  author: UserSummary;
  content: string;
  createdAt: string;
}

export interface DiscussionSummary {
  id: string;
  projectId: string;
  authorId: string;
  author: UserSummary;
  title: string;
  content: string;
  isPinned: boolean;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

// Risk Interfaces
export interface RiskSummary {
  id: string;
  projectId: string;
  title: string;
  description: string;
  category: string;
  probability: RiskLevel;
  impact: RiskLevel;
  severity: RiskLevel;
  riskOwnerId?: string | null;
  owner?: UserSummary | null;
  mitigationPlan?: string | null;
  contingencyPlan?: string | null;
  status: RiskStatus;
  createdAt: string;
}

// Integration Interfaces
export interface IntegrationSummary {
  id: string;
  workspaceId: string;
  provider: IntegrationProvider;
  name: string;
  isConnected: boolean;
  syncStatus: string;
  lastSyncAt?: string | null;
  createdAt: string;
}

// Existing Documentation Types (Preserved)
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

// Enterprise Dashboard Stats
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  projectsAtRisk: number;
  overdueProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  activeTeamMembers: number;
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    dueDate: string;
    type: 'task' | 'milestone' | 'release';
    projectName: string;
    priority: string;
  }>;
  recentActivities: ActivityItem[];
  upcomingMilestones: Array<{
    id: string;
    name: string;
    targetDate: string;
    projectName: string;
    progress: number;
    status: string;
  }>;
  sprintProgress: {
    activeSprintName?: string;
    totalPoints: number;
    completedPoints: number;
    completionPercentage: number;
    daysRemaining: number;
  };
  openBugs: number;
  releaseStatus: {
    nextVersion?: string;
    targetDate?: string;
    checklistProgress: number;
    status: string;
  };
  totalDocuments: number;
  completedDocuments: number;
  recentlyUpdatedDocs: DocumentSummary[];
  recentlyAccessedProjects: ProjectSummary[];
  documentationStats?: {
    totalDocuments: number;
    approvedDocuments: number;
    pendingReviews: number;
    documentationCompletion: number;
  };
  designStats?: {
    totalDesignTokens: number;
    publishedThemes: number;
    pendingDesignChanges: number;
  };
  developmentStats?: {
    connectedRepositories: number;
    recentCommits: number;
    openPullRequests: number;
    pipelineFailures: number;
  };
  testingStats?: {
    totalTests: number;
    passRate: number;
    failedTests: number;
    testCoverage: number;
  };
  releaseMetrics?: {
    upcomingReleases: number;
    activeDeployments: number;
    successfulDeployments: number;
    failedDeployments: number;
    releaseReadiness: number;
  };
}

// Design System Types
export interface DesignToken {
  id: string;
  projectId: string;
  name: string;
  key: string;
  category: string;
  value: string;
  type: string;
  description?: string | null;
  semanticRole?: string | null;
  paletteId?: string | null;
  metadata?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ColorPalette {
  id: string;
  projectId: string;
  name: string;
  description?: string | null;
  tokens?: DesignToken[];
}

export interface Theme {
  id: string;
  projectId: string;
  name: string;
  slug: string;
  isDefault: boolean;
  isDark: boolean;
  isPublished: boolean;
  version: string;
  tokenOverrides: string;
}

export interface ComponentSpecification {
  id: string;
  projectId: string;
  name: string;
  componentType: string;
  category: string;
  description?: string | null;
  status: string;
  variants: string;
  properties: string;
  accessibility?: string | null;
  usageExamples?: string | null;
  notes?: string | null;
}

// Development & Repository Types
export interface Repository {
  id: string;
  projectId: string;
  name: string;
  url: string;
  defaultBranch: string;
  provider: 'GITHUB' | 'GITLAB' | 'BITBUCKET' | string;
  isConnected: boolean;
  isPrimary: boolean;
  visibility: string;
  owner?: string | null;
  lastSyncAt?: string | null;
  syncStatus?: string | null;
  webhookUrl?: string | null;
  branches?: RepositoryBranch[];
  commits?: GitCommit[];
  pullRequests?: PullRequest[];
  pipelineRuns?: PipelineRun[];
}

export interface RepositoryBranch {
  id: string;
  repositoryId: string;
  name: string;
  isDefault: boolean;
  lastCommitSha?: string | null;
  lastCommitMessage?: string | null;
  lastCommitAuthor?: string | null;
}

export interface GitCommit {
  id: string;
  repositoryId: string;
  sha: string;
  message: string;
  authorName: string;
  authorAvatar?: string | null;
  branch: string;
  additions: number;
  deletions: number;
  committedAt: string;
}

export interface PullRequest {
  id: string;
  repositoryId: string;
  projectId: string;
  taskId?: string | null;
  prNumber: number;
  title: string;
  description?: string | null;
  author: string;
  authorAvatar?: string | null;
  sourceBranch: string;
  targetBranch: string;
  status: 'OPEN' | 'MERGED' | 'CLOSED';
  reviewStatus: 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED';
  url?: string | null;
  createdAt: string;
  mergedAt?: string | null;
  repository?: { id: string; name: string; provider: string };
  task?: { id: string; taskIdentifier: string; title: string; status: string };
}

export interface PipelineRun {
  id: string;
  repositoryId: string;
  projectId: string;
  pipelineNumber: number;
  workflowName: string;
  provider: string;
  status: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'QUEUED' | 'CANCELLED';
  branch: string;
  commitSha: string;
  commitMessage?: string | null;
  durationSeconds: number;
  testsPassed: number;
  testsFailed: number;
  testsTotal: number;
  deploymentStatus?: string | null;
  url?: string | null;
  startedAt: string;
  completedAt?: string | null;
}

// Testing & QA Types
export interface TestRun {
  id: string;
  projectId: string;
  testSuiteId?: string | null;
  releaseId?: string | null;
  name: string;
  environment: string;
  status: string;
  totalCases: number;
  passedCases: number;
  failedCases: number;
  blockedCases: number;
  skippedCases: number;
  passRate: number;
  notes?: string | null;
  startedAt: string;
  completedAt?: string | null;
}

// Release & Governance Types
export interface ReleaseApproval {
  id: string;
  releaseId: string;
  approverId: string;
  role: string;
  status: string;
  notes?: string | null;
  approvedAt?: string | null;
  approver?: { id: string; name: string; avatarUrl?: string | null };
}

export interface RollbackRecord {
  id: string;
  releaseId: string;
  deploymentId?: string | null;
  requestedById: string;
  targetVersion: string;
  reason: string;
  status: string;
  logs?: string | null;
  executedAt: string;
}

// File & Asset Storage Types
export interface FileFolder {
  id: string;
  workspaceId: string;
  projectId?: string | null;
  parentId?: string | null;
  name: string;
  color?: string | null;
  createdAt: string;
  updatedAt: string;
  parent?: FileFolder | null;
  children?: FileFolder[];
  files?: FileItem[];
  fileCount?: number;
}

export interface FileItem {
  id: string;
  workspaceId: string;
  projectId?: string | null;
  folderId?: string | null;
  uploaderId: string;
  name: string;
  originalName: string;
  mimeType: string;
  extension: string;
  sizeBytes: number;
  storagePath: string;
  storageType: string;
  version: number;
  isArchived: boolean;
  isDeleted: boolean;
  deletedAt?: string | null;
  documentId?: string | null;
  taskId?: string | null;
  bugId?: string | null;
  rfcId?: string | null;
  createdAt: string;
  updatedAt: string;
  uploader?: { id: string; name: string; avatarUrl?: string | null };
  folder?: FileFolder | null;
  project?: { id: string; name: string } | null;
  versions?: FileVersion[];
}

export interface FileVersion {
  id: string;
  fileId: string;
  versionNumber: number;
  sizeBytes: number;
  storagePath: string;
  uploaderId: string;
  changeNotes?: string | null;
  createdAt: string;
  uploader?: { id: string; name: string; avatarUrl?: string | null };
}

export interface FileAttachment {
  id: string;
  fileId: string;
  entityType: string;
  entityId: string;
  attachedById: string;
  createdAt: string;
  file?: FileItem;
}

export interface StorageDashboardStats {
  totalFiles: number;
  totalStorageBytes: number;
  storageLimitBytes: number;
  usedPercentage: number;
  filesByType: Record<string, { count: number; bytes: number }>;
  filesByProject: Array<{ projectId: string; projectName: string; count: number; bytes: number }>;
  recentUploads: FileItem[];
  largestFiles: FileItem[];
}

// Discussions & RFC Decision Record Types
export interface DiscussionItem {
  id: string;
  projectId?: string | null;
  workspaceId?: string | null;
  authorId: string;
  title: string;
  content: string;
  category: string;
  status: string;
  priority: string;
  tags?: string[] | null;
  isPinned: boolean;
  isResolved: boolean;
  resolvedAt?: string | null;
  resolvedById?: string | null;
  documentId?: string | null;
  taskId?: string | null;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; name: string; avatarUrl?: string | null };
  comments?: DiscussionCommentItem[];
  commentCount?: number;
}

export interface DiscussionCommentItem {
  id: string;
  discussionId: string;
  authorId: string;
  parentId?: string | null;
  content: string;
  isEdited: boolean;
  isPinned: boolean;
  reactions?: Record<string, string[]> | null;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; name: string; avatarUrl?: string | null };
  replies?: DiscussionCommentItem[];
}

export interface RFCItem {
  id: string;
  workspaceId: string;
  projectId?: string | null;
  rfcNumber: number;
  title: string;
  authorId: string;
  status: string;
  category: string;
  problemStatement: string;
  motivation: string;
  proposedSolution: string;
  alternativeSolutions?: string | null;
  technicalArchitecture?: string | null;
  securityConsiderations?: string | null;
  performanceConsiderations?: string | null;
  implementationPlan?: string | null;
  migrationPlan?: string | null;
  risks?: string | null;
  dependencies?: string | null;
  reviewers?: string[] | null;
  decisionDeadline?: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; name: string; avatarUrl?: string | null };
  project?: { id: string; name: string } | null;
  reviews?: RFCReviewItem[];
  votes?: RFCVoteItem[];
  decisions?: ArchitectureDecisionItem[];
  voteTallies?: {
    total: number;
    approve: number;
    reject: number;
    abstain: number;
    consensus: string;
  };
}

export interface RFCReviewItem {
  id: string;
  rfcId: string;
  reviewerId: string;
  status: string;
  comments?: string | null;
  reviewedAt?: string | null;
  reviewer?: { id: string; name: string; avatarUrl?: string | null };
}

export interface RFCVoteItem {
  id: string;
  rfcId: string;
  voterId: string;
  vote: 'APPROVE' | 'REJECT' | 'ABSTAIN';
  createdAt: string;
  voter?: { id: string; name: string; avatarUrl?: string | null };
}

export interface ArchitectureDecisionItem {
  id: string;
  workspaceId: string;
  projectId?: string | null;
  rfcId?: string | null;
  decisionNumber: number;
  title: string;
  status: string;
  context: string;
  decision: string;
  alternativesConsidered?: string | null;
  consequences: string;
  approvedById: string;
  approvedAt: string;
  documentId?: string | null;
  createdAt: string;
  updatedAt: string;
  approvedBy?: { id: string; name: string; avatarUrl?: string | null };
  project?: { id: string; name: string } | null;
  rfc?: { id: string; rfcNumber: number; title: string } | null;
}

// Team, Access Control & Invitation Types
export interface WorkspaceMemberItem {
  id: string;
  workspaceId: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: UserRole;
  status: string;
  title?: string | null;
  department?: string | null;
  joinedAt: string;
  assignedProjectCount?: number;
  assignedTaskCount?: number;
}

export interface WorkspaceInvitationItem {
  id: string;
  workspaceId: string;
  email: string;
  role: UserRole;
  invitedById: string;
  token?: string;
  status: string;
  expiresAt: string;
  acceptedAt?: string | null;
  createdAt: string;
  invitedBy?: { id: string; name: string; avatarUrl?: string | null };
}

export interface TeamDashboardStats {
  totalMembers: number;
  activeMembers: number;
  pendingInvitations: number;
  suspendedMembers: number;
  roleDistribution: {
    owners: number;
    admins: number;
    editors: number;
    viewers: number;
  };
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

// ===========================================================================
// RISKS & DEPENDENCIES TYPES
// ===========================================================================

export type RiskProbability = 'LOW' | 'MEDIUM' | 'HIGH';
export type RiskImpact = 'LOW' | 'MEDIUM' | 'HIGH';
export type RiskSeverityClassification = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskItem {
  id: string;
  projectId: string;
  workspaceId?: string | null;
  title: string;
  description: string;
  category: string;
  probability: RiskProbability;
  impact: RiskImpact;
  severity: RiskSeverityClassification;
  score: number;
  priority: string;
  riskOwnerId?: string | null;
  mitigationPlan?: string | null;
  contingencyPlan?: string | null;
  status: string;
  targetDate?: string | null;
  resolvedDate?: string | null;
  relatedTaskId?: string | null;
  relatedBugId?: string | null;
  createdAt: string;
  updatedAt: string;
  project?: { id: string; name: string };
  owner?: { id: string; name: string; avatarUrl?: string | null } | null;
  mitigations?: RiskMitigationItem[];
  history?: RiskHistoryItem[];
  comments?: RiskCommentItem[];
}

export interface RiskMitigationItem {
  id: string;
  riskId: string;
  description: string;
  ownerId?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  status: string;
  progress: number;
  completedAt?: string | null;
  evidence?: string | null;
  createdAt: string;
  updatedAt: string;
  owner?: { id: string; name: string; avatarUrl?: string | null } | null;
}

export interface RiskHistoryItem {
  id: string;
  riskId: string;
  previousStatus: string;
  newStatus: string;
  changedById: string;
  changedAt: string;
  reason?: string | null;
  changedBy?: { id: string; name: string; avatarUrl?: string | null };
}

export interface RiskCommentItem {
  id: string;
  riskId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author?: { id: string; name: string; avatarUrl?: string | null };
}

export interface RiskMatrixCell {
  probability: RiskProbability;
  impact: RiskImpact;
  score: number;
  classification: RiskSeverityClassification;
  count: number;
  risks: RiskItem[];
}

export interface RiskDashboardStats {
  totalRisks: number;
  criticalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  openRisks: number;
  mitigatedRisks: number;
  overdueRisks: number;
  unassignedRisks: number;
  matrix: RiskMatrixCell[];
}

export interface ProjectDependencyItem {
  id: string;
  workspaceId: string;
  projectId?: string | null;
  title: string;
  description?: string | null;
  sourceProjectId?: string | null;
  targetProjectId?: string | null;
  sourceTaskId?: string | null;
  targetTaskId?: string | null;
  ownerId?: string | null;
  dependencyType: string;
  priority: string;
  status: string;
  dueDate?: string | null;
  resolutionNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  workspace?: { id: string; name: string };
  sourceProject?: { id: string; name: string } | null;
  targetProject?: { id: string; name: string } | null;
  owner?: { id: string; name: string; avatarUrl?: string | null } | null;
}

// ===========================================================================
// REPORTS & ANALYTICS TYPES
// ===========================================================================

export interface KPICardMetric {
  title: string;
  currentValue: number | string;
  previousValue?: number | string | null;
  percentageChange?: number | null;
  trend: 'UP' | 'DOWN' | 'NEUTRAL';
  unit?: string;
  definition: string;
  period: string;
}

export interface ExecutiveReportData {
  kpis: {
    sprintVelocity: KPICardMetric;
    taskThroughput: KPICardMetric;
    defectResolutionRate: KPICardMetric;
    engineeringHours: KPICardMetric;
    sprintCompletionRate: KPICardMetric;
    backlogSize: KPICardMetric;
    openCriticalBugs: KPICardMetric;
    onTimeDeliveryRate: KPICardMetric;
  };
  velocityTrends: Array<{
    sprintName: string;
    plannedPoints: number;
    completedPoints: number;
  }>;
  throughputBreakdown: {
    completed: number;
    inProgress: number;
    backlog: number;
    blocked: number;
    overdue: number;
    averagePerWeek: number;
  };
  defectResolution: {
    totalBugs: number;
    openBugs: number;
    resolvedBugs: number;
    criticalBugs: number;
    highBugs: number;
    resolutionRate: number;
    avgResolutionHours: number;
    reopenRate: number;
    bySeverity: Record<string, number>;
    byEnvironment: Record<string, number>;
  };
  engineeringTime: {
    totalHours: number;
    billableHours: number;
    nonBillableHours: number;
    byProject: Array<{ projectName: string; hours: number }>;
    byMember: Array<{ memberName: string; hours: number }>;
  };
  statusBreakdown: Array<{
    status: string;
    count: number;
    percentage: number;
    storyPoints: number;
  }>;
  projectHealth: {
    overallProgress: number;
    milestoneCompletion: number;
    openRisks: number;
    blockedTasks: number;
    releaseReadiness: number;
  };
}

// ===========================================================================
// SETTINGS, INTEGRATIONS & AUDIT TYPES
// ===========================================================================

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  bio?: string | null;
  timezone?: string | null;
  preferredLanguage?: string | null;
  twoFactorEnabled: boolean;
}

export interface WorkspaceConfigData {
  id: string;
  name: string;
  slug: string;
  companyName?: string | null;
  website?: string | null;
  industry?: string | null;
  timezone?: string | null;
  defaultVisibility?: string | null;
  themePreference: string;
  notifyOnComment: boolean;
  notifyOnReview: boolean;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  projectUpdates: boolean;
  taskAssignments: boolean;
  bugAlerts: boolean;
  releaseApprovals: boolean;
  securityAlerts: boolean;
}

export interface IntegrationConnectorItem {
  id: string;
  workspaceId: string;
  provider: string;
  name: string;
  description?: string;
  isConnected: boolean;
  config: Record<string, any>;
  syncStatus: string;
  lastSyncAt?: string | null;
}

export interface AuditLogRecord {
  id: string;
  workspaceId: string;
  projectId?: string | null;
  userId?: string | null;
  actorName?: string | null;
  action: string;
  category: string;
  status: string;
  entityType: string;
  entityId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
  createdAt: string;
  user?: { id: string; name: string; avatarUrl?: string | null } | null;
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
