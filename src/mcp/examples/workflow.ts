import { Client } from '../sdk';
import { ProjectStatus, TaskStatus } from '@/models/types';

interface Project {
    id: string;
    name: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    status: ProjectStatus;
}

interface Task {
    id: string;
    title: string;
    assignedTo: string;
    status: TaskStatus;
    dueDate: Date;
    projectId: string;
}

async function exampleWorkflow(): Promise<void> {
    const client = new Client();

    try {
        // Create a new project
        const createProjectResult = await client.invoke<{ project: Project }>('create_project', {
            name: 'Example Project',
            description: 'A test project created via MCP',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            status: ProjectStatus.PLANNED,
        });

        if (!createProjectResult.success || !createProjectResult.data) {
            throw new Error(`Failed to create project: ${createProjectResult.error}`);
        }

        const projectId = createProjectResult.data.project.id;
        console.log('Created project:', createProjectResult.data.project);

        // Create tasks in the project
        const tasks = [
            {
                title: 'Task 1',
                assignedTo: 'user1@example.com',
                status: TaskStatus.TODO,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                projectId,
            },
            {
                title: 'Task 2',
                assignedTo: 'user2@example.com',
                status: TaskStatus.TODO,
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
                projectId,
            },
        ];

        for (const taskData of tasks) {
            const createTaskResult = await client.invoke<{ task: Task }>('create_task', taskData);
            if (!createTaskResult.success || !createTaskResult.data) {
                throw new Error(`Failed to create task: ${createTaskResult.error}`);
            }
            console.log('Created task:', createTaskResult.data.task);
        }

        // Update project status to IN_PROGRESS
        const updateProjectResult = await client.invoke<{ project: Project }>('update_project_status', {
            id: projectId,
            status: ProjectStatus.IN_PROGRESS,
        });

        if (!updateProjectResult.success || !updateProjectResult.data) {
            throw new Error(`Failed to update project status: ${updateProjectResult.error}`);
        }
        console.log('Updated project status:', updateProjectResult.data.project);

        // Find tasks by assignee
        const findTasksResult = await client.invoke<{ tasks: Task[] }>('get_tasks_by_assignee', {
            assignedTo: 'user1@example.com',
        });

        if (!findTasksResult.success || !findTasksResult.data) {
            throw new Error(`Failed to find tasks: ${findTasksResult.error}`);
        }
        console.log('Tasks for user1:', findTasksResult.data.tasks);

        // Find overdue tasks
        const overdueTasksResult = await client.invoke<{ tasks: Task[] }>('find_overdue_tasks', {});

        if (!overdueTasksResult.success || !overdueTasksResult.data) {
            throw new Error(`Failed to find overdue tasks: ${overdueTasksResult.error}`);
        }
        console.log('Overdue tasks:', overdueTasksResult.data.tasks);

    } catch (error) {
        console.error('Workflow failed:', error);
    }
}

// Run the example workflow if this file is executed directly
if (require.main === module) {
    exampleWorkflow().catch(console.error);
} 