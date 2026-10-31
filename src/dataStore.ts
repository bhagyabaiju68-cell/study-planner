// All the data is stored here

export interface Assessment {
  assessmentId: number;
  title: string;
  weight: number;
  due: string;
  mark: number | null;
}

export interface Course {
  code: string;
  name: string;
  assessments: Assessment[];
}

export interface DataStore {
  courses: Course[];
  nextAssessmentId: number;
  users: User[];
  sessions: Session[];
  nextUserId: number;
}

export const data: DataStore = {
  users: [],
  sessions: [],
  nextUserId: 1,
  courses: [],
  nextAssessmentId: 1
};

// puts back data that was saved earlier (used when the server starts)
export function setData(newData: DataStore) {
  data.courses = newData.courses;
  data.nextAssessmentId = newData.nextAssessmentId;
  if (newData.users !== undefined) {
    data.users = newData.users;
  }
  if (newData.sessions !== undefined) {
    data.sessions = newData.sessions;
  }
  if (newData.nextUserId !== undefined) {
    data.nextUserId = newData.nextUserId;
  }
}

export interface User {
  userId: number;
  email: string;
  passwordHash: string;
}

export interface Session {
  token: string;
  userId: number;
}
