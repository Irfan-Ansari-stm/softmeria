'use client';

import React, { useState } from 'react';
import { FilesView } from '../../../features/files/FilesView';
import { WorkspaceProjectSelector } from '../../../components/layout/WorkspaceProjectSelector';

export default function FilesPage() {
  const [projectId, setProjectId] = useState<string>('ALL');

  return (
    <div className="w-full p-6 lg:p-8 space-y-6">
      <WorkspaceProjectSelector
        title="Files & Asset Storage"
        subtitle="Enterprise document repository, architecture diagrams, data models, and cross-module attachments"
        selectedProjectId={projectId}
        onSelectProject={setProjectId}
      />
      <FilesView projectId={projectId === 'ALL' ? undefined : projectId} />
    </div>
  );
}
