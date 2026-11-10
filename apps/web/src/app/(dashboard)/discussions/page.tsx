'use client';

import React, { useState } from 'react';
import { DiscussionsView } from '../../../features/discussions/DiscussionsView';
import { WorkspaceProjectSelector } from '../../../components/layout/WorkspaceProjectSelector';

export default function DiscussionsPage() {
  const [projectId, setProjectId] = useState<string>('ALL');

  return (
    <div className="w-full p-6 lg:p-8 space-y-6">
      <WorkspaceProjectSelector
        title="Discussions & RFC Decision Records"
        subtitle="Architecture proposals, engineering consensus, pinned decisions, and threaded feedback"
        selectedProjectId={projectId}
        onSelectProject={setProjectId}
      />
      <DiscussionsView projectId={projectId} />
    </div>
  );
}
