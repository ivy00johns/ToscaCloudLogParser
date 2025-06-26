// Simple Tosca Log Copier - Extract logs from Tosca Cloud page
(function() {
    // Show notification function
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
    async function copyToClipboard(text) {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
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
            }
            return true;
        } catch (error) {
            console.error('Copy failed:', error);
            return false;
        }
    }

    // Find log container using Tosca Cloud specific selectors
    function findLogContainer() {
        const selectors = [
            // Tosca Cloud specific selectors (Material-UI based)
            '.MuiBox-root.css-0',
            '[class*="MuiBox"][class*="css-"]',
            '[data-testid*="log"]',
            
            // Generic log selectors
            '.log-container',
            '.tosca-log-container',
            '.execution-log',
            '.console-output',
            'pre',
            
            // Text areas that might contain logs
            'textarea[readonly]'
        ];

        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
                const text = element.textContent || element.innerText;
                // Check if this element contains Tosca log patterns
                if (text && text.length > 100 && (
                    text.includes('[INF][TBox]') ||
                    text.includes('Starting TestCase') ||
                    text.includes('Buffer with name')
                )) {
                    return element;
                }
            }
        }
        
        return null;
    }

    // Main execution
    try {
        const logContainer = findLogContainer();
        
        if (!logContainer) {
            showNotification('No Tosca logs found on this page', false);
            return;
        }

        const logText = logContainer.textContent || logContainer.innerText;
        
        if (!logText || logText.length < 100) {
            showNotification('Log container found but appears empty', false);
            return;
        }

        copyToClipboard(logText).then(success => {
            if (success) {
                const lineCount = logText.split('\n').length;
                const sizeKB = (logText.length / 1024).toFixed(1);
                showNotification(`Tosca logs copied! ${lineCount} lines, ${sizeKB}KB`);
            } else {
                showNotification('Failed to copy logs to clipboard', false);
            }
        });

    } catch (error) {
        console.error('Tosca log copier error:', error);
        showNotification('Error extracting logs: ' + error.message, false);
    }
})();