const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function runFlow(label, initialMsg, answers) {
    console.log(`\n>>> Testing Flow: ${label}`);
    try {
        // 1. Prepare
        console.log('  Step 1: Prepare...');
        const prepRes = await axios.post(`${BASE_URL}/ai-requests/prepare`, {
            message: initialMsg,
            language: 'en'
        });
        let { requestId, draft, status, nextQuestion } = prepRes.data;
        console.log(`    - Title: ${draft.title} | Status: ${status}`);

        // 2. Continue (Iteratively)
        for (let i = 0; i < answers.length; i++) {
            console.log(`  Step 2.${i+1}: Continue with "${answers[i]}"...`);
            const contRes = await axios.post(`${BASE_URL}/ai-requests/continue`, {
                requestId,
                draft,
                message: answers[i]
            });
            draft = contRes.data.draft;
            status = contRes.data.status;
            nextQuestion = contRes.data.nextQuestion;
            console.log(`    - Updated Status: ${status}`);
        }

        // 3. Launch
        console.log('  Step 3: Launch...');
        const launchRes = await axios.post(`${BASE_URL}/ai-requests/launch`, {
            draft
        });
        console.log(`    - Result: ${launchRes.data.status} - ${launchRes.data.message}`);
        return true;
    } catch (err) {
        console.error(`    [❌] Failed: ${err.response?.data?.message || err.message}`);
        return false;
    }
}

async function main() {
    try {
        // Check Health
        const health = await axios.get(`${BASE_URL}/health`);
        console.log('Health Check:', health.data.status === 'ok' ? '✅ OK' : '❌ Fail');

        const results = [];
        results.push(await runFlow('Product Purchase', 'I want milk', ['2 litres', 'DHA Phase 6, Karachi']));
        results.push(await runFlow('Professional Service', 'My AC is not cooling', ['It is making a noise', 'Gulshan, Karachi', 'Tomorrow 10am']));
        results.push(await runFlow('Roman Urdu', 'Mujhe ghar shift karna hai', ['Sofa and Bed', 'From Clifton to DHA', 'Next Sunday']));

        const passed = results.filter(Boolean).length;
        console.log(`\n--- FINAL RESULT: ${passed}/${results.length} flows passed ---`);
        if (passed !== results.length) process.exit(1);
    } catch (err) {
        console.error('Acceptance Test Suite failed:', err.message);
        process.exit(1);
    }
}

main();
