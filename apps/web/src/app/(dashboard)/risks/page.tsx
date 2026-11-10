'use client';

import React, { useState } from 'react';
import { RisksView } from '../../../features/risks/RisksView';
import { WorkspaceProjectSelector } from '../../../components/layout/WorkspaceProjectSelector';

const DEFAULT_PROJECT_ID = '3ed8c194-f44d-475a-bde1-67dcc210d955';

export default function RisksPage() {
  const [projectId, setProjectId] = useState<string>(DEFAULT_PROJECT_ID);

  return (
    <div className="w-full p-6 lg:p-8 space-y-6">
      <WorkspaceProjectSelector
        title="Risk & Dependency Management"
        subtitle="3x3 risk matrix, probability and impact severity heatmaps, and mitigation plans"
        selectedProjectId={projectId}
        onSelectProject={setProjectId}
      />
      <RisksView projectId={projectId} />
    </div>
  );
}
