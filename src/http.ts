#!/usr/bin/env node

/**
 * Agent Rules Kit MCP Server - HTTP Mode
 * MCP server that runs as an HTTP service
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import cors from 'cors';
import express from 'express';
import {
	getAvailableOptions,
	getProjectInfo,
	installRules,
} from './functions.js';
import { TOOLS_DEFINITIONS } from './tools.js';

/**
 * Create and configure the MCP server
 */
const server = new Server(
	{
		name: 'agent-rules-kit-mcp',
		version: '1.0.0',
	},
	{
		capabilities: {
			tools: {},
			resources: {},
			prompts: {},
		},
	}
);

/**
 * Handler to list available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
	return {
		tools: TOOLS_DEFINITIONS,
	};
});

/**
 * Handler to execute tools
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
	const { name, arguments: args } = request.params;

	switch (name) {
		case 'get_project_info':
			return await getProjectInfo(args);

		case 'get_available_options':
			return await getAvailableOptions();

		case 'install_rules':
			return await installRules(args);

		default:
			throw new Error(`Unknown tool: ${name}`);
	}
});

/**
 * Configure Express server
 */
function createExpressApp() {
	const app = express();

	// Middleware
	app.use(cors());
	app.use(express.json());

	// Health endpoint
	app.get('/health', (req, res) => {
		res.json({
			status: 'healthy',
			server: 'agent-rules-kit-mcp',
			version: '1.0.0',
			timestamp: new Date().toISOString(),
		});
	});

	// Information endpoint
	app.get('/info', (req, res) => {
		res.json({
			name: 'Agent Rules Kit MCP Server',
			description: 'MCP server to execute Agent Rules Kit',
			version: '1.0.0',
			capabilities: ['tools', 'resources', 'prompts'],
			tools: [
				'get_project_info',
				'get_available_options',
				'install_rules',
			],
		});
	});

	return app;
}

/**
 * Main function to start the HTTP server
 */
async function main() {
	const port = parseInt(process.env.PORT || '3001');
	const app = createExpressApp();

	// Endpoint to list available tools
	app.get('/tools', async (req, res) => {
		try {
			res.json({
				tools: TOOLS_DEFINITIONS,
			});
		} catch (error) {
			res.status(500).json({
				error: 'Error listing tools',
				message: error instanceof Error ? error.message : String(error),
			});
		}
	});

	// Endpoint to execute tools
	app.post('/tools/call', async (req, res) => {
		try {
			const { name, arguments: args } = req.body;

			switch (name) {
				case 'get_project_info':
					const projectInfo = await getProjectInfo(args || {});
					res.json(projectInfo);
					break;
				case 'get_available_options':
					const availableOptions = await getAvailableOptions();
					res.json(availableOptions);
					break;
				case 'install_rules':
					const installResult = await installRules(args || {});
					res.json(installResult);
					break;
				default:
					res.status(400).json({
						error: `Unknown tool: ${name}`,
					});
			}
		} catch (error) {
			res.status(500).json({
				error: 'Error executing tool',
				message: error instanceof Error ? error.message : String(error),
			});
		}
	});

	try {
		// Start HTTP server
		app.listen(port, () => {
			console.log(
				`Agent Rules Kit MCP Server (HTTP) running on port ${port}`
			);
			console.log(`Available endpoints:`);
			console.log(`  - Health: http://localhost:${port}/health`);
			console.log(`  - Info: http://localhost:${port}/info`);
			console.log(`  - Tools: http://localhost:${port}/tools`);
			console.log(`  - Call Tool: http://localhost:${port}/tools/call`);
		});
	} catch (error) {
		console.error('Error starting MCP HTTP server:', error);
		process.exit(1);
	}
}

// Execute the server if this file is the entry point
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch((error) => {
		console.error('Fatal error:', error);
		process.exit(1);
	});
}

export { createExpressApp, server };
