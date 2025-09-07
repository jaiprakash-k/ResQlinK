import { getAuth } from '../services/firebaseService.js';

const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: true, message: 'Missing Bearer token' });
    }
    const decoded = await getAuth().verifyIdToken(token);
    req.user = decoded; // uid, email
    next();
  } catch (err) {
    return res.status(401).json({ error: true, message: 'Invalid or expired token' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user && req.user.email && adminEmails.includes(req.user.email)) {
    return next();
  }
  return res.status(403).json({ error: true, message: 'Forbidden' });
}
