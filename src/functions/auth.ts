import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { data } from '../dataStore.ts';
import type { ErrorResponse, EmptyObject, AuthResponse } from './types.ts';

export function authRegister(email: string, password: string): AuthResponse | ErrorResponse {
  email = email.toLowerCase();
  if (!email.includes('@')) {
    return { error: 'Email is not valid' };
  }
  if (password.length < 10) {
    return { error: 'Password must be at least 10 characters long' };
  }
  for (const user of data.users) {
    if (user.email === email) {
      return { error: 'Email is already registered' };
    }
  }
  const userId = data.nextUserId;
  data.nextUserId++;
  data.users.push({ userId: userId, email: email, passwordHash: bcrypt.hashSync(password, 10) });

  const token = crypto.randomUUID();
  data.sessions.push({ token: token, userId: userId });
  return { token: token };
}

export function authLogin(email: string, password: string): AuthResponse | ErrorResponse {
  email = email.toLowerCase();
  for (const user of data.users) {
    if (user.email === email) {
      if (!bcrypt.compareSync(password, user.passwordHash)) {
        return { error: 'Email or password is incorrect' };
      }
      const token = crypto.randomUUID();
      data.sessions.push({ token: token, userId: user.userId });
      return { token: token };
    }
  }
  return { error: 'Email or password is incorrect' };
}

export function authLogout(token: string): EmptyObject | ErrorResponse {
  for (const session of data.sessions) {
    if (session.token === token) {
      data.sessions = data.sessions.filter(s => s.token !== token);
      return {};
    }
  }
  return { error: 'Token is not valid' };
}
