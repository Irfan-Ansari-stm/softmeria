'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  User,
  Lock,
  Sun,
  Moon,
  Laptop,
  Palette,
  CheckCircle2,
  Bell,
  Building,
  KeyRound,
  Smartphone,
  Trash2,
  RefreshCw,
  Globe,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/useAuthStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

type SettingsTab = 'profile' | 'appearance' | 'workspace' | 'notifications' | 'security';

export function SettingsView() {
  const queryClient = useQueryClient();
  const { user, currentWorkspace, setCurrentWorkspace, setUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // --- Profile State ---
  const [profileName, setProfileName] = useState(user?.name || '');
  const [jobTitle, setJobTitle] = useState((user as any)?.jobTitle || '');
  const [department, setDepartment] = useState((user as any)?.department || '');
  const [bio, setBio] = useState((user as any)?.bio || '');
  const [timezone, setTimezone] = useState((user as any)?.timezone || 'UTC');
  const [language, setLanguage] = useState((user as any)?.preferredLanguage || 'en');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>((user as any)?.twoFactorEnabled || false);
  const [profileMessage, setProfileMessage] = useState<{ text: string; success: boolean } | null>(null);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setJobTitle((user as any).jobTitle || '');
      setDepartment((user as any).department || '');
      setBio((user as any).bio || '');
      setTimezone((user as any).timezone || 'UTC');
      setLanguage((user as any).preferredLanguage || 'en');
      setTwoFactorEnabled(!!(user as any).twoFactorEnabled);
    }
  }, [user]);

  // --- Workspace State ---
  const [wsName, setWsName] = useState(currentWorkspace?.name || '');
  const [logo, setLogo] = useState((currentWorkspace?.settings as any)?.logo || '');
  const [companyName, setCompanyName] = useState((currentWorkspace?.settings as any)?.companyName || '');
  const [website, setWebsite] = useState((currentWorkspace?.settings as any)?.website || '');
  const [industry, setIndustry] = useState((currentWorkspace?.settings as any)?.industry || 'Technology');
  const [defaultVisibility, setDefaultVisibility] = useState((currentWorkspace?.settings as any)?.defaultVisibility || 'PRIVATE');
  const [wsMessage, setWsMessage] = useState<{ text: string; success: boolean } | null>(null);

  useEffect(() => {
    if (currentWorkspace) {
      setWsName(currentWorkspace.name || '');
      const s = currentWorkspace.settings as any;
      if (s) {
        setLogo(s.logo || '');
        setCompanyName(s.companyName || '');
        setWebsite(s.website || '');
        setIndustry(s.industry || 'Technology');
        setDefaultVisibility(s.defaultVisibility || 'PRIVATE');
      }
    }
  }, [currentWorkspace]);

  // --- Notifications State ---
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [inAppNotifs, setInAppNotifs] = useState(true);
  const [projUpdates, setProjUpdates] = useState(true);
  const [taskAssignments, setTaskAssignments] = useState(true);
  const [bugAlerts, setBugAlerts] = useState(true);
  const [relApprovals, setRelApprovals] = useState(true);
  const [secAlerts, setSecAlerts] = useState(true);
  const [notifMessage, setNotifMessage] = useState<{ text: string; success: boolean } | null>(null);

  useEffect(() => {
    const s = currentWorkspace?.settings as any;
    if (s) {
      if (s.emailNotifications !== undefined) setEmailNotifs(s.emailNotifications);
      if (s.inAppNotifications !== undefined) setInAppNotifs(s.inAppNotifications);
      if (s.projectUpdates !== undefined) setProjUpdates(s.projectUpdates);
      if (s.taskAssignments !== undefined) setTaskAssignments(s.taskAssignments);
      if (s.bugAlerts !== undefined) setBugAlerts(s.bugAlerts);
      if (s.releaseApprovals !== undefined) setRelApprovals(s.releaseApprovals);
      if (s.securityAlerts !== undefined) setSecAlerts(s.securityAlerts);
    }
  }, [currentWorkspace]);

  // --- Password State ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; success: boolean } | null>(null);

  // --- Active Sessions Query ---
  const { data: sessions = [], refetch: refetchSessions } = useQuery<any[]>({
    queryKey: ['user-sessions'],
    queryFn: async () => {
      const res = await api.get<any[]>('/auth/sessions');
      return res.data || [];
    },
    enabled: activeTab === 'security'
  });

  // --- Mutations ---
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put<any>('/auth/profile', {
        name: profileName,
        jobTitle,
        department,
        bio,
        timezone,
        preferredLanguage: language,
        twoFactorEnabled
      });
      return res.data;
    },
    onSuccess: (data: any) => {
      setUser({ ...user!, ...data });
      setProfileMessage({ text: 'Profile changes persisted successfully', success: true });
      setTimeout(() => setProfileMessage(null), 3000);
    },
    onError: (err: any) => {
      setProfileMessage({ text: err.message || 'Failed to update profile', success: false });
    }
  });

  const updateWorkspaceMutation = useMutation({
    mutationFn: async () => {
      if (!currentWorkspace) return;
      const res = await api.put<any>(`/workspaces/${currentWorkspace.id}`, {
        name: wsName,
        logo,
        companyName,
        website,
        industry,
        defaultVisibility
      });
      return res.data;
    },
    onSuccess: (data: any) => {
      setCurrentWorkspace({ ...currentWorkspace!, name: data.name, settings: data.settings });
      setWsMessage({ text: 'Workspace configuration updated', success: true });
      setTimeout(() => setWsMessage(null), 3000);
    },
    onError: (err: any) => {
      setWsMessage({ text: err.message || 'Failed to update workspace', success: false });
    }
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: async () => {
      if (!currentWorkspace) return;
      const res = await api.put<any>(`/workspaces/${currentWorkspace.id}`, {
        emailNotifications: emailNotifs,
        inAppNotifications: inAppNotifs,
        projectUpdates: projUpdates,
        taskAssignments,
        bugAlerts,
        releaseApprovals: relApprovals,
        securityAlerts: secAlerts
      });
      return res.data;
    },
    onSuccess: (data: any) => {
      setCurrentWorkspace({ ...currentWorkspace!, settings: data.settings });
      setNotifMessage({ text: 'Notification preferences saved', success: true });
      setTimeout(() => setNotifMessage(null), 3000);
    },
    onError: (err: any) => {
      setNotifMessage({ text: err.message || 'Failed to update notifications', success: false });
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) {
        throw new Error('New password and confirmation do not match');
      }
      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return res.data;
    },
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage({ text: 'Password successfully changed', success: true });
      setTimeout(() => setPasswordMessage(null), 4000);
    },
    onError: (err: any) => {
      setPasswordMessage({ text: err.message || 'Failed to change password', success: false });
    }
  });

  const revokeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await api.delete(`/auth/sessions/${sessionId}`);
    },
    onSuccess: () => {
      refetchSessions();
    }
  });

  return (
    <div className="w-full max-w-5xl p-6 lg:p-8 space-y-6 min-w-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <Settings className="h-6 w-6 text-primary" />
          <span>Workspace & Account Settings</span>
        </h1>
        <p className="text-xs text-foreground-muted mt-1">
          Configure appearance, developer identity, workspace branding, notification preferences, and security sessions.
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1.5 border-b border-border overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'profile'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-foreground-muted hover:text-foreground'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Developer Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'appearance'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-foreground-muted hover:text-foreground'
          }`}
        >
          <Palette className="h-4 w-4" />
          <span>Appearance</span>
        </button>

        <button
          onClick={() => setActiveTab('workspace')}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'workspace'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-foreground-muted hover:text-foreground'
          }`}
        >
          <Building className="h-4 w-4" />
          <span>Workspace Branding</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'notifications'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-foreground-muted hover:text-foreground'
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>Notification Preferences</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'security'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-foreground-muted hover:text-foreground'
          }`}
        >
          <Lock className="h-4 w-4" />
          <span>Security & Sessions</span>
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader className="p-5 pb-3 border-b border-border">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span>Developer Profile & Identity</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {profileMessage && (
              <div
                className={`p-3 rounded-lg text-xs font-medium ${
                  profileMessage.success
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-600'
                }`}
              >
                {profileMessage.text}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="e.g. Sarah Connor"
              />
              <Input
                label="Email Address (Immutable)"
                value={user?.email || ''}
                disabled
              />
              <Input
                label="Job Title"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Lead Systems Architect"
              />
              <Input
                label="Department / Org Unit"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Core Engineering"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">Developer Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Enterprise role, domain focus, and key architectural responsibilities..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary font-normal"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-card text-foreground focus:ring-1 focus:ring-primary"
                >
                  <option value="UTC">UTC (Universal Coordinated Time)</option>
                  <option value="America/New_York">America/New_York (EST/EDT)</option>
                  <option value="America/Chicago">America/Chicago (CST/CDT)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">Preferred Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-card text-foreground focus:ring-1 focus:ring-primary"
                >
                  <option value="en">English (US / UK)</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="ja">日本語</option>
                </select>
              </div>
            </div>

            {/* 2FA Toggle */}
            <div className="p-4 rounded-xl border border-border bg-background-secondary flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4 text-primary" />
                  Two-Factor Authentication (2FA)
                </span>
                <p className="text-[11px] text-foreground-muted mt-0.5">
                  Require an authenticator app (TOTP) verification code upon sign-in.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-border peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <Button
              size="sm"
              variant="primary"
              onClick={() => updateProfileMutation.mutate()}
              isLoading={updateProfileMutation.isPending}
              className="text-xs"
            >
              Save Profile Changes
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <Card>
          <CardHeader className="p-5 pb-3 border-b border-border">
            <CardTitle className="text-sm flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              <span>Theme & Interface Appearance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <p className="text-xs text-foreground-secondary">
              Select your interface color theme. Preferences are persisted per workspace and device profile.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Light Mode Option */}
              <div
                onClick={() => setTheme('light', currentWorkspace?.id)}
                className={`cursor-pointer rounded-xl border p-4 transition-all relative select-none flex flex-col justify-between ${
                  theme === 'light'
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-xs'
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
                    {theme === 'light' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="text-xs text-foreground-muted leading-relaxed">
                    Clean enterprise aesthetic with high contrast white canvas, slate borders, and crisp typography.
                  </p>
                </div>

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
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/10 shadow-xs'
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
                    {theme === 'dark' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="text-xs text-foreground-muted leading-relaxed">
                    Deep dark palette with high-clarity `#0B1120` canvas, muted borders, and vibrant `#60A5FA` accents.
                  </p>
                </div>

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
      )}

      {/* Workspace Tab */}
      {activeTab === 'workspace' && currentWorkspace && (
        <Card>
          <CardHeader className="p-5 pb-3 border-b border-border">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" />
              <span>Workspace Branding & Organization</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {wsMessage && (
              <div
                className={`p-3 rounded-lg text-xs font-medium ${
                  wsMessage.success
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-600'
                }`}
              >
                {wsMessage.text}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Workspace Display Name"
                value={wsName}
                onChange={(e) => setWsName(e.target.value)}
              />
              <Input
                label="Workspace Slug (System Generated)"
                value={currentWorkspace.slug}
                disabled
              />
              <Input
                label="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Enterprise Corp"
              />
              <Input
                label="Website URL"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://company.com"
              />
              <Input
                label="Industry / Domain"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Fintech, Healthcare, SaaS"
              />
              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">Default Project Visibility</label>
                <select
                  value={defaultVisibility}
                  onChange={(e) => setDefaultVisibility(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-card text-foreground focus:ring-1 focus:ring-primary"
                >
                  <option value="PRIVATE">Private (Assigned Members Only)</option>
                  <option value="PUBLIC">Workspace Public (All Members)</option>
                </select>
              </div>
            </div>

            <Button
              size="sm"
              variant="primary"
              onClick={() => updateWorkspaceMutation.mutate()}
              isLoading={updateWorkspaceMutation.isPending}
              className="text-xs"
            >
              Update Workspace Configuration
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader className="p-5 pb-3 border-b border-border">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <span>Workspace Notification Channels & Event Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {notifMessage && (
              <div
                className={`p-3 rounded-lg text-xs font-medium ${
                  notifMessage.success
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-600'
                }`}
              >
                {notifMessage.text}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background-secondary">
                <div>
                  <span className="text-xs font-semibold text-foreground block">Email Digest & Alerts</span>
                  <p className="text-[11px] text-foreground-muted">Send periodic sprint updates and high-priority alerts via email</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifs}
                  onChange={(e) => setEmailNotifs(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background-secondary">
                <div>
                  <span className="text-xs font-semibold text-foreground block">In-App Live Bell Notifications</span>
                  <p className="text-[11px] text-foreground-muted">Deliver instant toast and badge alerts in the top application bar</p>
                </div>
                <input
                  type="checkbox"
                  checked={inAppNotifs}
                  onChange={(e) => setInAppNotifs(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background-secondary">
                <div>
                  <span className="text-xs font-semibold text-foreground block">Project Milestone & Roadmap Updates</span>
                  <p className="text-[11px] text-foreground-muted">Notify when milestones achieve completion or drift past target deadlines</p>
                </div>
                <input
                  type="checkbox"
                  checked={projUpdates}
                  onChange={(e) => setProjUpdates(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background-secondary">
                <div>
                  <span className="text-xs font-semibold text-foreground block">Task Assignments & Mentions</span>
                  <p className="text-[11px] text-foreground-muted">Alert when a team member assigns tasks or mentions you in RFC discussions</p>
                </div>
                <input
                  type="checkbox"
                  checked={taskAssignments}
                  onChange={(e) => setTaskAssignments(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background-secondary">
                <div>
                  <span className="text-xs font-semibold text-foreground block">Critical Defect Alerts (P0 / Blockers)</span>
                  <p className="text-[11px] text-foreground-muted">Trigger immediate alert upon filing of critical or high-severity bugs</p>
                </div>
                <input
                  type="checkbox"
                  checked={bugAlerts}
                  onChange={(e) => setBugAlerts(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background-secondary">
                <div>
                  <span className="text-xs font-semibold text-foreground block">Release Approvals & Deploy Gateways</span>
                  <p className="text-[11px] text-foreground-muted">Notify authorized approvers when a production release enters review</p>
                </div>
                <input
                  type="checkbox"
                  checked={relApprovals}
                  onChange={(e) => setRelApprovals(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background-secondary">
                <div>
                  <span className="text-xs font-semibold text-foreground block">Security & Access Governance Alerts</span>
                  <p className="text-[11px] text-foreground-muted">Log and warn on role elevations, API key rotations, or new session logins</p>
                </div>
                <input
                  type="checkbox"
                  checked={secAlerts}
                  onChange={(e) => setSecAlerts(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
              </div>
            </div>

            <Button
              size="sm"
              variant="primary"
              onClick={() => updateNotificationsMutation.mutate()}
              isLoading={updateNotificationsMutation.isPending}
              className="text-xs"
            >
              Save Notification Preferences
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Security & Sessions Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Change Password */}
          <Card>
            <CardHeader className="p-5 pb-3 border-b border-border">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                <span>Change Account Password</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {passwordMessage && (
                <div
                  className={`p-3 rounded-lg text-xs font-medium ${
                    passwordMessage.success
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600'
                      : 'bg-rose-500/15 border border-rose-500/30 text-rose-600'
                  }`}
                >
                  {passwordMessage.text}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={() => changePasswordMutation.mutate()}
                isLoading={changePasswordMutation.isPending}
                disabled={!currentPassword || !newPassword || !confirmPassword}
                className="text-xs"
              >
                Update Password
              </Button>
            </CardContent>
          </Card>

          {/* Active Sessions List */}
          <Card>
            <CardHeader className="p-5 pb-3 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Laptop className="h-4 w-4 text-primary" />
                  <span>Active Sessions & Device Authorization</span>
                </CardTitle>
                <p className="text-[11px] text-foreground-muted mt-0.5">
                  Devices and client tokens currently authenticated to your account
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchSessions()}
                className="text-xs gap-1.5 h-7"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Refresh</span>
              </Button>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {sessions.length === 0 ? (
                <p className="text-xs text-foreground-muted py-2">
                  No other active concurrent sessions recorded.
                </p>
              ) : (
                sessions.map((sess: any) => (
                  <div
                    key={sess.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background-secondary text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Laptop className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {sess.userAgent || 'Web Browser Client'}
                          </span>
                          {sess.isCurrent && (
                            <Badge className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 text-[10px]">
                              Current Session
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] text-foreground-muted font-mono">
                          IP: {sess.ipAddress || '127.0.0.1'} · Last Active: {new Date(sess.lastActiveAt || sess.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {!sess.isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => revokeSessionMutation.mutate(sess.id)}
                        className="text-xs text-destructive hover:bg-destructive/10 h-7 gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Revoke</span>
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
