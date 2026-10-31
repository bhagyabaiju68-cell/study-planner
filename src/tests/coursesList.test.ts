import { beforeEach, describe, expect, test } from 'vitest';
import { authRegister, clearData, coursesCreate, coursesList } from '../interface.ts';
import { findUserIdByToken } from '../functions/helpers.ts';

let userId: number;

beforeEach(() => {
  clearData();
  const register = authRegister('hello@gmail.com', 'password123') as { token: string };
  userId = findUserIdByToken(register.token) as number;
});

describe('coursesList', () => {
  test('empty list', () => {
    expect(coursesList(userId)).toStrictEqual({ courses: [] });
  });

  test('lists in order', () => {
    coursesCreate(userId, 'COMP1531', 'Software Eng');
    coursesCreate(userId, 'MATH1131', 'Maths 1A');
    expect(coursesList(userId)).toStrictEqual({
      courses: [
        { code: 'COMP1531', name: 'Software Eng' },
        { code: 'MATH1131', name: 'Maths 1A' },
      ],
    });
  });

  test('failed create is not listed', () => {
    coursesCreate(userId, 'COMP1531', 'Software Eng');
    coursesCreate(userId, 'COMP15', 'Too short');
    expect(coursesList(userId)).toStrictEqual({ courses: [{ code: 'COMP1531', name: 'Software Eng' }] });
  });

  test('does not show other users courses', () => {
    const other = authRegister('other@gmail.com', 'password123') as { token: string };
    const otherId = findUserIdByToken(other.token) as number;
    coursesCreate(userId, 'COMP1531', 'Software Eng');
    coursesCreate(otherId, 'MATH1131', 'Maths 1A');
    expect(coursesList(userId)).toStrictEqual({ courses: [{ code: 'COMP1531', name: 'Software Eng' }] });
    expect(coursesList(otherId)).toStrictEqual({ courses: [{ code: 'MATH1131', name: 'Maths 1A' }] });
  });
});
