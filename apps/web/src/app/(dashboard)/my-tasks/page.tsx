'use client';

import React, { useState } from 'react';
import { TasksTableView } from '../../../features/tasks/TasksTableView';
import { WorkspaceProjectSelector } from '../../../components/layout/WorkspaceProjectSelector';

const DEFAULT_PROJECT_ID = '3ed8c194-f44d-475a-bde1-67dcc210d955';

export default function MyTasksPage() {
  const [projectId, setProjectId] = useState<string>(DEFAULT_PROJECT_ID);

  return (
    <div className="w-full p-6 lg:p-8 space-y-6">
      <WorkspaceProjectSelector
        title="My Tasks"
        subtitle="Assigned tasks, backlog items, story points, and sprint status"
        selectedProjectId={projectId}
        onSelectProject={setProjectId}
      />
      <TasksTableView projectId={projectId} />
    </div>
  );
}
