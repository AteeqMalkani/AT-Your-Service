import fs from 'fs';
import path from 'path';

async function main() {
    try {
        const envPath = path.join(process.cwd(), '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const apiKeyMatch = envContent.match(/GROQ_API_KEY=([^\n\r]+)/);
        if (!apiKeyMatch) {
            console.error('GROQ_API_KEY not found in .env');
            process.exit(1);
        }
        const apiKey = apiKeyMatch[1].trim();

        const response = await fetch('https://api.groq.com/openai/v1/models', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        const data = await response.json();
        
        if (data.error) {
            console.error('API Error:', data.error);
            process.exit(1);
        }

        console.log('Available Groq Models:');
        data.data.forEach(m => console.log(`- ${m.id}`));
    } catch (err) {
        console.error('Investigation failed:', err);
    }
}
main();
