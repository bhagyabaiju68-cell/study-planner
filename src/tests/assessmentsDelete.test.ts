import { beforeEach, describe, expect, test } from 'vitest';
import {
  clearData, coursesCreate, coursesGrade,
  assessmentsCreate, assessmentsList, assessmentsMark, assessmentsDelete,
  authRegister
} from '../interface.ts';
import { findUserIdByToken } from '../functions/helpers.ts';

let userId: number;

beforeEach(() => {
  clearData();
  const register = authRegister('hello@gmail.com', 'password123') as { token: string };
  userId = findUserIdByToken(register.token) as number;
});

describe('assessmentsDelete', () => {
  test('assessment does not exist', () => {
    expect(assessmentsDelete(userId, 1)).toStrictEqual({ error: expect.any(String) });
  });

  test('removes only that assessment', () => {
    coursesCreate(userId, 'COMP1531', 'Software Eng');
    const lab = assessmentsCreate(userId, 'COMP1531', 'Lab 1', 10, '2026-10-20') as { assessmentId: number };
    const exam = assessmentsCreate(userId, 'COMP1531', 'Exam', 60, '2026-11-30') as { assessmentId: number };
    expect(assessmentsDelete(userId, lab.assessmentId)).toStrictEqual({});
    expect(assessmentsList(userId, 'COMP1531')).toStrictEqual({
      assessments: [{ assessmentId: exam.assessmentId, title: 'Exam', weight: 60, due: '2026-11-30', mark: null }],
    });
  });

  test('frees up its weight', () => {
    coursesCreate(userId, 'COMP1531', 'Software Eng');
    const exam = assessmentsCreate(userId, 'COMP1531', 'Exam', 100, '2026-11-30') as { assessmentId: number };
    assessmentsDelete(userId, exam.assessmentId);
    expect(assessmentsCreate(userId, 'COMP1531', 'Exam', 60, '2026-11-30')).toStrictEqual({ assessmentId: expect.any(Number) });
  });

  test('grade no longer counts it', () => {
    coursesCreate(userId, 'COMP1531', 'Software Eng');
    const lab = assessmentsCreate(userId, 'COMP1531', 'Lab 1', 10, '2026-10-20') as { assessmentId: number };
    const project = assessmentsCreate(userId, 'COMP1531', 'Project', 30, '2026-11-15') as { assessmentId: number };
    assessmentsMark(userId, lab.assessmentId, 80);
    assessmentsMark(userId, project.assessmentId, 70);
    assessmentsDelete(userId, lab.assessmentId);
    expect(coursesGrade(userId, 'COMP1531')).toStrictEqual({ earned: 21, markedWeight: 30, average: 70 });
  });

  test('deleted ids are not reused', () => {
    coursesCreate(userId, 'COMP1531', 'Software Eng');
    const lab = assessmentsCreate(userId, 'COMP1531', 'Lab 1', 10, '2026-10-20') as { assessmentId: number };
    assessmentsDelete(userId, lab.assessmentId);
    expect(assessmentsCreate(userId, 'COMP1531', 'Lab 1', 10, '2026-10-20')).not.toStrictEqual({ assessmentId: lab.assessmentId });
  });

  test('cannot delete another users assessment', () => {
    const other = authRegister('other@gmail.com', 'password123') as { token: string };
    const otherId = findUserIdByToken(other.token) as number;
    coursesCreate(userId, 'COMP1531', 'Software Eng');
    const lab = assessmentsCreate(userId, 'COMP1531', 'Lab 1', 10, '2026-10-20') as { assessmentId: number };
    expect(assessmentsDelete(otherId, lab.assessmentId)).toStrictEqual({ error: expect.any(String) });
    expect(assessmentsList(userId, 'COMP1531')).toStrictEqual({
      assessments: [{ assessmentId: lab.assessmentId, title: 'Lab 1', weight: 10, due: '2026-10-20', mark: null }],
    });
  });
});
