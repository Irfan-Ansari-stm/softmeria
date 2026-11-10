'use client';

import React, { useState } from 'react';
import { KanbanBoardView } from '../../../features/board/KanbanBoardView';
import { WorkspaceProjectSelector } from '../../../components/layout/WorkspaceProjectSelector';

const DEFAULT_PROJECT_ID = '3ed8c194-f44d-475a-bde1-67dcc210d955'; // FinTech Payment Orchestrator

export default function BoardsPage() {
  const [projectId, setProjectId] = useState<string>(DEFAULT_PROJECT_ID);

  return (
    <div className="w-full p-6 lg:p-8 space-y-6">
      <WorkspaceProjectSelector
        title="My Boards"
        subtitle="Agile Kanban boards, WIP limits, task movement, and sprint execution"
        selectedProjectId={projectId}
        onSelectProject={setProjectId}
      />
      <KanbanBoardView projectId={projectId} />
    </div>
  );
}
