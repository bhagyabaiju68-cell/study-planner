import { beforeEach, describe, expect, test } from 'vitest';
import { clearData, coursesCreate, coursesGrade, assessmentsCreate, assessmentsMark } from '../interface.ts';

beforeEach(() => {
  clearData();
});

describe('coursesGrade', () => {
  test('course does not exist', () => {
    expect(coursesGrade('COMP1531')).toStrictEqual({ error: expect.any(String) });
  });

  test('nothing marked yet', () => {
    coursesCreate('COMP1531', 'Software Eng');
    assessmentsCreate('COMP1531', 'Lab 1', 10, '2026-10-20');
    expect(coursesGrade('COMP1531')).toStrictEqual({ earned: 0, markedWeight: 0, average: null });
  });

  test('only counts marked assessments', () => {
    coursesCreate('COMP1531', 'Software Eng');
    const lab = assessmentsCreate('COMP1531', 'Lab 1', 10, '2026-10-20') as { assessmentId: number };
    const project = assessmentsCreate('COMP1531', 'Project', 30, '2026-11-15') as { assessmentId: number };
    assessmentsCreate('COMP1531', 'Exam', 60, '2026-11-30');
    assessmentsMark(lab.assessmentId, 80);
    assessmentsMark(project.assessmentId, 70);
    // lab: 10 * 0.8 = 8, project: 30 * 0.7 = 21 -> 29 out of 40 = 72.5%
    expect(coursesGrade('COMP1531')).toStrictEqual({ earned: 29, markedWeight: 40, average: 72.5 });
  });
});
