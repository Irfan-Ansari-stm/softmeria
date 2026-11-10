'use client';

import React, { useState } from 'react';
import { DesignSystemView } from '../../../features/design/DesignSystemView';
import { WorkspaceProjectSelector } from '../../../components/layout/WorkspaceProjectSelector';

const DEFAULT_PROJECT_ID = '3ed8c194-f44d-475a-bde1-67dcc210d955'; // FinTech Payment Orchestrator

export default function DesignSystemPage() {
  const [projectId, setProjectId] = useState<string>(DEFAULT_PROJECT_ID);

  return (
    <div className="w-full p-6 lg:p-8 space-y-6">
      <WorkspaceProjectSelector
        title="Design System & UI Tokens"
        subtitle="Manage 20 token categories, color palettes, semantic roles, typography scales, themes, and component specifications"
        selectedProjectId={projectId}
        onSelectProject={setProjectId}
      />
      <DesignSystemView projectId={projectId} />
    </div>
  );
}
