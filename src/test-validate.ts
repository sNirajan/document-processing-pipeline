import { validateOutput } from './validate-output.js';

// Case 1: valid fenced JSON (should pass)
const case1 = `\`\`\`json
{ "title": "Test Paper", "date": "2026-01-01", "authors": ["Nira"], "summary": "A short summary that is long enough." }
\`\`\``;

// Case 2: broken JSON (should fail, must NOT throw)
const case2 = `{ "title": }`;

// Case 3: TODO: valid JSON but MISSING the summary field
const case3 = `{ "title": "Test Paper", "date": "2026-01-01", "authors": ["Nira"] }`;
// Case 4: TODO: valid JSON but authors is a STRING, not an array
const case4 = `{ "title": "Test Paper", "date": "2026-01-01", "authors": "Nira", "summary": "A short summary that is long enough." }`;

console.log('Case 1:', validateOutput(case1));
console.log('Case 2:', validateOutput(case2));
console.log('Case 3:', validateOutput(case3));
console.log('Case 4:', validateOutput(case4));
