// Return types for every function

export interface ErrorResponse {
  error: string;
}

export type EmptyObject = Record<string, never>;

export interface CourseSummary {
  code: string;
  name: string;
}

export interface CoursesCreateResponse {
  code: string;
}

export interface CoursesListResponse {
  courses: CourseSummary[];
}

export interface AssessmentsCreateResponse {
  assessmentId: number;
}

export interface AssessmentsListResponse {
  assessments: {
    assessmentId: number;
    title: string;
    weight: number;
    due: string;
    mark: number | null;
  }[];
}

export interface CoursesGradeResponse {
  earned: number;
  markedWeight: number;
  average: number | null;
}

export interface Deadline {
  code: string;
  assessmentId: number;
  title: string;
  weight: number;
  due: string;
  daysLeft: number;
}

export interface DeadlinesListResponse {
  deadlines: Deadline[];
}
