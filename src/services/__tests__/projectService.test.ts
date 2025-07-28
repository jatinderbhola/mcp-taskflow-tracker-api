import { ProjectService } from '../../services/projectService';
import { CacheService } from '../../services/cacheService';
import { createTestProject, TestData, Assertions, MockUtils } from '../../test/helpers';
import { ProjectStatus } from '../../models/types';
import { NotFoundError } from '../../utils/errors';

describe('ProjectService', () => {
    beforeEach(() => {
        MockUtils.resetMocks();
    });

    describe('createProject', () => {
        it('should create a project and invalidate cache', async () => {
            const projectData = TestData.project({
                name: 'New Project',
                description: 'Project Description',
                status: ProjectStatus.PLANNED,
            });

            const invalidateSpy = MockUtils.cacheSpy('invalidate');

            const project = await ProjectService.createProject(projectData);

            Assertions.matchesData(project, projectData);
            Assertions.hasValidDates(project, ['startDate', 'endDate', 'createdAt', 'updatedAt']);
            expect(invalidateSpy).toHaveBeenCalledWith(project.id);
        });
    });

    describe('getProjects', () => {
        it('should return projects from cache if available', async () => {
            const project = await createTestProject();
            const cacheKey = CacheService.projectKey();
            await CacheService.set(cacheKey, [project]);

            const getSpy = MockUtils.cacheSpy('get');
            const projects = await ProjectService.getProjects();

            Assertions.matchesData(projects[0], project);
            Assertions.hasValidDates(projects[0], ['startDate', 'endDate', 'createdAt', 'updatedAt']);
            expect(getSpy).toHaveBeenCalledWith(cacheKey);
        });

        it('should fetch from database and cache if not in cache', async () => {
            const project = await createTestProject();
            const cacheKey = CacheService.projectKey();

            const setSpy = MockUtils.cacheSpy('set');
            const projects = await ProjectService.getProjects();

            Assertions.matchesData(projects[0], project);
            Assertions.hasValidDates(projects[0], ['startDate', 'endDate', 'createdAt', 'updatedAt']);
            expect(setSpy).toHaveBeenCalledWith(cacheKey, expect.any(Array));
        });

        it('should filter projects by status', async () => {
            await createTestProject({ status: ProjectStatus.COMPLETED });
            await createTestProject({ status: ProjectStatus.IN_PROGRESS });

            const projects = await ProjectService.getProjects({ status: ProjectStatus.IN_PROGRESS });

            expect(projects.length).toBeGreaterThan(0);
            Assertions.allHaveProperty(projects, 'status', ProjectStatus.IN_PROGRESS);
        });
    });

    describe('getProjectById', () => {
        it('should return project from cache if available', async () => {
            const project = await createTestProject();
            const cacheKey = CacheService.projectKey(project.id);
            await CacheService.set(cacheKey, project);

            const getSpy = MockUtils.cacheSpy('get');
            const result = await ProjectService.getProjectById(project.id);

            Assertions.matchesData(result, project);
            Assertions.hasValidDates(result, ['startDate', 'endDate', 'createdAt', 'updatedAt']);
            expect(getSpy).toHaveBeenCalledWith(cacheKey);
        });

        it('should throw NotFoundError for non-existent project', async () => {
            await expect(ProjectService.getProjectById('non-existent-id'))
                .rejects
                .toThrow(NotFoundError);
        });
    });

    describe('updateProject', () => {
        it('should update project and invalidate cache', async () => {
            const project = await createTestProject();
            const updateData = { name: 'Updated Name' };

            const invalidateSpy = MockUtils.cacheSpy('invalidate');
            const updated = await ProjectService.updateProject(project.id, updateData);

            expect(updated.name).toBe(updateData.name);
            Assertions.hasValidDates(updated, ['startDate', 'endDate', 'createdAt', 'updatedAt']);
            expect(invalidateSpy).toHaveBeenCalledWith(project.id);
        });

        it('should throw NotFoundError for non-existent project', async () => {
            await expect(ProjectService.updateProject('non-existent-id', { name: 'Test' }))
                .rejects
                .toThrow(NotFoundError);
        });
    });

    describe('deleteProject', () => {
        it('should delete project and invalidate cache', async () => {
            const project = await createTestProject();

            const invalidateSpy = MockUtils.cacheSpy('invalidate');
            const deleted = await ProjectService.deleteProject(project.id);

            expect(deleted.id).toBe(project.id);
            Assertions.hasValidDates(deleted, ['startDate', 'endDate', 'createdAt', 'updatedAt']);
            expect(invalidateSpy).toHaveBeenCalledWith(project.id);

            await expect(ProjectService.getProjectById(project.id))
                .rejects
                .toThrow(NotFoundError);
        });

        it('should throw NotFoundError for non-existent project', async () => {
            await expect(ProjectService.deleteProject('non-existent-id'))
                .rejects
                .toThrow(NotFoundError);
        });
    });
}); 