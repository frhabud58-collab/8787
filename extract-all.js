
import JSZip from 'jszip';
import fs from 'fs/promises';
import path from 'path';

async function extractAll() {
  const zipPath = path.join(process.cwd(), 'remix_-العتباوي---al-atbawi-mobile (2).zip');
  const outputDir = path.join(process.cwd(), 'remix_clean_extracted');

  console.log('Reading zip file...');
  const data = await fs.readFile(zipPath);
  const zip = await JSZip.loadAsync(data);

  for (const [filename, file] of Object.entries(zip.files)) {
    if (file.dir || filename.includes('node_modules/')) continue;
    if (filename.includes('.git')) continue;

    const outputPath = path.join(outputDir, filename);
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });
    const content = await file.async('nodebuffer');
    await fs.writeFile(outputPath, content);
    console.log('Extracted:', filename);
  }

  console.log('Done!');
}

extractAll().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
