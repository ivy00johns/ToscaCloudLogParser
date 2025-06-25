# Tosca Cloud Log Parser

A comprehensive tool for parsing and extracting variables, JSON payloads, and URLs from Tosca Cloud execution logs. Optimized for API development and testing workflows.

## 🚀 Quick Start

### Website Version (Recommended for Development) ⭐

1. Open `website/index.html` in your browser
2. Paste your Tosca logs or load a log file
3. View extracted variables with advanced JSON handling for Postman integration
4. Copy JSON payloads directly for API testing

### Simple Log Copier Bookmarklet (New!)

**Perfect for speeding up testing:**

1. Navigate to `bookmarklet/` folder → open `QUICK-START.md`
2. Copy the contents of `dist/simple-log-copier.bookmarklet.js`
3. Create a browser bookmark with the JavaScript as the URL
4. Click bookmark on Tosca pages → logs auto-copied to clipboard!
5. Paste into website parser for full analysis

## 📁 Project Structure

```
├── website/                        # 🌐 Main web application
│   ├── index.html                  # Full-featured HTML parser
│   ├── parser.js                   # Advanced parsing with JSON support
│   └── complex-example-logs.txt    # Test data
├── bookmarklet/                    # 📎 Browser integration tools
│   ├── QUICK-START.md              # ⚡ 1-minute setup guide
│   ├── simple-log-copier.js        # New: Simple log extraction
│   ├── dist/                       # 📦 Ready-to-use bookmarklets
│   │   ├── simple-log-copier.bookmarklet.js    # ⭐ For testing
│   │   └── log-parser-last-working.bookmarklet.js  # Full parser
│   ├── debug/                      # 🔧 Development files
│   └── archive/                    # 📚 Historical versions
├── debug/                          # 🔍 Project-level debug files
│   ├── notes.md                    # Development notes
│   ├── latest-logs-example.txt     # Current test data
│   └── *.txt                       # Various log samples
└── CLAUDE.md                       # 📝 Development guidelines
```

## ✨ Key Features

### Website Parser

- **🎯 JSON Payload Detection**: Automatically finds and formats JSON for Postman
- **🔑 Token Handling**: Truncates access tokens for security
- **📊 Variable Classification**: JSON, URL, Token, ID, Timestamp, Buffer Variable
- **🎨 Syntax Highlighting**: Color-coded logs with request/response indicators
- **📋 Copy for Postman**: One-click JSON copying optimized for API testing
- **🔍 Advanced Search**: Filter by type, search across names/values

### Bookmarklets

- **⚡ Simple Log Copier**: One-click log extraction from Tosca Cloud pages
- **🔧 Full Parser**: Complete parsing interface in a modal overlay
- **📱 Auto-Detection**: Smart log detection across different page layouts
- **📋 Clipboard Integration**: Seamless copy/paste workflow

## 🎯 Recommended Workflow

### For API Development & Testing

1. **Extract logs**: Use simple-log-copier bookmarklet on Tosca Cloud
2. **Parse & analyze**: Paste into website parser for JSON extraction
3. **Copy to Postman**: Use "Copy for Postman" buttons for API testing
4. **Iterate quickly**: Repeat cycle for rapid development

### For Log Analysis

1. Use website parser directly with log files or pasted content
2. Leverage advanced filtering and search capabilities
3. Export results as needed

## 🛠️ Development

### Testing New Features

1. Develop in `website/` version first (easier debugging)
2. Test with various log samples in `debug/` folder
3. Use simple-log-copier bookmarklet for rapid testing cycles

### Log Format Support

Supports Tosca Cloud logs with patterns like:

```
YYYY-MM-DD HH:MM:SSZ [INF][TBox] [Status] "Test Name" [DURATION: HH:MM:SS.microseconds]
    Message: Buffer with name: "variable_name" has been set to value: "variable_value"
    JSON payloads with multi-line support
    URLs and authentication tokens
```

## 🎨 Recent Enhancements

- **JSON-First Approach**: Prioritizes complete JSON objects over individual URLs
- **Context Awareness**: Shows request/response context for JSON payloads
- **Visual Improvements**: Enhanced button alignment and consistent styling
- **Debug Logging**: Comprehensive logging for troubleshooting parsing issues
- **Mobile Responsive**: Works well on different screen sizes
