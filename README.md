# Tosca Cloud Log Parser

A comprehensive tool for parsing Tosca Cloud execution logs and extracting buffer variables, with both a web interface and bookmarklet functionality.

## 🚀 Quick Start

### Web Interface

1. Open `website/index.html` in your browser
2. Paste your Tosca Cloud logs into the text area
3. Click "Parse Logs" to extract variables
4. Use the tabs to switch between Variables, Logs, Table, and Bookmarklet views

### Bookmarklet

1. Open `bookmarklet/dist/test.html` in your browser
2. Drag the "Tosca Log Copier" link to your bookmarks bar
3. Navigate to a Tosca Cloud page with logs
4. Click the bookmarklet to copy logs to your clipboard

## 📁 Project Structure

```yml
ToscaCloudLogParserWebsite/
├── website/                    # 🌐 Web Interface (MAIN)
│   ├── index.html             # Primary web interface
│   ├── js/                    # Modular ES6 architecture
│   │   ├── ToscaLogParserApp.js   # Main coordinator
│   │   ├── core/LogParser.js      # Core parsing logic
│   │   ├── ui/UIManager.js        # UI management
│   │   └── data/DataManager.js    # Data processing
│   └── archive-old-index.html # Previous version (archived)
├── bookmarklet/               # 📖 Bookmarklet Tools
│   ├── simple-log-copier.js   # Source code for bookmarklet
│   ├── build.js               # Automated build system
│   ├── package.json           # NPM configuration
│   ├── encode-bookmarklet-simple.js # Encoder utility
│   └── dist/                  # Built bookmarklets
│       ├── tosca-log-copier.bookmarklet.js
│       └── test.html          # Installation page
├── debug/                     # 📊 Sample Log Files
│   ├── simple-example-logs.txt
│   └── advanced-example-logs.txt
├── archive/                   # 📦 Archived Old Code
│   ├── bookmarklet-OLD/       # Previous bookmarklet versions
│   ├── website-OLD/           # Previous web interface
│   └── test files...
├── README.md                  # This documentation
├── CLAUDE.md                  # AI assistant instructions
└── PROJECT-STATUS.md          # Current project status
```

## 🛠️ Development

### Building Bookmarklets

```bash
cd bookmarklet
npm run build      # Build all bookmarklets
npm run watch      # Watch mode for development
npm run clean      # Clean build directories
```

### Testing the Parser

```bash
# Test files are in archive/ - copy them out if needed
node archive/test-parser.js
```

## 📋 Features

### Web Interface

- **4 View Modes**: Variables, Logs, Table, and Bookmarklet tabs
- **Smart Variable Detection**: Automatically categorizes variables as JSON, Token, URL, ID, Timestamp, or String
- **Real-time Search**: Search across all views and data
- **Export Options**: Download parsed variables as JSON
- **File Upload**: Drag & drop or select log files
- **Syntax Highlighting**: JSON values are formatted and color-coded
- **Copy Functions**: Copy individual values or entire datasets
- **Modern UI**: Clean, responsive design with notifications

### Bookmarklet

- **One-Click Extraction**: Extract logs from Tosca Cloud pages instantly
- **Smart Detection**: Automatically finds log containers on the page
- **Clipboard Copy**: Copies logs directly to clipboard
- **Visual Feedback**: Shows success/error notifications

## 📝 Log Format

The parser expects Tosca Cloud logs in this format:

```bash
2025-06-19 16:53:51Z [INF][TBox] Message: Buffer with name: "variable_name" has been set to value: "value"
```

## 🔧 Variable Types

The parser automatically detects and categorizes variables:

- **JSON**: Structured JSON objects/arrays
- **Token**: Access tokens and authentication credentials
- **URL**: HTTP/HTTPS URLs
- **ID**: UUIDs and identifiers
- **Timestamp**: ISO datetime stamps
- **String**: Default for other values

## 🧪 Sample Data

Test the parser with the included sample logs:

- `debug/simple-example-logs.txt` - Basic Tosca Cloud logs with 16 variables
- `debug/advanced-example-logs.txt` - More complex log examples

## 🎯 Recent Improvements

- **Clean Architecture**: Rebuilt from scratch with modular design
- **Archive System**: All old code safely preserved in `archive/`
- **Build System**: Automated bookmarklet generation with npm scripts
- **Modern UI**: Responsive design with clean Material-inspired styling
- **Enhanced Parser**: Improved variable detection and type classification

## 📊 Parser Stats

Successfully tested with sample logs:

- **16 variables** extracted from 274 log lines
- **6 variable types** detected (JSON, Token, URL, ID, Timestamp, String)
- **1 test case** identified and grouped
- **~2.9KB** bookmarklet size (44% compression)

## 🤝 Contributing

Feel free to submit issues and enhancement requests! The codebase is now clean and well-organized for easy development.

## 📄 License

MIT License - feel free to use this in your projects.
