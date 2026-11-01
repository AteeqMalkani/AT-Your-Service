import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

async function main() {
    try {
        const envPath = path.join(process.cwd(), '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const apiKeyMatch = envContent.match(/GEMINI_API_KEY=([^\n\r]+)/);
        const apiKey = apiKeyMatch[1].trim();
        const client = new GoogleGenAI({ apiKey });

        const modelId = 'gemini-1.5-flash';
        console.log(`Testing model: ${modelId}...`);
        
        const response = await client.models.generateContent({
            model: modelId,
            contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
        });
        console.log('Response received:', response.text());
    } catch (e) {
        console.error('Error:', e);
    }
}

main();
