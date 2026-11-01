const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        // Load API key from .env
        const envPath = path.join(process.cwd(), '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const apiKeyMatch = envContent.match(/GEMINI_API_KEY=([^\n\r]+)/);
        
        if (!apiKeyMatch) {
            console.error('GEMINI_API_KEY not found in .env');
            process.exit(1);
        }
        
        const apiKey = apiKeyMatch[1].trim();
        const genAI = new GoogleGenerativeAI(apiKey);

        // Note: The @google/generative-ai SDK does not have a built-in listModels method 
        // in the same way the REST API does. We can use the REST API directly via fetch.
        console.log('Fetching available models via REST API...');
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        
        if (!response.ok) {
            console.error('API Request failed:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Error details:', errorText);
            process.exit(1);
        }
        
        const data = await response.json();
        const models = data.models || [];
        
        console.log('\n--- Available Models ---');
        const suitableModels = models.filter(m => m.supportedGenerationMethods.includes('generateContent'));
        
        console.log(`Found ${models.length} total models. ${suitableModels.length} support generateContent.\n`);
        
        suitableModels.forEach(m => {
            console.log(`Model: ${m.name}`);
            console.log(`Display Name: ${m.displayName}`);
            console.log(`Description: ${m.description}\n`);
        });

        // Return a list of IDs for the next testing phase
        return suitableModels.map(m => m.name.replace('models/', ''));
    } catch (err) {
        console.error('Investigation failed:', err);
    }
}

main().then(ids => {
    if (ids) {
        console.log('--- Recommended IDs for testing ---');
        console.log(ids.join(', '));
    }
});
