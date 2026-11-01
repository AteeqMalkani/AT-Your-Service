import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

async function main() {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const apiKeyMatch = envContent.match(/GEMINI_API_KEY=([^\n\r]+)/);
    const apiKey = apiKeyMatch[1].trim();
    const client = new GoogleGenAI({ apiKey });

    try {
        const res = await client.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: [{ role: 'user', parts: [{ text: 'Hi' }] }],
        });
        console.log('Success:', res.text());
    } catch (e) {
        console.log('Error:', e.message);
    }
}
main();
