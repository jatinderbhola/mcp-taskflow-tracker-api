import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/projectService';
import { TaskService } from '../services/taskService';
import { ProjectSchema, ProjectStatus } from '../models/types';

export class ProjectController {
    /**
     * Get all projects with optional filtering
     */
    static getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { status, startDate, endDate } = req.query;

            const filters = {
                ...(status && { status: status as ProjectStatus }),
                ...(startDate && { startDate: new Date(startDate as string) }),
                ...(endDate && { endDate: new Date(endDate as string) }),
            };

            const projects = await ProjectService.getProjects(filters);
            res.json(projects);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Create a new project
     */
    static createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const projectData = ProjectSchema.parse(req.body);
            const project = await ProjectService.createProject(projectData);
            res.status(201).json(project);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get a project by ID
     */
    static getProjectById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const project = await ProjectService.getProjectById(id);
            res.json(project);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Update a project
     */
    static updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const projectData = ProjectSchema.partial().parse(req.body);
            const project = await ProjectService.updateProject(id, projectData);
            res.json(project);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Delete a project
     */
    static deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const deletedProject = await ProjectService.deleteProject(id);
            res.status(200).json(deletedProject);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get risk assessment for a project
     */
    static getRiskAssessment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { projectId } = req.params;

            // Get project details
            const project = await ProjectService.getProjectById(projectId);

            // Get tasks for this project
            const tasks = await TaskService.getTasksByProjectId(projectId);

            // Calculate risk metrics
            const totalTasks = tasks.length;
            const overdueTasks = tasks.filter(task =>
                new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'
            ).length;
            const blockedTasks = tasks.filter(task => task.status === 'BLOCKED').length;
            const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;

            // Calculate progress percentage
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            // Calculate risk score (0-100)
            let riskScore = 50; // Base score
            riskScore += overdueTasks * 15; // Overdue tasks increase risk
            riskScore += blockedTasks * 10; // Blocked tasks increase risk
            riskScore -= progress * 0.3; // Progress reduces risk
            riskScore = Math.min(100, Math.max(0, riskScore));

            // Determine risk level
            let riskLevel = 'LOW';
            if (riskScore >= 75) riskLevel = 'CRITICAL';
            else if (riskScore >= 60) riskLevel = 'HIGH';
            else if (riskScore >= 40) riskLevel = 'MEDIUM';

            const insights = [
                `Project ${project.name} has ${totalTasks} total tasks`,
                overdueTasks > 0 ? `🚨 ${overdueTasks} overdue tasks` : '✅ No overdue tasks',
                blockedTasks > 0 ? `⚠️ ${blockedTasks} blocked tasks` : '✅ No blocked tasks',
                `📊 ${progress}% completion rate`
            ];

            const recommendations = [];
            if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
                recommendations.push('Immediate intervention required');
                recommendations.push('Schedule emergency project review');
                recommendations.push('Consider extending deadlines');
            } else if (overdueTasks > 0) {
                recommendations.push('Prioritize overdue tasks');
                recommendations.push('Review task dependencies');
            } else {
                recommendations.push('Continue monitoring progress');
                recommendations.push('Maintain current pace');
            }

            const assessment = {
                projectId,
                projectName: project.name,
                riskLevel,
                riskScore,
                progress,
                overdueTasks,
                blockedTasks,
                insights,
                recommendations
            };

            res.json({
                success: true,
                data: assessment
            });
        } catch (error) {
            next(error);
        }
    };
} 