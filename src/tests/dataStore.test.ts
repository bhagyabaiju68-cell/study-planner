import { beforeEach, describe, expect, test } from 'vitest';
import { clearData, coursesCreate, coursesList, coursesGrade, assessmentsCreate, assessmentsMark, authRegister, authLogout } from '../interface.ts';
import { data, setData } from '../dataStore.ts';
import { findUserIdByToken } from '../functions/helpers.ts';

beforeEach(() => {
  clearData();
});

// same as saving to data.json, restarting the server, and loading it back
function saveAndReload() {
  const saved = JSON.stringify(data);
  clearData();
  setData(JSON.parse(saved));
}

function makeUser(): string {
  const register = authRegister('hello@gmail.com', 'password123') as { token: string };
  return register.token;
}
describe('dataStore save and load', () => {
  test('empty at the start', () => {
    expect(data).toStrictEqual({ courses: [], nextAssessmentId: 1, users: [], sessions: [], nextUserId: 1 });
  });

  test('everything comes back after a save and load', () => {
    const userId = findUserIdByToken(makeUser()) as number;
    coursesCreate(userId, 'COMP1531', 'Software Eng');
    const lab = assessmentsCreate(userId, 'COMP1531', 'Lab 1', 10, '2026-10-20') as { assessmentId: number };
    assessmentsMark(userId, lab.assessmentId, 80);
    saveAndReload();
    expect(coursesList(userId)).toStrictEqual({ courses: [{ code: 'COMP1531', name: 'Software Eng' }] });
    expect(coursesGrade(userId, 'COMP1531')).toStrictEqual({ earned: 8, markedWeight: 10, average: 80 });
  });

  test('new ids keep counting up after loading', () => {
    const userId = findUserIdByToken(makeUser()) as number;
    coursesCreate(userId, 'COMP1531', 'Software Eng');
    const lab = assessmentsCreate(userId, 'COMP1531', 'Lab 1', 10, '2026-10-20') as { assessmentId: number };
    saveAndReload();
    expect(assessmentsCreate(userId, 'COMP1531', 'Exam', 60, '2026-11-30')).not.toStrictEqual({ assessmentId: lab.assessmentId });
  });

  test('users and sessions come back after a save and load', () => {
    const token = makeUser();
    saveAndReload();
    expect(findUserIdByToken(token)).toStrictEqual(1);
    expect(authLogout(token)).toStrictEqual({});
  });

  test('old data.json without users still loads', () => {
    setData(JSON.parse('{ "courses": [], "nextAssessmentId": 5 } '));
    expect(data).toStrictEqual({ courses: [], nextAssessmentId: 5, users: [], sessions: [], nextUserId: 1 });
  });
});
