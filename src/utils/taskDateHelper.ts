import { Task } from "../types";

/**
 * Parses a date string and calculates the remaining days relative to the current device/laptop date.
 * Supports various formats:
 * - "YYYY-MM-DD"
 * - "YYYY-MM-DD, HH:mm"
 * - "YYYY/MM/DD, HH:mm"
 * - "DD/MM/YYYY, HH:mm" or "DD/MM/YYYY pukul HH:mm"
 */
export function calculateDaysLeftFromDueDate(dueDate: string): number {
  if (!dueDate) return 0;
  
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  // Match ISO standard format: 2026-05-29, 23:59 or 2026-05-29
  const isoMatch = dueDate.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    const targetDate = new Date(year, month, day, 23, 59, 59, 999);
    const diffMs = targetDate.getTime() - todayStart.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  // Match Indo/Classroom format: 29/05/2026 or 29-05-2026
  const idMatch = dueDate.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (idMatch) {
    const day = parseInt(idMatch[1], 10);
    const month = parseInt(idMatch[2], 10) - 1;
    const year = parseInt(idMatch[3], 10);
    const targetDate = new Date(year, month, day, 23, 59, 59, 999);
    const diffMs = targetDate.getTime() - todayStart.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  // Fallback for direct date string parsing
  const parsed = Date.parse(dueDate);
  if (!isNaN(parsed)) {
    const targetDate = new Date(parsed);
    const diffMs = targetDate.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  return 0;
}

/**
 * Returns dynamic task list with synchronized daysLeft based on current device date
 */
export function syncTasksWithDeviceDate(tasks: Task[]): Task[] {
  return tasks.map(task => {
    // If dueDate has a parseable date, recalculate daysLeft relative to today
    const daysLeft = calculateDaysLeftFromDueDate(task.dueDate);
    return {
      ...task,
      daysLeft
    };
  });
}
