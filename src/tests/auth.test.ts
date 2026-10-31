import { beforeEach, describe, expect, test } from 'vitest';
import { clearData, authRegister, authLogin, authLogout } from '../interface.ts';
import { data } from '../dataStore.ts';

beforeEach(() => {
  clearData();
});

describe('authRegister', () => {
  test('returns a token', () => {
    expect(authRegister('helloworld@gmail.com', 'password123')).toStrictEqual({ token: expect.any(String) });
  });
  test('email without @', () => {
    expect(authRegister('helloworld.com', 'password123')).toStrictEqual({ error: expect.any(String) });
  });
  test('password less than 10 characters', () => {
    expect(authRegister('hello@gmail.com', 'pass123')).toStrictEqual({ error: expect.any(String) });
  });
  test('password exactly 10 characters', () => {
    expect(authRegister('helloworld@gmail.com', 'password12')).toStrictEqual({ token: expect.any(String) });
  });
  test('email already exists', () => {
    authRegister('helloworld@gmail.com', 'password123');
    expect(authRegister('helloworld@gmail.com', 'password321')).toStrictEqual({ error: expect.any(String) });
  });
  test('email already exists in different case', () => {
    authRegister('helloworld@gmail.com', 'password123');
    expect(authRegister('HelloWorld@gmail.com', 'password321')).toStrictEqual({ error: expect.any(String) });
  });
  test('password not stored as plain text', () => {
    authRegister('helloworld@gmail.com', 'password123');
    expect(data.users[0].passwordHash).not.toStrictEqual('password123');
  });
});

describe('authLogin', () => {
  test('correct email and password returns a token', () => {
    authRegister('helloworld@gmail.com', 'password123');
    expect(authLogin('helloworld@gmail.com', 'password123')).toStrictEqual({ token: expect.any(String) });
  });
  test('email in different case still works', () => {
    authRegister('helloworld@gmail.com', 'password123');
    expect(authLogin('HelloWorld@gmail.com', 'password123')).toStrictEqual({ token: expect.any(String) });
  });
  test('incorrect password', () => {
    authRegister('helloworld@gmail.com', 'password123');
    expect(authLogin('helloworld@gmail.com', 'password321')).toStrictEqual({ error: expect.any(String) });
  });
  test('invalid email', () => {
    authRegister('helloworld@gmail.com', 'password123');
    expect(authLogin('hello@gmail.com', 'password123')).toStrictEqual({ error: expect.any(String) });
  });
  test('logging in twice gives different tokens', () => {
    authRegister('helloworld@gmail.com', 'password123');
    const login1 = authLogin('helloworld@gmail.com', 'password123');
    const login2 = authLogin('helloworld@gmail.com', 'password123');
    expect(login1).not.toStrictEqual(login2);
  });
  test('register token and login token are different', () => {
    const register = authRegister('helloworld@gmail.com', 'password123');
    const login = authLogin('helloworld@gmail.com', 'password123');
    expect(register).not.toStrictEqual(login);
  });
});

describe('authLogout', () => {
  test('valid token returns empty object', () => {
    const register = authRegister('helloworld@gmail.com', 'password123');
    if ('error' in register) {
      throw new Error('register failed');
    }
    expect(authLogout(register.token)).toStrictEqual({});
  });
  test('logging out twice with the same token', () => {
    const register = authRegister('helloworld@gmail.com', 'password123');
    if ('error' in register) {
      throw new Error('register failed');
    }
    authLogout(register.token);
    expect(authLogout(register.token)).toStrictEqual({ error: expect.any(String) });
  });
  test('non-existent token', () => {
    expect(authLogout('doesnotexit')).toStrictEqual({ error: expect.any(String) });
  });
  test('logging out one session keeps the other', () => {
    const register = authRegister('helloworld@gmail.com', 'password123');
    const login = authLogin('helloworld@gmail.com', 'password123');
    if ('error' in register || 'error' in login) {
      throw new Error('setup failed');
    }
    authLogout(register.token);
    expect(authLogout(login.token)).toStrictEqual({});
  });
});
