import fs from 'fs';
import path from 'path';

const srcDir = 'c:/Users/akssh/Downloads/RESTAURANT/ezgif-63182fff936055ac-jpg';
const destDir = 'c:/Users/akssh/Downloads/RESTAURANT/frontend/public/assets/frames';

function copyFrames() {
  console.log(`Starting copy from ${srcDir} to ${destDir}...`);

  if (!fs.existsSync(srcDir)) {
    console.error(`Source directory does not exist: ${srcDir}`);
    process.exit(1);
  }

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    console.log(`Created destination directory: ${destDir}`);
  }

  const files = fs.readdirSync(srcDir).filter(file => {
    return file.startsWith('ezgif-frame-') && file.endsWith('.jpg');
  });

  console.log(`Found ${files.length} frames to copy.`);

  files.sort().forEach((file, index) => {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    fs.copyFileSync(srcPath, destPath);
  });

  console.log(`Successfully copied ${files.length} frames.`);
}

copyFrames();
