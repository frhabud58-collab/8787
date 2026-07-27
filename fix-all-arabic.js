/**
 * Automated Arabic Encoding Fix Script
 * Fixes ALL corrupted Arabic text in StoreView.tsx
 */

import { fixArabicEncoding } from './fix-arabic-encoding.js';
import { readFileSync, writeFileSync } from 'fs';

console.log('=== Automated Arabic Text Fix ===\n');

// Read the file
const filePath = './src/components/StoreView.tsx';
let content = readFileSync(filePath, 'utf-8');

console.log('Original file size:', content.length, 'characters');

// Count corrupted patterns before fix
const corruptionPattern = /ط[§ظ][^\u0600-\u06FF]*/g;
const matchesBefore = content.match(corruptionPattern);
console.log('Corrupted text instances found:', matchesBefore ? matchesBefore.length : 0);

// Fix the content
const fixedContent = fixArabicEncoding(content);

// Count after fix
const matchesAfter = fixedContent.match(corruptionPattern);
console.log('Corrupted text instances after fix:', matchesAfter ? matchesAfter.length : 0);

// Write back
writeFileSync(filePath, fixedContent, 'utf-8');

console.log('\nFixed file size:', fixedContent.length, 'characters');
console.log('File saved successfully!');
console.log('\nNext steps:');
console.log('1. Restart your dev server: npm run dev');
console.log('2. Clear browser cache: Ctrl+Shift+R');
console.log('3. Clear localStorage in DevTools');
console.log('4. Verify Arabic text displays correctly');