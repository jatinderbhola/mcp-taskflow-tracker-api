import { ProjectService } from '@/services/projectService';
import { ProjectStatus } from '@/models/types';
import { NotFoundError } from '@/utils/errors';
import { createTestProject } from '@/test/helpers';

describe('ProjectService', () => {
    const projectService = new ProjectService();

    describe('createProject', () => {
        it('should create a project successfully', async () => {
            const projectData = {
                name: 'Test Project',
                description: 'A test project',
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                status: ProjectStatus.PLANNED,
            };

            const project = await projectService.createProject(projectData);

            expect(project).toMatchObject(projectData);
            expect(project.id).toBeDefined();
            expect(project.createdAt).toBeDefined();
            expect(project.updatedAt).toBeDefined();
        });
    });

    describe('getProjectById', () => {
        it('should return a project by id', async () => {
            const testProject = await createTestProject();
            const project = await projectService.getProjectById(testProject.id);

            expect(project).toMatchObject({
                id: testProject.id,
                name: testProject.name,
                description: testProject.description,
                status: testProject.status,
            });
        });

        it('should throw NotFoundError for non-existent project', async () => {
            await expect(projectService.getProjectById('non-existent-id')).rejects.toThrow(
                NotFoundError,
            );
        });
    });

    describe('updateProject', () => {
        it('should update a project successfully', async () => {
            const testProject = await createTestProject();
            const updateData = {
                name: 'Updated Project',
                status: ProjectStatus.IN_PROGRESS,
            };

            const updatedProject = await projectService.updateProject(testProject.id, updateData);

            expect(updatedProject).toMatchObject({
                id: testProject.id,
                ...updateData,
            });
        });

        it('should throw NotFoundError when updating non-existent project', async () => {
            await expect(
                projectService.updateProject('non-existent-id', { name: 'Updated' }),
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('deleteProject', () => {
        it('should delete a project successfully', async () => {
            const testProject = await createTestProject();
            await projectService.deleteProject(testProject.id);

            await expect(projectService.getProjectById(testProject.id)).rejects.toThrow(
                NotFoundError,
            );
        });

        it('should throw NotFoundError when deleting non-existent project', async () => {
            await expect(projectService.deleteProject('non-existent-id')).rejects.toThrow(
                NotFoundError,
            );
        });
    });
}); 