import { data } from '../dataStore.ts';
import { findCourse } from './helpers.ts';
import type { ErrorResponse, EmptyObject, CoursesCreateResponse, CoursesListResponse, CourseSummary } from './types.ts';

export function coursesCreate(userId: number, code: string, name: string): CoursesCreateResponse | ErrorResponse {
  if (code.length !== 8) {
    return { error: 'Course code must be 8 characters long' };
  }
  if (name === '') {
    return { error: 'Course name cannot be empty' };
  }
  if (findCourse(userId, code) !== null) {
    return { error: 'Course code already exists' };
  }
  data.courses.push({ code: code, name: name, assessments: [], ownerId: userId });
  return { code: code };
}

export function coursesList(userId: number): CoursesListResponse {
  const courses: CourseSummary[] = [];
  for (const course of data.courses) {
    if (course.ownerId === userId) {
      courses.push({ code: course.code, name: course.name });
    }
  }
  return { courses: courses };
}

export function coursesDelete(userId: number, code: string): EmptyObject | ErrorResponse {
  if (findCourse(userId, code) === null) {
    return { error: 'Course does not exist' };
  }
  data.courses = data.courses.filter(course => course.code !== code || course.ownerId !== userId);
  return {};
}
