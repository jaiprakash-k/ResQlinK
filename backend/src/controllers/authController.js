import { getAuth } from '../services/firebaseService.js';

export async function anonymousLogin(req, res, next) {
  try {
    // In a real flow, client would use Firebase client SDK. Here we mint a custom token.
    const uid = `anon_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    await getAuth().createUser({ uid }).catch(()=>{}); // ignore if exists
    const customToken = await getAuth().createCustomToken(uid);
    res.json({ token: customToken, uid, anonymous: true });
  } catch (err) {
    next(err);
  }
}

export async function emailLogin(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: true, message: 'Email required'});
    // For hackathon simplicity: ensure user exists then create custom token (no password flow here)
    const auth = getAuth();
    let user; try { user = await auth.getUserByEmail(email); } catch { /* ignore */ }
    if (!user) {
      user = await auth.createUser({ email });
    }
    const token = await auth.createCustomToken(user.uid);
    res.json({ token, uid: user.uid, email });
  } catch (err) {
    next(err);
  }
}
