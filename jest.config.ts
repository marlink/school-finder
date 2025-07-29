// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  projects: [
    {
       displayName: 'API Tests',
       testEnvironment: 'node',
       testMatch: ['<rootDir>/src/app/api/**/*.test.ts'],
       moduleNameMapper: {
         '^@/(.*)$': '<rootDir>/src/$1',
       },
       setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
       transform: {
         '^.+\\.(ts)$': ['ts-jest', {}],
       },
     },
    {
      displayName: 'Component Tests',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/src/components/**/*.test.tsx', '<rootDir>/src/**/*.test.tsx'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
        '^.+\\.(js|jsx)$': 'babel-jest',
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      globals: {
        'ts-jest': {
          tsconfig: {
            jsx: 'react-jsx',
          },
        },
      },
    },
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(node-fetch|@testing-library))',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/tests/e2e/',
    '<rootDir>/node_modules/',
  ],
};

export default config;
