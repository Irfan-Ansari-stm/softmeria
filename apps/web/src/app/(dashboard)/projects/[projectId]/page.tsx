'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ProjectDetailView } from '../../../../features/projects/ProjectDetailView';

export default function ProjectPage() {
  const params = useParams();
  const projectId = params?.projectId as string;

  if (!projectId) return null;

  return <ProjectDetailView projectId={projectId} />;
}

