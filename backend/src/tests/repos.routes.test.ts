import request from 'supertest';
import app from '../app';
import { runStore } from '../store/RunStore';
import { AgentRun } from '../types';

describe('Repos Routes', () => {
    const testRunId = 'test-run-repo-1';

    beforeAll(() => {
        const run: AgentRun = {
            run_id: testRunId,
            status: 'PASSED',
            repo_url: 'https://github.com/test/repo-1',
            repo_name: 'repo-1',
            team_name: 'DevOps',
            team_leader: 'Bob',
            branch_name: 'main',
            created_at: new Date().toISOString(),
            summary: {
                total_failures_detected: 0,
                total_fixes_applied: 0,
                final_cicd_status: 'PASSED',
                total_time_seconds: 100,
                started_at: new Date().toISOString(),
                finished_at: new Date().toISOString(),
            },
            score: { base: 100, speed_bonus: 10, efficiency_penalty: 0, total: 110, total_commits: 2 },
            current_iteration: 1,
            max_iterations: 5,
            pipeline_stages: [],
            agent_steps: [],
            fixes: [],
            timeline: []
        };

        (runStore as any).runs.set(testRunId, run);
    });

    it('GET /api/repos should list all repos', async () => {
        const res = await request(app).get('/api/repos');
        expect(res.statusCode).toEqual(200);
        expect(res.body.repos).toBeInstanceOf(Array);
        // We might have data from other tests if not cleared, but at least our seeded one should contribute
        const found = res.body.repos.find((r: any) => r.name === 'repo-1');
        expect(found).toBeDefined();
        expect(found.repo_url).toEqual('https://github.com/test/repo-1');
    });

    it('GET /api/repos/:repo_name/builds should list builds', async () => {
        const res = await request(app).get('/api/repos/repo-1/builds');
        expect(res.statusCode).toEqual(200);
        expect(res.body.builds).toBeInstanceOf(Array);
        expect(res.body.builds).toHaveLength(1);
        expect(res.body.builds[0].run_id).toEqual(testRunId);
    });
});
