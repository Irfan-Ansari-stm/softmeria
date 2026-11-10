'use client';

import React, { useState } from 'react';
import { ProjectReportsView } from '../../../features/reports/ProjectReportsView';
import { WorkspaceProjectSelector } from '../../../components/layout/WorkspaceProjectSelector';

const DEFAULT_PROJECT_ID = '3ed8c194-f44d-475a-bde1-67dcc210d955';

export default function ReportsPage() {
  const [projectId, setProjectId] = useState<string>(DEFAULT_PROJECT_ID);

  return (
    <div className="w-full p-6 lg:p-8 space-y-6">
      <WorkspaceProjectSelector
        title="Reports & Analytics"
        subtitle="Sprint burn-up, cycle time, defect resolution rate, and CSV audit exports"
        selectedProjectId={projectId}
        onSelectProject={setProjectId}
      />
      <ProjectReportsView projectId={projectId} />
    </div>
  );
}
