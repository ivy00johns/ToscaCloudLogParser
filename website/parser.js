// Tosca Log Parser - Standalone Version
class ToscaLogParser {
	constructor() {
		this.parsedData = [];
		this.groupedData = [];
		this.filteredData = [];
		this.bufferVariableCount = 0;
		this.debugMode = false;
		this.debugLogs = [];
		this.currentView = 'variables'; // 'variables', 'logs', or 'table'
		this.rawLogText = '';
		this.wordWrapEnabled = false;

		this.init();
	}

	init() {
		this.setupEventListeners();
		this.log('Parser initialized');
	}

	log(message, data = null) {
		const timestamp = new Date().toISOString();
		const logEntry = `[${timestamp}] ${message}`;
		this.debugLogs.push(logEntry);
		if (data) {
			this.debugLogs.push(JSON.stringify(data, null, 2));
		}
		console.log(logEntry, data);
		this.updateDebugDisplay();
	}

	updateDebugDisplay() {
		if (this.debugMode) {
			const debugContent = document.getElementById('debugContent');
			debugContent.textContent = this.debugLogs.slice(-50).join('\n');
		}
	}

	setupEventListeners() {
		// Input mode switching
		document.getElementById('pasteBtn').addEventListener('click', () => this.switchInputMode('paste'));
		document.getElementById('fileBtn').addEventListener('click', () => this.switchInputMode('file'));
		document.getElementById('debugBtn').addEventListener('click', () => this.toggleDebug());

		// File input
		document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileInput(e));

		// Parse button
		document.getElementById('parseBtn').addEventListener('click', () => this.parseContent());

		// Filter handlers
		document.getElementById('searchFilter').addEventListener('input', () => this.applyFilters());

