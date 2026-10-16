import { data } from '../dataStore.ts';
import { isValidDate } from './helpers.ts';
import type { ErrorResponse, Deadline, DeadlinesListResponse } from './types.ts';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// every unmarked assessment due between today and `days` days from now, soonest first
export function deadlinesList(today: string, days: number): DeadlinesListResponse | ErrorResponse {
  if (!isValidDate(today)) {
    return { error: 'Today must be YYYY-MM-DD' };
  }
  if (!Number.isInteger(days) || days < 0) {
    return { error: 'Days must be a whole number, 0 or more' };
  }
  const deadlines: Deadline[] = [];
  for (const course of data.courses) {
    for (const assessment of course.assessments) {
      const daysLeft = (Date.parse(assessment.due) - Date.parse(today)) / MS_PER_DAY;
      if (assessment.mark === null && daysLeft >= 0 && daysLeft <= days) {
        deadlines.push({
          code: course.code,
          assessmentId: assessment.assessmentId,
          title: assessment.title,
          weight: assessment.weight,
          due: assessment.due,
          daysLeft: daysLeft,
        });
      }
    }
  }
  deadlines.sort((a, b) => {
    if (a.due !== b.due) {
      return a.due < b.due ? -1 : 1;
    }
    return a.code < b.code ? -1 : 1;
  });
  return { deadlines: deadlines };
}
