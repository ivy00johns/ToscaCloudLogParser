#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { encodeBookmarklet } = require('./encode-bookmarklet-simple');

// Configuration
const config = {
    srcDir: __dirname,
    distDir: path.join(__dirname, 'dist'),
    debugDir: path.join(__dirname, 'debug'),
    bookmarklets: [
        {
            input: 'simple-log-copier.js',
            output: 'tosca-log-copier.bookmarklet.js',
            name: 'Tosca Log Copier'
        }
    ]
};

// Ensure directories exist
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// Clean build directories
function clean() {
    console.log('🧹 Cleaning build directories...');
    [config.distDir, config.debugDir].forEach(dir => {
        if (fs.existsSync(dir)) {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });
    console.log('✅ Clean complete');
}

// Build all bookmarklets
function build() {
    console.log('🔨 Building bookmarklets...\n');
    
    ensureDir(config.distDir);
    ensureDir(config.debugDir);
    
    config.bookmarklets.forEach(bookmarklet => {
        const inputPath = path.join(config.srcDir, bookmarklet.input);
        const outputPath = path.join(config.distDir, bookmarklet.output);
        
        console.log(`📦 Building ${bookmarklet.name}...`);
        
        try {
            // Read source
            const source = fs.readFileSync(inputPath, 'utf8');
            
            // Simple minification
            const minified = source
                .replace(/\/\*[\s\S]*?\*\//g, '')
                .replace(/\/\/.*$/gm, '')
                .replace(/\s+/g, ' ')
                .replace(/\s*([{}()\[\];,:])\s*/g, '$1')
                .replace(/;}/g, '}')
                .trim();
            
            // Create bookmarklet
            const bookmarkletCode = 'javascript:' + encodeURIComponent(minified);
            
            // Write dist version
            fs.writeFileSync(outputPath, bookmarkletCode);
            
            // Write debug version
            const debugPath = path.join(config.debugDir, bookmarklet.output.replace('.bookmarklet.js', '.debug.js'));
            const debugContent = `// ${bookmarklet.name}
// Source: ${bookmarklet.input}
// Generated: ${new Date().toISOString()}
// Size: ${source.length} → ${minified.length} bytes
// Bookmarklet length: ${bookmarkletCode.length} characters

${bookmarkletCode}`;
            
            fs.writeFileSync(debugPath, debugContent);
            
            // Write HTML test page
            const htmlPath = path.join(config.distDir, 'test.html');
            const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Tosca Log Parser Bookmarklets</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .bookmarklet { 
            display: inline-block; 
            padding: 10px 20px; 
            background: #667eea; 
            color: white; 
            text-decoration: none; 
            border-radius: 4px; 
            margin: 10px 0;
        }
        .instructions { 
            background: #f7fafc; 
            padding: 20px; 
            border-radius: 8px;
            margin-bottom: 20px;
        }
        code { 
            background: #e2e8f0; 
            padding: 2px 6px; 
            border-radius: 3px; 
        }
    </style>
</head>
<body>
    <h1>Tosca Log Parser Bookmarklets</h1>
    
    <div class="instructions">
        <h2>Installation Instructions:</h2>
        <ol>
            <li>Drag the bookmarklet link below to your bookmarks bar</li>
            <li>Or right-click and select "Bookmark This Link"</li>
            <li>Navigate to a Tosca Cloud page with logs</li>
            <li>Click the bookmarklet to extract logs to clipboard</li>
        </ol>
    </div>
    
    <h2>Available Bookmarklets:</h2>
    ${config.bookmarklets.map(b => {
        const bookmarkletContent = fs.readFileSync(path.join(config.distDir, b.output), 'utf8');
        return `<div>
            <h3>${b.name}</h3>
            <a href="${bookmarkletContent}" class="bookmarklet">${b.name}</a>
            <p>Length: ${bookmarkletContent.length} characters</p>
        </div>`;
    }).join('\n')}
    
    <h2>Test Area:</h2>
    <p>Paste some Tosca logs here to test the parser:</p>
    <textarea id="testLogs" style="width: 100%; height: 200px; font-family: monospace;">
2025-06-19 16:53:51Z [INF][TBox] Message: Buffer with name: "access_token" has been set to value: "eyJraWQiOiJ4WnhacmEtNUFiYUs3dXZfWmVOd3NPdGRrVzhldEN6VzhrQlN2c2trRnVrIiwiYWxnIjoiUlMyNTYifQ"
2025-06-19 16:53:51Z [INF][TBox] Message: Buffer with name 'TOSCA_URL' has been set to value 'https://fusionx.my-test.tricentis.com/e0d90de6-6b5a-4517-af9b-ea11e8f5ab81'.
    </textarea>
</body>
</html>`;
            
            fs.writeFileSync(htmlPath, htmlContent);
            
            console.log(`✅ Built ${bookmarklet.name}`);
            console.log(`   Output: ${outputPath}`);
            console.log(`   Size: ${source.length} → ${minified.length} bytes`);
            console.log(`   Length: ${bookmarkletCode.length} characters\n`);
            
        } catch (error) {
            console.error(`❌ Failed to build ${bookmarklet.name}:`, error.message);
        }
    });
    
    console.log('✅ Build complete!');
    console.log(`📁 Output directory: ${config.distDir}`);
    console.log(`🔍 Debug directory: ${config.debugDir}`);
    console.log(`🌐 Test page: ${path.join(config.distDir, 'test.html')}`);
}

// Watch mode
function watch() {
    console.log('👀 Watching for changes...\n');
    
    const watchers = config.bookmarklets.map(bookmarklet => {
        const inputPath = path.join(config.srcDir, bookmarklet.input);
        
        return fs.watch(inputPath, (eventType) => {
            if (eventType === 'change') {
                console.log(`\n🔄 ${bookmarklet.input} changed, rebuilding...`);
                build();
            }
        });
    });
    
    process.on('SIGINT', () => {
        console.log('\n👋 Stopping watch mode...');
        watchers.forEach(w => w.close());
        process.exit(0);
    });
}

// CLI
const command = process.argv[2];

switch (command) {
    case 'clean':
        clean();
        break;
    case 'watch':
        build();
        watch();
        break;
    default:
        build();
}

module.exports = { build, clean };