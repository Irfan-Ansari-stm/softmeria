import { prisma } from '../../config/db';
import { NotFoundError } from '../../utils/errors';

export class CalendarService {
  async listEvents(options: {
    workspaceId: string;
    projectId?: string;
    startDate?: string;
    endDate?: string;
    eventTypes?: string[];
  }) {
    const { workspaceId, projectId, startDate, endDate, eventTypes } = options;

    const projectFilter: any = { workspaceId };
    if (projectId) projectFilter.id = projectId;

    // 1. Custom Calendar Events
    const customWhere: any = { workspaceId };
    if (projectId) customWhere.projectId = projectId;
    if (startDate && endDate) {
      customWhere.OR = [
        { startDate: { gte: new Date(startDate), lte: new Date(endDate) } },
        { endDate: { gte: new Date(startDate), lte: new Date(endDate) } }
      ];
    }

    const customEvents = await prisma.calendarEvent.findMany({
      where: customWhere,
      include: {
        project: { select: { id: true, name: true, slug: true } },
        task: { select: { id: true, taskIdentifier: true, title: true } },
        sprint: { select: { id: true, name: true } },
        milestone: { select: { id: true, name: true } },
        release: { select: { id: true, version: true } },
        createdBy: { select: { id: true, name: true, avatarUrl: true } }
      },
      orderBy: { startDate: 'asc' }
    });

    const events: any[] = customEvents.map((e) => ({
      ...e,
      projectName: e.project?.name,
      isCustom: true
    }));

    // 2. Aggregated Task Deadlines
    const taskWhere: any = {
      project: projectFilter,
      dueDate: { not: null }
    };
    if (startDate && endDate) {
      taskWhere.dueDate = { gte: new Date(startDate), lte: new Date(endDate) };
    }

    const tasks = await prisma.task.findMany({
      where: taskWhere,
      select: {
        id: true,
        taskIdentifier: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
        startDate: true,
        projectId: true,
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    tasks.forEach((t) => {
      events.push({
        id: `task-${t.id}`,
        nativeId: t.id,
        title: `${t.taskIdentifier}: ${t.title}`,
        description: `Task status: ${t.status}, Priority: ${t.priority}`,
        eventType: 'TASK_DEADLINE',
        startDate: t.dueDate!,
        endDate: t.dueDate!,
        allDay: true,
        priority: t.priority,
        color: t.priority === 'URGENT' ? '#ef4444' : '#f97316',
        projectId: t.projectId,
        projectName: t.project.name,
        taskId: t.id,
        isCustom: false,
        assignee: t.assignee
      });
    });

    // 3. Aggregated Sprints
    const sprintWhere: any = {
      project: projectFilter,
      startDate: { not: null },
      endDate: { not: null }
    };

    const sprints = await prisma.sprint.findMany({
      where: sprintWhere,
      select: {
        id: true,
        name: true,
        goal: true,
        status: true,
        startDate: true,
        endDate: true,
        projectId: true,
        project: { select: { id: true, name: true } }
      }
    });

    sprints.forEach((s) => {
      events.push({
        id: `sprint-${s.id}`,
        nativeId: s.id,
        title: `Sprint: ${s.name}`,
        description: s.goal || `Status: ${s.status}`,
        eventType: 'SPRINT',
        startDate: s.startDate!,
        endDate: s.endDate!,
        allDay: true,
        priority: 'HIGH',
        color: '#6366f1',
        projectId: s.projectId,
        projectName: s.project.name,
        sprintId: s.id,
        isCustom: false
      });
    });

    // 4. Aggregated Milestones
    const milestoneWhere: any = {
      project: projectFilter,
      targetDate: { not: null }
    };

    const milestones = await prisma.milestone.findMany({
      where: milestoneWhere,
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        startDate: true,
        targetDate: true,
        completionPercentage: true,
        projectId: true,
        project: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    milestones.forEach((m) => {
      events.push({
        id: `milestone-${m.id}`,
        nativeId: m.id,
        title: `Milestone: ${m.name}`,
        description: m.description || `Progress: ${m.completionPercentage}%`,
        eventType: 'MILESTONE',
        startDate: m.startDate || m.targetDate!,
        endDate: m.targetDate!,
        allDay: true,
        priority: 'HIGH',
        color: '#10b981',
        projectId: m.projectId,
        projectName: m.project.name,
        milestoneId: m.id,
        isCustom: false,
        owner: m.owner
      });
    });

    // 5. Aggregated Releases
    const releaseWhere: any = {
      project: projectFilter,
      targetDate: { not: null }
    };

    const releases = await prisma.release.findMany({
      where: releaseWhere,
      select: {
        id: true,
        version: true,
        title: true,
        status: true,
        targetDate: true,
        releasedAt: true,
        projectId: true,
        project: { select: { id: true, name: true } }
      }
    });

    releases.forEach((r) => {
      const date = r.releasedAt || r.targetDate!;
      events.push({
        id: `release-${r.id}`,
        nativeId: r.id,
        title: `Release ${r.version}: ${r.title}`,
        description: `Status: ${r.status}`,
        eventType: 'RELEASE',
        startDate: date,
        endDate: date,
        allDay: true,
        priority: 'URGENT',
        color: '#8b5cf6',
        projectId: r.projectId,
        projectName: r.project.name,
        releaseId: r.id,
        isCustom: false
      });
    });

    // Filter by requested eventTypes if provided
    let filtered = events;
    if (eventTypes && eventTypes.length > 0) {
      filtered = events.filter((e) => eventTypes.includes(e.eventType));
    }

    return filtered.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }

  async getEvent(eventId: string) {
    const event = await prisma.calendarEvent.findUnique({
      where: { id: eventId },
      include: {
        project: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, avatarUrl: true } }
      }
    });
    if (!event) throw new NotFoundError('Calendar event not found');
    return event;
  }

  async createEvent(userId: string, data: {
    workspaceId: string;
    projectId?: string;
    title: string;
    description?: string;
    eventType?: string;
    startDate: string;
    endDate: string;
    allDay?: boolean;
    priority?: string;
    color?: string;
    location?: string;
    meetingUrl?: string;
    taskId?: string;
    sprintId?: string;
    milestoneId?: string;
    releaseId?: string;
  }) {
    return prisma.calendarEvent.create({
      data: {
        workspaceId: data.workspaceId,
        projectId: data.projectId || null,
        title: data.title,
        description: data.description,
        eventType: data.eventType || 'MEETING',
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        allDay: data.allDay ?? false,
        priority: data.priority || 'MEDIUM',
        color: data.color || '#3b82f6',
        location: data.location,
        meetingUrl: data.meetingUrl,
        taskId: data.taskId || null,
        sprintId: data.sprintId || null,
        milestoneId: data.milestoneId || null,
        releaseId: data.releaseId || null,
        createdById: userId
      },
      include: {
        project: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, avatarUrl: true } }
      }
    });
  }

  async updateEvent(eventId: string, data: any) {
    // If native event (e.g. task, sprint, milestone, release) reschedule directly
    if (eventId.startsWith('task-')) {
      const taskId = eventId.replace('task-', '');
      await prisma.task.update({
        where: { id: taskId },
        data: { dueDate: data.startDate ? new Date(data.startDate) : undefined }
      });
      return { success: true, id: eventId };
    }

    if (eventId.startsWith('sprint-')) {
      const sprintId = eventId.replace('sprint-', '');
      await prisma.sprint.update({
        where: { id: sprintId },
        data: {
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined
        }
      });
      return { success: true, id: eventId };
    }

    if (eventId.startsWith('milestone-')) {
      const milestoneId = eventId.replace('milestone-', '');
      await prisma.milestone.update({
        where: { id: milestoneId },
        data: { targetDate: data.endDate || data.startDate ? new Date(data.endDate || data.startDate) : undefined }
      });
      return { success: true, id: eventId };
    }

    if (eventId.startsWith('release-')) {
      const releaseId = eventId.replace('release-', '');
      await prisma.release.update({
        where: { id: releaseId },
        data: { targetDate: data.startDate ? new Date(data.startDate) : undefined }
      });
      return { success: true, id: eventId };
    }

    const updatePayload: any = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.eventType !== undefined) updatePayload.eventType = data.eventType;
    if (data.startDate !== undefined) updatePayload.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updatePayload.endDate = new Date(data.endDate);
    if (data.allDay !== undefined) updatePayload.allDay = data.allDay;
    if (data.priority !== undefined) updatePayload.priority = data.priority;
    if (data.color !== undefined) updatePayload.color = data.color;
    if (data.location !== undefined) updatePayload.location = data.location;
    if (data.meetingUrl !== undefined) updatePayload.meetingUrl = data.meetingUrl;
    if (data.projectId !== undefined) updatePayload.projectId = data.projectId || null;

    return prisma.calendarEvent.update({
      where: { id: eventId },
      data: updatePayload,
      include: {
        project: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, avatarUrl: true } }
      }
    });
  }

  async deleteEvent(eventId: string) {
    if (eventId.startsWith('task-') || eventId.startsWith('sprint-') || eventId.startsWith('milestone-') || eventId.startsWith('release-')) {
      // Do not delete native entity via calendar delete unless it's a custom calendar event
      return { success: true, id: eventId };
    }

    await prisma.calendarEvent.delete({ where: { id: eventId } });
    return { success: true, id: eventId };
  }
}

export const calendarService = new CalendarService();
