import { beforeEach, describe, expect, test } from 'vitest';
import { clearData, coursesCreate, assessmentsCreate, assessmentsMark, deadlinesList, authRegister } from '../interface.ts';
import type { DeadlinesListResponse } from '../functions/types.ts';
import { findUserIdByToken } from '../functions/helpers.ts';

let userId: number;

beforeEach(() => {
  clearData();
  const register = authRegister('hello@gmail.com', 'password123') as { token: string };
  userId = findUserIdByToken(register.token) as number;
});

describe('deadlinesList', () => {
  test('no assessments', () => {
    expect(deadlinesList(userId, '2026-10-10', 14)).toStrictEqual({ deadlines: [] });
  });

  test('soonest first, across courses', () => {
    coursesCreate(userId, 'COMP1531', 'Software Eng');
    coursesCreate(userId, 'MATH1131', 'Maths 1A');
    const lab = assessmentsCreate(userId, 'COMP1531', 'Lab 1', 10, '2026-10-20') as { assessmentId: number };
    const quiz = assessmentsCreate(userId, 'MATH1131', 'Quiz 1', 5, '2026-10-12') as { assessmentId: number };
    expect(deadlinesList(userId, '2026-10-10', 14)).toStrictEqual({
      deadlines: [
        { code: 'MATH1131', assessmentId: quiz.assessmentId, title: 'Quiz 1', weight: 5, due: '2026-10-12', daysLeft: 2 },
        { code: 'COMP1531', assessmentId: lab.assessmentId, title: 'Lab 1', weight: 10, due: '2026-10-20', daysLeft: 10 },
      ],
    });
  });

  test('same day sorts by course code', () => {
    coursesCreate(userId, 'MATH1131', 'Maths 1A');
    coursesCreate(userId, 'COMP1531', 'Software Eng');
    coursesCreate(userId, 'PHYS1121', 'Physics 1A');
    assessmentsCreate(userId, 'MATH1131', 'Quiz 1', 5, '2026-10-12');
    assessmentsCreate(userId, 'COMP1531', 'Lab 1', 10, '2026-10-12');
    assessmentsCreate(userId, 'PHYS1121', 'Lab 1', 10, '2026-10-12');
    const result = deadlinesList(userId, '2026-10-10', 14) as DeadlinesListResponse;
    expect(result.deadlines.map(deadline => deadline.code)).toStrictEqual(['COMP1531', 'MATH1131', 'PHYS1121']);
  });

  test('due today counts, past and too far do not', () => {
    coursesCreate(userId, 'COMP1531', 'Software Eng');
    assessmentsCreate(userId, 'COMP1531', 'Past', 10, '2026-10-09');
    assessmentsCreate(userId, 'COMP1531', 'Today', 10, '2026-10-10');
    assessmentsCreate(userId, 'COMP1531', 'Last day', 10, '2026-10-24');
    assessmentsCreate(userId, 'COMP1531', 'Too far', 10, '2026-10-25');
    const result = deadlinesList(userId, '2026-10-10', 14) as DeadlinesListResponse;
    expect(result.deadlines.map(deadline => deadline.title)).toStrictEqual(['Today', 'Last day']);
  });

  test('marked assessments are hidden', () => {
    coursesCreate(userId, 'COMP1531', 'Software Eng');
    const lab = assessmentsCreate(userId, 'COMP1531', 'Lab 1', 10, '2026-10-20') as { assessmentId: number };
    assessmentsMark(userId, lab.assessmentId, 80);
    expect(deadlinesList(userId, '2026-10-10', 14)).toStrictEqual({ deadlines: [] });
  });

  test.each(['10/10/2026', '2026-13-01', ''])('bad today %s', (today) => {
    expect(deadlinesList(userId, today, 14)).toStrictEqual({ error: expect.any(String) });
  });

  test.each([-1, 1.5, NaN])('bad days %s', (days) => {
    expect(deadlinesList(userId, '2026-10-10', days)).toStrictEqual({ error: expect.any(String) });
  });

  test('only shows your own deadlines', () => {
    const other = authRegister('other@gmail.com', 'password123') as { token: string };
    const otherId = findUserIdByToken(other.token) as number;
    coursesCreate(userId, 'COMP1531', 'Software Eng');
    coursesCreate(otherId, 'MATH1131', 'Maths 1A');
    assessmentsCreate(userId, 'COMP1531', 'Lab 1', 10, '2026-10-20');
    assessmentsCreate(otherId, 'MATH1131', 'Quiz 1', 5, '2026-10-12');
    const result = deadlinesList(userId, '2026-10-10', 14) as DeadlinesListResponse;
    expect(result.deadlines.map(deadline => deadline.code)).toStrictEqual(['COMP1531']);
  });
});
