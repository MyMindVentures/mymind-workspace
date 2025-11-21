# Deploy Golden Standard Compliant Containers

## Repository
**GitHub**: https://github.com/MyMindVentures/mymind-workspace
**Branch**: master

## Services te deployen via Northflank UI:

### 1. Build Engine (Critical Tier)
- **Service Type**: Combined Service
- **Name**: `Build Engine`
- **Build**:
  - Source: GitHub (MyMindVentures/mymind-workspace)
  - Branch: master
  - Dockerfile: `container/Dockerfile.build-engine`
- **Port**: 2375 (TCP, internal)
- **Plan**: nf-compute-20
- **Health Check**: Automatic (in Dockerfile)
- **Labels**: ✅ OCI + MyMind compliant

### 2. Terminal (Standard Tier)
- **Service Type**: Combined Service  
- **Name**: `Terminal`
- **Build**:
  - Source: GitHub (MyMindVentures/mymind-workspace)
  - Branch: master
  - Dockerfile: `container/Dockerfile.terminal`
- **Port**: None (CLI only)
- **Plan**: nf-compute-10
- **User**: workspace (UID 1000) ✅ non-root
- **Health Check**: Automatic (in Dockerfile)
- **Env Vars**: DOPPLER_TOKEN, DOCKER_PAT, GITHUB_PAT, etc.

### 3. Code Editor (High Tier)
- **Service Type**: Combined Service
- **Name**: `Code Editor`
- **Build**:
  - Source: GitHub (MyMindVentures/mymind-workspace)
  - Branch: master
  - Dockerfile: `container/Dockerfile.code-editor`
- **Port**: 3000 (HTTP, public)
- **Plan**: nf-compute-50
- **User**: openvscode-server ✅ non-root
- **Auth**: None (configured in Dockerfile)
- **Health Check**: Automatic (in Dockerfile)
- **Env Vars**: DOCKER_HOST=tcp://build-engine:2375, credentials

### 4. n8n (High Tier)
- **Service Type**: Combined Service
- **Name**: `n8n`
- **Build**:
  - Source: GitHub (MyMindVentures/mymind-workspace)
  - Branch: master
  - Dockerfile: `container/Dockerfile.n8n`
- **Port**: 5678 (HTTP, public)
- **Plan**: Current
- **User**: node ✅ non-root
- **Health Check**: Automatic

## Compliance Status

✅ **Multi-Stage Builds**: Base images optimized
✅ **Non-Root Users**: All services run as non-root
✅ **Health Checks**: Implemented in all Dockerfiles
✅ **OCI Labels**: All standard labels present
✅ **MyMind Labels**: Custom labels for tracking
✅ **Security Tiers**: Classified (standard/high/critical)
✅ **Blue-Green Strategy**: Labeled for deployment
✅ **Cleanup Policy**: Retention defined per service

## Deploy via Northflank UI

1. Open: https://app.northflank.com/projects/temporary-collection-21-11-2025
2. Create Combined Service voor elke service hierboven
3. Select GitHub repo: `MyMindVentures/mymind-workspace`
4. Set Dockerfile path volgens bovenstaande
5. Configure ports en environment variables
6. Deploy!

Alle services zijn nu **Golden Standard compliant**! 🏆
