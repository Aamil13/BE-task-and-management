import { connectDB } from './config/db';
import app from './app';

// Connect DB once per cold start (Vercel reuses warm instances)
connectDB();

export default app;
