'use client';

import React, { useState } from 'react';
import { SprintsView } from '../../../features/sprints/SprintsView';
import { WorkspaceProjectSelector } from '../../../components/layout/WorkspaceProjectSelector';

const DEFAULT_PROJECT_ID = '3ed8c194-f44d-475a-bde1-67dcc210d955';

export default function SprintsPage() {
  const [projectId, setProjectId] = useState<string>(DEFAULT_PROJECT_ID);

  return (
    <div className="w-full p-6 lg:p-8 space-y-6">
      <WorkspaceProjectSelector
        title="Sprints"
        subtitle="Sprint cycles, commitment velocity, burndown charts, and backlog planning"
        selectedProjectId={projectId}
        onSelectProject={setProjectId}
      />
      <SprintsView projectId={projectId} />
    </div>
  );
}
