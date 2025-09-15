# Agent Rules Kit MCP Server

<p align="center">
  <img src="https://img.shields.io/badge/MCP-Server-6f42c1?style=for-the-badge&logo=server" alt="MCP Server" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
</p>

A comprehensive MCP (Model Context Protocol) server that provides tools to execute and automate [Agent Rules Kit](https://github.com/tecnomanu/agent-rules-kit) from MCP-compatible AI applications.

## 🎧 Audio Introduction

Listen to a brief introduction about Agent Rules Kit:

**English Version**  
https://github.com/user-attachments/assets/7d65c696-245d-421d-9ddc-90331a92c9b2

**Spanish Version**  
https://github.com/user-attachments/assets/8e91d651-c15f-4892-a250-684ab60d8594

## About Agent Rules Kit

This MCP server integrates with [Agent Rules Kit](https://github.com/tecnomanu/agent-rules-kit), a powerful CLI tool that generates Cursor rules (`.mdc` files) for multiple technology stacks and MCP tools integration. Agent Rules Kit helps AI agents better understand project structure, patterns, and best practices across different frameworks.

## How It Works

This MCP server acts as a bridge between AI applications and Agent Rules Kit:

1. **Project Analysis**: AI agents can use `get_project_info` to understand the current project's technology stack
2. **Automated Installation**: The `install_rules` tool automatically installs the most appropriate Cursor rules
3. **Interactive Setup**: The `setup_project_rules` prompt provides a complete automated workflow
4. **Resource Access**: Built-in documentation and guides help agents understand available options

## Integration with AI Agents

AI agents can use this MCP server to:

-   **🤖 Automatically detect** project technology stacks
-   **⚡ Install appropriate rules** without manual intervention
-   **📖 Access documentation** about supported frameworks and tools
-   **🔄 Update rules** when project requirements change
-   **🎯 Follow best practices** for each technology stack

**Key capabilities of Agent Rules Kit:**

-   🎯 **Multi-Stack Support**: 15+ frameworks including Laravel, Next.js, React, Angular, Vue, and more
-   🏗️ **Architecture-Aware**: Specialized rules for different architectural patterns (MVC, DDD, Hexagonal, etc.)
-   🔧 **MCP Tools Integration**: Multi-select support for popular MCP tools (PAMPA, GitHub, Memory, Filesystem, Git)
-   📦 **Version Detection**: Automatic framework version detection with version-specific optimizations

## Features

-   **🛠️ Multiple Tools**: Automatic project analysis and rule installation
-   **📋 Resources**: Built-in documentation and guides accessible via MCP
-   **🎯 Prompts**: Automated templates for project configuration
-   **🔍 Intelligent Detection**: Automatically recognizes 15+ technology stacks
-   **🚀 Two execution modes**:
    -   **STDIO**: For direct integration with MCP clients
    -   **HTTP**: For remote connections via HTTP/REST

## Installation

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run build
```

## Usage

### STDIO Mode (Recommended for local integration)

```bash
# Development with watch mode
npm run dev:stdio

# Production
npm start
```

### HTTP Mode (For remote connections)

```bash
# Development
npm run dev:http

# Production
npm run start:http
```

The HTTP server will be available at `http://localhost:3001` by default.

## Available Tools

### `start_agent_rules_kit`

Starts the Agent Rules Kit system by executing the corresponding terminal command.

**Optional parameters:**

-   `config_path` (string): Path to configuration file
-   `port` (number): Port to run the service (default 3000)
-   `mode` (string): Execution mode - "dev" or "prod"

### `get_project_info`

Analyzes the current project to automatically detect the technology stack.

**Optional parameters:**

-   `project_path` (string): Path to the project to analyze (default: current directory)

**Supported stacks:**

-   **Frontend**: React, Vue, Angular, Next.js, Astro
-   **Backend**: Node.js, NestJS, Laravel, Spring Boot, Django, FastAPI
-   **Mobile**: React Native
-   **Others**: Go, Java, Python, PHP

### `install_rules`

Automatically installs appropriate Cursor rules based on the detected stack.

**Optional parameters:**

-   `stack` (string): Specific stack to install (auto-detected if not specified)
-   `project_path` (string): Project path (default: current directory)
-   `force` (boolean): Force installation even if rules already exist

**Example automated flow:**

```json
{
	"name": "install_rules",
	"arguments": {
		"project_path": "/path/to/project",
		"force": true
	}
}
```

## Available Resources

-   **`agent-rules-kit://documentation`**: Complete project documentation
-   **`agent-rules-kit://stacks`**: Detailed list of supported technology stacks
-   **`agent-rules-kit://usage-guide`**: Usage guide for AI agents

## Available Prompts

### `setup_project_rules`

Automated prompt that configures Cursor rules for any project automatically.

**Parameters:**

-   `project_path` (optional): Project path
-   `force_reinstall` (optional): Force reinstallation

## MCP Client Configuration

### Claude Desktop

Add to Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
	"mcpServers": {
		"agent-rules-kit": {
			"command": "node",
			"args": ["/path/to/agent-rules-kit-mcp/dist/index.js"]
		}
	}
}
```

### HTTP Connection

For HTTP connections, the following endpoints are available:

-   **GET** `/health` - Server status
-   **GET** `/info` - Server information
-   **GET** `/tools` - List of available tools
-   **POST** `/tools/call` - Execute a tool

Example HTTP call:

```bash
curl -X POST http://localhost:3001/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "install_rules",
    "arguments": {
      "project_path": "/path/to/project",
      "force": true
    }
  }'
```

## Development

```bash
# Clean compiled files
npm run clean

# Compile
npm run build

# Watch mode for development
npm run dev
```

## Requirements

-   Node.js >= 18.0.0
-   The `agent-rules-kit` command must be available in the system PATH

## Project Structure

```
src/
├── index.ts      # Main MCP server (STDIO mode)
├── http.ts       # MCP server HTTP mode
├── tools.ts      # Common tool, resource and prompt definitions
├── functions.ts  # MCP function implementations
└── handlers.ts   # Resource and prompt handlers
```

## Related Links

-   **[Agent Rules Kit Repository](https://github.com/tecnomanu/agent-rules-kit)** - Main CLI tool
-   **[Agent Setup Guide](https://github.com/tecnomanu/agent-rules-kit/blob/main/AGENTS.md)** - Instructions for AI agents
-   **[Model Context Protocol](https://modelcontextprotocol.io/)** - Official MCP documentation

## License

MIT
