# CI/CD Auto-Healing Agent — Backend

Production-ready Node.js + TypeScript + Express backend for the RIFT 2026 hackathon CI/CD Auto-Healing Agent, with **8 API endpoints**, **multi-agent CrewAI architecture** powered by **Google Gemini API**, and **automated EC2 deployment** via GitHub Actions.

## Project Structure

```
backend/
├── src/
│   ├── app.ts                        # Express app with middleware chain
│   ├── server.ts                     # HTTP server with graceful shutdown
│   ├── config/index.ts               # Environment-based configuration
│   ├── types/index.ts                # All TypeScript interfaces
│   ├── middleware/errorHandler.ts     # Global error handler + async wrapper
│   ├── store/RunStore.ts             # In-memory run data store
│   ├── controllers/
│   │   ├── agent.controller.ts       # POST /api/agent/run
│   │   ├── run.controller.ts         # GET status/fixes/timeline/results
│   │   ├── repo.controller.ts        # GET repos/builds
│   │   └── webhook.controller.ts     # POST Jenkins webhook
│   ├── routes/
│   │   ├── index.ts                  # Route barrel + health check
│   │   ├── agent.routes.ts
│   │   ├── runs.routes.ts
│   │   ├── repos.routes.ts
│   │   └── webhook.routes.ts
│   ├── services/
│   │   ├── agent.service.ts          # Main orchestration pipeline
│   │   ├── crewai.service.ts         # Multi-agent AI (Gemini API)
│   │   ├── git.service.ts            # Clone/branch/commit/push
│   │   ├── jenkins.service.ts        # Jenkins API client
│   │   └── score.service.ts          # RIFT scoring algorithm
│   └── utils/
│       ├── branchName.ts             # TEAM_NAME_LEADER_AI_Fix generator
│       ├── logger.ts                 # Winston logger
│       └── validation.ts             # Request body validators
├── ecosystem.config.js               # PM2 production config
├── package.json
├── tsconfig.json
└── .env.example
```

## API Endpoints

| # | Method | Endpoint | Purpose |
|---|--------|----------|---------|
| 1 | `POST` | `/api/agent/run` | Trigger a new agent run |
| 2 | `GET` | `/api/runs/:run_id/status` | Poll overall run status |
| 3 | `GET` | `/api/runs/:run_id/fixes` | Get fixes applied table |
| 4 | `GET` | `/api/runs/:run_id/timeline` | Get CI/CD iteration timeline |
| 5 | `GET` | `/api/repos` | List all submitted repos |
| 6 | `GET` | `/api/repos/:repo_name/builds` | List builds for a repo |
| 7 | `GET` | `/api/runs/:run_id/results` | Download results.json |
| 8 | `POST` | `/api/webhooks/jenkins` | Jenkins pipeline callback |

## Multi-Agent Architecture

Three AI agents powered by **Google Gemini 2.0 Flash**:

1. **AnalyzerAgent** — Parses test output, identifies failures with file/line/bug_type
2. **FixerAgent** — Generates targeted code fixes for each failure
3. **ValidatorAgent** — Reviews fixes before committing

## Getting Started

```bash
# Install dependencies
npm install

# Copy env template and fill in values
cp .env.example .env

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `CORS_ORIGIN` | Allowed origins | `*` |
| `GEMINI_API_KEY` | Google Gemini API key | — |
| `JENKINS_URL` | Jenkins server URL | `http://localhost:8080` |
| `JENKINS_USER` | Jenkins username | `admin` |
| `JENKINS_TOKEN` | Jenkins API token | — |
| `GITHUB_TOKEN` | GitHub PAT for repo access | — |
| `MAX_RETRY_LIMIT` | Agent retry limit | `5` |
| `CLONE_BASE_DIR` | Temp dir for cloned repos | `./tmp/repos` |

## Deployment (EC2 via GitHub Actions)

The `.github/workflows/deploy.yml` includes a `deploy-backend` job that:
1. SSHs into EC2
2. Pulls latest code
3. Installs dependencies & builds TypeScript
4. Restarts the app via PM2

**Required GitHub Secrets:** `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`, `EC2_DEPLOY_PATH`

## Production (PM2)

```bash
# Start with PM2
pm2 start ecosystem.config.js

# View logs
pm2 logs cicd-agent-backend

# Restart
pm2 restart cicd-agent-backend
```
