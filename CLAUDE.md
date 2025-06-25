# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a JavaScript project that creates bookmarklets for parsing Tosca Cloud execution logs. The main functionality extracts buffer variables, GUIDs, URLs, and timestamps from Tosca log files to help with test automation analysis.

## Core Architecture

- **Main Parser**: `log-parser-bookmarklet.js` - Core bookmarklet that creates a browser overlay for log parsing
- **Encoding Utility**: `encode-bookmarklet.js` - Node.js script that minifies and encodes JavaScript files into bookmarklet format
- **Multiple Versions**: Various versioned files (`v2`, `v3`, etc.) representing different iterations of the parser
- **Debug Versions**: Files with `-debug`, `-super-debug` suffixes for development/troubleshooting

## Key Components

### Log Parsing Logic
- Extracts buffer variables using regex: `Buffer with name: "name" has been set to value: "value"`
- Identifies GUIDs/IDs using standard GUID format patterns
- Captures URLs and timestamps from log entries
- Groups extracted data by test execution context

### Bookmarklet Structure
- Creates modal overlay with tabs for different input methods (paste, screen grab, file upload)
- Provides filtering options for different data types
- Supports grouping by execution context
- Includes export functionality (JSON, clipboard)

## Development Commands

```bash
# Encode a JavaScript file into bookmarklet format
node encode-bookmarklet.js <input-file> <output-file>

# Example: Encode the main parser
node encode-bookmarklet.js log-parser-bookmarklet.js log-parser-bookmarklet-encoded.js
```

## File Naming Conventions

- Base files: `log-parser-bookmarklet.js`
- Versioned: `log-parser-bookmarklet-v2.js`, `log-parser-bookmarklet-v3.js`
- Encoded: Files ending in `-encoded.js` are minified bookmarklet versions
- Debug: Files with `-debug` suffix contain additional logging/debugging code
- Working: Files with `-working` suffix are stable versions being tested

## Log Format Understanding

The parser expects Tosca Cloud logs in this format:
```
YYYY-MM-DD HH:MM:SSZ [INF][TBox] [Status] "Test Name" [DURATION: HH:MM:SS.microseconds]
    Message: Buffer with name: "variable_name" has been set to value: "variable_value"
```

Context grouping is based on indentation levels and test case names extracted from log entries.