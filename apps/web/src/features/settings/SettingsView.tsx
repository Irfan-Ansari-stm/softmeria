'use client';

import React, { useState } from 'react';
import { Settings, Shield, User, Lock, Sun, Moon, Palette, CheckCircle2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/useAuthStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';

export function SettingsView() {
  const { user, currentWorkspace, setCurrentWorkspace } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  // Profile form
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; success: boolean } | null>(
    null
  );

  // Workspace form
  const [wsName, setWsName] = useState(currentWorkspace?.name || '');
  const [wsMessage, setWsMessage] = useState<string | null>(null);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put('/auth/profile', { name: profileName });
      return res.data;
    },
    onSuccess: () => {
      setProfileMessage('Profile updated successfully');
      setTimeout(() => setProfileMessage(null), 3000);
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return res.data;
    },
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setPasswordMessage({ text: 'Password changed successfully', success: true });
      setTimeout(() => setPasswordMessage(null), 4000);
    },
    onError: (err: any) => {
      setPasswordMessage({ text: err.message || 'Failed to change password', success: false });
    }
  });

  const updateWorkspaceMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put<any>(`/workspaces/${currentWorkspace!.id}`, {
        name: wsName
      });
      return res.data;
    },
    onSuccess: (data: any) => {
      setCurrentWorkspace({
        ...currentWorkspace!,
        name: data.name
      });
      setWsMessage('Workspace updated');
      setTimeout(() => setWsMessage(null), 3000);
    }
  });

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <Settings className="h-6 w-6 text-primary" />
          <span>Workspace & Account Settings</span>
        </h1>
        <p className="text-xs text-foreground-muted mt-1">
          Configure appearance, identity parameters, workspace branding, and security credentials.
        </p>
      </div>

      {/* Appearance Section */}
      <Card>
        <CardHeader className="p-5 pb-3 border-b border-border">
          <CardTitle className="text-sm flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <span>Appearance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div>
            <p className="text-xs text-foreground-secondary">
              Select your interface theme. DevBlueprint defaults to Light Mode, with instant toggle to Dark Mode.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Light Mode Option */}
            <div
              onClick={() => setTheme('light', currentWorkspace?.id)}
              className={`cursor-pointer rounded-xl border p-4 transition-all relative select-none flex flex-col justify-between ${
                theme === 'light'
                  ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-sm'
                  : 'border-border bg-background hover:bg-background-secondary'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 font-medium text-sm text-foreground">
                    <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                      <Sun className="h-4 w-4" />
                    </div>
                    <span>Light Mode</span>
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono font-normal">
                      Default
                    </span>
                  </div>
                  {theme === 'light' && (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-xs text-foreground-muted leading-relaxed">
                  Enterprise clean aesthetic with high contrast `#FFFFFF` background and `#0F172A` text.
                </p>
              </div>

              {/* Miniature Light Preview */}
              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-2.5 space-y-2 shadow-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-slate-300" />
                  <div className="h-2 w-12 rounded bg-slate-200" />
                </div>
                <div className="h-1.5 w-full rounded bg-slate-100" />
                <div className="h-1.5 w-3/4 rounded bg-blue-100" />
              </div>
            </div>

            {/* Dark Mode Option */}
            <div
              onClick={() => setTheme('dark', currentWorkspace?.id)}
              className={`cursor-pointer rounded-xl border p-4 transition-all relative select-none flex flex-col justify-between ${
                theme === 'dark'
                  ? 'border-primary ring-2 ring-primary/20 bg-primary/10 shadow-sm'
                  : 'border-border bg-background hover:bg-background-secondary'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 font-medium text-sm text-foreground">
                    <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                      <Moon className="h-4 w-4" />
                    </div>
                    <span>Dark Mode</span>
                  </div>
                  {theme === 'dark' && (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-xs text-foreground-muted leading-relaxed">
                  Sophisticated deep dark palette with `#0B1120` canvas and `#60A5FA` accents.
                </p>
              </div>

              {/* Miniature Dark Preview */}
              <div className="mt-4 rounded-lg border border-slate-700 bg-[#0B1120] p-2.5 space-y-2 shadow-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-slate-600" />
                  <div className="h-2 w-12 rounded bg-slate-700" />
                </div>
                <div className="h-1.5 w-full rounded bg-slate-800" />
                <div className="h-1.5 w-3/4 rounded bg-blue-950" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Profile */}
      <Card>
        <CardHeader className="p-5 pb-3 border-b border-border">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <span>Developer Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          {profileMessage && (
            <div className="p-3 rounded-lg bg-success/15 border border-success/30 text-xs text-success font-medium">
              {profileMessage}
            </div>
          )}
          <Input
            label="Full Name"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
          />
          <Input label="Email Address" value={user?.email || ''} disabled />
          <Button
            size="sm"
            variant="primary"
            onClick={() => updateProfileMutation.mutate()}
            isLoading={updateProfileMutation.isPending}
          >
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* Workspace Settings */}
      {currentWorkspace && (
        <Card>
          <CardHeader className="p-5 pb-3 border-b border-border">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Workspace Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {wsMessage && (
              <div className="p-3 rounded-lg bg-success/15 border border-success/30 text-xs text-success font-medium">
                {wsMessage}
              </div>
            )}
            <Input
              label="Workspace Name"
              value={wsName}
              onChange={(e) => setWsName(e.target.value)}
            />
            <Input label="Workspace Slug" value={currentWorkspace.slug} disabled />
            <Button
              size="sm"
              variant="primary"
              onClick={() => updateWorkspaceMutation.mutate()}
              isLoading={updateWorkspaceMutation.isPending}
            >
              Update Workspace
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Security & Password */}
      <Card>
        <CardHeader className="p-5 pb-3 border-b border-border">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            <span>Security & Authentication</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          {passwordMessage && (
            <div
              className={`p-3 rounded-lg text-xs font-medium ${
                passwordMessage.success
                  ? 'bg-success/15 border border-success/30 text-success'
                  : 'bg-destructive/15 border border-destructive/30 text-destructive'
              }`}
            >
              {passwordMessage.text}
            </div>
          )}
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
          <Button
            size="sm"
            variant="primary"
            onClick={() => changePasswordMutation.mutate()}
            isLoading={changePasswordMutation.isPending}
            disabled={!currentPassword || !newPassword}
          >
            Change Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
