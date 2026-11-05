'use client';

import React, { useState } from 'react';
import { Settings, Shield, User, Bell, CheckCircle, Lock } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/useAuthStore';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';

export function SettingsView() {
  const { user, currentWorkspace, setCurrentWorkspace } = useAuthStore();

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
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
          <Settings className="h-6 w-6 text-indigo-500" />
          <span>Workspace & Account Settings</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Configure identity parameters, workspace branding, and security credentials.
        </p>
      </div>

      {/* User Profile */}
      <Card>
        <CardHeader className="p-5 pb-3 border-b border-zinc-800">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="h-4 w-4 text-indigo-400" />
            <span>Developer Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          {profileMessage && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300">
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
          <CardHeader className="p-5 pb-3 border-b border-zinc-800">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-400" />
              <span>Workspace Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {wsMessage && (
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300">
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
        <CardHeader className="p-5 pb-3 border-b border-zinc-800">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lock className="h-4 w-4 text-indigo-400" />
            <span>Security & Authentication</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          {passwordMessage && (
            <div
              className={`p-3 rounded-lg text-xs ${
                passwordMessage.success
                  ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/60 border border-rose-800 text-rose-300'
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
