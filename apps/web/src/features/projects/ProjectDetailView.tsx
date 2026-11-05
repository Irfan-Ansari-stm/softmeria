'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FolderKanban,
  Download,
  Copy,
  Plus,
  FileText,
  CheckCircle2,
  Clock,
  ExternalLink,
  Upload,
  Layers,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  GitBranch,
  Settings,
  MoreVertical,
  Archive
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { ImportModal } from '../imports-exports/ImportModal';

interface ProjectDetailViewProps {
  projectId: string;
}

export function ProjectDetailView({ projectId }: ProjectDetailViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isAddCatOpen, setIsAddCatOpen] = useState(false);
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [targetCategoryId, setTargetCategoryId] = useState('');

  // Add category form state
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // Add document form state
  const [docTitle, setDocTitle] = useState('');
  const [docDesc, setDocDesc] = useState('');
  const [docFileName, setDocFileName] = useState('');

  // Load project data
  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await api.get<any>(`/projects/${projectId}`);
      return res.data;
    }
  });

  // Load categories & documents tree
  const { data: categories = [], refetch: refetchCategories } = useQuery({
    queryKey: ['categories-tree', projectId],
    queryFn: async () => {
      const res = await api.get<any[]>(`/projects/${projectId}/categories`);
      return res.data || [];
    }
  });

  // Create Category Mutation
  const createCategoryMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/projects/${projectId}/categories`, {
        name: catName,
        description: catDesc
      });
      return res.data;
    },
    onSuccess: () => {
      setCatName('');
      setCatDesc('');
      setIsAddCatOpen(false);
      refetchCategories();
    }
  });

  // Create Document Mutation
  const createDocMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<any>('/documents', {
        projectId,
        categoryId: targetCategoryId || categories[0]?.id,
        title: docTitle,
        fileName: docFileName || undefined,
        description: docDesc,
        content: `# ${docTitle}\n\n*Add technical documentation and specifications here.*`
      });
      return res.data;
    },
    onSuccess: (newDoc: any) => {
      setDocTitle('');
      setDocDesc('');
      setDocFileName('');
      setIsAddDocOpen(false);
      refetchCategories();
      router.push(`/projects/${projectId}/docs/${newDoc.id}`);
    }
  });

  // Duplicate Project Mutation
  const duplicateProjectMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<any>(`/projects/${projectId}/duplicate`);
      return res.data;
    },
    onSuccess: (dup: any) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      router.push(`/projects/${dup.id}`);
    }
  });

  // Export Complete Project ZIP handler
  const handleExportZip = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    window.open(`${apiBase}/projects/${projectId}/export`, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return <Badge variant="success">Completed</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="status-progress">In Progress</Badge>;
      case 'IN_REVIEW':
        return <Badge variant="warning">In Review</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  if (isProjectLoading || !project) {
    return (
      <div className="p-8 text-center text-xs text-zinc-500">
        Loading project workspace...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Project Header Banner */}
      <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-md space-y-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
              style={{ backgroundColor: project.color || '#4f46e5' }}
            >
              <FolderKanban className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-zinc-100">
                  {project.name}
                </h1>
                <Badge variant="outline" className="text-xs">
                  {project.status}
                </Badge>
                <Badge variant="default" className="text-xs font-mono">
                  {project.visibility}
                </Badge>
              </div>
              <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                {project.description || 'No description provided.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportOpen(true)}
              className="text-xs gap-1.5"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Import</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => duplicateProjectMutation.mutate()}
              isLoading={duplicateProjectMutation.isPending}
              className="text-xs gap-1.5"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Duplicate</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportZip}
              className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-500 shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Complete Blueprint (.zip)</span>
            </Button>
          </div>
        </div>

        {/* Tech Stack & Git Link */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-zinc-500 text-[11px] font-medium mr-1">Tech Stack:</span>
            {(project.techStack || []).map((tech: string) => (
              <span
                key={tech}
                className="px-2 py-0.5 rounded bg-zinc-800 text-[11px] font-mono text-zinc-300"
              >
                {tech}
              </span>
            ))}
          </div>

          {project.repositoryUrl && (
            <a
              href={project.repositoryUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-xs font-medium"
            >
              <GitBranch className="h-3.5 w-3.5" />
              <span>Git Repository</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* Progress Metric & Category Overview */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Documentation Blueprint Progress
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Calculated across required non-optional engineering specifications.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold font-mono text-zinc-100">
                {project.completionPercentage}%
              </span>
              <span className="text-xs text-zinc-500">
                ({project.completedDocuments} / {project.totalDocuments} completed)
              </span>
            </div>
          </div>
          <Progress value={project.completionPercentage} size="md" />
        </CardContent>
      </Card>

      {/* Categories & Documents List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <FolderOpen className="h-4.5 w-4.5 text-amber-500" />
            <span>Documentation Categories & Blueprint Specifications</span>
          </h2>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddCatOpen(true)}
              className="text-xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Category</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setTargetCategoryId(categories[0]?.id || '');
                setIsAddDocOpen(true);
              }}
              className="text-xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Document</span>
            </Button>
          </div>
        </div>

        {/* Categories Stack */}
        <div className="space-y-4">
          {categories.map((cat: any) => (
            <Card key={cat.id} className="overflow-hidden border-zinc-800 bg-zinc-900/40">
              <CardHeader className="p-4 bg-zinc-900/80 border-b border-zinc-800/60 flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-zinc-100">
                      {cat.name}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-800">
                      {cat.slug}
                    </span>
                  </div>
                  {cat.description && (
                    <p className="text-xs text-zinc-400">{cat.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-semibold text-zinc-200 font-mono">
                      {cat.completionPercentage}%
                    </span>
                    <span className="text-[10px] text-zinc-500 block">
                      {cat.completedCount} / {cat.documentCount} Done
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setTargetCategoryId(cat.id);
                      setIsAddDocOpen(true);
                    }}
                    className="text-xs p-1 h-7"
                    title="Add document to category"
                  >
                    <Plus className="h-3.5 w-3.5 text-zinc-400 hover:text-zinc-100" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-0 divide-y divide-zinc-800/40">
                {(cat.documents || []).length === 0 ? (
                  <div className="p-4 text-center text-xs text-zinc-500 italic">
                    No documents in this category yet.
                  </div>
                ) : (
                  cat.documents.map((doc: any) => (
                    <Link
                      key={doc.id}
                      href={`/projects/${projectId}/docs/${doc.id}`}
                      className="p-3.5 flex items-center justify-between hover:bg-zinc-800/40 transition-colors group block"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-zinc-100 group-hover:text-indigo-300 transition-colors truncate">
                            {doc.title}
                          </p>
                          <p className="text-[11px] text-zinc-500 font-mono truncate">
                            {doc.fileName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {doc.isOptional && (
                          <Badge variant="outline" className="text-[10px] text-zinc-500">
                            Optional
                          </Badge>
                        )}
                        {getStatusBadge(doc.status)}
                        <span className="text-xs text-zinc-500 font-mono">
                          v{doc.versionNumber}
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Category Dialog */}
      <Dialog
        isOpen={isAddCatOpen}
        onClose={() => setIsAddCatOpen(false)}
        title="Add Documentation Category"
        description="Create a custom category or architecture domain."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createCategoryMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Category Name *"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            placeholder="e.g. AI & Machine Learning Pipeline"
            required
          />
          <Textarea
            label="Description"
            value={catDesc}
            onChange={(e) => setCatDesc(e.target.value)}
            placeholder="Purpose and scope of documents in this category..."
            rows={2}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddCatOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={createCategoryMutation.isPending}
              disabled={!catName.trim()}
            >
              Create Category
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Add Document Dialog */}
      <Dialog
        isOpen={isAddDocOpen}
        onClose={() => setIsAddDocOpen(false)}
        title="Create New Document"
        description="Add a new Markdown document or blueprint specification."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createDocMutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Category *</label>
            <select
              value={targetCategoryId}
              onChange={(e) => setTargetCategoryId(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Document Title *"
            value={docTitle}
            onChange={(e) => {
              setDocTitle(e.target.value);
              setDocFileName(
                `${e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '_')}.md`
              );
            }}
            placeholder="e.g. Rate Limiting Specification"
            required
          />

          <Input
            label="File Name"
            value={docFileName}
            onChange={(e) => setDocFileName(e.target.value)}
            placeholder="RATE_LIMITING.md"
          />

          <Textarea
            label="Brief Description"
            value={docDesc}
            onChange={(e) => setDocDesc(e.target.value)}
            placeholder="Purpose of this document..."
            rows={2}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddDocOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={createDocMutation.isPending}
              disabled={!docTitle.trim()}
            >
              Create & Open Editor
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Import Modal */}
      {isImportOpen && (
        <ImportModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          projects={[project]}
          defaultProjectId={projectId}
        />
      )}
    </div>
  );
}
