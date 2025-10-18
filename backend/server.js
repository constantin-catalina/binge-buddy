import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import { inngest, functions } from './inngest/index.js';
import { serve } from 'inngest/express';

const app = express();
const port = 3000;

await connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware())

// API routes
app.get('/', (req, res) => res.send('Server is running!'))
app.use('/api/inngest', serve({ client: inngest, functions }));

app.listen(port, () => console.log(`Server listening at http://localhost:${port}`));