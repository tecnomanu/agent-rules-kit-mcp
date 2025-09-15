/**
 * MCP tool definitions for Agent Rules Kit
 */

export const TOOLS_DEFINITIONS = [
	{
		name: 'get_project_info',
		description:
			'Analyzes the current project to determine which technology stack it uses',
		inputSchema: {
			type: 'object',
			properties: {
				project_path: {
					type: 'string',
					description:
						'Path of the project to analyze (default: current directory)',
				},
			},
			required: [],
		},
	},
	{
		name: 'get_available_options',
		description:
			'Gets available stacks, versions, architectures, MCP tools, and IDEs from Agent Rules Kit',
		inputSchema: {
			type: 'object',
			properties: {},
			required: [],
		},
	},
	{
		name: 'install_rules',
		description:
			'Installs appropriate Cursor rules with advanced options like version, architecture, and MCP tools',
		inputSchema: {
			type: 'object',
			properties: {
				stack: {
					type: 'string',
					description:
						'Technology stack to install (automatically detected if not specified)',
				},
				version: {
					type: 'string',
					description:
						'Specific version of the stack (e.g., "11" for Laravel 11)',
				},
				architecture: {
					type: 'string',
					description:
						'Architecture pattern (e.g., "ddd", "hexagonal", "standard")',
				},
				mcp_tools: {
					type: 'array',
					items: {
						type: 'string',
					},
					description:
						'MCP tools to include (e.g., ["pampa", "github", "filesystem"])',
				},
				ide: {
					type: 'string',
					description:
						'Target IDE (e.g., "cursor", "vscode", "phpstorm")',
				},
				project_path: {
					type: 'string',
					description: 'Project path (default: current directory)',
				},
				global: {
					type: 'boolean',
					description:
						'Install globally instead of in specific project',
				},
				force: {
					type: 'boolean',
					description:
						'Force installation even if rules already exist',
				},
			},
			required: [],
		},
	},
] as const;

export const RESOURCES_DEFINITIONS = [
	{
		uri: 'agent-rules-kit://documentation',
		name: 'Agent Rules Kit Documentation',
		description: 'Complete Agent Rules Kit documentation',
		mimeType: 'text/markdown',
	},
	{
		uri: 'agent-rules-kit://usage-guide',
		name: 'Usage Guide',
		description: 'Usage guide for AI agents',
		mimeType: 'text/markdown',
	},
] as const;

export const PROMPTS_DEFINITIONS = [
	{
		name: 'setup_project_rules',
		description:
			'Automatically configures Cursor rules for the current project',
		arguments: [
			{
				name: 'project_path',
				description:
					'Project path (optional, uses current directory by default)',
				required: false,
			},
			{
				name: 'force_reinstall',
				description: 'Force reinstallation of existing rules',
				required: false,
			},
		],
	},
] as const;
