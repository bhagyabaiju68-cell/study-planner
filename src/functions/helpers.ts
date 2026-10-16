import { data, Course, Assessment } from '../dataStore.ts';

// checks the date looks like YYYY-MM-DD and is a real date
export function isValidDate(date: string): boolean {
  if (date.length !== 10 || date[4] !== '-' || date[7] !== '-') {
    return false;
  }
  return !isNaN(Date.parse(date));
}

export function findCourse(code: string): Course | null {
  for (const course of data.courses) {
    if (course.code === code) {
      return course;
    }
  }
  return null;
}

export function findAssessment(assessmentId: number): Assessment | null {
  for (const course of data.courses) {
    for (const assessment of course.assessments) {
      if (assessment.assessmentId === assessmentId) {
        return assessment;
      }
    }
  }
  return null;
}
