#!/usr/bin/env node

// Simple script to encode JavaScript files into bookmarklets
// Usage: node encode-bookmarklet.js <input-file> <output-file>

const fs = require('fs');
const path = require('path');

function encodeBookmarklet(inputFile, outputFile) {
    try {
        // Read the input file
        const content = fs.readFileSync(inputFile, 'utf8');
        
        // Process the content
        let encoded = content
            // Remove single-line comments (but preserve URLs and strings)
            .replace(/\/\/(?![^"']*["'][^"']*\/\/)[^\r\n]*/g, '')
            
            // Remove multi-line comments
            .replace(/\/\*[\s\S]*?\*\//g, '')
            
            // Remove excess whitespace and line breaks
            .replace(/\s+/g, ' ')
            .trim()
            
            // Handle quote escaping for bookmarklet
            .replace(/'/g, "\\'")
            
            // Remove any remaining line breaks
            .replace(/[\r\n]/g, '');
        
        // Add javascript: prefix if not present
        if (!encoded.startsWith('javascript:')) {
            encoded = 'javascript:' + encoded;
        }
        
        // Write to output file
        fs.writeFileSync(outputFile, encoded);
        
        console.log(`✅ Successfully encoded bookmarklet:`);
        console.log(`   Input:  ${inputFile}`);
        console.log(`   Output: ${outputFile}`);
        console.log(`   Size:   ${content.length} → ${encoded.length} characters`);
        
    } catch (error) {
        console.error(`❌ Error encoding bookmarklet: ${error.message}`);
        process.exit(1);
    }
}

// Command line usage
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length !== 2) {
        console.log('Usage: node encode-bookmarklet.js <input-file> <output-file>');
        console.log('');
        console.log('Examples:');
        console.log('  node encode-bookmarklet.js log-parser-v3.js log-parser-v3-encoded.js');
        console.log('  node encode-bookmarklet.js my-script.js bookmarklet.txt');
        process.exit(1);
    }
    
    const [inputFile, outputFile] = args;
    
    // Check if input file exists
    if (!fs.existsSync(inputFile)) {
        console.error(`❌ Input file not found: ${inputFile}`);
        process.exit(1);
    }
    
    encodeBookmarklet(inputFile, outputFile);
}

module.exports = { encodeBookmarklet };