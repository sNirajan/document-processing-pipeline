import { DocumentSchema, type Document } from "./schemas.js";

type ValidationResult =
    | { success: true; data: Document }
    | { success: false; error: string };

export function validateOutput(raw: string): ValidationResult {
    const cleaned = raw
        .trim() // whitespaces off both ends
        .replace(/^```(?:json)?\s*/, "")    // remove leading ``` or ``` json +  any space
        .replace(/\s*```$/, "");            // remove trailing ```

    let parsed;
    try {
        parsed = JSON.parse(cleaned);
    } catch (err) {
        return { success: false, error: "Failed to parse" };
    }

    const result = DocumentSchema.safeParse(parsed);

    if (result.success) {
        return { success: true, data: result.data };
    } else return { success: false, error: result.error.message };


}
