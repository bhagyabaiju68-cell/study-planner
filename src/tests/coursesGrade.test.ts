import { beforeEach, describe, expect, test } from 'vitest';
import { clearData, coursesCreate, coursesGrade, assessmentsCreate, assessmentsMark, authRegister } from '../interface.ts';
import { findUserIdByToken } from '../functions/helpers.ts';

let userId: number;

beforeEach(() => {
  clearData();
  const register = authRegister('hello@gmail.com', 'password123') as { token: string };
  userId = findUserIdByToken(register.token) as number;
});

describe('coursesGrade', () => {
  test('course does not exist', () => {
    expect(coursesGrade(userId, 'COMP1531')).toStrictEqual({ error: expect.any(String) });
  });

  test('nothing marked yet', () => {
    coursesCreate(userId, 'COMP1531', 'Software Eng');
    assessmentsCreate(userId, 'COMP1531', 'Lab 1', 10, '2026-10-20');
    expect(coursesGrade(userId, 'COMP1531')).toStrictEqual({ earned: 0, markedWeight: 0, average: null });
  });

  test('only counts marked assessments', () => {
    coursesCreate(userId, 'COMP1531', 'Software Eng');
    const lab = assessmentsCreate(userId, 'COMP1531', 'Lab 1', 10, '2026-10-20') as { assessmentId: number };
    const project = assessmentsCreate(userId, 'COMP1531', 'Project', 30, '2026-11-15') as { assessmentId: number };
    assessmentsCreate(userId, 'COMP1531', 'Exam', 60, '2026-11-30');
    assessmentsMark(userId, lab.assessmentId, 80);
    assessmentsMark(userId, project.assessmentId, 70);
    // lab: 10 * 0.8 = 8, project: 30 * 0.7 = 21 -> 29 out of 40 = 72.5%
    expect(coursesGrade(userId, 'COMP1531')).toStrictEqual({ earned: 29, markedWeight: 40, average: 72.5 });
  });

  test('cannot see another users grade', () => {
    const other = authRegister('other@gmail.com', 'password123') as { token: string };
    const otherId = findUserIdByToken(other.token) as number;
    coursesCreate(userId, 'COMP1531', 'Software Eng');
    expect(coursesGrade(otherId, 'COMP1531')).toStrictEqual({ error: expect.any(String) });
  });
});
