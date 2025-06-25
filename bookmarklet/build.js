#!/usr/bin/env node

// Build script for Tosca Log Parser Bookmarklets
// Automatically encodes source files into bookmarklet format

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    // Source files to encode (without extension)
    sources: [
        'log-parser-bookmarklet-v2',
        'log-parser-last-working'
    ],
    
    // Input directory for source files
    sourceDir: '.',
    
    // Output directory for encoded files
    outputDir: './dist',
    
    // File extensions
    sourceExt: '.js',
    outputExt: '.js'
};

// Encoding function (improved version of the original)
function encodeBookmarklet(sourceContent) {
    let encoded = sourceContent
        // Remove single-line comments (but preserve URLs and strings)
        .replace(/\/\/(?![^"']*["'][^"']*\/\/)[^\r\n]*/g, '')
        
        // Remove multi-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        
        // Remove excess whitespace and line breaks
        .replace(/\s+/g, ' ')
        .trim()
        
        // Handle quote escaping for bookmarklet
        .replace(/'/g, "\\'");
    
    // Add javascript: prefix if not present
    if (!encoded.startsWith('javascript:')) {
        encoded = 'javascript:' + encoded;
    }
    
    return encoded;
}

// Create output directory if it doesn't exist
function ensureOutputDir() {
    if (!fs.existsSync(config.outputDir)) {
        fs.mkdirSync(config.outputDir, { recursive: true });
        console.log(`📁 Created output directory: ${config.outputDir}`);
    }
}

// Build a single source file
function buildFile(sourceName) {
    const sourceFile = path.join(config.sourceDir, sourceName + config.sourceExt);
    const outputFile = path.join(config.outputDir, sourceName + '.bookmarklet' + config.outputExt);
    
    try {
        // Check if source file exists
        if (!fs.existsSync(sourceFile)) {
            console.log(`⚠️  Source file not found: ${sourceFile}`);
            return false;
        }
        
        // Read source content
        const sourceContent = fs.readFileSync(sourceFile, 'utf8');
        
        // Encode the content
        const encodedContent = encodeBookmarklet(sourceContent);
        
        // Write encoded file
        fs.writeFileSync(outputFile, encodedContent);
        
        console.log(`✅ Built: ${sourceName}`);
        console.log(`   📄 Source: ${sourceFile} (${sourceContent.length} chars)`);
        console.log(`   📦 Output: ${outputFile} (${encodedContent.length} chars)`);
        console.log(`   📉 Compression: ${Math.round((1 - encodedContent.length / sourceContent.length) * 100)}%`);
        
        return true;
    } catch (error) {
        console.error(`❌ Error building ${sourceName}: ${error.message}`);
        return false;
    }
}

// Build all source files
function buildAll() {
    console.log('🔨 Building Tosca Log Parser Bookmarklets...\n');
    
    ensureOutputDir();
    
    let successCount = 0;
    let totalCount = config.sources.length;
    
    config.sources.forEach(sourceName => {
        if (buildFile(sourceName)) {
            successCount++;
        }
        console.log(''); // Empty line for readability
    });
    
    // Summary
    console.log(`📊 Build Summary:`);
    console.log(`   ✅ Successfully built: ${successCount}/${totalCount} files`);
    console.log(`   📂 Output directory: ${config.outputDir}`);
    
    if (successCount === totalCount) {
        console.log('\n🎉 All bookmarklets built successfully!');
        console.log('\n💡 Usage:');
        console.log('   1. Copy the content from the .bookmarklet.js files');
        console.log('   2. Create a new bookmark in your browser');
        console.log('   3. Paste the content as the URL');
        console.log('   4. Click the bookmark on any page to run the tool');
    } else {
        console.log(`\n⚠️  ${totalCount - successCount} file(s) failed to build.`);
        process.exit(1);
    }
}

// Watch mode for development
function watchFiles() {
    console.log('👀 Watching for file changes...\n');
    
    config.sources.forEach(sourceName => {
        const sourceFile = path.join(config.sourceDir, sourceName + config.sourceExt);
        
        if (fs.existsSync(sourceFile)) {
            fs.watchFile(sourceFile, (curr, prev) => {
                console.log(`🔄 File changed: ${sourceName}`);
                buildFile(sourceName);
                console.log('👀 Watching for file changes...\n');
            });
            console.log(`👁️  Watching: ${sourceFile}`);
        }
    });
}

// Command line interface
function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
        case 'build':
        case undefined:
            buildAll();
            break;
            
        case 'watch':
            ensureOutputDir();
            watchFiles();
            break;
            
        case 'clean':
            if (fs.existsSync(config.outputDir)) {
                fs.rmSync(config.outputDir, { recursive: true });
                console.log(`🗑️  Cleaned output directory: ${config.outputDir}`);
            }
            break;
            
        case 'help':
        case '--help':
        case '-h':
            console.log('🔨 Tosca Log Parser Bookmarklet Builder\n');
            console.log('Usage:');
            console.log('  node build.js [command]\n');
            console.log('Commands:');
            console.log('  build    Build all bookmarklets (default)');
            console.log('  watch    Watch source files and rebuild on changes');
            console.log('  clean    Remove all built files');
            console.log('  help     Show this help message\n');
            console.log('Examples:');
            console.log('  node build.js              # Build all bookmarklets');
            console.log('  node build.js build        # Same as above');
            console.log('  node build.js watch        # Watch and auto-rebuild');
            console.log('  node build.js clean        # Clean output directory');
            break;
            
        default:
            console.error(`❌ Unknown command: ${command}`);
            console.log('Run "node build.js help" for usage information.');
            process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { encodeBookmarklet, buildFile, buildAll };