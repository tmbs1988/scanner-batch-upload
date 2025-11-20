const fs = require('fs');

function parseCsvLines(text) {
  return text.split(/\r?\n/).map(l => l.trimEnd());
}

function extractStoreNameFromCsv(text) {
  const rows = parseCsvLines(text).filter(Boolean);
  const splitRow = (row) => row.split(/[;,:\t]+/).map(s => s.trim());
  // 1) Find first header row that contains "store_name"
  let headerIdx = -1;
  let storeCol = -1;
  for (let i = 0; i < rows.length; i++) {
    const headerCells = splitRow(rows[i]).map(s => s.toLowerCase());
    const pos = headerCells.findIndex(h => h === 'store_name');
    if (pos !== -1) { headerIdx = i; storeCol = pos; break; }
  }
  if (headerIdx !== -1 && storeCol !== -1) {
    // Scan downward until first non-empty data in that column
    for (let j = headerIdx + 1; j < rows.length; j++) {
      const cells = splitRow(rows[j]);
      if (storeCol < cells.length) {
        const v = (cells[storeCol] || '').trim();
        if (v && v.toLowerCase() !== 'store_name' && v.toLowerCase() !== 'user_name') return v;
      }
    }
  }
  return '';
}

function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node scripts/parse-feetbase.js <path-to-feetbase.csv>');
    process.exit(1);
  }
  const text = fs.readFileSync(file, 'utf8');
  const rows = parseCsvLines(text);
  console.log('--- First 10 rows ---');
  rows.slice(0, 10).forEach((r, i) => console.log(String(i + 1).padStart(2, ' '), r));
  const store = extractStoreNameFromCsv(text);
  console.log('--- Detected store_name ---');
  console.log(store || '(none)');
}

main();


