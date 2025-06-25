# Tosca Log Parser Bookmarklet

A bookmarklet for extracting and parsing Tosca Cloud execution logs directly from the browser.

## 📁 File Organization

```
bookmarklet/
├── README.md                      # This file
├── package.json                   # Build dependencies
├── simple-log-copier.js          # ✅ CURRENT: Simple log copying bookmarklet
├── simple-log-copier.bookmarklet.js # ✅ READY TO USE: Encoded bookmarklet
├── encode-bookmarklet.js          # Tool to encode JS to bookmarklet format
├── build.js                       # Advanced build script
├── dist/                          # 📦 Built/encoded bookmarklets ready for use
│   ├── simple-log-copier.bookmarklet.js
│   ├── log-parser-last-working.bookmarklet.js
│   └── log-parser-bookmarklet-v2.bookmarklet.js
├── debug/                         # 🔧 Development/debugging files
│   ├── bookmarklet-fixed.js       # Previous working version
│   ├── bookmarklet-fixed-encoded.js
│   └── logs_mostly_working*.js    # Various test versions
└── archive/                       # 📚 Historical versions and experiments
    ├── log-parser-bookmarklet-v*.js
    ├── README-FINAL.md
    └── test-*.js
```

## 🚀 Quick Start

### Simple Log Copier (Recommended for Testing)

1. Copy the content from `simple-log-copier.bookmarklet.js`
2. Create a new bookmark in your browser
3. Paste the content as the URL
4. Navigate to a Tosca Cloud execution page with logs
5. Click the bookmark to automatically copy logs to clipboard

### Full Parser (For Advanced Parsing)

1. Use the content from `dist/log-parser-last-working.bookmarklet.js`
2. Creates a modal interface for advanced log parsing and variable extraction

## 🛠️ Development

### Encoding a Bookmarklet

```bash
node encode-bookmarklet.js input-file.js output-file.bookmarklet.js
```

### Building All Bookmarklets

```bash
node build.js
```

## 📋 Features

### Simple Log Copier

- ✅ Automatically detects logs on Tosca Cloud pages
- ✅ Copies logs to clipboard with one click
- ✅ Shows status notifications
- ✅ Lightweight and fast

### Full Parser

- ✅ Extracts buffer variables from logs
- ✅ Groups variables by test case context
- ✅ Displays parsed results in modal interface
- ✅ Copy individual groups or all variables
- ✅ URL detection and linking

## 🎯 Use Cases

1. **Quick Testing**: Use simple-log-copier to grab logs and paste into website parser
2. **On-Page Analysis**: Use full parser for immediate analysis without leaving the page
3. **API Development**: Extract variables for Postman/API testing workflows

## 🔗 Integration

Works best with the [Tosca Log Parser Website](../website/) for comprehensive log analysis and JSON extraction for API development.
