/**
 * Handlers for MCP Resources and Prompts
 */

export function handleReadResource(uri: string) {
	switch (uri) {
		case 'agent-rules-kit://documentation':
			return {
				contents: [
					{
						uri,
						mimeType: 'text/markdown',
						text: `# Agent Rules Kit

Bootstrap Cursor rules (.cursor/rules) and mirror documentation (.md) for AI agent-guided projects.

## Key Features

- 🎯 Multi-Stack Support: 15+ frameworks including Laravel, Next.js, React, Angular, Vue, and more
- 🏗️ Architecture-Aware: Specialized rules for different architectural patterns (MVC, DDD, Hexagonal, etc.)
- 📦 Version Detection: Automatic framework version detection with version-specific optimizations
- 🌐 Global Best Practices: Universal coding standards and quality assurance rules
- 🔧 MCP Tools Integration: Multi-select support for popular Model Context Protocol tools
- ⚡ Performance Optimized: Efficient rule generation with progress tracking and memory management

## Basic Usage

\`\`\`bash
# Install globally
npm install -g agent-rules-kit

# Use in a project
agent-rules-kit
\`\`\`

For more information: https://github.com/tecnomanu/agent-rules-kit`,
					},
				],
			};

		case 'agent-rules-kit://usage-guide':
			return {
				contents: [
					{
						uri,
						mimeType: 'text/markdown',
						text: `# Usage Guide for AI Agents

## Automatic Rule Installation

1. **Get Available Options**: Use \`get_available_options\` to see all supported stacks and tools
2. **Detect Stack**: Use \`get_project_info\` to analyze the current project
3. **Install Rules**: Use \`install_rules\` to install appropriate rules with advanced options

## Example Workflow

\`\`\`bash
# 1. See available options
get_available_options

# 2. Analyze current project
get_project_info

# 3. Install rules with specific configuration
install_rules --stack=nodejs --version=20 --architecture=standard --mcp_tools=pampa,github --ide=cursor
\`\`\`

## Supported Stacks

- **Frontend**: React, Vue, Angular, Next.js, Astro
- **Backend**: Node.js, NestJS, Laravel, Spring Boot, Django, FastAPI
- **Mobile**: React Native
- **Emerging**: MCP (Model Context Protocol)

## Automatic Detection

The system automatically detects:
- package.json (Node.js ecosystem)
- composer.json (PHP/Laravel)
- pom.xml/build.gradle (Java/Spring)
- requirements.txt (Python)
- go.mod (Go)`,
					},
				],
			};

		default:
			throw new Error(`Unknown resource: ${uri}`);
	}
}

export function handleGetPrompt(name: string, args?: any) {
	switch (name) {
		case 'setup_project_rules':
			const projectPath = args?.project_path || process.cwd();
			const forceReinstall = args?.force_reinstall || false;

			return {
				description:
					'Automatic Cursor rules configuration for the project',
				messages: [
					{
						role: 'user',
						content: {
							type: 'text',
							text: `Analyze the project at "${projectPath}" and automatically configure the most appropriate Cursor rules.

Steps to follow:
1. Detect the project's technology stack
2. Install the corresponding rules
3. Report which rules were installed and why

${
	forceReinstall
		? 'IMPORTANT: Force reinstallation even if rules already exist.'
		: 'Only install if no previous rules exist.'
}

Use the available MCP tools to complete this task automatically.`,
						},
					},
				],
			};

		default:
			throw new Error(`Unknown prompt: ${name}`);
	}
}
