import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';

const RequestFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string().nullable(),
  required: z.boolean(),
  status: z.enum(['complete', 'missing']),
});

const AIResponseSchema = z.object({
  title: z.string(),
  category: z.string(),
  fields: z.array(RequestFieldSchema),
  nextQuestion: z.string().nullable(),
  status: z.enum(['needs_clarification', 'ready_for_review']),
});

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
        const groq = new Groq({ apiKey });

        const promptPath = path.join(process.cwd(), 'src/ai-requests/prompts/system.prompt.ts');
        const systemPromptContent = fs.readFileSync(promptPath, 'utf8');
        const promptMatch = systemPromptContent.match(/SYSTEM_PROMPT = `([\s\S]*?)`/);
        const SYSTEM_PROMPT = promptMatch ? promptMatch[1] : 'You are a request agent.';

        const model = 'qwen/qwen3.8-27b';
        const testCases = [
            { id: 1, msg: 'I want milk' },
            { id: 2, msg: "My AC isn't cooling" },
            { id: 3, msg: 'Mujhe ghar shift karne mein help chahiye' },
            { id: 4, msg: 'I need someone to buy two large colas' },
            { id: 5, msg: 'Kal tak mera assignment complete karna hai' },
        ];

        console.log(`\n--- Testing Model: ${model} ---`);
        for (const test of testCases) {
            const start = Date.now();
            try {
                const response = await groq.chat.completions.create({
                    model: model,
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        { role: 'user', content: test.msg }
                    ],
                    response_format: { type: 'json_object' },
                });

                const content = response.choices[0].message.content;
                const parsed = JSON.parse(content);
                const validated = AIResponseSchema.safeParse(parsed);
                const duration = Date.now() - start;

                if (validated.success) {
                    console.log(`  [✅] Case ${test.id}: Valid JSON (${duration}ms) - ${parsed.title}`);
                } else {
                    console.log(`  [❌] Case ${test.id}: Schema Mismatch`);
                    console.log('      Errors:', JSON.stringify(validated.error.format(), null, 2));
                }
            } catch (e) {
                console.log(`  [❌] Case ${test.id}: API Error - ${e.message}`);
            }
        }
    } catch (err) {
        console.error('Test failed:', err);
    }
}

main();
