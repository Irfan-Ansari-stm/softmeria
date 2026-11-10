'use client';

import React, { useState } from 'react';
import { DevelopmentView } from '../../../features/development/DevelopmentView';
import { WorkspaceProjectSelector } from '../../../components/layout/WorkspaceProjectSelector';

const DEFAULT_PROJECT_ID = '3ed8c194-f44d-475a-bde1-67dcc210d955'; // FinTech Payment Orchestrator

export default function DevelopmentPage() {
  const [projectId, setProjectId] = useState<string>(DEFAULT_PROJECT_ID);

  return (
    <div className="w-full p-6 lg:p-8 space-y-6">
      <WorkspaceProjectSelector
        title="Development & Repositories"
        subtitle="Connected Git repositories, live webhooks, commit activity, pull requests, and CI/CD pipelines"
        selectedProjectId={projectId}
        onSelectProject={setProjectId}
      />
      <DevelopmentView projectId={projectId} />
    </div>
  );
}
