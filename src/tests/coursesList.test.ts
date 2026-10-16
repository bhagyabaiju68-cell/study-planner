import { beforeEach, describe, expect, test } from 'vitest';
import { clearData, coursesCreate, coursesList } from '../interface.ts';

beforeEach(() => {
  clearData();
});

describe('coursesList', () => {
  test('empty list', () => {
    expect(coursesList()).toStrictEqual({ courses: [] });
  });

  test('lists in order', () => {
    coursesCreate('COMP1531', 'Software Eng');
    coursesCreate('MATH1131', 'Maths 1A');
    expect(coursesList()).toStrictEqual({
      courses: [
        { code: 'COMP1531', name: 'Software Eng' },
        { code: 'MATH1131', name: 'Maths 1A' },
      ],
    });
  });

  test('failed create is not listed', () => {
    coursesCreate('COMP1531', 'Software Eng');
    coursesCreate('COMP15', 'Too short');
    expect(coursesList()).toStrictEqual({ courses: [{ code: 'COMP1531', name: 'Software Eng' }] });
  });
});
