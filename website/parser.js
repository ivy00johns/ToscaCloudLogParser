// Tosca Cloud Log Parser - Clean implementation
class ToscaLogParser {
    constructor() {
        this.variables = [];
        this.logs = [];
        this.debugMode = false;
    }

    parse(logText) {
        if (!logText || typeof logText !== 'string') {
            throw new Error('Invalid log text provided');
        }

        this.variables = [];
        this.logs = [];
        
        const lines = logText.split('\n');
        let currentContext = { testCase: null, operation: null };
        
        lines.forEach((line, index) => {
            if (!line.trim()) return;
            
            // Store all log lines
            this.logs.push({
                lineNumber: index + 1,
                content: line,
                type: this.detectLogType(line),
                timestamp: this.extractTimestamp(line),
                context: { ...currentContext }
            });
            
            // Update context
            if (line.includes('Starting TestCase')) {
                const match = line.match(/Starting TestCase "([^"]+)"/);
                if (match) {
                    currentContext.testCase = match[1];
                    currentContext.operation = null;
                }
            }
            
            // Extract buffer variables
            const bufferMatch = line.match(/Buffer with name[:\s]+['"]([^'"]+)['"]\s+has been set to value[:\s]+['"]([^'"]+)['"]/i);
            if (bufferMatch) {
                const [, name, value] = bufferMatch;
                this.variables.push({
                    name,
                    value,
                    type: this.detectVariableType(name, value),
                    lineNumber: index + 1,
                    timestamp: this.extractTimestamp(line),
                    context: { ...currentContext }
                });
            }
        });
        
        return {
            variables: this.variables,
            logs: this.logs,
            summary: {
                totalLines: lines.length,
                totalVariables: this.variables.length,
                testCases: this.getUniqueTestCases()
            }
        };
    }
    
    detectLogType(line) {
        if (line.includes('[ERR]')) return 'error';
        if (line.includes('[WRN]')) return 'warning';
        if (line.includes('[INF]')) return 'info';
        if (line.includes('[DBG]')) return 'debug';
        if (line.includes('[Succeeded]')) return 'success';
        if (line.includes('[Failed]')) return 'failure';
        return 'default';
    }
    
    detectVariableType(name, value) {
        // JSON detection
        if (value.trim().startsWith('{') || value.trim().startsWith('[')) {
            try {
                JSON.parse(value);
                return 'JSON';
            } catch (e) {
                // Not valid JSON
            }
        }
        
        // Token detection
        if (name.toLowerCase().includes('token') || 
            name.toLowerCase().includes('access') ||
            value.match(/^[A-Za-z0-9_-]{40,}$/)) {
            return 'Token';
        }
        
        // URL detection
        if (value.match(/^https?:\/\//)) {
            return 'URL';
        }
        
        // UUID detection
        if (value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            return 'ID';
        }
        
        // Timestamp detection
        if (value.match(/^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}/)) {
            return 'Timestamp';
        }
        
        return 'String';
    }
    
    extractTimestamp(line) {
        const match = line.match(/^(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}[Z\+\-\d:]*)/);
        return match ? match[1] : null;
    }
    
    getUniqueTestCases() {
        const testCases = new Set();
        this.logs.forEach(log => {
            if (log.context.testCase) {
                testCases.add(log.context.testCase);
            }
        });
        return Array.from(testCases);
    }
}

// Export for use in both browser and Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ToscaLogParser;
} else if (typeof window !== 'undefined') {
    window.ToscaLogParser = ToscaLogParser;
}

// Also make it available globally for eval contexts
if (typeof global !== 'undefined') {
    global.ToscaLogParser = ToscaLogParser;
}