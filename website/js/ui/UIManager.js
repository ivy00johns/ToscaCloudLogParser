// UI Manager - Handles all user interface interactions
class UIManager {
	constructor() {
		this.currentView = 'variables';
		this.wordWrapEnabled = false;
		this.setupEventListeners();
	}

	setupEventListeners() {
		// Input mode switching
		document.getElementById('pasteBtn')?.addEventListener('click', () => this.switchInputMode('paste'));
		document.getElementById('fileBtn')?.addEventListener('click', () => this.switchInputMode('file'));

		// View buttons
		document.getElementById('variablesViewBtn')?.addEventListener('click', () => this.showVariablesView());
		document.getElementById('logsViewBtn')?.addEventListener('click', () => this.showLogsView());
		document.getElementById('tableViewBtn')?.addEventListener('click', () => this.showTableView());
		document.getElementById('wordWrapBtn')?.addEventListener('click', () => this.toggleWordWrap());

		// Action buttons
		document.getElementById('copyAllBtn')?.addEventListener('click', () => this.onCopyAll());
		document.getElementById('exportBtn')?.addEventListener('click', () => this.onExport());
		document.getElementById('clearBtn')?.addEventListener('click', () => this.onClear());

		// Search filter
		document.getElementById('searchFilter')?.addEventListener('input', () => this.onSearchChange());
	}

	// Event handler callbacks - these will be set by the main app
	onCopyAll = () => { };
	onExport = () => { };
	onClear = () => { };
	onSearchChange = () => { };
	onParseContent = () => { };

	switchInputMode(mode) {
		document.querySelectorAll('.input-btn').forEach(btn => btn.classList.remove('active'));
		document.querySelectorAll('.input-mode').forEach(mode => mode.classList.remove('active'));

		if (mode === 'paste') {
			document.getElementById('pasteBtn')?.classList.add('active');
			document.getElementById('pasteMode')?.classList.add('active');
		} else if (mode === 'file') {
			document.getElementById('fileBtn')?.classList.add('active');
			document.getElementById('fileMode')?.classList.add('active');
		}
	}

	showVariablesView() {
		this.currentView = 'variables';
		this.updateViewButtons();

		document.getElementById('resultsContent').style.display = 'block';
		document.getElementById('logViewContent').style.display = 'none';
		document.getElementById('tableViewContent').style.display = 'none';
		document.getElementById('wordWrapBtn').style.display = 'none';
	}

	showLogsView(rawLogText = '', hierarchicalGroups = null) {
		this.currentView = 'logs';
		this.updateViewButtons();

		document.getElementById('resultsContent').style.display = 'none';
		document.getElementById('logViewContent').style.display = 'block';
		document.getElementById('tableViewContent').style.display = 'none';
		document.getElementById('wordWrapBtn').style.display = 'inline-block';

		// Get search filter if active
		const searchFilter = document.getElementById('searchFilter');
		const searchTerm = searchFilter ? searchFilter.value : '';

		// Always use the original colored logs display
		this.displayColoredLogs(rawLogText, searchTerm);
	}

	showTableView(rawLogText = '', hierarchicalGroups = null) {
		this.currentView = 'table';
		this.updateViewButtons();

		document.getElementById('resultsContent').style.display = 'none';
		document.getElementById('logViewContent').style.display = 'none';
		document.getElementById('tableViewContent').style.display = 'block';
		document.getElementById('wordWrapBtn').style.display = 'none';

		// Get search filter if active
		const searchFilter = document.getElementById('searchFilter');
		const searchTerm = searchFilter ? searchFilter.value : '';

		// Display the table with hierarchical grouping if available
		if (hierarchicalGroups && hierarchicalGroups.length > 0) {
			this.displayHierarchicalTable(hierarchicalGroups, searchTerm);
		} else {
			this.displayTableView(rawLogText, searchTerm);
		}
	}

	updateViewButtons() {
		document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
		document.getElementById(`${this.currentView}ViewBtn`)?.classList.add('active');
	}

	toggleWordWrap() {
		this.wordWrapEnabled = !this.wordWrapEnabled;
		const logContent = document.querySelector('#logViewContent .log-view-content');
		if (logContent) {
			logContent.classList.toggle('word-wrap', this.wordWrapEnabled);
		}

		const btn = document.getElementById('wordWrapBtn');
		if (btn) {
			btn.textContent = this.wordWrapEnabled ? '📄 Unwrap' : '📄 Wrap';
			btn.classList.toggle('active', this.wordWrapEnabled);
		}
		
		console.log('🖥️ UI: Word wrap toggled:', this.wordWrapEnabled, 'Element found:', !!logContent);
	}

	// Show/hide loading state
	showLoading(message = 'Processing...') {
		const btn = document.getElementById('parseBtn');
		if (btn) {
			btn.disabled = true;
			btn.innerHTML = `<span>⏳ ${message}</span>`;
		}
	}

	hideLoading() {
		const btn = document.getElementById('parseBtn');
		if (btn) {
			btn.disabled = false;
			btn.innerHTML = '🔄 Parse Logs';
		}
	}

