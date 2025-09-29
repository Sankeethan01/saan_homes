#!/usr/bin/env node

/**
 * Script to remove console.log statements from production code
 * Usage: node scripts/remove-console-logs.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Files to process
const patterns = [
  'app/**/*.{ts,tsx,js,jsx}',
  'components/**/*.{ts,tsx,js,jsx}',
  'pages/**/*.{ts,tsx,js,jsx}',
];

// Files to exclude
const excludePatterns = [
  '**/node_modules/**',
  '**/.next/**',
  '**/test-ocr/**', // Keep debug logs in test files
  '**/*.test.*',
  '**/*.spec.*',
];

// Console statements to remove
const consolePatterns = [
  /console\.log\([^)]*\);?\s*/g,
  /console\.debug\([^)]*\);?\s*/g,
  /console\.info\([^)]*\);?\s*/g,
  /console\.warn\([^)]*\);?\s*/g,
  /console\.error\([^)]*\);?\s*/g,
];

// Console statements to keep (important for production)
const keepPatterns = [
  /console\.error\([^)]*\);?\s*/g, // Keep error logs
];

function shouldKeepConsoleLog(content, match) {
  // Check if it's an error log (keep these)
  if (match.includes('console.error')) {
    return true;
  }
  
  // Check if it's in a test file
  if (content.includes('test') || content.includes('spec')) {
    return true;
  }
  
  return false;
}

function removeConsoleLogs(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let removedCount = 0;
    
    // Remove console statements
    consolePatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (!shouldKeepConsoleLog(content, match)) {
            content = content.replace(match, '');
            modified = true;
            removedCount++;
          }
        });
      }
    });
    
    // Clean up empty lines
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${filePath}: Removed ${removedCount} console statements`);
      return removedCount;
    }
    
    return 0;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

function main() {
  console.log('🧹 Starting console.log cleanup...\n');
  
  let totalRemoved = 0;
  let filesProcessed = 0;
  
  patterns.forEach(pattern => {
    const files = glob.sync(pattern, {
      ignore: excludePatterns,
      cwd: process.cwd()
    });
    
    files.forEach(file => {
      const filePath = path.resolve(file);
      const removed = removeConsoleLogs(filePath);
      totalRemoved += removed;
      filesProcessed++;
    });
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Files processed: ${filesProcessed}`);
  console.log(`   Console statements removed: ${totalRemoved}`);
  console.log(`\n✨ Console.log cleanup completed!`);
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { removeConsoleLogs };
