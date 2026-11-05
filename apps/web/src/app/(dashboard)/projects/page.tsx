'use client';

import React, { Suspense } from 'react';
import { ProjectsListView } from '../../../features/projects/ProjectsListView';

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-zinc-500">Loading projects...</div>}>
      <ProjectsListView />
    </Suspense>
  );
}

