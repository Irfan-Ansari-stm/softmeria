'use client';

import React, { useState } from 'react';
import { TestingView } from '../../../features/testing/TestingView';
import { WorkspaceProjectSelector } from '../../../components/layout/WorkspaceProjectSelector';

const DEFAULT_PROJECT_ID = '3ed8c194-f44d-475a-bde1-67dcc210d955';

export default function TestingPage() {
  const [projectId, setProjectId] = useState<string>(DEFAULT_PROJECT_ID);

  return (
    <div className="w-full p-6 lg:p-8 space-y-6">
      <WorkspaceProjectSelector
        title="Testing & QA Management"
        subtitle="Test plans, test suites, test cases, automated runs, and quality gates"
        selectedProjectId={projectId}
        onSelectProject={setProjectId}
      />
      <TestingView projectId={projectId} />
    </div>
  );
}
