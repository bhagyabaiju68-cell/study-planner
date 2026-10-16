import { data } from '../dataStore.ts';
import { findCourse } from './helpers.ts';
import type { ErrorResponse, EmptyObject, CoursesCreateResponse, CoursesListResponse, CourseSummary } from './types.ts';

export function coursesCreate(code: string, name: string): CoursesCreateResponse | ErrorResponse {
  if (code.length !== 8) {
    return { error: 'Course code must be 8 characters long' };
  }
  if (name === '') {
    return { error: 'Course name cannot be empty' };
  }
  if (findCourse(code) !== null) {
    return { error: 'Course code already exists' };
  }
  data.courses.push({ code: code, name: name, assessments: [] });
  return { code: code };
}

export function coursesList(): CoursesListResponse {
  const courses: CourseSummary[] = [];
  for (const course of data.courses) {
    courses.push({ code: course.code, name: course.name });
  }
  return { courses: courses };
}

export function coursesDelete(code: string): EmptyObject | ErrorResponse {
  if (findCourse(code) === null) {
    return { error: 'Course does not exist' };
  }
  data.courses = data.courses.filter(course => course.code !== code);
  return {};
}
