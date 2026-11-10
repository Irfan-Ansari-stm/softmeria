'use client';

import React, { useState } from 'react';
import { TimeTrackingView } from '../../../features/time/TimeTrackingView';
import { WorkspaceProjectSelector } from '../../../components/layout/WorkspaceProjectSelector';

const DEFAULT_PROJECT_ID = '3ed8c194-f44d-475a-bde1-67dcc210d955';

export default function MyTimePage() {
  const [projectId, setProjectId] = useState<string>(DEFAULT_PROJECT_ID);

  return (
    <div className="w-full p-6 lg:p-8 space-y-6">
      <WorkspaceProjectSelector
        title="My Time & Worklogs"
        subtitle="Log task hours, live stopwatch timer, billable ratio, and timesheet approvals"
        selectedProjectId={projectId}
        onSelectProject={setProjectId}
      />
      <TimeTrackingView projectId={projectId} />
    </div>
  );
}
