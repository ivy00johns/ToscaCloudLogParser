#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function minifySimple(code) {
    // Basic minification without external dependencies
    return code
        // Remove comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '')
        // Remove unnecessary whitespace
        .replace(/\s+/g, ' ')
        .replace(/\s*([{}()\[\];,:])\s*/g, '$1')
        // Remove trailing semicolons before closing braces
        .replace(/;}/g, '}')
        // Trim
        .trim();
}

function encodeBookmarklet(inputFile, outputFile) {
    try {
        // Read the input file
        const code = fs.readFileSync(inputFile, 'utf8');
        
        // Simple minification
        const minified = minifySimple(code);
        
        // Create the bookmarklet
        const bookmarklet = 'javascript:' + encodeURIComponent(minified);
        
        // Write to output file
        fs.writeFileSync(outputFile, bookmarklet);
        
        // Also create a formatted version for debugging
        const debugFile = outputFile.replace('.bookmarklet.js', '.debug.js');
        const debugContent = `// Bookmarklet source: ${inputFile}
// Generated: ${new Date().toISOString()}
// Original size: ${code.length} bytes
// Minified size: ${minified.length} bytes
// Bookmarklet length: ${bookmarklet.length} characters

// Original code:
/*
${code}
*/

// Minified code:
// ${minified}

// Bookmarklet:
${bookmarklet}`;
        
        fs.writeFileSync(debugFile, debugContent);
        
        console.log(`✅ Bookmarklet created successfully!`);
        console.log(`   Input: ${inputFile}`);
        console.log(`   Output: ${outputFile}`);
        console.log(`   Debug: ${debugFile}`);
        console.log(`   Size: ${code.length} → ${minified.length} bytes (${Math.round((1 - minified.length / code.length) * 100)}% reduction)`);
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
        console.log('Usage: node encode-bookmarklet-simple.js <input-file> [output-file]');
        console.log('Example: node encode-bookmarklet-simple.js simple-log-copier.js simple-log-copier.bookmarklet.js');
        process.exit(1);
    }
    
    const inputFile = args[0];
    const outputFile = args[1] || inputFile.replace('.js', '.bookmarklet.js');
    
    encodeBookmarklet(inputFile, outputFile);
}

module.exports = { encodeBookmarklet };