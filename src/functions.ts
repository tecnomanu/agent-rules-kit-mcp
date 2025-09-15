/**
 * MCP function implementations for Agent Rules Kit
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';

interface GetProjectInfoArgs {
	project_path?: string;
}

interface InstallRulesArgs {
	stack?: string;
	version?: string;
	architecture?: string;
	mcp_tools?: string[];
	ide?: string;
	project_path?: string;
	force?: boolean;
	global?: boolean;
}

interface ProjectInfo {
	stack: string;
	version?: string;
	architecture?: string;
	files_detected: string[];
	confidence: number;
}

/**
 * Gets available options from agent-rules-kit (stacks, MCPs, IDEs, etc.)
 */
export async function getAvailableOptions() {
	try {
		// First check if agent-rules-kit is available
		const available = await checkAgentRulesKitAvailable();
		if (!available) {
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify(
							{
								success: false,
								message:
									'Agent Rules Kit is not installed or not available in PATH',
								suggestion:
									'Install with: npm install -g agent-rules-kit',
							},
							null,
							2
						),
					},
				],
			};
		}

		// Execute agent-rules-kit --info command to get available options
		const result = await runAgentRulesKitCommand(['--info']);

		if (result.success && result.output) {
			// Parse the --info output to extract structured information
			const parsedInfo = parseAgentRulesKitInfo(result.output);
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify(
							{
								success: true,
								agent_rules_kit_info: parsedInfo,
								usage_examples: {
									basic: {
										command: 'install_rules',
										parameters: {
											stack: 'laravel',
											version: '11',
											architecture: 'ddd',
										},
									},
									advanced: {
										command: 'install_rules',
										parameters: {
											stack: 'nextjs',
											version: '14',
											architecture: 'app',
											mcp_tools: [
												'pampa',
												'github',
												'filesystem',
											],
											ide: 'cursor',
											global: false,
										},
									},
								},
							},
							null,
							2
						),
					},
				],
			};
		} else {
			// Fallback to static options if command fails
			return getStaticAvailableOptions();
		}
	} catch (error) {
		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(
						{
							success: false,
							message: 'Error getting available options',
							error:
								error instanceof Error
									? error.message
									: String(error),
						},
						null,
						2
					),
				},
			],
		};
	}
}

/**
 * Parses the output from agent-rules-kit --info command
 */
function parseAgentRulesKitInfo(output: string) {
	try {
		const lines = output.split('\n');
		const info = {
			version: '',
			stacks: [] as any[],
			mcp_tools: [] as any[],
			ides: [] as any[],
		};

		// Extract version
		const versionLine = lines.find((line) =>
			line.includes('Agent Rules Kit v')
		);
		if (versionLine) {
			const versionMatch = versionLine.match(/v(\d+\.\d+\.\d+)/);
			if (versionMatch) {
				info.version = versionMatch[1];
			}
		}

		// Parse stacks section
		let inStacksSection = false;
		let currentStack: any = null;

		for (const line of lines) {
			if (line.includes('📚 Supported Stacks:')) {
				inStacksSection = true;
				continue;
			}

			if (inStacksSection && line.includes('🔧 MCP Tools:')) {
				inStacksSection = false;
				if (currentStack) {
					info.stacks.push(currentStack);
				}
				continue;
			}

			if (inStacksSection) {
				// New stack
				if (
					line.trim() &&
					!line.includes('🏷️') &&
					!line.includes('🏗️') &&
					!line.includes('⭐') &&
					line.trim().toUpperCase() === line.trim()
				) {
					if (currentStack) {
						info.stacks.push(currentStack);
					}
					currentStack = {
						name: line.trim().toLowerCase(),
						versions: [],
						architectures: [],
						default_architecture: '',
					};
				}

				// Versions
				if (line.includes('🏷️  Versions:') && currentStack) {
					const versionsMatch = line.match(/Versions: (.+)/);
					if (versionsMatch) {
						currentStack.versions = versionsMatch[1]
							.split(', ')
							.map((v) => v.trim());
					}
				}

				// Architectures
				if (line.includes('🏗️  Architectures:') && currentStack) {
					const archMatch = line.match(/Architectures: (.+)/);
					if (archMatch) {
						currentStack.architectures = archMatch[1]
							.split(', ')
							.map((a) => a.trim());
					}
				}

				// Default
				if (line.includes('⭐ Default:') && currentStack) {
					const defaultMatch = line.match(/Default: (.+)/);
					if (defaultMatch) {
						currentStack.default_architecture =
							defaultMatch[1].trim();
					}
				}
			}
		}

		// Add last stack if exists
		if (currentStack) {
			info.stacks.push(currentStack);
		}

		// Parse MCP tools
		let inMcpSection = false;
		for (const line of lines) {
			if (line.includes('🔧 MCP Tools:')) {
				inMcpSection = true;
				continue;
			}

			if (inMcpSection && line.includes('🎯 Supported IDEs:')) {
				inMcpSection = false;
				continue;
			}

			if (inMcpSection && line.includes('•')) {
				const toolMatch = line.match(/• (\w+) - (.+)/);
				if (toolMatch) {
					info.mcp_tools.push({
						name: toolMatch[1].toLowerCase(),
						description: toolMatch[2],
					});
				}
			}
		}

		// Parse IDEs
		let inIdeSection = false;
		for (const line of lines) {
			if (line.includes('🎯 Supported IDEs:')) {
				inIdeSection = true;
				continue;
			}

			if (inIdeSection && line.includes('💡 Usage Examples:')) {
				inIdeSection = false;
				continue;
			}

			if (inIdeSection && line.includes('•')) {
				const ideMatch = line.match(/• (.+?) \((\w+)\): (.+)/);
				if (ideMatch) {
					info.ides.push({
						name: ideMatch[1],
						key: ideMatch[2],
						output: ideMatch[3],
					});
				}
			}
		}

		return info;
	} catch (error) {
		// Error parsing agent-rules-kit info - silently return null
		return null;
	}
}

