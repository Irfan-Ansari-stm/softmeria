'use client';

import React, { useState } from 'react';
import { ProductBacklogView } from '../../../features/backlog/ProductBacklogView';
import { WorkspaceProjectSelector } from '../../../components/layout/WorkspaceProjectSelector';

const DEFAULT_PROJECT_ID = '3ed8c194-f44d-475a-bde1-67dcc210d955'; // FinTech Payment Orchestrator

export default function BacklogPage() {
  const [projectId, setProjectId] = useState<string>(DEFAULT_PROJECT_ID);

  return (
    <div className="w-full p-6 lg:p-8 space-y-6">
      <WorkspaceProjectSelector
        title="Product Backlog"
        subtitle="Agile sprint planning, epic hierarchies, story grooming, and points estimation"
        selectedProjectId={projectId}
        onSelectProject={setProjectId}
      />
      <ProductBacklogView projectId={projectId} />
    </div>
  );
}
