# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a comprehensive JavaScript project for parsing Tosca Cloud execution logs, offering both bookmarklet and standalone website solutions. The main functionality extracts buffer variables, JSON payloads, URLs, tokens, and timestamps from Tosca log files to help with test automation analysis and API development workflows.

## Project Structure

```
ToscaCloudLogParserWebsite/
├── website/                    # 🌐 Standalone Website Application (MAIN)
│   ├── index.html             # Primary web interface with advanced features
│   ├── parser.js              # Core log parsing engine (v2)
│   └── complex-example-logs.txt # Sample log files for testing
├── bookmarklet/               # 📖 Browser Bookmarklet Tools
│   ├── simple-log-copier.js   # ✅ RECOMMENDED: Quick log extraction
│   ├── build.js               # Automated build system
│   ├── package.json           # Build configuration
│   ├── dist/                  # Built/encoded bookmarklets ready to use
│   ├── debug/                 # Development versions
│   └── archive/               # Historical versions
├── debug/                     # Sample log files and testing data
└── CLAUDE.md                 # This file
```

## Core Architecture

### Website Application (Primary Interface)
- **Main Parser**: `website/parser.js` - Advanced standalone log parser with enhanced features
- **Web Interface**: `website/index.html` - Full-featured web application with:
  - Multiple input methods (paste, file upload)
  - Three view modes (Variables, Logs, Table)
  - Advanced filtering and search
  - JSON syntax highlighting
  - Enhanced variable type detection
  - Export/copy functionality

### Bookmarklet Tools (Browser Integration)
- **Simple Log Copier**: `bookmarklet/simple-log-copier.js` - Lightweight tool for quick log extraction
- **Build System**: `bookmarklet/build.js` - Automated encoding and building of bookmarklets
- **Encoding Utility**: `bookmarklet/encode-bookmarklet.js` - Converts JS files to bookmarklet format
- **Archive**: Historical versions and experimental implementations

## Key Components

### Enhanced Log Parsing Logic (v2)
- **Buffer Variables**: Extracts using regex: `Buffer with name: "name" has been set to value: "value"`
- **Multi-line JSON Support**: Handles complex JSON payloads spanning multiple log lines
- **Variable Type Detection**: Automatically categorizes variables as:
  - `JSON` - Structured JSON objects/arrays with syntax highlighting
  - `Token` - Access tokens and authentication credentials (truncated for security)
  - `URL` - HTTP/HTTPS URLs with clickable links
  - `ID` - UUIDs and long alphanumeric identifiers
  - `Timestamp` - ISO datetime stamps
  - `Buffer Variable` - Standard string variables
- **Smart Context Grouping**: Groups variables by TestCase and Operation context
- **Request/Response Detection**: Identifies API request/response patterns

### Website Interface Features
- **Three View Modes**:
  - Variables: Grouped variable tables with enhanced display
  - Logs: Syntax-highlighted log viewer with color coding
  - Table: Structured data view (future enhancement)
- **Advanced JSON Handling**:
  - Full JSON display with syntax highlighting
  - Request/response context indicators
  - Postman-ready copy functionality
- **Enhanced UI**:
  - Real-time search filtering
  - Copy individual variables or entire groups
  - Export to JSON format
  - Toast notifications for user feedback
  - Modal viewers for long values

### Bookmarklet Structure (Legacy/Simplified)
- **Simple Log Copier**: One-click log extraction to clipboard
- **Archive**: Historical full-featured bookmarklets with modal overlays
- **Build System**: Automated minification and encoding

## Development Commands

### Website Development
```bash
# No build required - open directly in browser
open website/index.html

# For development server (optional)
cd website
python -m http.server 8000  # or any local server
```

### Bookmarklet Development
```bash
# Navigate to bookmarklet directory
cd bookmarklet

# Build all configured bookmarklets
npm run build
# or
node build.js

# Watch for changes during development
npm run dev
# or
node build.js watch

# Clean built files
npm run clean
# or
node build.js clean

# Encode a specific file manually
node encode-bookmarklet.js <input-file> <output-file>
# Example:
node encode-bookmarklet.js simple-log-copier.js simple-log-copier.bookmarklet.js
```

## File Naming Conventions

### Website Files
- `website/index.html` - Main web application interface
- `website/parser.js` - Core parsing engine (current version)
- `website/*.txt` - Sample log files for testing

### Bookmarklet Files
- **Current/Recommended**: `simple-log-copier.js` - Lightweight log extraction tool
- **Built Files**: `dist/*.bookmarklet.js` - Ready-to-use encoded bookmarklets
- **Versioned Archive**: `archive/log-parser-bookmarklet-v*.js` - Historical iterations
- **Debug**: `debug/*` - Development and testing versions
- **Working**: Files with `-working` suffix are stable versions being tested
- **Encoded**: Files ending in `.bookmarklet.js` are minified, browser-ready versions

### Build Configuration
- `package.json` - NPM build scripts and metadata
- `build.js` - Automated build system for bookmarklets

## Log Format Understanding

The parser expects Tosca Cloud logs in this format:
```
YYYY-MM-DD HH:MM:SSZ [INF][TBox] [Status] "Test Name" [DURATION: HH:MM:SS.microseconds]
    Message: Buffer with name: "variable_name" has been set to value: "variable_value"
```

### Enhanced Format Support (v2)
- **Multi-line JSON**: Handles JSON values spanning multiple log lines
- **Context Grouping**: Based on indentation levels and test case names
- **Request/Response Context**: Detects API operation patterns
- **Token Security**: Automatically truncates sensitive tokens for display
- **Smart Filtering**: Filters out noise before "Starting TestCase" entries

### Supported Variable Patterns
```
# Buffer Variables (primary)
Buffer with name: "variable_name" has been set to value: "value"
Buffer with name 'variable_name' has been set to value 'value'

# Multi-line JSON (enhanced)
Buffer with name: "json_payload" has been set to value: "{
  "key": "value",
  "array": [1, 2, 3]
}"

# URLs (automatic detection)
https://api.example.com/endpoint

# Tokens (automatically truncated)
eyJraWQiOiJEZk5KSGRPVE1KekJhR0hmdWtnclpaMzY3WXM1...
```

## Recommended Workflow

### Quick Testing (Recommended)
1. Use `simple-log-copier` bookmarklet to extract logs from Tosca Cloud
2. Open `website/index.html` in browser
3. Paste logs and parse for comprehensive analysis

### Advanced Development
1. Use website interface for full-featured log analysis
2. Export variables for API testing in Postman
3. Utilize JSON highlighting for complex payload analysis