import { validate, sosSchema } from '../utils/validators.js';
import { addSOSMessage, getNearbySOS } from '../models/messageModel.js';

export async function postSOS(req, res, next) {
  try {
    const data = validate(sosSchema, req.body);
    if (req.user.uid !== data.userId) {
      return res.status(403).json({ error: true, message: 'userId mismatch' });
    }
    const saved = await addSOSMessage(data);
    res.status(201).json(saved);
  } catch (err) { next(err); }
}

export async function getNearby(req, res, next) {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseFloat(req.query.radius || '5');
    if ([lat,lng].some(Number.isNaN)) return res.status(400).json({ error: true, message: 'lat,lng required'});
    const list = await getNearbySOS(lat, lng, radius);
    res.json({ count: list.length, messages: list });
  } catch (err) { next(err); }
}
