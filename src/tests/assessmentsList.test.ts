import { beforeEach, describe, expect, test } from 'vitest';
import { clearData, coursesCreate, assessmentsCreate, assessmentsList, authRegister } from '../interface.ts';
import { findUserIdByToken } from '../functions/helpers.ts';

let userId: number;

beforeEach(() => {
  clearData();
  const register = authRegister('hello@gmail.com', 'password123') as { token: string };
  userId = findUserIdByToken(register.token) as number;
});

describe('assessmentsList', () => {
  test('course does not exist', () => {
    expect(assessmentsList(userId, 'COMP1531')).toStrictEqual({ error: expect.any(String) });
  });

  test('empty list', () => {
    coursesCreate(userId, 'COMP1531', 'Software Eng');
    expect(assessmentsList(userId, 'COMP1531')).toStrictEqual({ assessments: [] });
  });

  test('lists in order', () => {
    coursesCreate(userId, 'COMP1531', 'Software Eng');
    const lab = assessmentsCreate(userId, 'COMP1531', 'Lab 1', 10, '2026-10-20') as { assessmentId: number };
    const exam = assessmentsCreate(userId, 'COMP1531', 'Exam', 60, '2026-11-30') as { assessmentId: number };
    expect(assessmentsList(userId, 'COMP1531')).toStrictEqual({
      assessments: [
        { assessmentId: lab.assessmentId, title: 'Lab 1', weight: 10, due: '2026-10-20', mark: null },
        { assessmentId: exam.assessmentId, title: 'Exam', weight: 60, due: '2026-11-30', mark: null },
      ],
    });
  });

  test('only lists that course', () => {
    coursesCreate(userId, 'COMP1531', 'Software Eng');
    coursesCreate(userId, 'MATH1131', 'Maths 1A');
    assessmentsCreate(userId, 'MATH1131', 'Quiz 1', 5, '2026-10-12');
    expect(assessmentsList(userId, 'COMP1531')).toStrictEqual({ assessments: [] });
  });

  test('cannot list another users assessments', () => {
    const other = authRegister('other@gmail.com', 'password123') as { token: string };
    const otherId = findUserIdByToken(other.token) as number;
    coursesCreate(userId, 'COMP1531', 'Software Eng');
    assessmentsCreate(userId, 'COMP1531', 'Lab 1', 10, '2026-10-20');
    expect(assessmentsList(otherId, 'COMP1531')).toStrictEqual({ error: expect.any(String) });
  });
});
