import { beforeEach, describe, expect, test } from 'vitest';
import { clearData, coursesCreate, assessmentsCreate } from '../interface.ts';

beforeEach(() => {
  clearData();
  coursesCreate('COMP1531', 'Software Eng');
});

describe('assessmentsCreate', () => {
  test('returns an id', () => {
    expect(assessmentsCreate('COMP1531', 'Lab 1', 10, '2026-10-20')).toStrictEqual({ assessmentId: expect.any(Number) });
  });

  test('ids are different', () => {
    const lab1 = assessmentsCreate('COMP1531', 'Lab 1', 10, '2026-10-20');
    const lab2 = assessmentsCreate('COMP1531', 'Lab 2', 10, '2026-10-27');
    expect(lab1).not.toStrictEqual(lab2);
  });

  test('course does not exist', () => {
    expect(assessmentsCreate('MATH1131', 'Quiz', 10, '2026-10-20')).toStrictEqual({ error: expect.any(String) });
  });

  test('empty title', () => {
    expect(assessmentsCreate('COMP1531', '', 10, '2026-10-20')).toStrictEqual({ error: expect.any(String) });
  });

  test.each([0, 101, -5])('weight %i out of range', (weight) => {
    expect(assessmentsCreate('COMP1531', 'Lab 1', weight, '2026-10-20')).toStrictEqual({ error: expect.any(String) });
  });

  test('total weight over 100', () => {
    assessmentsCreate('COMP1531', 'Exam', 60, '2026-11-30');
    expect(assessmentsCreate('COMP1531', 'Project', 50, '2026-11-15')).toStrictEqual({ error: expect.any(String) });
  });

  test('total weight exactly 100 is ok', () => {
    assessmentsCreate('COMP1531', 'Exam', 60, '2026-11-30');
    expect(assessmentsCreate('COMP1531', 'Project', 40, '2026-11-15')).toStrictEqual({ assessmentId: expect.any(Number) });
  });

  test.each(['20/10/2026', '10/10/2026', '2026-13-01', 'tomorrow'])('bad due date %s', (due) => {
    expect(assessmentsCreate('COMP1531', 'Lab 1', 10, due)).toStrictEqual({ error: expect.any(String) });
  });
});
