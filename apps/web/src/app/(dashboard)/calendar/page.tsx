'use client';

import React from 'react';
import { CalendarView } from '../../../features/calendar/CalendarView';

export default function CalendarPage() {
  return (
    <div className="w-full p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <CalendarView />
    </div>
  );
}
