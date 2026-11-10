'use client';

import React, { useState } from 'react';
import { BugsView } from '../../../features/bugs/BugsView';
import { WorkspaceProjectSelector } from '../../../components/layout/WorkspaceProjectSelector';

const DEFAULT_PROJECT_ID = '3ed8c194-f44d-475a-bde1-67dcc210d955';

export default function BugsPage() {
  const [projectId, setProjectId] = useState<string>(DEFAULT_PROJECT_ID);

  return (
    <div className="w-full p-6 lg:p-8 space-y-6">
      <WorkspaceProjectSelector
        title="Issues & Bugs"
        subtitle="Defect tracking, severity triage, reproduction steps, and root cause analysis"
        selectedProjectId={projectId}
        onSelectProject={setProjectId}
      />
      <BugsView projectId={projectId} />
    </div>
  );
}
