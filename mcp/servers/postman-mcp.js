#!/usr/bin/env node
/**
 * Postman MCP Server (via Newman)
 * Run Postman collections and manage API tests
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const server = new Server(
  {
    name: 'postman-mcp-server',
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
        name: 'postman_run_collection',
        description: 'Run a Postman collection using Newman',
        inputSchema: {
          type: 'object',
          properties: {
            collection: {
              type: 'string',
              description: 'Path to collection JSON file or collection URL'
            },
            environment: {
              type: 'string',
              description: 'Path to environment JSON file (optional)'
            },
            globals: {
              type: 'string',
              description: 'Path to globals JSON file (optional)'
            }
          },
          required: ['collection']
        }
      },
      {
        name: 'postman_run_collection_with_data',
        description: 'Run collection with data file for iterations',
        inputSchema: {
          type: 'object',
          properties: {
            collection: {
              type: 'string',
              description: 'Path to collection JSON file'
            },
            data: {
              type: 'string',
              description: 'Path to data CSV/JSON file'
            },
            environment: {
              type: 'string',
              description: 'Path to environment JSON file (optional)'
            }
          },
          required: ['collection', 'data']
        }
      },
      {
        name: 'postman_validate_collection',
        description: 'Validate a Postman collection file',
        inputSchema: {
          type: 'object',
          properties: {
            collection: {
              type: 'string',
              description: 'Path to collection JSON file'
            }
          },
          required: ['collection']
        }
      }
    ]
  };
});

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'postman_run_collection': {
        let cmd = `./bin/newman run ${args.collection}`;
        if (args.environment) cmd += ` -e ${args.environment}`;
        if (args.globals) cmd += ` -g ${args.globals}`;
        cmd += ' --reporters cli,json --reporter-json-export /tmp/newman-result.json';
        
        const { stdout, stderr } = await execAsync(cmd, { cwd: '/workspaces/alpine-3' });
        return {
          content: [{ type: 'text', text: stdout || stderr }]
        };
      }

      case 'postman_run_collection_with_data': {
        let cmd = `./bin/newman run ${args.collection} -d ${args.data}`;
        if (args.environment) cmd += ` -e ${args.environment}`;
        cmd += ' --reporters cli';
        
        const { stdout, stderr } = await execAsync(cmd, { cwd: '/workspaces/alpine-3' });
        return {
          content: [{ type: 'text', text: stdout || stderr }]
        };
      }

      case 'postman_validate_collection': {
        const { stdout } = await execAsync(`cat ${args.collection}`, { cwd: '/workspaces/alpine-3' });
        const collection = JSON.parse(stdout);
        return {
          content: [{ 
            type: 'text', 
            text: `Valid collection: ${collection.info.name}\nVersion: ${collection.info.schema}\nRequests: ${collection.item?.length || 0}` 
          }]
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
  console.error('Postman MCP Server running on stdio');
}

main().catch(console.error);
