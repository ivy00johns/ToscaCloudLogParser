// Simple Tosca Log Copier Bookmarklet
// Extracts logs from page and copies to clipboard for testing

(function () {
	// Helper function to show notification
	function showNotification(message, success = true) {
		const notification = document.createElement('div');
		notification.textContent = message;
		notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${success ? '#28a745' : '#dc3545'};
            color: white;
            border-radius: 6px;
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            max-width: 300px;
        `;

		document.body.appendChild(notification);

		setTimeout(() => {
			notification.remove();
		}, 3000);
	}

	// Copy text to clipboard
	function copyToClipboard(text) {
		if (navigator.clipboard) {
			return navigator.clipboard.writeText(text);
		} else {
			// Fallback for older browsers
			const textArea = document.createElement('textarea');
			textArea.value = text;
			textArea.style.position = 'fixed';
			textArea.style.left = '-999999px';
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand('copy');
			document.body.removeChild(textArea);
			return Promise.resolve();
		}
	}

	// Extract logs from page
	function extractLogs() {
		let logText = '';

		// Common selectors for log content on Tosca Cloud pages
		const logSelectors = [
			// Try common log container selectors
			'.log-container pre',
			'.log-content pre',
			'.console-output pre',
			'#logContent pre',
			'.execution-log pre',
			'textarea[readonly]',
			'.log-viewer pre',
			'.output-content pre',
			// Generic fallbacks
			'pre',
			'.logs',
			'.console',
			'.output'
		];

		// Try each selector until we find logs
		for (const selector of logSelectors) {
			const elements = document.querySelectorAll(selector);
			for (const element of elements) {
				const text = element.textContent || element.innerText;
				if (text && text.length > 100 && (
					text.includes('Starting TestCase') ||
					text.includes('Buffer with name') ||
					text.includes('http') ||
					text.includes('Execution') ||
					text.includes('TestCase')
				)) {
					logText = text;
					break;
				}
			}
			if (logText) break;
		}

		// If no structured logs found, try to find any long text content
		if (!logText) {
			const allElements = document.querySelectorAll('*');
			for (const element of allElements) {
				const text = element.textContent || element.innerText;
				if (text && text.length > 500 && (
					text.includes('Starting TestCase') ||
					text.includes('Buffer with name')
				)) {
					// Make sure this isn't just the whole page
					if (text.length < 50000) {
						logText = text;
						break;
					}
				}
			}
		}

		return logText;
	}

	// Main execution
	try {
		const logs = extractLogs();

		if (!logs) {
			showNotification('No logs found on this page', false);
			return;
		}

		copyToClipboard(logs).then(() => {
			const lineCount = logs.split('\n').length;
			const charCount = logs.length;
			showNotification(`Logs copied! ${lineCount} lines, ${(charCount / 1024).toFixed(1)}KB`);
		}).catch(() => {
			showNotification('Failed to copy logs', false);
		});

	} catch (error) {
		console.error('Log copier error:', error);
		showNotification('Error extracting logs', false);
	}
})();