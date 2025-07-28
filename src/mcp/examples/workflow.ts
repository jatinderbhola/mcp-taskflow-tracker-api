import { Client, Server } from '../sdk';
import { ProjectStatus, TaskStatus } from '@/models/types';
import { projectTools } from '../tools/projectTools';
import { taskTools } from '../tools/taskTools';

async function exampleWorkflow(): Promise<void> {
    // Create and start server
    const server = new Server({
        name: 'project-tracker-mcp',
        version: '1.0.0',
        title: 'Project Tracker MCP Server',
        tools: [...projectTools, ...taskTools],
    });
    await server.start();

    // Create client connected to server
    const client = new Client(server);

    try {
        console.log('1. Creating a new project...');
        const createProjectResult = await client.invoke<{ project: any }>('create_project', {
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
        console.log('Project created:', createProjectResult.data.project);

        console.log('\n2. Creating tasks in the project...');
        const taskDataList = [
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

        for (const taskData of taskDataList) {
            const createTaskResult = await client.invoke<{ task: any }>('create_task', taskData);
            if (!createTaskResult.success || !createTaskResult.data) {
                throw new Error(`Failed to create task: ${createTaskResult.error}`);
            }
            console.log('Task created:', createTaskResult.data.task);
        }

        console.log('\n3. Getting project status...');
        const projectStatusResult = await client.invoke<{ status: string }>('get_project_status', {
            id: projectId,
        });
        if (projectStatusResult.success && projectStatusResult.data) {
            console.log('Project status:', projectStatusResult.data.status);
        }

        console.log('\n4. Updating project status to IN_PROGRESS...');
        const updateProjectResult = await client.invoke<{ project: any }>('update_project_status', {
            id: projectId,
            status: ProjectStatus.IN_PROGRESS,
        });
        if (updateProjectResult.success && updateProjectResult.data) {
            console.log('Updated project:', updateProjectResult.data.project);
        }

        console.log('\n5. Finding projects by status...');
        const findProjectsResult = await client.invoke<{ projects: any[] }>('find_projects_by_status', {
            status: ProjectStatus.IN_PROGRESS,
        });
        if (findProjectsResult.success && findProjectsResult.data) {
            console.log('Found projects:', findProjectsResult.data.projects);
        }

        console.log('\n6. Finding tasks by assignee...');
        const findTasksResult = await client.invoke<{ tasks: any[] }>('get_tasks_by_assignee', {
            assignedTo: 'user1@example.com',
        });
        if (findTasksResult.success && findTasksResult.data) {
            console.log('Tasks for user1:', findTasksResult.data.tasks);
        }

        console.log('\n7. Finding overdue tasks...');
        const overdueTasksResult = await client.invoke<{ tasks: any[] }>('find_overdue_tasks', {});
        if (overdueTasksResult.success && overdueTasksResult.data) {
            console.log('Overdue tasks:', overdueTasksResult.data.tasks);
        }

        console.log('\n8. Getting task details...');
        const foundTasks = findTasksResult.success && findTasksResult.data?.tasks;
        if (foundTasks && foundTasks.length > 0) {
            const taskId = foundTasks[0].id;
            const taskDetailsResult = await client.invoke<{ task: any }>('get_task_details', {
                id: taskId,
            });
            if (taskDetailsResult.success && taskDetailsResult.data) {
                console.log('Task details:', taskDetailsResult.data.task);
            }
        }

        console.log('\nWorkflow completed successfully!');
    } catch (error) {
        console.error('Workflow failed:', error);
    } finally {
        // Exit the process after completion
        process.exit(0);
    }
}

// Run the example workflow
console.log('Starting example workflow...\n');
exampleWorkflow().catch(error => {
    console.error('Workflow failed:', error);
    process.exit(1);
}); 