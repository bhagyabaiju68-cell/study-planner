import { beforeEach, describe, expect, test } from 'vitest';
import {
  clearData, coursesCreate, coursesList, coursesDelete,
  assessmentsCreate, assessmentsList, assessmentsMark, deadlinesList
} from '../interface.ts';

beforeEach(() => {
  clearData();
});

describe('coursesDelete', () => {
  test('course does not exist', () => {
    expect(coursesDelete('COMP1531')).toStrictEqual({ error: expect.any(String) });
  });

  test('removes only that course', () => {
    coursesCreate('COMP1531', 'Software Eng');
    coursesCreate('MATH1131', 'Maths 1A');
    expect(coursesDelete('COMP1531')).toStrictEqual({});
    expect(coursesList()).toStrictEqual({ courses: [{ code: 'MATH1131', name: 'Maths 1A' }] });
  });

  test('its assessments are gone too', () => {
    coursesCreate('COMP1531', 'Software Eng');
    const lab = assessmentsCreate('COMP1531', 'Lab 1', 10, '2026-10-20') as { assessmentId: number };
    coursesDelete('COMP1531');
    expect(assessmentsList('COMP1531')).toStrictEqual({ error: expect.any(String) });
    expect(assessmentsMark(lab.assessmentId, 80)).toStrictEqual({ error: expect.any(String) });
    expect(deadlinesList('2026-10-10', 14)).toStrictEqual({ deadlines: [] });
  });

  test('code can be added again after deleting', () => {
    coursesCreate('COMP1531', 'Software Eng');
    coursesDelete('COMP1531');
    expect(coursesCreate('COMP1531', 'Software Eng')).toStrictEqual({ code: 'COMP1531' });
  });

  test('deleting twice gives an error', () => {
    coursesCreate('COMP1531', 'Software Eng');
    coursesDelete('COMP1531');
    expect(coursesDelete('COMP1531')).toStrictEqual({ error: expect.any(String) });
  });
});
