import { AgentRunRequest, JenkinsWebhookPayload } from '../types';

export interface ValidationError {
    field: string;
    message: string;
}

export function validateAgentRunRequest(body: unknown): {
    valid: boolean;
    errors: ValidationError[];
    data?: AgentRunRequest;
} {
    const errors: ValidationError[] = [];
    const data = body as Record<string, unknown>;

    if (!data || typeof data !== 'object') {
        return { valid: false, errors: [{ field: 'body', message: 'Request body is required' }] };
    }

    if (!data.repo_url || typeof data.repo_url !== 'string') {
        errors.push({ field: 'repo_url', message: 'repo_url is required and must be a string' });
    } else if (!/^https?:\/\/github\.com\/.+\/.+/i.test(data.repo_url as string)) {
        errors.push({ field: 'repo_url', message: 'repo_url must be a valid GitHub repository URL' });
    }

    if (!data.team_name || typeof data.team_name !== 'string') {
        errors.push({ field: 'team_name', message: 'team_name is required and must be a string' });
    }

    if (!data.team_leader || typeof data.team_leader !== 'string') {
        errors.push({ field: 'team_leader', message: 'team_leader is required and must be a string' });
    }

    if (errors.length > 0) {
        return { valid: false, errors };
    }

    return {
        valid: true,
        errors: [],
        data: {
            repo_url: (data.repo_url as string).trim(),
            team_name: (data.team_name as string).trim(),
            team_leader: (data.team_leader as string).trim(),
        },
    };
}

export function validateJenkinsWebhook(body: unknown): {
    valid: boolean;
    errors: ValidationError[];
    data?: JenkinsWebhookPayload;
} {
    const errors: ValidationError[] = [];
    const data = body as Record<string, unknown>;

    if (!data || typeof data !== 'object') {
        return { valid: false, errors: [{ field: 'body', message: 'Request body is required' }] };
    }

    if (typeof data.build_number !== 'number') {
        errors.push({ field: 'build_number', message: 'build_number is required and must be a number' });
    }

    if (!data.status || !['SUCCESS', 'FAILURE'].includes(data.status as string)) {
        errors.push({ field: 'status', message: 'status is required and must be SUCCESS or FAILURE' });
    }

    if (!data.repo_url || typeof data.repo_url !== 'string') {
        errors.push({ field: 'repo_url', message: 'repo_url is required and must be a string' });
    }

    if (!data.branch || typeof data.branch !== 'string') {
        errors.push({ field: 'branch', message: 'branch is required and must be a string' });
    }

    if (errors.length > 0) {
        return { valid: false, errors };
    }

    return {
        valid: true,
        errors: [],
        data: data as unknown as JenkinsWebhookPayload,
    };
}
