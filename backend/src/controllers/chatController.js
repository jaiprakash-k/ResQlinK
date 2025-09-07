import { validate, chatSyncSchema } from '../utils/validators.js';
import { addChatMessages } from '../models/messageModel.js';

export async function syncChat(req, res, next) {
  try {
    const { messages } = validate(chatSyncSchema, req.body);
    // Ensure user is participant of each message
    const uid = req.user.uid;
    const owned = messages.every(m => m.fromUser === uid || m.toUser === uid);
    if (!owned) return res.status(403).json({ error: true, message: 'Message user mismatch' });
    const saved = await addChatMessages(messages);
    res.status(201).json({ savedCount: saved.length, messages: saved });
  } catch (err) { next(err); }
}
