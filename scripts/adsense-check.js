const fs = require('fs');
const path = require('path');

const results = { files: 0, warnings: [], errors: [] };

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) { walk(fp); return; }
    if (!f.endsWith('.html')) return;
    results.files++;
    const content = fs.readFileSync(fp, 'utf8');
    const rel = fp.replace(/^.*?dist[\\/]/, '');

    // 1. Check for hidden text (display:none with keyword stuffing)
    const displayNoneMatches = content.match(/display\s*:\s*none/gi) || [];
    if (displayNoneMatches.length > 5) {
      results.warnings.push(rel + ': display:none used ' + displayNoneMatches.length + ' times');
    }

    // 2. Check for excessive internal links
    const internalLinks = (content.match(/href\s*=\s*"[^"]*\.html/g) || []).length;
    if (internalLinks > 150) {
      results.warnings.push(rel + ': ' + internalLinks + ' internal links (over-optimization risk)');
    }

    // 3. Check for duplicate/short title
    const titleMatch = content.match(/<title>([^<]*)<\/title>/);
    if (titleMatch) {
      if (titleMatch[1].length < 10) {
        results.errors.push(rel + ': Title too short ("' + titleMatch[1] + '")');
      }
      // Check for duplicate titles across pages
    }

    // 4. Check for missing/empty meta description
    const descMatch = content.match(/<meta name="description" content="([^"]*)"/);
    if (!descMatch || descMatch[1].length < 20) {
      results.warnings.push(rel + ': Meta description too short or missing');
    }

    // 5. Check for cloaking (serving different content to bots)
    if (content.includes('navigator.userAgent') && content.includes('googlebot')) {
      results.errors.push(rel + ': Possible cloaking detected');
    }

    // 6. Check for keyword stuffing (same word repeated excessively)
    const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/);
    if (bodyMatch) {
      const bodyText = bodyMatch[1].replace(/<[^>]+>/g, ' ').toLowerCase();
      const words = bodyText.split(/\s+/).filter(w => w.length > 3);
      const freq = {};
      words.forEach(w => freq[w] = (freq[w] || 0) + 1);
      const maxFreq = Math.max(...Object.values(freq));
      if (maxFreq > 30) {
        results.warnings.push(rel + ': Possible keyword stuffing (max word freq: ' + maxFreq + ')');
      }
    }
  });
}

walk('dist');

console.log('=== AdSense Risk Check Results ===');
console.log('Files checked: ' + results.files);
console.log('');
console.log('ERRORS (must fix): ' + results.errors.length);
results.errors.forEach(e => console.log('  ERROR: ' + e));
console.log('');
console.log('WARNINGS (should fix): ' + results.warnings.length);
results.warnings.slice(0, 15).forEach(w => console.log('  WARN: ' + w));
if (results.warnings.length > 15) {
  console.log('  ... and ' + (results.warnings.length - 15) + ' more warnings');
}
console.log('');
console.log('=== Overall Assessment ===');
if (results.errors.length === 0 && results.warnings.length === 0) {
  console.log('CLEAN - No AdSense policy violations detected. Safe to apply.');
} else if (results.errors.length === 0) {
  console.log('LOW RISK - ' + results.warnings.length + ' warnings, no errors. Safe to apply.');
} else {
  console.log('HIGH RISK - ' + results.errors.length + ' errors found. Fix before applying for AdSense.');
}
