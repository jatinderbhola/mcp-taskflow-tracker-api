import { api, createTestProject, createTestTask, TestData, Assertions } from '../helpers';
import { ProjectStatus, TaskStatus } from '../../models/types';

describe('API Integration Tests', () => {
    describe('Project Endpoints', () => {
        describe('GET /api/projects', () => {
            it('should return all projects', async () => {
                const project = await createTestProject();
                const response = await api.projects.getAll();

                expect(response.status).toBe(200);
                expect(response.body).toHaveLength(1);
                expect(response.body[0].id).toBe(project.id);
            });

            it('should filter projects by status', async () => {
                await createTestProject({ status: ProjectStatus.COMPLETED });
                const activeProject = await createTestProject({ status: ProjectStatus.IN_PROGRESS });

                const response = await api.projects.getAll({ status: ProjectStatus.IN_PROGRESS });

                expect(response.status).toBe(200);
                expect(response.body).toHaveLength(1);
                expect(response.body[0].id).toBe(activeProject.id);
            });
        });

        describe('POST /api/projects', () => {
            it('should create a new project', async () => {
                const projectData = TestData.project({
                    name: 'New Project',
                    description: 'Project Description',
                    status: ProjectStatus.PLANNED,
                });

                const response = await api.projects.create(projectData);

                expect(response.status).toBe(201);
                Assertions.matchesData(response.body, projectData);
                Assertions.hasValidDates(response.body, ['startDate', 'endDate']);
            });

            it('should validate required fields', async () => {
                const response = await api.projects.create({});
                expect(response.status).toBe(400);
            });
        });

        describe('GET /api/projects/:id', () => {
            it('should return a project by id', async () => {
                const project = await createTestProject();
                const response = await api.projects.getById(project.id);

                expect(response.status).toBe(200);
                expect(response.body.id).toBe(project.id);
            });

            it('should return 404 for non-existent project', async () => {
                const response = await api.projects.getById('non-existent-id');
                expect(response.status).toBe(404);
            });
        });

        describe('PUT /api/projects/:id', () => {
            it('should update a project', async () => {
                const project = await createTestProject();
                const updateData = { name: 'Updated Project' };

                const response = await api.projects.update(project.id, updateData);

                expect(response.status).toBe(200);
                expect(response.body.name).toBe(updateData.name);
            });
        });

        describe('DELETE /api/projects/:id', () => {
            it('should delete a project', async () => {
                const project = await createTestProject();

                const response = await api.projects.delete(project.id);

                expect(response.status).toBe(200);
                expect(response.body.id).toBe(project.id);
            });
        });
    });

    describe('Task Endpoints', () => {
        describe('GET /api/tasks', () => {
            it('should return all tasks', async () => {
                const project = await createTestProject();
                const task = await createTestTask(project.id);
                const response = await api.tasks.getAll();

                expect(response.status).toBe(200);
                expect(response.body).toHaveLength(1);
                expect(response.body[0].id).toBe(task.id);
            });

            it('should filter tasks by status', async () => {
                const project = await createTestProject();
                await createTestTask(project.id, { status: TaskStatus.COMPLETED });
                const pendingTask = await createTestTask(project.id, { status: TaskStatus.TODO });

                const response = await api.tasks.getAll({ status: TaskStatus.TODO });

                expect(response.status).toBe(200);
                expect(response.body).toHaveLength(1);
                expect(response.body[0].id).toBe(pendingTask.id);
            });
        });

        describe('POST /api/tasks', () => {
            it('should create a new task', async () => {
                const project = await createTestProject();
                const taskData = TestData.task(project.id, {
                    title: 'New Task',
                    assignedTo: 'user@example.com',
                    status: TaskStatus.TODO,
                });

                const response = await api.tasks.create(taskData);

                expect(response.status).toBe(201);
                Assertions.matchesData(response.body, taskData);
                Assertions.hasValidDates(response.body, ['dueDate']);
            });

            it('should validate project existence', async () => {
                const taskData = TestData.task('non-existent-id', {
                    title: 'New Task',
                    assignedTo: 'user@example.com',
                    status: TaskStatus.TODO,
                });

                const response = await api.tasks.create(taskData);
                expect(response.status).toBe(404);
            });
        });

        describe('GET /api/tasks/project/:projectId', () => {
            it('should return tasks for a project', async () => {
                const project = await createTestProject();
                const task = await createTestTask(project.id);
                const response = await api.tasks.getByProject(project.id);

                expect(response.status).toBe(200);
                expect(response.body).toHaveLength(1);
                expect(response.body[0].id).toBe(task.id);
            });

            it('should return 404 for non-existent project', async () => {
                const response = await api.tasks.getByProject('non-existent-id');
                expect(response.status).toBe(404);
            });
        });

        describe('PUT /api/tasks/:id', () => {
            it('should update a task', async () => {
                const project = await createTestProject();
                const task = await createTestTask(project.id);
                const updateData = { title: 'Updated Task' };

                const response = await api.tasks.update(task.id, updateData);

                expect(response.status).toBe(200);
                expect(response.body.title).toBe(updateData.title);
            });
        });

        describe('DELETE /api/tasks/:id', () => {
            it('should delete a task', async () => {
                const project = await createTestProject();
                const task = await createTestTask(project.id);

                const response = await api.tasks.delete(task.id);

                expect(response.status).toBe(200);
                expect(response.body.id).toBe(task.id);
            });
        });
    });
}); 