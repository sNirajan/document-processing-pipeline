// extract-text.ts = the reader
// it's one job: take a pdf and hand back its words as plain text

import pdfParse from 'pdf-parse';
import fs from 'fs';
import { fileURLToPath } from 'url'; // converts a file:// URL into a plain filesystem path

export async function extractText(filePath: string): Promise<string> {
    // reads the whole file off disk as raw bytes (a Buffer)
    const buffer = fs.readFileSync(filePath);
    const result = await pdfParse(buffer);

    // returns just the extracted text
    return result.text;
}

// import.metal.url = location of this file
const currentFile = fileURLToPath(import.meta.url);


if (currentFile === process.argv[1]) { 
    const filePath = process.argv[2];
    if (!filePath) {
        console.error('Usage: npm run extract <file.pdf>');
        process.exit(1); // program dies
    }
    extractText(filePath).catch(console.error);
}

