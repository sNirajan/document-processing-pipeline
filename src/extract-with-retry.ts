import Anthropic from "@anthropic-ai/sdk";
import { validateOutput } from "./validate-output.js";
import { type Document } from "./schemas.js";

const client = new Anthropic();

const SYSTEM_PROMPT = `You extract structured metadata from document text.

Return ONLY a JSON object with exactly these four fields:
- "title": string - the document's title
- "date": string or null - publication date as ISO format (YYYY-MM-DD), or null if none is present
- "authors": array of strings - author names; use an empty array if none
- "summary": string - a one-to-two sentence summary, at least 10 characters

Rules:
- Output raw JSON only. No markdown code fences, no backticks, no "Here is the JSON" preamble, no explanation.
- Use exactly the four field names above, lowercase, no extras.
- If a value is missing, use null (for date) or an empty array (for authors) - never omit a key.`;

export async function extractWithRetry(
  text: string,
  maxRetries = 3,
): Promise<Document | null> {
  // messages accumulates the conversation across attempts.
  // What type is this array? What's the SDK's message param type?
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: `Extract the following document into JSON.\n\n${text}` }, // GAP A: initial prompt
  ];

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages, // sends the growing messages
    });

    const block = response.content[0];
    if(block?.type !== 'text'){
        console.error(`Attempt ${attempt}: non-text block`);
        continue;
    }

    const raw = block.text;
    const result = validateOutput(raw);

    if (result.success) {
      return result.data;
    }

    console.error(`Attempt: ${attempt} failed:`, result.error);

    messages.push({ role: "assistant", content: raw });

    messages.push({ role: 'user', content: `That output was invalid. Error: ${result.error}. Return valid JSON only, no markdown, no explanation.`} );
  }
  return null;
}


// --- runner: only runs when this file is executed directly ---
import { readFileSync } from "node:fs";
import pdfParse from "pdf-parse";

async function main() {
  // 1. get the PDF path from the command line
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: npx tsx src/extract-with-retry.ts <file.pdf>");
    process.exit(1);
  }

  // 2. GAP A: read the PDF and get its text.
  //    You did exactly this on Day 1 — buffer → pdfParse → .text
  const buffer = readFileSync(filePath);
  const parsed = await pdfParse(buffer);
  const text = parsed.text;

  // 3. call your function
  const result = await extractWithRetry(text);

  // 4. show what came back — note it's Document | null
  if (result === null) {
    console.error("Extraction failed after all retries.");
  } else {
    console.log("Success:", result);
  }
}

main().catch(console.error);
