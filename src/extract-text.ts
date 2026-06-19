import pdfParse from 'pdf-parse';
import fs from 'fs';

export async function extractText(filePath: string): Promise<string> {
    const buffer = fs.readFileSync(filePath);
    const result = await pdfParse(buffer);

    return result.text;
}


if (require.main === module) { // am I the file being run or am I being imported as a module?
    // data/digital-1.pdf
    const filePath = process.argv[2];
    if (!filePath) {
        console.error('Usage: npm run extract <file.pdf>');
        process.exit(1); // program dies
    }
    extractText(filePath).catch(console.error);
}

