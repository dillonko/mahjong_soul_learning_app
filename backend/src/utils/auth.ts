import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const TOKEN_EXPIRY = '7d';
const GUEST_EXPIRY_HOURS = 72;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: { userId?: number; guestId?: number; isGuest: boolean }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): { userId?: number; guestId?: number; isGuest: boolean } {
  return jwt.verify(token, JWT_SECRET) as { userId?: number; guestId?: number; isGuest: boolean };
}

export function generateSessionToken(): string {
  return uuidv4();
}

export function getGuestExpiryDate(): Date {
  return new Date(Date.now() + GUEST_EXPIRY_HOURS * 60 * 60 * 1000);
}
