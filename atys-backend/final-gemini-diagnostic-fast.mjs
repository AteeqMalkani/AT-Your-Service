import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

async function main() {
    try {
        const envPath = path.join(process.cwd(), '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const apiKeyMatch = envContent.match(/GEMINI_API_KEY=([^\n\r]+)/);
        const apiKey = apiKeyMatch[1].trim();

        console.log('--- Phase 1: REST vs SDK Discrepancy ---');
        try {
            const restResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            const restData = await restResponse.json();
            console.log(`Raw REST API found ${restData.models ? restData.models.length : 0} models.`);
        } catch (e) { console.error('REST failed:', e.message); }

        const client = new GoogleGenAI({ apiKey });
        try {
            const sdkResponse = await client.models.list();
            console.log(`Official SDK found ${sdkResponse.models ? sdkResponse.models.length : 0} models.`);
        } catch (e) { console.error('SDK list failed:', e.message); }

        console.log('\n--- Phase 2: Model Testing ---');
        const modelsToTest = ['gemini-3.8-flash', 'gemini-3.5-flash-lite'];
        
        for (const modelId of modelsToTest) {
            console.log(`\nTesting Model: ${modelId}`);
            try {
                const textRes = await client.models.generateContent({
                    model: modelId,
                    contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
                });
                console.log('  [✅] Simple Text: OK');
                
                const jsonRes = await client.models.generateContent({
                    model: modelId,
                    contents: [{ role: 'user', parts: [{ text: 'Return JSON: {"status": "ok"}' }] }],
                    config: { responseMimeType: 'application/json' }
                });
                console.log('  [✅] JSON Generation: OK');
            } catch (e) {
                if (e.message && e.message.includes('404')) console.log('  [❌] Error: 404 Not Found');
                else if (e.message && e.message.includes('429')) console.log('  [❌] Error: 429 Quota Exceeded');
                else if (e.message && e.message.includes('503')) console.log('  [❌] Error: 503 Service Unavailable');
                else console.log('  [❌] Error:', e.message);
            }
        }
    } catch (err) {
        console.error('Diagnostic failed:', err);
    }
}

main();
