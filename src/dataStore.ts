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
}

export const data: DataStore = {
  courses: [],
  nextAssessmentId: 1
};

// puts back data that was saved earlier (used when the server starts)
export function setData(newData: DataStore) {
  data.courses = newData.courses;
  data.nextAssessmentId = newData.nextAssessmentId;
}
