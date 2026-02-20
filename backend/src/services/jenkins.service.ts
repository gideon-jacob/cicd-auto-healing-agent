import https from 'https';
import http from 'http';
import { logger } from '../utils/logger';
import { config } from '../config';

export interface JenkinsBuildInfo {
    number: number;
    result: string | null;
    building: boolean;
    url: string;
}

export class JenkinsService {
    private baseUrl: string;
    private auth: string;

    constructor() {
        this.baseUrl = config.jenkins.url;
        this.auth = Buffer.from(
            `${config.jenkins.user}:${config.jenkins.token}`,
        ).toString('base64');
    }

    /**
     * Trigger a Jenkins pipeline build for a given job.
     */
    async triggerBuild(
        jobName: string,
        params?: Record<string, string>,
    ): Promise<number | null> {
        const searchParams = new URLSearchParams(params || {});
        const endpoint = params
            ? `/job/${jobName}/buildWithParameters?${searchParams.toString()}`
            : `/job/${jobName}/build`;

        try {
            const response = await this.request('POST', endpoint);
            logger.info(`Jenkins build triggered for job: ${jobName}`);

            // Jenkins returns the queue item location in the Location header
            // For simplicity, return the next build number
            const buildInfo = await this.getLastBuild(jobName);
            return buildInfo?.number ?? null;
        } catch (error) {
            logger.error(`Failed to trigger Jenkins build: ${error}`);
            throw error;
        }
    }

    /**
     * Get the last build info for a job.
     */
    async getLastBuild(jobName: string): Promise<JenkinsBuildInfo | null> {
        try {
            const data = await this.request(
                'GET',
                `/job/${jobName}/lastBuild/api/json`,
            );
            const parsed = JSON.parse(data);
            return {
                number: parsed.number,
                result: parsed.result,
                building: parsed.building,
                url: parsed.url,
            };
        } catch (error) {
            logger.error(`Failed to get last build info: ${error}`);
            return null;
        }
    }

    /**
     * Get console output for a specific build.
     */
    async getConsoleOutput(
        jobName: string,
        buildNumber: number,
    ): Promise<string> {
        try {
            return await this.request(
                'GET',
                `/job/${jobName}/${buildNumber}/consoleText`,
            );
        } catch (error) {
            logger.error(`Failed to get console output: ${error}`);
            return '';
        }
    }

    /**
     * Poll until build completes.
     */
    async waitForBuild(
        jobName: string,
        buildNumber: number,
        timeoutMs: number = 300000,
        pollIntervalMs: number = 5000,
    ): Promise<JenkinsBuildInfo> {
        const startTime = Date.now();

        while (Date.now() - startTime < timeoutMs) {
            try {
                const data = await this.request(
                    'GET',
                    `/job/${jobName}/${buildNumber}/api/json`,
                );
                const parsed = JSON.parse(data);
                const info: JenkinsBuildInfo = {
                    number: parsed.number,
                    result: parsed.result,
                    building: parsed.building,
                    url: parsed.url,
                };

                if (!info.building && info.result) {
                    return info;
                }
            } catch {
                // Build might not have started yet
            }

            await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
        }

        throw new Error(`Timeout waiting for Jenkins build ${buildNumber}`);
    }

    private request(method: string, endpoint: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const url = new URL(`${this.baseUrl}${endpoint}`);
            const transport = url.protocol === 'https:' ? https : http;

            const options = {
                hostname: url.hostname,
                port: url.port,
                path: `${url.pathname}${url.search}`,
                method,
                headers: {
                    Authorization: `Basic ${this.auth}`,
                    'Content-Type': 'application/json',
                },
            };

            const req = transport.request(options, (res) => {
                let data = '';
                res.on('data', (chunk: Buffer) => {
                    data += chunk.toString();
                });
                res.on('end', () => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
                        resolve(data);
                    } else {
                        reject(
                            new Error(`Jenkins API error: ${res.statusCode} — ${data}`),
                        );
                    }
                });
            });

            req.on('error', reject);
            req.end();
        });
    }
}

export const jenkinsService = new JenkinsService();
