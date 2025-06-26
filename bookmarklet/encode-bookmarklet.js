#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

async function encodeBookmarklet(inputFile, outputFile) {
    try {
        // Read the input file
        const code = fs.readFileSync(inputFile, 'utf8');
        
        // Minify the code
        const minified = await minify(code, {
            compress: {
                drop_console: false, // Keep console for debugging
                drop_debugger: true,
                passes: 2
            },
            mangle: {
                toplevel: true
            },
            format: {
                comments: false,
                ascii_only: true
            }
        });
        
        if (minified.error) {
            throw minified.error;
        }
        
        // Create the bookmarklet
        const bookmarkletCode = minified.code || code;
        const bookmarklet = 'javascript:' + encodeURIComponent(bookmarkletCode);
        
        // Write to output file
        fs.writeFileSync(outputFile, bookmarklet);
        
        // Also create a formatted version for debugging
        const debugFile = outputFile.replace('.bookmarklet.js', '.debug.js');
        fs.writeFileSync(debugFile, `// Bookmarklet source: ${inputFile}\n// Generated: ${new Date().toISOString()}\n// Length: ${bookmarklet.length} characters\n\n${bookmarklet}`);
        
        console.log(`✅ Bookmarklet created successfully!`);
        console.log(`   Input: ${inputFile}`);
        console.log(`   Output: ${outputFile}`);
        console.log(`   Debug: ${debugFile}`);
        console.log(`   Size: ${code.length} → ${bookmarkletCode.length} bytes (${Math.round((1 - bookmarkletCode.length / code.length) * 100)}% reduction)`);
        console.log(`   Total length: ${bookmarklet.length} characters`);
        
    } catch (error) {
        console.error('❌ Error encoding bookmarklet:', error.message);
        process.exit(1);
    }
}

// Command line usage
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log('Usage: node encode-bookmarklet.js <input-file> [output-file]');
        console.log('Example: node encode-bookmarklet.js simple-log-copier.js simple-log-copier.bookmarklet.js');
        process.exit(1);
    }
    
    const inputFile = args[0];
    const outputFile = args[1] || inputFile.replace('.js', '.bookmarklet.js');
    
    encodeBookmarklet(inputFile, outputFile);
}

module.exports = { encodeBookmarklet };