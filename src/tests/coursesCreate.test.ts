import { beforeEach, describe, expect, test } from 'vitest';
import { clearData, coursesCreate } from '../interface.ts';

beforeEach(() => {
  clearData();
});

describe('coursesCreate', () => {
  test('returns the code', () => {
    expect(coursesCreate('COMP1531', 'Software Eng')).toStrictEqual({ code: 'COMP1531' });
  });

  test('code is not 8 characters', () => {
    expect(coursesCreate('COMP15', 'Software Eng')).toStrictEqual({ error: expect.any(String) });
  });

  test('empty name', () => {
    expect(coursesCreate('COMP1531', '')).toStrictEqual({ error: expect.any(String) });
  });

  test('duplicate code', () => {
    coursesCreate('COMP1531', 'Software Eng');
    expect(coursesCreate('COMP1531', 'Software Eng')).toStrictEqual({ error: expect.any(String) });
  });
});
