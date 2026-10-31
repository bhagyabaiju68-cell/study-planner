import { data } from '../dataStore.ts';
import type { EmptyObject } from './types.ts';

export function clearData(): EmptyObject {
  data.courses = [];
  data.nextAssessmentId = 1;
  data.users = [];
  data.sessions = [];
  data.nextUserId = 1;
  return {};
}
