import { beforeEach, describe, expect, test } from 'vitest';
import { clearData, coursesCreate, coursesGrade, assessmentsCreate, assessmentsList, assessmentsMark, authRegister } from '../interface.ts';
import { findUserIdByToken } from '../functions/helpers.ts';

let userId: number;
let labId: number;

beforeEach(() => {
  clearData();
  const register = authRegister('hello@gmail.com', 'password123') as { token: string };
  userId = findUserIdByToken(register.token) as number;
  coursesCreate(userId, 'COMP1531', 'Software Eng');
  const lab = assessmentsCreate(userId, 'COMP1531', 'Lab 1', 10, '2026-10-20') as { assessmentId: number };
  labId = lab.assessmentId;
});

describe('assessmentsMark', () => {
  test('sets the mark', () => {
    expect(assessmentsMark(userId, labId, 80)).toStrictEqual({});
    expect(assessmentsList(userId, 'COMP1531')).toStrictEqual({
      assessments: [{ assessmentId: labId, title: 'Lab 1', weight: 10, due: '2026-10-20', mark: 80 }],
    });
  });

  test('can change a mark', () => {
    assessmentsMark(userId, labId, 50);
    assessmentsMark(userId, labId, 90);
    expect(coursesGrade(userId, 'COMP1531')).toStrictEqual({ earned: 9, markedWeight: 10, average: 90 });
  });

  test('assessment does not exist', () => {
    expect(assessmentsMark(userId, labId + 1, 80)).toStrictEqual({ error: expect.any(String) });
  });

  test.each([-1, 101, NaN])('mark %s out of range', (mark) => {
    expect(assessmentsMark(userId, labId, mark)).toStrictEqual({ error: expect.any(String) });
  });

  test.each([0, 100])('mark %i is ok', (mark) => {
    expect(assessmentsMark(userId, labId, mark)).toStrictEqual({});
  });

  test('cannot mark another users assessment', () => {
    const other = authRegister('other@gmail.com', 'password123') as { token: string };
    const otherId = findUserIdByToken(other.token) as number;
    expect(assessmentsMark(otherId, labId, 80)).toStrictEqual({ error: expect.any(String) });
    expect(coursesGrade(userId, 'COMP1531')).toStrictEqual({ earned: 0, markedWeight: 0, average: null });
  });
});
