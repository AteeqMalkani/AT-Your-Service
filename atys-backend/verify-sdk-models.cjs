const genai = require('@google/genai');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        const envPath = path.join(process.cwd(), '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const apiKeyMatch = envContent.match(/GEMINI_API_KEY=([^\n\r]+)/);
        const apiKey = apiKeyMatch[1].trim();

        // Try both possible ways to create the client
        let client;
        try {
            client = genai.createClient({ apiKey });
        } catch (e) {
            try {
                client = new genai.GoogleGenAI({ apiKey });
            } catch (e2) {
                console.error('Could not initialize client with either method.');
                process.exit(1);
            }
        }

        console.log('Fetching available models...');
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

        console.log('Available candidates:', availableCandidates);

        for (const modelId of availableCandidates) {
            console.log(`\nTesting ${modelId}...`);
            try {
                const response = await client.models.generateContent({
                    model: modelId,
                    contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
                });
                console.log('Response:', response.text());
            } catch (e) {
                console.error('Error:', e.message);
            }
        }

    } catch (err) {
        console.error('Investigation failed:', err);
    }
}

main();
