import request from 'supertest';
import app from '../app';

// Mock dependencies minimally
jest.mock('../services/agent.service', () => ({
    agentService: {
        executeRun: jest.fn().mockResolvedValue(undefined),
    },
}));

// We will NOT mock RunStore for now to see if integration works.
// We just need to mock the heavy agent execution.

describe('Agent Routes Integration', () => {

    it('should create a new run and return 202', async () => {
        const res = await request(app)
            .post('/api/agent/run')
            .send({
                repo_url: 'https://github.com/test/repo',
                branch_name: 'main',
                team_name: 'DevOps',
                team_leader: 'Alice',
            });

        // If this passes, the issue was with the RunStore mock setup
        if (res.statusCode !== 202) {
            console.log('Error Body:', res.body);
        }

        expect(res.statusCode).toEqual(202);
        expect(res.body).toHaveProperty('run_id');
        expect(res.body.status).toEqual('QUEUED');
    });

    it('should return 400 for invalid data', async () => {
        const res = await request(app).post('/api/agent/run').send({});
        expect(res.statusCode).toEqual(400);
    });
});
