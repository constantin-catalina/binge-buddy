import express from "express";
import cors from "cors";
import 'dotenv/config';
import connectDB from "./configs/db.js";

import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import showRouter from "./routes/showRoutes.js";
import tvRouter from "./routes/tvRoutes.js";
import discoverRoutes from "./routes/discoverRoutes.js";
import searchRoutes from "./routes/search.js";

const app = express();
const PORT = 3000;

await connectDB();

// Middleware
app.use(express.json());
app.use(cors());
const middleware = clerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
});

app.use(middleware);
// API Routes
app.get('/', (req, res) => {  
    res.send('Server is running!');  
}); 

app.use('/api/inngest', serve({ client: inngest, functions }))

app.use('/api/show', showRouter);

app.use('/api/tv', tvRouter);

app.use('/api/discover', discoverRoutes);

app.use('/api/search', searchRoutes);

app.listen(PORT, () => {  
    console.log(`Server is running on http://localhost:${PORT}`);  
});  