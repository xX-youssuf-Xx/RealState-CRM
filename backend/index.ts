import express from 'express';
import type { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';


import { connectDB } from './src/config/database';
import authRoutes from './src/routes/auth.routes';
import leadRoutes from './src/routes/lead.routes';
import projectRoutes from './src/routes/project.routes';
import unitRoutes from './src/routes/unit.routes'; 
import actionRoutes from './src/routes/action.routes';
import employeeRoutes from './src/routes/employee.routes';
import taskRoutes from './src/routes/task.routes';
import reportRoutes from './src/routes/report.route';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reports', reportRoutes);

// Connect to the database
interface DatabaseError {
  message: string;
  code?: number;
  stack?: string;
}

connectDB()
  .then((): void => {
    app.listen(port, (): void => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error: DatabaseError): void => {
    console.error('Database connection failed:', error);
  });