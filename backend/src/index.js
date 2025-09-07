import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { initFirebase } from './services/firebaseService.js';
import authRoutes from './routes/auth.js';
import sosRoutes from './routes/sos.js';
import chatRoutes from './routes/chat.js';
import adminRoutes from './routes/admin.js';
import { notFound, errorHandler } from './utils/errorHandler.js';

dotenv.config();
initFirebase();

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

app.get('/health', (req,res)=>res.json({ status: 'ok'}));

app.use('/api/auth', authRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 4000;
const host = process.env.HOST || '0.0.0.0'; // Listen on all network interfaces

app.listen(port, host, () => {
  console.log(`ResQlinK backend listening on ${host}:${port}`);
  console.log('Server accessible from:');
  console.log(`- Local: http://localhost:${port}`);
  console.log(`- Network: http://10.9.82.19:${port}`);
  console.log('Make sure Windows Firewall allows Node.js if connecting from mobile device');
});
