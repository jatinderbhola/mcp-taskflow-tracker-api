import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/taskService';
import { ProjectService } from '../services/projectService';
import { TaskSchema, TaskStatus } from '../models/types';

export class TaskController {
    /**
     * Get all tasks with optional filtering
     */
    static getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { status, assignedTo, assigneeName, dueDate } = req.query;

            const filters = {
                ...(status && { status: status as TaskStatus }),
                ...(assignedTo && { assignedTo: assignedTo as string }),
                ...(assigneeName && { assigneeName: assigneeName as string }),
                ...(dueDate && { dueDate: new Date(dueDate as string) }),
            };

            const tasks = await TaskService.getTasks(filters);
            res.json(tasks);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Create a new task
     */
    static createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const taskData = TaskSchema.parse(req.body);

            // Validate project exists
            await ProjectService.validateProjectExists(taskData.projectId);

            // Ensure assigneeName is null if not provided
            const taskWithName = {
                ...taskData,
                assigneeName: taskData.assigneeName || null
            };

            const task = await TaskService.createTask(taskWithName);
            res.status(201).json(task);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get a task by ID
     */
    static getTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const task = await TaskService.getTaskById(id);
            res.json(task);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Update a task
     */
    static updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const taskData = TaskSchema.partial().parse(req.body);

            // If projectId is being updated, validate new project exists
            if (taskData.projectId) {
                await ProjectService.validateProjectExists(taskData.projectId);
            }

            const task = await TaskService.updateTask(id, taskData);
            res.json(task);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Delete a task
     */
    static deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const deletedTask = await TaskService.deleteTask(id);
            res.status(200).json(deletedTask);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get tasks for a project
     */
    static getTasksByProjectId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { projectId } = req.params;

            // Validate project exists
            await ProjectService.validateProjectExists(projectId);

            const tasks = await TaskService.getTasksByProjectId(projectId);
            res.json(tasks);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get workload analysis for a specific assignee
     */
    static getWorkloadAnalysis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { assignee } = req.params;

            // Get all tasks for the assignee (try email first, then name)
            let tasks = await TaskService.getTasks({ assignedTo: assignee });
            if (tasks.length === 0) {
                // Try searching by name if email didn't work
                tasks = await TaskService.getTasks({ assigneeName: assignee });
            }

            // Calculate workload metrics
            const totalTasks = tasks.length;
            const overdueTasks = tasks.filter(task =>
                new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'
            ).length;

            const statusBreakdown = {
                TODO: tasks.filter(t => t.status === 'TODO').length,
                IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
                COMPLETED: tasks.filter(t => t.status === 'COMPLETED').length,
                BLOCKED: tasks.filter(t => t.status === 'BLOCKED').length
            };

            // Calculate workload score (0-100)
            const workloadScore = Math.min(100, Math.max(0,
                (totalTasks * 10) + (overdueTasks * 20) + (statusBreakdown.IN_PROGRESS * 15)
            ));

            const insights = [
                `${assignee} has ${totalTasks} total tasks`,
                overdueTasks > 0 ? `⚠️ ${overdueTasks} overdue tasks need attention` : '✅ No overdue tasks',
                statusBreakdown.IN_PROGRESS > 0 ? `🔄 ${statusBreakdown.IN_PROGRESS} tasks in progress` : 'No active tasks'
            ];

            const recommendations = [];
            if (workloadScore > 80) {
                recommendations.push('Consider redistributing some tasks');
                recommendations.push('Schedule a workload review meeting');
            } else if (overdueTasks > 0) {
                recommendations.push('Prioritize overdue tasks');
                recommendations.push('Set up task completion reminders');
            } else {
                recommendations.push('Continue monitoring task progress');
            }
            // EXPANSION: Add more recommendations based on workload score

            const analysis = {
                assignee,
                totalTasks,
                overdueTasks,
                workloadScore,
                statusBreakdown,
                insights,
                recommendations
            };

            res.json({
                success: true,
                data: analysis
            });
        } catch (error) {
            next(error);
        }
    };
} 