'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/useAuthStore';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Clock,
  MapPin,
  Video,
  CheckCircle2,
  AlertTriangle,
  Flag,
  Rocket,
  Layers,
  Edit,
  Trash2,
  ExternalLink,
  X,
  User,
  FolderKanban
} from 'lucide-react';

interface CalendarViewProps {
  projectId?: string;
}

type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda';

export function CalendarView({ projectId }: CalendarViewProps) {
  const queryClient = useQueryClient();
  const { currentWorkspace, user } = useAuthStore();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 8)); // Nov 2026
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [search, setSearch] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId || 'ALL');

  // Modals state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formType, setFormType] = useState('MEETING');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formStartTime, setFormStartTime] = useState('10:00');
  const [formEndTime, setFormEndTime] = useState('11:00');
  const [formAllDay, setFormAllDay] = useState(false);
  const [formPriority, setFormPriority] = useState('MEDIUM');
  const [formColor, setFormColor] = useState('#3b82f6');
  const [formLocation, setFormLocation] = useState('');
  const [formMeetingUrl, setFormMeetingUrl] = useState('');
  const [formProjectId, setFormProjectId] = useState(projectId || '');

  // 1. Fetch Workspace Projects
  const { data: rawProjects = [] } = useQuery({
    queryKey: ['workspace-projects-selector', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      const res = await api.get<any>(`/projects?workspaceId=${currentWorkspace.id}`);
      return Array.isArray(res.data) ? res.data : Array.isArray(res.data?.projects) ? res.data.projects : [];
    },
    enabled: !!currentWorkspace?.id
  });

  const projects = Array.isArray(rawProjects) ? rawProjects : [];

  // 2. Fetch Events (Custom + Native Aggregated)
  const { data: rawEvents = [], isLoading } = useQuery({
    queryKey: ['calendar-events', currentWorkspace?.id, selectedProjectId],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      const projParam = selectedProjectId !== 'ALL' ? `&projectId=${selectedProjectId}` : '';
      const res = await api.get<any[]>(`/calendar/events?workspaceId=${currentWorkspace.id}${projParam}`);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!currentWorkspace?.id
  });

  const events = Array.isArray(rawEvents) ? rawEvents : [];

  // Mutations
  const createOrUpdateEventMutation = useMutation({
    mutationFn: async () => {
      const startDateTime = formAllDay
        ? new Date(`${formStartDate}T00:00:00Z`).toISOString()
        : new Date(`${formStartDate}T${formStartTime}:00Z`).toISOString();
      const endDateTime = formAllDay
        ? new Date(`${formEndDate || formStartDate}T23:59:59Z`).toISOString()
        : new Date(`${formEndDate || formStartDate}T${formEndTime}:00Z`).toISOString();

      const payload: any = {
        workspaceId: currentWorkspace!.id,
        projectId: formProjectId || null,
        title: formTitle,
        description: formDesc,
        eventType: formType,
        startDate: startDateTime,
        endDate: endDateTime,
        allDay: formAllDay,
        priority: formPriority,
        color: formColor,
        location: formLocation,
        meetingUrl: formMeetingUrl
      };

      if (editingEventId) {
        const res = await api.put(`/calendar/events/${editingEventId}`, payload);
        return res.data;
      } else {
        const res = await api.post('/calendar/events', payload);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      setIsEventModalOpen(false);
      resetForm();
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const res = await api.delete(`/calendar/events/${eventId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      setSelectedEvent(null);
    }
  });

  const resetForm = () => {
    setEditingEventId(null);
    setFormTitle('');
    setFormDesc('');
    setFormType('MEETING');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormEndDate(new Date().toISOString().split('T')[0]);
    setFormStartTime('10:00');
    setFormEndTime('11:00');
    setFormAllDay(false);
    setFormPriority('MEDIUM');
    setFormColor('#3b82f6');
    setFormLocation('');
    setFormMeetingUrl('');
    setFormProjectId(selectedProjectId !== 'ALL' ? selectedProjectId : '');
  };

  const openEditModal = (event: any) => {
    setEditingEventId(event.id);
    setFormTitle(event.title);
    setFormDesc(event.description || '');
    setFormType(event.eventType || 'MEETING');
    setFormStartDate(new Date(event.startDate).toISOString().split('T')[0]);
    setFormEndDate(new Date(event.endDate).toISOString().split('T')[0]);
    setFormStartTime(new Date(event.startDate).toISOString().split('T')[1]?.slice(0, 5) || '10:00');
    setFormEndTime(new Date(event.endDate).toISOString().split('T')[1]?.slice(0, 5) || '11:00');
    setFormAllDay(event.allDay || false);
    setFormPriority(event.priority || 'MEDIUM');
    setFormColor(event.color || '#3b82f6');
    setFormLocation(event.location || '');
    setFormMeetingUrl(event.meetingUrl || '');
    setFormProjectId(event.projectId || '');
    setSelectedEvent(null);
    setIsEventModalOpen(true);
  };

  // Month navigation
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((e: any) => {
      if (selectedTypeFilter !== 'ALL' && e.eventType !== selectedTypeFilter) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchTitle = e.title?.toLowerCase().includes(query);
        const matchDesc = e.description?.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc) return false;
      }
      return true;
    });
  }, [events, selectedTypeFilter, search]);

  // Calendar Grid Generation (Month view)
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({ date: d, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, isCurrentMonth: true });
    }

    // Next month padding to fill 35 or 42 cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false });
    }

    return days;
  }, [currentDate]);

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'TASK_DEADLINE':
        return <Clock className="h-3 w-3 text-warning" />;
      case 'SPRINT':
        return <Layers className="h-3 w-3 text-primary" />;
      case 'MILESTONE':
        return <Flag className="h-3 w-3 text-success" />;
      case 'RELEASE':
        return <Rocket className="h-3 w-3 text-purple-500" />;
      case 'DEPLOYMENT':
        return <AlertTriangle className="h-3 w-3 text-destructive" />;
      default:
        return <Video className="h-3 w-3 text-info" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        {/* Date Navigator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-0.5">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-md hover:bg-secondary text-foreground-muted hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-2.5 py-1 text-xs font-semibold hover:bg-secondary rounded-md text-foreground transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-md hover:bg-secondary text-foreground-muted hover:text-foreground transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <h2 className="text-base font-bold text-foreground font-mono min-w-[180px]">{monthName}</h2>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[180px]">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-foreground-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter events..."
              className="pl-8 h-8 text-xs"
            />
          </div>

          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground focus:outline-none"
          >
            <option value="ALL">All Projects</option>
            {projects.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground focus:outline-none"
          >
            <option value="ALL">All Event Types</option>
            <option value="TASK_DEADLINE">Task Deadlines</option>
            <option value="SPRINT">Sprints</option>
            <option value="MILESTONE">Milestones</option>
            <option value="RELEASE">Releases</option>
            <option value="DEPLOYMENT">Deployments</option>
            <option value="MEETING">Meetings</option>
          </select>

          {/* View switcher */}
          <div className="flex items-center rounded-lg border border-border bg-background p-0.5 text-xs">
            <button
              onClick={() => setViewMode('month')}
              className={`px-2 py-1 rounded font-medium ${
                viewMode === 'month' ? 'bg-primary text-white' : 'text-foreground-muted'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-2 py-1 rounded font-medium ${
                viewMode === 'agenda' ? 'bg-primary text-white' : 'text-foreground-muted'
              }`}
            >
              Agenda
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              resetForm();
              setIsEventModalOpen(true);
            }}
            className="text-xs h-8 gap-1.5 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Event</span>
          </Button>
        </div>
      </div>

      {/* 1. MONTH VIEW */}
      {viewMode === 'month' && (
        <Card className="p-4 overflow-hidden border border-border shadow-sm">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-border pb-2 text-center text-xs font-semibold text-foreground-muted uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7 gap-px bg-border/60 border-b border-r border-border mt-1 rounded-lg overflow-hidden">
            {calendarDays.map((dayObj, idx) => {
              const dayStr = dayObj.date.toISOString().split('T')[0];
              const isToday = new Date().toISOString().split('T')[0] === dayStr;

              // Find events on this day
              const dayEvents = filteredEvents.filter((e: any) => {
                const sStr = new Date(e.startDate).toISOString().split('T')[0];
                const eStr = new Date(e.endDate).toISOString().split('T')[0];
                return dayStr >= sStr && dayStr <= eStr;
              });

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setFormStartDate(dayStr);
                    setFormEndDate(dayStr);
                    setIsEventModalOpen(true);
                  }}
                  className={`min-h-[110px] p-2 bg-card hover:bg-background-secondary/40 transition-colors flex flex-col justify-between cursor-pointer group ${
                    !dayObj.isCurrentMonth ? 'opacity-40 bg-background/50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-semibold h-6 w-6 rounded-full flex items-center justify-center ${
                        isToday ? 'bg-primary text-white font-bold' : 'text-foreground'
                      }`}
                    >
                      {dayObj.date.getDate()}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormStartDate(dayStr);
                        setFormEndDate(dayStr);
                        setIsEventModalOpen(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-foreground-muted hover:text-primary hover:bg-secondary transition-all"
                      title="Add event on this date"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Day Events Stack */}
                  <div className="space-y-1 my-1 overflow-y-auto max-h-[85px] pr-0.5">
                    {dayEvents.slice(0, 3).map((e: any) => (
                      <div
                        key={e.id}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setSelectedEvent(e);
                        }}
                        style={{
                          backgroundColor: `${e.color || '#3b82f6'}15`,
                          borderLeftColor: e.color || '#3b82f6'
                        }}
                        className="text-[10px] p-1 rounded border-l-2 font-medium truncate flex items-center gap-1 hover:brightness-95 transition-all text-foreground"
                        title={e.title}
                      >
                        {getEventIcon(e.eventType)}
                        <span className="truncate">{e.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[9px] font-mono font-semibold text-primary block text-center">
                        +{dayEvents.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 2. AGENDA VIEW */}
      {viewMode === 'agenda' && (
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Chronological Delivery Agenda ({filteredEvents.length} events)
          </h3>

          <div className="divide-y divide-border border border-border rounded-xl bg-card overflow-hidden">
            {filteredEvents.map((e: any) => (
              <div
                key={e.id}
                onClick={() => setSelectedEvent(e)}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-background-secondary/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: e.color || '#3b82f6' }}
                  >
                    {getEventIcon(e.eventType)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{e.title}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-foreground-muted mt-0.5">
                      <span className="font-mono">{new Date(e.startDate).toLocaleDateString()}</span>
                      {e.projectName && <span>• {e.projectName}</span>}
                      {e.location && <span>• {e.location}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Badge variant="outline" className="text-[10px]">
                    {e.eventType}
                  </Badge>
                  {e.isCustom && (
                    <button
                      onClick={(ev) => {
                        ev.stopPropagation();
                        openEditModal(e);
                      }}
                      className="p-1 rounded text-foreground-muted hover:text-foreground"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <Dialog
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title={selectedEvent.title}
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {selectedEvent.eventType}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {selectedEvent.priority}
              </Badge>
              {selectedEvent.projectName && (
                <span className="text-xs text-foreground-muted font-mono">
                  Project: {selectedEvent.projectName}
                </span>
              )}
            </div>

            {selectedEvent.description && (
              <p className="text-xs text-foreground leading-relaxed bg-background p-3 rounded-lg border border-border">
                {selectedEvent.description}
              </p>
            )}

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-foreground-muted">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-mono">
                  {new Date(selectedEvent.startDate).toLocaleString()} -{' '}
                  {new Date(selectedEvent.endDate).toLocaleString()}
                </span>
              </div>

              {selectedEvent.location && (
                <div className="flex items-center gap-2 text-foreground-muted">
                  <MapPin className="h-4 w-4 text-destructive" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}

              {selectedEvent.meetingUrl && (
                <div className="flex items-center gap-2 text-primary font-medium">
                  <Video className="h-4 w-4" />
                  <a href={selectedEvent.meetingUrl} target="_blank" rel="noreferrer" className="hover:underline">
                    {selectedEvent.meetingUrl}
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-border">
              {selectedEvent.isCustom ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteEventMutation.mutate(selectedEvent.id)}
                  className="text-xs text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Delete
                </Button>
              ) : (
                <span className="text-[11px] text-foreground-muted italic">
                  Aggregated native engineering record
                </span>
              )}

              <div className="flex items-center gap-2">
                {selectedEvent.isCustom && (
                  <Button variant="outline" size="sm" onClick={() => openEditModal(selectedEvent)} className="text-xs">
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                )}
                <Button variant="primary" size="sm" onClick={() => setSelectedEvent(null)} className="text-xs">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* Create / Edit Custom Event Modal */}
      <Dialog
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEditingEventId(null);
        }}
        title={editingEventId ? 'Edit Event' : 'Schedule Engineering Event'}
        size="md"
      >
        <div className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Event Title *</label>
            <Input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Architecture Review Board or Sprint Retrospective"
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Event Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground"
              >
                <option value="MEETING">Meeting</option>
                <option value="DEPLOYMENT">Deployment Window</option>
                <option value="REVIEW">Architecture Review</option>
                <option value="RELEASE">Release Freeze</option>
                <option value="MILESTONE">Delivery Gate</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Project</label>
              <select
                value={formProjectId}
                onChange={(e) => setFormProjectId(e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground"
              >
                <option value="">Workspace-wide event</option>
                {projects.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Date</label>
              <Input
                type="date"
                value={formStartDate}
                onChange={(e) => {
                  setFormStartDate(e.target.value);
                  setFormEndDate(e.target.value);
                }}
                className="text-xs h-8"
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Start Time</label>
                <Input
                  type="time"
                  value={formStartTime}
                  onChange={(e) => setFormStartTime(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">End Time</label>
                <Input
                  type="time"
                  value={formEndTime}
                  onChange={(e) => setFormEndTime(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Meeting URL or Location</label>
            <Input
              value={formMeetingUrl}
              onChange={(e) => setFormMeetingUrl(e.target.value)}
              placeholder="e.g. https://meet.devblueprint.io/arch-sync"
              className="text-xs h-8"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Description</label>
            <Textarea
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Agenda, required attendees, or architectural notes..."
              rows={3}
              className="text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEventModalOpen(false);
                setEditingEventId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!formTitle.trim() || createOrUpdateEventMutation.isPending}
              isLoading={createOrUpdateEventMutation.isPending}
              onClick={() => createOrUpdateEventMutation.mutate()}
            >
              {editingEventId ? 'Save Changes' : 'Schedule Event'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
