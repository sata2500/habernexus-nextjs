/**
 * Jest Konfigürasyonu
 * 
 * Next.js ve React projesi için Jest test framework'ü ayarları.
 * 
 * @see https://jestjs.io/docs/configuration
 * @see https://nextjs.org/docs/testing
 */

const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Next.js config dosyasının yolu
  dir: './',
})

// Jest'e özel konfigürasyon
const customJestConfig = {
  // Test ortamı
  testEnvironment: 'jest-environment-jsdom',

  // Setup dosyaları
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Module adı eşlemeleri
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Test dosyaları deseni
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // Coverage ayarları
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
  ],

  // Coverage eşikleri
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },

  // Dışlanan dosyalar
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],

  // Transform ayarları
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
  },
}

// createJestConfig, Next.js konfigürasyonunu otomatik olarak yükler
module.exports = createJestConfig(customJestConfig)
