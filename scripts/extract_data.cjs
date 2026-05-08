const fs = require('fs');
const path = require('path');

// Read the file content
const filePath = path.join(__dirname, '..', 'src', 'data', 'newGradData.js');
let content = fs.readFileSync(filePath, 'utf8');

// Remove 'export const COMPANIES =' and 'export const HIRING_TIMELINE =' to make it a script
content = content.replace(/export const COMPANIES =/g, 'const COMPANIES =');
content = content.replace(/export const HIRING_TIMELINE =/g, 'const HIRING_TIMELINE =');

// Append code to write to JSON
content = 'import fs from "fs";\n' + content;
content += '\nfs.writeFileSync("companies_data.json", JSON.stringify(COMPANIES, null, 2));';

fs.writeFileSync('temp_extract.js', content);
console.log('Temporary extraction script created.');
