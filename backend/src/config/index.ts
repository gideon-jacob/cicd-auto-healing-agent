import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || '*',

    jenkins: {
        url: process.env.JENKINS_URL || 'http://localhost:8080',
        user: process.env.JENKINS_USER || 'admin',
        token: process.env.JENKINS_TOKEN || '',
    },

    github: {
        token: process.env.GITHUB_TOKEN || '',
    },

    gemini: {
        apiKey: process.env.GEMINI_API_KEY || '',
    },

    agent: {
        maxRetryLimit: parseInt(process.env.MAX_RETRY_LIMIT || '5', 10),
        cloneBaseDir: process.env.CLONE_BASE_DIR || path.resolve(__dirname, '../../tmp/repos'),
    },
} as const;

export type Config = typeof config;
