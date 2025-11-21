#!/usr/bin/env node
/**
 * Doppler MCP Server
 * Manage secrets via Doppler API
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const server = new Server(
  {
    name: 'doppler-mcp-server',
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
        name: 'doppler_list_secrets',
        description: 'List all secrets in a Doppler project/config',
        inputSchema: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
              description: 'Doppler project name'
            },
            config: {
              type: 'string',
              description: 'Config name (e.g., dev, production)',
              default: 'production'
            }
          },
          required: ['project']
        }
      },
      {
        name: 'doppler_get_secret',
        description: 'Get a specific secret value',
        inputSchema: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
              description: 'Doppler project name'
            },
            config: {
              type: 'string',
              description: 'Config name',
              default: 'production'
            },
            name: {
              type: 'string',
              description: 'Secret name'
            }
          },
          required: ['project', 'name']
        }
      },
      {
        name: 'doppler_set_secret',
        description: 'Set a secret value',
        inputSchema: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
              description: 'Doppler project name'
            },
            config: {
              type: 'string',
              description: 'Config name',
              default: 'production'
            },
            name: {
              type: 'string',
              description: 'Secret name'
            },
            value: {
              type: 'string',
              description: 'Secret value'
            }
          },
          required: ['project', 'name', 'value']
        }
      },
      {
        name: 'doppler_list_projects',
        description: 'List all Doppler projects',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ]
  };
});

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'doppler_list_secrets': {
        const cmd = `doppler secrets -p ${args.project} -c ${args.config || 'production'} --json`;
        const { stdout } = await execAsync(cmd);
        return {
          content: [{ type: 'text', text: stdout }]
        };
      }

      case 'doppler_get_secret': {
        const cmd = `doppler secrets get ${args.name} -p ${args.project} -c ${args.config || 'production'} --plain`;
        const { stdout } = await execAsync(cmd);
        return {
          content: [{ type: 'text', text: stdout.trim() }]
        };
      }

      case 'doppler_set_secret': {
        const cmd = `doppler secrets set ${args.name}="${args.value}" -p ${args.project} -c ${args.config || 'production'}`;
        const { stdout } = await execAsync(cmd);
        return {
          content: [{ type: 'text', text: `Secret ${args.name} set successfully` }]
        };
      }

      case 'doppler_list_projects': {
        const { stdout } = await execAsync('doppler projects --json');
        return {
          content: [{ type: 'text', text: stdout }]
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
  console.error('Doppler MCP Server running on stdio');
}

main().catch(console.error);
