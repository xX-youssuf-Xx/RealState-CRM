import express from 'express';
import type { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';
import {CronService} from './src/services/node-cron';
import { TaskNotificationUtil } from './src/utils/task-notification.util';
import { connectDB } from './src/config/database';
import authRoutes from './src/routes/auth.routes';
import leadRoutes from './src/routes/lead.routes';
import projectRoutes from './src/routes/project.routes';
import unitRoutes from './src/routes/unit.routes'; 
import actionRoutes from './src/routes/action.routes';
import employeeRoutes from './src/routes/employee.routes';
import taskRoutes from './src/routes/task.routes';
import reportRoutes from './src/routes/report.route';
import notificationRoutes from './src/routes/notification.routes';
import whatsappRoutes from './src/routes/whatsapp.routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Important: This serves the uploads directory to make files publicly accessible
app.use('/uploads', express.static(path.join (__dirname, 'uploads')));

// Verify the uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  console.warn('Warning: Uploads directory does not exist at:', uploadsDir);
  // Optionally create it
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/whatsapp', whatsappRoutes);




// Connect to the database
interface DatabaseError {
  message: string;
  code?: number;
  stack?: string;
}

// Task notification checking function
async function checkTasksAndSendNotification() {
  console.log('[CRON] Starting task notification check');
  await TaskNotificationUtil.checkTasksAndSendNotifications();
  console.log('[CRON] Task notification check completed');
}

connectDB()
  .then((): void => {
    app.listen(port, (): void => {
      console.log(`Server is running on port ${port}`);
    });
    CronService.scheduleEvery30Minutes('Task-Notifications', checkTasksAndSendNotification);
  })
  .catch((error: DatabaseError): void => {
    console.error('Database connection failed:', error);
  });