#!/usr/bin/env node

/**
 * Agent Rules Kit MCP Server
 * A simple MCP server that provides tools to execute agent-rules-kit
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
	CallToolRequestSchema,
	GetPromptRequestSchema,
	ListPromptsRequestSchema,
	ListResourcesRequestSchema,
	ListToolsRequestSchema,
	ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {
	getAvailableOptions,
	getProjectInfo,
	installRules,
} from './functions.js';
import { handleGetPrompt, handleReadResource } from './handlers.js';
import {
	PROMPTS_DEFINITIONS,
	RESOURCES_DEFINITIONS,
	TOOLS_DEFINITIONS,
} from './tools.js';

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
 * Handler to list available resources
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
	return {
		resources: RESOURCES_DEFINITIONS,
	};
});

/**
 * Handler to read specific resources
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
	const { uri } = request.params;
	return handleReadResource(uri);
});

/**
 * Handler to list available prompts
 */
server.setRequestHandler(ListPromptsRequestSchema, async () => {
	return {
		prompts: PROMPTS_DEFINITIONS,
	};
});

/**
 * Handler to get specific prompts
 */
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
	const { name, arguments: args } = request.params;
	return handleGetPrompt(name, args);
});

/**
 * Main function to start the server
 */
async function main() {
	try {
		const transport = new StdioServerTransport();
		await server.connect(transport);
		
		// Log to stderr for debugging (stdout is used for MCP communication)
		console.error('Agent Rules Kit MCP Server started successfully');
	} catch (error) {
		console.error('Failed to start MCP server:', error);
		process.exit(1);
	}
}

// Always start the server when this module is executed directly
main().catch((error) => {
	console.error('Error starting MCP server:', error);
	process.exit(1);
});
