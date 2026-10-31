import { beforeEach, describe, expect, test } from 'vitest';
import { authRegister, clearData, coursesCreate } from '../interface.ts';
import { findUserIdByToken } from '../functions/helpers.ts';

let userId: number;

beforeEach(() => {
  clearData();
  const register = authRegister('hello@gmail.com', 'password123') as { token: string };
  userId = findUserIdByToken(register.token) as number;
});

describe('coursesCreate', () => {
  test('returns the code', () => {
    expect(coursesCreate(userId, 'COMP1531', 'Software Eng')).toStrictEqual({ code: 'COMP1531' });
  });

  test('code is not 8 characters', () => {
    expect(coursesCreate(userId, 'COMP15', 'Software Eng')).toStrictEqual({ error: expect.any(String) });
  });

  test('empty name', () => {
    expect(coursesCreate(userId, 'COMP1531', '')).toStrictEqual({ error: expect.any(String) });
  });

  test('duplicate code', () => {
    coursesCreate(userId, 'COMP1531', 'Software Eng');
    expect(coursesCreate(userId, 'COMP1531', 'Software Eng')).toStrictEqual({ error: expect.any(String) });
  });

  test('two users can both have the same course', () => {
    const other = authRegister('other@gmail.com', 'password123') as { token: string };
    const otherId = findUserIdByToken(other.token) as number;
    coursesCreate(userId, 'COMP1531', 'Software Eng');
    expect(coursesCreate(otherId, 'COMP1531', 'Software Eng')).toStrictEqual({ code: 'COMP1531' });
  });
});
