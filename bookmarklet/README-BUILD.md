# Tosca Log Parser Bookmarklet Build System

This build system automatically converts JavaScript source files into bookmarklet format for easy browser usage.

## Quick Start

```bash
# Build all bookmarklets
npm run build

# Watch for changes and auto-rebuild
npm run dev

# Clean built files
npm run clean
```

## File Structure

```yml
bookmarklet/
├── build.js                    # Build script
├── package.json                # NPM configuration
├── log-parser-bookmarklet-v2.js    # Source file (v2)
├── log-parser-bookmarklet-v3.js    # Source file (v3)
├── log-parser-last-working.js      # Source file (working version)
└── dist/                       # Built bookmarklets
    ├── log-parser-bookmarklet-v2.bookmarklet.js
    ├── log-parser-bookmarklet-v3.bookmarklet.js
    └── log-parser-last-working.bookmarklet.js
```

## Usage

### 1. Build Bookmarklets

```bash
node build.js build
# or
npm run build
```

### 2. Development Mode (Auto-rebuild)

```bash
node build.js watch
# or
npm run dev
```

### 3. Install Bookmarklet

1. Run the build command
2. Open `dist/[filename].bookmarklet.js`
3. Copy the entire content
4. Create a new bookmark in your browser
5. Paste the content as the bookmark URL
6. Click the bookmark on any page to run the tool

## Commands

| Command | Description |
|---------|-------------|
| `build` | Build all source files into bookmarklets |
| `watch` | Watch source files and rebuild on changes |
| `clean` | Remove all built files |
| `help`  | Show help information |

## Features

- ✅ **Automatic encoding**: Converts JavaScript to bookmarklet format
- ✅ **Comment removal**: Strips comments to reduce size
- ✅ **Whitespace optimization**: Minifies code
- ✅ **Watch mode**: Auto-rebuilds on file changes
- ✅ **Multiple versions**: Supports building multiple source files
- ✅ **Compression stats**: Shows size reduction information

## Source File Naming Convention

- **Source files**: `[name].js` (e.g., `log-parser-bookmarklet-v2.js`)
- **Built files**: `[name].bookmarklet.js` (e.g., `log-parser-bookmarklet-v2.bookmarklet.js`)

## Adding New Source Files

1. Create your JavaScript file in the bookmarklet directory
1. Add the filename (without extension) to the `sources` array in `build.js`:

```javascript
sources: [
    'log-parser-bookmarklet-v2',
    'log-parser-bookmarklet-v3',
    'log-parser-last-working',
    'your-new-file'  // Add here
]
```

1. Run `npm run build`

## Development Workflow

1. **Edit source files**: Make changes to `.js` files
2. **Auto-rebuild**: Run `npm run dev` to watch for changes
3. **Test**: Copy the built bookmarklet and test in browser
4. **Deploy**: Use the content from `dist/` directory

## Example Output

```text
🔨 Building Tosca Log Parser Bookmarklets...

📁 Created output directory: ./dist

✅ Built: log-parser-bookmarklet-v2
   📄 Source: ./log-parser-bookmarklet-v2.js (36286 chars)
   📦 Output: ./dist/log-parser-bookmarklet-v2.bookmarklet.js (26302 chars)
   📉 Compression: 28%

📊 Build Summary:
   ✅ Successfully built: 3/3 files
   📂 Output directory: ./dist

🎉 All bookmarklets built successfully!
```

# Bookmarklet Build Guide

## Quick Start (v3)

### For Users - Ready to Use

1. Copy everything from `log-parser-bookmarklet-v3-encoded.js`
2. Create a new browser bookmark
3. Set the URL to the copied JavaScript code
4. Name it "Tosca Log Parser v3"
5. Use it on any Tosca Cloud page!

### For Developers - Building from Source

#### Prerequisites

- Node.js installed
- Basic JavaScript knowledge

#### Build Process

