const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function runTest(label, initialMessage, followUps = []) {
    console.log(`\n--- Testing: ${label} ---\nInitial: "${initialMessage}"`);
    try {
        // 1. Prepare
        const prepRes = await axios.post(`${BASE_URL}/ai-requests/prepare`, {
            message: initialMessage,
            language: 'en'
        });
        let currentDraft = prepRes.data.draft;
        let currentStatus = prepRes.data.status;
        let nextQuestion = prepRes.data.nextQuestion;
        
        console.log('Prepare Response:');
        console.log('  Title:', currentDraft.title);
        console.log('  Category:', currentDraft.category);
        console.log('  Status:', currentStatus);
        console.log('  Question:', nextQuestion);
        console.log('  Fields:', JSON.stringify(currentDraft.fields, null, 2));

        // 2. Continue (handle follow ups)
        for (let i = 0; i < followUps.length; i++) {
            const answer = followUps[i];
            console.log(`\nFollow-up ${i+1}: "${answer}"`);
            const contRes = await axios.post(`${BASE_URL}/ai-requests/continue`, {
                requestId: currentDraft.requestId,
                draft: currentDraft,
                message: answer
            });
            currentDraft = contRes.data.draft;
            currentStatus = contRes.data.status;
            nextQuestion = contRes.data.nextQuestion;
            console.log('Update Response:');
            console.log('  Status:', currentStatus);
            console.log('  Question:', nextQuestion);
            console.log('  Fields:', JSON.stringify(currentDraft.fields, null, 2));
        }

        // 3. Launch (only if ready)
        if (currentStatus === 'ready_for_review') {
            console.log('\nAttempting Launch...');
            const launchRes = await axios.post(`${BASE_URL}/ai-requests/launch`, {
                draft: currentDraft
            });
            console.log('Launch Response:', launchRes.data);
        } else {
            console.log('\nRequest not ready for launch yet.');
        }

    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

async function main() {
    const cases = [
        { label: 'English - Product', msg: 'I want milk', followUps: ['2 litres', 'DHA Phase 6, Karachi'] },
        { label: 'English - Service', msg: 'My AC is not cooling properly', followUps: ['It is making noise', 'Gulshan-e-Iqbal, Karachi', 'Tomorrow evening'] },
        { label: 'English - Assistance', msg: 'I need someone to help me move furniture', followUps: ['A large sofa and 2 tables', 'From Clifton to DHA', 'Next Monday'] },
        { label: 'Roman Urdu - Product', msg: 'Mujhe doodh chahiye', followUps: ['1 litre', 'North Nazimabad'] },
        { label: 'Roman Urdu - Service', msg: 'Mujhe mera AC repair karwana hai', followUps: ['Cooling nahi ho rahi', 'Model Town', 'Tonight'] },
    ];

    for (const c of cases) {
        await runTest(c.label, c.msg, c.followUps);
    }
}

main();