/**
 * Fallback static options when dynamic detection fails
 */
function getStaticAvailableOptions() {
	return {
		content: [
			{
				type: 'text',
				text: JSON.stringify(
					{
						success: true,
						available_options: {
							stacks: [
								{
									name: 'laravel',
									versions: ['8', '9', '10', '11'],
									architectures: [
										'standard',
										'ddd',
										'hexagonal',
									],
								},
								{
									name: 'nextjs',
									versions: ['12', '13', '14', '15'],
									architectures: [
										'app-router',
										'pages-router',
									],
								},
								{
									name: 'react',
									versions: ['16', '17', '18', '19'],
									architectures: [
										'standard',
										'hooks',
										'concurrent',
									],
								},
								{
									name: 'angular',
									versions: [
										'12',
										'13',
										'14',
										'15',
										'16',
										'17',
										'18',
									],
									architectures: [
										'standard',
										'standalone',
										'micro-frontends',
									],
								},
								{
									name: 'vue',
									versions: ['2', '3'],
									architectures: [
										'options-api',
										'composition-api',
										'nuxt',
									],
								},
								{
									name: 'nestjs',
									versions: ['8', '9', '10'],
									architectures: [
										'standard',
										'microservices',
										'graphql',
									],
								},
								{
									name: 'spring-boot',
									versions: ['2', '3'],
									architectures: [
										'standard',
										'reactive',
										'microservices',
									],
								},
								{
									name: 'django',
									versions: ['4', '5'],
									architectures: ['mvt', 'api', 'full-stack'],
								},
								{
									name: 'fastapi',
									versions: ['0.100+'],
									architectures: [
										'standard',
										'async',
										'microservices',
									],
								},
							],
							mcp_tools: [
								'pampa',
								'github',
								'filesystem',
								'puppeteer',
								'brave-search',
								'memory',
								'fetch',
								'postgres',
								'sqlite',
								'everart',
								'cloudflare',
								'aws',
							],
							ides: ['cursor', 'vscode', 'webstorm', 'phpstorm'],
						},
						usage_example: {
							command: 'install_rules',
							parameters: {
								stack: 'laravel',
								version: '11',
								architecture: 'ddd',
								mcp_tools: ['pampa', 'github'],
								global: true,
							},
						},
					},
					null,
					2
				),
			},
		],
	};
}

/**
 * Helper function to run agent-rules-kit commands
 */
async function runAgentRulesKitCommand(
	args: string[]
): Promise<{ success: boolean; output: string; error?: string }> {
	return new Promise((resolve) => {
		const child = spawn('npx', ['-y', 'agent-rules-kit', ...args], {
			stdio: ['pipe', 'pipe', 'pipe'],
			shell: true,
		});

		let stdout = '';
		let stderr = '';

		child.stdout?.on('data', (data) => {
			stdout += data.toString();
		});

		child.stderr?.on('data', (data) => {
			stderr += data.toString();
		});

		child.on('close', (code) => {
			resolve({
				success: code === 0,
				output: stdout,
				error: code !== 0 ? stderr : undefined,
			});
		});

		// Timeout after 15 seconds
		setTimeout(() => {
			child.kill();
			resolve({
				success: false,
				output: stdout,
				error: 'Timeout: Command took more than 15 seconds',
			});
		}, 15000);
	});
}

/**
 * Helper function to check if agent-rules-kit is available
 */
