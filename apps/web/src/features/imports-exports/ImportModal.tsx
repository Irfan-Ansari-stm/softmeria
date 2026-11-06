'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, FileText, Archive, CheckCircle, AlertCircle } from 'lucide-react';
import { Dialog } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { api } from '../../lib/api';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects?: any[];
  defaultProjectId?: string;
  defaultCategoryId?: string;
}

export function ImportModal({
  isOpen,
  onClose,
  projects = [],
  defaultProjectId,
  defaultCategoryId
}: ImportModalProps) {
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<'zip' | 'files'>('zip');
  const [selectedProjectId, setSelectedProjectId] = useState(
    defaultProjectId || projects[0]?.id || ''
  );
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
    setMessage(null);
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      setMessage({ text: 'Please select a destination project', type: 'error' });
      return;
    }
    if (!selectedFiles || selectedFiles.length === 0) {
      setMessage({ text: 'Please select files to upload', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('projectId', selectedProjectId);

      if (mode === 'zip') {
        formData.append('zipFile', selectedFiles[0]);
        const res = await api.post<any>('/import/zip', formData);
        setMessage({
          text: `Success! ${res.data?.importedCount || 'Documents'} imported from ZIP archive.`,
          type: 'success'
        });
      } else {
        // Find first category of selected project if not provided
        let catId = defaultCategoryId;
        if (!catId) {
          const catRes = await api.get<any[]>(`/projects/${selectedProjectId}/categories`);
          catId = catRes.data?.[0]?.id;
        }
        if (!catId) {
          throw new Error('Project has no categories. Please initialize categories first.');
        }

        formData.append('categoryId', catId);
        for (let i = 0; i < selectedFiles.length; i++) {
          formData.append('files', selectedFiles[i]);
        }
        const res = await api.post<any>('/import/files', formData);
        setMessage({
          text: `Success! ${res.data?.length || 'Documents'} Markdown files imported.`,
          type: 'success'
        });
      }

      queryClient.invalidateQueries({ queryKey: ['categories-tree', selectedProjectId] });
      queryClient.invalidateQueries({ queryKey: ['project', selectedProjectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (err: any) {
      setMessage({ text: err.message || 'Import failed', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Import Documentation"
      description="Import existing Markdown files or a complete folder tree via ZIP archive."
      maxWidth="md"
    >
      <form onSubmit={handleImport} className="space-y-4">
        {/* Mode Selector */}
        <div className="flex rounded-lg border border-border bg-background p-1 shadow-xs">
          <button
            type="button"
            onClick={() => {
              setMode('zip');
              setSelectedFiles(null);
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'zip'
                ? 'bg-secondary text-foreground font-semibold shadow-xs'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            <Archive className="h-3.5 w-3.5" />
            <span>ZIP Archive (Folder Tree)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('files');
              setSelectedFiles(null);
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'files'
                ? 'bg-secondary text-foreground font-semibold shadow-xs'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Markdown Files (.md)</span>
          </button>
        </div>

        {/* Project Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground-secondary">
            Target Project Workspace
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.projectType})
              </option>
            ))}
          </select>
        </div>

        {/* File Dropzone */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground-secondary">Select File(s)</label>
          <div className="p-6 border-2 border-dashed border-border rounded-xl text-center hover:border-primary/50 transition-colors bg-background-secondary/50">
            <Upload className="h-8 w-8 text-foreground-muted mx-auto mb-2" />
            <input
              type="file"
              id="import-file-input"
              accept={mode === 'zip' ? '.zip' : '.md,.markdown,.mdx'}
              multiple={mode === 'files'}
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="import-file-input"
              className="cursor-pointer text-xs text-primary hover:underline font-medium block"
            >
              Click to select {mode === 'zip' ? 'a .zip archive' : 'one or more .md files'}
            </label>
            <p className="text-[11px] text-foreground-muted mt-1">
              {selectedFiles && selectedFiles.length > 0
                ? `${selectedFiles.length} file(s) chosen (${selectedFiles[0].name})`
                : 'Drag and drop or browse from filesystem'}
            </p>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-success/15 border border-success/30 text-success font-medium'
                : 'bg-destructive/15 border border-destructive/30 text-destructive font-medium'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            disabled={!selectedFiles || selectedFiles.length === 0}
          >
            Start Import
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
