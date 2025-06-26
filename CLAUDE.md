# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a comprehensive JavaScript project for parsing Tosca Cloud execution logs, offering both bookmarklet and standalone website solutions. The main functionality extracts buffer variables, JSON payloads, URLs, tokens, and timestamps from Tosca log files to help with test automation analysis and API development workflows.

## Project Structure

```
ToscaCloudLogParserWebsite/
├── website/                    # 🌐 Standalone Website Application (MAIN)
│   ├── index.html             # Primary web interface - CLEAN VERSION
│   ├── parser.js              # Core log parsing engine (v3)
│   └── archive-old-index.html # Previous version (archived)
├── bookmarklet/               # 📖 Browser Bookmarklet Tools
│   ├── simple-log-copier.js   # ✅ CURRENT: Quick log extraction
│   ├── build.js               # Automated build system
│   ├── package.json           # NPM configuration
│   ├── encode-bookmarklet-simple.js # Encoder utility
│   └── dist/                  # Built/encoded bookmarklets ready to use
│       ├── tosca-log-copier.bookmarklet.js
│       └── test.html          # Installation page
├── debug/                     # Sample log files and testing data
│   ├── simple-example-logs.txt
│   └── advanced-example-logs.txt
├── archive/                   # 📦 ALL OLD CODE (SAFELY ARCHIVED)
│   ├── bookmarklet-OLD/       # Previous bookmarklet versions
│   ├── website-OLD/           # Previous web interface (modular version)
│   └── test files...          # Test scripts and outputs
├── README.md                  # Updated project documentation
├── CLAUDE.md                 # This file (updated)
└── PROJECT-STATUS.md          # Current project status
```

## Core Architecture

### Website Application (Primary Interface)

- **Main Parser**: `website/parser.js` - Clean, modular log parser with enhanced features
- **Web Interface**: `website/index.html` - Modern single-file web application with:
  - Multiple input methods (paste, file upload, drag & drop)
  - Four view modes (Variables, Logs, Table, Bookmarklet)
  - Real-time search and filtering
  - JSON syntax highlighting and formatting
  - Enhanced variable type detection (6 types)
  - Export/copy functionality with notifications
  - Responsive design with clean UI

### Bookmarklet Tools (Browser Integration)

- **Simple Log Copier**: `bookmarklet/simple-log-copier.js` - Production bookmarklet for log extraction
- **Build System**: `bookmarklet/build.js` - Automated encoding and building with npm scripts
- **Encoding Utility**: `bookmarklet/encode-bookmarklet-simple.js` - Converts JS to bookmarklet format
- **Distribution**: `dist/` folder contains ready-to-use bookmarklets and test page
- **Archive**: Old experimental versions preserved in `archive/bookmarklet-OLD/`

## Key Components

### Enhanced Log Parsing Logic (v3 - Current Clean Version)

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

# 🎯 Current Project Status (Clean Rebuild Complete)

## ✅ **Major Cleanup & Rebuild Completed**

**Project fully rebuilt from scratch with clean architecture:**

1. **✅ Complete Code Reorganization** - All old code archived in `archive/`
2. **✅ Single-File Web Interface** - Clean, modern `website/index.html` 
3. **✅ Modular Parser** - New `website/parser.js` with 6 variable types
4. **✅ Working Bookmarklet System** - Automated build pipeline
5. **✅ Updated Documentation** - README.md and CLAUDE.md refreshed

## 🔧 **Current Clean Architecture**

```
website/
├── index.html              # Single-file web app (clean rebuild)
├── parser.js               # Modular parser class
└── archive-old-index.html  # Previous version (archived)
```

## 🎨 **Fully Working Features**

- **Variables View**: ✅ 16 variables parsed from sample logs
- **Logs View**: ✅ Syntax highlighting, search, line numbers
- **Table View**: ✅ Structured data display
- **Bookmarklet View**: ✅ Working bookmarklet generation
- **Search**: ✅ Real-time filtering across all views
- **Export**: ✅ JSON download functionality
- **File Upload**: ✅ Drag & drop support

## 📊 **Parser Performance**

Successfully tested with `debug/simple-example-logs.txt`:
- **16 variables** extracted from 274 log lines
- **6 variable types** detected (JSON, Token, URL, ID, Timestamp, String)
- **1 test case** identified and grouped
- **2.9KB** bookmarklet size (44% compression)

## 🚀 **Development Commands**

```bash
# Start web interface
open website/index.html

# Build bookmarklets
cd bookmarklet
npm run build

# Test parser (if needed)
node archive/test-parser.js
```

## 📝 **Current Test Data**

- `debug/simple-example-logs.txt` - 274 lines, 16 variables
- `debug/advanced-example-logs.txt` - More complex examples

## 🎯 **Ready for Enhancements**

The foundation is solid and ready for improvements like:
- Enhanced JSON parsing for complex multi-line values
- Better variable type detection
- Additional export formats
- UI/UX improvements
- Performance optimizations

---
**Status**: ✅ **COMPLETE CLEAN REBUILD** - Ready for feature development
**Architecture**: Single-file web app + modular parser + automated bookmarklet build
