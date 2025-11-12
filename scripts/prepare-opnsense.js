import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');
const opnsenseDir = join(rootDir, 'dist-opnsense');

console.log('📦 Preparing OPNsense deployment package...\n');

// Clean opnsense directory
if (existsSync(opnsenseDir)) {
  console.log('🗑️  Cleaning old dist-opnsense directory...');
  rmSync(opnsenseDir, { recursive: true, force: true });
}

// Create opnsense directory structure
mkdirSync(opnsenseDir, { recursive: true });
mkdirSync(join(opnsenseDir, 'assets'), { recursive: true });
mkdirSync(join(opnsenseDir, 'images'), { recursive: true });
mkdirSync(join(opnsenseDir, 'locales'), { recursive: true });

console.log('✅ Created directory structure');

// Copy HTML files
console.log('\n📄 Copying HTML files...');
copyFileSync(join(distDir, 'index.html'), join(opnsenseDir, 'index.html'));
copyFileSync(join(distDir, 'success.html'), join(opnsenseDir, 'success.html'));
console.log('  ✓ index.html');
console.log('  ✓ success.html');

// Copy Favicons and other root files
console.log('\n📄 Copying Favicon and other root files...');
['favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'manifest.json'].forEach(file => {
  copyFileSync(join(distDir, file), join(opnsenseDir, file));
  console.log(`  ✓ ${file}`);
});

// Copy assets (JS/CSS)
console.log('\n📦 Copying assets...');
const assetsDir = join(distDir, 'assets');
if (existsSync(assetsDir)) {
  const files = readdirSync(assetsDir);
  files.forEach(file => {
    copyFileSync(join(assetsDir, file), join(opnsenseDir, 'assets', file));
    console.log(`  ✓ assets/${file}`);
  });
}

// Copy public assets
console.log('\n🖼️  Copying public assets...');

// Copy images
const copyDirRecursive = (src, dest) => {
  if (!existsSync(src)) return;
  
  mkdirSync(dest, { recursive: true });
  const files = readdirSync(src);
  
  files.forEach(file => {
    const srcPath = join(src, file);
    const destPath = join(dest, file);
    
    if (statSync(srcPath).isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  });
};

copyDirRecursive(join(rootDir, 'public', 'images'), join(opnsenseDir, 'images'));
console.log('  ✓ images/');

// Copy locales
console.log('\n🌐 Copying language files...');
const localesDir = join(rootDir, 'locales');
if (existsSync(localesDir)) {
  const files = readdirSync(localesDir);
  files.forEach(file => {
    copyFileSync(join(localesDir, file), join(opnsenseDir, 'locales', file));
    console.log(`  ✓ locales/${file}`);
  });
}

console.log('\n✨ OPNsense deployment package ready!');
console.log(`📂 Output directory: ${opnsenseDir}`);
console.log('\n📋 Deployment Instructions:');
console.log('1. Copy all files from dist-opnsense/ to OPNsense template directory');
console.log('2. Path: /usr/local/opnsense/contrib/captiveportal/template/');
console.log('3. Restart captive portal service in OPNsense\n');
