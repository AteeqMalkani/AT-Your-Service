const axios = require('axios');

async function test() {
  const BASE_URL = 'http://localhost:3000';
  
  try {
    console.log('Testing /prepare...');
    const prepRes = await axios.post(`${BASE_URL}/ai-requests/prepare`, {
      message: 'I want milk',
      language: 'en'
    });
    console.log('Prepare Response:', JSON.stringify(prepRes.data, null, 2));
    
    const { requestId, draft } = prepRes.data;
    
    console.log('\nTesting /continue...');
    const contRes = await axios.post(`${BASE_URL}/ai-requests/continue`, {
      requestId,
      draft,
      message: 'I need 2 litres'
    });
    console.log('Continue Response:', JSON.stringify(contRes.data, null, 2));
    
    const updatedDraft = contRes.data.draft;
    
    // If still needs clarification, continue again
    if (contRes.data.status === 'needs_clarification') {
        console.log('\nTesting /continue (final)...');
        const finalRes = await axios.post(`${BASE_URL}/ai-requests/continue`, {
            requestId,
            draft: updatedDraft,
            message: 'Deliver to DHA Phase 6, Karachi'
        });
        console.log('Final Response:', JSON.stringify(finalRes.data, null, 2));
        
        console.log('\nTesting /launch...');
        const launchRes = await axios.post(`${BASE_URL}/ai-requests/launch`, {
            draft: finalRes.data.draft
        });
        console.log('Launch Response:', JSON.stringify(launchRes.data, null, 2));
    }
  } catch (err) {
    console.error('Error during test:', err.response?.data || err.message);
  }
}

test();
