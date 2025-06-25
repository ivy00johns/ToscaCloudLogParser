# Quick Start: Simple Log Copier Bookmarklet

## ⚡ 1-Minute Setup

1. **Copy the bookmarklet code**:
   - Open `dist/simple-log-copier.bookmarklet.js`
   - Copy the entire content (it's all one line starting with `javascript:`)

2. **Create browser bookmark**:
   - Right-click your browser's bookmark bar
   - Select "Add Bookmark" or "New Bookmark"
   - Name: `Tosca Log Copier`
   - URL: Paste the copied JavaScript code

3. **Use it**:
   - Navigate to any Tosca Cloud execution page with logs
   - Click the `Tosca Log Copier` bookmark
   - Logs are automatically copied to clipboard!
   - Paste them into the website parser for analysis

## 🎯 What It Does

- **Automatically finds** log content on Tosca Cloud pages
- **Copies to clipboard** with one click
- **Shows notification** with log stats (lines, size)
- **Handles errors** gracefully if no logs found

## 🔧 Testing Workflow

1. Click bookmarklet on Tosca execution page
2. Open website parser (`../website/index.html`)
3. Paste logs (Ctrl+V/Cmd+V)
4. Parse and analyze!

## 🎨 Features

- ✅ Smart log detection with multiple fallback strategies
- ✅ Works on various Tosca Cloud page layouts
- ✅ Lightweight and fast
- ✅ Visual feedback with notifications
- ✅ Handles both structured and unstructured log formats

## 🚀 Perfect For

- **Quick testing** of log parsing
- **Rapid development** workflow
- **Grabbing logs** without manual copy/paste
- **Speeding up** API development testing
