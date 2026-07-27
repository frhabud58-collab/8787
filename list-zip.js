
import JSZip from 'jszip';
import fs from 'fs/promises';
import path from 'path';

async function listZip() {
  const zipPath = path.join(process.cwd(), 'remix_-العتباوي---al-atbawi-mobile (2).zip');
  console.log('Reading zip file...');
  const data = await fs.readFile(zipPath);
  const zip = await JSZip.loadAsync(data);

  console.log('\nFiles in zip:');
  for (const filename of Object.keys(zip.files)) {
    if (!filename.includes('node_modules/')) {
      console.log(filename);
    }
  }
}

listZip().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
