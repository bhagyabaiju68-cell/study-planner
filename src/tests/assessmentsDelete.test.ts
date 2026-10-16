import { beforeEach, describe, expect, test } from 'vitest';
import {
  clearData, coursesCreate, coursesGrade,
  assessmentsCreate, assessmentsList, assessmentsMark, assessmentsDelete
} from '../interface.ts';

beforeEach(() => {
  clearData();
});

describe('assessmentsDelete', () => {
  test('assessment does not exist', () => {
    expect(assessmentsDelete(1)).toStrictEqual({ error: expect.any(String) });
  });

  test('removes only that assessment', () => {
    coursesCreate('COMP1531', 'Software Eng');
    const lab = assessmentsCreate('COMP1531', 'Lab 1', 10, '2026-10-20') as { assessmentId: number };
    const exam = assessmentsCreate('COMP1531', 'Exam', 60, '2026-11-30') as { assessmentId: number };
    expect(assessmentsDelete(lab.assessmentId)).toStrictEqual({});
    expect(assessmentsList('COMP1531')).toStrictEqual({
      assessments: [{ assessmentId: exam.assessmentId, title: 'Exam', weight: 60, due: '2026-11-30', mark: null }],
    });
  });

  test('frees up its weight', () => {
    coursesCreate('COMP1531', 'Software Eng');
    const exam = assessmentsCreate('COMP1531', 'Exam', 100, '2026-11-30') as { assessmentId: number };
    assessmentsDelete(exam.assessmentId);
    expect(assessmentsCreate('COMP1531', 'Exam', 60, '2026-11-30')).toStrictEqual({ assessmentId: expect.any(Number) });
  });

  test('grade no longer counts it', () => {
    coursesCreate('COMP1531', 'Software Eng');
    const lab = assessmentsCreate('COMP1531', 'Lab 1', 10, '2026-10-20') as { assessmentId: number };
    const project = assessmentsCreate('COMP1531', 'Project', 30, '2026-11-15') as { assessmentId: number };
    assessmentsMark(lab.assessmentId, 80);
    assessmentsMark(project.assessmentId, 70);
    assessmentsDelete(lab.assessmentId);
    expect(coursesGrade('COMP1531')).toStrictEqual({ earned: 21, markedWeight: 30, average: 70 });
  });

  test('deleted ids are not reused', () => {
    coursesCreate('COMP1531', 'Software Eng');
    const lab = assessmentsCreate('COMP1531', 'Lab 1', 10, '2026-10-20') as { assessmentId: number };
    assessmentsDelete(lab.assessmentId);
    expect(assessmentsCreate('COMP1531', 'Lab 1', 10, '2026-10-20')).not.toStrictEqual({ assessmentId: lab.assessmentId });
  });
});