```bash
# 1. Make changes to the source file
nano log-parser-bookmarklet-v3.js

# 2. Re-encode the bookmarklet
node encode-bookmarklet.js log-parser-bookmarklet-v3.js log-parser-bookmarklet-v3-encoded.js

# 3. Test the encoded version in browser
```

## Features Included in v3

### Core Functionality

- ✅ **Buffer Variable Extraction**: Multiple formats supported
- ✅ **Context-Aware Grouping**: By test case and operation
- ✅ **URL Detection**: Automatic linking and extraction
- ✅ **Screen Extraction**: Auto-detect logs from pages

### User Interface

- ✅ **Multiple View Modes**:
  - 📊 Variables (grouped display)
  - 📄 Logs (syntax highlighted)
  - 📋 Table (structured data)
- ✅ **Search & Filter**: Real-time filtering
- ✅ **Copy/Export**: Clipboard and JSON export
- ✅ **Responsive Design**: Works on all screen sizes

### Technical Features

- ✅ **Error Handling**: Graceful failure modes
- ✅ **Performance**: Efficient parsing of large logs
- ✅ **Compatibility**: Works across different browsers
- ✅ **Isolation**: Doesn't interfere with host pages

## Development Workflow

### 1. Website Development

Always start with the website version for easier debugging:

```bash
# Edit website/parser.js
# Test in website/index.html
```

### 2. Port to Bookmarklet

```bash
# Copy key functions to bookmarklet/log-parser-bookmarklet-v3.js
# Adapt for bookmarklet constraints (no external dependencies)
# Test locally
```

### 3. Encode & Test

```bash
# Encode for browser use
node encode-bookmarklet.js log-parser-bookmarklet-v3.js log-parser-bookmarklet-v3-encoded.js

# Test in actual browser on real Tosca pages
```

### 4. Version Control

- Keep source in `log-parser-bookmarklet-v3.js`
- Keep encoded in `log-parser-bookmarklet-v3-encoded.js`
- Archive old versions in `archive/` folder

## Testing Checklist

### Functionality Tests

- [ ] Parse buffer variables from pasted logs
- [ ] Extract logs from Tosca Cloud pages
- [ ] Handle file uploads (JSON/TXT)
- [ ] Group variables by context correctly
- [ ] Search and filter work properly
- [ ] Copy/export functions work
- [ ] All three view modes display correctly

### Compatibility Tests

- [ ] Chrome/Chromium browsers
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers (responsive design)

### Edge Cases

- [ ] Empty logs
- [ ] Malformed logs
- [ ] Very large logs (performance)
- [ ] Logs with special characters
- [ ] Multiple test cases in one log

## Bookmarklet Architecture

### Core Components

1. **Parser Engine**: Extracts variables from log text
2. **Context Manager**: Groups variables by test hierarchy
3. **UI Manager**: Handles view switching and interactions
4. **Data Manager**: Manages state and filtering
5. **Export Manager**: Handles copy/export functionality

### Key Constraints

- **No External Dependencies**: Everything must be self-contained
- **CSS Isolation**: All styles must be scoped to prevent conflicts
- **Global Namespace**: Minimal global footprint
- **Performance**: Must handle large logs efficiently
- **Compatibility**: Must work across browser versions

## Troubleshooting

### Common Issues

1. **Bookmarklet doesn't load**: Check if JavaScript is properly encoded
2. **Styles broken**: Ensure all CSS uses `!important` for isolation
3. **Can't find logs**: Check screen extraction selectors
4. **Performance issues**: Optimize parsing for large datasets

### Debug Mode

The bookmarklet includes built-in error handling and fallbacks. If issues persist:

1. Open browser developer tools
2. Look for console errors
3. Check if the overlay element is created
4. Verify JavaScript execution

## Version History

### v3.0 (December 2024) - Current

- Complete rewrite with website parity
- Multiple view modes
- Enhanced parsing and error handling
- Modern UI with syntax highlighting

### v2.0 (Archived)

- Basic functionality
- Limited view options
- Parsing issues with some log formats

### v1.0 (Archived)

- Initial release
- Basic buffer variable extraction