	// Show progress for large operations
	showProgress(current, total, message = 'Processing') {
		const percentage = Math.round((current / total) * 100);
		const btn = document.getElementById('parseBtn');
		if (btn) {
			btn.innerHTML = `<span>⏳ ${message} ${percentage}%</span>`;
		}
	}

	// Display results with improved performance
	displayResults(filteredData) {
		console.log('🖥️ UI: displayResults called with:', {
			filteredDataLength: filteredData?.length,
			filteredData: filteredData
		});

		const resultsPlaceholder = document.getElementById('resultsPlaceholder');
		const resultsContent = document.getElementById('resultsContent');

		console.log('🖥️ UI: DOM elements found:', {
			resultsPlaceholder: !!resultsPlaceholder,
			resultsContent: !!resultsContent
		});

		if (!filteredData || filteredData.length === 0) {
			console.log('🖥️ UI: No filtered data, showing placeholder');
			resultsPlaceholder.style.display = 'block';
			resultsContent.style.display = 'none';
			resultsPlaceholder.innerHTML = `
                <p>📊</p>
                <p>No variables match your current filters</p>
            `;
			return;
		}

		console.log('🖥️ UI: Has filtered data, showing results content');
		resultsPlaceholder.style.display = 'none';
		resultsContent.style.display = 'block';

		this.renderGroupedResults(filteredData);
	}

	// Render grouped results with virtual scrolling for large datasets
	renderGroupedResults(groupedData) {
		const container = document.getElementById('resultsContent');
		if (!container) return;

		// Clear existing content
		container.innerHTML = '';

		// Debug: log what we're trying to render
		console.log('🖥️ UI: Rendering groups:', {
			totalGroups: groupedData.length,
			groupDetails: groupedData.map(g => ({ name: g.name, variableCount: g.variables.length }))
		});

		// If we have many groups, implement virtual scrolling
		if (groupedData.length > 10) {
			this.renderVirtualizedGroups(container, groupedData);
		} else {
			this.renderAllGroups(container, groupedData);
		}
	}

	renderAllGroups(container, groupedData) {
		console.log('🖥️ UI: Creating group elements...', groupedData.length);
		const fragment = document.createDocumentFragment();

		groupedData.forEach((group, index) => {
			console.log(`🖥️ UI: Creating group ${index}: ${group.name} with ${group.variables.length} variables`);
			const groupElement = this.createGroupElement(group, index);
			fragment.appendChild(groupElement);
		});

		console.log('🖥️ UI: Appending fragment to container');
		container.appendChild(fragment);
		console.log('🖥️ UI: Container now has', container.children.length, 'children');
		console.log('🖥️ UI: Container innerHTML length:', container.innerHTML.length);
		console.log('🖥️ UI: Container first child:', container.children[0]?.className, container.children[0]?.children.length, 'children');
	}

	// Simple virtual scrolling implementation
	renderVirtualizedGroups(container, groupedData) {
		// For now, render first 20 groups and add "Load More" button
		const visibleGroups = groupedData.slice(0, 20);
		this.renderAllGroups(container, visibleGroups);

		if (groupedData.length > 20) {
			const loadMoreBtn = document.createElement('button');
			loadMoreBtn.className = 'load-more-btn';
			loadMoreBtn.textContent = `Load More (${groupedData.length - 20} remaining)`;
			loadMoreBtn.style.cssText = `
				width: 100%;
				padding: 15px;
				background: #f8f9fa;
				border: 1px solid #dee2e6;
				border-radius: 4px;
				cursor: pointer;
				margin-top: 10px;
			`;

			loadMoreBtn.addEventListener('click', () => {
				loadMoreBtn.remove();
				const remainingGroups = groupedData.slice(20);
				this.renderAllGroups(container, remainingGroups);
			});

			container.appendChild(loadMoreBtn);
		}
	}

