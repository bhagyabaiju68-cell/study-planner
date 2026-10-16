import { beforeEach, describe, expect, test } from 'vitest';
import { clearData, coursesCreate, assessmentsCreate, assessmentsMark, deadlinesList } from '../interface.ts';
import type { DeadlinesListResponse } from '../functions/types.ts';

beforeEach(() => {
  clearData();
});

describe('deadlinesList', () => {
  test('no assessments', () => {
    expect(deadlinesList('2026-10-10', 14)).toStrictEqual({ deadlines: [] });
  });

  test('soonest first, across courses', () => {
    coursesCreate('COMP1531', 'Software Eng');
    coursesCreate('MATH1131', 'Maths 1A');
    const lab = assessmentsCreate('COMP1531', 'Lab 1', 10, '2026-10-20') as { assessmentId: number };
    const quiz = assessmentsCreate('MATH1131', 'Quiz 1', 5, '2026-10-12') as { assessmentId: number };
    expect(deadlinesList('2026-10-10', 14)).toStrictEqual({
      deadlines: [
        { code: 'MATH1131', assessmentId: quiz.assessmentId, title: 'Quiz 1', weight: 5, due: '2026-10-12', daysLeft: 2 },
        { code: 'COMP1531', assessmentId: lab.assessmentId, title: 'Lab 1', weight: 10, due: '2026-10-20', daysLeft: 10 },
      ],
    });
  });

  test('same day sorts by course code', () => {
    coursesCreate('MATH1131', 'Maths 1A');
    coursesCreate('COMP1531', 'Software Eng');
    coursesCreate('PHYS1121', 'Physics 1A');
    assessmentsCreate('MATH1131', 'Quiz 1', 5, '2026-10-12');
    assessmentsCreate('COMP1531', 'Lab 1', 10, '2026-10-12');
    assessmentsCreate('PHYS1121', 'Lab 1', 10, '2026-10-12');
    const result = deadlinesList('2026-10-10', 14) as DeadlinesListResponse;
    expect(result.deadlines.map(deadline => deadline.code)).toStrictEqual(['COMP1531', 'MATH1131', 'PHYS1121']);
  });

  test('due today counts, past and too far do not', () => {
    coursesCreate('COMP1531', 'Software Eng');
    assessmentsCreate('COMP1531', 'Past', 10, '2026-10-09');
    assessmentsCreate('COMP1531', 'Today', 10, '2026-10-10');
    assessmentsCreate('COMP1531', 'Last day', 10, '2026-10-24');
    assessmentsCreate('COMP1531', 'Too far', 10, '2026-10-25');
    const result = deadlinesList('2026-10-10', 14) as DeadlinesListResponse;
    expect(result.deadlines.map(deadline => deadline.title)).toStrictEqual(['Today', 'Last day']);
  });

  test('marked assessments are hidden', () => {
    coursesCreate('COMP1531', 'Software Eng');
    const lab = assessmentsCreate('COMP1531', 'Lab 1', 10, '2026-10-20') as { assessmentId: number };
    assessmentsMark(lab.assessmentId, 80);
    expect(deadlinesList('2026-10-10', 14)).toStrictEqual({ deadlines: [] });
  });

  test.each(['10/10/2026', '2026-13-01', ''])('bad today %s', (today) => {
    expect(deadlinesList(today, 14)).toStrictEqual({ error: expect.any(String) });
  });

  test.each([-1, 1.5, NaN])('bad days %s', (days) => {
    expect(deadlinesList('2026-10-10', days)).toStrictEqual({ error: expect.any(String) });
  });
});
