const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

async function main() {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const apiKeyMatch = envContent.match(/GEMINI_API_KEY=([^\n\r]+)/);
    const apiKey = apiKeyMatch[1].trim();
    const genAI = new GoogleGenerativeAI(apiKey);

    const modelId = 'gemini-pro-latest';
    console.log(`Testing model: ${modelId}`);
    
    try {
        const model = genAI.getGenerativeModel({ model: modelId });
        console.log('Model initialized. Sending prompt...');
        const result = await model.generateContent('Hello');
        console.log('Response received:', result.response.text());
    } catch (e) {
        console.error('Error occurred:');
        console.error(e);
    }
}

main();
