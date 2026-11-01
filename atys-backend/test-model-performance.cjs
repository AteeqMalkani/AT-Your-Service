const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

async function main() {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const apiKeyMatch = envContent.match(/GEMINI_API_KEY=([^\n\r]+)/);
    const apiKey = apiKeyMatch[1].trim();
    const genAI = new GoogleGenerativeAI(apiKey);

    const modelsToTest = [
        'gemini-2.5-pro',
        'gemini-2.5-flash',
        'gemini-3.8-flash',
        'gemini-pro-latest'
    ];

    const testCases = [
        { type: 'Simple', prompt: 'Hello! Who are you?' },
        { type: 'JSON', prompt: 'Return a JSON object with keys "name" and "age" for a fictional person.' },
        { type: 'ATYS - Product', prompt: 'I want milk. Extract as JSON with title, category, fields(id, label, value, required, status), nextQuestion, status.' },
        { type: 'ATYS - Incomplete', prompt: 'My AC is not working. Extract as JSON with title, category, fields, nextQuestion, status.' },
        { type: 'ATYS - Roman Urdu', prompt: 'Mujhe doodh chahiye. Extract as JSON with title, category, fields, nextQuestion, status.' },
    ];

    const results = {};

    for (const modelId of modelsToTest) {
        console.log(`\nTesting Model: ${modelId}...`);
        results[modelId] = { passed: 0, total: testCases.length, details: [] };
        
        try {
            const model = genAI.getGenerativeModel({ 
                model: modelId,
                generationConfig: { responseMimeType: 'application/json' }
            });

            for (const test of testCases) {
                const start = Date.now();
                try {
                    const result = await model.generateContent(test.prompt);
                    const responseText = result.response.text();
                    const duration = Date.now() - start;
                    
                    let success = true;
                    if (test.type.includes('JSON') || test.type.includes('ATYS')) {
                        try {
                            JSON.parse(responseText);
                        } catch (e) {
                            success = false;
                        }
                    }

                    results[modelId].passed++;
                    results[modelId].details.push({ type: test.type, success, duration, response: responseText.substring(0, 100) + '...' });
                } catch (e) {
                    results[modelId].details.push({ type: test.type, success: false, duration: 0, response: e.message });
                }
            }
        } catch (e) {
            console.error(`Model ${modelId} failed to initialize: ${e.message}`);
            results[modelId].passed = 0;
            results[modelId].details.push({ type: 'INIT', success: false, duration: 0, response: e.message });
        }
    }

    console.log('\n--- FINAL COMPARISON ---');
    console.table(Object.keys(results).map(id => ({
        Model: id,
        PassRate: `${results[id].passed}/${results[id].total}`,
        AvgTime: Math.round(results[id].details.reduce((acc, d) => acc + d.duration, 0) / results[id].total) + 'ms'
    })));
}

main();
