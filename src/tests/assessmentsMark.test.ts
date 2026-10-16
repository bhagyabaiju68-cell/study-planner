import { beforeEach, describe, expect, test } from 'vitest';
import { clearData, coursesCreate, coursesGrade, assessmentsCreate, assessmentsList, assessmentsMark } from '../interface.ts';

let labId: number;

beforeEach(() => {
  clearData();
  coursesCreate('COMP1531', 'Software Eng');
  const lab = assessmentsCreate('COMP1531', 'Lab 1', 10, '2026-10-20') as { assessmentId: number };
  labId = lab.assessmentId;
});

describe('assessmentsMark', () => {
  test('sets the mark', () => {
    expect(assessmentsMark(labId, 80)).toStrictEqual({});
    expect(assessmentsList('COMP1531')).toStrictEqual({
      assessments: [{ assessmentId: labId, title: 'Lab 1', weight: 10, due: '2026-10-20', mark: 80 }],
    });
  });

  test('can change a mark', () => {
    assessmentsMark(labId, 50);
    assessmentsMark(labId, 90);
    expect(coursesGrade('COMP1531')).toStrictEqual({ earned: 9, markedWeight: 10, average: 90 });
  });

  test('assessment does not exist', () => {
    expect(assessmentsMark(labId + 1, 80)).toStrictEqual({ error: expect.any(String) });
  });

  test.each([-1, 101, NaN])('mark %s out of range', (mark) => {
    expect(assessmentsMark(labId, mark)).toStrictEqual({ error: expect.any(String) });
  });

  test.each([0, 100])('mark %i is ok', (mark) => {
    expect(assessmentsMark(labId, mark)).toStrictEqual({});
  });
});
