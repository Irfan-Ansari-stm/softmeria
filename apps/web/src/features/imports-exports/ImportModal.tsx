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
  projects: any[];
  defaultProjectId?: string;
  defaultCategoryId?: string;
}

export function ImportModal({
  isOpen,
  onClose,
  projects,
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
        <div className="flex rounded-lg border border-zinc-800 bg-zinc-950 p-1">
          <button
            type="button"
            onClick={() => {
              setMode('zip');
              setSelectedFiles(null);
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'zip'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
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
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Markdown Files (.md)</span>
          </button>
        </div>

        {/* Project Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300">
            Target Project Workspace
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full h-9 px-3 rounded-md border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
          <label className="text-xs font-medium text-zinc-300">Select File(s)</label>
          <div className="p-6 border-2 border-dashed border-zinc-800 rounded-lg text-center hover:border-zinc-700 transition-colors bg-zinc-950/40">
            <Upload className="h-8 w-8 text-zinc-500 mx-auto mb-2" />
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
              className="cursor-pointer text-xs text-indigo-400 hover:text-indigo-300 font-medium block"
            >
              Click to select {mode === 'zip' ? 'a .zip archive' : 'one or more .md files'}
            </label>
            <p className="text-[11px] text-zinc-500 mt-1">
              {selectedFiles && selectedFiles.length > 0
                ? `${selectedFiles.length} file(s) selected: ${selectedFiles[0].name}`
                : mode === 'zip'
                ? 'ZIP folder structure will be mapped to documentation categories'
                : 'Supported: .md, .markdown, .mdx'}
            </p>
          </div>
        </div>

        {/* Result Message */}
        {message && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                : 'bg-rose-950/60 border border-rose-800 text-rose-300'
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

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
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

