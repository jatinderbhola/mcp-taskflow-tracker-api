import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
    setupFiles: ['<rootDir>/src/test/env-setup.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    clearMocks: true,
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/test/**/*',
        '!src/**/*.d.ts',
        '!src/types/**/*',
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
        '<rootDir>/src/test/integration/**/*.{ts,tsx}',
    ],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    verbose: true,
    // Serial execution settings
    maxWorkers: 1, // Run all tests in a single worker (serial)
    // Additional settings for better serial execution
    forceExit: true, // Force exit after tests complete
    detectOpenHandles: true, // Detect and report open handles
    testTimeout: 10000, // Increase timeout for database operations
}

export default config; 