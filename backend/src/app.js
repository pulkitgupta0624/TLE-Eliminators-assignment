import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './config/database.js';
import { config } from './config/environment.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import sessionService from './services/session.service.js';

const app = express();

app.set('trust proxy', 1);

// Connect to database
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use(errorHandler);

// Cleanup job - runs every hour
setInterval(async () => {
  await sessionService.cleanupExpiredSessions();
}, 60 * 60 * 1000);

// // Initial cleanup
// sessionService.cleanupExpiredSessions();

// // Start server
// app.listen(config.port, () => {
//   console.log(`✅ Server running on port ${config.port}`);
//   console.log(`📝 Environment: ${config.nodeEnv}`);
// });

const startServer = async () => {
  try {
    // 1. Wait for Database Connection
    await connectDB();
    
    // 2. Start Listening
    app.listen(config.port, () => {
      console.log(`✅ Server running on port ${config.port}`);
      console.log(`📝 Environment: ${config.nodeEnv}`);
      
      // 3. Run Initial Cleanup (Now safe because DB is connected)
      sessionService.cleanupExpiredSessions();
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;