'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { MarkdownWorkspace } from '../../../../../../features/markdown-editor/MarkdownWorkspace';

export default function DocumentEditorPage() {
  const params = useParams();
  const docId = params?.docId as string;

  if (!docId) return null;

  return <MarkdownWorkspace documentId={docId} />;
}

