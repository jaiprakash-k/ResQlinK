import { getFirestore } from '../services/firebaseService.js';

const db = getFirestore();

export const SOS_COLLECTION = 'SOSMessages';
export const CHAT_COLLECTION = 'ChatMessages';

export async function addSOSMessage(data) {
  const ref = await db.collection(SOS_COLLECTION).add(data);
  return { id: ref.id, ...data };
}

export async function getNearbySOS(lat, lng, radiusKm = 5) {
  // Firestore doesn't support geo radius natively; placeholder simple fetch + filter.
  const snap = await db.collection(SOS_COLLECTION)
    .orderBy('timestamp', 'desc')
    .limit(500)
    .get();
  const R = 6371; // km
  const toRad = d => d * Math.PI / 180;
  const results = [];
  snap.forEach(doc => {
    const d = doc.data();
    const dLat = toRad(d.lat - lat);
    const dLng = toRad(d.lng - lng);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat))*Math.cos(toRad(d.lat))*Math.sin(dLng/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const dist = R * c;
    if (dist <= radiusKm) {
      results.push({ id: doc.id, ...d, distanceKm: dist });
    }
  });
  return results.sort((a,b)=>a.distanceKm-b.distanceKm);
}

export async function addChatMessages(messages) {
  const batch = db.batch();
  const out = [];
  messages.forEach(m => {
    const ref = db.collection(CHAT_COLLECTION).doc(m.id || undefined);
    batch.set(ref, m, { merge: true });
    out.push({ id: ref.id, ...m });
  });
  await batch.commit();
  return out;
}

export async function getAllMessages() {
  const sosSnap = await db.collection(SOS_COLLECTION).orderBy('timestamp','desc').limit(1000).get();
  const chatSnap = await db.collection(CHAT_COLLECTION).orderBy('timestamp','desc').limit(1000).get();
  return {
    sos: sosSnap.docs.map(d=>({ id: d.id, ...d.data() })),
    chat: chatSnap.docs.map(d=>({ id: d.id, ...d.data() })),
  };
}
