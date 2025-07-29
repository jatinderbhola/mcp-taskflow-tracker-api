#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedTestData() {
    console.log('🌱 Seeding test data for MCP assessment...');

    try {
        // Create test projects
        const project1 = await prisma.project.create({
            data: {
                name: 'Website Redesign',
                description: 'Complete overhaul of company website',
                status: 'IN_PROGRESS',
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-03-01')
            }
        });

        const project2 = await prisma.project.create({
            data: {
                name: 'Mobile App Development',
                description: 'New mobile application for iOS and Android',
                status: 'IN_PROGRESS',
                startDate: new Date('2024-02-01'),
                endDate: new Date('2024-05-01')
            }
        });

        const project3 = await prisma.project.create({
            data: {
                name: 'Database Migration',
                description: 'Migrate from MySQL to PostgreSQL',
                status: 'PLANNED',
                startDate: new Date('2024-03-01'),
                endDate: new Date('2024-04-01')
            }
        });

        console.log('✅ Created projects:', [project1.name, project2.name, project3.name]);

        // Create tasks for Alice (high workload, some overdue)
        const aliceTasks = [
            {
                title: 'Design User Interface',
                assignedTo: 'alice@example.com',
                assigneeName: 'Alice',
                status: 'IN_PROGRESS',
                dueDate: new Date('2024-01-15'), // Overdue
                projectId: project1.id
            },
            {
                title: 'Implement Authentication',
                assignedTo: 'alice@example.com',
                assigneeName: 'Alice',
                status: 'IN_PROGRESS',
                dueDate: new Date('2024-01-20'), // Overdue
                projectId: project1.id
            },
            {
                title: 'API Integration',
                assignedTo: 'alice@example.com',
                assigneeName: 'Alice',
                status: 'TODO',
                dueDate: new Date('2024-02-15'),
                projectId: project1.id
            },
            {
                title: 'Mobile App Design',
                assignedTo: 'alice@example.com',
                assigneeName: 'Alice',
                status: 'TODO',
                dueDate: new Date('2024-02-20'),
                projectId: project2.id
            },
            {
                title: 'Database Schema Design',
                assignedTo: 'alice@example.com',
                assigneeName: 'Alice',
                status: 'BLOCKED',
                dueDate: new Date('2024-03-10'),
                projectId: project3.id
            },
            {
                title: 'User Testing',
                assignedTo: 'alice@example.com',
                assigneeName: 'Alice',
                status: 'COMPLETED',
                dueDate: new Date('2024-01-10'),
                projectId: project1.id
            }
        ];

        // Create tasks for Bob (medium workload, some overdue)
        const bobTasks = [
            {
                title: 'Frontend Development',
                assignedTo: 'bob@example.com',
                assigneeName: 'Bob',
                status: 'IN_PROGRESS',
                dueDate: new Date('2024-01-18'), // Overdue
                projectId: project1.id
            },
            {
                title: 'Backend API Development',
                assignedTo: 'bob@example.com',
                assigneeName: 'Bob',
                status: 'TODO',
                dueDate: new Date('2024-02-01'),
                projectId: project1.id
            },
            {
                title: 'Mobile Backend',
                assignedTo: 'bob@example.com',
                assigneeName: 'Bob',
                status: 'TODO',
                dueDate: new Date('2024-02-15'),
                projectId: project2.id
            },
            {
                title: 'Database Setup',
                assignedTo: 'bob@example.com',
                assigneeName: 'Bob',
                status: 'COMPLETED',
                dueDate: new Date('2024-01-05'),
                projectId: project3.id
            }
        ];

        // Create tasks for Charlie (low workload, no overdue)
        const charlieTasks = [
            {
                title: 'Code Review',
                assignedTo: 'charlie@example.com',
                assigneeName: 'Charlie',
                status: 'TODO',
                dueDate: new Date('2024-02-10'),
                projectId: project1.id
            },
            {
                title: 'Documentation',
                assignedTo: 'charlie@example.com',
                assigneeName: 'Charlie',
                status: 'COMPLETED',
                dueDate: new Date('2024-01-12'),
                projectId: project1.id
            }
        ];

        // Insert all tasks
        await prisma.task.createMany({
            data: [...aliceTasks, ...bobTasks, ...charlieTasks]
        });

        console.log('✅ Created tasks:');
        console.log('   Alice: 6 tasks (2 overdue, 1 blocked, 1 completed)');
        console.log('   Bob: 4 tasks (1 overdue, 1 completed)');
        console.log('   Charlie: 2 tasks (1 completed)');

        // Summary
        const totalTasks = await prisma.task.count();
        const overdueTasks = await prisma.task.count({
            where: {
                dueDate: { lt: new Date() },
                status: { not: 'COMPLETED' }
            }
        });

        console.log('\n📊 Database Summary:');
        console.log(`   Total tasks: ${totalTasks}`);
        console.log(`   Overdue tasks: ${overdueTasks}`);
        console.log(`   Projects: 3`);

        console.log('\n🎯 Test these MCP queries:');
        console.log('   "Show alice@example.com overdue tasks"');
        console.log('   "Analyze bob@example.com workload"');
        console.log('   "What\'s the risk level for Website Redesign project?"');
        console.log('   "Show me all tasks assigned to charlie@example.com"');

    } catch (error) {
        console.error('❌ Error seeding data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedTestData(); 