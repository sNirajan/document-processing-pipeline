import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { extractText } from './extract-text.js';


const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env (auto-reads) (dotenv populated)

// takes the pdf's text, sends it to Claude, logs the raw reply, tries to parse it
// returns nothing as it is void function, just logs, async because the API call is awaited
async function rawExtract(documentText: string): Promise<void> {
    // One request to Claude, await pauses until the newtwork reply comes back
    const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        // system = role/instructions, seperate from the data
        system: 'You are an AI assistant giving out extracted texts from pdfs. Your job is to return text into JSON format with fields title, date, authors, summary.',
        messages: [
            // The conversation, one user turn carrying the document text
            { role: 'user', content: documentText }
        ]
    });

    // repsonse.content is an Array of blocks, not a string, grabs the first one
    const block = response.content[0];
    // could be undefined if the array were empty, so ? (optional)
    if (block?.type === 'text') {
        // logs the RAW string first, so evidence survives even if parse throws
        console.log(block.text);
        try {
            // the risky line, throws if the string isn't valid JSON
            JSON.parse(block.text);
            console.log("Passed");
        } catch (err) {

            console.log('Run failed because of ', err);
        }
    }

}

async function main() {
    // Get the text out of the digital PDF once, reuse it for all 5 runs
    const text = await extractText('data/digital-1.pdf');
    // Run the same extraction 5 times to observe how the output varies/fails
    for (let i = 0; i < 5; i++) {
        console.log(`--Run ${i + 1} ---`);
        await rawExtract(text);
    }

}

// .catch handles any error that escaped (like an API failure)
main().catch(console.error);
