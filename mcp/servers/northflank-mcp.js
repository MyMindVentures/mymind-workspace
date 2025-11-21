#!/usr/bin/env node
/**
 * Northflank MCP Server
 * Manage Northflank services, builds, and deployments
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const server = new Server(
  {
    name: 'northflank-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'northflank_list_services',
        description: 'List all services in a Northflank project',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'Northflank project ID'
            }
          },
          required: ['projectId']
        }
      },
      {
        name: 'northflank_get_service',
        description: 'Get details of a specific service',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'Northflank project ID'
            },
            serviceId: {
              type: 'string',
              description: 'Service ID'
            }
          },
          required: ['projectId', 'serviceId']
        }
      },
      {
        name: 'northflank_get_logs',
        description: 'Get service logs',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'Northflank project ID'
            },
            serviceId: {
              type: 'string',
              description: 'Service ID'
            }
          },
          required: ['projectId', 'serviceId']
        }
      },
      {
        name: 'northflank_restart_service',
        description: 'Restart a service',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'Northflank project ID'
            },
            serviceId: {
              type: 'string',
              description: 'Service ID'
            }
          },
          required: ['projectId', 'serviceId']
        }
      },
      {
        name: 'northflank_trigger_build',
        description: 'Trigger a new build',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'Northflank project ID'
            },
            serviceId: {
              type: 'string',
              description: 'Service ID'
            }
          },
          required: ['projectId', 'serviceId']
        }
      }
    ]
  };
});

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'northflank_list_services': {
        const cmd = `./bin/northflank list services --projectId ${args.projectId} --output json`;
        const { stdout } = await execAsync(cmd, { cwd: '/workspaces/alpine-3' });
        return {
          content: [{ type: 'text', text: stdout }]
        };
      }

      case 'northflank_get_service': {
        const cmd = `./bin/northflank get service --projectId ${args.projectId} --serviceId ${args.serviceId} --output json`;
        const { stdout } = await execAsync(cmd, { cwd: '/workspaces/alpine-3' });
        return {
          content: [{ type: 'text', text: stdout }]
        };
      }

      case 'northflank_get_logs': {
        const cmd = `./bin/northflank get logs service --projectId ${args.projectId} --serviceId ${args.serviceId}`;
        const { stdout } = await execAsync(cmd, { cwd: '/workspaces/alpine-3' });
        return {
          content: [{ type: 'text', text: stdout }]
        };
      }

      case 'northflank_restart_service': {
        const cmd = `./bin/northflank restart service --projectId ${args.projectId} --serviceId ${args.serviceId}`;
        const { stdout } = await execAsync(cmd, { cwd: '/workspaces/alpine-3' });
        return {
          content: [{ type: 'text', text: `Service restarted: ${stdout}` }]
        };
      }

      case 'northflank_trigger_build': {
        const cmd = `./bin/northflank create build --projectId ${args.projectId} --serviceId ${args.serviceId}`;
        const { stdout } = await execAsync(cmd, { cwd: '/workspaces/alpine-3' });
        return {
          content: [{ type: 'text', text: `Build triggered: ${stdout}` }]
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
  console.error('Northflank MCP Server running on stdio');
}

main().catch(console.error);
