# 🚀 Vercel MCP Server Guide

## MCP Server kya hai?

MCP (Model Context Protocol) server ek bridge hai jo AI assistants ko external services (jaise Vercel) ke saath interact karne deta hai.

---

## Option 1: Simple Vercel CLI Scripts (Recommended) ⭐

MCP server banane se pehle, simple CLI scripts use karein:

### Setup Vercel CLI:

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link
```

### Useful Commands:

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# Check deployments
vercel ls

# View logs
vercel logs

# Remove deployment
vercel rm <deployment-url>
```

---

## Option 2: Vercel API Scripts

Vercel API directly use karein without MCP:

### Example: Deploy Script

```javascript
// scripts/deploy.js
const { execSync } = require('child_process');

function deploy() {
  try {
    console.log('🚀 Deploying to Vercel...');
    execSync('vercel --prod', { stdio: 'inherit' });
    console.log('✅ Deployment successful!');
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

deploy();
```

### Add to package.json:

```json
{
  "scripts": {
    "deploy": "node scripts/deploy.js",
    "deploy:preview": "vercel",
    "deploy:prod": "vercel --prod"
  }
}
```

---

## Option 3: MCP Server Banana (Advanced)

Agar aap MCP server banana chahte hain, to yeh steps follow karein:

### Requirements:

1. **Vercel API Token:**
   - Vercel Dashboard > Settings > Tokens
   - New token create karein

2. **MCP Server Structure:**
   ```
   vercel-mcp-server/
   ├── package.json
   ├── index.js
   └── vercel-api.js
   ```

### Basic MCP Server Code:

```javascript
// vercel-mcp-server/index.js
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { VercelAPI } from './vercel-api.js';

class VercelMCPServer {
  constructor() {
    this.server = new Server({
      name: 'vercel-mcp-server',
      version: '1.0.0',
    });
    
    this.vercelAPI = new VercelAPI(process.env.VERCEL_TOKEN);
    this.setupHandlers();
  }

  setupHandlers() {
    // List deployments
    this.server.setRequestHandler('tools/list', async (request) => {
      const deployments = await this.vercelAPI.listDeployments();
      return { deployments };
    });

    // Deploy project
    this.server.setRequestHandler('tools/deploy', async (request) => {
      const result = await this.vercelAPI.deploy(request.params);
      return { result };
    });

    // Get deployment status
    this.server.setRequestHandler('tools/status', async (request) => {
      const status = await this.vercelAPI.getDeploymentStatus(request.params.id);
      return { status };
    });
  }

  async run() {
    await this.server.connect();
  }
}

const server = new VercelMCPServer();
server.run();
```

### Vercel API Wrapper:

```javascript
// vercel-mcp-server/vercel-api.js
import fetch from 'node-fetch';

export class VercelAPI {
  constructor(token) {
    this.token = token;
    this.baseURL = 'https://api.vercel.com';
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    return response.json();
  }

  async listDeployments() {
    return this.request('/v6/deployments');
  }

  async deploy(params) {
    return this.request('/v13/deployments', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getDeploymentStatus(deploymentId) {
    return this.request(`/v13/deployments/${deploymentId}`);
  }
}
```

---

## Option 4: GitHub Actions (Automated)

GitHub Actions se automatically deploy karein:

### `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [ main, feature/project-restructure ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Recommendation:

**Simple Solution (Best for now):**
1. ✅ Vercel CLI install karein
2. ✅ `vercel --prod` command use karein
3. ✅ Ya Vercel Dashboard se manually configure karein

**Advanced (Future):**
- MCP server banana complex hai
- Better: GitHub Actions ya CI/CD pipeline use karein
- Ya Vercel API directly use karein

---

## Quick Start:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Yeh sabse simple aur effective hai!** 🚀

