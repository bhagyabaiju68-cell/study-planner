import { beforeEach, describe, expect, test } from 'vitest';
import { clearData, coursesCreate, assessmentsCreate, assessmentsList } from '../interface.ts';

beforeEach(() => {
  clearData();
});

describe('assessmentsList', () => {
  test('course does not exist', () => {
    expect(assessmentsList('COMP1531')).toStrictEqual({ error: expect.any(String) });
  });

  test('empty list', () => {
    coursesCreate('COMP1531', 'Software Eng');
    expect(assessmentsList('COMP1531')).toStrictEqual({ assessments: [] });
  });

  test('lists in order', () => {
    coursesCreate('COMP1531', 'Software Eng');
    const lab = assessmentsCreate('COMP1531', 'Lab 1', 10, '2026-10-20') as { assessmentId: number };
    const exam = assessmentsCreate('COMP1531', 'Exam', 60, '2026-11-30') as { assessmentId: number };
    expect(assessmentsList('COMP1531')).toStrictEqual({
      assessments: [
        { assessmentId: lab.assessmentId, title: 'Lab 1', weight: 10, due: '2026-10-20', mark: null },
        { assessmentId: exam.assessmentId, title: 'Exam', weight: 60, due: '2026-11-30', mark: null },
      ],
    });
  });

  test('only lists that course', () => {
    coursesCreate('COMP1531', 'Software Eng');
    coursesCreate('MATH1131', 'Maths 1A');
    assessmentsCreate('MATH1131', 'Quiz 1', 5, '2026-10-12');
    expect(assessmentsList('COMP1531')).toStrictEqual({ assessments: [] });
  });
});
