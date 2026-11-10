'use client';

import React, { useState } from 'react';
import { RoadmapView } from '../../../features/roadmap/RoadmapView';
import { WorkspaceProjectSelector } from '../../../components/layout/WorkspaceProjectSelector';

const DEFAULT_PROJECT_ID = '3ed8c194-f44d-475a-bde1-67dcc210d955';

export default function RoadmapsPage() {
  const [projectId, setProjectId] = useState<string>(DEFAULT_PROJECT_ID);

  return (
    <div className="w-full p-6 lg:p-8 space-y-6">
      <WorkspaceProjectSelector
        title="Roadmaps & Strategic Milestones"
        subtitle="2026 quarterly milestones, delivery status, target dates, and release horizons"
        selectedProjectId={projectId}
        onSelectProject={setProjectId}
      />
      <RoadmapView projectId={projectId} />
    </div>
  );
}
