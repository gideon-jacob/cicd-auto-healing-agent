import request from 'supertest';
import app from '../app';
import { agentService } from '../services/agent.service';

// Mock agentService
jest.mock('../services/agent.service', () => ({
    agentService: {
        handleJenkinsWebhook: jest.fn().mockResolvedValue(undefined),
    },
}));

describe('Webhook Routes', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('POST /api/webhooks/jenkins should handle valid webhook', async () => {
        const payload = {
            build_number: 101,
            status: 'FAILURE',
            repo_url: 'https://github.com/test/repo',
            branch: 'dev-fix',
            log_url: 'http://jenkins/job/101/console',
            timestamp: new Date().toISOString()
        };

        const res = await request(app)
            .post('/api/webhooks/jenkins')
            .send(payload);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ received: true });
        expect(agentService.handleJenkinsWebhook).toHaveBeenCalledWith(
            payload.branch,
            payload.status,
            payload.log_url
        );
    });

    it('POST /api/webhooks/jenkins should return 400 for invalid payload', async () => {
        const res = await request(app)
            .post('/api/webhooks/jenkins')
            .send({ status: 'INVALID' }); // Missing required fields

        expect(res.statusCode).toEqual(400);
        expect(agentService.handleJenkinsWebhook).not.toHaveBeenCalled();
    });
});
