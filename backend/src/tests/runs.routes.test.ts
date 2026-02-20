import request from 'supertest';
import app from '../app';
import { runStore } from '../store/RunStore';
import { AgentRun } from '../types';

describe('Runs Routes', () => {
    const testRunId = 'test-run-123';

    beforeAll(() => {
        // Seed the store with a test run
        // We bypass createRun to set specific ID and state
        const run: AgentRun = {
            run_id: testRunId,
            status: 'RUNNING',
            repo_url: 'https://github.com/test/repo',
            repo_name: 'repo',
            team_name: 'DevOps',
            team_leader: 'Alice',
            branch_name: 'test-branch',
            created_at: new Date().toISOString(),
            summary: {
                total_failures_detected: 0,
                total_fixes_applied: 0,
                final_cicd_status: 'RUNNING',
                total_time_seconds: 0,
                started_at: new Date().toISOString(),
                finished_at: null,
            },
            score: { base: 100, speed_bonus: 0, efficiency_penalty: 0, total: 100, total_commits: 0 },
            current_iteration: 1,
            max_iterations: 5,
            pipeline_stages: [],
            agent_steps: [],
            fixes: [{
                file: 'index.ts',
                bug_type: 'SYNTAX',
                line_number: 10,
                description: 'Missing semicolon',
                commit_message: 'fix: semicolon',
                commit_sha: 'abc1234',
                status: 'FIXED',
                iteration: 1
            }],
            timeline: []
        };

        // Directly set into the private map if possible, 
        // or usage of public API if RunStore exposes it?
        // RunStore has 'runs' as private, but we can't access it.
        // But createRun generates ID.
        // We can cast to any to access private property for testing OR use public API.

        // Better: Use `any` casting for test setup to inject precise state
        (runStore as any).runs.set(testRunId, run);
    });

    it('GET /api/runs/:run_id/status should return run status', async () => {
        const res = await request(app).get(`/api/runs/${testRunId}/status`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('run_id', testRunId);
        expect(res.body).toHaveProperty('status', 'RUNNING');
    });

    it('GET /api/runs/:run_id/fixes should return fixes', async () => {
        const res = await request(app).get(`/api/runs/${testRunId}/fixes`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.fixes).toHaveLength(1);
        expect(res.body.fixes[0].description).toEqual('Missing semicolon');
    });

    it('GET /api/runs/:run_id/results should return full results', async () => {
        const res = await request(app).get(`/api/runs/${testRunId}/results`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('run_id', testRunId);
        expect(res.body).toHaveProperty('fixes');
    });

    it('GET /api/runs/non-existent-id/status should return 404', async () => {
        const res = await request(app).get('/api/runs/non-existent-id/status');
        expect(res.statusCode).toEqual(404);
    });
});
