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

        console.log('Fetching available models via @google/genai SDK...');
        const modelsResponse = await client.models.list();
        const models = modelsResponse.models || [];
        
        console.log(`Found ${models.length} total models.\n`);
        
        const candidates = [
            'gemini-2.5-flash',
            'gemini-3.5-flash-lite',
            'gemini-3.8-flash',
            'gemini-flash-latest'
        ];

        const availableCandidates = candidates.filter(id => 
            models.some(m => m.name === id || m.name === `models/${id}`)
        );

        console.log('Available candidates from requested list:', availableCandidates);

        for (const modelId of availableCandidates) {
            console.log(`\nTesting Model: ${modelId}...`);
            
            const testCases = [
                { type: 'Simple', prompt: 'Hello' },
                { type: 'JSON', prompt: 'Return JSON: {"name": "test"}' },
                { type: 'ATYS-Product', prompt: 'I want milk. Return JSON with title, category, fields, nextQuestion, status.' },
                { type: 'ATYS-Service', prompt: 'My AC is not working. Return JSON with title, category, fields, nextQuestion, status.' },
                { type: 'Urdu', prompt: 'Mujhe doodh chahiye. Return JSON with title, category, fields, nextQuestion, status.' },
            ];

            for (const test of testCases) {
                const start = Date.now();
                try {
                    const response = await client.models.generateContent({
                        model: modelId,
                        contents: [{ role: 'user', parts: [{ text: test.prompt }] }],
                        config: { responseMimeType: 'application/json' }
                    });
                    const text = response.text();
                    const duration = Date.now() - start;
                    
                    let success = true;
                    if (test.type !== 'Simple') {
                        try { JSON.parse(text); } catch (e) { success = false; }
                    }

                    console.log(`  [${success ? '✅' : '❌'}] ${test.type} (${duration}ms)`);
                } catch (e) {
                    console.log(`  [❌] ${test.type} - Error: ${e.message}`);
                }
            }
        }

    } catch (err) {
        console.error('Investigation failed:', err);
    }
}

main();
