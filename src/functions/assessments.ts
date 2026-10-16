import { data } from '../dataStore.ts';
import { isValidDate, findCourse, findAssessment } from './helpers.ts';
import type { ErrorResponse, EmptyObject, AssessmentsCreateResponse, AssessmentsListResponse } from './types.ts';

export function assessmentsCreate(
  code: string,
  title: string,
  weight: number,
  due: string
): AssessmentsCreateResponse | ErrorResponse {
  const course = findCourse(code);
  if (course === null) {
    return { error: 'Course does not exist' };
  }
  if (title === '') {
    return { error: 'Assessment title cannot be empty' };
  }
  if (weight < 1 || weight > 100) {
    return { error: 'Weight must be between 1 and 100' };
  }
  let total = 0;
  for (const assessment of course.assessments) {
    total = total + assessment.weight;
  }
  if (total + weight > 100) {
    return { error: 'Total weight cannot go over 100' };
  }
  if (!isValidDate(due)) {
    return { error: 'Due date must be YYYY-MM-DD' };
  }
  const assessmentId = data.nextAssessmentId;
  data.nextAssessmentId = data.nextAssessmentId + 1;
  course.assessments.push({ assessmentId: assessmentId, title: title, weight: weight, due: due, mark: null });
  return { assessmentId: assessmentId };
}

export function assessmentsList(code: string): AssessmentsListResponse | ErrorResponse {
  const course = findCourse(code);
  if (course === null) {
    return { error: 'Course does not exist' };
  }
  return { assessments: course.assessments };
}

export function assessmentsMark(assessmentId: number, mark: number): EmptyObject | ErrorResponse {
  const assessment = findAssessment(assessmentId);
  if (assessment === null) {
    return { error: 'Assessment does not exist' };
  }
  if (isNaN(mark) || mark < 0 || mark > 100) {
    return { error: 'Mark must be between 0 and 100' };
  }
  assessment.mark = mark;
  return {};
}

export function assessmentsDelete(assessmentId: number): EmptyObject | ErrorResponse {
  if (findAssessment(assessmentId) === null) {
    return { error: 'Assessment does not exist' };
  }
  for (const course of data.courses) {
    course.assessments = course.assessments.filter(assessment => assessment.assessmentId !== assessmentId);
  }
  return {};
}
