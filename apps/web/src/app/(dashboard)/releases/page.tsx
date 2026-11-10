'use client';

import React, { useState } from 'react';
import { ReleasesView } from '../../../features/releases/ReleasesView';
import { WorkspaceProjectSelector } from '../../../components/layout/WorkspaceProjectSelector';

const DEFAULT_PROJECT_ID = '3ed8c194-f44d-475a-bde1-67dcc210d955';

export default function ReleasesPage() {
  const [projectId, setProjectId] = useState<string>(DEFAULT_PROJECT_ID);

  return (
    <div className="w-full p-6 lg:p-8 space-y-6">
      <WorkspaceProjectSelector
        title="Releases & Deployments"
        subtitle="Version release gates, staging & production deployment logs, and rollback governance"
        selectedProjectId={projectId}
        onSelectProject={setProjectId}
      />
      <ReleasesView projectId={projectId} />
    </div>
  );
}