	createGroupElement(group, groupIndex) {
		const groupDiv = document.createElement('div');
		groupDiv.className = 'group';

		// Create header
		const headerDiv = document.createElement('div');
		headerDiv.className = 'group-header';

		const badges = this.createVariableTypeBadges(group.variables);
		const timestampDisplay = group.timestamp ?
			new Date(group.timestamp).toLocaleTimeString() : '';

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
			<button onclick="window.app.copyGroupVariables(${groupIndex})" class="group-copy-btn">📋 Copy Group</button>
		`;

		// Create content
		const contentDiv = document.createElement('div');
		contentDiv.className = 'group-content';
		const tableHTML = this.createVariableTable(group.variables);
		contentDiv.innerHTML = tableHTML;

		console.log('🖥️ UI: Group element created:', {
			groupName: group.name,
			variableCount: group.variables.length,
			headerHTML: headerDiv.innerHTML.length,
			tableHTML: tableHTML.length,
			contentDivHTML: contentDiv.innerHTML.length
		});

		groupDiv.appendChild(headerDiv);
		groupDiv.appendChild(contentDiv);

		console.log('🖥️ UI: Final group element:', {
			groupDivChildren: groupDiv.children.length,
			groupDivHTML: groupDiv.innerHTML.length
		});

		return groupDiv;
	}

	createVariableTypeBadges(variables) {
		const counts = {
			'Buffer Variable': 0,
			'JSON': 0,
			'URL': 0,
			'Token': 0,
			'other': 0
		};

		variables.forEach(v => {
			if (counts.hasOwnProperty(v.type)) {
				counts[v.type]++;
			} else {
				counts.other++;
			}
		});

		let badges = '';
		if (counts['Buffer Variable'] > 0) badges += `<span class="badge badge-buffers">${counts['Buffer Variable']} vars</span>`;
		if (counts['JSON'] > 0) badges += `<span class="badge badge-json">${counts['JSON']} JSON</span>`;
		if (counts['URL'] > 0) badges += `<span class="badge badge-urls">${counts['URL']} URLs</span>`;
		if (counts['Token'] > 0) badges += `<span class="badge badge-tokens">${counts['Token']} tokens</span>`;
		if (counts.other > 0) badges += `<span class="badge badge-other">+${counts.other} other</span>`;

		return badges;
	}

	createVariableTable(variables) {
		console.log('🖥️ UI: Creating variable table for', variables.length, 'variables');
		let html = '<table class="variable-table">';
		html += '<thead><tr><th>Name</th><th>Value</th><th>Type</th><th>Line</th><th>Actions</th></tr></thead>';
		html += '<tbody>';

		variables.forEach((variable, index) => {
			html += this.createVariableRow(variable, index);
		});

		html += '</tbody></table>';
		console.log('🖥️ UI: Generated table HTML length:', html.length);
		return html;
	}

	createVariableRow(variable, index) {
		console.log(`🖥️ UI: Creating row ${index} for variable:`, {
			name: variable.name,
			type: variable.type,
			valueLength: variable.value?.length || 0
		});

		const typeClass = this.getTypeClass(variable.type);
		const typeLabel = this.getTypeLabel(variable.type);

		let valueDisplay = '';
		let actionButtons = '';

		if (variable.type === 'JSON') {
			valueDisplay = this.createJSONDisplay(variable);
			actionButtons = `
				<button onclick="window.app.copyForPostman('${this.escapeForJS(variable.value)}')" class="var-btn var-btn-postman" title="Copy for Postman">🚀</button>
				<button onclick="window.app.copyToClipboard('${this.escapeForJS(variable.value)}')" class="var-btn var-btn-copy" title="Copy Raw">📄</button>
			`;
		} else if (variable.type === 'URL') {
			valueDisplay = `<a href="${this.escapeHtml(variable.value)}" target="_blank" class="url-link">${this.escapeHtml(variable.value)}</a>`;
			actionButtons = `
				<button onclick="window.app.copyToClipboard('${this.escapeForJS(variable.value)}')" class="var-btn var-btn-copy" title="Copy URL">📋</button>
				<button onclick="window.open('${this.escapeForJS(variable.value)}', '_blank')" class="var-btn var-btn-view" title="Open URL">🔗</button>
			`;
		} else if (variable.type === 'Token') {
			// Truncate tokens by half
			const halfLength = Math.floor(variable.value.length / 10);
			const displayValue = variable.value.substring(0, halfLength) + '...';
			valueDisplay = `<span class="variable-value token-value">${this.escapeHtml(displayValue)}</span>`;
			actionButtons = `
				<button onclick="window.app.copyToClipboard('${this.escapeForJS(variable.value)}')" class="var-btn var-btn-copy" title="Copy Token">📋</button>
				<button onclick="window.app.showFullValue('${this.escapeForJS(variable.value)}', '${this.escapeForJS(variable.name)}', ${variable.line})" class="var-btn var-btn-view" title="View Full">👁️</button>
			`;
		} else if (variable.type === 'ID') {
			const displayValue = variable.value.length > 100 ?
				variable.value.substring(0, 100) + '...' : variable.value;
			valueDisplay = `<span class="variable-value id-value">${this.escapeHtml(displayValue)}</span>`;
			actionButtons = `
				<button onclick="window.app.copyToClipboard('${this.escapeForJS(variable.value)}')" class="var-btn var-btn-copy" title="Copy Value">📋</button>
				<button onclick="window.app.showFullValue('${this.escapeForJS(variable.value)}', '${this.escapeForJS(variable.name)}', ${variable.line})" class="var-btn var-btn-view" title="View Full">👁️</button>
			`;
		} else {
			const displayValue = variable.value.length > 100 ?
				variable.value.substring(0, 100) + '...' : variable.value;
			valueDisplay = `<span class="variable-value">${this.escapeHtml(displayValue)}</span>`;
			actionButtons = `
				<button onclick="window.app.copyToClipboard('${this.escapeForJS(variable.value)}')" class="var-btn var-btn-copy" title="Copy Value">📋</button>
				<button onclick="window.app.showFullValue('${this.escapeForJS(variable.value)}', '${this.escapeForJS(variable.name)}', ${variable.line})" class="var-btn var-btn-view" title="View Full">👁️</button>
			`;
		}

		const rowClass = variable.type === 'JSON' ? 'json-row' : '';

		const rowHTML = `<tr class="${rowClass}">
			<td class="variable-name">${this.escapeHtml(variable.name)}</td>
			<td class="variable-value-cell">${valueDisplay}</td>
			<td><span class="type-badge ${typeClass}">${typeLabel}</span></td>
			<td class="line-number">${variable.line}</td>
			<td class="var-actions"><div class="var-actions">${actionButtons}</div></td>
		</tr>`;

		console.log(`🖥️ UI: Generated row HTML for ${variable.name}:`, rowHTML.length, 'chars');
		return rowHTML;
	}

	createJSONDisplay(variable) {
		const formatted = this.formatJSONWithHighlighting(variable.value);
		return `<div class="json-container-full">
			<div class="json-full-display">
				<pre class="json-formatted-full">${formatted}</pre>
			</div>
		</div>`;
	}

	formatJSONWithHighlighting(jsonStr) {
		try {
			const parsed = JSON.parse(jsonStr);
			const formatted = JSON.stringify(parsed, null, 2);

			return formatted
				.replace(/(".*?")(:)/g, '<span class="json-key">$1</span><span class="json-colon">$2</span>')
				.replace(/(:)(\s*)(".*?")/g, '$1$2<span class="json-string">$3</span>')
				.replace(/(:)(\s*)(true|false)/g, '$1$2<span class="json-boolean">$3</span>')
				.replace(/(:)(\s*)(null)/g, '$1$2<span class="json-null">$3</span>')
				.replace(/(:)(\s*)(\d+\.?\d*)/g, '$1$2<span class="json-number">$3</span>');
		} catch (e) {
			return this.escapeHtml(jsonStr);
		}
	}

	getTypeClass(type) {
		const typeClasses = {
			'JSON': 'type-json',
			'URL': 'type-url',
			'ID': 'type-id',
			'Timestamp': 'type-timestamp',
			'Token': 'type-token'
		};
		return typeClasses[type] || 'type-buffer';
	}

	getTypeLabel(type) {
		const typeLabels = {
			'JSON': 'JSON',
			'URL': 'URL',
			'ID': 'ID',
			'Timestamp': 'TIME',
			'Token': 'TOKEN'
		};
		return typeLabels[type] || 'VAR';
	}

	// Update header with statistics
	updateHeader(parsedData) {
		const combinedCount = document.getElementById('combinedCount');
		if (!combinedCount || !parsedData.length) return;

		const minLine = Math.min(...parsedData.map(item => item.line));
		const maxLine = Math.max(...parsedData.map(item => item.line));

		const jsonCount = parsedData.filter(item => item.type === 'JSON').length;
		const urlCount = parsedData.filter(item => item.type === 'URL').length;
		const tokenCount = parsedData.filter(item => item.type === 'Token').length;

		let summary = `${parsedData.length} Variables Found`;
		if (jsonCount > 0) summary += ` • ${jsonCount} JSON Payloads`;
		if (urlCount > 0) summary += ` • ${urlCount} URLs`;
		if (tokenCount > 0) summary += ` • ${tokenCount} Tokens`;
		summary += ` • Lines ${minLine}-${maxLine}`;

		combinedCount.textContent = summary;
		document.getElementById('combinedHeader').style.display = 'block';
	}

	// Toast notifications
	showToast(message, type = 'info') {
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

		setTimeout(() => toast.style.transform = 'translateX(0)', 10);
		setTimeout(() => {
			toast.style.transform = 'translateX(100%)';
			setTimeout(() => toast.remove(), 300);
		}, 3000);
	}

	// Error handling
	showError(message, error = null) {
		console.error('UI Error:', message, error);
		this.showToast(`Error: ${message}`, 'error');
		this.hideLoading();
	}

	// Display colored logs with syntax highlighting
	displayColoredLogs(rawLogText, searchTerm = '') {
		const container = document.getElementById('logViewContent');

		if (!rawLogText) {
			container.innerHTML = '<div class="log-view-content">No logs to display</div>';
			return;
		}

		const logLines = rawLogText.split('\n');

		// Apply search filter if active
		const filteredLines = searchTerm ?
			logLines.map((line, index) => ({ line, index }))
				.filter(item => item.line.toLowerCase().includes(searchTerm.toLowerCase())) :
			logLines.map((line, index) => ({ line, index }));

		container.className = 'log-view-content';
		if (this.wordWrapEnabled) {
			container.classList.add('word-wrap');
		}

		let html = '<div class="log-view-content">';
		filteredLines.forEach(item => {
			const highlightedLine = this.addColorHighlighting(item.line);
			const lineNumber = typeof item.index !== 'undefined' ? item.index + 1 : item;
			html += `<div class="log-line" data-line="${lineNumber}">${highlightedLine}</div>`;
		});
		html += '</div>';

		container.innerHTML = html;
		console.log('🖥️ UI: Logs displayed, lines:', filteredLines.length);
	}


	// Add color highlighting to log lines
	addColorHighlighting(line) {
		let highlighted = this.escapeHtml(line);

		// Highlight timestamps
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

		// Highlight JSON objects in logs
		if (highlighted.includes('{') && highlighted.includes('}') && highlighted.includes('"')) {
			// Highlight the entire JSON block with a background
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

		// Highlight request/response operations
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

		// Highlight buffer variables
		highlighted = highlighted.replace(
			/(Buffer with name[:\s]*['"])([^'"]*?)(['"][^'"]*has been set to value[:\s]*['"])([^'"]*?)(['"])/g,
			'$1<span class="log-buffer-name">$2</span>$3<span class="log-buffer-value">$4</span>$5'
		);

		// Highlight URLs
		highlighted = highlighted.replace(
			/(^|[^>])(https?:\/\/[^\s'"<>]+)/g,
			'$1<span class="log-url">$2</span>'
		);

		// Highlight status
		highlighted = highlighted.replace(/\[(Succeeded|Failed)\]/g, '<span class="log-status-$1">[$1]</span>');

		return highlighted;
	}

	// Display structured table view with JSON handling
	displayTableView(rawLogText, searchTerm = '') {
		const container = document.getElementById('tableViewContent');

		if (!rawLogText) {
			container.innerHTML = '<div class="table-view">No logs to display</div>';
			return;
		}

		// Parse raw logs into structured table data
		const tableData = this.parseLogsForTable(rawLogText);

		// Apply search filter if active
		const filteredTableData = searchTerm ?
			tableData.filter(row => this.matchesTableSearch(row, searchTerm.toLowerCase())) :
			tableData;

		// Generate table HTML
		const tableHTML = this.generateTableHTML(filteredTableData);
		container.innerHTML = tableHTML;
		console.log('🖥️ UI: Table displayed, rows:', filteredTableData.length);
	}

	// Parse logs into structured table format
	parseLogsForTable(logText) {
		const lines = logText.split('\n');
		const tableData = [];
		let lineNumber = 0;
		let currentTestCase = '';

		lines.forEach(line => {
			lineNumber++;
			if (!line.trim()) return;

			// Extract basic log information
			const logInfo = this.extractLogInfo(line, lineNumber);
			if (!logInfo) return;

			// Track current test case
			if (logInfo.type === 'testcase') {
				currentTestCase = logInfo.content;
			}

			// Add test case context to all entries
			logInfo.testCase = currentTestCase;
			logInfo.originalLine = line;

			tableData.push(logInfo);
		});

		return tableData;
	}

	// Extract structured information from a log line
	extractLogInfo(line, lineNumber) {
		// Extract timestamp
		const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)/);
		const timestamp = timestampMatch ? timestampMatch[1] : '';

		// Extract log level
		const levelMatch = line.match(/\[(INF|ERR|WAR|DEB)\]/);
		const level = levelMatch ? levelMatch[1] : '';

		// Extract component
		const componentMatch = line.match(/\[([^\]]+)\](?:\s*\[[^\]]*\])*\s*(.*)$/);
		const component = componentMatch ? componentMatch[1] : '';

		// Get the main content after prefixes
		let content = line.replace(/^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}[^[]*(?:\[[^\]]*\])*\s*/, '').trim();

		// Determine the type and extract relevant information
		let type = 'message';
		let operation = '';
		let status = '';
		let variable = '';
		let value = '';
		let jsonBody = '';
		let indentLevel = this.getIndentLevel(line);

		// Test Case detection
		const testCaseMatch = content.match(/Starting TestCase\s*['"]([^'"]+)['"]/);
		if (testCaseMatch) {
			type = 'testcase';
			operation = testCaseMatch[1];
			content = `Starting: ${testCaseMatch[1]}`;
		}
		// Operation with status
		else if (content.match(/^\[(Succeeded|Failed)\]/)) {
			const operationMatch = content.match(/^\[(Succeeded|Failed)\]\s*['"]([^'"]+)['"]/);
			if (operationMatch) {
				type = 'operation';
				status = operationMatch[1];
				operation = operationMatch[2];
				content = operation;
			}
		}
		// Buffer variable (handle Message: prefix)
		else if (content.includes('Buffer with name')) {
			const bufferMatch = content.match(/(?:Message:\s*)?Buffer with name[:\s]*['"]([^'"]*)['"]\s*has been set to value[:\s]*['"]([^'"]*)['"]/i);
			if (bufferMatch) {
				type = 'variable';
				variable = bufferMatch[1];
				value = bufferMatch[2];
				operation = `Set Buffer: ${variable}`;

				// Check if value is JSON
				if (this.isValidJSON(value)) {
					jsonBody = value;
				}
			}
		}
		// Message content
		else if (content.includes('Message:')) {
			const messageContent = content.replace(/.*Message:\s*/, '');
			type = 'message';
			content = messageContent;
			operation = messageContent;
		}
		// Duration entries
		else if (content.match(/\[DURATION:/)) {
			const durationMatch = content.match(/\[DURATION:\s*([^\]]+)\]/);
			if (durationMatch) {
				type = 'duration';
				operation = `Duration: ${durationMatch[1]}`;
				content = `Execution time: ${durationMatch[1]}`;
			}
		}

		// Clean up operation name for display
		if (!operation && content) {
			operation = content.length > 60 ? content.substring(0, 60) + '...' : content;
		}

		return {
			lineNumber,
			timestamp,
			level,
			component,
			type,
			operation,
			status,
			variable,
			value,
			jsonBody,
			indentLevel: Math.floor(indentLevel / 4), // Convert to levels
			content,
			testCase: ''
		};
	}

	// Check if table row matches search term
	matchesTableSearch(row, searchTerm) {
		const searchableFields = [
			row.operation,
			row.variable,
			row.value,
			row.testCase,
			row.content,
			row.level,
			row.status
		];

		return searchableFields.some(field =>
			field && field.toString().toLowerCase().includes(searchTerm)
		);
	}

	// Display table with hierarchical grouping
	displayHierarchicalTable(hierarchicalGroups, searchTerm = '') {
		const container = document.getElementById('tableViewContent');

		if (!hierarchicalGroups || hierarchicalGroups.length === 0) {
			container.innerHTML = '<div class="table-view">No logs to display</div>';
			return;
		}

		let html = '<div class="table-view-content">';

		// Create the table with header
		html += `
			<table class="log-table">
				<thead>
					<tr>
						<th style="width: 80px;">Line</th>
						<th style="width: 120px;">Time</th>
						<th style="width: 60px;">Level</th>
						<th>Operation/Message</th>
						<th style="width: 150px;">Variable</th>
						<th>Value</th>
						<th style="width: 60px;">Type</th>
						<th style="width: 80px;">Actions</th>
					</tr>
				</thead>
				<tbody>
		`;

		// Render groups hierarchically
		hierarchicalGroups.forEach(group => {
			html += this.renderTableGroup(group, searchTerm, 0);
		});

		html += `
				</tbody>
			</table>
		</div>`;

		container.innerHTML = html;

		// Setup click handlers
		this.setupTableGroupToggles();
		console.log('🖥️ UI: Hierarchical table displayed, groups:', hierarchicalGroups.length);
	}

	// Render a table group with collapsible structure
	renderTableGroup(group, searchTerm = '', level = 0) {
		const levelClass = `level-${Math.min(level, 4)}`;
		const groupId = `table_group_${group.id}`;
		const toggleId = `table_toggle_${group.id}`;

		// Check if group matches search
		const matchesSearch = searchTerm ? this.groupMatchesLogSearch(group, searchTerm) : true;
		if (!matchesSearch) return '';

		let html = '';

		// Group header row
		html += `
			<tr class="table-row-testcase ${levelClass}" data-group-id="${group.id}">
				<td class="table-line-number"></td>
				<td class="table-timestamp">${group.timestamp ? group.timestamp.substring(11, 19) : ''}</td>
				<td class="table-type-inf">INF</td>
				<td class="table-operation">
					<span onclick="toggleTableGroup('${groupId}', '${toggleId}')" style="cursor: pointer;">
						<span id="${toggleId}" class="json-toggle">${group.expanded ? '▼' : '▶'}</span>
						${group.type === 'testcase' ? '📁' : '🔧'} ${this.escapeHtml(group.name)}
					</span>
				</td>
				<td></td>
				<td class="log-group-meta" style="font-style: italic; color: #6c757d;">
					${group.lines.length} lines ${group.subGroups.length > 0 ? `• ${group.subGroups.length} operations` : ''}
				</td>
				<td></td>
				<td></td>
			</tr>
		`;

		// Group content rows
		html += `<tbody id="${groupId}" style="display: ${group.expanded ? 'table-row-group' : 'none'}">`;

		// Render group's direct lines
		group.lines.forEach(logInfo => {
			const lineMatches = searchTerm ? logInfo.originalLine.toLowerCase().includes(searchTerm.toLowerCase()) : true;
			if (lineMatches) {
				html += this.renderTableLogLine(logInfo, level + 1);
			}
		});

		// Render subgroups recursively
		group.subGroups.forEach(subGroup => {
			html += this.renderTableGroup(subGroup, searchTerm, level + 1);
		});

		html += '</tbody>';

		return html;
	}

	// Render individual log line as table row
	renderTableLogLine(logInfo, level = 0) {
		const levelClass = `level-${Math.min(level, 4)}`;
		const logData = this.extractLogInfo(logInfo.originalLine, logInfo.lineNumber);

		if (!logData) return '';

		// Extract variable if this is a buffer line
		const bufferMatch = logInfo.originalLine.match(/Buffer with name:\s*['""]([^'""]+)['""] has been set to value:\s*['""]([^'""]*)['""]?/);
		const variableName = bufferMatch ? bufferMatch[1] : '';
		const variableValue = bufferMatch ? bufferMatch[2] : '';
		const variableType = this.detectVariableType(variableValue);

		return `
			<tr class="table-row-message ${levelClass}">
				<td class="table-line-number">${logInfo.lineNumber}</td>
				<td class="table-timestamp">${logData.timestamp ? logData.timestamp.substring(11, 19) : ''}</td>
				<td class="table-type-${logData.level?.toLowerCase() || 'inf'}">${logData.level || 'INF'}</td>
				<td class="table-operation">${this.escapeHtml(logData.operation || logData.message || '')}</td>
				<td class="table-variable">${variableName ? this.escapeHtml(variableName) : ''}</td>
				<td class="table-value">${variableValue ? this.renderTableValue(variableValue, variableType) : ''}</td>
				<td class="table-type-badge">
					${variableType ? `<span class="type-badge type-${variableType.toLowerCase()}">${variableType}</span>` : ''}
				</td>
				<td class="table-actions">
					${variableValue ? this.renderTableActions(variableName, variableValue, variableType) : ''}
				</td>
			</tr>
		`;
	}

	// Render table value with appropriate formatting
	renderTableValue(value, type) {
		if (!value) return '';

		if (type === 'JSON') {
			// Handle JSON values
			const jsonId = `json_${Math.random().toString(36).substring(2, 11)}`;
			return `
				<div class="json-table-container">
					<div class="json-preview-line" onclick="toggleTableJson('${jsonId}')">
						<span class="json-indicator">{ }</span>
						<code>${this.escapeHtml(value.substring(0, 50))}${value.length > 50 ? '...' : ''}</code>
						<span id="${jsonId}-toggle" class="json-toggle">▶</span>
					</div>
					<div id="${jsonId}" class="json-expanded-content" style="display: none;">
						<pre class="json-formatted-table">${this.formatJSON(value)}</pre>
					</div>
				</div>
			`;
		}

		if (type === 'Token') {
			return `<span class="token-value" title="Click to view full token">${this.escapeHtml(value.substring(0, 20))}...</span>`;
		}

		if (type === 'URL') {
			return `<a href="${this.escapeHtml(value)}" target="_blank" class="url-link">${this.escapeHtml(value)}</a>`;
		}

		return `<code class="table-value-code">${this.escapeHtml(value)}</code>`;
	}

	// Render table action buttons
	renderTableActions(name, value, type) {
		let actions = `<button class="table-btn table-btn-copy" onclick="navigator.clipboard.writeText('${this.escapeHtml(value)}'); showToast('Copied to clipboard!')" title="Copy">📋</button>`;

		if (type === 'JSON') {
			actions += ` <button class="table-btn table-btn-postman" onclick="copyForPostman('${this.escapeHtml(name)}', '${this.escapeHtml(value)}')" title="Copy for Postman">📤</button>`;
		}

		actions += ` <button class="table-btn table-btn-view" onclick="showValueModal('${this.escapeHtml(name)}', '${this.escapeHtml(value)}')" title="View Full">👁</button>`;

		return actions;
	}

	// Setup table group toggle handlers
	setupTableGroupToggles() {
		// Define global function for table group toggling
		window.toggleTableGroup = (groupId, toggleId) => {
			const content = document.getElementById(groupId);
			const toggle = document.getElementById(toggleId);

			if (content && toggle) {
				const isExpanded = content.style.display !== 'none';
				content.style.display = isExpanded ? 'none' : 'table-row-group';
				toggle.textContent = isExpanded ? '▶' : '▼';
			}
		};
	}

	// Detect variable type for display purposes
	detectVariableType(value) {
		if (!value) return 'Buffer Variable';

		// JSON detection
		if (this.isValidJSON(value)) {
			try {
				const parsed = JSON.parse(value);
				if (typeof parsed === 'object' && parsed !== null) {
					return 'JSON';
				}
			} catch (e) {
				// Not valid JSON
			}
		}

		// Token detection
		if (value.length > 100 && /^[A-Za-z0-9_\-\.]+$/.test(value)) {
			return 'Token';
		}

		// URL detection
		if (value.includes('http://') || value.includes('https://')) {
			return 'URL';
		}

		// ID detection (UUID pattern)
		if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
			return 'ID';
		}

		// Timestamp detection
		if (/^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}/.test(value)) {
			return 'Timestamp';
		}

		return 'Buffer Variable';
	}

	// Check if string is valid JSON
	isValidJSON(str) {
		if (!str || typeof str !== 'string') return false;
		if (!str.trim().startsWith('{') && !str.trim().startsWith('[')) return false;
		try {
			JSON.parse(str);
			return true;
		} catch (e) {
			return false;
		}
	}

	// Generate HTML for the table
	generateTableHTML(tableData) {
		if (tableData.length === 0) {
			return '<div class="table-view">No matching log entries found</div>';
		}

		// Extract test case name if available
		const testCaseRow = tableData.find(row => row.type === 'testcase');
		const testCaseName = testCaseRow ? testCaseRow.operation : '';

		let html = '<div class="table-view-content">';

		// Add test case header
		if (testCaseName) {
			html += `
				<div class="test-case-header">
					<h3>Test Case: ${this.escapeHtml(testCaseName)}</h3>
				</div>
			`;
		}

		// Create the table
		html += `
			<table class="log-table">
				<thead>
					<tr>
						<th style="width: 50px;">Line</th>
						<th style="width: 80px;">Time</th>
						<th style="width: 40px;">Level</th>
						<th style="width: 60px;">Status</th>
						<th style="width: 300px;">Operation/Message</th>
						<th style="width: 120px;">Variable</th>
						<th style="width: 200px;">Value</th>
						<th style="width: 60px;">Actions</th>
					</tr>
				</thead>
				<tbody>
		`;

		// Generate table rows
		tableData.forEach((row, index) => {
			html += this.generateTableRow(row, index);
		});

		html += `
				</tbody>
			</table>
		</div>`;

		return html;
	}

	// Generate individual table row
	generateTableRow(row, index) {
		const levelClass = `level-${Math.min(row.indentLevel, 4)}`;
		const rowTypeClass = `table-row-${row.type}`;

		// Format timestamp
		const timeDisplay = row.timestamp ?
			new Date(row.timestamp).toLocaleTimeString([], { hour12: false }) : '';

		// Format log level
		const levelDisplay = row.level ?
			`<span class="table-type table-type-${row.level.toLowerCase()}">${row.level}</span>` : '';

		// Format status
		const statusDisplay = row.status ?
			`<span class="table-status table-status-${row.status.toLowerCase()}">${row.status}</span>` : '';

		// Format operation with indentation
		const operationDisplay = `<span class="${levelClass}">${this.escapeHtml(row.operation || row.content)}</span>`;

		// Format variable
		const variableDisplay = row.variable ? this.escapeHtml(row.variable) : '';

		// Format value with JSON handling
		let valueDisplay = '';
		let actionButtons = '';

		if (row.jsonBody) {
			// JSON value with expand/collapse
			const jsonId = `json-${index}`;
			const preview = row.value.length > 50 ? row.value.substring(0, 50) + '...' : row.value;

			valueDisplay = `
				<div class="json-table-container">
					<div class="json-preview-line" onclick="toggleTableJson('${jsonId}')">
						<span class="json-indicator">📄</span>
						<code>${this.escapeHtml(preview)}</code>
						<span class="json-toggle" id="${jsonId}-toggle">▶</span>
					</div>
					<div class="json-expanded-content" id="${jsonId}" style="display: none;">
						<pre class="json-formatted-table">${this.formatJSONWithHighlighting(row.jsonBody)}</pre>
					</div>
				</div>
			`;

			actionButtons = `
				<button onclick="window.app.copyForPostman('${this.escapeForJS(row.jsonBody)}')" class="table-btn table-btn-postman" title="Copy for Postman">🚀</button>
				<button onclick="window.app.copyToClipboard('${this.escapeForJS(row.jsonBody)}')" class="table-btn table-btn-copy" title="Copy JSON">📋</button>
			`;
		} else if (row.value) {
			// Regular value
			const displayValue = row.value.length > 60 ? row.value.substring(0, 60) + '...' : row.value;
			valueDisplay = `<code class="table-value-code">${this.escapeHtml(displayValue)}</code>`;

			if (row.value.length > 60) {
				actionButtons = `
					<button onclick="window.app.showFullValue('${this.escapeForJS(row.value)}', '${this.escapeForJS(row.variable || 'Value')}', ${row.lineNumber})" class="table-btn table-btn-view" title="View Full">👁️</button>
					<button onclick="window.app.copyToClipboard('${this.escapeForJS(row.value)}')" class="table-btn table-btn-copy" title="Copy Value">📋</button>
				`;
			} else {
				actionButtons = `
					<button onclick="window.app.copyToClipboard('${this.escapeForJS(row.value)}')" class="table-btn table-btn-copy" title="Copy Value">📋</button>
				`;
			}
		}

		return `
			<tr class="${rowTypeClass}" data-level="${row.indentLevel}" data-line="${row.lineNumber}">
				<td class="table-line-number">${row.lineNumber}</td>
				<td class="table-timestamp">${timeDisplay}</td>
				<td class="table-level">${levelDisplay}</td>
				<td class="table-status-column">${statusDisplay}</td>
				<td class="table-operation ${levelClass}">${operationDisplay}</td>
				<td class="table-variable">${variableDisplay}</td>
				<td class="table-value-cell">${valueDisplay}</td>
				<td class="table-actions">${actionButtons}</td>
			</tr>
		`;
	}

	// Check if string is valid JSON
	isValidJSON(str) {
		try {
			JSON.parse(str);
			return true;
		} catch (e) {
			return false;
		}
	}

	// Get indentation level from line
	getIndentLevel(line) {
		const match = line.match(/^(\s*)/);
		return match ? match[1].length : 0;
	}

	// Utility functions
	escapeHtml(text) {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}

	escapeForJS(str) {
		return JSON.stringify(str).slice(1, -1);
	}
}

export default UIManager;