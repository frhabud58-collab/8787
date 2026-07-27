
import JSZip from 'jszip';
import fs from 'fs/promises';
import path from 'path';

async function extractZip() {
  const zipPath = path.join(process.cwd(), 'remix_-العتباوي---al-atbawi-mobile (2).zip');
  const outputDir = path.join(process.cwd(), 'remix_extracted_full');

  console.log('Reading zip file...');
  const data = await fs.readFile(zipPath);

  console.log('Extracting...');
  const zip = await JSZip.loadAsync(data);

  for (const [filename, file] of Object.entries(zip.files)) {
    if (!file.dir) {
      const outputPath = path.join(outputDir, filename);
      const dir = path.dirname(outputPath);
      await fs.mkdir(dir, { recursive: true });
      const content = await file.async('nodebuffer');
      await fs.writeFile(outputPath, content);
      console.log('Extracted:', filename);
    }
  }

  console.log('Done! Extracted to', outputDir);
}

extractZip().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