export async function checkAgentRulesKitAvailable(): Promise<boolean> {
	try {
		// Check if npx is available and can run agent-rules-kit
		const child = spawn('npx', ['-y', 'agent-rules-kit', '--version'], {
			stdio: ['pipe', 'pipe', 'pipe'],
			shell: true,
		});

		return new Promise((resolve) => {
			let hasOutput = false;

			child.stdout?.on('data', () => {
				hasOutput = true;
			});

			child.on('close', (code) => {
				resolve(code === 0 && hasOutput);
			});

			// Timeout after 10 seconds
			setTimeout(() => {
				child.kill();
				resolve(false);
			}, 10000);
		});
	} catch {
		return false;
	}
}

/**
 * Analyzes a project to detect the technology stack
 */
export async function getProjectInfo(args: GetProjectInfoArgs = {}) {
	try {
		const projectPath = args.project_path || process.cwd();
		const projectInfo = await detectProjectStack(projectPath);

		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(
						{
							success: true,
							project_path: projectPath,
							detected_stack: projectInfo,
							recommendation: `Detected ${projectInfo.stack}${
								projectInfo.version
									? ` v${projectInfo.version}`
									: ''
							} with ${projectInfo.confidence}% confidence.`,
						},
						null,
						2
					),
				},
			],
		};
	} catch (error) {
		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(
						{
							success: false,
							message: 'Error analyzing project',
							error:
								error instanceof Error
									? error.message
									: String(error),
						},
						null,
						2
					),
				},
			],
		};
	}
}

/**
 * Installs appropriate Cursor rules for the project
 */
export async function installRules(args: InstallRulesArgs = {}) {
	try {
		const projectPath = args.project_path || process.cwd();
		let stack = args.stack;

		// If stack is not specified, detect it automatically
		if (!stack) {
			const projectInfo = await detectProjectStack(projectPath);
			stack = projectInfo.stack;
		}

		// Check if rules already exist
		const rulesPath = join(projectPath, '.cursor', 'rules');
		const rulesExist = await checkFileExists(rulesPath);

		if (rulesExist && !args.force) {
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify(
							{
								success: false,
								message:
									'Cursor rules already exist in the project',
								suggestion:
									'Use force: true to overwrite existing rules',
								existing_rules_path: rulesPath,
							},
							null,
							2
						),
					},
				],
			};
		}

		// Execute agent-rules-kit with appropriate parameters
		const result = await runAgentRulesKitInstall(args, projectPath, stack);

		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(
						{
							success: result.success,
							message: result.success
								? `${stack} rules installed successfully`
								: 'Error installing rules',
							stack_installed: stack,
							project_path: projectPath,
							output: result.output,
							error: result.error,
						},
						null,
						2
					),
				},
			],
		};
	} catch (error) {
		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(
						{
							success: false,
							message: 'Error installing rules',
							error:
								error instanceof Error
									? error.message
									: String(error),
						},
						null,
						2
					),
				},
			],
		};
	}
}

/**
 * Detects the technology stack of a project
 */
