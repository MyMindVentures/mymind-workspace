# MCP Servers Configuration Guide

## 🚀 Custom MCP Servers for Your Stack

I've created **5 custom MCP servers** specifically for your Northflank + Doppler + n8n workflow:

### 1. **Docker MCP** (`docker-mcp.js`)
- List containers
- Inspect containers
- Get logs
- Execute commands
- List images

### 2. **Doppler MCP** (`doppler-mcp.js`)
- List secrets
- Get secret values
- Set secrets
- List projects

### 3. **Northflank MCP** (`northflank-mcp.js`)
- List services
- Get service details
- View logs
- Restart services
- Trigger builds

### 4. **Postman MCP** (`postman-mcp.js`)
- Run collections (via Newman)
- Run with data files
- Validate collections

### 5. **n8n MCP** (`n8n-mcp.js`)
- List workflows
- Get workflow details
- Activate/deactivate workflows
- Execute workflows
- List executions

---

## ⚙️ Environment Variables

Add these to your Doppler project or `.env`:

```bash
# GitHub
GITHUB_TOKEN=ghp_your_token

# PostgreSQL
POSTGRES_CONNECTION_STRING=postgresql://user:pass@host:5432/db

# Docker
DOCKER_HOST=tcp://localhost:2375

# Doppler
DOPPLER_TOKEN=dp.st.your_service_token

# Northflank
NORTHFLANK_API_TOKEN=your_northflank_api_token

# Postman
POSTMAN_API_KEY=your_postman_api_key

# n8n
N8N_API_URL=https://your-n8n-url.northflank.app
N8N_API_KEY=your_n8n_api_key

# Brave Search (optional)
BRAVE_API_KEY=your_brave_api_key
```

---

## 📝 Usage with Cline/Claude Dev

Once configured, you can ask your AI agent:

**Docker:**
- "List all running containers"
- "Show me logs for container X"
- "What images do we have?"

**Doppler:**
- "List all secrets in mymind-ai-suite production"
- "Get the OPENAI_API_KEY value"
- "Set a new secret GITHUB_TOKEN"

**Northflank:**
- "Show all services in temporary-collection-21-11-2025"
- "Get logs for code-editor-enterprise service"
- "Restart the n8n-enterprise service"

**Postman:**
- "Run the API tests collection"
- "Validate my postman collection"

**n8n:**
- "List all workflows"
- "Activate the email-to-slack workflow"
- "Execute workflow 123 with this data"

---

## 🔧 Installation

Already done! Files are in `/workspaces/alpine-3/mcp/servers/`

To use in VS Code:
1. Copy `mcp/config.example.json` to your VS Code settings
2. Set environment variables in Doppler
3. Reload VS Code
4. AI agents now have access to all these tools!

---

## 🎯 What This Unlocks

Your AI coding assistants (Copilot, Cline, Continue) can now:

✅ Deploy containers to Northflank  
✅ Manage secrets in Doppler  
✅ Test APIs with Postman  
✅ Control Docker containers  
✅ Trigger n8n workflows  
✅ All from natural language!  

**No more context switching between tools!** 🔥
