import { findCourse } from './helpers.ts';
import type { ErrorResponse, CoursesGradeResponse } from './types.ts';

export function coursesGrade(code: string): CoursesGradeResponse | ErrorResponse {
  const course = findCourse(code);
  if (course === null) {
    return { error: 'Course does not exist' };
  }
  const earned = course.assessments.reduce((sum, assessment) => {
    if (assessment.mark === null) {
      return sum;
    }
    return sum + assessment.weight * assessment.mark / 100;
  }, 0);
  const markedWeight = course.assessments.reduce((sum, assessment) => {
    if (assessment.mark === null) {
      return sum;
    }
    return sum + assessment.weight;
  }, 0);
  let average = null;
  if (markedWeight > 0) {
    average = Math.round(earned / markedWeight * 100 * 10) / 10;
  }
  return { earned: earned, markedWeight: markedWeight, average: average };
}
