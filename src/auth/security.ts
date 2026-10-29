import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

const SCRYPT_KEYLEN = 64;
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

// Generate an ephemeral fallback secret per process if AUTH_SECRET is not provided in .env
const EPHEMERAL_FALLBACK_SECRET = crypto.randomBytes(32).toString('hex');

function getSigningSecret(): string {
  const envSecret = process.env.AUTH_SECRET?.trim();
  return envSecret && envSecret.length >= 16 ? envSecret : EPHEMERAL_FALLBACK_SECRET;
}

/**
 * Hashes a plain-text password using Node.js native crypto.scryptSync with a random 16-byte salt.
 * Never stores plain-text passwords.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex');
  return `scrypt$${salt}$${derivedKey}`;
}

/**
 * Verifies a plain-text password against a stored scrypt hash using constant-time comparison.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split('$');
    if (parts.length !== 3 || parts[0] !== 'scrypt') {
      return false;
    }
    const [, salt, originalHashHex] = parts;
    const derivedBuffer = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
    const originalBuffer = Buffer.from(originalHashHex, 'hex');
    if (derivedBuffer.length !== originalBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(derivedBuffer, originalBuffer);
  } catch {
    return false;
  }
}

export interface SessionPayload {
  sub: number;
  username: string;
  role: 'admin';
  exp: number;
}

/**
 * Creates an HMAC-SHA256 signed session token for an authenticated administrator.
 */
export function createAdminToken(admin: { id: number; username: string }): string {
  const payload: SessionPayload = {
    sub: admin.id,
    username: admin.username,
    role: 'admin',
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const payloadBase64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSigningSecret())
    .update(payloadBase64)
    .digest('base64url');
  return `${payloadBase64}.${signature}`;
}

/**
 * Verifies an HMAC-SHA256 signed session token and checks expiration.
 */
export function verifyAdminToken(token: string | undefined | null): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadBase64, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', getSigningSecret())
    .update(payloadBase64)
    .digest('base64url');

  const sigBuf = Buffer.from(signature, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(payloadBase64, 'base64url').toString('utf8')
    ) as SessionPayload;

    if (!payload || payload.role !== 'admin' || typeof payload.exp !== 'number') {
      return null;
    }
    if (Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Extracts session token from Authorization header (`Bearer <token>`) or `meudoce_session` cookie.
 */
export function extractTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    for (const c of cookies) {
      if (c.startsWith('meudoce_session=')) {
        return decodeURIComponent(c.slice('meudoce_session='.length));
      }
    }
  }
  return null;
}

/**
 * Express middleware that enforces administrator authentication & authorization.
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractTokenFromRequest(req);
  const session = verifyAdminToken(token);

  if (!session) {
    return res.status(401).json({
      error: 'Acesso não autorizado. Faça login como administrador para realizar esta ação.',
    });
  }

  (req as any).adminUser = {
    id: session.sub,
    username: session.username,
  };
  next();
}
