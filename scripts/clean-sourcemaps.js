import fs from 'fs';
import path from 'path';

// Function to recursively find all .js and .map files in node_modules
function findJSFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      findJSFiles(fullPath, files);
    } else if (item.endsWith('.js') || item.endsWith('.map')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to remove source map references from a file and delete .map files
function removeSourceMapReferences(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove source map references (both .js.map and .map)
    const sourceMapRegex = /\/\/# sourceMappingURL=.*\.map\s*$/gm;
    const hasSourceMap = sourceMapRegex.test(content);
    
    if (hasSourceMap) {
      content = content.replace(sourceMapRegex, '');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Cleaned source map reference from: ${filePath}`);
    }
    
    // Also try to delete corresponding .map files
    const mapFile = filePath + '.map';
    if (fs.existsSync(mapFile)) {
      fs.unlinkSync(mapFile);
      console.log(`Deleted source map file: ${mapFile}`);
    }
  } catch (error) {
    console.warn(`Could not process ${filePath}: ${error.message}`);
  }
}

// Main execution
console.log('Cleaning source map references from node-unrar-js...');

const distModulesPath = path.join(process.cwd(), 'dist', 'node_modules');

if (fs.existsSync(distModulesPath)) {
  const jsFiles = findJSFiles(distModulesPath);
  
  let cleanedCount = 0;
  for (const jsFile of jsFiles) {
    // Only clean files from node-unrar-js
    if (jsFile.includes('node-unrar-js')) {
      removeSourceMapReferences(jsFile);
      cleanedCount++;
    }
  }
  
  console.log(`Processed ${cleanedCount} files from node-unrar-js`);
  
  // Also remove any standalone .map files
  const mapFiles = findJSFiles(distModulesPath).filter(f => f.endsWith('.map'));
  for (const mapFile of mapFiles) {
    if (mapFile.includes('node-unrar-js')) {
      try {
        fs.unlinkSync(mapFile);
        console.log(`Deleted standalone map file: ${mapFile}`);
      } catch (err) {
        console.warn(`Could not delete ${mapFile}: ${err.message}`);
      }
    }
  }
} else {
  console.log('No dist/node_modules directory found');
}

console.log('Source map cleanup complete');