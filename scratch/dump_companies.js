import { COMPANIES } from '../src/data/newGradData.js';
import fs from 'fs';
import path from 'path';

const outputPath = 'D:\\Ottobon\\Jobs_backend\\Jobs_Backend\\scratch\\frontend_companies.json';
fs.writeFileSync(outputPath, JSON.stringify(COMPANIES, null, 2));
console.log('Successfully wrote to ' + outputPath);
