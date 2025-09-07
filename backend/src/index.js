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
app.listen(port, () => console.log(`ResQlinK backend listening on :${port}`));
