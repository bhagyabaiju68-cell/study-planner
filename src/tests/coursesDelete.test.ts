import { beforeEach, describe, expect, test } from 'vitest';
import {
  clearData, coursesCreate, coursesList, coursesDelete,
  assessmentsCreate, assessmentsList, assessmentsMark, deadlinesList,
  authRegister
} from '../interface.ts';
import { findUserIdByToken } from '../functions/helpers.ts';

let userId: number;

beforeEach(() => {
  clearData();
  const register = authRegister('hello@gmail.com', 'password123') as { token: string };
  userId = findUserIdByToken(register.token) as number;
});

describe('coursesDelete', () => {
  test('course does not exist', () => {
    expect(coursesDelete(userId, 'COMP1531')).toStrictEqual({ error: expect.any(String) });
  });

  test('removes only that course', () => {
    coursesCreate(userId, 'COMP1531', 'Software Eng');
    coursesCreate(userId, 'MATH1131', 'Maths 1A');
    expect(coursesDelete(userId, 'COMP1531')).toStrictEqual({});
    expect(coursesList(userId)).toStrictEqual({ courses: [{ code: 'MATH1131', name: 'Maths 1A' }] });
  });

  test('its assessments are gone too', () => {
    coursesCreate(userId, 'COMP1531', 'Software Eng');
    const lab = assessmentsCreate(userId, 'COMP1531', 'Lab 1', 10, '2026-10-20') as { assessmentId: number };
    coursesDelete(userId, 'COMP1531');
    expect(assessmentsList(userId, 'COMP1531')).toStrictEqual({ error: expect.any(String) });
    expect(assessmentsMark(userId, lab.assessmentId, 80)).toStrictEqual({ error: expect.any(String) });
    expect(deadlinesList(userId, '2026-10-10', 14)).toStrictEqual({ deadlines: [] });
  });

  test('code can be added again after deleting', () => {
    coursesCreate(userId, 'COMP1531', 'Software Eng');
    coursesDelete(userId, 'COMP1531');
    expect(coursesCreate(userId, 'COMP1531', 'Software Eng')).toStrictEqual({ code: 'COMP1531' });
  });

  test('deleting twice gives an error', () => {
    coursesCreate(userId, 'COMP1531', 'Software Eng');
    coursesDelete(userId, 'COMP1531');
    expect(coursesDelete(userId, 'COMP1531')).toStrictEqual({ error: expect.any(String) });
  });

  test('deleting your course leaves the other user copy', () => {
    const other = authRegister('other@gmail.com', 'password123') as { token: string };
    const otherId = findUserIdByToken(other.token) as number;
    coursesCreate(userId, 'COMP1531', 'Software Eng');
    coursesCreate(otherId, 'COMP1531', 'Software Eng');
    expect(coursesDelete(otherId, 'COMP1531')).toStrictEqual({});
    expect(coursesList(userId)).toStrictEqual({ courses: [{ code: 'COMP1531', name: 'Software Eng' }] });
  });

  test('cannot delete another user course', () => {
    const other = authRegister('other@gmail.com', 'password123') as { token: string };
    const otherId = findUserIdByToken(other.token) as number;
    coursesCreate(userId, 'COMP1531', 'Software Eng');
    expect(coursesDelete(otherId, 'COMP1531')).toStrictEqual({ error: expect.any(String) });
  });
});
