#!/usr/bin/env node
/**
 * Docker MCP Server
 * Provides Docker container management via MCP protocol
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const server = new Server(
  {
    name: 'docker-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Docker tools
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'docker_list_containers',
        description: 'List all Docker containers (running and stopped)',
        inputSchema: {
          type: 'object',
          properties: {
            all: {
              type: 'boolean',
              description: 'Show all containers (default shows just running)',
              default: true
            }
          }
        }
      },
      {
        name: 'docker_inspect',
        description: 'Inspect a Docker container',
        inputSchema: {
          type: 'object',
          properties: {
            container: {
              type: 'string',
              description: 'Container ID or name'
            }
          },
          required: ['container']
        }
      },
      {
        name: 'docker_logs',
        description: 'Get container logs',
        inputSchema: {
          type: 'object',
          properties: {
            container: {
              type: 'string',
              description: 'Container ID or name'
            },
            tail: {
              type: 'number',
              description: 'Number of lines to show from the end',
              default: 100
            }
          },
          required: ['container']
        }
      },
      {
        name: 'docker_exec',
        description: 'Execute command in running container',
        inputSchema: {
          type: 'object',
          properties: {
            container: {
              type: 'string',
              description: 'Container ID or name'
            },
            command: {
              type: 'string',
              description: 'Command to execute'
            }
          },
          required: ['container', 'command']
        }
      },
      {
        name: 'docker_images',
        description: 'List Docker images',
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
      case 'docker_list_containers': {
        const flag = args.all ? '-a' : '';
        const { stdout } = await execAsync(`docker ps ${flag} --format "{{.ID}}\\t{{.Names}}\\t{{.Status}}\\t{{.Image}}"`);
        return {
          content: [
            {
              type: 'text',
              text: stdout || 'No containers found'
            }
          ]
        };
      }

      case 'docker_inspect': {
        const { stdout } = await execAsync(`docker inspect ${args.container}`);
        return {
          content: [
            {
              type: 'text',
              text: stdout
            }
          ]
        };
      }

      case 'docker_logs': {
        const { stdout } = await execAsync(`docker logs --tail ${args.tail || 100} ${args.container}`);
        return {
          content: [
            {
              type: 'text',
              text: stdout || 'No logs found'
            }
          ]
        };
      }

      case 'docker_exec': {
        const { stdout } = await execAsync(`docker exec ${args.container} ${args.command}`);
        return {
          content: [
            {
              type: 'text',
              text: stdout
            }
          ]
        };
      }

      case 'docker_images': {
        const { stdout } = await execAsync('docker images --format "{{.Repository}}:{{.Tag}}\\t{{.ID}}\\t{{.Size}}"');
        return {
          content: [
            {
              type: 'text',
              text: stdout || 'No images found'
            }
          ]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Docker MCP Server running on stdio');
}

main().catch(console.error);