		// Action buttons
		document.getElementById('variablesViewBtn').addEventListener('click', () => this.showVariablesView());
		document.getElementById('logsViewBtn').addEventListener('click', () => this.showLogsView());
		document.getElementById('tableViewBtn').addEventListener('click', () => this.showTableView());
		document.getElementById('wordWrapBtn').addEventListener('click', () => this.toggleWordWrap());
		document.getElementById('copyAllBtn').addEventListener('click', () => this.copyAllResults());
		document.getElementById('exportBtn').addEventListener('click', () => this.exportResults());
		document.getElementById('clearBtn').addEventListener('click', () => this.clearResults());
	}

	// NEW: Check if a string is valid JSON
	isValidJSON(str) {
		if (!str || typeof str !== 'string') return false;

		// Trim whitespace
		str = str.trim();

		// Must start with { or [
		if (!str.startsWith('{') && !str.startsWith('[')) return false;

		try {
			const parsed = JSON.parse(str);
			return true;
		} catch (e) {
			return false;
		}
	}

	// NEW: Format JSON with syntax highlighting
	formatJSONWithHighlighting(jsonStr) {
		try {
			const parsed = JSON.parse(jsonStr);
			const formatted = JSON.stringify(parsed, null, 2);

			// Simple syntax highlighting using HTML spans
			return formatted
				.replace(/(".*?")(:)/g, '<span class="json-key">$1</span><span class="json-colon">$2</span>')
				.replace(/(:)(\s*)(".*?")/g, '$1$2<span class="json-string">$3</span>')
				.replace(/(:)(\s*)(true|false)/g, '$1$2<span class="json-boolean">$3</span>')
				.replace(/(:)(\s*)(null)/g, '$1$2<span class="json-null">$3</span>')
				.replace(/(:)(\s*)(\d+\.?\d*)/g, '$1$2<span class="json-number">$3</span>');
		} catch (e) {
			return jsonStr;
		}
	}

	// NEW: Detect variable type including JSON
	detectVariableType(name, value) {
		// Check for JSON FIRST - most important to get right
		if (this.isValidJSON(value)) {
			// Only treat as JSON if it's actually structured data (objects/arrays)
			try {
				const parsed = JSON.parse(value);
				if (typeof parsed === 'object' && parsed !== null &&
					(Array.isArray(parsed) || Object.keys(parsed).length > 0)) {
					return 'JSON';
				}
			} catch (e) {
				// Not valid JSON
			}
		}

		// Check for access tokens (should be truncated) - before URL check
		if (name.toLowerCase().includes('token') || name.toLowerCase().includes('access')) {
			return 'Token';
		}

		// Check for URLs (but only if not JSON and not a complex object)
		if ((value.includes('http://') || value.includes('https://')) && !value.includes('{') && !value.includes('"')) {
			return 'URL';
		}

		// Check for common ID patterns
		if (name.toLowerCase().includes('id') && (
			value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) || // UUID
			value.match(/^[A-Za-z0-9_-]{20,}$/) // Long alphanumeric ID
		)) {
			return 'ID';
		}

		// Check for timestamps
		if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
			return 'Timestamp';
		}

		return 'Buffer Variable';
	}

	switchInputMode(mode) {
		// Update button states
		document.querySelectorAll('.input-btn').forEach(btn => btn.classList.remove('active'));
		document.querySelectorAll('.input-mode').forEach(mode => mode.classList.remove('active'));

		if (mode === 'paste') {
			document.getElementById('pasteBtn').classList.add('active');
			document.getElementById('pasteMode').classList.add('active');
		} else if (mode === 'file') {
			document.getElementById('fileBtn').classList.add('active');
			document.getElementById('fileMode').classList.add('active');
		}
	}

	toggleDebug() {
		this.debugMode = !this.debugMode;
		const debugSection = document.getElementById('debugSection');
		const debugBtn = document.getElementById('debugBtn');

		if (this.debugMode) {
			debugSection.style.display = 'block';
			debugBtn.style.background = '#dc3545';
			debugBtn.textContent = '🐛 Hide Debug';
		} else {
			debugSection.style.display = 'none';
			debugBtn.style.background = '#ffc107';
			debugBtn.textContent = '🐛 Debug';
		}
		this.updateDebugDisplay();
	}

	handleFileInput(e) {
		const file = e.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const content = e.target.result;
				let logContent = content;

				try {
					const jsonData = JSON.parse(content);
					if (jsonData.logs) {
						logContent = jsonData.logs;
					} else if (typeof jsonData === 'string') {
						logContent = jsonData;
					}
				} catch {
					// Not JSON, use as plain text
				}

				document.getElementById('logInput').value = logContent;
				this.switchInputMode('paste');
				this.log('File loaded successfully', { filename: file.name, size: content.length });
			} catch (error) {
				alert('Error reading file: ' + error.message);
				this.log('File load error', error);
			}
		};
		reader.readAsText(file);
	}

	parseContent() {
		const logText = document.getElementById('logInput').value.trim();
		if (!logText) {
			alert('Please provide some log content to parse.');
			return;
		}

		this.log('Starting parse', { textLength: logText.length });

		// Store raw log text for log view
		this.rawLogText = logText;

		// Filter out content before "Starting TestCase"
		const filteredLogText = this.filterRelevantLogs(logText);
		this.log('Filtered logs', { originalLines: logText.split('\n').length, filteredLines: filteredLogText.split('\n').length });

		this.parsedData = this.parseLogContent(filteredLogText);
		this.log('Parsed variables', { count: this.parsedData.length });

		// Post-process to fix any JSON parsing issues
		this.parsedData = this.postProcessVariables(this.parsedData);
		this.log('Post-processed variables', { count: this.parsedData.length });

		this.groupedData = this.groupLogsByContext(this.parsedData);
		this.log('Grouped data', { groups: this.groupedData.length });

		// Count buffer variables specifically
		this.bufferVariableCount = this.parsedData.filter(item => item.type === 'Buffer Variable').length;
		this.log('Buffer count', { buffers: this.bufferVariableCount });

		this.applyFilters();
		this.displayResults();
		this.showCombinedHeader();

		if (this.parsedData.length > 0) {
			document.getElementById('combinedHeader').style.display = 'block';
		}
	}

	filterRelevantLogs(logText) {
		const lines = logText.split('\n');
		let startIndex = -1;

		// Find the first "Starting TestCase" line
		for (let i = 0; i < lines.length; i++) {
			if (lines[i].includes('Starting TestCase')) {
				startIndex = i;
				break;
			}
		}

		// If found, return logs from that point onward, otherwise return all
		if (startIndex !== -1) {
			return lines.slice(startIndex).join('\n');
		}
		return logText;
	}

	parseLogContent(logText) {
		const lines = logText.split('\n');
		const variables = [];
		let lineNumber = 0;
		const contextStack = [];

		lines.forEach(line => {
			lineNumber++;
			if (!line.trim()) return;

			const indentLevel = this.getIndentLevel(line);
			const trimmedLine = line.trim();

			// Update context stack
			this.updateContextStack(contextStack, indentLevel, trimmedLine, lineNumber, line);

			// Skip lines that are just metadata
			if (trimmedLine.includes('[DURATION:') ||
				trimmedLine.match(/^\[INF\]\[TBox\]\s*$/) ||
				trimmedLine.includes('has been performed successfully')) {
				return;
			}

			// Extract buffer variables (primary focus) - handle multiple formats
			let bufferVariable = null;

			// Format 1: Buffer with name: "name" has been set to value: "value"
			let bufferMatch = trimmedLine.match(/Buffer with name[:\s]*['"]([^'"]*)['"]\s*has been set to value[:\s]*['"]([^'"]*)['"]/i);
			if (bufferMatch) {
				bufferVariable = {
					name: bufferMatch[1],
					value: bufferMatch[2]
				};
			}

			// Format 2: Buffer with name 'name' has been set to value 'value'
			if (!bufferVariable) {
				bufferMatch = trimmedLine.match(/Buffer with name\s+['']([^'']*)['']\s+has been set to value\s+['']([^'']*)['']/i);
				if (bufferMatch) {
					bufferVariable = {
						name: bufferMatch[1],
						value: bufferMatch[2]
					};
				}
			}

			// NEW: Handle multi-line buffer values (for JSON)
			if (!bufferVariable && trimmedLine.includes('Buffer with name') && trimmedLine.includes('has been set to value')) {
				// Look for the start of a multi-line value
				const nameMatch = trimmedLine.match(/Buffer with name[:\s]*['"]([^'"]*)['"]/i);
				if (nameMatch) {
					const name = nameMatch[1];

					// Check if the value starts on this line
					const valueStart = trimmedLine.indexOf('has been set to value');
					if (valueStart !== -1) {
						const afterValue = trimmedLine.substring(valueStart + 'has been set to value'.length).trim();

						// Handle different quote patterns: "value" or ': "value"
						let startQuote = -1;
						let quoteChar = '';

						// Look for the opening quote
						for (let i = 0; i < afterValue.length; i++) {
							if (afterValue[i] === '"' || afterValue[i] === "'") {
								startQuote = i;
								quoteChar = afterValue[i];
								break;
							}
						}

						if (startQuote !== -1) {
							const valueAfterQuote = afterValue.substring(startQuote + 1);

							// Check if it's a complete single-line value (not starting with { or [)
							if (valueAfterQuote.includes(quoteChar) && !valueAfterQuote.startsWith('{') && !valueAfterQuote.startsWith('[')) {
								const endQuote = valueAfterQuote.indexOf(quoteChar);
								const value = valueAfterQuote.substring(0, endQuote);
								bufferVariable = { name, value };
							} else {
								// Multi-line value or JSON - collect until closing quote
								let value = valueAfterQuote;
								let currentLineIndex = lineNumber;
								let foundEnd = false;

								// Debug logging for multi-line parsing
								if (name.toLowerCase().includes('json')) {
									this.log(`Starting multi-line parse for ${name}, initial value: "${value}"`);
								}

								// Continue reading lines until we find the closing quote
								while (currentLineIndex < lines.length && !foundEnd) {
									currentLineIndex++;
									if (currentLineIndex >= lines.length) break;

									const nextLine = lines[currentLineIndex - 1]; // -1 because lineNumber is 1-indexed
									let nextTrimmed = nextLine.trim();

									// Remove log prefixes from continuation lines
									nextTrimmed = nextTrimmed.replace(/^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}[^[]*\[TBox\]\s*/, '');

									// Debug logging
									if (name.toLowerCase().includes('json')) {
										this.log(`Processing line ${currentLineIndex}: "${nextTrimmed}"`);
									}

									if (nextTrimmed.endsWith(quoteChar + '"') || nextTrimmed.endsWith(quoteChar)) {
										// Found the end - handle both }" and " endings
										if (nextTrimmed.endsWith(quoteChar + '"')) {
											value += '\n' + nextTrimmed.substring(0, nextTrimmed.length - 2);
										} else {
											value += '\n' + nextTrimmed.substring(0, nextTrimmed.length - 1);
										}
										foundEnd = true;

										if (name.toLowerCase().includes('json')) {
											this.log(`Found end of multi-line value for ${name}`);
										}
									} else {
										value += '\n' + nextTrimmed;
									}
								}

								// Clean up the value - remove any remaining log artifacts
								value = value.replace(/^\s*\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}.*?\[TBox\]\s*/gm, '');
								value = value.trim();

								// Debug final result
								if (name.toLowerCase().includes('json')) {
									this.log(`Final parsed value for ${name}: "${value.substring(0, 200)}..."`);
								}

								bufferVariable = { name, value };
							}
						}
					}
				}
			}

			if (bufferVariable) {
				const variable = {
					name: bufferVariable.name,
					value: bufferVariable.value,
					type: this.detectVariableType(bufferVariable.name, bufferVariable.value),
					line: lineNumber,
					indentLevel: indentLevel,
					context: this.getContext(contextStack),
					contextPath: this.getContextPath(contextStack),
					timestamp: this.extractTimestamp(line),
					originalLine: trimmedLine
				};

				// Debug logging for JSON detection
				if (bufferVariable.name.toLowerCase().includes('json')) {
					this.log(`JSON DEBUG - Name: ${bufferVariable.name}, Type: ${variable.type}, Value start: ${bufferVariable.value.substring(0, 100)}...`);
				}

				variables.push(variable);
				this.log(`Found ${variable.type}: ${variable.name}`, variable);
				return;
			}

			// Extract URLs - but only standalone URLs, not those embedded in JSON
			if (!trimmedLine.includes('Buffer with name') && !trimmedLine.includes('{') && !trimmedLine.includes('}')) {
				const urlMatch = trimmedLine.match(/(https?:\/\/[^\s'"]+)/gi);
				if (urlMatch) {
					urlMatch.forEach(url => {
						// Skip URLs that are already captured in buffer variables
						if (variables.some(v => v.value === url || v.value.includes(url))) {
							return; // Skip duplicate URLs
						}

						// Look for URLs in meaningful context
						let urlName = 'Standalone URL';
						const contextMatch = trimmedLine.match(/Message:\s*(.+?)\s*https?:/i);
						if (contextMatch) {
							urlName = contextMatch[1].trim().substring(0, 50); // Limit length
						}

						const variable = {
							name: urlName,
							value: url,
							type: 'URL',
							line: lineNumber,
							indentLevel: indentLevel,
							context: this.getContext(contextStack),
							contextPath: this.getContextPath(contextStack),
							timestamp: this.extractTimestamp(line),
							originalLine: trimmedLine
						};
						variables.push(variable);
						this.log(`Found standalone URL: ${variable.name}`, variable);
					});
				}
			}
		});

		return variables;
	}

	// NEW: Post-process variables to fix any JSON parsing issues
	postProcessVariables(variables) {
		const processedVariables = [];

		for (let i = 0; i < variables.length; i++) {
			const variable = variables[i];

			// Check for incomplete JSON variables that might need re-processing
			if (variable.name.toLowerCase().includes('json') && variable.type !== 'JSON') {
				this.log(`Post-processing potential JSON variable: ${variable.name} with value: "${variable.value}"`);

				// Try to find the complete JSON by looking at the original line and subsequent lines
				// This is a fallback for when the multi-line parsing doesn't work
				let completeValue = variable.value;

				// If it looks like an incomplete JSON (starts with { but doesn't end with })
				if (completeValue.startsWith('{') && !completeValue.includes('}')) {
					this.log(`Attempting to fix incomplete JSON for: ${variable.name}`);
					// For now, keep the original logic but mark for investigation
				}

				// Re-check the type with the processed value
				variable.type = this.detectVariableType(variable.name, completeValue);
				variable.value = completeValue;
			}

			processedVariables.push(variable);
		}

		return processedVariables;
	}

	extractTimestamp(line) {
		const timestampMatch = line.match(/(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)/);
		return timestampMatch ? timestampMatch[1] : null;
	}

	getIndentLevel(line) {
		const match = line.match(/^(\s*)/);
		return match ? match[1].length : 0;
	}

	updateContextStack(stack, indentLevel, line, lineNumber, fullLine) {
		// Remove contexts at deeper or equal levels
		while (stack.length > 0 && stack[stack.length - 1].indentLevel >= indentLevel) {
			stack.pop();
		}

		// Extract context from test case names, operations, etc.
		const testCaseMatch = line.match(/Starting TestCase\s*['"]([^'"]+)['"]/);
		const operationMatch = line.match(/\[(Succeeded|Failed)\]\s*['"]([^'"]+)['"]/);

		if (testCaseMatch) {
			const context = {
				name: testCaseMatch[1],
				indentLevel: indentLevel,
				line: lineNumber,
				timestamp: this.extractTimestamp(fullLine),
				type: 'TestCase'
			};
			stack.push(context);
			this.log(`New test case context: ${context.name}`);
		} else if (operationMatch) {
			// Only add if it's not just "Operation" or similar generic names
			const opName = operationMatch[2];
			if (opName && opName !== 'Operation' && opName.length > 3) {
				const context = {
					name: opName,
					indentLevel: indentLevel,
					line: lineNumber,
					timestamp: this.extractTimestamp(fullLine),
					type: 'Operation'
				};
				stack.push(context);
				this.log(`New operation context: ${context.name}`);
			}
		}
	}

	getContext(stack) {
		return stack.length > 0 ? stack[stack.length - 1] : { name: 'Root', timestamp: null };
	}

	getContextPath(stack) {
		return stack.length > 0 ? stack.map(ctx => ctx.name).join(' → ') : 'Root';
	}

	groupLogsByContext(variables) {
		const groups = {};

		variables.forEach(variable => {
			const contextKey = variable.contextPath || 'Root';

			// Only skip Root variables if we have other context groups available
			// This prevents losing all variables if context parsing fails
			if (contextKey === 'Root') {
				this.log(`Found Root variable: ${variable.name}`, variable);
				// We'll handle Root filtering later if needed
			}

			if (!groups[contextKey]) {
				groups[contextKey] = {
					name: contextKey,
					variables: [],
					expanded: true, // Always start expanded
					timestamp: variable.timestamp,
					context: variable.context
				};
			}
			groups[contextKey].variables.push(variable);

			// Use the earliest timestamp for the group
			if (!groups[contextKey].timestamp ||
				(variable.timestamp && variable.timestamp < groups[contextKey].timestamp)) {
				groups[contextKey].timestamp = variable.timestamp;
			}
		});

		const result = Object.values(groups);

		// If we only have "Root" group and it has variables, don't filter it out completely
		if (result.length === 1 && result[0].name === 'Root' && result[0].variables.length > 0) {
			this.log('Only Root group found with variables - keeping it');
			result[0].name = 'Extracted Variables'; // Give it a better name
		} else if (result.length > 1) {
			// If we have multiple groups, filter out Root
			const filtered = result.filter(group => group.name !== 'Root');
			if (filtered.length > 0) {
				this.log(`Filtered out Root group, keeping ${filtered.length} context groups`);
				return filtered;
			}
		}

		return result;
	}

	showCombinedHeader() {
		const combinedCount = document.getElementById('combinedCount');

		if (this.parsedData.length > 0) {
			const minLine = Math.min(...this.parsedData.map(item => item.line));
			const maxLine = Math.max(...this.parsedData.map(item => item.line));

			// Count different types
			const jsonCount = this.parsedData.filter(item => item.type === 'JSON').length;
			const urlCount = this.parsedData.filter(item => item.type === 'URL').length;
			const tokenCount = this.parsedData.filter(item => item.type === 'Token').length;
			const bufferCount = this.parsedData.filter(item => item.type === 'Buffer Variable').length;

			let summary = `${this.parsedData.length} Variables Found`;
			if (jsonCount > 0) summary += ` • ${jsonCount} JSON Payloads`;
			if (urlCount > 0) summary += ` • ${urlCount} URLs`;
			if (tokenCount > 0) summary += ` • ${tokenCount} Tokens`;
			summary += ` • Lines ${minLine}-${maxLine}`;

			combinedCount.textContent = summary;
		}
	}

	// NEW: Truncate long values for display
	truncateForDisplay(value, type, maxLength = 60) {
		if (type === 'Token' && value.length > maxLength) {
			// For tokens, show first part and indicate truncation
			return value.substring(0, maxLength) + '...';
		}
		if (value.length > maxLength) {
			return value.substring(0, maxLength) + '...';
		}
		return value;
	}

	// NEW: Extract request/response context from variable names and surrounding context
	getRequestContext(variable) {
		const name = variable.name.toLowerCase();
		const contextName = variable.context?.name || '';

		// Determine if this is a request or response
		let requestType = 'unknown';
		let statusCode = null;
		let operationName = contextName;

		if (name.includes('request') || name.includes('body') && contextName.toLowerCase().includes('request')) {
			requestType = 'request';
		} else if (name.includes('response') || name.includes('body') && contextName.toLowerCase().includes('response')) {
			requestType = 'response';
			// Try to extract status code from context or nearby variables
			if (contextName.includes('200') || contextName.includes('OK')) statusCode = '200 OK';
			else if (contextName.includes('201')) statusCode = '201 Created';
			else if (contextName.includes('400')) statusCode = '400 Bad Request';
			else if (contextName.includes('401')) statusCode = '401 Unauthorized';
			else if (contextName.includes('404')) statusCode = '404 Not Found';
			else if (contextName.includes('500')) statusCode = '500 Server Error';
		}

		// Clean up operation name
		if (operationName) {
			operationName = operationName
				.replace(/\(Request\)/gi, '')
				.replace(/\(Response\)/gi, '')
				.trim();
		}

		return {
			type: requestType,
			statusCode: statusCode,
			operationName: operationName
		};
	}

	// NEW: Create enhanced variable table with full JSON display
	createVariableTable(variables) {
		let html = '<table class="variable-table">';
		html += '<thead><tr><th>Name</th><th>Value</th><th>Type</th><th>Line</th><th>Actions</th></tr></thead>';
		html += '<tbody>';

		variables.forEach((variable, index) => {
			const typeClass = this.getTypeClass(variable.type);
			const typeLabel = this.getTypeLabel(variable.type);
			const requestContext = this.getRequestContext(variable);

			let valueDisplay = '';
			let actionButtons = '';

			if (variable.type === 'JSON') {
				// Special handling for JSON - show full JSON in dedicated block
				const formatted = this.formatJSONWithHighlighting(variable.value);

				// Add request/response context
				let contextInfo = '';
				if (requestContext.operationName && requestContext.operationName !== 'Root') {
					contextInfo += `<div class="json-context">
						<span class="context-operation">${this.escapeHtml(requestContext.operationName)}</span>`;

					if (requestContext.type === 'request') {
						contextInfo += `<span class="context-type context-request">REQUEST</span>`;
					} else if (requestContext.type === 'response') {
						contextInfo += `<span class="context-type context-response">RESPONSE</span>`;
						if (requestContext.statusCode) {
							contextInfo += `<span class="context-status">${requestContext.statusCode}</span>`;
						}
					}

					contextInfo += '</div>';
				}

				valueDisplay = `<div class="json-container-full">
					${contextInfo}
					<div class="json-full-display">
						<pre class="json-formatted-full">${formatted}</pre>
					</div>
				</div>`;

				actionButtons = `
					<button onclick="parser.copyForPostman('${this.escapeForJS(variable.value)}')" class="var-btn var-btn-postman" title="Copy for Postman">🚀</button>
					<button onclick="parser.copyToClipboard('${this.escapeForJS(variable.value)}')" class="var-btn var-btn-copy" title="Copy Raw">📄</button>
				`;
			} else if (variable.type === 'URL') {
				// Clickable URL
				valueDisplay = `<a href="${this.escapeHtml(variable.value)}" target="_blank" class="url-link">${this.escapeHtml(variable.value)}</a>`;
				actionButtons = `
					<button onclick="parser.copyToClipboard('${this.escapeForJS(variable.value)}')" class="var-btn var-btn-copy" title="Copy URL">📋</button>
					<button onclick="window.open('${this.escapeForJS(variable.value)}', '_blank')" class="var-btn var-btn-view" title="Open URL">🔗</button>
				`;
			} else if (variable.type === 'Token') {
				// Special handling for tokens - truncate for display but allow full copy
				const truncated = this.truncateForDisplay(variable.value, 'Token', 40);
				valueDisplay = `<span class="variable-value token-value" title="Click to view full token">${this.escapeHtml(truncated)}</span>`;
				actionButtons = `
					<button onclick="parser.copyToClipboard('${this.escapeForJS(variable.value)}')" class="var-btn var-btn-copy" title="Copy Full Token">📋</button>
					<button onclick="parser.showFullValue('${this.escapeForJS(variable.value)}', '${this.escapeForJS(variable.name)}', ${variable.line})" class="var-btn var-btn-view" title="View Full Token">👁️</button>
				`;
			} else {
				// Regular variable
				const displayValue = variable.value.length > 100 ? variable.value.substring(0, 100) + '...' : variable.value;
				valueDisplay = `<span class="variable-value">${this.escapeHtml(displayValue)}</span>`;
				actionButtons = `
					<button onclick="parser.copyToClipboard('${this.escapeForJS(variable.value)}')" class="var-btn var-btn-copy" title="Copy Value">📋</button>
					<button onclick="parser.showFullValue('${this.escapeForJS(variable.value)}', '${this.escapeForJS(variable.name)}', ${variable.line})" class="var-btn var-btn-view" title="View Full">👁️</button>
				`;
			}

			// Special row class for JSON to make it span properly
			const rowClass = variable.type === 'JSON' ? 'json-row' : '';

			html += `<tr class="${rowClass}">
				<td class="variable-name">${this.escapeHtml(variable.name)}</td>
				<td class="variable-value-cell">${valueDisplay}</td>
				<td><span class="type-badge ${typeClass}">${typeLabel}</span></td>
				<td class="line-number">${variable.line}</td>
				<td class="var-actions">${actionButtons}</td>
			</tr>`;
		});

		html += '</tbody></table>';
		return html;
	}

	// NEW: Get CSS class for variable type
	getTypeClass(type) {
		switch (type) {
			case 'JSON': return 'type-json';
			case 'URL': return 'type-url';
			case 'ID': return 'type-id';
			case 'Timestamp': return 'type-timestamp';
			case 'Token': return 'type-token';
			default: return 'type-buffer';
		}
	}

	// NEW: Get display label for variable type
	getTypeLabel(type) {
		switch (type) {
			case 'JSON': return 'JSON';
			case 'URL': return 'URL';
			case 'ID': return 'ID';
			case 'Timestamp': return 'TIME';
			case 'Token': return 'TOKEN';
			default: return 'VAR';
		}
	}

	// NEW: Copy JSON formatted for Postman
	copyForPostman(jsonValue) {
		try {
			// Parse and reformat the JSON for better Postman compatibility
			const parsed = JSON.parse(jsonValue);
			const formatted = JSON.stringify(parsed, null, 2);

			this.copyToClipboard(formatted);

			// Show success message
			this.showToast('JSON copied for Postman! 🚀', 'success');
		} catch (error) {
			this.copyToClipboard(jsonValue);
			this.showToast('Raw value copied to clipboard', 'info');
		}
	}

	// NEW: Show toast notification
	showToast(message, type = 'info') {
		// Create toast element
		const toast = document.createElement('div');
		toast.className = `toast toast-${type}`;
		toast.textContent = message;
		toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            border-radius: 4px;
            z-index: 10000;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

		document.body.appendChild(toast);

		// Animate in
		setTimeout(() => {
			toast.style.transform = 'translateX(0)';
		}, 10);

		// Remove after 3 seconds
		setTimeout(() => {
			toast.style.transform = 'translateX(100%)';
			setTimeout(() => {
				if (toast.parentNode) {
					toast.parentNode.removeChild(toast);
				}
			}, 300);
		}, 3000);
	}

	// NEW: Escape string for JavaScript context
	escapeForJS(str) {
		// Use JSON.stringify to safely escape the string, then remove outer quotes
		return JSON.stringify(str).slice(1, -1);
	}

	escapeHtml(text) {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}

	applyFilters() {
		const searchTerm = document.getElementById('searchFilter').value.toLowerCase();

		if (this.currentView === 'logs') {
			// If in logs view, filter and display logs
			this.displayColoredLogs();
		} else if (this.currentView === 'table') {
			// If in table view, filter and display table
			this.displayTableView();
		} else {
			// If in variables view, filter variables
			this.filteredData = this.groupedData.map(group => ({
				...group,
				variables: group.variables.filter(item => {
					if (searchTerm &&
						!item.name.toLowerCase().includes(searchTerm) &&
						!item.value.toLowerCase().includes(searchTerm) &&
						!group.name.toLowerCase().includes(searchTerm) &&
						!item.type.toLowerCase().includes(searchTerm)) {
						return false;
					}

					return true;
				})
			})).filter(group => group.variables.length > 0);

			this.displayResults();
		}
	}

	displayResults() {
		const resultsPlaceholder = document.getElementById('resultsPlaceholder');
		const resultsContent = document.getElementById('resultsContent');
		const combinedCount = document.getElementById('combinedCount');

		if (this.filteredData.length === 0) {
			resultsPlaceholder.style.display = 'block';
			resultsContent.style.display = 'none';

			if (this.parsedData.length === 0) {
				resultsPlaceholder.innerHTML = `
                    <p>📊</p>
                    <p>Parse logs to see extracted variables here</p>
                `;
			} else {
				resultsPlaceholder.innerHTML = `
                    <p>🔍</p>
                    <p>No variables match your current filters</p>
                `;
			}
			return;
		}

		resultsPlaceholder.style.display = 'none';
		resultsContent.style.display = 'block';

		const totalVariables = this.filteredData.reduce((sum, group) => sum + group.variables.length, 0);

		this.displayGroupedResults();
	}

	displayGroupedResults() {
		const container = document.getElementById('resultsContent');
		container.innerHTML = '';

		this.filteredData.forEach((group, groupIndex) => {
			const groupDiv = this.createGroupElement(group, groupIndex);
			container.appendChild(groupDiv);
		});
	}

	createGroupElement(group, groupIndex) {
		const groupDiv = document.createElement('div');
		groupDiv.className = 'group';

		const headerDiv = document.createElement('div');
		headerDiv.className = 'group-header';
		headerDiv.style.cursor = 'default'; // Remove pointer cursor since not clickable

		// Count different types of variables
		const bufferVars = group.variables.filter(v => v.type === 'Buffer Variable').length;
		const jsonVars = group.variables.filter(v => v.type === 'JSON').length;
		const urlVars = group.variables.filter(v => v.type === 'URL').length;
		const tokenVars = group.variables.filter(v => v.type === 'Token').length;
		const otherVars = group.variables.length - bufferVars - jsonVars - urlVars - tokenVars;

		const timestampDisplay = group.timestamp ? new Date(group.timestamp).toLocaleTimeString() : '';

		let badges = '';
		if (bufferVars > 0) badges += `<span class="badge badge-buffers">${bufferVars} vars</span>`;
		if (jsonVars > 0) badges += `<span class="badge badge-json">${jsonVars} JSON</span>`;
		if (urlVars > 0) badges += `<span class="badge badge-urls">${urlVars} URLs</span>`;
		if (tokenVars > 0) badges += `<span class="badge badge-tokens">${tokenVars} tokens</span>`;
		if (otherVars > 0) badges += `<span class="badge badge-other">+${otherVars} other</span>`;

		headerDiv.innerHTML = `
            <div class="group-info">
                <div style="flex: 1;">
                    <div class="group-title">${this.escapeHtml(group.name)}</div>
                    <div class="group-meta">
                        ${badges}
                        ${timestampDisplay ? `<span class="timestamp">${timestampDisplay}</span>` : ''}
                    </div>
                </div>
            </div>
            <button onclick="parser.copyGroupVariables(${groupIndex})" class="group-copy-btn">📋 Copy Group</button>
        `;

		const contentDiv = document.createElement('div');
		contentDiv.className = 'group-content';
		contentDiv.style.display = 'block'; // Always show content
		contentDiv.innerHTML = this.createVariableTable(group.variables);

		groupDiv.appendChild(headerDiv);
		groupDiv.appendChild(contentDiv);

		return groupDiv;
	}

	showVariablesView() {
		this.currentView = 'variables';
		this.updateViewButtons();
		this.applyFilters();
	}

	showLogsView() {
		this.currentView = 'logs';
		this.updateViewButtons();
		this.displayColoredLogs();
	}

	showTableView() {
		this.currentView = 'table';
		this.updateViewButtons();
		this.displayTableView();
	}

	updateViewButtons() {
		document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
		document.getElementById(`${this.currentView}ViewBtn`).classList.add('active');
	}

	toggleWordWrap() {
		this.wordWrapEnabled = !this.wordWrapEnabled;
		const logContent = document.querySelector('.log-view-content');
		if (logContent) {
			logContent.classList.toggle('word-wrap', this.wordWrapEnabled);
		}

		const btn = document.getElementById('wordWrapBtn');
		btn.textContent = this.wordWrapEnabled ? '📄 Unwrap' : '📄 Wrap';
	}

	displayColoredLogs() {
		const container = document.getElementById('resultsContent');
		const logLines = this.rawLogText.split('\n');

		let html = '<div class="log-view-content">';
		logLines.forEach((line, index) => {
			const highlightedLine = this.addColorHighlighting(line);
			html += `<div class="log-line" data-line="${index + 1}">${highlightedLine}</div>`;
		});
		html += '</div>';

		container.innerHTML = html;
	}

	addColorHighlighting(line) {
		let highlighted = this.escapeHtml(line);

		// Highlight timestamps - but be more careful not to interfere with buffer values
		highlighted = highlighted.replace(
			/^(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)/g,
			'<span class="log-timestamp">$1</span>'
		);

		// Highlight log levels
		highlighted = highlighted.replace(/\[(INF|ERR|WAR|DEB)\]/g, '<span class="log-level-$1">[$1]</span>');

		// Highlight test case names
		highlighted = highlighted.replace(
			/(Starting TestCase\s*['"])([^'"]+)(['"'])/g,
			'$1<span class="log-testcase">$2</span>$3'
		);

		// NEW: Highlight JSON objects in logs
		// Look for lines that contain JSON-like structures
		if (highlighted.includes('{') && highlighted.includes('}') && highlighted.includes('"')) {
			// First, highlight the entire JSON block with a background
			highlighted = highlighted.replace(
				/(\{[^}]*\})/g,
				'<span class="log-json-block">$1</span>'
			);

			// Highlight JSON keys
			highlighted = highlighted.replace(
				/("[\w-]+")(\s*:\s*)/g,
				'<span class="log-json-key">$1</span><span class="log-json-colon">$2</span>'
			);

			// Highlight JSON string values
			highlighted = highlighted.replace(
				/(:)(\s*)("([^"\\\\]|\\\\.)*")/g,
				'$1$2<span class="log-json-string">$3</span>'
			);

			// Highlight JSON numbers
			highlighted = highlighted.replace(
				/(:)(\s*)(\d+\.?\d*)/g,
				'$1$2<span class="log-json-number">$3</span>'
			);

			// Highlight JSON booleans and null
			highlighted = highlighted.replace(
				/(:)(\s*)(true|false|null)/g,
				'$1$2<span class="log-json-boolean">$3</span>'
			);

			// Highlight JSON brackets
			highlighted = highlighted.replace(
				/([{}[\]])/g,
				'<span class="log-json-bracket">$1</span>'
			);
		}

		// NEW: Highlight request/response operations with color coding
		highlighted = highlighted.replace(
			/(\[Succeeded\]\s*['"])([^'"]*(?:Request|request)[^'"]*?)(['"])/g,
			'$1<span class="log-request-operation">$2</span>$3'
		);

		highlighted = highlighted.replace(
			/(\[Succeeded\]\s*['"])([^'"]*(?:Response|response)[^'"]*?)(['"])/g,
			'$1<span class="log-response-operation">$2</span>$3'
		);

		// Highlight HTTP status codes and response times
		highlighted = highlighted.replace(
			/(Server Response Time:\s*)(\d+\s*ms)/g,
			'$1<span class="log-response-time">$2</span>'
		);

		highlighted = highlighted.replace(
			/(Expected value == |Actual value:\s*)(["']?\d{3}\s+[A-Za-z\s]+["']?)/g,
			'$1<span class="log-status-code">$2</span>'
		);

		// Highlight buffer variables - be more precise to avoid conflicts
		highlighted = highlighted.replace(
			/(Buffer with name[:\s]*['"])([^'"]*?)(['"][^'"]*has been set to value[:\s]*['"])([^'"]*?)(['"])/g,
			'$1<span class="log-buffer-name">$2</span>$3<span class="log-buffer-value">$4</span>$5'
		);

		// Highlight URLs - but only if they're not already inside spans
		highlighted = highlighted.replace(
			/(^|[^>])(https?:\/\/[^\s'"<>]+)/g,
			'$1<span class="log-url">$2</span>'
		);

		// Highlight status
		highlighted = highlighted.replace(/\[(Succeeded|Failed)\]/g, '<span class="log-status-$1">[$1]</span>');

		return highlighted;
	}

	displayTableView() {
		// Implementation for table view would go here
		// This is a simplified version
		const container = document.getElementById('resultsContent');
		container.innerHTML = '<div class="table-view">Table view implementation would go here</div>';
	}

	copyGroupVariables(groupIndex) {
		const group = this.filteredData[groupIndex];
		const data = group.variables.map(item => `${item.name}: ${item.value}`).join('\n');
		this.copyToClipboard(data);
		this.showToast(`Copied ${group.variables.length} variables from "${group.name}"`, 'success');
	}

	copyAllResults() {
		const allData = this.filteredData.map(group => {
			const groupData = [`=== ${group.name} ===`];
			group.variables.forEach(item => {
				groupData.push(`${item.name}: ${item.value}`);
			});
			return groupData.join('\n');
		}).join('\n\n');

		this.copyToClipboard(allData);
		this.showToast('All results copied to clipboard!', 'success');
	}

	exportResults() {
		const dataStr = JSON.stringify(this.filteredData, null, 2);
		const dataBlob = new Blob([dataStr], { type: 'application/json' });
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'tosca-log-variables.json';
		link.click();
		URL.revokeObjectURL(url);
		this.showToast('Results exported as JSON!', 'success');
	}

	clearResults() {
		this.parsedData = [];
		this.groupedData = [];
		this.filteredData = [];
		this.bufferVariableCount = 0;
		this.rawLogText = '';

		document.getElementById('logInput').value = '';
		document.getElementById('searchFilter').value = '';
		document.getElementById('combinedHeader').style.display = 'none';

		this.displayResults();
		this.showToast('Results cleared', 'info');
	}

	copyToClipboard(text, button = null) {
		if (navigator.clipboard) {
			navigator.clipboard.writeText(text).then(() => {
				if (button) {
					const originalText = button.textContent;
					button.textContent = '✅';
					setTimeout(() => {
						button.textContent = originalText;
					}, 1000);
				}
			}).catch(() => {
				this.fallbackCopy(text);
			});
		} else {
			this.fallbackCopy(text);
		}
	}

	fallbackCopy(text) {
		const textArea = document.createElement('textarea');
		textArea.value = text;
		document.body.appendChild(textArea);
		textArea.select();
		document.execCommand('copy');
		document.body.removeChild(textArea);
	}

	showFullValue(value, name, line) {
		// Create a modal to show the full value
		const modal = document.createElement('div');
		modal.className = 'value-modal';
		modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

		const modalContent = document.createElement('div');
		modalContent.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 80%;
            max-height: 80%;
            overflow: auto;
            position: relative;
        `;

		modalContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0;">${this.escapeHtml(name)} (Line ${line})</h3>
                <button onclick="this.closest('.value-modal').remove()" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">✕</button>
            </div>
            <pre style="background: #f8f9fa; padding: 15px; border-radius: 4px; overflow: auto; max-height: 400px; white-space: pre-wrap;">${this.escapeHtml(value)}</pre>
            <div style="margin-top: 15px;">
                <button onclick="parser.copyToClipboard('${this.escapeForJS(value)}'); parser.showToast('Value copied!', 'success');" style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">📋 Copy Value</button>
            </div>
        `;

		modal.appendChild(modalContent);
		document.body.appendChild(modal);

		// Close on background click
		modal.addEventListener('click', (e) => {
			if (e.target === modal) {
				modal.remove();
			}
		});
	}
}

// Initialize parser when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
	window.parser = new ToscaLogParser();
});