import { data, Course, Assessment } from '../dataStore.ts';

// checks the date looks like YYYY-MM-DD and is a real date
export function isValidDate(date: string): boolean {
  if (date.length !== 10 || date[4] !== '-' || date[7] !== '-') {
    return false;
  }
  return !isNaN(Date.parse(date));
}

export function findCourse(userId: number, code: string): Course | null {
  for (const course of data.courses) {
    if (course.ownerId === userId && course.code === code) {
      return course;
    }
  }
  return null;
}

export function findAssessment(userId: number, assessmentId: number): Assessment | null {
  for (const course of data.courses) {
    if (course.ownerId === userId) {
      for (const assessment of course.assessments) {
        if (assessment.assessmentId === assessmentId) {
          return assessment;
        }
      }
    }
  }
  return null;
}

export function findUserIdByToken(token: string): number | null {
  for (const session of data.sessions) {
    if (session.token === token) {
      return session.userId;
    }
  }
  return null;
}