async function detectProjectStack(projectPath: string): Promise<ProjectInfo> {
	const detectors = [
		// Node.js ecosystem
		{
			files: ['package.json'],
			detector: async () => {
				try {
					const packageJson = JSON.parse(
						await fs.readFile(
							join(projectPath, 'package.json'),
							'utf-8'
						)
					);
					const deps = {
						...packageJson.dependencies,
						...packageJson.devDependencies,
					};

					// React
					if (deps.react) {
						if (deps.next)
							return { stack: 'Next.js', version: deps.next };
						return { stack: 'React', version: deps.react };
					}

					// Vue
					if (deps.vue) {
						if (deps.nuxt)
							return {
								stack: 'Vue.js',
								version: deps.vue,
								architecture: 'Nuxt',
							};
						return { stack: 'Vue.js', version: deps.vue };
					}

					// Angular
					if (deps['@angular/core']) {
						return {
							stack: 'Angular',
							version: deps['@angular/core'],
						};
					}

					// NestJS
					if (deps['@nestjs/core']) {
						return {
							stack: 'NestJS',
							version: deps['@nestjs/core'],
						};
					}

					// Express
					if (deps.express) {
						return { stack: 'Express.js', version: deps.express };
					}

					// React Native
					if (deps['react-native']) {
						return {
							stack: 'React Native',
							version: deps['react-native'],
						};
					}

					// Generic Node.js
					return { stack: 'Node.js', version: process.version };
				} catch {
					return null;
				}
			},
		},

		// PHP/Laravel
		{
			files: ['composer.json'],
			detector: async () => {
				try {
					const composerJson = JSON.parse(
						await fs.readFile(
							join(projectPath, 'composer.json'),
							'utf-8'
						)
					);
					const deps = {
						...composerJson.require,
						...composerJson['require-dev'],
					};

					if (deps['laravel/framework']) {
						return {
							stack: 'Laravel',
							version: deps['laravel/framework'],
						};
					}

					return { stack: 'PHP', version: deps.php };
				} catch {
					return null;
				}
			},
		},

		// Python
		{
			files: ['requirements.txt', 'pyproject.toml', 'setup.py'],
			detector: async () => {
				try {
					// Django
					if (await checkFileExists(join(projectPath, 'manage.py'))) {
						return { stack: 'Django' };
					}

					// FastAPI
					const files = ['main.py', 'app.py'];
					for (const file of files) {
						if (await checkFileExists(join(projectPath, file))) {
							const content = await fs.readFile(
								join(projectPath, file),
								'utf-8'
							);
							if (
								content.includes('fastapi') ||
								content.includes('FastAPI')
							) {
								return { stack: 'FastAPI' };
							}
						}
					}

					return { stack: 'Python' };
				} catch {
					return null;
				}
			},
		},

		// Java/Spring
		{
			files: ['pom.xml', 'build.gradle'],
			detector: async () => {
				try {
					if (await checkFileExists(join(projectPath, 'pom.xml'))) {
						const pomContent = await fs.readFile(
							join(projectPath, 'pom.xml'),
							'utf-8'
						);
						if (pomContent.includes('spring-boot')) {
							return { stack: 'Spring Boot' };
						}
					}
					return { stack: 'Java' };
				} catch {
					return null;
				}
			},
		},

		// Go
		{
			files: ['go.mod'],
			detector: async () => {
				return { stack: 'Go' };
			},
		},
	];

	for (const { files, detector } of detectors) {
		const filesExist = await Promise.all(
			files.map((file) => checkFileExists(join(projectPath, file)))
		);

		if (filesExist.some((exists) => exists)) {
			const result = await detector();
			if (result) {
				return {
					...result,
					files_detected: files.filter((_, i) => filesExist[i]),
					confidence: 90,
				};
			}
		}
	}

	// Fallback: analyze common files
	const commonFiles: string[] = await fs.readdir(projectPath).catch(() => []);

	if (commonFiles.includes('index.html')) {
		return {
			stack: 'HTML/CSS/JS',
			files_detected: ['index.html'],
			confidence: 60,
		};
	}

	return {
		stack: 'Unknown',
		files_detected: [],
		confidence: 0,
	};
}

/**
 * Executes agent-rules-kit to install rules with advanced parameters
 */
async function runAgentRulesKitInstall(
	options: InstallRulesArgs,
	projectPath: string,
	stack: string
): Promise<{ success: boolean; output: string; error?: string }> {
	return new Promise((resolve) => {
		// Build command with all parameters
		const args = [`--stack=${stack}`, '--auto'];

		// Add version if specified
		if (options.version) {
			args.push(`--version=${options.version}`);
		}

		// Add architecture if specified
		if (options.architecture) {
			args.push(`--architecture=${options.architecture}`);
		}

		// Add MCP tools if specified
		if (options.mcp_tools && options.mcp_tools.length > 0) {
			args.push(`--mcp-tools=${options.mcp_tools.join(',')}`);
		}

		// Add IDE if specified
		if (options.ide) {
			args.push(`--ide=${options.ide}`);
		}

		// Add global flag if specified
		if (options.global) {
			args.push('--global');
		}

		// Add force flag if specified
		if (options.force) {
			args.push('--force');
		}

		// Create a script that automatically responds to prompts using npx
		const script = `
			#!/bin/bash
			cd "${projectPath}"
			{
				echo ""     # Press ENTER to continue
				echo ""     # Any additional prompt
				echo ""     # Any additional prompt
				echo ""     # Any additional prompt
				echo ""     # Any additional prompt
			} | npx -y agent-rules-kit ${args.join(' ')}
		`;

		const child = spawn('bash', ['-c', script], {
			stdio: ['pipe', 'pipe', 'pipe'],
		});

		let stdout = '';
		let stderr = '';

		child.stdout?.on('data', (data) => {
			stdout += data.toString();
		});

		child.stderr?.on('data', (data) => {
			stderr += data.toString();
		});

		child.on('close', (code) => {
			resolve({
				success: code === 0,
				output: stdout,
				error: code !== 0 ? stderr : undefined,
			});
		});

		// Timeout after 30 seconds
		setTimeout(() => {
			child.kill();
			resolve({
				success: false,
				output: stdout,
				error: 'Timeout: Process took more than 30 seconds',
			});
		}, 30000);
	});
}

/**
 * Checks if a file exists
 */
async function checkFileExists(filePath: string): Promise<boolean> {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
}
