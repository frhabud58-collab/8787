/**
 * Arabic Text Encoding Fix Script
 * Fixes corrupted Arabic text where UTF-8 bytes were misinterpreted as Latin-1
 */

// Function to fix corrupted Arabic text
function fixArabicEncoding(corrupted) {
  try {
    // Use Buffer to convert from Latin-1 to UTF-8
    // The corrupted text is UTF-8 bytes that were misinterpreted as Latin-1
    const fixed = Buffer.from(corrupted, 'latin1').toString('utf-8');
    return fixed;
  } catch (error) {
    console.error('Error fixing encoding:', error);
    return corrupted;
  }
}

// Test the function with known corrupted text
const testCases = [
  { input: 'ط§ظ„ظƒظ„', expected: 'الكل' },
  { input: 'ط§ظ„ظ…ظ†طھط¬ط§طھ', expected: 'المنتجات' },
  { input: 'ط§ظ„ط±ط¦ظٹط³ظٹط©', expected: 'الرئيسية' },
  { input: 'ظ…ط¹ظ„ظˆظ…ط§طھ', expected: 'معلومات' },
  { input: 'ظ…ط¬ظ…ظˆط¹ط§طھ', expected: 'مجموعات' }
];

console.log('Testing Arabic encoding fix:');
let allPassed = true;
testCases.forEach(test => {
  const result = fixArabicEncoding(test.input);
  const passed = result === test.expected;
  allPassed = allPassed && passed;
  console.log(`  Input: ${test.input}`);
  console.log(`  Expected: ${test.expected}`);
  console.log(`  Result: ${result}`);
  console.log(`  Match: ${passed ? '✓' : '✗'}`);
  console.log('');
});

console.log(allPassed ? '\n✓ All tests passed!' : '\n✗ Some tests failed');

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { fixArabicEncoding };
}