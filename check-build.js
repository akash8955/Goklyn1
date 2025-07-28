const fs = require('fs');
const path = require('path');

console.log('Checking build output...');

// Check if build directory exists
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  console.error('❌ Build directory not found. Please run `npm run build` first.');
  process.exit(1);
}

console.log('✅ Build directory exists');

// Check for main JavaScript files
const jsFiles = fs.readdirSync(path.join(buildDir, 'static', 'js'))
  .filter(file => file.endsWith('.js'));

if (jsFiles.length === 0) {
  console.error('❌ No JavaScript files found in build/static/js');
  process.exit(1);
}

console.log('✅ JavaScript files found in build/static/js:');
jsFiles.forEach(file => console.log(`   - ${file}`));

// Check index.html
const indexPath = path.join(buildDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html not found in build directory');
  process.exit(1);
}

console.log('✅ index.html found in build directory');

// Check if the main JavaScript is referenced in index.html
const indexContent = fs.readFileSync(indexPath, 'utf-8');
const hasJsReference = jsFiles.some(file => 
  indexContent.includes(`src="/static/js/${file}"`)
);

if (!hasJsReference) {
  console.error('❌ Could not find JavaScript file references in index.html');
} else {
  console.log('✅ JavaScript files are properly referenced in index.html');
}

console.log('\n✅ Build output looks good!');
console.log('You can serve the build using:');
console.log('   npx serve -s build');
