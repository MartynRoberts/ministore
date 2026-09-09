/* eslint-disable @typescript-eslint/no-require-imports */
const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

const customJestConfig = {
  clearMocks: true,
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "hooks/**/*.{ts,tsx}",
    "!app/**/page.tsx",
    "!app/**/layout.tsx",
  ],
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.cjs"],
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/__tests__/**/*.test.{ts,tsx}"],
};

module.exports = createJestConfig(customJestConfig);
