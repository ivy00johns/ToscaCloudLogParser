#!/usr/bin/env node

// Improved script to encode JavaScript files into bookmarklets
// Handles template literals and complex quote escaping properly
// Usage: node encode-bookmarklet-improved.js <input-file> <output-file>

const fs = require('fs');
const path = require('path');

function encodeBookmarklet(inputFile, outputFile) {
	try {
		// Read the input file
		const content = fs.readFileSync(inputFile, 'utf8');

		// Process the content more carefully
		let encoded = content
			// Remove single-line comments (but preserve URLs and strings)
			.replace(/\/\/(?![^"'`]*["'`][^"'`]*\/\/)[^\r\n]*/g, '')

			// Remove multi-line comments
			.replace(/\/\*[\s\S]*?\*\//g, '')

			// Remove excess whitespace and line breaks while preserving template literals
			.replace(/\s+/g, ' ')
			.trim();

		// More careful quote handling for bookmarklets
		// We need to escape quotes but handle template literals properly

		// First, temporarily replace template literals with placeholders
		const templateLiterals = [];
		let templateIndex = 0;

		// Find and replace template literals
		encoded = encoded.replace(/`([^`\\]|\\.)*`/g, (match) => {
			templateLiterals.push(match);
			return `__TEMPLATE_LITERAL_${templateIndex++}__`;
		});

		// Now handle regular quote escaping
		encoded = encoded.replace(/'/g, "\\'");

		// Restore template literals and convert them to regular strings
		templateLiterals.forEach((literal, index) => {
			// Convert template literal to regular string concatenation
			let converted = literal.slice(1, -1); // Remove backticks

			// Handle ${} expressions in template literals
			converted = converted.replace(/\$\{([^}]+)\}/g, '\' + ($1) + \'');

			// Escape quotes in the converted string
			converted = converted.replace(/'/g, "\\'");

			// Replace placeholder with converted string
			encoded = encoded.replace(`__TEMPLATE_LITERAL_${index}__`, `'${converted}'`);
		});

		// Remove any remaining line breaks
		encoded = encoded.replace(/[\r\n]/g, '');

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
		console.log(`   Template literals handled: ${templateLiterals.length}`);

	} catch (error) {
		console.error(`❌ Error encoding bookmarklet: ${error.message}`);
		process.exit(1);
	}
}

// Command line usage
if (require.main === module) {
	const args = process.argv.slice(2);

	if (args.length !== 2) {
		console.log('Usage: node encode-bookmarklet-improved.js <input-file> <output-file>');
		console.log('');
		console.log('Examples:');
		console.log('  node encode-bookmarklet-improved.js log-parser-v3.js log-parser-v3-encoded.js');
		console.log('');
		console.log('Features:');
		console.log('  - Handles template literals properly');
		console.log('  - Converts ${} expressions to string concatenation');
		console.log('  - Safer quote escaping');
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