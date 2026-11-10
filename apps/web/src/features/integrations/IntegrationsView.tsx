'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardHeader, CardContent, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Blocks,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Github,
  MessageSquare,
  Activity,
  Bug,
  FolderGit2,
  AlertCircle,
  Settings2,
  Unplug,
  Zap
} from 'lucide-react';
import { IntegrationConnectorItem } from '@devblueprint/types';

export function IntegrationsView() {
  const queryClient = useQueryClient();
  const [selectedConnector, setSelectedConnector] = useState<IntegrationConnectorItem | null>(null);
  const [configUrl, setConfigUrl] = useState('');
  const [configToken, setConfigToken] = useState('');
  const [testResult, setTestResult] = useState<{ provider: string; status: string; latencyMs: number } | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; success: boolean } | null>(null);

  // Fetch Integrations from API
  const { data: connectors = [], isLoading, refetch } = useQuery<IntegrationConnectorItem[]>({
    queryKey: ['workspace-integrations'],
    queryFn: async () => {
      const res = await api.get<IntegrationConnectorItem[]>('/integrations');
      return res.data || [];
    }
  });

  // Test Connection Mutation
  const testMutation = useMutation({
    mutationFn: async (provider: string) => {
      const res = await api.post<any>(`/integrations/${provider}/test`, {});
      return res.data;
    },
    onSuccess: (data: any, provider: string) => {
      setTestResult({
        provider,
        status: data.status,
        latencyMs: data.latencyMs
      });
      setTimeout(() => setTestResult(null), 5000);
    },
    onError: (err: any) => {
      setFeedback({ text: err.message || 'Connection test failed', success: false });
      setTimeout(() => setFeedback(null), 4000);
    }
  });

  // Sync Mutation
  const syncMutation = useMutation({
    mutationFn: async (provider: string) => {
      const res = await api.post<any>(`/integrations/${provider}/sync`, {});
      return res.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['workspace-integrations'] });
      setFeedback({ text: `Sync completed: ${data.message || 'Telemetry up to date'}`, success: true });
      setTimeout(() => setFeedback(null), 4000);
    },
    onError: (err: any) => {
      setFeedback({ text: err.message || 'Sync failed', success: false });
      setTimeout(() => setFeedback(null), 4000);
    }
  });

  // Connect Mutation
  const connectMutation = useMutation({
    mutationFn: async ({ provider, config }: { provider: string; config: any }) => {
      const res = await api.post<any>(`/integrations/${provider}/connect`, config);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-integrations'] });
      setSelectedConnector(null);
      setConfigUrl('');
      setConfigToken('');
      setFeedback({ text: 'Integration connected and verified successfully', success: true });
      setTimeout(() => setFeedback(null), 4000);
    },
    onError: (err: any) => {
      setFeedback({ text: err.message || 'Failed to connect integration', success: false });
    }
  });

  // Disconnect Mutation
  const disconnectMutation = useMutation({
    mutationFn: async (provider: string) => {
      const res = await api.post<any>(`/integrations/${provider}/disconnect`, {});
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-integrations'] });
      setFeedback({ text: 'Integration disconnected', success: true });
      setTimeout(() => setFeedback(null), 4000);
    }
  });

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'GITHUB':
        return <Github className="h-5 w-5 text-foreground" />;
      case 'SLACK':
        return <MessageSquare className="h-5 w-5 text-emerald-500" />;
      case 'DATADOG':
        return <Activity className="h-5 w-5 text-purple-500" />;
      case 'SENTRY':
        return <Bug className="h-5 w-5 text-rose-500" />;
      case 'JIRA':
        return <FolderGit2 className="h-5 w-5 text-blue-500" />;
      default:
        return <Blocks className="h-5 w-5 text-primary" />;
    }
  };

  const openConfigModal = (conn: IntegrationConnectorItem) => {
    setSelectedConnector(conn);
    setConfigUrl(conn.config?.url || conn.config?.webhookUrl || '');
    setConfigToken('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 lg:p-8 space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Blocks className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Integrations & Connectors</h1>
            <p className="text-xs text-foreground-muted">
              Connect external developer tools, CI/CD pipelines, observability monitors, and alert channels.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="text-xs gap-1.5 h-8 self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
            feedback.success
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-600'
          }`}
        >
          {feedback.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Connectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connectors.map((conn) => {
          const isTesting = testMutation.isPending && (testMutation.variables as string) === conn.provider;
          const isSyncing = syncMutation.isPending && (syncMutation.variables as string) === conn.provider;
          const testForThis = testResult?.provider === conn.provider ? testResult : null;

          return (
            <Card key={conn.provider} className="p-5 flex flex-col justify-between space-y-4 shadow-xs">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-background-secondary border border-border flex items-center justify-center shrink-0">
                      {getProviderIcon(conn.provider)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{conn.name}</h3>
                      <span className="text-[10px] font-mono text-foreground-muted block">
                        Provider: {conn.provider}
                      </span>
                    </div>
                  </div>

                  <Badge
                    className={`text-[10px] shrink-0 ${
                      conn.isConnected
                        ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                        : 'bg-background-secondary text-foreground-muted border border-border'
                    }`}
                  >
                    {conn.isConnected ? 'Connected' : 'Available'}
                  </Badge>
                </div>

                <p className="text-xs text-foreground-secondary leading-relaxed">
                  {conn.description}
                </p>

                {/* Telemetry / Sync Status Info */}
                <div className="p-2.5 rounded-lg bg-background-secondary border border-border text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-muted">Last Synchronized:</span>
                    <span className="font-medium text-foreground">
                      {conn.lastSyncAt ? new Date(conn.lastSyncAt).toLocaleTimeString() : 'Never'}
                    </span>
                  </div>
                  {conn.isConnected && (
                    <div className="flex items-center justify-between">
                      <span className="text-foreground-muted">Health Status:</span>
                      <span className="text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Operational
                      </span>
                    </div>
                  )}
                </div>

                {/* Test Result Toast Inline */}
                {testForThis && (
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[11px] flex items-center justify-between">
                    <span>Latency Check: healthy</span>
                    <span className="font-mono font-bold">{testForThis.latencyMs}ms</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                {conn.isConnected ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testMutation.mutate(conn.provider)}
                        isLoading={isTesting}
                        className="text-xs h-7 px-2.5 gap-1"
                        title="Ping connector endpoint and measure latency"
                      >
                        <Zap className="h-3 w-3 text-amber-500" />
                        <span>Test</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => syncMutation.mutate(conn.provider)}
                        isLoading={isSyncing}
                        className="text-xs h-7 px-2.5 gap-1"
                        title="Force synchronization"
                      >
                        <RefreshCw className="h-3 w-3 text-primary" />
                        <span>Sync</span>
                      </Button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openConfigModal(conn)}
                        className="text-xs h-7 px-2 text-foreground-muted hover:text-foreground"
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => disconnectMutation.mutate(conn.provider)}
                        className="text-xs h-7 px-2 text-destructive hover:bg-destructive/10"
                        title="Disconnect Integration"
                      >
                        <Unplug className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => openConfigModal(conn)}
                    className="text-xs h-7 w-full gap-1.5"
                  >
                    <Zap className="h-3 w-3" />
                    <span>Connect {conn.name}</span>
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Configuration Modal */}
      {selectedConnector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md bg-card border-border shadow-xl">
            <CardHeader className="p-5 border-b border-border">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                {getProviderIcon(selectedConnector.provider)}
                <span>Configure {selectedConnector.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <p className="text-xs text-foreground-muted">
                Supply your enterprise endpoint or webhook credentials to authenticate this connector.
              </p>

              <Input
                label="Endpoint / Webhook URL"
                value={configUrl}
                onChange={(e) => setConfigUrl(e.target.value)}
                placeholder="https://api.github.com or https://hooks.slack.com/..."
              />

              <Input
                label="Access Token / Secret Key"
                type="password"
                value={configToken}
                onChange={(e) => setConfigToken(e.target.value)}
                placeholder="Bearer token or API token"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedConnector(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    connectMutation.mutate({
                      provider: selectedConnector.provider,
                      config: { url: configUrl, token: configToken }
                    })
                  }
                  isLoading={connectMutation.isPending}
                  className="text-xs"
                >
                  Save & Authorize
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
