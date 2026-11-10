'use client';

import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/useAuthStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog } from '../../components/ui/dialog';
import { Progress } from '../../components/ui/progress';
import {
  Files,
  Folder,
  FolderPlus,
  Upload,
  Download,
  Trash2,
  Edit2,
  Eye,
  FileText,
  FileCode,
  Image as ImageIcon,
  FileArchive,
  Search,
  Filter,
  HardDrive,
  RefreshCw,
  MoreVertical,
  Check,
  CheckSquare,
  Square,
  ArrowRight,
  Copy,
  RotateCcw,
  AlertTriangle,
  FolderOpen,
  ChevronRight,
  ExternalLink,
  Layers,
  Tag
} from 'lucide-react';

interface FilesViewProps {
  projectId?: string;
}

export function FilesView({ projectId }: FilesViewProps) {
  const queryClient = useQueryClient();
  const { currentWorkspace, user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Navigation & Filter state
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState(projectId || 'ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showTrash, setShowTrash] = useState(false);

  // Selection state for bulk operations
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  // Dialog states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#3b82f6');
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<any | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [moveTargetIds, setMoveTargetIds] = useState<string[]>([]);
  const [targetFolderId, setTargetFolderId] = useState<string>('root');

  // Preview Modal
  const [previewFile, setPreviewFile] = useState<any | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Upload state
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const workspaceId = currentWorkspace?.id;

  // 1. Storage Stats Telemetry
  const { data: stats } = useQuery({
    queryKey: ['files-stats', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;
      const res = await api.get<any>(`/files/stats?workspaceId=${workspaceId}`);
      return res.data;
    },
    enabled: !!workspaceId
  });

  // 2. Folders
  const { data: folders = [] } = useQuery({
    queryKey: ['files-folders', workspaceId, selectedProjectFilter],
    queryFn: async () => {
      if (!workspaceId) return [];
      const projectParam = selectedProjectFilter !== 'ALL' ? `&projectId=${selectedProjectFilter}` : '';
      const res = await api.get<any[]>(`/files/folders?workspaceId=${workspaceId}${projectParam}`);
      return res.data || [];
    },
    enabled: !!workspaceId
  });

  // 3. Projects
  const { data: projects = [] } = useQuery({
    queryKey: ['workspace-projects-files', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const res = await api.get<any>(`/projects?workspaceId=${workspaceId}`);
      return res.data?.projects || res.data || [];
    },
    enabled: !!workspaceId
  });

  // 4. File Items List
  const {
    data: files = [],
    isLoading,
    refetch: refetchFiles
  } = useQuery({
    queryKey: [
      'files-list',
      workspaceId,
      currentFolderId,
      selectedProjectFilter,
      selectedType,
      searchQuery,
      sortBy,
      showTrash
    ],
    queryFn: async () => {
      if (!workspaceId) return [];
      const params = new URLSearchParams({ workspaceId });
      if (currentFolderId) params.append('folderId', currentFolderId);
      if (selectedProjectFilter !== 'ALL') params.append('projectId', selectedProjectFilter);
      if (selectedType !== 'ALL') params.append('type', selectedType);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (sortBy) params.append('sortBy', sortBy);
      if (showTrash) params.append('includeDeleted', 'true');

      const res = await api.get<any[]>(`/files?${params.toString()}`);
      return res.data || [];
    },
    enabled: !!workspaceId
  });

  // Folder breadcrumb trail
  const currentFolder = folders.find((f: any) => f.id === currentFolderId);

  // Mutations
  const createFolderMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/files/folders', {
        workspaceId,
        projectId: selectedProjectFilter !== 'ALL' ? selectedProjectFilter : undefined,
        parentId: currentFolderId,
        name: newFolderName.trim(),
        color: newFolderColor
      });
      return res.data;
    },
    onSuccess: () => {
      setNewFolderName('');
      setIsNewFolderOpen(false);
      queryClient.invalidateQueries({ queryKey: ['files-folders'] });
    }
  });

  const renameMutation = useMutation({
    mutationFn: async () => {
      if (!renameTarget) return;
      const res = await api.put(`/files/${renameTarget.id}/rename`, {
        name: renameValue.trim()
      });
      return res.data;
    },
    onSuccess: () => {
      setIsRenameOpen(false);
      setRenameTarget(null);
      refetchFiles();
      queryClient.invalidateQueries({ queryKey: ['files-stats'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, permanent }: { id: string; permanent?: boolean }) => {
      const res = await api.delete(`/files/${id}${permanent ? '?permanent=true' : ''}`);
      return res.data;
    },
    onSuccess: () => {
      refetchFiles();
      queryClient.invalidateQueries({ queryKey: ['files-stats'] });
    }
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/files/${id}/restore`);
      return res.data;
    },
    onSuccess: () => {
      refetchFiles();
      queryClient.invalidateQueries({ queryKey: ['files-stats'] });
    }
  });

  const copyMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/files/${id}/copy`);
      return res.data;
    },
    onSuccess: () => {
      refetchFiles();
      queryClient.invalidateQueries({ queryKey: ['files-stats'] });
    }
  });

  const moveFilesMutation = useMutation({
    mutationFn: async () => {
      const target = targetFolderId === 'root' ? null : targetFolderId;
      const res = await api.post('/files/bulk-move', {
        fileIds: moveTargetIds,
        targetFolderId: target
      });
      return res.data;
    },
    onSuccess: () => {
      setIsMoveOpen(false);
      setSelectedFileIds([]);
      refetchFiles();
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (permanent?: boolean) => {
      const res = await api.post('/files/bulk-delete', {
        fileIds: selectedFileIds,
        permanent: !!permanent
      });
      return res.data;
    },
    onSuccess: () => {
      setSelectedFileIds([]);
      refetchFiles();
      queryClient.invalidateQueries({ queryKey: ['files-stats'] });
    }
  });

  // Handle File Upload
  const handleFileUpload = async (filesToUpload: FileList | File[]) => {
    if (!filesToUpload || filesToUpload.length === 0 || !workspaceId) return;

    setUploadProgress(10);
    setUploadError(null);

    const formData = new FormData();
    formData.append('workspaceId', workspaceId);
    if (selectedProjectFilter !== 'ALL') {
      formData.append('projectId', selectedProjectFilter);
    }
    if (currentFolderId) {
      formData.append('folderId', currentFolderId);
    }

    // Attach all files
    for (let i = 0; i < filesToUpload.length; i++) {
      formData.append('files', filesToUpload[i]);
    }

    try {
      setUploadProgress(50);
      const res = await api.upload<any>('/files/upload', formData);
      setUploadProgress(100);
      setTimeout(() => {
        setUploadProgress(null);
        setIsUploadOpen(false);
        refetchFiles();
        queryClient.invalidateQueries({ queryKey: ['files-stats'] });
      }, 500);
    } catch (err: any) {
      setUploadError(err.message || 'File upload failed. Ensure files are < 50MB.');
      setUploadProgress(null);
    }
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Preview Action
  const openPreview = async (file: any) => {
    setPreviewFile(file);
    setPreviewContent(null);
    setPreviewLoading(true);

    try {
      const res = await api.get<any>(`/files/${file.id}/preview`);
      if (res.data?.content) {
        setPreviewContent(res.data.content);
      }
    } catch {
      setPreviewContent(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Download Trigger
  const handleDownload = (file: any) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    const url = `http://localhost:4000/api/v1/files/${file.id}/download${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    window.open(url, '_blank');
  };

  // Helper formatting
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (ext: string) => {
    const lower = ext.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'].includes(lower)) {
      return <ImageIcon className="h-5 w-5 text-purple-500" />;
    }
    if (['json', 'xml', 'yaml', 'yml', 'sql', 'xsd', 'ts', 'tsx', 'js'].includes(lower)) {
      return <FileCode className="h-5 w-5 text-emerald-500" />;
    }
    if (['zip', 'tar', 'gz'].includes(lower)) {
      return <FileArchive className="h-5 w-5 text-amber-500" />;
    }
    return <FileText className="h-5 w-5 text-blue-500" />;
  };

  const usedPercentage = stats
    ? Math.min(100, Math.round((stats.totalStorageBytes / (stats.storageLimitBytes || 53687091200)) * 100))
    : 0;

  // Multi-select helpers
  const toggleSelectAll = () => {
    if (selectedFileIds.length === files.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(files.map((f: any) => f.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedFileIds.includes(id)) {
      setSelectedFileIds(selectedFileIds.filter((item) => item !== id));
    } else {
      setSelectedFileIds([...selectedFileIds, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Storage Dashboard Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">
                Total Files
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1 font-mono">
                {stats?.totalFiles ?? files.length}
              </h3>
              <p className="text-[10px] text-foreground-muted mt-0.5">
                Across {folders.length} active directories
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
              <Files className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">
                Storage Used
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1 font-mono">
                {formatBytes(stats?.totalStorageBytes ?? 0)}
              </h3>
              <p className="text-[10px] text-foreground-muted mt-0.5">
                Of {formatBytes(stats?.storageLimitBytes ?? 53687091200)} allocation
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-xs">
              <HardDrive className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs sm:col-span-2">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Workspace Storage Quota</span>
              <span className="text-foreground-muted font-mono">{usedPercentage}% capacity used</span>
            </div>
            <Progress value={Math.max(2, usedPercentage)} className="h-2" />
            <div className="flex items-center justify-between text-[11px] text-foreground-muted pt-1">
              <span>50 GB Enterprise Tier</span>
              <div className="flex items-center gap-2">
                {stats?.filesByType &&
                  Object.entries(stats.filesByType).map(([ext, info]: [string, any]) => (
                    <span key={ext} className="font-mono text-[10px]">
                      {ext}: {info.count}
                    </span>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Action Bar & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-xs">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs min-w-0">
          <button
            onClick={() => setCurrentFolderId(null)}
            className={`font-semibold hover:text-primary transition-colors flex items-center gap-1.5 ${
              currentFolderId === null ? 'text-primary' : 'text-foreground-muted'
            }`}
          >
            <FolderOpen className="h-4 w-4" />
            <span>Root Workspace</span>
          </button>

          {currentFolder && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-foreground-muted shrink-0" />
              <span className="font-semibold text-foreground truncate">{currentFolder.name}</span>
            </>
          )}

          {showTrash && (
            <Badge variant="destructive" className="ml-2 text-[10px]">
              Trash Bin (Deleted)
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTrash(!showTrash)}
            className={`text-xs gap-1.5 ${showTrash ? 'border-destructive text-destructive' : ''}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{showTrash ? 'Exit Trash' : 'View Trash'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsNewFolderOpen(true)}
            className="text-xs gap-1.5"
          >
            <FolderPlus className="h-3.5 w-3.5 text-primary" />
            <span>New Folder</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            className="text-xs gap-1.5 shadow-xs"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload Files</span>
          </Button>
        </div>
      </div>

      {/* 3. Search, Filters & View Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents, specifications, diagrams..."
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-end">
          {/* Project Filter */}
          <select
            value={selectedProjectFilter}
            onChange={(e) => setSelectedProjectFilter(e.target.value)}
            className="h-9 px-2.5 rounded-lg border border-border bg-card text-xs text-foreground focus:ring-1 focus:ring-primary shadow-xs font-medium"
          >
            <option value="ALL">All Projects</option>
            {projects.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-9 px-2.5 rounded-lg border border-border bg-card text-xs text-foreground focus:ring-1 focus:ring-primary shadow-xs font-medium"
          >
            <option value="ALL">All Types</option>
            <option value="PDF">PDF Documents</option>
            <option value="MARKDOWN">Markdown Docs</option>
            <option value="IMAGE">Images & Diagrams</option>
            <option value="CODE">JSON / Code / Config</option>
            <option value="SCHEMA">XML / XSD Schemas</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 px-2.5 rounded-lg border border-border bg-card text-xs text-foreground focus:ring-1 focus:ring-primary shadow-xs font-medium"
          >
            <option value="newest">Recently Uploaded</option>
            <option value="name">Alphabetical (A-Z)</option>
            <option value="size">Largest File Size</option>
            <option value="oldest">Oldest First</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden bg-card">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 text-xs ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-foreground-muted hover:text-foreground'}`}
            >
              <Layers className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 text-xs ${viewMode === 'list' ? 'bg-primary text-white' : 'text-foreground-muted hover:text-foreground'}`}
            >
              <Files className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Bulk Operations Bar (When multiple selected) */}
      {selectedFileIds.length > 0 && (
        <div className="flex items-center justify-between bg-primary/10 border border-primary/20 px-4 py-2.5 rounded-xl text-xs">
          <div className="flex items-center gap-2 text-primary font-medium">
            <CheckSquare className="h-4 w-4" />
            <span>{selectedFileIds.length} item(s) selected</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMoveTargetIds(selectedFileIds);
                setIsMoveOpen(true);
              }}
              className="text-xs gap-1.5 h-8 bg-card"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              <span>Move To Folder</span>
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => bulkDeleteMutation.mutate(showTrash)}
              className="text-xs gap-1.5 h-8"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{showTrash ? 'Permanently Delete' : 'Delete Selected'}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFileIds([])}
              className="text-xs h-8"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* 5. Folder Hierarchy Chips (If in Root) */}
      {!currentFolderId && folders.length > 0 && !showTrash && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
            Directories & Blueprint Packages
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {folders.map((folder: any) => (
              <div
                key={folder.id}
                onClick={() => setCurrentFolderId(folder.id)}
                className="p-3 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-between group shadow-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${folder.color || '#3b82f6'}20`, color: folder.color || '#3b82f6' }}
                  >
                    <Folder className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {folder.name}
                    </p>
                    <p className="text-[10px] text-foreground-muted">
                      {folder._count?.files ?? 0} files
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-foreground-muted group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Files Display (Grid or List) */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-foreground-muted bg-card rounded-xl border border-border">
          <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
          <span>Loading asset repository...</span>
        </div>
      ) : files.length === 0 ? (
        <div className="p-16 text-center bg-card rounded-xl border border-dashed border-border space-y-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Files className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {showTrash ? 'Trash bin is empty' : 'No files found in this directory'}
            </h3>
            <p className="text-xs text-foreground-muted mt-1 max-w-sm mx-auto">
              {showTrash
                ? 'Soft-deleted documents and assets will appear here before permanent purging.'
                : 'Upload architecture specs, SVG diagrams, JSON contracts, or schemas to share with your team.'}
            </p>
          </div>
          {!showTrash && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsUploadOpen(true)}
              className="text-xs gap-1.5 shadow-xs"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload First Asset</span>
            </Button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.map((file: any) => {
            const isSelected = selectedFileIds.includes(file.id);
            return (
              <Card
                key={file.id}
                className={`border-border bg-card hover:border-primary/50 transition-all shadow-xs relative group ${
                  isSelected ? 'ring-2 ring-primary border-transparent' : ''
                }`}
              >
                <CardContent className="p-4 space-y-3">
                  {/* Card Header & Checkbox */}
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => toggleSelectOne(file.id)}
                      className="text-foreground-muted hover:text-primary transition-colors pt-0.5"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4 text-primary" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px] font-mono uppercase">
                        {file.extension}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        v{file.version}
                      </Badge>
                    </div>
                  </div>

                  {/* Thumbnail / Icon & Name */}
                  <div
                    onClick={() => openPreview(file)}
                    className="cursor-pointer space-y-2 pt-1"
                  >
                    <div className="h-24 rounded-lg bg-background-secondary border border-border/60 flex items-center justify-center group-hover:bg-primary/5 transition-colors overflow-hidden">
                      {['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(file.extension.toLowerCase()) ? (
                        <div className="relative w-full h-full flex items-center justify-center p-2">
                          <ImageIcon className="h-10 w-10 text-primary/40 group-hover:scale-110 transition-transform" />
                        </div>
                      ) : (
                        <div className="p-4 text-center">
                          {getFileIcon(file.extension)}
                          <span className="text-[10px] font-mono text-foreground-muted block mt-1">
                            {formatBytes(file.sizeBytes)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {file.name}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] text-foreground-muted mt-1">
                        <span>{file.project?.name || 'Workspace Asset'}</span>
                        <span>{formatBytes(file.sizeBytes)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata and Actions */}
                  <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] text-foreground-muted">
                    <span>By {file.uploader?.name?.split(' ')[0] || 'Engineer'}</span>

                    <div className="flex items-center gap-1">
                      {!showTrash ? (
                        <>
                          <button
                            onClick={() => openPreview(file)}
                            className="p-1 hover:text-primary transition-colors"
                            title="Preview"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownload(file)}
                            className="p-1 hover:text-primary transition-colors"
                            title="Download"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => copyMutation.mutate(file.id)}
                            className="p-1 hover:text-primary transition-colors"
                            title="Duplicate"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setRenameTarget(file);
                              setRenameValue(file.name);
                              setIsRenameOpen(true);
                            }}
                            className="p-1 hover:text-primary transition-colors"
                            title="Rename"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate({ id: file.id })}
                            className="p-1 hover:text-destructive transition-colors"
                            title="Move to Trash"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => restoreMutation.mutate(file.id)}
                            className="p-1 hover:text-emerald-500 transition-colors flex items-center gap-1"
                            title="Restore"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Restore</span>
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate({ id: file.id, permanent: true })}
                            className="p-1 hover:text-destructive transition-colors ml-2"
                            title="Delete Permanently"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card className="border-border bg-card">
          <CardContent className="p-0 divide-y divide-border">
            <div className="p-3 bg-background-secondary flex items-center justify-between text-xs font-semibold text-foreground-muted">
              <div className="flex items-center gap-3">
                <button onClick={toggleSelectAll} className="hover:text-primary">
                  {selectedFileIds.length === files.length && files.length > 0 ? (
                    <CheckSquare className="h-4 w-4 text-primary" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
                <span>File Name</span>
              </div>
              <div className="flex items-center gap-8 pr-4">
                <span className="w-24 text-right">Size</span>
                <span className="w-24">Version</span>
                <span className="w-28">Project</span>
                <span className="w-28 text-right">Actions</span>
              </div>
            </div>

            {files.map((file: any) => {
              const isSelected = selectedFileIds.includes(file.id);
              return (
                <div
                  key={file.id}
                  className={`p-3 flex items-center justify-between hover:bg-background-secondary/50 transition-colors text-xs ${
                    isSelected ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => toggleSelectOne(file.id)}
                      className="text-foreground-muted hover:text-primary"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4 text-primary" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                    {getFileIcon(file.extension)}
                    <span
                      onClick={() => openPreview(file)}
                      className="font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                    >
                      {file.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-8 pr-4 text-foreground-muted text-[11px]">
                    <span className="w-24 text-right font-mono">{formatBytes(file.sizeBytes)}</span>
                    <span className="w-24 font-mono">v{file.version}</span>
                    <span className="w-28 truncate">{file.project?.name || 'Workspace'}</span>
                    <div className="w-28 flex items-center justify-end gap-2">
                      {!showTrash ? (
                        <>
                          <button
                            onClick={() => openPreview(file)}
                            className="p-1 hover:text-primary"
                            title="Preview"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownload(file)}
                            className="p-1 hover:text-primary"
                            title="Download"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate({ id: file.id })}
                            className="p-1 hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => restoreMutation.mutate(file.id)}
                          className="p-1 hover:text-emerald-500 flex items-center gap-1"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Restore</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* DIALOG 1: Upload Modal */}
      <Dialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Enterprise Documents & Assets"
        description="Drag and drop specification files, diagrams, or bundles up to 50MB."
        maxWidth="lg"
      >
        <div className="space-y-4 pt-2">
          {/* Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/60 bg-background-secondary/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFileUpload(e.target.files);
              }}
            />
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <Upload className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Drop files here or click to browse
            </p>
            <p className="text-xs text-foreground-muted mt-1">
              Supports PDF, DOCX, XLSX, CSV, Markdown, PNG, JPG, SVG, WEBP, ZIP, JSON, YAML, SQL, XSD
            </p>
          </div>

          {/* Progress / Status */}
          {uploadProgress !== null && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Uploading files...</span>
                <span className="font-mono text-primary">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {uploadError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsUploadOpen(false)}
              className="text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      </Dialog>

      {/* DIALOG 2: Create Folder */}
      <Dialog
        isOpen={isNewFolderOpen}
        onClose={() => setIsNewFolderOpen(false)}
        title="Create Asset Directory"
        description="Organize documents into categorized folders with color labels."
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">
              Folder Name
            </label>
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="e.g. Infrastructure Topologies"
              className="h-9 text-xs"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">
              Label Color
            </label>
            <div className="flex items-center gap-2">
              {['#2563eb', '#16a34a', '#9333ea', '#ea580c', '#e11d48', '#0284c7'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewFolderColor(c)}
                  className={`h-6 w-6 rounded-full transition-transform ${
                    newFolderColor === c ? 'scale-125 ring-2 ring-primary ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNewFolderOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => createFolderMutation.mutate()}
              disabled={!newFolderName.trim()}
              className="text-xs"
            >
              Create Folder
            </Button>
          </div>
        </div>
      </Dialog>

      {/* DIALOG 3: Rename File */}
      <Dialog
        isOpen={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        title="Rename File"
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">
              New File Name
            </label>
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="h-9 text-xs"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRenameOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => renameMutation.mutate()}
              disabled={!renameValue.trim()}
              className="text-xs"
            >
              Save Rename
            </Button>
          </div>
        </div>
      </Dialog>

      {/* DIALOG 4: Move Files */}
      <Dialog
        isOpen={isMoveOpen}
        onClose={() => setIsMoveOpen(false)}
        title="Move Selected Files"
        description="Choose destination directory within the current workspace."
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">
              Target Folder
            </label>
            <select
              value={targetFolderId}
              onChange={(e) => setTargetFolderId(e.target.value)}
              className="w-full h-9 px-2.5 rounded-lg border border-border bg-card text-xs text-foreground focus:ring-1 focus:ring-primary shadow-xs"
            >
              <option value="root">Root Workspace</option>
              {folders.map((f: any) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMoveOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => moveFilesMutation.mutate()}
              className="text-xs"
            >
              Confirm Move
            </Button>
          </div>
        </div>
      </Dialog>

      {/* DIALOG 5: Preview Drawer / Modal */}
      <Dialog
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        title={previewFile?.name || 'File Preview'}
        description={`Size: ${formatBytes(previewFile?.sizeBytes || 0)} • Type: ${previewFile?.mimeType}`}
        maxWidth="3xl"
      >
        <div className="space-y-4 pt-2">
          {previewLoading ? (
            <div className="p-12 text-center text-xs text-foreground-muted">
              <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
              <span>Rendering preview...</span>
            </div>
          ) : previewFile && ['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(previewFile.extension?.toLowerCase()) ? (
            <div className="max-h-[60vh] overflow-auto flex items-center justify-center p-4 bg-background-secondary/50 rounded-xl border border-border">
              {/* If SVG text content is available, render safely */}
              {previewFile.extension.toLowerCase() === 'svg' && previewContent ? (
                <div
                  className="w-full max-w-2xl"
                  dangerouslySetInnerHTML={{ __html: previewContent }}
                />
              ) : (
                <img
                  src={`http://localhost:4000/api/v1/files/${previewFile.id}/preview`}
                  alt={previewFile.name}
                  className="max-h-[50vh] object-contain rounded-lg"
                />
              )}
            </div>
          ) : previewContent ? (
            <div className="max-h-[60vh] overflow-auto p-4 bg-background-secondary rounded-xl border border-border font-mono text-xs whitespace-pre-wrap leading-relaxed text-foreground">
              {previewContent}
            </div>
          ) : (
            <div className="p-12 text-center bg-card rounded-xl border border-border space-y-3">
              <FileText className="h-10 w-10 text-primary mx-auto opacity-70" />
              <p className="text-xs text-foreground-muted">
                Binary preview unavailable directly in browser. Download the file to inspect.
              </p>
            </div>
          )}

          {/* Metadata bar */}
          {previewFile && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-border text-[11px] text-foreground-muted">
              <div>
                <span className="block font-semibold text-foreground">Uploaded By</span>
                <span>{previewFile.uploader?.name || 'Engineer'}</span>
              </div>
              <div>
                <span className="block font-semibold text-foreground">Version</span>
                <span className="font-mono">v{previewFile.version}</span>
              </div>
              <div>
                <span className="block font-semibold text-foreground">Storage</span>
                <span className="font-mono">{previewFile.storageType}</span>
              </div>
              <div>
                <span className="block font-semibold text-foreground">Uploaded At</span>
                <span>{new Date(previewFile.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleDownload(previewFile)}
              className="text-xs gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download File</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewFile(null)}
              className="text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
