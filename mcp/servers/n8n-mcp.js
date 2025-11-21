#!/usr/bin/env node
/**
 * n8n MCP Server
 * Manage n8n workflows via API
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const https = require('https');
const http = require('http');

const server = new Server(
  {
    name: 'n8n-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const N8N_URL = process.env.N8N_API_URL || 'http://localhost:5678';
const N8N_API_KEY = process.env.N8N_API_KEY;

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, N8N_URL);
    const client = url.protocol === 'https:' ? https : http;
    
    const options = {
      method,
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json'
      }
    };

    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'n8n_list_workflows',
        description: 'List all n8n workflows',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'n8n_get_workflow',
        description: 'Get workflow details',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Workflow ID'
            }
          },
          required: ['id']
        }
      },
      {
        name: 'n8n_activate_workflow',
        description: 'Activate a workflow',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Workflow ID'
            }
          },
          required: ['id']
        }
      },
      {
        name: 'n8n_deactivate_workflow',
        description: 'Deactivate a workflow',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Workflow ID'
            }
          },
          required: ['id']
        }
      },
      {
        name: 'n8n_execute_workflow',
        description: 'Execute a workflow manually',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Workflow ID'
            },
            data: {
              type: 'object',
              description: 'Input data for workflow'
            }
          },
          required: ['id']
        }
      },
      {
        name: 'n8n_list_executions',
        description: 'List workflow executions',
        inputSchema: {
          type: 'object',
          properties: {
            workflowId: {
              type: 'string',
              description: 'Filter by workflow ID (optional)'
            }
          }
        }
      }
    ]
  };
});

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'n8n_list_workflows': {
        const data = await makeRequest('/api/v1/workflows');
        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
        };
      }

      case 'n8n_get_workflow': {
        const data = await makeRequest(`/api/v1/workflows/${args.id}`);
        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
        };
      }

      case 'n8n_activate_workflow': {
        const data = await makeRequest(`/api/v1/workflows/${args.id}/activate`, 'POST');
        return {
          content: [{ type: 'text', text: `Workflow ${args.id} activated` }]
        };
      }

      case 'n8n_deactivate_workflow': {
        const data = await makeRequest(`/api/v1/workflows/${args.id}/deactivate`, 'POST');
        return {
          content: [{ type: 'text', text: `Workflow ${args.id} deactivated` }]
        };
      }

      case 'n8n_execute_workflow': {
        const data = await makeRequest(`/api/v1/workflows/${args.id}/execute`, 'POST', args.data);
        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
        };
      }

      case 'n8n_list_executions': {
        let path = '/api/v1/executions';
        if (args.workflowId) path += `?workflowId=${args.workflowId}`;
        const data = await makeRequest(path);
        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('n8n MCP Server running on stdio');
}

main().catch(console.error);
