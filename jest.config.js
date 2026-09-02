module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.spec.ts'],
  // Mirrors the `@/*` paths in tsconfig.json so specs can import from src.
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/types/**/*.ts',
  ],
  coverageReporters: ['text', 'text-summary'],
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        diagnostics: false,
        isolatedModules: true,
      },
    ],
  },
};
