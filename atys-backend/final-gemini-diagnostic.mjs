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
        
        // 1. Raw REST call
        try {
            const restResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            const restData = await restResponse.json();
            const restCount = restData.models ? restData.models.length : 0;
            console.log(`Raw REST API found ${restCount} models.`);
        } catch (e) {
            console.error('Raw REST failed:', e.message);
        }

        // 2. SDK call
        const client = new GoogleGenAI({ apiKey });
        try {
            const sdkResponse = await client.models.list();
            // The SDK might return a Pager or a simple array
            const sdkCount = sdkResponse.models ? sdkResponse.models.length : 0;
            console.log(`Official SDK found ${sdkCount} models.`);
        } catch (e) {
            console.error('Official SDK list failed:', e.message);
        }

        console.log('\n--- Phase 2: Model Testing ---');
        const modelsToTest = ['gemini-3.8-flash', 'gemini-3.5-flash-lite'];
        
        for (const modelId of modelsToTest) {
            console.log(`\nTesting Model: ${modelId}`);
            
            // Test 1: Simple Text
            try {
                const textRes = await client.models.generateContent({
                    model: modelId,
                    contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
                });
                console.log('  [✅] Simple Text: OK');
            } catch (e) {
                handleError(modelId, 'Simple Text', e);
            }

            // Test 2: JSON
            try {
                const jsonRes = await client.models.generateContent({
                    model: modelId,
                    contents: [{ role: 'user', parts: [{ text: 'Return JSON: {"status": "ok"}' }] }],
                    config: { responseMimeType: 'application/json' }
                });
                console.log('  [✅] JSON Generation: OK');
            } catch (e) {
                handleError(modelId, 'JSON Generation', e);
            }
        }

    } catch (err) {
        console.error('Diagnostic failed:', err);
    }
}

function handleError(model, test, error) {
    const msg = error.message || 'Unknown Error';
    if (msg.includes('404')) {
        console.log(`  [❌] ${test}: 404 Not Found`);
    } else if (msg.includes('429')) {
        console.log(`  [❌] ${test}: 429 Quota Exceeded`);
        console.log('      Details:', error.response?.data || error);
    } else if (msg.includes('503')) {
        console.log(`  [❌] ${test}: 503 Service Unavailable`);
    } else {
        console.log(`  [❌] ${test}: Error - ${msg}`);
    }
}

main();
